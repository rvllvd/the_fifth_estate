import type { Theme } from "../types";

type Props = {
  visible: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  animationEnabled: boolean;
  onToggleAnimation: () => void;
  musicEnabled: boolean;
  musicVolume: number;
  onToggleMusic: () => void;
  onMusicVolumeChange: (volume: number) => void;
  soundEffectsEnabled: boolean;
  soundEffectsVolume: number;
  onToggleSoundEffects: () => void;
  onSoundEffectsVolumeChange: (volume: number) => void;
  onResetSettings: () => void;
};

export default function SettingsModal({
  visible,
  onClose,
  theme,
  onThemeChange,
  animationEnabled,
  onToggleAnimation,
  musicEnabled,
  musicVolume,
  onToggleMusic,
  onMusicVolumeChange,
  soundEffectsEnabled,
  soundEffectsVolume,
  onToggleSoundEffects,
  onSoundEffectsVolumeChange,
  onResetSettings,
}: Props) {
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
          <h2 id="settings-modal-title">Параметры</h2>
          <button
            className="close-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Закрыть параметры"
          >
            ×
          </button>
        </div>
        <section className="settings-options" aria-label="Параметры">
          <div className="settings-option">
            <label className="settings-animation-control">
              <span>Анимация танцующих букв</span>
              <input
                type="checkbox"
                checked={animationEnabled}
                onChange={onToggleAnimation}
              />
            </label>
          </div>
          <div className="settings-option">
            <label className="settings-animation-control">
              <span>Фоновая музыка</span>
              <input
                type="checkbox"
                checked={musicEnabled}
                onChange={onToggleMusic}
              />
            </label>
            <label className="settings-volume-control">
              <span>Громкость: {Math.round(musicVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(event) =>
                  onMusicVolumeChange(Number(event.currentTarget.value))
                }
                disabled={!musicEnabled}
                aria-label="Громкость фоновой музыки"
              />
            </label>
          </div>
          <div className="settings-option">
            <label className="settings-animation-control">
              <span>Звуковые эффекты</span>
              <input
                type="checkbox"
                checked={soundEffectsEnabled}
                onChange={onToggleSoundEffects}
              />
            </label>
            <label className="settings-volume-control">
              <span>Громкость: {Math.round(soundEffectsVolume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundEffectsVolume}
                onChange={(event) =>
                  onSoundEffectsVolumeChange(Number(event.currentTarget.value))
                }
                disabled={!soundEffectsEnabled}
                aria-label="Громкость звуковых эффектов"
              />
            </label>
          </div>
          <div className="settings-option">
            <label className="settings-theme-control" htmlFor="settings-theme">
              <span>Тема оформления</span>
              <select
                id="settings-theme"
                className="settings-theme-select"
                value={theme}
                onChange={(event) => {
                  const selectedTheme = event.currentTarget.value;
                  if (
                    selectedTheme === "light" ||
                    selectedTheme === "dark" ||
                    selectedTheme === "cyberpunk"
                  ) {
                    onThemeChange(selectedTheme);
                  }
                }}
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная · Inscryption</option>
                <option value="cyberpunk">Киберпанк</option>
              </select>
            </label>
          </div>
          <div className="settings-option">
            {/* <span className="settings-option-title">Сброс настроек</span> */}
            <button
              className="settings-reset-btn right-btn"
              type="button"
              onClick={onResetSettings}
            >
              Сбросить параметры
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
