import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {SINAVIKA_TR_TEMPO} from '../../Configurations/SocialTempo';
import type {SoundEffectId} from '../../Configurations/SoundEffects';
import {SoundEffect} from '../Sounds/SoundEffect';

/**
 * The cut language of the story reels (sinavika.tr, owner 15 Nov 2026: "Dokuru videolarındaki heyecan yok, akış çok
 * yavaş"): the picture changes every 0.5–1.5 s and each change is made by the camera, not by a fade. Every move is a
 * pure function of the time, so any frame renders on its own; every move is heard (motion rules: one sound per move).
 *
 * - punch: the frame jumps in from `from` and settles in a quarter of a second (a hard cut on a beat);
 * - shake: a short decaying jolt, for a fact that hits;
 * - whip: a fast pan with motion blur, out of one picture and into the next;
 * - flash: a white frame that fades in a tenth of a second, for a cut on a word.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = (value: number) => 1 - (1 - value) ** 3;

/** The owner's approved cut (SINAVIKA_TR_TEMPO.cut, 15 Nov 2026: "Bu tempo iyi"): one setting for every story reel. */
const CUT = SINAVIKA_TR_TEMPO.cut;

/** The frame's scale `seconds` into a punch that starts `at`: `from` → 1 in `duration`, then a slow creep closer. */
export const punchScale = (seconds: number, at: number, from: number = CUT.punchFrom, duration: number = CUT.punchSeconds, creep: number = CUT.creepPerSecond): number => {
	if (seconds < at) return 1;
	const settled = easeOut(interpolate(seconds, [at, at + duration], [0, 1], CLAMP));
	return (from + (1 - from) * settled) * (1 + creep * (seconds - at));
};

/**
 * A jolt `seconds` into a shake that starts `at`: a few decaying swings, deterministic (the same frame always shakes
 * the same way). Offsets in canvas pixels, rotation in degrees.
 */
export const shakeOffset = (seconds: number, at: number, strength = 16, duration = 0.38): {x: number; y: number; rotate: number} => {
	const t = seconds - at;
	if (t < 0 || t > duration) return {x: 0, y: 0, rotate: 0};
	const decay = (1 - t / duration) ** 2;
	return {
		x: strength * decay * Math.sin(t * 71),
		y: strength * 0.7 * decay * Math.sin(t * 53 + 1.3),
		rotate: 1.2 * (strength / 16) * decay * Math.sin(t * 37 + 0.4),
	};
};

/**
 * A whip pan `seconds` into one that starts `at`, over `duration`: the picture leaves sideways (out) or arrives (in),
 * with blur along the move. `x` is a share of the frame's width.
 */
export const whipPan = (seconds: number, at: number, direction: 'out' | 'in', duration = 0.22, side: 1 | -1 = -1): {x: number; blur: number} => {
	const t = interpolate(seconds, [at, at + duration], [0, 1], CLAMP);
	if (direction === 'out') {
		if (seconds < at) return {x: 0, blur: 0};
		const eased = t ** 2;
		return {x: side * eased * 1.1, blur: 28 * Math.sin(Math.PI * Math.min(1, t * 1.2))};
	}
	if (seconds >= at + duration) return {x: 0, blur: 0};
	const eased = 1 - (1 - t) ** 2;
	return {x: -side * (1 - eased) * 1.1, blur: 28 * (1 - eased)};
};

/** The white flash's opacity `seconds` into a flash cut at `at`. */
export const flashOpacity = (seconds: number, at: number, strength: number = CUT.flash, duration: number = CUT.flashSeconds): number =>
	seconds < at ? 0 : interpolate(seconds, [at, at + duration], [strength, 0], CLAMP);

type CameraMove =
	| {kind: 'punch'; at: number; from?: number; sound?: SoundEffectId | null}
	| {kind: 'shake'; at: number; strength?: number; sound?: SoundEffectId | null}
	| {kind: 'flash'; at: number; sound?: SoundEffectId | null}
	| {kind: 'whipOut' | 'whipIn'; at: number; side?: 1 | -1; sound?: SoundEffectId | null};

/** The sound each move makes when the scene does not choose one. */
const MOVE_SOUNDS: Record<CameraMove['kind'], SoundEffectId> = {punch: 'impact', shake: 'impact', flash: 'pop', whipOut: 'transitionWhoosh', whipIn: 'transitionWhoosh'};

/**
 * Wraps a scene in its camera: the punches, shakes, whips and flashes in `moves` (seconds of the scene). The latest
 * punch sets the scale; shakes and whips add up; flashes paint a white frame over everything. Each move plays its
 * sound unless `sound: null`. `canvasWidth` turns a whip's share of the frame into pixels.
 */
export const StoryCamera: React.FC<{moves: readonly CameraMove[]; canvasWidth?: number; origin?: string; children: React.ReactNode}> = ({moves, canvasWidth = 1080, origin = '50% 45%', children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const seconds = frame / fps;
	const punches = moves.filter((move) => move.kind === 'punch' && move.at <= seconds);
	const lastPunch = punches.at(-1) as Extract<CameraMove, {kind: 'punch'}> | undefined;
	const scale = lastPunch ? punchScale(seconds, lastPunch.at, lastPunch.from) : 1;
	let x = 0;
	let y = 0;
	let rotate = 0;
	let blur = 0;
	let flash = 0;
	for (const move of moves) {
		if (move.kind === 'shake') {
			const jolt = shakeOffset(seconds, move.at, move.strength);
			x += jolt.x;
			y += jolt.y;
			rotate += jolt.rotate;
		} else if (move.kind === 'whipOut' || move.kind === 'whipIn') {
			const pan = whipPan(seconds, move.at, move.kind === 'whipOut' ? 'out' : 'in', undefined, move.side);
			x += pan.x * canvasWidth;
			blur = Math.max(blur, pan.blur);
		} else if (move.kind === 'flash') {
			flash = Math.max(flash, flashOpacity(seconds, move.at));
		}
	}
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`, transformOrigin: origin, filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined}}>{children}</AbsoluteFill>
			{flash > 0 ? <AbsoluteFill style={{background: '#FFFFFF', opacity: flash, pointerEvents: 'none'}} /> : null}
			{moves.map((move, index) =>
				move.sound === null ? null : <SoundEffect key={index} id={move.sound ?? MOVE_SOUNDS[move.kind]} atSeconds={Math.max(0, Math.round(move.at * fps) / fps)} volume={move.kind === 'flash' ? 0.6 : 0.9} />,
			)}
		</AbsoluteFill>
	);
};
