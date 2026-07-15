# Viewfinder Cursor

A desktop-only custom cursor: a small crosshair circle that lags gently
behind the real pointer, and expands into an EXIF readout when it passes
over a `.photo` element.

## Files

| File | Purpose |
|---|---|
| `ViewfinderCursor.tsx` | The component. Client component (`'use client'`). |
| `globals.css.snippet` | The two CSS rules to add to your global stylesheet. |

## Usage (Next.js App Router)

```tsx
// app/layout.tsx
import ViewfinderCursor from '@/components/ViewfinderCursor/ViewfinderCursor';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ViewfinderCursor />
        {children}
      </body>
    </html>
  );
}
```

Mount it once, anywhere near the root — it renders a single `fixed`,
`pointer-events: none` element and returns `null` outright on touch/coarse
pointers, so it never affects layout or touch behavior.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `photoSelector` | `string` | `'.photo'` | Selector for elements that trigger the expanded/EXIF state. |

## Adding EXIF data to a photo

Put `class="photo"` (or match whatever `photoSelector` you pass) on the
image, plus any of these data attributes — all optional, shown only if
present:

```tsx
<img
  src="/img/portrait.jpg"
  className="photo"
  data-exif-focal="85mm"
  data-exif-fstop="1.8"
  data-exif-shutter="1/200"
  data-exif-iso="200"
/>
```

No attributes → hovering still expands the circle, just without the
monospace readout underneath it. No `.photo` class → the cursor stays a
plain crosshair.

If your markup wraps the `<img>` in something else (a `<figure>`, a link),
put `class="photo"` on that wrapper instead — the component looks for the
data attributes on the hovered element first, then falls back to searching
its children.

## Required global CSS

Add to your global stylesheet (e.g. `app/globals.css`):

```css
@media (pointer: fine) {
  body.rc-cursor-active,
  body.rc-cursor-active a,
  body.rc-cursor-active button {
    cursor: none;
  }
}
```

The component toggles the `rc-cursor-active` class on `<body>` itself (only
when `pointer: fine` matches), so this rule never hides the cursor on touch
devices even if the class somehow ended up in the DOM there.

## Accessibility & performance

- Bails out completely — no DOM, no listeners — when `matchMedia('(pointer: fine)')`
  is false. Touch and hybrid devices keep their native cursor untouched.
- Respects `prefers-reduced-motion: reduce`: the lag/lerp is skipped and the
  cursor tracks the pointer 1:1 instead of easing toward it.
- Positioned via `transform: translate3d(...)` set directly on the DOM node
  every animation frame (not through React state), so the 60fps loop never
  triggers a re-render — only hover enter/leave (infrequent) touches React
  state.
- `aria-hidden="true"` on the cursor element; it carries no information not
  already present in the page (the EXIF text is decorative here, not a
  replacement for real `alt` text).
