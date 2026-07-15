# Shutter Sound

Plays a camera-shutter sound when a gallery photo opens in the lightbox.
Muted by default; the user has to opt in, and the choice is remembered.

## Files

| File | Purpose |
|---|---|
| `useShutterSound.ts` | Hook: holds the enabled/muted state (persisted to `localStorage`) and exposes `play()`. |
| `ShutterSoundToggle.tsx` | The mute/unmute button. Purely presentational — pass it the hook's state. |

## Where to put the audio file

Put `shutter.mp3` at **`public/sounds/shutter.mp3`**. Anything under
`public/` is served from the site root, so the hook's default path
(`/sounds/shutter.mp3`) resolves straight to it — no import, no bundler
config.

## Usage

```tsx
'use client';
import { useShutterSound } from '@/components/ShutterSound/useShutterSound';
import ShutterSoundToggle from '@/components/ShutterSound/ShutterSoundToggle';

export default function Gallery() {
  const { enabled, toggle, play } = useShutterSound();

  return (
    <>
      <header>
        {/* ...rest of your header... */}
        <ShutterSoundToggle enabled={enabled} onToggle={toggle} />
      </header>

      {photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.src}
          onClick={() => {
            play();               // no-ops while muted
            openLightbox(photo);  // your existing lightbox logic
          }}
        />
      ))}
    </>
  );
}
```

`play()` is safe to call unconditionally on every click — it's a no-op
while `enabled` is false, so you don't need to branch on it yourself.

## Behavior notes

- **Default: off.** `enabled` starts `false` until `useShutterSound` reads
  a stored `true` from `localStorage` (or the user flips the toggle).
- **Rapid clicks don't overlap.** `play()` always does
  `audio.pause(); audio.currentTime = 0;` before calling `play()` again, so
  a new click cuts off whatever was still playing instead of layering it.
- Uses a plain `<audio>`-backed `Audio()` instance rather than the Web
  Audio API — there's exactly one sound, triggered on demand, so the extra
  API surface (AudioContext, buffers, nodes) buys nothing here.

## Swapping the sound file

Replace `public/sounds/shutter.mp3` with your own file of the same name, or
point the hook at a different path:

```tsx
const { enabled, toggle, play } = useShutterSound('/sounds/my-click.mp3');
```
