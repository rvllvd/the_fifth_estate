import { useLayoutEffect, useRef } from "react";
// import { ALL_SLOTS } from "../constants/game";
import { STAT_ICONS, STAT_LABELS } from "../constants/stats";
import { getNewsCategoryLabel } from "../constants/categories";
import { useGameStore } from "../store/gameStore";
// import { useNewsStore } from "../store";
import type { NewsContribution, NewsItem } from "../types";
// import PlacedNewsCard from "./PlacedNewsCard";
import DancingText from "./DancingText";
import NewsMetricBreakdown from "./NewsMetricBreakdown";

function splitTitleIntoTwoLines(title: string): [string, string] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    const characters = Array.from(title);
    const middle = Math.ceil(characters.length / 2);
    return [
      characters.slice(0, middle).join(""),
      characters.slice(middle).join(""),
    ];
  }

  let bestSplit = 1;
  let smallestDifference = Infinity;
  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const difference = Math.abs(firstLine.length - secondLine.length);
    if (difference < smallestDifference) {
      bestSplit = index;
      smallestDifference = difference;
    }
  }

  return [
    words.slice(0, bestSplit).join(" "),
    words.slice(bestSplit).join(" "),
  ];
}

interface Props {
  news: NewsItem;
  placed: boolean;
  active: boolean;
  style?: React.CSSProperties;
  bonusPreview?: NewsContribution | null;
  // onClickNews?: (news: NewsItem) => void;
}

export default function NewsCard({
  news,
  placed,
  active = true,
  style,
  bonusPreview,
}: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    if (placed) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/json", JSON.stringify(news));
    e.dataTransfer.effectAllowed = "move";
  };

  const clickNews = useGameStore((s) => s.clickNews);
  const titleRef = useRef<HTMLSpanElement>(null);
  // const dropNews = useNewsStore((s) => s.dropNews);

  const keys = Object.keys(STAT_LABELS) as (keyof typeof STAT_ICONS)[];
  const effects = keys.map((key) => ({
    icon: STAT_ICONS[key],
    label: STAT_LABELS[key],
    value: news.effects[key],
  }));
  const titleLines = splitTitleIntoTwoLines(news.title);

  useLayoutEffect(() => {
    const titleElement = titleRef.current;
    if (!titleElement) return;

    const lineElements = Array.from(
      titleElement.querySelectorAll<HTMLElement>(".news-title-line"),
    );
    let animationFrame = 0;
    let lastAvailableWidth = 0;

    const fitTitle = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const availableWidth = titleElement.clientWidth;
        if (
          !availableWidth ||
          (availableWidth === lastAvailableWidth && titleElement.style.fontSize)
        ) {
          return;
        }

        titleElement.style.fontSize = "";
        const baseFontSize = Number.parseFloat(
          getComputedStyle(titleElement).fontSize,
        );
        const widestLine = Math.max(
          ...lineElements.map((line) => {
            const textElement = line.firstElementChild as HTMLElement | null;
            return textElement?.scrollWidth ?? line.scrollWidth;
          }),
        );
        if (!baseFontSize || !widestLine) return;

        lastAvailableWidth = availableWidth;
        const fittedFontSize = Math.min(
          baseFontSize,
          (baseFontSize * availableWidth) / widestLine,
        );
        titleElement.style.fontSize = `${fittedFontSize}px`;
      });
    };

    const observer = new ResizeObserver(fitTitle);
    observer.observe(titleElement);
    fitTitle();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [news.title]);

  return (
    <div
      className={`news-item ${placed ? "placed" : ""} ${active ? "active" : "unactive"}`}
      data-news-id={news.id}
      data-category={news.category}
      title={news.content}
      draggable={!placed}
      onDragStart={handleDragStart}
      onClick={() => clickNews(news)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          clickNews(news);
        }
      }}
      role="button"
      tabIndex={!placed && active ? 0 : -1}
      aria-pressed={placed}
      aria-label={`${news.title}. ${placed ? "Уже размещена" : "Разместить в выпуске"}`}
      style={style}
      //   style={placed ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
    >
      <div className="news-header">
        <span className="news-title" ref={titleRef}>
          {titleLines.map((line, index) => (
            <span className="news-title-line" key={index}>
              <DancingText text={line} allowWrapping />
            </span>
          ))}
        </span>
      </div>
      <div className="news-content">{news.content}</div>
      <div className="news-effects">
        {effects.map((e, i) => (
          <span key={i} className="effect" title={e.label}>
            {e.icon} {e.value > 0 ? "+" : ""}
            {e.value}
          </span>
        ))}
        <span className="news-tag">{getNewsCategoryLabel(news.category)}</span>
      </div>
      {bonusPreview && (
        <NewsMetricBreakdown contribution={bonusPreview} compact />
      )}
    </div>
  );
}
