'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'rc-sound-enabled';

/**
 * Shutter-sound state + playback, decoupled from any particular button or
 * lightbox markup. Off by default until the user opts in; the choice is
 * persisted in localStorage.
 */
export function useShutterSound(src = '/sounds/shutter.mp3') {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      /* localStorage unavailable (private mode, SSR, etc.) — stay muted */
    }
    audioRef.current = new Audio(src);
    audioRef.current.preload = 'auto';
  }, [src]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  /** Call this when a photo opens in the lightbox. No-ops while muted. */
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!enabled || !audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {
      /* Browser blocked playback (autoplay policy, etc.) — fail silently */
    });
  }, [enabled]);

  return { enabled, toggle, play };
}
