// utils/storage.ts
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
  usedNewsIds: [],
  currentNewsIds: [],
  currentCategories: [],
  publicationHistory: [],
};

export function getInitialState(): GameState {
  return {
    ...INITIAL_STATE,
    gameTime: createInitialGameTime(),
    gameTimeUpdatedAt: Date.now(),
  };
}

export function createInitialState(): GameState {
  const saved = loadState();
  if (saved) return saved;
  const init = getInitialState();
  init.journalists = AVAILABLE_JOURNALISTS.slice(
    0,
    GAME_BALANCE.initialJournalists,
  );
  return init;
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Ошибка сохранения:", e);
  }
}

export function loadState(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as GameState;
      if (state.economyVersion !== ECONOMY_SAVE_VERSION) {
        state.readers = INITIAL_READERS;
        state.money = INITIAL_MONEY;
        state.economyVersion = ECONOMY_SAVE_VERSION;
      }
      state.readers ??= INITIAL_READERS;
      state.money ??= INITIAL_MONEY;
      state.maxTurns = GAME_BALANCE.maxTurns;
      state.gameTime ??= START_GAME_TIME;
      state.gameTimeUpdatedAt ??= Date.now();
      state.publicationHistory = (state.publicationHistory ?? []).map(
        (publication) => ({
          ...publication,
          news: (publication.news as Array<
            PublishedNewsLogItem & { metrics?: Metrics }
          >).map((savedNews) => {
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

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Ошибка удаления сохранения:", e);
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
