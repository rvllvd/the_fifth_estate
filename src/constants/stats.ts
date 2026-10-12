import type { Metrics } from "../types";

export const MAX_VALUE_STAT = 100;

export const STAT_ICONS: Record<keyof Metrics, string> = {
  influence: "📈",
  credibility: "🎯",
  reputation: "💰",
  readership: "👥",
};

export const STAT_LABELS: Record<keyof Metrics, string> = {
  influence: "Влияние",
  credibility: "Доверие",
  reputation: "Репутация",
  readership: "Лояность",
};

const DEFEAT_DESCRIPTIONS: Record<keyof Metrics, string> = {
  influence:
    "Влияние упало до нуля: ваши заявления больше никого не впечатляют. Даже пресс-секретарь теперь представляет только погоду.",
  credibility:
    "Говорят: доверяй, но проверяй. Проверили — доверия к вам больше нет, а газету не покупают даже ради проверки.",
  reputation:
    "Репутация редакции испорчена окончательно: теперь ваше имя упоминают только в предупреждениях рекламодателям.",
  readership:
    "Читатели разошлись по другим газетам. Похоже, последний экземпляр купили, чтобы подложить под шатающийся стол.",
};

export function getDefeatDescriptions(metrics: Metrics): string[] {
  return (Object.keys(STAT_LABELS) as (keyof Metrics)[])
    .filter((key) => metrics[key] <= 0)
    .map((key) => DEFEAT_DESCRIPTIONS[key]);
}

export const METRIC_LABELS: Record<keyof Metrics, [string, string]> =
  Object.fromEntries(
    (Object.keys(STAT_LABELS) as (keyof Metrics)[]).map((key) => [
      key,
      [STAT_ICONS[key], STAT_LABELS[key]],
    ]),
  ) as Record<keyof Metrics, [string, string]>;

export function metricKeys(): (keyof Metrics)[] {
  return Object.keys(STAT_LABELS) as (keyof Metrics)[];
}
