// // import { METRIC_LABELS, metricKeys } from "../constants/stats";
import type { Journalist } from "../types";

interface Props {
  journalist: Journalist;
  style?: React.CSSProperties;
}

export default function StaffCard({ journalist, style }: Props) {
  const { bonus, desc } = journalist;

  return (
    <div
      className={`staff-card ${journalist.newsId ? "active" : ""}`}
      style={style}
    >
      <div className="staff-info">
        <span className="staff-name">{journalist.name}</span>
        <span className="staff-role">{journalist.role}</span>
      </div>
      <div className="staff-stats">
        {/* {metricKeys().map((key) => {
          const value = bonus[key];
          const [icon] = METRIC_LABELS[key];
          return (
            <span key={key} className="staff-stat">
              {icon} {value > 0 ? "+" : ""}
              {value}
            </span>
          );
        })} */}
        {bonus && desc && <span className="staff-stat">{desc}</span>}
      </div>
    </div>
  );
}
