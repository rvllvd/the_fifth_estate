import {
  GAME_BALANCE,
  METRIC_DEFINITIONS,
  calculateAudienceChange,
} from "../constants/global";
import { ALL_SLOTS } from "../constants/game";
import type { GameState, Journalist, Metrics, NewsItem, PlacedNews } from "../types";
import { calculatePublicationResult, isSlotTaken } from "./game";
import { getCurrentPayroll, settleEconomy } from "./economy";

export interface AutoTurnPlan {
  journalistToHire: Journalist | null;
  placements: Array<{ news: NewsItem; slot: string; journalistId: string }>;
}

function evaluatePublication(
  state: GameState,
  placements: PlacedNews[],
  journalists: Journalist[],
): number {
  const game = { ...state, placedNews: placements, journalists };
  const result = calculatePublicationResult(placements, journalists, game);
  const metricWeights: Record<keyof Metrics, number> = {
    influence: 0.8,
    credibility: 1,
    reputation: 0.7,
    loyalty: 1.3,
  };
  let score = 0;

  for (const key of Object.keys(metricWeights) as (keyof Metrics)[]) {
    const definition = METRIC_DEFINITIONS[key];
    const current = state[key];
    const projected = Math.max(
      definition.min,
      Math.min(definition.max, current + result[key]),
    );
    const scarcity =
      1 +
      (1 - (current - definition.min) / (definition.max - definition.min)) *
        0.8;
    score += result[key] * metricWeights[key] * scarcity;
    if (current + result[key] <= definition.min) {
      score -= 35 + (definition.min - current - result[key]) * 2;
    }
    score += ((projected - current) / (definition.max - definition.min)) * 0.4;
  }

  const audienceChange = calculateAudienceChange(state, result);
  const economy = settleEconomy(state, result);
  score += audienceChange * 0.75;
  score += Math.log1p(Math.max(0, economy.money)) * 0.12;
  if (economy.readers <= GAME_BALANCE.minimumReaders) score -= 100;
  if (economy.money <= GAME_BALANCE.minimumMoney) score -= 100;
  return score;
}

function chooseJournalistToHire(
  state: GameState,
  news: NewsItem[],
  roster: Journalist[],
): Journalist | null {
  const coveredCategories = new Set(
    state.journalists.map((journalist) => journalist.spec),
  );
  const payroll = getCurrentPayroll(state.journalists);
  const income = state.readers * GAME_BALANCE.moneyPerReaderPerHour;
  const expectedPayrollLimit = Math.max(income * 1.5, 35);
  const reserve = Math.max(
    GAME_BALANCE.autoPlay.hireReserveTurns * Math.max(payroll, income),
    500,
  );

  if (state.money < reserve) return null;

  const newsByCategory = new Map<string, NewsItem[]>();
  for (const item of news) {
    if (!item.category || coveredCategories.has(item.category)) continue;
    const items = newsByCategory.get(item.category) ?? [];
    items.push(item);
    newsByCategory.set(item.category, items);
  }

  const candidates = roster
    .filter(
      (journalist) =>
        journalist.spec &&
        !coveredCategories.has(journalist.spec) &&
        !state.journalists.some((member) => member.id === journalist.id) &&
        payroll + journalist.cost <= expectedPayrollLimit &&
        state.money - journalist.cost >= reserve,
    )
    .map((journalist) => {
      const bestStory = (newsByCategory.get(journalist.spec ?? "") ?? [])
        .map((item) =>
          evaluatePublication(
            state,
            [{ newsId: item.id, tier: 1, slot: 0 }],
            [...state.journalists, { ...journalist, newsId: item.id }],
          ),
        )
        .reduce((best, score) => Math.max(best, score), -Infinity);
      return { journalist, score: bestStory };
    })
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort(
      (first, second) =>
        second.score / (1 + second.journalist.cost * 0.03) -
        first.score / (1 + first.journalist.cost * 0.03),
    );

  return candidates[0]?.journalist ?? null;
}

export function chooseAutoTurn(
  state: GameState,
  currentNews: NewsItem[],
  roster: Journalist[],
): AutoTurnPlan {
  const journalistToHire = chooseJournalistToHire(state, currentNews, roster);
  const journalists = journalistToHire
    ? [...state.journalists, { ...journalistToHire }]
    : state.journalists.map((journalist) => ({ ...journalist }));
  const placements = state.placedNews.map((placed) => ({ ...placed }));
  const alreadySelected = new Set(placements.map((placed) => placed.newsId));
  const selected: AutoTurnPlan["placements"] = [];
  const targetCount = Math.min(
    GAME_BALANCE.articlesPerPublication,
    ALL_SLOTS.length,
  );
  const availableNews = currentNews.filter(
    (item) => !alreadySelected.has(item.id),
  );

  while (placements.length < targetCount) {
    let bestChoice:
      | {
          news: NewsItem;
          slot: string;
          journalistId: string;
          score: number;
        }
      | undefined;

    for (const item of availableNews) {
      if (selected.some((choice) => choice.news.id === item.id)) continue;
      const matchingJournalists = journalists.filter(
        (member) => member.spec === item.category && !member.newsId,
      );
      if (matchingJournalists.length === 0) continue;

      for (const journalist of matchingJournalists) {
        for (const slot of ALL_SLOTS) {
          if (isSlotTaken(placements, slot, item.id)) continue;
          const [tier, position] = slot.split("-").map(Number);
          const hypotheticalPlacements = [
            ...placements,
            { newsId: item.id, tier, slot: position },
          ];
          const hypotheticalJournalists = journalists.map((member) =>
            member.id === journalist.id
              ? { ...member, newsId: item.id }
              : member,
          );
          const score =
            evaluatePublication(
              state,
              hypotheticalPlacements,
              hypotheticalJournalists,
            ) +
            (Math.random() - 0.5) * GAME_BALANCE.autoPlay.randomness;

          if (!bestChoice || score > bestChoice.score) {
            bestChoice = {
              news: item,
              slot,
              journalistId: journalist.id,
              score,
            };
          }
        }
      }
    }

    if (!bestChoice) break;
    const [tier, position] = bestChoice.slot.split("-").map(Number);
    placements.push({
      newsId: bestChoice.news.id,
      tier,
      slot: position,
    });
    alreadySelected.add(bestChoice.news.id);
    selected.push({
      news: bestChoice.news,
      slot: bestChoice.slot,
      journalistId: bestChoice.journalistId,
    });
    const assigned = journalists.find(
      (member) => member.id === bestChoice.journalistId,
    );
    if (assigned) assigned.newsId = bestChoice.news.id;
  }

  return { journalistToHire, placements: selected };
}
