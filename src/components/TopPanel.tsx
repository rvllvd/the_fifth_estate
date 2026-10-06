import Metric from "./Metric";
import type { GameState, Metrics } from "../types";
import { METRIC_LABELS, metricKeys } from "../constants/stats";

interface Props {
  metrics: GameState;
  onNewGame: () => void;
  preview: Metrics;
}

export default function TopPanel({ metrics, onNewGame, preview }: Props) {
  const hasPreview = Object.values(preview).some((v) => v !== 0);

  return (
    <div id="top-panel">
      <div className="metrics">
        {metricKeys().map((key) => {
          const [icon, label] = METRIC_LABELS[key];
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
            {metricKeys().map((key) => {
              const value = preview[key];
              if (value === 0) return null;
              const [icon] = METRIC_LABELS[key];
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
        <button className="right-btn" id="upgrade-btn">
          Улучшения
        </button>
        <button className="right-btn" id="stat-btn">
          Статистика
        </button>
        <button className="right-btn" id="new-game-btn" onClick={onNewGame}>
          Новая игра
        </button>
      </div>
    </div>
  );
}
