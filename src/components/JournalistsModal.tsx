import type { Journalist } from '../types';

interface Props {
  staff: Journalist[];          // нанятые
  available: Journalist[];      // все доступные
  onHire: (j: Journalist) => void;
  onFire: (id: string) => void;
  onClose: () => void;
}

export default function JournalistsModal({
  staff,
  available,
  onHire,
  onFire,
  onClose,
}: Props) {
  const staffIds = new Set(staff.map((s) => s.id));
  const hireable = available.filter((j) => !staffIds.has(j.id));

  return (
    <div className="journalists-modal show" onClick={onClose}>
      <div
        className="journalists-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="journalists-modal-header">
          <h2>👥 Менеджмент сотрудников</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {/* ===== В штате ===== */}
        <div className="journalists-section">
          <h3>В штате ({staff.length})</h3>
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
                    <StatRow label="📈 Влияние"    value={j.bonus.influence} />
                    <StatRow label="🎯 Доверие"    value={j.bonus.credibility} />
                    <StatRow label="💰 Бюджет"     value={j.bonus.budget} />
                    <StatRow label="👥 Читатели"   value={j.bonus.readership} />
                    <div className="cost-row">
                      <div className="stat-row">
                        <span className="stat-label">Стоимость</span>
                        <span className="stat-value cost">${j.cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="journalist-actions">
                    {staff.length > 1 && <button className="fire-btn" onClick={() => onFire(j.id)}>
                      Уволить
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Доступные для найма ===== */}
        <div className="journalists-section">
          <h3>Доступные для найма ({hireable.length})</h3>
          {hireable.length === 0 ? (
            <div className="empty-staff">Все уже наняты</div>
          ) : (
            <div className="journalists-list">
              {hireable.map((j) => (
                <div key={j.id} className="journalist-card">
                  <div className="journalist-info">
                    <div className="journalist-name">{j.name}</div>
                    <div className="journalist-role">{j.role}</div>
                  </div>

                  <div className="journalist-stats">
                    <StatRow label="📈 Влияние"    value={j.bonus.influence} />
                    <StatRow label="🎯 Доверие"    value={j.bonus.credibility} />
                    <StatRow label="💰 Бюджет"     value={j.bonus.budget} />
                    <StatRow label="👥 Читатели"   value={j.bonus.readership} />
                    <div className="cost-row">
                      <div className="stat-row">
                        <span className="stat-label">Стоимость</span>
                        <span className="stat-value cost">${j.cost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="journalist-actions">
                    <button className="hire-btn" onClick={() => onHire(j)}>
                      Нанять
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>  
    </div>
  );
}

/** Строка стата: label + значение с цветом по знаку */
function StatRow({ label, value }: { label: string; value: number }) {
  const sign = value > 0 ? '+' : '';
  const cls = value > 0 ? 'positive' : value < 0 ? 'negative' : '';
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${cls}`}>{sign}{value}</span>
    </div>
  );
}