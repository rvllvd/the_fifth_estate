import {
  clearState,
  createInitialState,
  getInitialState,
  saveState,
} from "../utils/storage";
import { create } from "zustand";
import type { GameState, Journalist, Metrics, NewsItem, Stats } from "../types";
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

  isGameOver: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  updateView: () => {
    const { journalists, placedNews } = get();

    journalists.map((j) => (j.newsId = undefined));
    // news.map((j) => (j.newsId = undefined));
    placedNews.forEach(({ newsId }) => {
      const news = NEWS_DATA.find((n) => n.id == newsId);

      const journalist = journalists.find((j) => j.spec == news?.category);
      if (journalist) journalist.newsId = newsId;
      if (news) news.journalistId = news.id;
    });
  },

  // ── новости ──
  rollCurrentNews: () => {
    const { currentNewsIds, usedNewsIds, journalists } = get();
    if (currentNewsIds.length > 0) return;

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
    const freeJournalist = journalists.find(
      (j) => j.spec == news.category && !j.newsId,
    );
    if (isSlotTaken(placedNews, key, news.id) || !freeJournalist) return false;

    freeJournalist.newsId = news.id;
    const news_source = NEWS_DATA.find((n) => n.id == news.id);
    if (news_source) news_source.journalistId = freeJournalist.id;

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
    const { updateView } = get();

    set((prev) => ({
      placedNews: prev.placedNews.filter((p) => p.newsId !== newsId),
    }));
    updateView();
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
    state.clearNewspaper();
    return calculatePublicationResult(state.placedNews, state.journalists);
  },

  applyResult: (result) => {
    const state = get();
    set(applyPublication(state, result));
  },

  newGame: () => {
    const { clearNewspaper } = get();
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(0, 3);
    set(init);
    clearNewspaper();
  },

  reset: () => set(getInitialState),

  isGameOver: () => {
    const { influence, credibility, reputation, readership } = get();
    let res = false;
    [influence, credibility, reputation, readership].forEach((v) => {
      if (v <= 0) return (res = true);
    });

    return res;
  },
}));

// ─── автосохранение ──────────────────────────────────────────────
useGameStore.subscribe((state) => saveState(state));

// ─── селекторы ───────────────────────────────────────────────────
export const selectPlacedNews = (s: GameStore) => s.placedNews;
export const selectIsVictory = (s: GameStore) => isVictory(s);
export const selectIsGameOver = (s: GameStore) => isGameOver(s);
export const selectCanPublish = (s: GameStore) => canPublish(s);
