// utils/storage.ts
// Функции для сохранения и загрузки состояния игры в localStorage
import type { GameState, Metrics, PublishedNewsLogItem } from "../types";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";
import { getNewsById } from "../data/news";
import { getTierMultiplier } from "./game";
import {
  createInitialGameTime,
  ECONOMY_SAVE_VERSION,
  GAME_BALANCE,
  INITIAL_METRICS,
  INITIAL_MONEY,
  INITIAL_READERS,
  ZERO_METRICS,
} from "../constants/global";

export const STORAGE_KEY = "the_fifth_estate_save";
export const START_GAME_TIME = Date.UTC(
  GAME_BALANCE.gameStart.year,
  GAME_BALANCE.gameStart.month,
  GAME_BALANCE.gameStart.day,
  GAME_BALANCE.gameStart.firstWorkingHour,
);

// Базовое начальное состояние игры без учёта игрового времени
const INITIAL_STATE: GameState = {
  ...INITIAL_METRICS,
  readers: INITIAL_READERS,
  money: INITIAL_MONEY,
  economyVersion: ECONOMY_SAVE_VERSION,
  turn: 1,
  maxTurns: GAME_BALANCE.maxTurns,
  gameTime: START_GAME_TIME,
  gameTimeUpdatedAt: Date.now(),
  placedNews: [],
  journalists: [],
  eventHistory: [],
  pendingEvent: undefined,
  usedNewsIds: [],
  currentNewsIds: [],
  currentCategories: [],
  publicationHistory: [],
};

// Возвращает начальное состояние со свежим игровым временем
export function getInitialState(): GameState {
  return {
    ...INITIAL_STATE,
    gameTime: createInitialGameTime(),
    gameTimeUpdatedAt: Date.now(),
  };
}

// Создаёт начальное состояние: либо загружает сохранение, либо создаёт новое с начальными журналистами
export function createInitialState(): GameState {
  const saved = loadState();
  if (saved) return saved;
  const init = getInitialState();
  init.journalists = AVAILABLE_JOURNALISTS.slice(
    0,
    Math.min(GAME_BALANCE.initialJournalists, GAME_BALANCE.maximumJournalists),
  );
  return init;
}

// Сохраняет состояние игры в localStorage
export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Ошибка сохранения:", e);
  }
}

// Загружает состояние игры из localStorage
// Выполняет миграцию данных при изменении версии экономики и восстанавливает структуру истории публикаций
export function loadState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as GameState;
      // Миграция при изменении версии экономики
      if (state.economyVersion !== ECONOMY_SAVE_VERSION) {
        state.readers = INITIAL_READERS;
        state.money = INITIAL_MONEY;
        state.economyVersion = ECONOMY_SAVE_VERSION;
      }
      // Восстановление значений по умолчанию для новых полей
      state.readers ??= INITIAL_READERS;
      state.money ??= INITIAL_MONEY;
      state.maxTurns = GAME_BALANCE.maxTurns;
      state.eventHistory ??= [];
      state.gameTime ??= START_GAME_TIME;
      state.gameTimeUpdatedAt ??= Date.now();
      // Миграция истории публикаций: восстановление base/bonus/multiplier из старого формата
      state.publicationHistory = (state.publicationHistory ?? []).map(
        (publication) => ({
          ...publication,
          news: (
            publication.news as Array<
              PublishedNewsLogItem & { metrics?: Metrics }
            >
          ).map((savedNews) => {
            if (
              savedNews.base &&
              savedNews.bonus &&
              savedNews.final &&
              typeof savedNews.multiplier === "number"
            ) {
              return savedNews;
            }

            const final = savedNews.metrics ?? ZERO_METRICS;
            const multiplier = getTierMultiplier(savedNews.tier);
            const base = getNewsById(savedNews.newsId)?.effects ?? final;
            const bonus = (Object.keys(final) as (keyof Metrics)[]).reduce(
              (result, key) => {
                result[key] = final[key] / multiplier - base[key];
                return result;
              },
              { ...ZERO_METRICS },
            );

            return {
              ...savedNews,
              base,
              bonus,
              multiplier,
              final,
            };
          }),
        }),
      );
      // Обновление данных журналистов из актуального списка (для изменений в бонусах и т.д.)
      state.journalists = state.journalists.map((savedJournalist) => {
        const journalist = AVAILABLE_JOURNALISTS.find(
          (available) => available.id === savedJournalist.id,
        );

        return journalist
          ? { ...journalist, newsId: savedJournalist.newsId }
          : savedJournalist;
      });
      return state;
    }
  } catch (e) {
    console.error("Ошибка загрузки:", e);
  }
  return null;
}

// Удаляет сохранение из localStorage
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Ошибка удаления сохранения:", e);
  }
}

// Проверяет наличие сохранения
export function hasSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
