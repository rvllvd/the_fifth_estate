export const Parameters = {
  countNews: 6,
};

// сколько слотов на каждой полосе: 1-я — 1, 2-я — 2, 3-я — 3
export const TIER_SLOTS: Record<number, number> = { 1: 1, 2: 2, 3: 3 };

// все слоты по порядку: "1-0", "2-0", "2-1", "3-0", "3-1", "3-2"
export const ALL_SLOTS: string[] = Object.entries(TIER_SLOTS).flatMap(
  ([tier, count]) =>
    Array.from({ length: count }, (_, slot) => `${tier}-${slot}`),
);
