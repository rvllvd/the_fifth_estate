import type { Metrics } from "../types";
import { METRIC_DEFINITIONS, METRIC_KEYS } from "./global";

export { MAX_VALUE_STAT } from "./global";

export const STAT_ICONS: Record<keyof Metrics, string> = Object.fromEntries(
  METRIC_KEYS.map((key) => [key, METRIC_DEFINITIONS[key].icon]),
) as Record<keyof Metrics, string>;

export const STAT_LABELS: Record<keyof Metrics, string> = Object.fromEntries(
  METRIC_KEYS.map((key) => [key, METRIC_DEFINITIONS[key].label]),
) as Record<keyof Metrics, string>;

const DEFEAT_DESCRIPTIONS: Record<keyof Metrics, string> = {
  influence:
    "Влияние упало до нуля: ваши заявления больше никого не впечатляют. Даже пресс-секретарь теперь представляет только погоду.",
  credibility:
    "Говорят: доверяй, но проверяй. Проверили — доверия к вам больше нет, а газету не покупают даже ради проверки.",
  reputation:
    "Репутация редакции испорчена окончательно: теперь ваше имя упоминают только в предупреждениях рекламодателям.",
  loyalty:
    "Читатели разошлись по другим газетам. Похоже, последний экземпляр купили, чтобы подложить под шатающийся стол.",
};

export function getDefeatDescriptions(metrics: Metrics): string[] {
  return METRIC_KEYS.filter(
    (key) => metrics[key] <= METRIC_DEFINITIONS[key].min,
  ).map((key) => DEFEAT_DESCRIPTIONS[key]);
}

export const METRIC_LABELS: Record<keyof Metrics, [string, string]> =
  Object.fromEntries(
    (Object.keys(STAT_LABELS) as (keyof Metrics)[]).map((key) => [
      key,
      [STAT_ICONS[key], STAT_LABELS[key]],
    ]),
  ) as Record<keyof Metrics, [string, string]>;

export function metricKeys(): (keyof Metrics)[] {
  return METRIC_KEYS;
}
