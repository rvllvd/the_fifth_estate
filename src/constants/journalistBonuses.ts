import type { JournalistBonus } from "../types";

export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  // Adds the product of each same-category news pair to the assigned article's base metrics.
  sameCategorySynergy: (current, relatedNews) =>
    relatedNews.reduce(
      (result, related) => ({
        influence: result.influence + current.influence * related.influence,
        credibility:
          result.credibility + current.credibility * related.credibility,
        reputation: result.reputation + current.reputation * related.reputation,
        readership: result.readership + current.readership * related.readership,
      }),
      { ...current },
    ),
};
