import type { Metrics } from "../types";

export const MAX_VALUE_STAT = 100;

export const STAT_LABELS: Record<keyof Metrics, string> = {
  influence: "Влияние",
  credibility: "Доверие",
  reputation: "Репутация",
  readership: "Читатели",
};

export const STAT_ICONS: Record<keyof Metrics, string> = {
  influence: "📈",
  credibility: "🎯",
  reputation: "💰",
  readership: "👥",
};

export const METRIC_LABELS: Record<keyof Metrics, [string, string]> = Object.fromEntries(
  (Object.keys(STAT_LABELS) as (keyof Metrics)[]).map((key) => [
    key,
    [STAT_ICONS[key], STAT_LABELS[key]],
  ]),
) as Record<keyof Metrics, [string, string]>;

export function metricKeys(): (keyof Metrics)[] {
  return Object.keys(STAT_LABELS) as (keyof Metrics)[];
}
