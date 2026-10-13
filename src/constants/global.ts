import type { Metrics } from "../types";

// Ключ для хранения dev-конфигурации в localStorage
export const GLOBAL_CONFIG_STORAGE_KEY = "the_fifth_estate_dev_config";

type ConfigRecord = Record<string, unknown>;

// Проверяет, является ли значение объектом (не массивом)
function isConfigRecord(value: unknown): value is ConfigRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Рекурсивно объединяет сохранённую конфигурацию с текущей
// Объединяет только известные ключи с проверкой типов
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

// Снимок глобальной конфигурации для dev-инструментов
export interface GlobalConfigSnapshot {
  metrics: typeof METRIC_DEFINITIONS;
  game: typeof GAME_BALANCE;
  news: typeof NEWS_EFFECT_BALANCE;
}

// Создаёт снимок текущей конфигурации (глубокая копия)
export function getGlobalConfigSnapshot(): GlobalConfigSnapshot {
  return JSON.parse(
    JSON.stringify({
      metrics: METRIC_DEFINITIONS,
      game: GAME_BALANCE,
      news: NEWS_EFFECT_BALANCE,
    }),
  ) as GlobalConfigSnapshot;
}

// Сохраняет dev-конфигурацию в localStorage
export function saveGlobalConfig(config: unknown): void {
  localStorage.setItem(GLOBAL_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// Сбрасывает dev-конфигурацию к значениям по умолчанию
export function resetGlobalConfig(): void {
  localStorage.removeItem(GLOBAL_CONFIG_STORAGE_KEY);
}

const DEFAULT_METRIC_VALUE = 15;
const DEFAULT_MIN_METRIC_VALUE = 0;
const DEFAULT_MAX_METRIC_VALUE = 100;

// Определения метрик: название, иконка, начальное значение, границы
export const METRIC_DEFINITIONS = {
  influence: {
    label: "Влияние",
    icon: "📈",
    initial: DEFAULT_METRIC_VALUE,
    min: DEFAULT_MIN_METRIC_VALUE,
    max: DEFAULT_MAX_METRIC_VALUE,
  },
  credibility: {
    label: "Доверие",
    icon: "🎯",
    initial: DEFAULT_METRIC_VALUE,
    min: DEFAULT_MIN_METRIC_VALUE,
    max: DEFAULT_MAX_METRIC_VALUE,
  },
  reputation: {
    label: "Репутация",
    icon: "📰",
    initial: DEFAULT_METRIC_VALUE,
    min: DEFAULT_MIN_METRIC_VALUE,
    max: DEFAULT_MAX_METRIC_VALUE,
  },
  loyalty: {
    label: "Лояльность",
    icon: "👥",
    initial: DEFAULT_METRIC_VALUE,
    min: DEFAULT_MIN_METRIC_VALUE,
    max: DEFAULT_MAX_METRIC_VALUE,
  },
} satisfies Record<
  keyof Metrics,
  { label: string; icon: string; initial: number; min: number; max: number }
>;

// Ключи метрик для итерации
export const METRIC_KEYS = Object.keys(METRIC_DEFINITIONS) as (keyof Metrics)[];

// Нулевые метрики (для сброса)
export const ZERO_METRICS: Metrics = {
  influence: 0,
  credibility: 0,
  reputation: 0,
  loyalty: 0,
};

// Возвращает конфигурацию полосы по её номеру (tier)
export const getColumns = (tier: number) =>
  GAME_BALANCE.columns[tier as keyof typeof GAME_BALANCE.columns];

// Основные параметры баланса игры
export const GAME_BALANCE = {
  maxTurns: 42,
  showGameTime: false,
  weeklyMoneyGoals: [
    2_300, 3_050, 16_000, 50_000, 120_000, 250_000, 450_000, 700_000, 1_111_111,
  ],
  articlesPerPublication: 3,
  newsPerRoll: 30,
  initialJournalists: 3,
  maximumJournalists: 6,
  // Конфигурация полос газеты: название, количество слотов, множитель эффекта
  columns: {
    1: { title: "Главная полоса", slots: 1, multiplier: 2 },
    2: { title: "Вторая полоса", slots: 2, multiplier: 1 },
    3: { title: "Третья полоса", slots: 3, multiplier: 0.5 },
  },
  initialReaders: 13,
  initialMoney: 3000,
  minimumReaders: 0,
  minimumMoney: 0,
  // Keep early income modest; readership milestones make long-term growth pay off.
  moneyPerReaderPerHour: 2,
  readerIncomeGrowth: {
    readersPerMilestone: 400,
    incomePerReaderPerMilestone: 1,
  },
  // Почасовые ставки журналистов
  journalistHourlyWages: {
    ivan_petrov: 55,
    maria_sidorova: 55,
    alexey_kozlov: 70,
    elena_smirnova: 60,
    dmitry_volkov: 60,
    anna_kuznetsova: 35,
    sergey_morozov: 80,
    olga_fedorova: 70,
    pavel_ivanov: 90,
    natalia_popova: 70,
    victor_sokolov: 45,
    ekaterina_nikolaeva: 75,
    andrey_romanov: 65,
    marina_alexeeva: 60,
    igor_lebedev: 85,
    tatyana_vasilieva: 65,
    maxim_golubev: 80,
    yulia_semenova: 40,
    konstantin_borisov: 55,
    veronika_mikhailova: 45,
    lidia_smirnova: 105,
    boris_sokolov: 115,
    vera_orlova: 100,
    roman_zhukov: 110,
    sofia_belova: 125,
    oleg_kravtsov: 95,
    polina_lebedeva: 105,
    artem_volkov: 135,
    kirill_melnikov: 75,
    mila_grigorieva: 85,
    vlad_smirnov: 90,
    irina_kiseleva: 100,
    timur_safiullin: 125,
  },
  // Параметры для расчёта бонусов журналистов
  journalistBonuses: {
    sameCategorySynergy: { metricScale: 0.5 },
    morningEdition: { startHour: 9, endHour: 12, credibility: 3 },
    eveningSports: {
      startHour: 16,
      endHour: 18,
      loyalty: 5,
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
    publicTrust: { minimumCredibility: 50, credibility: 2 },
    diverseNewsroom: { minimumCategories: 3, influence: 5 },
    editorialTeamwork: { credibilityPerColleague: 1 },
    carefulSourcing: {
      categories: ["science", "education", "health"] as string[],
      credibility: 4,
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
  // Веса для расчёта изменения аудитории
  audienceChange: {
    loyaltyEffect: 1.4,
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
    readershipGrowthEffect: 0.23,
  },
  // Параметры начала игры (дата и время)
  gameStart: {
    year: 1600,
    month: 0,
    day: 30,
    firstWorkingHour: 9,
    lastWorkingHour: 18,
  },
  publicationTimeAdvanceMinutes: { min: 50, max: 80 },
  // Параметры автоплея
  autoPlay: {
    actionDelayMs: 550,
    resultDisplayMs: 700,
    randomness: 2.5,
    hireReserveTurns: 5,
  },
  economySaveVersion: 1,
};

// Compress article effects into small, trade-off-driven changes. Journalist
// bonuses then reward specialization without letting every metric climb unchecked.
// Параметры нормализации эффектов новостей (ограничивают диапазон значений)
export const NEWS_EFFECT_BALANCE: Record<
  keyof Metrics,
  { min: number; max: number; scale: number; offset: number }
> = {
  influence: { min: -3, max: 4, scale: 0.55, offset: -0.25 },
  credibility: { min: -3, max: 3, scale: 0.35, offset: 0.3 },
  reputation: { min: -3, max: 4, scale: 0.45, offset: -0.3 },
  loyalty: { min: -1, max: 4, scale: 0.15, offset: -0.7 },
};

// Нормализует эффекты новостей в заданные диапазоны
export function normalizeNewsEffects(effects: Metrics): Metrics {
  return METRIC_KEYS.reduce(
    (balanced, key) => {
      const { min, max, scale, offset } = NEWS_EFFECT_BALANCE[key];
      balanced[key] = Math.max(
        min,
        Math.min(max, Math.round(effects[key] * scale + offset)),
      );
      return balanced;
    },
    { ...ZERO_METRICS },
  );
}

// Загружает dev-конфигурацию из localStorage при инициализации
function loadSavedGlobalConfig(): void {
  try {
    const saved = localStorage.getItem(GLOBAL_CONFIG_STORAGE_KEY);
    if (!saved) return;

    const config: unknown = JSON.parse(saved);
    if (!isConfigRecord(config)) return;

    mergeKnownConfig(METRIC_DEFINITIONS as ConfigRecord, config.metrics);
    mergeKnownConfig(GAME_BALANCE as ConfigRecord, config.game);
    mergeKnownConfig(NEWS_EFFECT_BALANCE as ConfigRecord, config.news);
  } catch (error) {
    console.error("Не удалось загрузить dev-конфигурацию игры:", error);
  }
}

loadSavedGlobalConfig();

// Начальные значения метрик
export const INITIAL_METRICS: Metrics = {
  influence: METRIC_DEFINITIONS.influence.initial,
  credibility: METRIC_DEFINITIONS.credibility.initial,
  reputation: METRIC_DEFINITIONS.reputation.initial,
  loyalty: METRIC_DEFINITIONS.loyalty.initial,
};

// Минимальное и максимальное значения статов
export const MIN_VALUE_STAT = METRIC_DEFINITIONS.influence.min;
export const MAX_VALUE_STAT = METRIC_DEFINITIONS.influence.max;

// Экспортированные константы для удобства
export const INITIAL_READERS = GAME_BALANCE.initialReaders;
export const INITIAL_MONEY = GAME_BALANCE.initialMoney;
export const ECONOMY_SAVE_VERSION = GAME_BALANCE.economySaveVersion;
export const MIN_PUBLICATION_TIME_ADVANCE_MINUTES =
  GAME_BALANCE.publicationTimeAdvanceMinutes.min;
export const MAX_PUBLICATION_TIME_ADVANCE_MINUTES =
  GAME_BALANCE.publicationTimeAdvanceMinutes.max;

// Ограничивает значение метрики в допустимом диапазоне
export function clampMetric(value: number, key?: keyof Metrics): number {
  const bounds = key ? METRIC_DEFINITIONS[key] : undefined;
  return Math.max(
    bounds?.min ?? MIN_VALUE_STAT,
    Math.min(bounds?.max ?? MAX_VALUE_STAT, value),
  );
}

// Возвращает множитель эффекта для полосы (tier)
export function getTierMultiplier(tier: number): number {
  return getColumns(tier)?.multiplier ?? GAME_BALANCE.columns[3].multiplier;
}

// Рассчитывает изменение аудитории на основе метрик публикации
// Учитывает текущую аудиторию, эффект метрик и качество редакции
export function calculateAudienceChange(
  currentMetrics: Metrics,
  result: Metrics,
  currentReaders = GAME_BALANCE.initialReaders,
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
  // Качество редакции - взвешенная сумма нормализованных метрик
  const editorialQuality =
    normalizeMetric("influence", finalMetrics.influence) *
      weights.influenceQuality +
    normalizeMetric("credibility", finalMetrics.credibility) *
      weights.credibilityQuality +
    normalizeMetric("reputation", finalMetrics.reputation) *
      weights.reputationQuality;

  // Изменение аудитории, вызванное метриками
  const metricDrivenChange =
    result.loyalty * weights.loyaltyEffect +
    result.influence * weights.influenceEffect +
    result.credibility * weights.credibilityEffect +
    result.reputation * weights.reputationEffect +
    (editorialQuality - weights.editorialQualityBaseline) *
      weights.qualityEffect +
    (normalizeMetric("loyalty", finalMetrics.loyalty) -
      weights.loyaltyBaseline) *
      weights.loyaltyLevelScale *
      weights.loyaltyLevelEffect;
  // Множитель роста аудитории (чем больше читателей, тем сильнее эффект)
  const readershipMultiplier =
    // Stronger loyalty campaigns compound with the size of the existing audience.
    1 +
    Math.log2(1 + Math.max(0, currentReaders) / GAME_BALANCE.initialReaders) *
      weights.readershipGrowthEffect;

  return Math.round(metricDrivenChange * readershipMultiplier);
}

// Создаёт начальное игровое время (случайное время в рабочие часы первого дня)
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

// Возвращает случайное время продвижения игры между публикациями (в миллисекундах)
export function getRandomPublicationTimeAdvance(
  randomValue = Math.random(),
): number {
  const { min, max } = GAME_BALANCE.publicationTimeAdvanceMinutes;
  return (min + Math.floor(randomValue * (max - min + 1))) * 60_000;
}
