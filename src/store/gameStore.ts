import {
  clearState,
  createInitialState,
  getInitialState,
  saveState,
} from "../utils/storage";
import { create } from "zustand";
import type { GameState, Journalist, Metrics, NewsItem } from "../types";
import { ALL_SLOTS } from "../constants/game";
import { getRandomNews, NEWS_DATA } from "../data/news";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";
import {
  applyPublication,
  calculatePublicationResult,
  canPublish,
  isGameOver,
  isSlotTaken,
  isVictory,
} from "../utils/game";
import { playSound } from "../utils/sounds";

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
  updateView: () => void;

  // игровой цикл
  publish: () => Metrics | null; // возвращает результат для модалки
  applyResult: (result: Metrics) => void;
  newGame: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  updateView: () => {
    const { journalists, placedNews } = get();

    journalists.map((j) => (j.active = false));
    placedNews.forEach(({ newsId }) => {
      const news = NEWS_DATA.find((n) => n.id == newsId);

      const journalist = journalists.find((j) => j.spec == news?.category);
      if (journalist) journalist.active = true;
    });
  },

  // ── новости ──
  rollCurrentNews: () => {
    const { currentNewsIds, usedNewsIds, journalists } = get();
    if (currentNewsIds.length > 0) return;

    console.log(journalists);
    const randomNews = getRandomNews(30, usedNewsIds);
    if (randomNews.length === 0) return;

    set({
      currentNewsIds: randomNews.map((n) => n.id),
      currentCategories: [...new Set(randomNews.map((n) => n.category))],
    });
  },

  // ── размещение ──
  dropNews: (key, news) => {
    const { placedNews, journalists } = get();
    const freeJournalists = journalists.filter(
      (j) => j.spec == news.category && !j.active,
    );
    if (isSlotTaken(placedNews, key, news.id) || freeJournalists.length == 0)
      return false;

    freeJournalists[0].active = true;

    const [tier, slot] = key.split("-").map(Number);
    set({
      placedNews: [
        ...placedNews.filter((p) => p.newsId !== news.id),
        { newsId: news.id, tier, slot },
      ],
    });

    playSound("/assets/sounds/newspaper_folded_drop_on_floor_001.mp3", 1);
    return true;
  },

  clickNews: (news) => {
    const { placedNews, dropNews } = get();
    if (placedNews.some((p) => p.newsId === news.id)) return;

    const free = ALL_SLOTS.find((s) => !isSlotTaken(placedNews, s, news.id));
    if (free) dropNews(free, news);
  },

  removePlaced: (newsId) => {
    const { journalists } = get();

    const news = NEWS_DATA.find((n) => n.id == newsId);
    const journalist = journalists.find(
      (j) => j.spec == news?.category && j.active,
    );
    if (journalist) journalist.active = false;

    set((prev) => ({
      placedNews: prev.placedNews.filter((p) => p.newsId !== newsId),
    }));
  },

  clearNewspaper: () => {
    set({ placedNews: [] });
    const { updateView } = get();
    updateView();
  },

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
    clearState();
    set(applyPublication(state, result));
  },

  newGame: () => {
    clearState();
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    set(init);
  },

  reset: () => set(getInitialState),
}));

// ─── автосохранение ──────────────────────────────────────────────
useGameStore.subscribe((state) => saveState(state));

// ─── селекторы ───────────────────────────────────────────────────
export const selectPlacedNews = (s: GameStore) => s.placedNews;
export const selectIsVictory = (s: GameStore) => isVictory(s);
export const selectIsGameOver = (s: GameStore) => isGameOver(s);
export const selectCanPublish = (s: GameStore) => canPublish(s);
