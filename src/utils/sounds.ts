const sounds: Record<string, HTMLAudioElement> = {};
let soundEffectsEnabled = true;
let soundEffectsVolume = 1;

export function setSoundEffectsSettings(enabled: boolean, volume: number): void {
  soundEffectsEnabled = enabled;
  soundEffectsVolume = Math.max(0, Math.min(1, volume));
}

export function preloadSound(src: string, volume = 0.3): HTMLAudioElement {
  if (!sounds[src]) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = 'auto';
    sounds[src] = audio;
  }
  return sounds[src];
}

export function playSound(src: string, volume = 0.3): void {
  if (!soundEffectsEnabled || soundEffectsVolume === 0) return;
  const audio = preloadSound(src, volume);
  audio.volume = Math.max(0, Math.min(1, volume * soundEffectsVolume));
  audio.currentTime = 0;
  audio.play().catch(() => {});
}