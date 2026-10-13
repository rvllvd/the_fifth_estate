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
import { chooseDirectorEvent, GAME_EVENTS } from "../data/events";
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
  METRIC_DEFINITIONS,
  METRIC_KEYS,
  getRandomPublicationTimeAdvance,
} from "../constants/global";

// Интерфейс главного хранилища игры, расширяющий GameState
// Содержит все методы для управления состоянием игры
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
  resolveEvent: (choiceId: string) => void;
  dismissWeekResult: () => void;
  tickGameTime: () => void;
  newGame: () => void;
  reset: () => void;

  isGameOver: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  // Обновляет назначения журналистов на новости
  // Пересчитывает, какой журналист работает над какой новостью на основе категорий
  // Использует Map для отслеживания уже назначенных журналистов, чтобы избежать дублирования
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
  // Генерирует новые новости для выбора игроком
  // allowUsedNews: если true, позволяет использовать уже показанные новости (когда новые закончились)
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
  // Размещает новость в газете
  // key: ключ слота в формате "tier-slot" (например, "1-2")
  // journalistId: ID конкретного журналиста (опционально)
  // allowUnstaffed: если true, позволяет разместить новость без журналиста
  // Возвращает true если размещение успешно, иначе false
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

  // Автоматически размещает новость в первый свободный слот при клике
  // Если новость уже размещена - ничего не делает
  clickNews: (news) => {
    const { placedNews, dropNews } = get();
    if (placedNews.some((p) => p.newsId === news.id)) return;

    const free = ALL_SLOTS.find((s) => !isSlotTaken(placedNews, s, news.id));
    if (free) dropNews(free, news);
  },

  // Удаляет новость из газеты и переназначает журналистов
  // Пересчитывает назначения после удаления, чтобы журналисты перераспределились
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

  // Очищает всю газету - удаляет все размещённые новости и снимает назначения журналистов
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

  // Отбрасывает текущие новости в корзину (в список использованных)
  discardCurrentNews: () => {
    const { currentNewsIds, usedNewsIds } = get();
    set({
      usedNewsIds: [...new Set([...usedNewsIds, ...currentNewsIds])],
      currentNewsIds: [],
      currentCategories: [],
    });
  },

  // ── журналисты ──
  // Нанимает журналиста в редакцию
  // Проверяет: хватает ли денег, нет ли уже такого, не переполнен ли офис
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

  // Увольняет журналиста по ID
  fireJournalist: (id) =>
    set((prev) => ({
      journalists: prev.journalists.filter((x) => x.id !== id),
    })),

  // ── игровой цикл ──
  // Публикует газету - рассчитывает вклад каждой новости и возвращает результат
  // Возвращает null если публикация невозможна, иначе возвращает метрики результата
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

  // Применяет результат публикации к состоянию игры
  // Обновляет метрики, экономику, проверяет условия победы/поражения, запускает события
  applyResult: (result) => {
    const state = get();
    const now = Date.now();
    const currentGameTime =
      state.gameTime + Math.max(0, now - state.gameTimeUpdatedAt);
    const publicationDuration = getRandomPublicationTimeAdvance();
    const updatedState = applyPublication(state, result);
    const economy = settleEconomy(state, result);
    const nextState: GameState = {
      ...updatedState,
      readers: economy.readers,
      money: economy.money,
      journalists: economy.journalists,
      gameTime: currentGameTime + publicationDuration,
      gameTimeUpdatedAt: now,
    };
    const completedTurns = nextState.turn - 1;
    const isWeekEnd = completedTurns > 0 && completedTurns % 7 === 0;
    const week = completedTurns / 7;
    const target = GAME_BALANCE.weeklyMoneyGoals[week - 1];

    if (isWeekEnd) {
      const otherDefeat =
        nextState.readers <= GAME_BALANCE.minimumReaders ||
        nextState.money <= GAME_BALANCE.minimumMoney ||
        METRIC_KEYS.some(
          (key) => nextState[key] <= METRIC_DEFINITIONS[key].min,
        );

      if (otherDefeat) {
        nextState.gameOver = true;
        nextState.victory = false;
      } else if (target !== undefined) {
        const passed = nextState.money >= target;
        const finalWeek = week >= GAME_BALANCE.weeklyMoneyGoals.length;
        nextState.weekResult = {
          week,
          target,
          balance: nextState.money,
          passed,
        };
        nextState.gameOver = !passed || finalWeek;
        nextState.victory = passed && finalWeek;
      }
    }

    if (!isGameOver(nextState) && !state.pendingEvent) {
      const event = chooseDirectorEvent(nextState);
      if (event) {
        nextState.pendingEvent = { id: event.id, turn: completedTurns };
        nextState.eventHistory = [
          ...(state.eventHistory ?? []),
          event.id,
        ].slice(-3);
      }
    }

    set(nextState);
  },

  // Обрабатывает выбор игрока в событии (event)
  // Применяет эффекты выбора к метрикам и деньгам, проверяет минимальные значения
  resolveEvent: (choiceId) => {
    const state = get();
    if (!state.pendingEvent) return;

    const event = GAME_EVENTS.find(
      (candidate) => candidate.id === state.pendingEvent?.id,
    );
    const choice = event?.choices.find(
      (candidate) => candidate.id === choiceId,
    );
    if (!event || !choice) {
      set({ pendingEvent: undefined });
      return;
    }

    const minimumMoneyAfterEvent = GAME_BALANCE.minimumMoney + 1;
    if (
      choice.cost !== undefined &&
      state.money - choice.cost < minimumMoneyAfterEvent
    ) {
      return;
    }

    const updatedMetrics = { ...state };
    for (const key of METRIC_KEYS) {
      const effect = choice.effect?.metrics?.[key];
      if (!effect) continue;

      const change =
        effect.mode === "percent"
          ? Math.round((state[key] * effect.amount) / 100)
          : effect.amount;
      const minimum = METRIC_DEFINITIONS[key].min;
      const maximum = METRIC_DEFINITIONS[key].max;
      const normalized = Math.min(
        maximum,
        Math.max(minimum, state[key] + change),
      );
      updatedMetrics[key] =
        event.polarity === "setback" && change < 0
          ? Math.max(minimum + 1, normalized)
          : normalized;
    }

    const moneyEffect = choice.effect?.money;
    const moneyChange = moneyEffect
      ? moneyEffect.mode === "percent"
        ? Math.round((state.money * moneyEffect.amount) / 100)
        : moneyEffect.amount
      : 0;
    const totalMoneyChange = moneyChange - (choice.cost ?? 0);
    const minimumMoney =
      totalMoneyChange < 0 ? minimumMoneyAfterEvent : GAME_BALANCE.minimumMoney;

    set({
      ...updatedMetrics,
      money: Math.max(minimumMoney, state.money + totalMoneyChange),
      pendingEvent: undefined,
    });
  },

  // Скрывает экран результатов недели
  dismissWeekResult: () => set({ weekResult: undefined }),

  // Обновляет игровое время (тимер тикает в реальном времени)
  tickGameTime: () => {
    const now = Date.now();
    set((state) => ({
      gameTime: state.gameTime + Math.max(0, now - state.gameTimeUpdatedAt),
      gameTimeUpdatedAt: now,
    }));
  },

  // Начинает новую игру с начальными значениями и стартовыми журналистами
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
    set({
      ...init,
      gameOver: undefined,
      victory: undefined,
      weekResult: undefined,
      pendingEvent: undefined,
      eventHistory: [],
    });
    clearNewspaper();
  },

  // Полный сброс состояния игры к начальным значениям (без журналистов)
  reset: () =>
    set({
      ...getInitialState(),
      gameOver: undefined,
      victory: undefined,
      weekResult: undefined,
      pendingEvent: undefined,
      eventHistory: [],
    }),

  // Проверяет, окончена ли игра
  isGameOver: () => {
    return isGameOver(get());
  },
}));

// ─── автосохранение ──────────────────────────────────────────────
// Подписывается на изменения состояния и сохраняет их в localStorage
useGameStore.subscribe((state) => saveState(state));

// ─── селекторы ───────────────────────────────────────────────────
// Оптимизированные селекторы для компонентов
export const selectPlacedNews = (s: GameStore) => s.placedNews;
export const selectIsVictory = (s: GameStore) => isVictory(s);
export const selectIsGameOver = (s: GameStore) => isGameOver(s);
export const selectCanPublish = (s: GameStore) => canPublish(s);
