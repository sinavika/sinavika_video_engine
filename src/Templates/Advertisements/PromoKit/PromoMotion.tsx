import React from 'react';
import {interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import type {SoundEffectId} from '../../../Configurations/SoundEffects';

/**
 * The motion language of the Kasım 2026 reels (docs/Reels-Kurgu-Fikirleri.md):
 * every shot is made out of the previous one, a finger drives each change, the
 * camera moves in on what is being said, and fast moves blur along their
 * speed. Everything is a pure function of the frame, so any frame renders on
 * its own. Coordinates are reference pixels of the promo canvas (PromoStage).
 * Each part plays its own sound (a tap clicks, a morph swooshes, the camera
 * whooshes on a real move); `sound={null}` silences one.
 */

/** A spring's settings: a tiny overshoot at most (the motion rules ban bouncy easing). */
const SPRING = {damping: 26, mass: 0.8, stiffness: 170};

/** One moment of a value: from `at` seconds the value heads for `to`. */
export type Key<T> = {at: number; to: T};

/**
 * A number that springs to each new target at its moment: the first key is the
 * start, every later key adds one spring from the previous target to its own.
 * The sum of springs keeps it a function of time with no state between frames.
 */
const springAt = (keys: readonly Key<number>[], frame: number, fps: number, stiffness = SPRING.stiffness): number =>
	keys.slice(1).reduce((value, key, index) => value + (key.to - keys[index].to) * spring({frame: frame - key.at * fps, fps, config: {...SPRING, stiffness}}), keys[0].to);

/**
 * The value now and how fast it moves (units per second): for blur along speed.
 * A lower `stiffness` lags: two edges of one shape on different stiffnesses
 * stretch it as it moves (the leading edge runs ahead), as a liquid tab does.
 */
export const useSpringKeys = (keys: readonly Key<number>[], stiffness?: number): {value: number; speed: number} => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const value = springAt(keys, frame, fps, stiffness);
	return {value, speed: (value - springAt(keys, frame - 1, fps, stiffness)) * fps};
};

/** Blur that follows speed: none at rest, at most `max` px in a whip. */
export const speedBlur = (speed: number, perUnit = 0.004, max = 14): number => Math.min(max, Math.abs(speed) * perUnit);

/** How far the latest key's spring has come (0 → 1), and which key it is: for swapping content as a shape morphs. */
const latest = <T,>(keys: readonly Key<T>[], frame: number, fps: number) => {
	let index = 0;
	keys.forEach((key, position) => {
		if (frame >= key.at * fps) index = position;
	});
	const progress = index === 0 ? 1 : spring({frame: frame - keys[index].at * fps, fps, config: SPRING});
	return {index, progress};
};

export type Shape = {x: number; y: number; w: number; h: number; radius: number; fill: string};

/**
 * One element that becomes every next thing: a box whose place, size, corner
 * and colour spring from key to key (a button grows into a card, the card
 * shrinks into a chip). `render(index, progress)` draws the content of the
 * current key; it swaps with a short blur while the shape moves.
 */
export const Morph: React.FC<{keys: readonly Key<Shape>[]; shadow?: string; sound?: SoundEffectId | null; render: (index: number, settle: number) => React.ReactNode}> = ({keys, shadow, sound = 'morph', render}) => {
	const {u} = useVideoLayout();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const axis = (pick: (shape: Shape) => number) => springAt(keys.map((key) => ({at: key.at, to: pick(key.to)})), frame, fps);
	const {index, progress} = latest(keys, frame, fps);
	const fill = index === 0 ? keys[0].to.fill : interpolateColors(progress, [0, 1], [keys[index - 1].to.fill, keys[index].to.fill]);
	const w = axis((shape) => shape.w);
	const h = axis((shape) => shape.h);
	const swap = Math.min(1, progress * 2.2);
	return (
		<div style={{position: 'absolute', left: u(axis((shape) => shape.x)), top: u(axis((shape) => shape.y)), width: u(w), height: u(h), borderRadius: u(axis((shape) => shape.radius)), background: fill, boxShadow: shadow, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, opacity: swap, filter: swap < 1 ? `blur(${u((1 - swap) * 10)}px)` : undefined}}>{render(index, progress)}</div>
			{sound ? keys.slice(1).map((key) => <SoundEffect key={key.at} id={sound} atSeconds={key.at} />) : null}
		</div>
	);
};

