import { METRIC_LABELS, metricKeys } from "../constants/stats";
import { getJournalistById } from "../data/journalists";
import type { NewsItem } from "../types";
import { getTierMultiplier } from "../utils/game";

interface Props {
  news: NewsItem;
  tier: number;
  onRemove: () => void;
}

export default function PlacedNewsCard({ news, tier, onRemove }: Props) {
  const m = getTierMultiplier(tier);
  const effects = metricKeys().map((key) => {
    const [icon, label] = METRIC_LABELS[key];
    return {
      label: `${icon} ${label}`,
      value: Math.round(news.effects[key] * m),
    };
  });

  return (
    <div className="placed-news" data-news-id={news.id} data-tier={tier}>
      <div className="placed-news-header">
        <span className="placed-news-title">{news.title}</span>
        <button className="remove-news-btn" onClick={onRemove}>
          ×
        </button>
      </div>
      <div className="placed-news-content">{news.content}</div>
      <div className="placed-news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect">
            {e.label}: {e.value}
          </span>
        ))}
        <span className="placed-news-author">
          {news.journalistId &&
            `👤 Автор: ${getJournalistById(news.journalistId)?.name}`}
        </span>
      </div>
    </div>
  );
}
