import { useState, useEffect } from 'react';

type Props = {
  visible: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
};

export default function SettingsModal({ visible, onClose, onToggleTheme }: Props) {
  const [enabled, setEnabled] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('animationEnabled');
    setEnabled(stored !== 'false');
  }, []);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('animationEnabled', newVal ? 'true' : 'false');
  };

  if (!visible) return null;

  return (
    <div className="modal show">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Настройки</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-section">
          <label style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={enabled} onChange={toggle} />
            {' '}Анимация танцующих букв
          </label>
        </div>
        <div className="modal-section">
          <button className="right-btn" onClick={onToggleTheme}>Сменить тему</button>
        </div>
      </div>
    </div>
  );
}
