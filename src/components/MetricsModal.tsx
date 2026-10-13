import { useEffect, useState } from "react";
import type { Metrics } from "../types";
import { METRIC_LABELS, metricKeys } from "../constants/stats";
import { entries } from "../helpers/object";
import type { NewsContribution } from "../types";
import NewsMetricBreakdown from "./NewsMetricBreakdown";

interface Props {
  result: Metrics;
  contributions: NewsContribution[];
  onClose: () => void;
}

export default function MetricsModal({
  result,
  contributions,
  onClose,
}: Props) {
  const [activeContribution, setActiveContribution] = useState(-1);
  const [displayed, setDisplayed] = useState<Metrics>(() =>
    metricKeys().reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Metrics),
  );

  // Суммирует вклад каждой новости по очереди, как отдельные шаги подсчёта.
  useEffect(() => {
    const duration = 420;
    const steps = contributions.length
      ? contributions.map((contribution) => contribution.final)
      : [result];
    let cumulative = metricKeys().reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Metrics);
    let stepIndex = 0;
    let startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentStep = steps[stepIndex];

      setDisplayed(
        metricKeys().reduce((acc, key) => {
          acc[key] = cumulative[key] + currentStep[key] * easeOut;
          return acc;
        }, {} as Metrics),
      );

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        cumulative = metricKeys().reduce((acc, key) => {
          acc[key] = cumulative[key] + currentStep[key];
          return acc;
        }, {} as Metrics);
        stepIndex += 1;

        if (stepIndex < steps.length) {
          setActiveContribution(stepIndex);
          startTime = now;
          raf = requestAnimationFrame(tick);
        } else {
          setDisplayed(result);
          setActiveContribution(-1);
        }
      }
    };

    setActiveContribution(contributions.length ? 0 : -1);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result, contributions]);

  return (
    <div className="metrics-modal show">
      <div className="metrics-modal-content">
        <div className="metrics-modal-title">📰 Публикация газеты</div>

        <div className="metrics-animation">
          {entries(METRIC_LABELS).map(([key, [icon, name]]) => {
            const delta = result[key];
            const shown = displayed[key];
            const cls = delta > 0 ? "positive" : delta < 0 ? "negative" : "";
            return (
              <div
                key={key}
                className={`metric-change ${cls}${activeContribution >= 0 ? " is-scoring" : ""}`}
                data-metric={key}
              >
                <span className="metric-icon" title={name}>
                  {icon}
                </span>
                <span className="metric-name">{name}</span>
                <span className="metric-value">
                  {shown > 0 ? "+" : ""}
                  {Math.round(shown)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="metrics-news-contributions">
          {contributions.map((contribution, index) => (
            <div
              className={`metrics-news-contribution${activeContribution === index ? " is-active" : ""}`}
              key={contribution.newsId}
              style={{ animationDelay: `${index * 0.42}s` }}
            >
              <strong>
                {contribution.title} · полоса {contribution.tier}
              </strong>
              <NewsMetricBreakdown contribution={contribution} alwaysShow />
            </div>
          ))}
        </div>
        <div className="metrics-modal-actions">
          <button className="right-btn" type="button" onClick={onClose}>
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
}
