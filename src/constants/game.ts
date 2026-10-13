import { GAME_BALANCE } from "./global";

export const Parameters = {
  countNews: GAME_BALANCE.articlesPerPublication,
};

// Количество слотов для каждой полосы (tier)
export const TIER_SLOTS: Record<number, number> = Object.fromEntries(
  Object.entries(GAME_BALANCE.columns).map(([tier, column]) => [
    tier,
    column.slots,
  ]),
);

// Все слоты по порядку: "1-0", "2-0", "2-1", "3-0", "3-1", "3-2"
// Используется для перебора всех доступных позиций в газете
export const ALL_SLOTS: string[] = Object.entries(TIER_SLOTS).flatMap(
  ([tier, count]) =>
    Array.from({ length: count }, (_, slot) => `${tier}-${slot}`),
);
