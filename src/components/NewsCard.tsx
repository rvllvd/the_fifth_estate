// import { ALL_SLOTS } from "../constants/game";
import { METRIC_LABELS, metricKeys } from "../constants/stats";
import { useGameStore } from "../store/gameStore";
// import { useNewsStore } from "../store";
import type { NewsItem } from "../types";
// import PlacedNewsCard from "./PlacedNewsCard";

interface Props {
  news: NewsItem;
  placed: boolean;
  // onClickNews?: (news: NewsItem) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  politics: "Политика",
  sports: "Спорт",
  tech: "Технологии",
  life: "Жизнь",
};

export default function NewsCard({ news, placed }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    if (placed) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/json", JSON.stringify(news));
    e.dataTransfer.effectAllowed = "move";
  };

  const clickNews = useGameStore((s) => s.clickNews);
  // const dropNews = useNewsStore((s) => s.dropNews);

  const effects = metricKeys().map((key) => ({
    icon: METRIC_LABELS[key][0],
    value: news.effects[key],
  }));

  return (
    <div
      className={`news-item ${placed ? "placed" : ""}`}
      data-news-id={news.id}
      data-category={news.category}
      draggable={!placed}
      onDragStart={handleDragStart}
      onClick={() => clickNews(news)}
      //   style={placed ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
    >
      <div className="news-header">
        <span className="news-title">{news.title}</span>
        <span className="news-tag">
          {CATEGORY_NAMES[news.category] ?? news.category}
        </span>
      </div>
      <div className="news-content">{news.content}</div>
      <div className="news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect">
            {e.icon} {e.value > 0 ? "+" : ""}
            {e.value}
          </span>
        ))}
      </div>
    </div>
  );
}
