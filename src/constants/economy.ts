import { GAME_BALANCE } from "./global";

export function getEconomyDefeatDescriptions(
  readers: number,
  money: number,
): string[] {
  const descriptions: string[] = [];
  if (readers <= GAME_BALANCE.minimumReaders) {
    descriptions.push(
      "У газеты не осталось читателей. Даже бесплатные экземпляры теперь используют как подставки.",
    );
  }
  if (money <= GAME_BALANCE.minimumMoney) {
    descriptions.push(
      "Редакционный счёт пуст. Похоже, следующую статью придётся писать на обороте счёта за аренду.",
    );
  }
  return descriptions;
}
