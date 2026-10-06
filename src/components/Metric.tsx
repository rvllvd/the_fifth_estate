interface Props {
  icon: string;
  label: string;
  value: number;
  preview?: number;
}

export default function Metric({ icon, label, value, preview }: Props) {
  return (
    <div className="metric">
      <span className="metric-label">{icon} {label}</span>
      <div className="metric-value-container">
        <span className="metric-value">{value}</span>
        {preview !== undefined && preview !== 0 && (
          <span className={`metric-preview ${preview > 0 ? 'positive' : 'negative'}`}>
            {preview > 0 ? '+' : ''}{preview}
          </span>
        )}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}