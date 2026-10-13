// Кэш аудио-элементов для избежания повторной загрузки
const sounds: Record<string, HTMLAudioElement> = {};
let soundEffectsEnabled = true;
let soundEffectsVolume = 1;

// Настраивает глобальные настройки звуковых эффектов
export function setSoundEffectsSettings(enabled: boolean, volume: number): void {
  soundEffectsEnabled = enabled;
  soundEffectsVolume = Math.max(0, Math.min(1, volume));
}

// Предзагружает звуковой файл и кэширует его
// Повторные вызовы с тем же src возвращают уже загруженный элемент
export function preloadSound(src: string, volume = 0.3): HTMLAudioElement {
  if (!sounds[src]) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = 'auto';
    sounds[src] = audio;
  }
  return sounds[src];
}

// Воспроизводит звуковой эффект
// Если звук отключён или громкость 0 - ничего не делает
// Перед воспроизведением перематывает на начало (currentTime = 0)
export function playSound(src: string, volume = 0.3): void {
  if (!soundEffectsEnabled || soundEffectsVolume === 0) return;
  const audio = preloadSound(src, volume);
  audio.volume = Math.max(0, Math.min(1, volume * soundEffectsVolume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
}