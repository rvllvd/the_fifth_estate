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
  rollCurrentNews: (allowUsedNews?: boolean) => void;

  // размещение
  dropNews: (
    key: string,
    news: NewsItem,
    journalistId?: string,
    allowUnstaffed?: boolean,
  ) => boolean;
  clickNews: (news: NewsItem) => void;
  removePlaced: (newsId: string) => void;
  clearNewspaper: () => void;
  discardCurrentNews: () => void;

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
    const assignments = new Map<string, string>();
    for (const { newsId } of placedNews) {
      const news = NEWS_DATA.find((item) => item.id === newsId);
      if (!news) continue;
      const journalist = journalists.find(
        (member) =>
          member.spec === news.category && !assignments.has(member.id),
      );
      if (journalist) assignments.set(journalist.id, newsId);
    }
    set({
      journalists: journalists.map((journalist) => ({
        ...journalist,
        newsId: assignments.get(journalist.id),
      })),
    });
  },

  // ── новости ──
  rollCurrentNews: (allowUsedNews = false) => {
    const { currentNewsIds, usedNewsIds } = get();
    if (currentNewsIds.length > 0) return;

    let randomNews = getRandomNews(GAME_BALANCE.newsPerRoll, usedNewsIds);
    if (randomNews.length === 0 && allowUsedNews) {
      randomNews = getRandomNews(GAME_BALANCE.newsPerRoll);
    }
    if (randomNews.length === 0) return;

    set({
      currentNewsIds: randomNews.map((n) => n.id),
      currentCategories: [...new Set(randomNews.map((n) => n.category))],
    });
  },

  // ── размещение ──
  dropNews: (key, news, journalistId, allowUnstaffed = false) => {
    const { placedNews, journalists } = get();
    const freeJournalist = journalists.find(
      (j) =>
        j.spec == news.category &&
        !j.newsId &&
        (!journalistId || j.id === journalistId),
    );
    if (
      isSlotTaken(placedNews, key, news.id) ||
      (!freeJournalist && !allowUnstaffed)
    ) {
      return false;
    }

    const [tier, slot] = key.split("-").map(Number);
    set({
      journalists: freeJournalist
        ? journalists.map((journalist) =>
            journalist.id === freeJournalist.id
              ? { ...journalist, newsId: news.id }
              : journalist,
          )
        : journalists,
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
    const state = get();
    const placedNews = state.placedNews.filter(
      (placed) => placed.newsId !== newsId,
    );
    const assignments = new Map<string, string>();
    for (const placed of placedNews) {
      const news = NEWS_DATA.find((item) => item.id === placed.newsId);
      if (!news) continue;
      const journalist = state.journalists.find(
        (member) =>
          member.spec === news.category && !assignments.has(member.id),
      );
      if (journalist) assignments.set(journalist.id, placed.newsId);
    }
    set({
      placedNews,
      journalists: state.journalists.map((journalist) => ({
        ...journalist,
        newsId: assignments.get(journalist.id),
      })),
    });
  },

  clearNewspaper: () => {
    const { journalists } = get();
    set({
      placedNews: [],
      journalists: journalists.map((journalist) => ({
        ...journalist,
        newsId: undefined,
      })),
    });
  },

  discardCurrentNews: () => {
    const { currentNewsIds, usedNewsIds } = get();
    set({
      usedNewsIds: [...new Set([...usedNewsIds, ...currentNewsIds])],
      currentNewsIds: [],
      currentCategories: [],
    });
  },

  // ── журналисты ──
  hireJournalist: (j) => {
    const state = get();
    if (
      state.money < j.cost ||
      state.journalists.some((journalist) => journalist.id === j.id) ||
      state.journalists.length >= GAME_BALANCE.maximumJournalists
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
      Math.min(
        GAME_BALANCE.initialJournalists,
        GAME_BALANCE.maximumJournalists,
      ),
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
