import { GAME_BALANCE } from "./global";

export const Parameters = {
  countNews: GAME_BALANCE.articlesPerPublication,
};

export const TIER_SLOTS: Record<number, number> = Object.fromEntries(
  Object.entries(GAME_BALANCE.columns).map(([tier, column]) => [
    tier,
    column.slots,
  ]),
);

// все слоты по порядку: "1-0", "2-0", "2-1", "3-0", "3-1", "3-2"
export const ALL_SLOTS: string[] = Object.entries(TIER_SLOTS).flatMap(
  ([tier, count]) =>
    Array.from({ length: count }, (_, slot) => `${tier}-${slot}`),
);
