import Metric from "./Metric";
import type { Metrics } from "../types";
import { STAT_LABELS, STAT_ICONS } from "../constants/stats";

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
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
}

export default function TopPanel({
  metrics,
  gameTime,
  onNewGame,
  preview,
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

      <div id="metrics-preview">
        {hasPreview && (
          <div className="preview-line">
            <span></span>
            {keys.map((key) => {
              const value = preview[key];
              // if (value === 0) return null;
              const icon = STAT_ICONS[key];
              return (
                <span key={key} className={value > 0 ? "positive" : "negative"}>
                  {icon} {value > 0 ? "+" : ""}
                  {value}
                </span>
              );
            })}
          </div>
        )}
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
