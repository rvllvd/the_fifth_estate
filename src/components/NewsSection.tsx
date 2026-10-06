import NewsCard from "./NewsCard";
import type { Journalist, NewsItem } from "../types";

interface Props {
  news: NewsItem[];
  placedNewsIds: Set<string>;
  canPublish: boolean;
  placedCount: number;
  journalists: Journalist[];
  onPublish: () => void;
  onClear: () => void;
}

export default function NewsSection({
  news,
  placedNewsIds,
  canPublish,
  placedCount,
  journalists,
  onPublish,
  onClear,
}: Props) {
  const coveredCategories = new Set(journalists.map((j) => j.spec));

  return (
    <div className="panel-section" id="news-section">
      <div className="panel-title">📰 Новости для публикации</div>

      <div className="news-list" id="news-list">
        {news
          .filter((n) => coveredCategories.has(n.category))
          .map((n) => (
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
