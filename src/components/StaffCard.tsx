import type { Journalist } from '../types';

interface Props {
  journalist: Journalist;
}

export default function StaffCard({ journalist }: Props) {
  const { bonus } = journalist;

  return (
    <div className="staff-card">
      <div className="staff-info">
        <span className="staff-name">{journalist.name}</span>
        <span className="staff-role">{journalist.role}</span>
      </div>
      <div className="staff-stats">
        <span className="staff-stat">📈 {bonus.influence > 0 ? '+' : ''}{bonus.influence}</span>
        <span className="staff-stat">🎯 {bonus.credibility > 0 ? '+' : ''}{bonus.credibility}</span>
        <span className="staff-stat">💰 {bonus.budget > 0 ? '+' : ''}{bonus.budget}</span>
        <span className="staff-stat">👥 {bonus.readership > 0 ? '+' : ''}{bonus.readership}</span>
      </div>
    </div>
  );
}   