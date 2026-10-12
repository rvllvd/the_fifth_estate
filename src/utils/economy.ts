import { AUDIENCE_CHANGE_WEIGHTS, MONEY_PER_READER_PER_TURN } from "../constants/economy";
import type { GameState, Journalist, Metrics } from "../types";
import { clampMetric } from "./game";

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
  const finalMetrics = {
    influence: clampMetric(currentMetrics.influence + result.influence),
    credibility: clampMetric(currentMetrics.credibility + result.credibility),
    reputation: clampMetric(currentMetrics.reputation + result.reputation),
    readership: clampMetric(currentMetrics.readership + result.readership),
  };
  const weights = AUDIENCE_CHANGE_WEIGHTS;
  const editorialQuality =
    (finalMetrics.influence * weights.influenceQuality +
      finalMetrics.credibility * weights.credibilityQuality +
      finalMetrics.reputation * weights.reputationQuality) /
    100;
  // Strong readership helps most, but weak editorial credibility can still cause audience loss.
  const change =
    result.readership * weights.readershipEffect +
    result.influence * weights.influenceEffect +
    result.credibility * weights.credibilityEffect +
    result.reputation * weights.reputationEffect +
    (editorialQuality - 0.5) * weights.qualityEffect +
    (finalMetrics.readership - 50) * weights.readershipLevelEffect;

  return Math.round(change);
}

export function settleEconomy(
  state: GameState,
  result: Metrics,
): EconomySettlement {
  const projectedReaderChange = calculateReaderChange(state, result);
  const readers = Math.max(0, state.readers + projectedReaderChange);
  const readerChange = readers - state.readers;
  const income = readers * MONEY_PER_READER_PER_TURN;
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
    money: Math.max(0, state.money + moneyChange),
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
