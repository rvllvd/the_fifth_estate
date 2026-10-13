// // import { METRIC_LABELS, metricKeys } from "../constants/stats";
import type { Journalist } from "../types";
import DancingText from "./DancingText";

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
      <div className="staff-info" title={bonus && desc ? desc : "Нет бонуса"}>
        <span className="staff-name">
          <DancingText text={journalist.name} />
        </span>
        <span className="staff-role">{journalist.role}</span>
      </div>
      {/* <div className="staff-stats">
        {bonus && desc && <span className="staff-stat">{desc}</span>}
      </div> */}
    </div>
  );
}
