'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import styles from './LoadingScreen.module.css';
import { LOGO_BBOX, LOGO_GLYPHS } from './rottenCherryPaths';
import {
  DRAW_DURATION_S,
  DRAW_STAGGER_S,
  ERASE_DURATION_S,
  ERASE_STAGGER_S,
  EXIT_FADE_MS,
  FILL_FADE_IN_S,
  FILL_FADE_OUT_S,
  HOLD_DURATION_S,
  REDUCED_MOTION_HOLD_MS,
  TOTAL_DURATION_MS,
} from './timing';

export interface LoadingScreenProps {
  /** Called once the intro/hold/outro sequence has fully finished (after the exit fade). */
  onComplete?: () => void;
  /**
   * 'fill' (default): the drawn outline crossfades to a solid mark during the hold.
   * 'outline': the logo stays a drawn line the whole time, never fills solid.
   */
  revealStyle?: 'fill' | 'outline';
  className?: string;
}

const N = LOGO_GLYPHS.length;
const viewBoxPad = 24;
const viewBox = [
  LOGO_BBOX.x1 - viewBoxPad,
  LOGO_BBOX.y1 - viewBoxPad,
  LOGO_BBOX.x2 - LOGO_BBOX.x1 + viewBoxPad * 2,
  LOGO_BBOX.y2 - LOGO_BBOX.y1 + viewBoxPad * 2,
].join(' ');

// Per-letter animation lasts only as long as its stagger delay leaves room for
// within the overall phase duration, so every letter still finishes exactly
// when the phase ends regardless of its position in the word.
const lastDrawStagger = (N - 1) * DRAW_STAGGER_S;
const perLetterDrawDuration = DRAW_DURATION_S - lastDrawStagger;
const lastEraseStagger = (N - 1) * ERASE_STAGGER_S;
const perLetterEraseDuration = ERASE_DURATION_S - lastEraseStagger;

const fillInStart = DRAW_DURATION_S;
const fillOutStart = DRAW_DURATION_S + HOLD_DURATION_S - FILL_FADE_OUT_S;

export default function LoadingScreen({ onComplete, revealStyle = 'fill', className }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'playing' | 'hiding' | 'done'>('playing');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [reducedMotionResolved, setReducedMotionResolved] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    setReducedMotionResolved(true);

    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  // Block scroll for as long as the overlay is showing. Restored both when
  // the sequence finishes on its own (phase -> 'done', component stays
  // mounted rendering null) and if a parent unmounts this component early —
  // whichever happens first — so this never depends on the caller's
  // conditional-rendering pattern to behave correctly.
  useEffect(() => {
    if (phase === 'done') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  useEffect(() => {
    if (!reducedMotionResolved) return undefined;

    const holdMs = reducedMotion ? REDUCED_MOTION_HOLD_MS : TOTAL_DURATION_MS;
    const hideTimer = setTimeout(() => setPhase('hiding'), holdMs);
    return () => clearTimeout(hideTimer);
  }, [reducedMotionResolved, reducedMotion]);

  useEffect(() => {
    if (phase !== 'hiding') return undefined;
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, EXIT_FADE_MS);
    return () => clearTimeout(doneTimer);
  }, [phase, onComplete]);

  const glyphStyles = useMemo<CSSProperties[]>(
    () =>
      LOGO_GLYPHS.map((_, i) => {
        const drawDelay = i * DRAW_STAGGER_S;
        const eraseIndex = N - 1 - i; // last letter drawn erases first: right-to-left sweep
        const eraseDelay = DRAW_DURATION_S + HOLD_DURATION_S + eraseIndex * ERASE_STAGGER_S;
        return {
          '--draw-duration': `${perLetterDrawDuration}s`,
          '--draw-delay': `${drawDelay}s`,
          '--erase-duration': `${perLetterEraseDuration}s`,
          '--erase-delay': `${eraseDelay}s`,
          '--fill-in-duration': `${FILL_FADE_IN_S}s`,
          '--fill-in-delay': `${fillInStart}s`,
          '--fill-out-duration': `${FILL_FADE_OUT_S}s`,
          '--fill-out-delay': `${fillOutStart}s`,
        } as CSSProperties;
      }),
    [],
  );

  if (phase === 'done') return null;

  const overlayClassName = [styles.overlay, phase === 'hiding' && styles.hiding, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={overlayClassName} role="status" aria-label="Loading">
      <svg className={styles.logo} viewBox={viewBox} fill="none" aria-hidden="true">
        {LOGO_GLYPHS.map((glyph, i) => {
          const glyphClassName = [
            styles.glyph,
            revealStyle === 'fill' && styles.withFill,
            reducedMotion && styles.reduced,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <path
              key={`${glyph.char}-${i}`}
              className={glyphClassName}
              style={reducedMotion ? undefined : glyphStyles[i]}
              pathLength={1}
              d={glyph.d}
            />
          );
        })}
      </svg>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Rotten Cherry
      </span>
    </div>
  );
}
