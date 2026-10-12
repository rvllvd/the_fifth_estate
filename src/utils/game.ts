import type {
  GameState,
  PlacedNews,
  Journalist,
  Metrics,
  NewsItem,
  NewsContribution,
} from "../types";
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
  game: GameState,
): Metrics {
  return calculateNewsContributions(placedNews, journalists, game).reduce(
    (result, contribution) => ({
      influence: result.influence + contribution.final.influence,
      credibility: result.credibility + contribution.final.credibility,
      reputation: result.reputation + contribution.final.reputation,
      readership: result.readership + contribution.final.readership,
    }),
    { influence: 0, credibility: 0, reputation: 0, readership: 0 },
  );
}

export function calculateNewsContributions(
  placedNews: PlacedNews[],
  journalists: Journalist[],
  game: GameState,
): NewsContribution[] {
  const newsItems = placedNews.map((placed) => getNewsById(placed.newsId));

  return placedNews.flatMap((placed, index) => {
    const news = newsItems[index];
    if (!news) {
      return [];
    }

    const journalist = journalists.find((member) => member.newsId === placed.newsId);
    const base = { ...news.effects };
    let bonus: Metrics = { influence: 0, credibility: 0, reputation: 0, readership: 0 };
    let bonusDescription: string | undefined;

    if (journalist?.bonus) {
      if (typeof journalist.bonus === "function") {
        const relatedNews = placedNews.flatMap((other, otherIndex) => {
          if (other.newsId === placed.newsId) return [];
          const related = newsItems[otherIndex];
          return related?.category === news.category ? [related] : [];
        });
        const result = journalist.bonus({
          journalist,
          news,
          relatedNews,
          placedNewsItems: newsItems.filter(
            (item): item is NewsItem => Boolean(item),
          ),
          placedNews,
          journalists,
          game: { ...game, placedNews, journalists },
        });
        bonus = result.metrics;
        bonusDescription = result.explanation;
      } else {
        bonus = journalist.bonus;
        bonusDescription = journalist.desc;
      }
    }

    const multiplier = getTierMultiplier(placed.tier);
    const final = (Object.keys(base) as (keyof Metrics)[]).reduce(
      (metrics, key) => {
        metrics[key] = Math.round((base[key] + bonus[key]) * multiplier);
        return metrics;
      },
      { influence: 0, credibility: 0, reputation: 0, readership: 0 },
    );

    return [{
      newsId: news.id,
      title: news.title,
      category: news.category,
      tier: placed.tier,
      journalistName: journalist?.name,
      base,
      bonus,
      multiplier,
      final,
      bonusDescription,
    }];
  });
}

export function calculateProspectiveNewsContribution(
  news: NewsItem,
  placement: PlacedNews,
  journalists: Journalist[],
  game: GameState,
): NewsContribution | null {
  const assignedJournalist = journalists.find(
    (journalist) => journalist.spec === news.category && !journalist.newsId,
  );
  if (!assignedJournalist) return null;

  const prospectiveJournalists = journalists.map((journalist) =>
    journalist.id === assignedJournalist.id
      ? { ...journalist, newsId: news.id }
      : journalist,
  );
  const prospectivePlacedNews = [...game.placedNews, placement];
  const [contribution] = calculateNewsContributions(
    prospectivePlacedNews,
    prospectiveJournalists,
    {
      ...game,
      placedNews: prospectivePlacedNews,
      journalists: prospectiveJournalists,
    },
  ).slice(-1);

  return contribution ?? null;
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
  return state.turn > state.maxTurns || state.readers <= 0 || state.money <= 0;
}

export function canPublish(state: GameState): boolean {
  return state.placedNews.length >= Parameters.countNews;
}
