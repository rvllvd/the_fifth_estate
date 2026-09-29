import type { GameState, PlacedNews, Journalist, Metrics } from '../types';
import { getNewsById } from '../data/news';
import { Parameters } from './storage';

export function getTierMultiplier(tier: number): number {
  if (tier === 1) return 2;
  if (tier === 2) return 1;
  return 0.5;
}

export function calculateJournalistBonuses(journalists: Journalist[]): Metrics {
  return journalists.reduce<Metrics>(
    (acc, j) => ({
      influence: acc.influence + j.bonus.influence,
      credibility: acc.credibility + j.bonus.credibility,
      budget: acc.budget + j.bonus.budget,
      readership: acc.readership + j.bonus.readership,
    }),
    { influence: 0, credibility: 0, budget: 0, readership: 0 }
  );
}

export function calculatePublicationResult(
  placedNews: PlacedNews[],
  journalists: Journalist[]
): Metrics {
  let result: Metrics = { influence: 0, credibility: 0, budget: 0, readership: 0 };

  for (const placed of placedNews) {
    const news = getNewsById(placed.newsId);
    if (!news) continue;
    const m = getTierMultiplier(placed.tier);
    result.influence  += Math.round(news.effects.influence  * m);
    result.credibility += Math.round(news.effects.credibility * m);
    result.budget     += Math.round(news.effects.budget     * m);
    result.readership += Math.round(news.effects.readership * m);
  }

  const bonus = calculateJournalistBonuses(journalists);
  result = {
    influence: result.influence + bonus.influence,
    credibility: result.credibility + bonus.credibility,
    budget: result.budget + bonus.budget,
    readership: result.readership + bonus.readership,
  };

  return result;
}

export function clampMetric(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyPublication(
  state: GameState,
  result: Metrics
): GameState {
  const usedNewsIds = [...state.usedNewsIds];
  for (const placed of state.placedNews) {
    if (!usedNewsIds.includes(placed.newsId)) usedNewsIds.push(placed.newsId);
  }

  return {
    ...state,
    influence:  clampMetric(state.influence + result.influence),
    credibility: clampMetric(state.credibility + result.credibility),
    budget: clampMetric(state.budget + result.budget),
    readership: clampMetric(state.readership + result.readership),
    turn: state.turn + 1,
    placedNews: [],
    usedNewsIds,
    currentNewsIds: [],
    currentCategories: [],
  };
}

export function isVictory(state: GameState): boolean {
  return state.influence >= 70 && state.credibility >= 70;
}

export function isGameOver(state: GameState): boolean {
  return state.turn > state.maxTurns;
}

export function canPublish(state: GameState): boolean {
  return state.placedNews.length >= Parameters.countNews;
}