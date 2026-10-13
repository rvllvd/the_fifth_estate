import type { GameEvent } from "../data/events";

interface Props {
  event: GameEvent;
  turn: number;
  money: number;
  minimumMoney: number;
  onChoose: (choiceId: string) => void;
}

export default function GameEventModal({
  event,
  turn,
  money,
  minimumMoney,
  onChoose,
}: Props) {
  return (
    <div className="modal show game-event-modal">
      <section
        className="modal-content game-event-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-event-title"
        aria-describedby="game-event-description"
      >
        <header className="game-event-header">
          <span
            className={`game-event-kind ${event.polarity}`}
            aria-label={
              event.polarity === "supportive"
                ? "Поддержка редакции"
                : "Осложнение"
            }
          >
            {event.polarity === "supportive"
              ? "Событие редакции"
              : "Внешнее давление"}
          </span>
          <span className="game-event-turn">Ход {turn}</span>
        </header>
        <h2 id="game-event-title">{event.title}</h2>
        <p id="game-event-description">{event.description}</p>

        <div className="game-event-choices">
          {event.choices.map((choice) => {
            const unavailable =
              choice.cost !== undefined &&
              money - choice.cost < minimumMoney + 1;

            return (
              <div className="game-event-choice" key={choice.id}>
                <button
                  className="right-btn"
                  type="button"
                  disabled={unavailable}
                  onClick={() => onChoose(choice.id)}
                >
                  {choice.label}
                </button>
                {choice.description && (
                  <span className="game-event-choice-description">
                    {unavailable
                      ? "Недостаточно средств, чтобы сохранить резерв редакции."
                      : choice.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
