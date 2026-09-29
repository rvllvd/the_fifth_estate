import type { NewsItem } from '../types';
import { getTierMultiplier } from '../utils/game_logic';

interface Props {
  news: NewsItem;
  tier: number;
  onRemove: () => void;
}

export default function PlacedNewsCard({ news, tier, onRemove }: Props) {
  const m = getTierMultiplier(tier);
  const effects = [
    { label: '📈 Влияние', value: Math.round(news.effects.influence * m) },
    { label: '🎯 Доверие', value: Math.round(news.effects.credibility * m) },
    { label: '💰 Бюджет', value: Math.round(news.effects.budget * m) },
    { label: '👥 Читатели', value: Math.round(news.effects.readership * m) },
  ];

  return (
    <div className="placed-news" data-news-id={news.id} data-tier={tier}>
      <div className="placed-news-header">
        <span className="placed-news-title">{news.title}</span>
        <button className="remove-news-btn" onClick={onRemove}>×</button>
      </div>
      <div className="placed-news-content">{news.content}</div>
      <div className="placed-news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect">
            {e.label}: {e.value}
          </span>
        ))}
      </div>
    </div>
  );
}