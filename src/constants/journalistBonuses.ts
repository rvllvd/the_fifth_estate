import type { JournalistBonus } from "../types";

export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  // Adds each same-category article's metric products to this article's base metrics.
  sameCategorySynergy: ({ news, relatedNews }) => ({
    metrics: relatedNews.reduce(
      (bonus, related) => ({
        influence:
          bonus.influence +
          news.effects.influence * related.effects.influence,
        credibility:
          bonus.credibility +
          news.effects.credibility * related.effects.credibility,
        reputation:
          bonus.reputation +
          news.effects.reputation * related.effects.reputation,
        readership:
          bonus.readership +
          news.effects.readership * related.effects.readership,
      }),
      { influence: 0, credibility: 0, reputation: 0, readership: 0 },
    ),
    explanation: relatedNews.length
      ? `Синергия с ${relatedNews.length} новостями той же категории.`
      : "",
  }),
};
