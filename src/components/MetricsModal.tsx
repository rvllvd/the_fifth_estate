import { useEffect, useState } from 'react';
import type { Metrics } from '../types';

interface Props {
  result: Metrics;
  onClose: () => void;
  /** Через сколько мс автозакрыть (0 — не закрывать) */
  autoCloseMs?: number;
}

const ICONS: Record<keyof Metrics, string> = {
  influence: '📈',
  credibility: '🎯',
  budget: '💰',
  readership: '👥',
};

const NAMES: Record<keyof Metrics, string> = {
  influence: 'Влияние',
  credibility: 'Доверие',
  budget: 'Бюджет',
  readership: 'Читатели',
};

const KEYS: (keyof Metrics)[] = ['influence', 'credibility', 'budget', 'readership'];

export default function MetricsModal({ result, onClose, autoCloseMs = 2000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState<Metrics>({
    influence: 0,
    credibility: 0,
    budget: 0,
    readership: 0,
  });

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

      setDisplayed({
        influence: Math.round(result.influence * easeOut),
        credibility: Math.round(result.credibility * easeOut),
        budget: Math.round(result.budget * easeOut),
        readership: Math.round(result.readership * easeOut),
      });

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
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [autoCloseMs, onClose]);

  return (
    <div className={`metrics-modal ${visible ? 'show' : ''}`}>
      <div className="metrics-modal-content">
        <div className="metrics-modal-title">📰 Публикация газеты</div>

        <div className="metrics-animation">
          {KEYS.map((key) => {
            const delta = result[key];
            const shown = displayed[key];
            const cls = delta > 0 ? 'positive' : delta < 0 ? 'negative' : '';
            return (
              <div key={key} className={`metric-change ${cls}`} data-metric={key}>
                <span className="metric-icon">{ICONS[key]}</span>
                <span className="metric-name">{NAMES[key]}</span>
                <span className="metric-value">
                  {shown > 0 ? '+' : ''}{shown}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}