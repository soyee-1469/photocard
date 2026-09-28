export const FPS = 60;
export const WIDTH = 360;
export const HEIGHT = 780;
export const DURATION_FRAMES = FPS * 4;

const sec = (seconds: number) => Math.round(seconds * FPS);

/** All clock values live here. Components read these ranges and do not invent timings. */
export const beats = {
  shake: { start: sec(0), end: sec(0.6) },
  tear: { start: sec(0.6), end: sec(1.5) },
  card: { start: sec(1.5), end: sec(2.8) },
  burst: { start: sec(2.6), end: sec(3.5) },
  result: { start: sec(3.3), end: sec(4) },
} as const;

export const cardMotion = {
  rise: { start: beats.card.start, end: beats.card.start + sec(0.5) },
  flip: {
    start: beats.card.start + sec(0.42),
    end: beats.card.start + sec(1.12),
  },
  holo: { start: beats.card.start + sec(0.95), end: beats.result.end },
} as const;

/**
 * Tear is a 0–1 progress, not a frame clock.
 * 0 is the sealed pack, 1 is the flap gone and the body open.
 * A future Flutter drag can pass this value directly.
 */
export const tearPhases = {
  closed: [0, 0.1, 0.22],
  body: [0.08, 0.18],
  peel2: [0.08, 0.18, 0.36, 0.5],
  peel3: [0.34, 0.46, 0.62, 0.76],
  peel4: [0.58, 0.7, 0.92, 1],
  peel4Fall: [0.7, 0.84, 1],
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const tearProgressAt = (frame: number) => {
  const span = beats.tear.end - beats.tear.start;
  const raw = (frame - beats.tear.start) / span;
  return Math.min(1, Math.max(0, raw));
};
