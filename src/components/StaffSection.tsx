import { useState } from 'react';
import StaffCard from './StaffCard';
import type { Journalist } from '../types';

interface Props {
  staff: Journalist[];
  onOpenJournalists: () => void;
}

export default function StaffSection({ staff, onOpenJournalists }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="panel-section" id="staff-section">
      <div className="panel-title">
        <span>👥 Сотрудники</span>
        <button
          className="toggle-staff-btn"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? '...' : '×'}
        </button>
      </div>

      {!collapsed && (
        <div className="staff-list" id="staff-list">
          {staff.length === 0 ? (
            <div className="staff-empty">Нет сотрудников</div>
          ) : (
            staff.map((s) => <StaffCard key={s.id} journalist={s} />)
          )}
        </div>
      )}

      <button className="action-btn" id="hire-btn" onClick={onOpenJournalists}>
        Менеджмент сотрудников
      </button>
    </div>
  );
}