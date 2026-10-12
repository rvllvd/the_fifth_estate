// import { clearState, createInitialState, getInitialState, saveState } from "../utils/storage";
import {
  createInitialState,
  getInitialState,
  saveState,
} from "../utils/storage";
import { create } from "zustand";
// import type { GameState, Journalist, Metrics, NewsItem, Stats } from "../types";
import type {
  GameState,
  Journalist,
  Metrics,
  NewsItem,
  PublishedNewsLogItem,
} from "../types";
import { ALL_SLOTS } from "../constants/game";
import { getRandomNews, NEWS_DATA } from "../data/news";
import { AVAILABLE_JOURNALISTS } from "../data/journalists";
import {
  applyPublication,
  calculateNewsContributions,
  canPublish,
  isGameOver,
  isSlotTaken,
  isVictory,
} from "../utils/game";
import { playSound } from "../utils/sounds";
import { settleEconomy } from "../utils/economy";
import {
  GAME_BALANCE,
  getRandomPublicationTimeAdvance,
} from "../constants/global";

interface GameStore extends GameState {
  // новости
  rollCurrentNews: () => void;

  // размещение
  dropNews: (key: string, news: NewsItem, journalistId?: string) => boolean;
  clickNews: (news: NewsItem) => void;
  removePlaced: (newsId: string) => void;
  clearNewspaper: () => void;

  // журналисты
  hireJournalist: (j: Journalist) => boolean;
  fireJournalist: (id: string) => void;
  updateView: () => void;

  // игровой цикл
  publish: () => Metrics | null; // возвращает результат для модалки
  applyResult: (result: Metrics) => void;
  tickGameTime: () => void;
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
      if (news && journalist) news.journalistId = journalist.id;
    });
  },

  // ── новости ──
  rollCurrentNews: () => {
    const { currentNewsIds, usedNewsIds } = get();
    if (currentNewsIds.length > 0) return;

    const randomNews = getRandomNews(GAME_BALANCE.newsPerRoll, usedNewsIds);
    if (randomNews.length === 0) return;

    set({
      currentNewsIds: randomNews.map((n) => n.id),
      currentCategories: [...new Set(randomNews.map((n) => n.category))],
    });
  },

  // ── размещение ──
  dropNews: (key, news, journalistId) => {
    const { placedNews, journalists } = get();
    const freeJournalist = journalists.find(
      (j) =>
        j.spec == news.category &&
        !j.newsId &&
        (!journalistId || j.id === journalistId),
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
  hireJournalist: (j) => {
    const state = get();
    if (
      state.money < j.cost ||
      state.journalists.some((journalist) => journalist.id === j.id)
    ) {
      return false;
    }
    set((prev) => ({ journalists: [...prev.journalists, { ...j }] }));
    return true;
  },

  fireJournalist: (id) =>
    set((prev) => ({
      journalists: prev.journalists.filter((x) => x.id !== id),
    })),

  // ── игровой цикл ──
  publish: () => {
    const state = get();
    if (!canPublish(state)) return null;
    const now = Date.now();
    const publicationGameTime =
      state.gameTime + Math.max(0, now - state.gameTimeUpdatedAt);
    const publishedNews = state.placedNews.map((placed) => ({ ...placed }));
    const contributions = calculateNewsContributions(
      publishedNews,
      state.journalists,
      state,
    );
    const result = contributions.reduce(
      (total, contribution) => ({
        influence: total.influence + contribution.final.influence,
        credibility: total.credibility + contribution.final.credibility,
        reputation: total.reputation + contribution.final.reputation,
        loyalty: total.loyalty + contribution.final.loyalty,
      }),
      { influence: 0, credibility: 0, reputation: 0, loyalty: 0 },
    );
    const newsLog: PublishedNewsLogItem[] = contributions;
    const publicationHistory = [
      ...state.publicationHistory,
      {
        id: `${Date.now()}-${state.publicationHistory.length}`,
        turn: state.turn,
        publishedAt: now,
        gameTime: publicationGameTime,
        news: newsLog,
        result,
      },
    ];
    state.clearNewspaper();
    set({ publicationHistory });
    return result;
  },

  applyResult: (result) => {
    const state = get();
    const now = Date.now();
    const currentGameTime =
      state.gameTime + Math.max(0, now - state.gameTimeUpdatedAt);
    const publicationDuration = getRandomPublicationTimeAdvance();
    const updatedState = applyPublication(state, result);
    const economy = settleEconomy(state, result);
    set({
      ...updatedState,
      readers: economy.readers,
      money: economy.money,
      journalists: economy.journalists,
      gameTime: currentGameTime + publicationDuration,
      gameTimeUpdatedAt: now,
    });
  },

  tickGameTime: () => {
    const now = Date.now();
    set((state) => ({
      gameTime: state.gameTime + Math.max(0, now - state.gameTimeUpdatedAt),
      gameTimeUpdatedAt: now,
    }));
  },

  newGame: () => {
    const { clearNewspaper } = get();
    const init = getInitialState();
    init.journalists = AVAILABLE_JOURNALISTS.slice(
      0,
      GAME_BALANCE.initialJournalists,
    );
    set(init);
    clearNewspaper();
  },

  reset: () => set(getInitialState),

  isGameOver: () => {
    return isGameOver(get());
  },
}));

// ─── автосохранение ──────────────────────────────────────────────
useGameStore.subscribe((state) => saveState(state));

// ─── селекторы ───────────────────────────────────────────────────
export const selectPlacedNews = (s: GameStore) => s.placedNews;
export const selectIsVictory = (s: GameStore) => isVictory(s);
export const selectIsGameOver = (s: GameStore) => isGameOver(s);
export const selectCanPublish = (s: GameStore) => canPublish(s);
