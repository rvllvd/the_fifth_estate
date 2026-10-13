import { STAT_ICONS, STAT_LABELS } from "../constants/stats";
import type { NewsContribution, NewsItem } from "../types";
import { getTierMultiplier } from "../utils/game";
import DancingText from "./DancingText";
import NewsMetricBreakdown from "./NewsMetricBreakdown";

interface Props {
  news: NewsItem;
  tier: number;
  contribution?: NewsContribution;
  onRemove: () => void;
}

export default function PlacedNewsCard({
  news,
  tier,
  contribution,
  onRemove,
}: Props) {
  const m = getTierMultiplier(tier);
  const keys = Object.keys(STAT_LABELS) as (keyof typeof STAT_ICONS)[];
  const effects = keys.map((key) => {
    const icon = STAT_ICONS[key];
    return {
      // label: `${icon} ${label}`,
      label: icon,
      value: Math.round(news.effects[key] * m),
    };
  });

  return (
    <div className="placed-news" data-news-id={news.id} data-tier={tier}>
      <div className="placed-news-header">
        <span className="placed-news-title">
          <DancingText text={news.title} />
        </span>
        <button className="remove-news-btn" onClick={onRemove}>
          ×
        </button>
      </div>
      {/* <div className="placed-news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect">
            {e.label} {e.value > 0 ? "+" : ""}
            {e.value}
          </span>
        ))}
        
      </div> */}
      {contribution && (
        <NewsMetricBreakdown contribution={contribution} compact alwaysShow />
      )}
      <div className="placed-news-content">{news.content}</div>
      <span className="placed-news-author">
        {contribution?.journalistName &&
          `👤 Автор: ${contribution.journalistName}`}
      </span>
    </div>
  );
}
