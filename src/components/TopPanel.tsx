import Metric from "./Metric";
import type { Metrics } from "../types";
import { STAT_LABELS, STAT_ICONS } from "../constants/stats";
import { MONEY_PER_READER_PER_TURN } from "../constants/economy";
import { formatMoney } from "../utils/economy";

const GAME_TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

interface Props {
  metrics: Metrics;
  gameTime: number;
  onNewGame: () => void;
  preview: Metrics;
  readers: number;
  money: number;
  readerChangePreview: number | null;
  moneyChangePreview: number | null;
  payroll: number;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
}

export default function TopPanel({
  metrics,
  gameTime,
  onNewGame,
  preview,
  readers,
  money,
  readerChangePreview,
  moneyChangePreview,
  payroll,
  onOpenStatistics,
  onOpenSettings,
}: Props) {
  const hasPreview = true; // Object.values(preview).some((v) => v !== 0);
  const keys = Object.keys(STAT_LABELS) as (keyof Metrics)[];
  const formattedGameTime = GAME_TIME_FORMATTER.format(gameTime);

  return (
    <div id="top-panel">
      <div className="game-clock" aria-label="Игровое время">
        <span className="game-clock-label">Время</span>
        <time dateTime={new Date(gameTime).toISOString()}>
          {formattedGameTime}
        </time>
      </div>
      <div className="metrics">
        {keys.map((key) => {
          const icon = STAT_ICONS[key];
          const label = STAT_LABELS[key];
          return (
            <Metric
              key={key}
              icon={icon}
              label={label}
              value={metrics[key]}
              preview={preview[key]}
            />
          );
        })}
      </div>

      <div className="top-panel-economy">
        <div className="resource-display" id="readers-display">
          <strong>{formatMoney(readers)}</strong>
          {readerChangePreview !== null && readerChangePreview !== 0 && (
            <span className={readerChangePreview > 0 ? "positive" : "negative"}>
              {readerChangePreview > 0 ? "+" : ""}
              {formatMoney(readerChangePreview)} после выпуска
            </span>
          )}
          <span className="resource-label">👥 Читатели</span>
        </div>

        <div id="metrics-preview">
          {hasPreview && (
            <div className="preview-line">
              <span></span>
              {keys.map((key) => {
                const value = preview[key];
                // if (value === 0) return null;
                const icon = STAT_ICONS[key];
                return (
                  <span
                    key={key}
                    className={value > 0 ? "positive" : "negative"}
                  >
                    {icon} {value > 0 ? "+" : ""}
                    {value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="resource-display" id="money-display">
          {/* <span className="resource-label">💵 Деньги</span> */}
          <strong>💵 ${formatMoney(money)}</strong>
          <span className="resource-flow">
            +${formatMoney(readers * MONEY_PER_READER_PER_TURN)} доход · −$
            {formatMoney(payroll)} зарплата / час
          </span>
          {moneyChangePreview !== null && moneyChangePreview !== 0 && (
            <span className={moneyChangePreview > 0 ? "positive" : "negative"}>
              {moneyChangePreview > 0 ? "+" : ""}$
              {formatMoney(moneyChangePreview)} после выпуска
            </span>
          )}
        </div>
      </div>

      <div className="top-panel-actions">
        {/* <button className="right-btn" id="upgrade-btn">
          Улучшения
        </button> */}
        <button className="right-btn" id="stat-btn" onClick={onOpenStatistics}>
          Статистика
        </button>
        <button
          className="right-btn"
          id="settings-btn"
          onClick={onOpenSettings}
        >
          Настройки
        </button>
        <button className="right-btn" id="new-game-btn" onClick={onNewGame}>
          Новая игра
        </button>
      </div>
    </div>
  );
}
