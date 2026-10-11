import type { Metrics } from "../types";

export const MAX_VALUE_STAT = 100;

export const STAT_LABELS: Record<keyof Metrics, string> = {
  influence: "Влияние",
  credibility: "Доверие",
  budget: "Бюджет",
  readership: "Читатели",
};

export const STAT_ICONS: Record<keyof Metrics, string> = {
  influence: "📈",
  credibility: "🎯",
  budget: "💰",
  readership: "👥",
};

// Для обратной совместимости
export const METRIC_LABELS: Record<keyof Metrics, [string, string]> = {
  influence: ["📈", "Влияние"],
  credibility: ["🎯", "Доверие"],
  budget: ["💰", "Бюджет"],
  readership: ["👥", "Читатели"],
};

export function metricKeys(): (keyof Metrics)[] {
  return Object.keys(STAT_LABELS) as (keyof Metrics)[];
}