/** A focus of the camera: the canvas point to bring to the middle and how close to come. */
type Focus = {x: number; y: number; zoom: number};

/**
 * Screen Studio style camera: everything inside moves so the focused point
 * sits in the middle of the canvas at the given zoom, springing between
 * focuses and blurring a little on the fast part of each move.
 */
export const CameraZoom: React.FC<{keys: readonly Key<Focus>[]; canvas?: {w: number; h: number}; sound?: SoundEffectId | null; children: React.ReactNode}> = ({keys, canvas = {w: 952, h: 1530}, sound = 'transitionWhoosh', children}) => {
	const {u} = useVideoLayout();
	const x = useSpringKeys(keys.map((key) => ({at: key.at, to: key.to.x})));
	const y = useSpringKeys(keys.map((key) => ({at: key.at, to: key.to.y})));
	const zoom = useSpringKeys(keys.map((key) => ({at: key.at, to: key.to.zoom})));
	const blur = speedBlur(Math.hypot(x.speed, y.speed) * zoom.value + Math.abs(zoom.speed) * 600, 0.003, 10);
	return (
		<>
			<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${u(canvas.w / 2 - x.value * zoom.value)}px, ${u(canvas.h / 2 - y.value * zoom.value)}px) scale(${zoom.value})`, filter: blur > 0.4 ? `blur(${u(blur)}px)` : undefined}}>
				{children}
			</div>
			{sound ? keys.slice(1).filter((key, index) => isMove(keys[index].to, key.to)).map((key) => <SoundEffect key={key.at} id={sound} atSeconds={key.at} volume={0.6} />) : null}
		</>
	);
};

/** A camera key worth a whoosh: it goes somewhere (a drift of a few pixels is silent). */
const isMove = (from: Focus, to: Focus): boolean => Math.abs(to.zoom - from.zoom) >= 0.06 || Math.hypot(to.x - from.x, to.y - from.y) >= 80;

/**
 * A fingertip touching the screen at (x, y) at `at` seconds: it comes in, presses
 * (shrinks), and a ring spreads from the touch. The change it causes should be
 * keyed to the same moment, so every change has a cause on screen.
 */
export const Tap: React.FC<{x: number; y: number; at: number; color?: string; sound?: SoundEffectId | null}> = ({x, y, at, color = 'rgba(11,28,48,0.55)', sound = 'uiTap'}) => (
	<>
		<TapTouch x={x} y={y} at={at} color={color} />
		{sound ? <SoundEffect id={sound} atSeconds={at} /> : null}
	</>
);

const TapTouch: React.FC<{x: number; y: number; at: number; color: string}> = ({x, y, at, color}) => {
	const {u} = useVideoLayout();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps - at;
	if (t < -0.35 || t > 0.6) return null;
	const arrive = Math.min(1, (t + 0.35) / 0.25);
	const press = t < 0 ? 1 : t < 0.12 ? 1 - (t / 0.12) * 0.25 : 0.75 + Math.min(1, (t - 0.12) / 0.15) * 0.25;
	const leave = t > 0.3 ? 1 - (t - 0.3) / 0.3 : 1;
	const ring = t < 0 ? 0 : Math.min(1, t / 0.45);
	return (
		<>
			{ring > 0 ? <div style={{position: 'absolute', left: u(x - 30 - ring * 50), top: u(y - 30 - ring * 50), width: u(60 + ring * 100), height: u(60 + ring * 100), borderRadius: '50%', border: `${u(5)}px solid ${color}`, opacity: 1 - ring, boxSizing: 'border-box'}} /> : null}
			<div style={{position: 'absolute', left: u(x - 34), top: u(y - 34), width: u(68), height: u(68), borderRadius: '50%', background: color, opacity: arrive * leave, transform: `scale(${press})`, boxShadow: `0 ${u(10)}px ${u(24)}px rgba(0,0,0,0.25)`}} />
		</>
	);
};
