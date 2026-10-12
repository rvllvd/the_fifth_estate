import type { Metrics } from "../types";

export const METRIC_DEFINITIONS = {
  influence: {
    label: "Влияние",
    icon: "📈",
    initial: 50,
    min: 0,
    max: 100,
  },
  credibility: {
    label: "Доверие",
    icon: "🎯",
    initial: 50,
    min: 0,
    max: 100,
  },
  reputation: {
    label: "Репутация",
    icon: "💰",
    initial: 50,
    min: 0,
    max: 100,
  },
  readership: {
    label: "Лояльность",
    icon: "👥",
    initial: 50,
    min: 0,
    max: 100,
  },
} as const satisfies Record<
  keyof Metrics,
  { label: string; icon: string; initial: number; min: number; max: number }
>;

export const METRIC_KEYS = Object.keys(METRIC_DEFINITIONS) as (keyof Metrics)[];

export const INITIAL_METRICS: Metrics = {
  influence: METRIC_DEFINITIONS.influence.initial,
  credibility: METRIC_DEFINITIONS.credibility.initial,
  reputation: METRIC_DEFINITIONS.reputation.initial,
  readership: METRIC_DEFINITIONS.readership.initial,
};

export const ZERO_METRICS: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  readership: 0,
};

export const MIN_VALUE_STAT = METRIC_DEFINITIONS.influence.min;
export const MAX_VALUE_STAT = METRIC_DEFINITIONS.influence.max;

export const GAME_BALANCE = {
  maxTurns: 20,
  articlesPerPublication: 3,
  newsPerRoll: 30,
  initialJournalists: 3,
  columns: {
    1: { title: "Главная полоса", slots: 1, multiplier: 2 },
    2: { title: "Вторая полоса", slots: 2, multiplier: 1 },
    3: { title: "Третья полоса", slots: 3, multiplier: 0.5 },
  },
  initialReaders: 13,
  initialMoney: 3000,
  minimumReaders: 0,
  minimumMoney: 0,
  moneyPerReaderPerHour: 2,
  journalistHourlyWages: {
    ivan_petrov: 50,
    maria_sidorova: 40,
    alexey_kozlov: 60,
    elena_smirnova: 40,
    dmitry_volkov: 30,
    anna_kuznetsova: 50,
    sergey_morozov: 70,
    olga_fedorova: 20,
    pavel_ivanov: 80,
    natalia_popova: 30,
    victor_sokolov: 40,
    ekaterina_nikolaeva: 50,
    andrey_romanov: 60,
    marina_alexeeva: 40,
    igor_lebedev: 30,
    tatyana_vasilieva: 30,
    maxim_golubev: 20,
    yulia_semenova: 50,
    konstantin_borisov: 40,
    veronika_mikhailova: 30,
  },
  journalistBonuses: {
    sameCategorySynergy: { metricScale: 1 },
    morningEdition: { startHour: 9, endHour: 12, credibility: 5 },
    eveningSports: {
      startHour: 16,
      endHour: 18,
      readership: 7,
      credibility: -1,
    },
    weekendPremiere: {
      days: [0, 6] as number[],
      category: "cinema",
      readership: 6,
      reputation: 1,
    },
    sensationalIncident: {
      category: "incident",
      influence: 3,
      reputation: -2,
      readership: 5,
    },
    publicTrust: { minimumCredibility: 50, credibility: 4 },
    diverseNewsroom: { minimumCategories: 3, influence: 5 },
    editorialTeamwork: { credibilityPerColleague: 2 },
    carefulSourcing: {
      categories: ["science", "education", "health"] as string[],
      credibility: 6,
      readership: 1,
    },
    audienceRecovery: {
      maximumReadership: 40,
      category: "culture",
      readership: 6,
      reputation: 2,
    },
    marketAuthority: {
      minimumInfluence: 60,
      category: "finance",
      reputation: 5,
      credibility: 2,
    },
  },
  // These weights combine article results with the quality/health of the whole newsroom.
  audienceChange: {
    readershipEffect: 0.55,
    influenceEffect: 0.12,
    credibilityEffect: 0.2,
    reputationEffect: 0.13,
    qualityEffect: 8,
    readershipLevelEffect: 0.04,
    readershipLevelScale: 100,
    editorialQualityBaseline: 0.5,
    readershipBaseline: 0.5,
    influenceQuality: 0.2,
    credibilityQuality: 0.45,
    reputationQuality: 0.35,
  },
  victoryThresholds: {
    influence: 70,
    credibility: 70,
  },
  gameStart: {
    year: 1600,
    month: 0,
    day: 30,
    firstWorkingHour: 9,
    lastWorkingHour: 18,
  },
  publicationTimeAdvanceMinutes: { min: 50, max: 80 },
  economySaveVersion: 1,
} as const;

