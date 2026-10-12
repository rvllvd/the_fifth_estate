import type { JournalistBonus } from "../types";

export const JOURNALIST_BONUSES: Record<string, JournalistBonus> = {
  ivan_petrov: (current, relatedNews) =>
    relatedNews.reduce(
      (result, related) => ({
        influence: result.influence + current.influence * related.influence,
        credibility:
          result.credibility + current.credibility * related.credibility,
        reputation:
          result.reputation + current.reputation * related.reputation,
        readership:
          result.readership + current.readership * related.readership,
      }),
      { ...current },
    ),
};
