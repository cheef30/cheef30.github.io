/** Central timing config for the loading screen animation. Change these and both the CSS custom properties and the component's setTimeout stay in sync. */

export const DRAW_DURATION_S = 1.6;
export const HOLD_DURATION_S = 0.6;
export const ERASE_DURATION_S = 1.1;

export const DRAW_STAGGER_S = 0.06; // extra delay per letter, left to right
export const ERASE_STAGGER_S = 0.05; // extra delay per letter, right to left

export const FILL_FADE_IN_S = 0.15;
export const FILL_FADE_OUT_S = 0.15;

export const EXIT_FADE_MS = 250; // final whole-screen fade once the erase finishes
export const REDUCED_MOTION_HOLD_MS = 700; // how long to show the static logo when motion is reduced

export const TOTAL_DURATION_S = DRAW_DURATION_S + HOLD_DURATION_S + ERASE_DURATION_S;
export const TOTAL_DURATION_MS = TOTAL_DURATION_S * 1000;
