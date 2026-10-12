// utils/storage.ts
import type { GameState, Metrics, PublishedNewsLogItem } from "../types";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";
import { getNewsById } from "../data/news";
import { getTierMultiplier } from "./game";
import { INITIAL_MONEY, INITIAL_READERS } from "../constants/economy";

export const STORAGE_KEY = "the_fifth_estate_save";
export const START_GAME_TIME = Date.UTC(1600, 0, 30, 9);
const START_WORKING_SECOND = 9 * 60 * 60;
const END_WORKING_SECOND = 18 * 60 * 60;
const ZERO_METRICS: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  readership: 0,
};

const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  reputation: 50,
  readership: 50,
  readers: INITIAL_READERS,
  money: INITIAL_MONEY,
  economyVersion: 1,
  turn: 1,
  maxTurns: 20,
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
  const secondsAfterMidnight =
    START_WORKING_SECOND +
    Math.floor(Math.random() * (END_WORKING_SECOND - START_WORKING_SECOND + 1));

  return {
    ...INITIAL_STATE,
    gameTime:
      START_GAME_TIME +
      (secondsAfterMidnight - START_WORKING_SECOND) * 1000,
    gameTimeUpdatedAt: Date.now(),
  };
}

export function createInitialState(): GameState {
  const saved = loadState();
  if (saved) return saved;
  const init = getInitialState();
  init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
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
      if (state.economyVersion !== 1) {
        state.readers = INITIAL_READERS;
        state.money = INITIAL_MONEY;
        state.economyVersion = 1;
      }
      state.readers ??= INITIAL_READERS;
      state.money ??= INITIAL_MONEY;
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
