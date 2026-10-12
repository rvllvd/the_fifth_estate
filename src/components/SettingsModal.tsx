import { useState } from 'react';

type Props = {
  visible: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
};

export default function SettingsModal({ visible, onClose, onToggleTheme }: Props) {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('animationEnabled') !== 'false',
  );

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('animationEnabled', newVal ? 'true' : 'false');
    document.body.classList.toggle('animations-disabled', !newVal);
  };

  if (!visible) return null;

  return (
    <div className="settings-modal modal show">
      <div
        className="settings-modal-content modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="settings-modal-header modal-header">
          <h2 id="settings-modal-title">Настройки</h2>
          <button
            className="close-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Закрыть настройки"
          >
            ×
          </button>
        </div>
        <section className="settings-options" aria-label="Параметры">
          <div className="settings-option">
            <label className="settings-animation-control">
              <span>Анимация танцующих букв</span>
              <input type="checkbox" checked={enabled} onChange={toggle} />
            </label>
          </div>
          <div className="settings-option">
            <span className="settings-option-title">Тема оформления</span>
            <button
              className="settings-theme-btn right-btn"
              type="button"
              onClick={onToggleTheme}
            >
              Сменить тему
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
