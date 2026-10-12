import type { Metrics } from "../types";
import { METRIC_DEFINITIONS } from "../constants/global";

interface Props {
  metricKey: keyof Metrics;
  icon: string;
  label: string;
  value: number;
  preview?: number;
}

export default function Metric({ metricKey, icon, label, value, preview }: Props) {
  const { min, max } = METRIC_DEFINITIONS[metricKey];
  const fill = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="metric">
      <span className="metric-label">
        {icon} {label}
      </span>
      <div className="metric-value-container">
        <span className="metric-value">{value}</span>
        {preview !== undefined && preview !== 0 && (
          <span
            className={`metric-preview ${preview > 0 ? "positive" : "negative"}`}
          >
            {preview > 0 ? "+" : ""}
            {preview}
          </span>
        )}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${fill}%` }}
          />
        </div>
      </div>
    </div>
  );
}
