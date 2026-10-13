import { METRIC_LABELS } from "../constants/stats";
import { entries } from "../helpers/object";
import type { NewsContribution } from "../types";

interface Props {
  contribution: NewsContribution;
  compact?: boolean;
  alwaysShow?: boolean;
}

function format(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

export default function NewsMetricBreakdown({
  contribution,
  compact = false,
  alwaysShow = false,
}: Props) {
  const hasBonus = Object.values(contribution.bonus).some(
    (value) => value !== 0,
  );
  if (
    !alwaysShow &&
    (!contribution.journalistName ||
      (!hasBonus && !contribution.bonusDescription))
  ) {
    return null;
  }

  return (
    <div className={`news-metric-breakdown${compact ? " compact" : ""}`}>
      {contribution.journalistName &&
        (hasBonus || contribution.bonusDescription) && (
          <div className="news-breakdown-heading">
            {contribution.journalistName} · {contribution.bonusDescription}
          </div>
        )}

      <div className="news-breakdown-lines">
        {entries(METRIC_LABELS).map(([key, [icon, label]]) => (
          <span key={key} title={label}>
            {icon} ({format(contribution.base[key])?.replace("+", "")}
            {contribution.bonus[key] < 0 ? "−" : "+"}
            {Math.abs(contribution.bonus[key])}) × {contribution.multiplier} ={" "}
            <strong>{format(contribution.final[key])}</strong>
          </span>
        ))}
      </div>

      {/* {contribution.journalistName &&
        (hasBonus || contribution.bonusDescription) && (
          <div className="news-breakdown-heading">
            Бонус журналиста: {contribution.journalistName} · полоса{" "}
            {contribution.tier}
          </div>
        )} */}
      {/* {contribution.bonusDescription && (
        <p className="news-breakdown-explanation">
          {contribution.bonusDescription}
        </p>
      )} */}
      {/* <div className="news-breakdown-lines">
        {entries(METRIC_LABELS).map(([key, [icon, label]]) => (
          <span key={key}>
            {icon} {label}: {format(contribution.base[key])}{" "}
            {contribution.bonus[key] < 0 ? "−" : "+"}{" "}
            {Math.abs(contribution.bonus[key])} × {contribution.multiplier} ={" "}
            <strong>{format(contribution.final[key])}</strong>
          </span>
        ))}
      </div> */}
    </div>
  );
}
