// // // // import { METRIC_LABELS, metricKeys } from "../constants/stats";
import { getNewsCategoryLabel } from "../constants/categories";
import type { Journalist } from "../types";
import { GAME_BALANCE } from "../constants/global";

interface Props {
  staff: Journalist[]; // нанятые
  available: Journalist[]; // все доступные
  money: number;
  onHire: (j: Journalist) => void;
  onFire: (id: string) => void;
  onClose: () => void;
}

export default function JournalistsModal({
  staff,
  available,
  money,
  onHire,
  onFire,
  onClose,
}: Props) {
  const staffIds = new Set(staff.map((s) => s.id));
  const hireable = available.filter((j) => !staffIds.has(j.id));
  const staffLimitReached = staff.length >= GAME_BALANCE.maximumJournalists;

  return (
    <div className="journalists modal show" onClick={onClose}>
      <div
        className="journalists modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="journalists modal-header">
          <h2>👥 Менеджмент сотрудников</h2>
          <button className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* ===== В штате ===== */}
        <div className="journalists-section">
          <h3>
            В штате ({staff.length}/{GAME_BALANCE.maximumJournalists})
          </h3>
          {staff.length === 0 ? (
            <div className="empty-staff">Пока никого нет</div>
          ) : (
            <div className="journalists-list">
              {staff.map((j) => (
                <div key={j.id} className="journalist-card">
                  <div className="journalist-info">
                    <div className="journalist-name">{j.name}</div>
                    <div className="journalist-role">{j.role}</div>
                  </div>

                  <div className="journalist-stats">
                    {/* {metricKeys().map((key) => {
                      const [icon, label] = METRIC_LABELS[key];
                      return (
                        <StatRow
                          key={key}
                          label={`${icon} ${label}`}
                          value={j.bonus[key]}
                        />
                      );
                    })} */}
                    {j.bonus && j.desc && (
                      <span className="journalist-stats-desc">⚡{j.desc}</span>
                    )}
                    <div className="cost-row">
                      <div className="stat-row">
                        <span className="stat-label">Зарплата / час</span>
                        <span className="stat-value cost">${j.cost}</span>
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="stat-row">
                        <span className="stat-label">Специализация</span>
                        <span className="stat-value">
                          {j.spec ? getNewsCategoryLabel(j.spec) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="journalist-actions">
                    {staff.length > 1 && (
                      <button className="fire-btn" onClick={() => onFire(j.id)}>
                        Уволить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Доступные для найма ===== */}
        <div className="journalists-section">
          <h3>Доступные для найма ({staffLimitReached ? 0 : hireable.length})</h3>
          {staffLimitReached && (
            <div className="empty-staff">
              Достигнут лимит штата. Увольте сотрудника, чтобы нанять нового.
            </div>
          )}
          {!staffLimitReached && hireable.length === 0 ? (
            <div className="empty-staff">Все уже наняты</div>
          ) : !staffLimitReached && hireable.length > 0 ? (
            <div className="journalists-list">
              {hireable.map((j) => (
                <div key={j.id} className="journalist-card">
                  <div className="journalist-info">
                    <div className="journalist-name">{j.name}</div>
                    <div className="journalist-role">{j.role}</div>
                  </div>

                  <div className="journalist-stats">
                    {/* {metricKeys().map((key) => {
                      const [icon, label] = METRIC_LABELS[key];
                      return (
                        <StatRow
                          key={key}
                          label={`${icon} ${label}`}
                          value={j.bonus[key]}
                        />
                      );
                    })} */}
                    {j.bonus && j.desc && (
                      <span className="journalist-stats-desc">⚡ {j.desc}</span>
                    )}
                    <div className="cost-row">
                      <div className="stat-row">
                        <span className="stat-label">Зарплата / час</span>
                        <span className="stat-value cost">${j.cost}</span>
                      </div>
                    </div>

                    <div className="spec-row">
                      <div className="stat-row">
                        <span className="stat-label">Специализация</span>
                        <span className="stat-value">
                          {j.spec ? getNewsCategoryLabel(j.spec) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="journalist-actions">
                    <button
                      className="hire-btn"
                      onClick={() => onHire(j)}
                      disabled={money < j.cost || staffLimitReached}
                      title={
                        staffLimitReached
                          ? "Достигнут максимум сотрудников"
                          : money < j.cost
                            ? "Недостаточно денег для найма"
                            : undefined
                      }
                    >
                      {staffLimitReached
                        ? "Штат заполнен"
                        : money < j.cost
                          ? "Не хватает денег"
                          : "Нанять"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Строка стата: label + значение с цветом по знаку */
/*
function StatRow({ label, value }: { label: string; value: number }) {
  const sign = value > 0 ? "+" : "";
  const cls = value > 0 ? "positive" : value < 0 ? "negative" : "";
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${cls}`}>\
        {sign}{value}
      </span>
    </div>
  );
}
*/
