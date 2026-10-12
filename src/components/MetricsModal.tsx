import { useEffect, useRef, useState } from "react";
import type { Metrics } from "../types";
import { METRIC_LABELS, metricKeys } from "../constants/stats";
import { entries } from "../helpers/object";
import type { NewsContribution } from "../types";
import NewsMetricBreakdown from "./NewsMetricBreakdown";

interface Props {
  result: Metrics;
  contributions: NewsContribution[];
  onClose: () => void;
  /** Через сколько мс автозакрыть (0 — не закрывать) */
  autoCloseMs?: number;
}

export default function MetricsModal({
  result,
  contributions,
  onClose,
  autoCloseMs = 2000,
}: Props) {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [displayed, setDisplayed] = useState<Metrics>(() =>
    metricKeys().reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Metrics),
  );

  // Плавное появление модалки (opacity 0 → 1 через .show)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Анимация чисел: от 0 до result[key] за 1000ms с easing
  useEffect(() => {
    const startTime = performance.now();
    const duration = 1000;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setDisplayed(
        metricKeys().reduce((acc, key) => {
          acc[key] = Math.round(result[key] * easeOut);
          return acc;
        }, {} as Metrics),
      );

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  // Автозакрытие
  useEffect(() => {
    if (!autoCloseMs) return;
    const t = setTimeout(() => onCloseRef.current(), autoCloseMs);
    return () => clearTimeout(t);
  }, [autoCloseMs]);

  return (
    <div className={`metrics-modal ${visible ? "show" : ""}`}>
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
                className={`metric-change ${cls}`}
                data-metric={key}
              >
                <span className="metric-icon">{icon}</span>
                <span className="metric-name">{name}</span>
                <span className="metric-value">
                  {shown > 0 ? "+" : ""}
                  {shown}
                </span>
              </div>
            );
          })}
        </div>
        <div className="metrics-news-contributions">
          {contributions.map((contribution) => (
            <div className="metrics-news-contribution" key={contribution.newsId}>
              <strong>
                {contribution.title} · полоса {contribution.tier}
              </strong>
              <NewsMetricBreakdown contribution={contribution} alwaysShow />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
