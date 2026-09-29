const sounds: Record<string, HTMLAudioElement> = {};

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
  const audio = preloadSound(src, volume);
  audio.currentTime = 0;
  audio.play().catch(() => {});
}