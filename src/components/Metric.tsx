interface Props {
  icon: string;
  label: string;
  value: number;
}

export default function Metric({ icon, label, value }: Props) {
  return (
    <div className="metric">
      <span className="metric-label">{icon} {label}</span>
      <div className="metric-value-container">
        <span className="metric-value">{value}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}