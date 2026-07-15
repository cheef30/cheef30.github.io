'use client';

import { useEffect, useRef, useState } from 'react';

interface ViewfinderCursorProps {
  /** CSS selector for elements that should expand the cursor into the EXIF readout. Default: '.photo' */
  photoSelector?: string;
}

const EXIF_ATTRS = ['data-exif-focal', 'data-exif-fstop', 'data-exif-shutter', 'data-exif-iso'] as const;

function formatExif(el: Element | null): string {
  if (!el) return '';
  const focal = el.getAttribute('data-exif-focal');
  const fstop = el.getAttribute('data-exif-fstop');
  const shutter = el.getAttribute('data-exif-shutter');
  const iso = el.getAttribute('data-exif-iso');
  const parts: string[] = [];
  if (focal) parts.push(focal);
  if (fstop) parts.push(`f/${fstop}`);
  if (shutter) parts.push(shutter);
  if (iso) parts.push(`ISO ${iso}`);
  return parts.join(' · ');
}

/**
 * Desktop-only "viewfinder" cursor. Renders nothing (and adds no listeners)
 * on touch/coarse-pointer devices. Mount it once, near the root of the page.
 */
export default function ViewfinderCursor({ photoSelector = '.photo' }: ViewfinderCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [supported, setSupported] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [exifText, setExifText] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
    setSupported(true);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('rc-cursor-active');

    let mouseX = -100;
    let mouseY = -100;
    let curX = -100;
    let curY = -100;
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        shown = true;
        curX = mouseX;
        curY = mouseY;
        setVisible(true);
      }
    };
    const onWindowLeave = () => {
      shown = false;
      setVisible(false);
    };
    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.(photoSelector);
      if (!target) return;
      setExpanded(true);
      const exifTarget = EXIF_ATTRS.some((a) => target.hasAttribute(a))
        ? target
        : target.querySelector(EXIF_ATTRS.map((a) => `[${a}]`).join(', '));
      setExifText(formatExif(exifTarget));
    };
    const onOut = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.(photoSelector);
      if (!target) return;
      const related = e.relatedTarget as Node | null;
      if (related && target.contains(related)) return;
      setExpanded(false);
      setExifText('');
    };
    const tick = () => {
      if (reducedMotion) {
        curX = mouseX;
        curY = mouseY;
      } else {
        curX += (mouseX - curX) * 0.18;
        curY += (mouseY - curY) * 0.18;
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onWindowLeave);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onWindowLeave);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
      document.body.classList.remove('rc-cursor-active');
    };
  }, [photoSelector]);

  if (!supported) return null;

  const size = expanded ? 100 : 26;
  const half = size / 2;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{ width: size, height: size, marginLeft: -half, marginTop: -half }}
      className={`pointer-events-none fixed left-0 top-0 z-[10000] transition-[opacity,width,height,margin] duration-200 ease-out will-change-transform ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`absolute inset-0 border-[1.5px] border-red-600 transition-[border-radius] duration-200 ${
          expanded ? 'rounded-[10px]' : 'rounded-full'
        }`}
      />
      <div className="absolute left-1/2 top-1/2 h-[1.5px] w-[9px] -translate-x-1/2 -translate-y-1/2 bg-red-600" />
      <div className="absolute left-1/2 top-1/2 h-[9px] w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-red-600" />
      {exifText && (
        <div className="absolute left-1/2 top-full -translate-x-1/2 translate-y-[10px] whitespace-nowrap rounded-[3px] bg-black/80 px-[9px] py-1 font-mono text-[11px] tracking-wide text-white">
          {exifText}
        </div>
      )}
    </div>
  );
}
