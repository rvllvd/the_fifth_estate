import { useEffect, useRef } from 'react';

export function useBackgroundMusic(src: string, volume = 0.15) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Пытаемся запустить сразу
    audio.play().catch(() => {
      // Браузер заблокировал — ждём первого клика
      const unlock = () => {
        audio.play().catch(() => {});
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, volume]);
}