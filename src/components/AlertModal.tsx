interface Props {
  text: string;
  descriptions: string[];
  onClose: () => void;
  onNewGame: () => void;
  continueLabel?: string;
}

export default function AlertModal({
  text,
  descriptions,
  onClose,
  onNewGame,
  continueLabel,
}: Props) {
  return (
    <div className="alert modal show">
      <div className="alert modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alert modal-header">
          <h2>{text}</h2>
        </div>

        <div className="alert-description">
          {descriptions.map((description) => (
            <p key={description}>{description}</p>
          ))}
        </div>

        <div className="alert modal-section">
          <button
            className="right-btn"
            onClick={() => {
              if (continueLabel) {
                onClose();
              } else {
                onClose();
                onNewGame();
              }
            }}
          >
            {continueLabel ?? "Попробовать ещё раз"}
          </button>
        </div>
      </div>
    </div>
  );
}
