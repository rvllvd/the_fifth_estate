import type { NewsContribution, NewsItem } from "../types";
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
