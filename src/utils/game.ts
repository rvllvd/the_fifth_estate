import type { GameState, PlacedNews, Journalist, Metrics } from "../types";
import { getNewsById } from "../data/news";
// import { Parameters } from "./storage";
import { MAX_VALUE_STAT } from "../constants/stats";
import { Parameters } from "../constants/game";

export function getTierMultiplier(tier: number): number {
  if (tier === 1) return 2;
  if (tier === 2) return 1;
  return 0.5;
}

export function isSlotTaken(
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

// export function calculateJournalistBonuses(journalists: Journalist[]): Metrics {
//   return journalists.reduce<Metrics>(
//     (acc, j) => ({
//       influence: acc.influence + j.bonus.influence,
//       credibility: acc.credibility + j.bonus.credibility,
//       reputation: acc.reputation + j.bonus.reputation,
//       readership: acc.readership + j.bonus.readership,
//     }),
//     { influence: 0, credibility: 0, reputation: 0, readership: 0 },
//   );
// }

export function calculatePublicationResult(
  placedNews: PlacedNews[],
  journalists: Journalist[],
): Metrics {
  let result: Metrics = {
    influence: 0,
    credibility: 0,
    reputation: 0,
    readership: 0,
  };

  journalists.forEach((j) => {
    placedNews.map((n) => {
      if (!n.metrics) n.metrics = getNewsById(n.newsId)?.effects;
      if (typeof j.bonus === "function")
        n.metrics = j.bonus(
          n,
          placedNews.filter((n2) => n.newsId !== n2.newsId),
        );
      return n;
    });
  });

  for (const placed of placedNews) {
    const m = getTierMultiplier(placed.tier);

    if (placed.metrics) {
      result.influence += Math.round(placed.metrics.influence * m);
      result.credibility += Math.round(placed.metrics.credibility * m);
      result.reputation += Math.round(placed.metrics.reputation * m);
      result.readership += Math.round(placed.metrics.readership * m);
    } else {
      const news = getNewsById(placed.newsId);
      if (!news) continue;

      result.influence += Math.round(news.effects.influence * m);
      result.credibility += Math.round(news.effects.credibility * m);
      result.reputation += Math.round(news.effects.reputation * m);
      result.readership += Math.round(news.effects.readership * m);
    }
  }

  // result = {
  //   influence: result.influence + bonus.influence,
  //   credibility: result.credibility + bonus.credibility,
  //   reputation: result.reputation + bonus.reputation,
  //   readership: result.readership + bonus.readership,
  // };

  return result;
}

export function clampMetric(value: number): number {
  return Math.max(0, Math.min(MAX_VALUE_STAT, value));
}

export function applyPublication(state: GameState, result: Metrics): GameState {
  const usedNewsIds = [...state.usedNewsIds];
  for (const placed of state.placedNews) {
    if (!usedNewsIds.includes(placed.newsId)) usedNewsIds.push(placed.newsId);
  }

  return {
    ...state,
    influence: clampMetric(state.influence + result.influence),
    credibility: clampMetric(state.credibility + result.credibility),
    reputation: clampMetric(state.reputation + result.reputation),
    readership: clampMetric(state.readership + result.readership),
    turn: state.turn + 1,
    placedNews: [],
    usedNewsIds,
    currentNewsIds: [],
    currentCategories: [],
  };
}

// TODO: ПОМЕНЯТЬ УСЛОВИЯ ПОБЕДЫ И ПОРАЖЕНИЯ
export function isVictory(state: GameState): boolean {
  return state.influence >= 70 && state.credibility >= 70;
}

export function isGameOver(state: GameState): boolean {
  return state.turn > state.maxTurns;
}

export function canPublish(state: GameState): boolean {
  return state.placedNews.length >= Parameters.countNews;
}
