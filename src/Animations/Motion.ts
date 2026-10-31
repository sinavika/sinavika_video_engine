import {Easing, interpolate} from 'remotion';

/**
 * Motion tokens and frame math. Everything here is a pure function of the
 * frame number, which is what keeps renders deterministic: no timers, no
 * randomness, no dependence on when or where a frame is rendered.
 *
 * Durations are in seconds so animations look the same at any FPS.
 */
export const MOTION_DURATIONS = {
	instant: 0.15,
	fast: 0.3,
	base: 0.5,
	slow: 0.8,
	deliberate: 1.2,
} as const;

export const STAGGER_STEPS = {
	tight: 0.06,
	base: 0.12,
	relaxed: 0.22,
} as const;

const EASINGS = {
	linear: Easing.linear,
	standard: Easing.bezier(0.4, 0, 0.2, 1),
	enter: Easing.bezier(0.16, 1, 0.3, 1),
	exit: Easing.bezier(0.7, 0, 0.84, 0),
	overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

export type EasingName = keyof typeof EASINGS;
export const EASING_NAMES = Object.keys(EASINGS) as [EasingName, ...EasingName[]];

export const secondsToFrames = (seconds: number, fps: number): number => Math.round(seconds * fps);

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** The course visuals' easing: a quick start that settles softly. */
const SETTLE = Easing.bezier(0.33, 0, 0.2, 1);

/** 0 → 1 from `from` over `duration` seconds, eased (0 before, 1 after). */
export const easeFrom = (seconds: number, from: number, duration: number): number =>
	interpolate(seconds, [from, from + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SETTLE});

/** A 0–1 share eased the same way (clamped first). */
export const smooth = (value: number): number => SETTLE(clamp01(value));

/** A repeatable pseudo-random number in [0, 1) for a seed: the same scatter (rain, grains, soldiers) on every frame. */
export const noise = (seed: number): number => {
	const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return value - Math.floor(value);
};

/** Hermite smoothstep: eases a 0–1 share in and out symmetrically. */
export const smoothStep = (t: number): number => t * t * (3 - 2 * t);

type ProgressInput = {
	frame: number;
	fps: number;
	delaySeconds?: number;
	durationSeconds?: number;
	easing?: EasingName;
};

/** 0 before the animation starts, 1 after it ends. May exceed 1 mid-way with `overshoot`. */
export const animationProgress = ({
	frame,
	fps,
	delaySeconds = 0,
	durationSeconds = MOTION_DURATIONS.base,
	easing = 'enter',
}: ProgressInput): number => {
	const start = delaySeconds * fps;
	const length = Math.max(1, durationSeconds * fps);
	return interpolate(frame, [start, start + length], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASINGS[easing],
	});
};

/**
 * Spreads `count` items over a scene: the delay between consecutive items so
 * the last one arrives before the scene ends. Keeps on-screen reveals in step
 * with a voice-over of any length.
 */
export const paceSeconds = (
	sceneSeconds: number,
	count: number,
	{leadSeconds = 1.2, minSeconds = 0.4, maxSeconds = 6} = {},
): number => Math.min(maxSeconds, Math.max(minSeconds, (sceneSeconds - leadSeconds) / Math.max(1, count)));

/** Number of characters a typewriter has revealed at `frame`. */
export const typewriterLength = (
	totalCharacters: number,
	frame: number,
	fps: number,
	delaySeconds: number,
	charactersPerSecond: number,
): number => {
	const elapsed = frame / fps - delaySeconds;
	return Math.min(totalCharacters, Math.max(0, Math.floor(elapsed * charactersPerSecond)));
};
