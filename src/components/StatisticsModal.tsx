import type { PublicationLogEntry } from "../types";
import { METRIC_LABELS } from "../constants/stats";
import { entries } from "../helpers/object";
import { getNewsCategoryLabel } from "../constants/categories";

const PUBLICATION_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

interface Props {
  history: PublicationLogEntry[];
  onClose: () => void;
}

function formatChange(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

export default function StatisticsModal({ history, onClose }: Props) {
  return (
    <div className="statistics-modal modal show" onClick={onClose}>
      <div
        className="statistics-modal-content modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="statistics-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="statistics-modal-header modal-header">
          <h2 id="statistics-modal-title">Статистика публикаций</h2>
          <button
            className="close-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Закрыть статистику"
          >
            ×
          </button>
        </div>

        {history.length === 0 ? (
          <p className="statistics-empty">
            Пока нет опубликованных выпусков. История появится после первой
            публикации.
          </p>
        ) : (
          <div className="publication-history">
            {[...history].reverse().map((publication) => (
              <article className="publication-entry" key={publication.id}>
                <div className="publication-entry-header">
                  <h3>Выпуск №{publication.turn}</h3>
                  <time
                    dateTime={new Date(
                      publication.gameTime ?? publication.publishedAt,
                    ).toISOString()}
                  >
                    {PUBLICATION_DATE_FORMATTER.format(
                      publication.gameTime ?? publication.publishedAt,
                    )}
                  </time>
                </div>

                <ul className="publication-news-list">
                  {publication.news.map((news) => (
                    <li className="publication-news" key={news.newsId}>
                      <div className="publication-news-title">
                        <span>{news.title}</span>
                        <span className="publication-news-category">
                          {getNewsCategoryLabel(news.category)} · полоса{" "}
                          {news.tier}
                        </span>
                      </div>
                      <div className="publication-contributions">
                        {entries(METRIC_LABELS).map(([key, [icon]]) => (
                          <span
                            className={
                              news.metrics[key] > 0
                                ? "positive"
                                : news.metrics[key] < 0
                                  ? "negative"
                                  : ""
                            }
                            key={key}
                          >
                            {icon} {formatChange(news.metrics[key])}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="publication-total">
                  <strong>Итог выпуска</strong>
                  <div className="publication-contributions">
                    {entries(METRIC_LABELS).map(([key, [icon, label]]) => (
                      <span
                        className={
                          publication.result[key] > 0
                            ? "positive"
                            : publication.result[key] < 0
                              ? "negative"
                              : ""
                        }
                        key={key}
                        title={label}
                      >
                        {icon} {formatChange(publication.result[key])}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
