import NewsCard from './NewsCard';
import type { NewsItem } from '../types';

interface Props {
  news: NewsItem[];
  placedNewsIds: Set<string>;
  canPublish: boolean;
  placedCount: number;
  onPublish: () => void;
  onClear: () => void;
}

export default function NewsSection({
  news,
  placedNewsIds,
  canPublish,
  placedCount,
  onPublish,
  onClear,
}: Props) {
  return (
    <div className="panel-section" id="news-section">
      <div className="panel-title">📰 Новости для публикации</div>

      <div className="news-list" id="news-list">
        {news.map((n) => (
          <NewsCard key={n.id} news={n} placed={placedNewsIds.has(n.id)} />
        ))}
      </div>

      <button
        className="action-btn"
        id="publish-btn"
        disabled={!canPublish}
        onClick={onPublish}
      >
        Опубликовать ({placedCount})
      </button>
      <button className="action-btn" id="clear-btn" onClick={onClear}>
        Отчистить
      </button>
    </div>
  );
}