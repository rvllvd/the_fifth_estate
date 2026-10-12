import {
  calculateAudienceChange as calculateGlobalAudienceChange,
  GAME_BALANCE,
} from "../constants/global";
import type { GameState, Journalist, Metrics } from "../types";

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export interface EconomySettlement {
  readers: number;
  money: number;
  readerChange: number;
  moneyChange: number;
  income: number;
  payroll: number;
  journalists: Journalist[];
  dismissedJournalists: Journalist[];
}

export function calculateReaderChange(
  currentMetrics: Metrics,
  result: Metrics,
): number {
  return calculateGlobalAudienceChange(currentMetrics, result);
}

export function settleEconomy(
  state: GameState,
  result: Metrics,
): EconomySettlement {
  const projectedReaderChange = calculateReaderChange(state, result);
  const readers = Math.max(
    GAME_BALANCE.minimumReaders,
    state.readers + projectedReaderChange,
  );
  const readerChange = readers - state.readers;
  const income = readers * GAME_BALANCE.moneyPerReaderPerHour;
  const workingJournalists = [...state.journalists];
  let payroll = workingJournalists.reduce(
    (total, journalist) => total + journalist.cost,
    0,
  );
  const availableMoney = state.money + income;
  const dismissedJournalists: Journalist[] = [];

  while (payroll > availableMoney && workingJournalists.length > 0) {
    const mostExpensiveIndex = workingJournalists.reduce(
      (highestIndex, journalist, index, staff) =>
        journalist.cost > staff[highestIndex].cost ? index : highestIndex,
      0,
    );
    const [dismissed] = workingJournalists.splice(mostExpensiveIndex, 1);
    payroll -= dismissed.cost;
    dismissedJournalists.push(dismissed);
  }

  const moneyChange = income - payroll;

  return {
    readers,
    money: Math.max(GAME_BALANCE.minimumMoney, state.money + moneyChange),
    readerChange,
    moneyChange,
    income,
    payroll,
    journalists: workingJournalists,
    dismissedJournalists,
  };
}

export function getCurrentPayroll(journalists: Journalist[]): number {
  return journalists.reduce((total, journalist) => total + journalist.cost, 0);
}