export const INITIAL_READERS = GAME_BALANCE.initialReaders;
export const INITIAL_MONEY = GAME_BALANCE.initialMoney;
export const ECONOMY_SAVE_VERSION = GAME_BALANCE.economySaveVersion;
export const MIN_PUBLICATION_TIME_ADVANCE_MINUTES =
  GAME_BALANCE.publicationTimeAdvanceMinutes.min;
export const MAX_PUBLICATION_TIME_ADVANCE_MINUTES =
  GAME_BALANCE.publicationTimeAdvanceMinutes.max;

export function clampMetric(value: number, key?: keyof Metrics): number {
  const bounds = key ? METRIC_DEFINITIONS[key] : undefined;
  return Math.max(
    bounds?.min ?? MIN_VALUE_STAT,
    Math.min(bounds?.max ?? MAX_VALUE_STAT, value),
  );
}

export function getTierMultiplier(tier: number): number {
  return (
    GAME_BALANCE.columns[tier as keyof typeof GAME_BALANCE.columns]
      ?.multiplier ?? GAME_BALANCE.columns[3].multiplier
  );
}

export function calculateAudienceChange(
  currentMetrics: Metrics,
  result: Metrics,
): number {
  const finalMetrics = {
    influence: clampMetric(currentMetrics.influence + result.influence, "influence"),
    credibility: clampMetric(
      currentMetrics.credibility + result.credibility,
      "credibility",
    ),
    reputation: clampMetric(
      currentMetrics.reputation + result.reputation,
      "reputation",
    ),
    readership: clampMetric(
      currentMetrics.readership + result.readership,
      "readership",
    ),
  };
  const weights = GAME_BALANCE.audienceChange;
  const normalizeMetric = (key: keyof Metrics, value: number) => {
    const { min, max } = METRIC_DEFINITIONS[key];
    return (value - min) / (max - min);
  };
  const editorialQuality =
    normalizeMetric("influence", finalMetrics.influence) *
      weights.influenceQuality +
    normalizeMetric("credibility", finalMetrics.credibility) *
      weights.credibilityQuality +
    normalizeMetric("reputation", finalMetrics.reputation) *
      weights.reputationQuality;

  return Math.round(
    result.readership * weights.readershipEffect +
      result.influence * weights.influenceEffect +
      result.credibility * weights.credibilityEffect +
      result.reputation * weights.reputationEffect +
      (editorialQuality - weights.editorialQualityBaseline) *
        weights.qualityEffect +
      (normalizeMetric("readership", finalMetrics.readership) -
        weights.readershipBaseline) *
        weights.readershipLevelScale *
        weights.readershipLevelEffect,
  );
}

export function createInitialGameTime(): number {
  const { year, month, day, firstWorkingHour, lastWorkingHour } =
    GAME_BALANCE.gameStart;
  const startOfDay = Date.UTC(year, month, day);
  const firstWorkingSecond = firstWorkingHour * 60 * 60;
  const lastWorkingSecond = lastWorkingHour * 60 * 60;
  const secondsAfterMidnight =
    firstWorkingSecond +
    Math.floor(Math.random() * (lastWorkingSecond - firstWorkingSecond + 1));

  return startOfDay + secondsAfterMidnight * 1000;
}

export function getRandomPublicationTimeAdvance(randomValue = Math.random()): number {
  const { min, max } = GAME_BALANCE.publicationTimeAdvanceMinutes;
  return (min + Math.floor(randomValue * (max - min + 1))) * 60_000;
}
