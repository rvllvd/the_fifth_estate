import { create } from "zustand";
import type {
  GameState,
  Journalist,
  Metrics,
  NewsItem,
  PlacedNews,
} from "../types";
import { ALL_SLOTS } from "../constants/game";
import { getRandomNews } from "../data/news";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";
import {
  applyPublication,
  calculatePublicationResult,
  canPublish,
  isGameOver,
  isVictory,
} from "../utils/game_logic";

const STORAGE_KEY = "the_fifth_estate_save";

export const Parameters = {
  countNews: 6,
};

// ─── чистая функция ──────────────────────────────────────────────
function isSlotTaken(
  placedNews: PlacedNews[],
  slotKey: string,
  excludeNewsId?: string,
): boolean {
  const [tierStr, slotStr] = slotKey.split("-");
  const tier = Number(tierStr);
  const slot = Number(slotStr);
  return placedNews.some(
    (p) => p.tier === tier && p.slot === slot && p.newsId !== excludeNewsId,
  );
}

// ─── сохранение / загрузка ───────────────────────────────────────
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
    if (saved) return JSON.parse(saved) as GameState;
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

// ─── начальное состояние ─────────────────────────────────────────
const INITIAL_STATE: GameState = {
  influence: 50,
  credibility: 50,
  reputation: 50,
  readership: 50,
  readers: 0,
  money: 0,
  turn: 1,
  maxTurns: 20,
  placedNews: [],
  journalists: [],
  usedNewsIds: [],
  currentNewsIds: [],
  currentCategories: [],
};

export function getInitialState(): GameState {
  return { ...INITIAL_STATE };
}

function createInitialState(): GameState {
  const saved = loadState();
  if (saved) return saved;

  const init = getInitialState();
  init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
  return init;
}

// ─── стор ────────────────────────────────────────────────────────
interface GameStore extends GameState {
  // новости
  rollCurrentNews: () => void;

  // размещение
  dropNews: (key: string, news: NewsItem) => boolean;
  clickNews: (news: NewsItem) => void;
  removePlaced: (newsId: string) => void;
  clearNewspaper: () => void;

  // журналисты
  hireJournalist: (j: Journalist) => void;
  fireJournalist: (id: string) => void;

  // игровой цикл
  publish: () => Metrics | null; // возвращает результат для модалки
  applyResult: (result: Metrics) => void;
  newGame: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  // ── новости ──
  rollCurrentNews: () => {
    const { currentNewsIds, usedNewsIds } = get();
    if (currentNewsIds.length > 0) return;

    const randomNews = getRandomNews(10, usedNewsIds);
    if (randomNews.length === 0) return;

    set({
      currentNewsIds: randomNews.map((n) => n.id),
      currentCategories: [...new Set(randomNews.map((n) => n.category))],
    });
  },

  // ── размещение ──
  dropNews: (key, news) => {
    const { placedNews } = get();
    if (isSlotTaken(placedNews, key, news.id)) return false;

    const [tier, slot] = key.split("-").map(Number);
    set({
      placedNews: [
        ...placedNews.filter((p) => p.newsId !== news.id),
        { newsId: news.id, tier, slot },
      ],
    });
    return true;
  },

  clickNews: (news) => {
    const { placedNews, dropNews } = get();
    if (placedNews.some((p) => p.newsId === news.id)) return;

    const free = ALL_SLOTS.find((s) => !isSlotTaken(placedNews, s, news.id));
    if (free) dropNews(free, news);
  },

  removePlaced: (newsId) =>
    set((prev) => ({
      placedNews: prev.placedNews.filter((p) => p.newsId !== newsId),
    })),

  clearNewspaper: () => set({ placedNews: [] }),

  // ── журналисты ──
  hireJournalist: (j) =>
    set((prev) => ({ journalists: [...prev.journalists, j] })),

  fireJournalist: (id) =>
    set((prev) => ({
      journalists: prev.journalists.filter((x) => x.id !== id),
    })),

  // ── игровой цикл ──
  publish: () => {
    const state = get();
    if (!canPublish(state)) return null;
    return calculatePublicationResult(state.placedNews, state.journalists);
  },

  applyResult: (result) => {
    const state = get();
    set(applyPublication(state, result));
  },

  newGame: () => {
    clearState();
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    set(init);
  },

  reset: () => set(INITIAL_STATE),
}));

// ─── автосохранение ──────────────────────────────────────────────
useGameStore.subscribe((state) => saveState(state));

// ─── селекторы ───────────────────────────────────────────────────
export const selectPlacedNews = (s: GameStore) => s.placedNews;
export const selectIsVictory = (s: GameStore) => isVictory(s);
export const selectIsGameOver = (s: GameStore) => isGameOver(s);
export const selectCanPublish = (s: GameStore) => canPublish(s);
