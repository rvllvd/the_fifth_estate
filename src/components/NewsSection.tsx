import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
import type { Journalist, NewsItem } from "../types";
import { getNewsCategoryLabel } from "../constants/categories";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const coveredCategories = new Set(journalists.map((j) => j.spec));
  const availableNews = news.filter(
    (item) =>
      coveredCategories.has(item.category) && !placedNewsIds.has(item.id),
  );
  const categories = [...new Set(availableNews.map((item) => item.category))];
  const categoryKey = categories.join("|");
  const selectedCategory = categories.includes(activeCategory)
    ? activeCategory
    : "all";

  useEffect(() => {
    if (activeCategory !== "all" && !categories.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [activeCategory, categoryKey]);

  return (
    <div className="panel-section" id="news-section">
      <div className="panel-title">📰 Новости для публикации</div>

      <div className="news-categories" aria-label="Фильтр новостей по категориям">
        <button
          className={`category-btn${selectedCategory === "all" ? " active" : ""}`}
          type="button"
          aria-pressed={selectedCategory === "all"}
          onClick={() => setActiveCategory("all")}
        >
          Все
        </button>
        {categoriesExpanded &&
          categories.map((category) => (
            <button
              key={category}
              className={`category-btn${selectedCategory === category ? " active" : ""}`}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {getNewsCategoryLabel(category)}
            </button>
          ))}
        {categories.length > 0 && (
          <button
            className="toggle-categories-btn"
            type="button"
            aria-expanded={categoriesExpanded}
            onClick={() => {
              setCategoriesExpanded((expanded) => {
                if (expanded) setActiveCategory("all");
                return !expanded;
              });
            }}
          >
            {categoriesExpanded ? "Скрыть категории" : "Показать категории"}
          </button>
        )}
      </div>

      <div className="news-list" id="news-list">
        {availableNews
          .filter(
            (item) =>
              selectedCategory === "all" ||
              item.category === selectedCategory,
          )
          .map((n, index) => (
            <NewsCard
              key={n.id}
              news={n}
              placed={placedNewsIds.has(n.id)}
              active={
                journalists.filter((j) => j.spec == n.category && !j.newsId)
                  .length > 0
              }
              style={{ "--index": index } as React.CSSProperties}
            />
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
