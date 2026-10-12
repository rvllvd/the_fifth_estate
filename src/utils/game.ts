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
  return calculateNewsContributions(placedNews, journalists).reduce(
    (result, contribution) => ({
      influence: result.influence + contribution.influence,
      credibility: result.credibility + contribution.credibility,
      reputation: result.reputation + contribution.reputation,
      readership: result.readership + contribution.readership,
    }),
    { influence: 0, credibility: 0, reputation: 0, readership: 0 },
  );
}

export function calculateNewsContributions(
  placedNews: PlacedNews[],
  journalists: Journalist[],
): Metrics[] {
  const newsItems = placedNews.map((placed) => getNewsById(placed.newsId));

  return placedNews.map((placed, index) => {
    const news = newsItems[index];
    if (!news) {
      return { influence: 0, credibility: 0, reputation: 0, readership: 0 };
    }

    const journalist = journalists.find((member) => member.newsId === placed.newsId);
    let metrics = { ...news.effects };

    if (journalist?.bonus) {
      if (typeof journalist.bonus === "function") {
        const relatedNews = placedNews.flatMap((other, otherIndex) => {
          if (other.newsId === placed.newsId) return [];
          const related = newsItems[otherIndex];
          return related?.category === news.category ? [{ ...related.effects }] : [];
        });
        metrics = journalist.bonus(metrics, relatedNews);
      } else {
        metrics = {
          influence: metrics.influence + journalist.bonus.influence,
          credibility: metrics.credibility + journalist.bonus.credibility,
          reputation: metrics.reputation + journalist.bonus.reputation,
          readership: metrics.readership + journalist.bonus.readership,
        };
      }
    }

    const multiplier = getTierMultiplier(placed.tier);
    return {
      influence: Math.round(metrics.influence * multiplier),
      credibility: Math.round(metrics.credibility * multiplier),
      reputation: Math.round(metrics.reputation * multiplier),
      readership: Math.round(metrics.readership * multiplier),
    };
  });
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
