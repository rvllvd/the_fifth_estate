interface Props {
  text: string; // нанятые
  onClose: () => void;
  onNewGame: () => void;
}

export default function AlertModal({ text, onClose, onNewGame }: Props) {
  return (
    <div className="alert modal show">
      <div className="alert modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alert modal-header">
          <h2>{text}</h2>
        </div>

        <div className="alert modal-section">
          <button
            className="right-btn"
            onClick={() => {
              onClose();
              onNewGame();
            }}
          >
            Попробовать ещё раз
          </button>
        </div>
      </div>
    </div>
  );
}
