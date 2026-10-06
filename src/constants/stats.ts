import type { Metrics, Resources, Stats } from "../types";

export const METRIC_LABELS = {
  influence: ["📈", "Влияние"],
  credibility: ["🎯", "Доверие"],
  budget: ["💰", "Бюджет"],
  readership: ["👥", "Лояльность"],
} satisfies Record<keyof Metrics, [string, string]>;

export const RESOURCE_LABELS = {
  money: ["💵", "Деньги"],
  readers: ["📰", "Читатели"],
} satisfies Record<keyof Resources, [string, string]>;

export const STAT_LABELS = {
  ...METRIC_LABELS,
  ...RESOURCE_LABELS,
} satisfies Record<keyof Stats, [string, string]>;

export function metricKeys(): (keyof Metrics)[] {
  return Object.keys(METRIC_LABELS) as (keyof Metrics)[];
}

export function resourcesKeys(): (keyof Resources)[] {
  return Object.keys(RESOURCE_LABELS) as (keyof Resources)[];
}

export function statsKeys(): (keyof Stats)[] {
  return Object.keys(STAT_LABELS) as (keyof Stats)[];
}
