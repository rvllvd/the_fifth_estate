import PlacedNewsCard from './PlacedNewsCard';
import type { NewsItem, PlacedNews } from '../types';
import { getNewsById } from '../data/news';

interface Props {
  tier: number;
  title: string;
  slotsCount: number;
  multiplier: number;
  placedNews: PlacedNews[];
  onDropNews: (key: string, news: NewsItem) => void;
  onRemove: (newsId: string) => void;
}

export default function NewspaperColumn({
  tier,
  title,
  slotsCount,
  multiplier,
  placedNews,
  onDropNews,
  onRemove,
}: Props) {
  const className =
    tier === 1 ? 'newspaper-column main-column'
    : tier === 2 ? 'newspaper-column second-tier'
    : 'newspaper-column third-tier';

  const placedBySlot: Record<number, NewsItem> = {};
  for (const p of placedNews.filter((x) => x.tier === tier)) {
    const news = getNewsById(p.newsId);
    if (news) placedBySlot[p.slot] = news;
  }

  return (
    <div
      className={className}
      data-tier={tier}
      data-max-slots={slotsCount}
      data-multiplier={multiplier}
    >
      <div className="column-header">{title}</div>
      <div className="column-slots">
        {Array.from({ length: slotsCount }).map((_, i) => {
          const key = `${tier}-${i}`;
          const news = placedBySlot[i];

          return (
            <div
              key={key}
              className={`empty-slot ${news ? 'filled' : ''}`}
              data-slot={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const raw = e.dataTransfer.getData('application/json');
                if (!raw) return;
                try {
                  const parsed: NewsItem = JSON.parse(raw);
                  onDropNews(key, parsed);
                } catch {/* ignore */}
              }}
            >
              {news ? (
                <PlacedNewsCard news={news} tier={tier} onRemove={() => onRemove(news.id)} />
              ) : (
                <div className="slot-placeholder">
                  <p>Перетащите новость сюда</p>
                  <p>Колонка {["первая", "вторая", "третья"][tier-1]}</p>
                  <p>Множетель { [2,1,0.5][tier-1] }X</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}