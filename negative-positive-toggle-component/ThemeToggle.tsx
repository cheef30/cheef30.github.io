'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * The dark/light toggle, themed as "Negative" (dark) / "Positive" (light).
 * Assumes Tailwind's `class` dark-mode strategy (`darkMode: 'class'`) and
 * the no-flash inline script from README.md running earlier in <head>.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // Sync with whatever the pre-paint inline script (or system preference) picked.
  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion) {
      root.classList.add('theme-flash');
      window.setTimeout(() => root.classList.remove('theme-flash'), 460);
    }

    root.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('rc-theme', next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-pressed={theme === 'dark'}
      aria-label="Toggle negative/positive mode"
      className="shrink-0 rounded-full border-[1.5px] border-current px-3.5 py-1.5 text-[11px] font-extrabold tracking-wider text-current transition-colors hover:border-red-600 hover:text-red-600"
    >
      {theme === 'dark' ? 'NEGATIVE' : 'POSITIVE'}
    </button>
  );
}
