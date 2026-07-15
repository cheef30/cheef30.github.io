'use client';

interface ShutterSoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

/** Pair with `useShutterSound()` — pass its `enabled`/`toggle` straight through. */
export default function ShutterSoundToggle({ enabled, onToggle }: ShutterSoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute shutter sound' : 'Unmute shutter sound'}
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-current text-current transition-colors hover:border-red-600 hover:text-red-600"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
        {enabled ? (
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
