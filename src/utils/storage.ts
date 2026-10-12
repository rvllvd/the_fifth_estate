// utils/storage.ts
import type { GameState } from "../types";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";

export const STORAGE_KEY = "the_fifth_estate_save";
export const START_GAME_TIME = Date.UTC(1600, 0, 30, 12, 46, 22, 0); // 30 января 1600 года

const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  reputation: 50,
  readership: 50,
  readers: 0,
  money: 0,
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
  return { ...INITIAL_STATE, gameTimeUpdatedAt: Date.now() };
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
      state.gameTime ??= START_GAME_TIME;
      state.gameTimeUpdatedAt ??= Date.now();
      state.publicationHistory ??= [];
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
