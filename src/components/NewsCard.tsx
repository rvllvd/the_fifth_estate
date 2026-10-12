// import { ALL_SLOTS } from "../constants/game";
import { STAT_ICONS, STAT_LABELS } from "../constants/stats";
import { useGameStore } from "../store/gameStore";
// import { useNewsStore } from "../store";
import type { NewsItem } from "../types";
// import PlacedNewsCard from "./PlacedNewsCard";

interface Props {
  news: NewsItem;
  placed: boolean;
  active: boolean;
  style?: React.CSSProperties;
  // onClickNews?: (news: NewsItem) => void;
}

export default function NewsCard({ news, placed, active = true, style }: Props) {
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

  const keys = Object.keys(STAT_LABELS) as (keyof typeof STAT_ICONS)[];
  const effects = keys.map((key) => ({
    icon: STAT_ICONS[key],
    value: news.effects[key],
  }));

  return (
    <div
      className={`news-item ${placed ? "placed" : ""} ${active ? "active" : "unactive"}`}
      data-news-id={news.id}
      data-category={news.category}
      draggable={!placed}
      onDragStart={handleDragStart}
      onClick={() => clickNews(news)}
      style={style}
      //   style={placed ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
    >
      <div className="news-header">
        <span className="news-title">{news.title}</span>
        <span className="news-tag">{news.category}</span>
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
