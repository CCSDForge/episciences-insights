// Sequential single-hue ramps, magnitude encoded light->dark: few values =
// light, many values = dark. Same mapping in both UI themes — it must not
// flip in dark mode, so magnitude reads the same way regardless of the
// surrounding card color. Starts at the 200 shade rather than 50/100: those
// paler tints read as near-white/glaring against a near-black dark-mode card.
export const COLOR_RAMPS = {
  teal: ['#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0f766e', '#134e4a'],
  blue: ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  indigo: ['#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'],
} as const;

export type ColorTheme = keyof typeof COLOR_RAMPS;

// Qualitative palette for community/cluster membership (Louvain output) —
// unlike COLOR_RAMPS this encodes *category*, not magnitude, so hue varies
// rather than lightness. Cycles via modulo past its length; Louvain on a
// graph capped at ~20-40 nodes rarely resolves into more than a handful of
// communities, so a collision is uncommon in practice.
export const COMMUNITY_COLORS = [
  '#0d9488', '#2563eb', '#db2777', '#ea580c', '#7c3aed',
  '#0891b2', '#65a30d', '#c026d3', '#4f46e5', '#ca8a04',
] as const;

// Neutral "no value" mark — swapped per prefers-color-scheme (see the
// .matrix-cell / --cell-light,--cell-dark pattern in globals.css) rather
// than drawn from the ramp itself, since "zero" isn't a light magnitude,
// it's the absence of one.
export const NO_VALUE_COLOR = { light: '#f4f4f5', dark: '#27272a' };

/**
 * Maps a value to a color step on the given ramp. Co-occurrence counts are
 * heavily skewed (a handful of dominant pairs, many pairs sharing 1-2
 * publications) — a linear scale crushes nearly everything into the bottom
 * bucket, so this uses a log scale to spread the low end back out (same fix
 * already used for skewed magnitude data in WorldMap.tsx via d3's scaleLog).
 */
export function rampStep(value: number, max: number, ramp: readonly string[]): string {
  if (max === 0 || value === 0) return ramp[0];
  const ratio = Math.log(value + 1) / Math.log(max + 1);
  const step = Math.min(ramp.length - 1, Math.max(1, Math.ceil(ratio * (ramp.length - 1))));
  return ramp[step];
}
