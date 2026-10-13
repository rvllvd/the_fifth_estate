import type { Metrics } from "../types";
import { STAT_ICONS, STAT_LABELS } from "../constants/stats";
import { formatMoney, getIncomePerReader } from "../utils/economy";

interface Props {
  readers: number;
  money: number;
  weeklyGoal: number;
  payroll: number;
  preview: Metrics;
  readerChangePreview: number | null;
  moneyChangePreview: number | null;
  showDeveloperTools: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
  onOpenGameConfig: () => void;
}

export default function GameMenuModal({
  readers,
  money,
  weeklyGoal,
  payroll,
  preview,
  readerChangePreview,
  moneyChangePreview,
  showDeveloperTools,
  onClose,
  onNewGame,
  onOpenSettings,
  onOpenStatistics,
  onOpenGameConfig,
}: Props) {
  const runAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div className="modal show game-menu-modal" onClick={onClose}>
      <section
        className="modal-content game-menu-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-menu-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header game-menu-header">
          <h2 id="game-menu-title">Меню</h2>
          <button
            className="close-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </header>

        <section className="game-menu-summary" aria-label="Сводка ресурсов">
          <div className="game-menu-resource">
            <span>Читатели</span>
            <strong>{formatMoney(readers)}</strong>
            <small>
              {readerChangePreview !== null && readerChangePreview !== 0
                ? `${readerChangePreview > 0 ? "+" : ""}${formatMoney(readerChangePreview)} после выпуска`
                : "Без изменений после выпуска"}
            </small>
          </div>
          <div className="game-menu-resource">
            <span>Деньги</span>
            <strong>${formatMoney(money)}</strong>
            <small>Цель недели: ${formatMoney(weeklyGoal)}</small>
          </div>
          <div className="game-menu-resource">
            <span>Экономика выпуска</span>
            <strong>
              +${formatMoney(readers * getIncomePerReader(readers))} / −$
              {formatMoney(payroll)}
            </strong>
            <small>
              {moneyChangePreview !== null && moneyChangePreview !== 0
                ? `${moneyChangePreview > 0 ? "+" : "−"}$${formatMoney(Math.abs(moneyChangePreview))} после выпуска`
                : "Прогноз без изменений"}
            </small>
          </div>
        </section>

        <section className="game-menu-preview" aria-label="Прогноз метрик">
          <h3>После выпуска</h3>
          <div className="game-menu-metrics">
            {(Object.keys(STAT_LABELS) as (keyof Metrics)[]).map((key) => (
              <span
                className={preview[key] >= 0 ? "positive" : "negative"}
                key={key}
              >
                <span title={STAT_LABELS[key]}>{STAT_ICONS[key]}</span>{" "}
                {preview[key] > 0 ? "+" : ""}
                {preview[key]} {STAT_LABELS[key]}
              </span>
            ))}
          </div>
        </section>

        <nav className="game-menu-actions" aria-label="Действия игры">
          <button
            className="right-btn"
            type="button"
            onClick={() => runAction(onOpenStatistics)}
          >
            Статистика
          </button>
          <button
            className="right-btn"
            type="button"
            onClick={() => runAction(onOpenSettings)}
          >
            Параметры
          </button>
          {showDeveloperTools && (
            <button
              className="right-btn"
              type="button"
              onClick={() => runAction(onOpenGameConfig)}
            >
              Настройка игры
            </button>
          )}
          <button
            className="right-btn game-menu-new-game"
            type="button"
            onClick={() => runAction(onNewGame)}
          >
            Новая игра
          </button>
        </nav>
      </section>
    </div>
  );
}
