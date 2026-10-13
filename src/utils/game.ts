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
import {
  GAME_BALANCE,
  METRIC_DEFINITIONS,
  METRIC_KEYS,
  clampMetric as clampGlobalMetric,
  getTierMultiplier,
} from "../constants/global";

export { getTierMultiplier };

// Проверяет, занят ли слот конкретной новостью
// excludeNewsId: если указан, эта новость не считается занимающей слот (для перемещения)
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
//       loyalty: acc.loyalty + j.bonus.loyalty,
//     }),
//     { influence: 0, credibility: 0, reputation: 0, loyalty: 0 },
//   );
// }

// Рассчитывает общий результат публикации (сумма всех вкладов новостей)
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
      loyalty: result.loyalty + contribution.final.loyalty,
    }),
    { influence: 0, credibility: 0, reputation: 0, loyalty: 0 },
  );
}

// Рассчитывает вклад каждой новости в publication
// Учитывает базовые эффекты, бонусы журналистов и множители полос (tier)
// Поддерживает как статические бонусы, так и динамические (функции)
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

    const journalist = journalists.find(
      (member) => member.newsId === placed.newsId,
    );
    const base = { ...news.effects };
    let bonus: Metrics = {
      influence: 0,
      credibility: 0,
      reputation: 0,
      loyalty: 0,
    };
    let bonusDescription: string | undefined;

    // Расчёт бонуса журналиста
    if (journalist?.bonus) {
      if (typeof journalist.bonus === "function") {
        // Динамический бонус с контекстом
        const relatedNews = placedNews.flatMap((other, otherIndex) => {
          if (other.newsId === placed.newsId) return [];
          const related = newsItems[otherIndex];
          return related?.category === news.category ? [related] : [];
        });
        const result = journalist.bonus({
          journalist,
          news,
          relatedNews,
          placedNewsItems: newsItems.filter((item): item is NewsItem =>
            Boolean(item),
          ),
          placedNews,
          journalists,
          game: { ...game, placedNews, journalists },
        });
        bonus = result.metrics;
        bonusDescription = result.explanation;
      } else {
        // Статический бонус
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
      { influence: 0, credibility: 0, reputation: 0, loyalty: 0 },
    );

    return [
      {
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
      },
    ];
  });
}

// Рассчитывает вклад новости без её фактического размещения (для предпросмотра)
// Создаёт гипотетическое состояние с новостью и журналистом
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

// Ограничивает значение метрики в допустимом диапазоне
export function clampMetric(value: number, key?: keyof Metrics): number {
  return clampGlobalMetric(value, key);
}

// Применяет результат публикации к состоянию игры
// Обновляет метрики, увеличивает ход, очищает размещённые новости
export function applyPublication(state: GameState, result: Metrics): GameState {
  const usedNewsIds = [...state.usedNewsIds];
  for (const placed of state.placedNews) {
    if (!usedNewsIds.includes(placed.newsId)) usedNewsIds.push(placed.newsId);
  }

  return {
    ...state,
    influence: clampGlobalMetric(
      state.influence + result.influence,
      "influence",
    ),
    credibility: clampGlobalMetric(
      state.credibility + result.credibility,
      "credibility",
    ),
    reputation: clampGlobalMetric(
      state.reputation + result.reputation,
      "reputation",
    ),
    loyalty: clampGlobalMetric(state.loyalty + result.loyalty, "loyalty"),
    turn: state.turn + 1,
    placedNews: [],
    usedNewsIds,
    currentNewsIds: [],
    currentCategories: [],
  };
}

// Проверяет условие победы
export function isVictory(state: GameState): boolean {
  return state.victory === true;
}

// Проверяет условие окончания игры (поражение или победа)
export function isGameOver(state: GameState): boolean {
  return (
    state.gameOver === true ||
    isVictory(state) ||
    state.turn > state.maxTurns ||
    state.readers <= GAME_BALANCE.minimumReaders ||
    state.money <= GAME_BALANCE.minimumMoney ||
    METRIC_KEYS.some((key) => state[key] <= METRIC_DEFINITIONS[key].min)
  );
}

// Проверяет, можно ли опубликовать газету (достаточно новостей)
export function canPublish(state: GameState): boolean {
  return state.placedNews.length >= GAME_BALANCE.articlesPerPublication;
}
