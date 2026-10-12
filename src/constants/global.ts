import type { Metrics } from "../types";

export const GLOBAL_CONFIG_STORAGE_KEY = "the_fifth_estate_dev_config";

type ConfigRecord = Record<string, unknown>;

function isConfigRecord(value: unknown): value is ConfigRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeKnownConfig(target: ConfigRecord, source: unknown): void {
  if (!isConfigRecord(source)) return;

  for (const [key, value] of Object.entries(source)) {
    if (!Object.prototype.hasOwnProperty.call(target, key)) continue;

    const current = target[key];
    if (isConfigRecord(current)) {
      mergeKnownConfig(current, value);
    } else if (Array.isArray(current) && Array.isArray(value)) {
      const expectedType = typeof current[0];
      if (
        value.every(
          (item) =>
            typeof item === expectedType &&
            (typeof item !== "number" || Number.isFinite(item)),
        )
      ) {
        target[key] = value;
      }
    } else if (
      typeof current === typeof value &&
      (typeof value !== "number" || Number.isFinite(value))
    ) {
      target[key] = value;
    }
  }
}

export interface GlobalConfigSnapshot {
  metrics: typeof METRIC_DEFINITIONS;
  game: typeof GAME_BALANCE;
}

export function getGlobalConfigSnapshot(): GlobalConfigSnapshot {
  return JSON.parse(
    JSON.stringify({ metrics: METRIC_DEFINITIONS, game: GAME_BALANCE }),
  ) as GlobalConfigSnapshot;
}

export function saveGlobalConfig(config: unknown): void {
  localStorage.setItem(GLOBAL_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function resetGlobalConfig(): void {
  localStorage.removeItem(GLOBAL_CONFIG_STORAGE_KEY);
}

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
    icon: "📰",
    initial: 50,
    min: 0,
    max: 100,
  },
  loyalty: {
    label: "Лояльность",
    icon: "👥",
    initial: 50,
    min: 0,
    max: 100,
  },
} satisfies Record<
  keyof Metrics,
  { label: string; icon: string; initial: number; min: number; max: number }
>;

export const METRIC_KEYS = Object.keys(METRIC_DEFINITIONS) as (keyof Metrics)[];

export const ZERO_METRICS: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  loyalty: 0,
};

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
      loyalty: 7,
      credibility: -1,
    },
    weekendPremiere: {
      days: [0, 6] as number[],
      category: "cinema",
      loyalty: 6,
      reputation: 1,
    },
    sensationalIncident: {
      category: "incident",
      influence: 3,
      reputation: -2,
      loyalty: 5,
    },
    publicTrust: { minimumCredibility: 50, credibility: 4 },
    diverseNewsroom: { minimumCategories: 3, influence: 5 },
    editorialTeamwork: { credibilityPerColleague: 2 },
    carefulSourcing: {
      categories: ["science", "education", "health"] as string[],
      credibility: 6,
      loyalty: 1,
    },
    audienceRecovery: {
      maximumloyalty: 40,
      category: "culture",
      loyalty: 6,
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
    loyaltyEffect: 0.55,
    influenceEffect: 0.12,
    credibilityEffect: 0.2,
    reputationEffect: 0.13,
    qualityEffect: 8,
    loyaltyLevelEffect: 0.04,
    loyaltyLevelScale: 100,
    editorialQualityBaseline: 0.5,
    loyaltyBaseline: 0.5,
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
};

function loadSavedGlobalConfig(): void {
  try {
    const saved = localStorage.getItem(GLOBAL_CONFIG_STORAGE_KEY);
    if (!saved) return;

    const config: unknown = JSON.parse(saved);
    if (!isConfigRecord(config)) return;

    mergeKnownConfig(
      METRIC_DEFINITIONS as ConfigRecord,
      config.metrics,
    );
    mergeKnownConfig(GAME_BALANCE as ConfigRecord, config.game);
  } catch (error) {
    console.error("Не удалось загрузить dev-конфигурацию игры:", error);
  }
}

loadSavedGlobalConfig();

export const INITIAL_METRICS: Metrics = {
  influence: METRIC_DEFINITIONS.influence.initial,
  credibility: METRIC_DEFINITIONS.credibility.initial,
  reputation: METRIC_DEFINITIONS.reputation.initial,
  loyalty: METRIC_DEFINITIONS.loyalty.initial,
};

export const MIN_VALUE_STAT = METRIC_DEFINITIONS.influence.min;
export const MAX_VALUE_STAT = METRIC_DEFINITIONS.influence.max;

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
    influence: clampMetric(
      currentMetrics.influence + result.influence,
      "influence",
    ),
    credibility: clampMetric(
      currentMetrics.credibility + result.credibility,
      "credibility",
    ),
    reputation: clampMetric(
      currentMetrics.reputation + result.reputation,
      "reputation",
    ),
    loyalty: clampMetric(currentMetrics.loyalty + result.loyalty, "loyalty"),
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
    result.loyalty * weights.loyaltyEffect +
      result.influence * weights.influenceEffect +
      result.credibility * weights.credibilityEffect +
      result.reputation * weights.reputationEffect +
      (editorialQuality - weights.editorialQualityBaseline) *
        weights.qualityEffect +
      (normalizeMetric("loyalty", finalMetrics.loyalty) -
        weights.loyaltyBaseline) *
        weights.loyaltyLevelScale *
        weights.loyaltyLevelEffect,
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

export function getRandomPublicationTimeAdvance(
  randomValue = Math.random(),
): number {
  const { min, max } = GAME_BALANCE.publicationTimeAdvanceMinutes;
  return (min + Math.floor(randomValue * (max - min + 1))) * 60_000;
}
