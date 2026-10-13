import { useLayoutEffect, useRef } from "react";
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
  const titleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const titleElement = titleRef.current;
    const textElement = titleElement?.firstElementChild as HTMLElement | null;
    if (!titleElement || !textElement) return;

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
        const textWidth = textElement.scrollWidth;
        if (!baseFontSize || !availableWidth || !textWidth) return;

        lastAvailableWidth = availableWidth;
        const fittedFontSize = Math.min(
          baseFontSize,
          (baseFontSize * availableWidth) / textWidth,
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
  }, [news.title, tier]);

  return (
    <div className="placed-news" data-news-id={news.id} data-tier={tier}>
      <div className="placed-news-header">
        <span className="placed-news-title" ref={titleRef}>
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
