export const INITIAL_READERS = 13;
export const INITIAL_MONEY = 3000;
export const MONEY_PER_READER_PER_TURN = 2;

export const AUDIENCE_CHANGE_WEIGHTS = {
  readershipEffect: 0.55,
  influenceEffect: 0.12,
  credibilityEffect: 0.2,
  reputationEffect: 0.13,
  qualityEffect: 8,
  readershipLevelEffect: 0.04,
  influenceQuality: 0.2,
  credibilityQuality: 0.45,
  reputationQuality: 0.35,
} as const;

export function getEconomyDefeatDescriptions(
  readers: number,
  money: number,
): string[] {
  const descriptions: string[] = [];
  if (readers <= 0) {
    descriptions.push(
      "У газеты не осталось читателей. Даже бесплатные экземпляры теперь используют как подставки.",
    );
  }
  if (money <= 0) {
    descriptions.push(
      "Редакционный счёт пуст. Похоже, следующую статью придётся писать на обороте счёта за аренду.",
    );
  }
  return descriptions;
}
