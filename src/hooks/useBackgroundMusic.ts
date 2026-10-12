import { useEffect, useRef } from 'react';

export function useBackgroundMusic(
  src: string,
  volume = 0.15,
  enabled = true,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.max(0, Math.min(1, volume));
    if (!enabled || volume === 0) {
      audio.pause();
      return;
    }

    const play = () => {
      audio.play().catch(() => {
        window.addEventListener('click', play, { once: true });
        window.addEventListener('keydown', play, { once: true });
      });
    };

    play();
    return () => {
      window.removeEventListener('click', play);
      window.removeEventListener('keydown', play);
    };
  }, [enabled, volume, src]);
}