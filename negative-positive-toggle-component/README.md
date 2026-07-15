# Negative / Positive Toggle (Dark Mode)

A real, functional dark/light toggle themed as a film negative/positive
switch, with a brief invert-flash transition instead of an instant swap.

## Files

| File | Purpose |
|---|---|
| `ThemeToggle.tsx` | The button. Client component. |
| `theme-init.snippet.html` | The no-flash-of-wrong-theme inline script — goes in `<head>`, before anything renders. |
| `globals.css.snippet` | The flash animation + `prefers-reduced-motion` guard. |
| `tailwind.config.snippet.ts` | The one config line this relies on. |

## Setup

**1. Tailwind config** — use the `class` strategy so `dark:` variants key off
a class on `<html>` instead of `prefers-color-scheme` directly:

```ts
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...rest of your config
};
```

**2. No-flash inline script** — paste into `app/layout.tsx`, as early as
possible in `<head>` (must run before the page paints, so it can't be a
regular deferred/module script):

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('rc-theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**3. Global CSS** — add the flash keyframes from `globals.css.snippet` to
`app/globals.css`.

**4. Drop in the button** anywhere in your header:

```tsx
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

<ThemeToggle />
```

**5. Style the rest of the site for dark mode** using Tailwind's `dark:`
variant, e.g. `bg-[#F1ECE1] dark:bg-[#141414] text-black dark:text-[#EFEAE0]`.
Because of step 1, these key off the same `.dark` class the button toggles.

## Behavior

- Label reads **"NEGATIVE"** while dark mode is active, **"POSITIVE"** while
  light — matching the site's photography theme instead of a sun/moon icon.
- First visit: respects `prefers-color-scheme`. After that, the user's
  explicit choice (in `localStorage` under `rc-theme`) always wins.
- Clicking briefly adds a `theme-flash` class to `<html>`, which runs a
  ~0.45s `filter: invert() hue-rotate(180deg)` animation — reads like a
  strip of film being flipped/developed, not a hard cut. The underlying
  colors swap instantly beneath that flash via the `dark:` classes; the
  flash is a pure visual overlay, not a substitute for functioning
  light/dark styles.
- `prefers-reduced-motion: reduce` skips the flash animation entirely (see
  `globals.css.snippet`) — the theme still switches, just without the
  invert flourish.

## Changing the color palette

There's no separate palette file to edit — every dark-mode color lives
inline as a `dark:` Tailwind class wherever you styled that element, e.g.:

```tsx
<body className="bg-[#F1ECE1] dark:bg-[#141414] text-black dark:text-[#EFEAE0]">
```

Swap the hex values after `dark:` to taste. If you'd rather centralize the
palette instead of repeating hex values across components, define CSS
custom properties in `globals.css` (`--bg`, `--text`, etc., overridden
under `.dark`) and reference `var(--bg)` in your Tailwind classes via
arbitrary values (`bg-[var(--bg)]`) — functionally identical, just one
place to edit later.
