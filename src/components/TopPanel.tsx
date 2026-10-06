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
            {preview.influence !== 0 && (
              <span className={preview.influence > 0 ? "positive" : "negative"}>
                📈 {preview.influence > 0 ? "+" : ""}
                {preview.influence}
              </span>
            )}
            {preview.credibility !== 0 && (
              <span
                className={preview.credibility > 0 ? "positive" : "negative"}
              >
                🎯 {preview.credibility > 0 ? "+" : ""}
                {preview.credibility}
              </span>
            )}
            {preview.budget !== 0 && (
              <span className={preview.budget > 0 ? "positive" : "negative"}>
                💰 {preview.budget > 0 ? "+" : ""}
                {preview.budget}
              </span>
            )}
            {preview.readership !== 0 && (
              <span
                className={preview.readership > 0 ? "positive" : "negative"}
              >
                👥 {preview.readership > 0 ? "+" : ""}
                {preview.readership}
              </span>
            )}
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
