import Metric from "./Metric";
import type { Metrics } from "../types";
import { STAT_LABELS, STAT_ICONS } from "../constants/stats";
import { formatMoney } from "../utils/economy";
import { GAME_BALANCE } from "../constants/global";

const GAME_TIME_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

interface Props {
  metrics: Metrics;
  preview: Metrics;
  gameTime: number;
  turn: number;
  readers: number;
  money: number;
  onOpenMenu: () => void;
}

export default function TopPanel({
  metrics,
  preview,
  gameTime,
  turn,
  readers,
  money,
  onOpenMenu,
}: Props) {
  const keys = Object.keys(STAT_LABELS) as (keyof Metrics)[];
  const formattedGameTime = GAME_TIME_FORMATTER.format(gameTime);
  const completedTurns = turn - 1;
  const weekDay = (completedTurns % 7) + 1;
  const week = Math.floor(completedTurns / 7) + 1;
  const weekLabel =
    week % 10 === 1 && week % 100 !== 11
      ? "неделя"
      : week % 10 >= 2 && week % 10 <= 4 && (week % 100 < 12 || week % 100 > 14)
        ? "недели"
        : "недель";
  const goalIndex = Math.min(
    Math.floor(completedTurns / 7),
    GAME_BALANCE.weeklyMoneyGoals.length - 1,
  );
  const weeklyGoal = GAME_BALANCE.weeklyMoneyGoals[goalIndex];

  return (
    <div id="top-panel">
      <div className="top-panel-left">
        <div className="game-clock" aria-label="Игровой день">
          <span className="game-clock-label">
            {GAME_BALANCE.showGameTime ? "Время" : "Ходы"}
          </span>
          {GAME_BALANCE.showGameTime ? (
            <time dateTime={new Date(gameTime).toISOString()}>
              {formattedGameTime}
            </time>
          ) : (
            <span>
              {weekDay}/7 дней ({week} {weekLabel})
            </span>
          )}
        </div>
        <div className="top-panel-stats">
          <div className="metrics">
            {keys.map((key) => {
              const icon = STAT_ICONS[key];
              const label = STAT_LABELS[key];
              return (
                <Metric
                  key={key}
                  metricKey={key}
                  icon={icon}
                  label={label}
                  value={metrics[key]}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div id="metrics-preview" aria-label="Прогноз изменения метрик">
        <div className="preview-line">
          {keys.map((key) => (
            <span
              key={key}
              className={preview[key] >= 0 ? "positive" : "negative"}
              title={STAT_LABELS[key]}
            >
              {STAT_ICONS[key]} {preview[key] > 0 ? "+" : ""}
              {preview[key]}
            </span>
          ))}
        </div>
      </div>

      <div className="top-panel-right">
        <div className="top-panel-economy">
          <div
            className="resource-display"
            id="readers-display"
            aria-label="Читатели"
          >
            <strong>👥 Читателей: {formatMoney(readers)}</strong>
          </div>

          <div
            className="resource-display"
            id="money-display"
            aria-label="Деньги и цель недели"
          >
            <strong>💵 ${formatMoney(money)}</strong>
            <span className="resource-goal">/ ${formatMoney(weeklyGoal)}</span>
          </div>
        </div>

        <div className="top-panel-actions">
          <button className="right-btn" id="game-menu-btn" onClick={onOpenMenu}>
            Меню
          </button>
        </div>
      </div>
    </div>
  );
}
