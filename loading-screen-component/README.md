# Rotten Cherry — Loading Screen

A full-screen loading component whose "Rotten Cherry" wordmark draws itself
on like it's being hand-written, holds for a beat, then erases itself
right-to-left before disappearing.

## Files

| File | Purpose |
|---|---|
| `LoadingScreen.tsx` | The component. Client component (`'use client'`), no runtime font loading. |
| `LoadingScreen.module.css` | The animation (CSS `stroke-dasharray`/`stroke-dashoffset`, `fill-opacity`). |
| `rottenCherryPaths.ts` | Pre-computed SVG glyph outlines for the wordmark, set in **Rouge Script** (Google Fonts, SIL OFL). |
| `timing.ts` | Every duration/stagger/delay in one place — change the animation's pacing here. |
| `generator/generate-paths.js` | The offline tool used to produce `rottenCherryPaths.ts`. Only needed again if you change the text or the font. |

## Usage (Next.js App Router)

```tsx
// app/layout.tsx
'use client';
import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  return (
    <html lang="en">
      <body>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
        {children}
      </body>
    </html>
  );
}
```

Drop the four files above into a `components/LoadingScreen/` folder (adjust
the import path in `LoadingScreen.tsx` if you rename it) and import as shown.
It currently plays once per mount — i.e. once per full page load/refresh,
per your ask. To wire it to a real loading state later, just control when
it's mounted (or add an `isLoading` prop that swaps `phase` straight to
`'hiding'` when it flips to `false` — the hook structure is already set up
for that, it's a small change in `LoadingScreen.tsx`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `onComplete` | `() => void` | — | Fires after the exit fade, once the screen is gone. |
| `revealStyle` | `'fill' \| 'outline'` | `'fill'` | `'fill'`: the outline crossfades to a solid mark during the hold. `'outline'`: stays a drawn line the whole time. |
| `className` | `string` | — | Extra class on the overlay div. |

## Timing (`timing.ts`)

Total is **3.3s** by default, inside your requested 3–3.5s window:

- Draw: `1.6s`, letters staggered `0.06s` apart, left to right, `ease-in-out`.
- Hold: `0.6s`. In `'fill'` mode: quick `0.15s` fade to solid, holds solid, `0.15s` fade back to outline before erasing.
- Erase: `1.1s`, staggered `0.05s` apart in **reverse** letter order (last letter drawn erases first) — reads as an eraser sweeping right to left.
- Exit: `250ms` whole-screen opacity fade after the erase finishes, then `onComplete` fires.

Change any constant in `timing.ts` and both the CSS custom properties and
the component's internal `setTimeout` stay in sync automatically.

## Accessibility & performance

- Respects `prefers-reduced-motion: reduce` — skips straight to the fully
  drawn/filled logo, holds briefly (`REDUCED_MOTION_HOLD_MS`, 700ms), then
  calls `onComplete`. No motion is ever forced on someone who's opted out.
- Blocks page scroll for as long as it's mounted (`document.body.style.overflow`),
  and restores whatever the previous value was on unmount — safe to nest
  under other scroll-locking UI.
- The only animated CSS properties are `stroke-dashoffset`, `fill-opacity`,
  and the overlay's `opacity` — no filters, no layout-triggering properties,
  nothing that isn't GPU-friendly. Cheap on mobile.
- The `<svg>` is `aria-hidden`; a visually-hidden "Rotten Cherry" text node
  and `role="status"` on the overlay give screen readers something sane to
  announce instead of reading out path data.

## Why static paths instead of parsing the font at runtime

The brief asked to pick the easiest approach for turning the logo text into
SVG paths. Two real options exist:

1. **Runtime**: ship `opentype.js` (~250KB) to the browser, load the actual
   font file, and generate paths on the client on every mount.
2. **Build/dev-time** (what this does): run `opentype.js` once, offline,
   and commit the resulting path strings as plain data.

Static paths win here — zero runtime dependency, zero font-loading flash,
nothing to parse, and the animation is pure CSS. The only cost is that
changing the wordmark's text requires re-running the generator, which takes
five seconds:

```bash
cd generator
npm install
node generate-paths.js /path/to/Font.ttf "New Text"
```

## Font

**Rouge Script** was picked over two other candidates (Mrs Saint Delafield —
thinner/more fragile, Butcherman — a distressed display face whose letters
are filled blobs rather than a continuous stroke, so a draw-on animation
reads more like "filling a stencil" than handwriting). Rouge Script's bold
loops read clearly as a signature being written and hold up well at the
weight `stroke-width: 3` draws at.

It's licensed under the SIL Open Font License; grab it from the [Google
Fonts GitHub mirror](https://github.com/google/fonts/raw/main/ofl/rougescript/RougeScript-Regular.ttf)
if you ever need to regenerate paths.

## Colors used

- Background: `#0d0c0d` (near-black, matches the "tamna pozadina" ask)
- Logo stroke/fill: `#a4333f` (dark cherry red/burgundy — a touch more
  saturated than `#6b1f2a` so it still reads clearly at a 3px stroke width
  on a near-black background; swap the value in `LoadingScreen.module.css`
  if you'd rather have the exact `#6b1f2a`)
