import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {SoundEffect} from '../Sounds/SoundEffect';
import {useStoryLook} from './StoryLook';

/**
 * A mouse pointer that clicks through a screen (Sosyal Medya, 17 Nov 2026, the prompt-motion "shape morphing through
 * UI states" direction): it glides to each point, presses, and a ring spreads where it clicked, with the tap's sound.
 * The thumb on the phone (StoryPhone) is the touch version of the same move.
 */

/** A click: where (pixels from the cursor's own place) and when (seconds of the scene). */
type CursorClick = {at: number; x: number; y: number};

/** The glide to a click ends on its moment. */
const TRAVEL_SECONDS = 0.35;
const PRESS_SECONDS = 0.12;
const RIPPLE_SECONDS = 0.45;

const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Where the pointer is `seconds` into the scene, how far it is pressed (0–1) and how far the ring of the last click
 * has spread (0–1, null when there is none). It starts at 0,0 and waits there until its first glide.
 */
export const cursorAt = (clicks: readonly CursorClick[], seconds: number): {x: number; y: number; press: number; ripple: number | null; clicked: CursorClick | null} => {
	let from = {x: 0, y: 0};
	let position = from;
	for (const click of clicks) {
		const progress = Math.min(1, (seconds - (click.at - TRAVEL_SECONDS)) / TRAVEL_SECONDS);
		if (progress <= 0) break;
		const eased = inOut(progress);
		position = {x: from.x + (click.x - from.x) * eased, y: from.y + (click.y - from.y) * eased};
		from = click;
	}
	const clicked = [...clicks].reverse().find((click) => click.at <= seconds) ?? null;
	const since = clicked ? seconds - clicked.at : Infinity;
	return {
		...position,
		press: since <= PRESS_SECONDS ? Math.sin((Math.PI * since) / PRESS_SECONDS) : 0,
		ripple: since <= RIPPLE_SECONDS ? since / RIPPLE_SECONDS : null,
		clicked,
	};
};

/** The pointer and its clicks; `size` is the arrow's height in pixels. */
export const StoryCursor: React.FC<{clicks: readonly CursorClick[]; size?: number; ringColor?: string}> = ({clicks, size = 64, ringColor}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const look = useStoryLook();
	const {x, y, press, ripple, clicked} = cursorAt(clicks, seconds);
	const ring = ringColor ?? look.accent;
	return (
		<div style={{position: 'relative', width: 0, height: 0}}>
			{clicked && ripple !== null ? (
				<div style={{position: 'absolute', left: clicked.x, top: clicked.y, width: size * 1.6, height: size * 1.6, marginLeft: -size * 0.8, marginTop: -size * 0.8, borderRadius: '50%', border: `${size * 0.08}px solid ${ring}`, opacity: 1 - ripple, transform: `scale(${0.3 + 0.7 * ripple})`}} />
			) : null}
			<svg width={size * 0.72} height={size} viewBox="0 0 18 25" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))'}}>
				<path d="M1 1 L1 20 L6 15.5 L9.5 23.5 L13 22 L9.5 14 L16 14 Z" fill="#111111" stroke="#FFFFFF" strokeWidth={1.6} strokeLinejoin="round" />
			</svg>
			{clicks.map((click, index) => (
				<SoundEffect key={index} id="uiTap" atSeconds={click.at} volume={0.5} />
			))}
		</div>
	);
};
