import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {SoundEffect} from '../Sounds/SoundEffect';
import {useStoryLook} from './StoryLook';

/**
 * Moments the engine plays on top of a real UI/UX drawing, on the device's glass ("Dediniz, yaptık", Sosyal Medya,
 * 20 Nov 2026). The drawing itself never changes; the engine moves copies of it:
 *
 * - push: everything below `y` slides down by `by` (shares of the screen's height), and the gap fills with more of the
 *   slice `fill` above it, so a panel grows and what was under it (the "Devam" button, F1) leaves the glass at the
 *   bottom. The gap's ground is the row just above `y` stretched; `inset` keeps the repeated slice off a left column
 *   (an icon that must not repeat);
 * - swipe: a fingertip's touch mark sliding over the glass (a scroll);
 * - highlight: a ring in the look's accent round a part of the screen, pulsing once and staying;
 * - tap: a fingertip's touch mark pressing a point (a button), a ring spreading from it, the tap's click;
 * - rise: a part of the screen (a chart's bar, D1) is hidden on the card's ground until its moment, then rises from
 *   its own bottom edge into place and settles with a click.
 *
 * Every place is a share (0–1) of the screen's width and height, every time seconds of the scene.
 */

type GlassPoint = {x: number; y: number};
export type GlassEffect =
	| {kind: 'push'; at: number; y: number; by: number; seconds?: number; fill?: readonly [number, number]; inset?: number}
	| {kind: 'swipe'; at: number; from: GlassPoint; to: GlassPoint; seconds?: number}
	| {kind: 'highlight'; at: number; x: number; y: number; width: number; height: number}
	| {kind: 'tap'; at: number; x: number; y: number}
	| {kind: 'rise'; at: number; x: number; y: number; width: number; height: number; seconds?: number; ground?: string};

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PUSH_SECONDS = 1;
const SWIPE_SECONDS = 0.5;
/** How tall the slice above the split is when the push names none: one line of the panel's text. */
const FILL_SHARE = 0.045;

const RISE_SECONDS = 0.55;
const TAP_SECONDS = 0.45;

/** How far a rising part has come up `seconds` into the scene: 0 hidden below its box, 1 in place (a small overshoot before it settles). */
export const partRiseAt = (effect: Extract<GlassEffect, {kind: 'rise'}>, seconds: number): number => interpolate(seconds, [effect.at, effect.at + (effect.seconds ?? RISE_SECONDS) * 0.75, effect.at + (effect.seconds ?? RISE_SECONDS)], [0, 1.06, 1], CLAMP);

/** A tap's touch mark: how strongly it shows, how deep it presses (0–1) and how far its ring has spread (null before the tap). */
export const glassTapAt = (effect: Extract<GlassEffect, {kind: 'tap'}>, seconds: number): {shown: number; press: number; ring: number | null} => {
	const since = seconds - effect.at;
	return {
		shown: interpolate(since, [-0.15, 0, TAP_SECONDS * 0.6, TAP_SECONDS], [0, 1, 1, 0], CLAMP),
		press: since >= 0 && since <= 0.12 ? Math.sin((Math.PI * since) / 0.12) : 0,
		ring: since >= 0 && since <= TAP_SECONDS ? since / TAP_SECONDS : null,
	};
};

const inOut = (value: number) => (value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2);

/** How far a push has opened `seconds` into the scene (a share of the height, 0 → `by`); it stays open. */
export const pushAt = (effect: Extract<GlassEffect, {kind: 'push'}>, seconds: number): number => effect.by * inOut(interpolate(seconds, [effect.at, effect.at + (effect.seconds ?? PUSH_SECONDS)], [0, 1], CLAMP));

/** The touch mark of a swipe: where it is and how strongly it shows (0 when the finger is away). */
export const swipeAt = (effect: Extract<GlassEffect, {kind: 'swipe'}>, seconds: number): {x: number; y: number; shown: number} => {
	const length = effect.seconds ?? SWIPE_SECONDS;
	const t = interpolate(seconds, [effect.at, effect.at + length], [0, 1], CLAMP);
	const eased = 1 - (1 - t) ** 2;
	const shown = interpolate(seconds, [effect.at - 0.12, effect.at, effect.at + length, effect.at + length + 0.15], [0, 1, 1, 0], CLAMP);
	return {x: effect.from.x + (effect.to.x - effect.from.x) * eased, y: effect.from.y + (effect.to.y - effect.from.y) * eased, shown};
};

/** Checks a push's numbers: the split and its fill inside the screen, the fill above the split. */
export const glassIssues = (effects: readonly GlassEffect[]): string[] =>
	effects.flatMap((effect) => {
		if (effect.kind !== 'push') return [];
		const [top, bottom] = effect.fill ?? [effect.y - FILL_SHARE, effect.y];
		const issues: string[] = [];
		if (effect.y <= 0 || effect.y >= 1) issues.push(`push y 0 ile 1 arasında olmalı (${effect.y}).`);
		if (!(top >= 0 && bottom <= effect.y && bottom - top >= 0.01)) issues.push(`push fill [${top}, ${bottom}] bölmenin (y ${effect.y}) üstünde ve en az 0,01 yüksek olmalı.`);
		return issues;
	});

/**
 * The drawing on the glass with its moments: `render` draws the screen at its own size (points), `size`. A push draws
 * the drawing in pieces (above the split, the repeated slice, below the split moved down); without one it is drawn once.
 */
export const GlassScreen: React.FC<{size: {width: number; height: number}; effects: readonly GlassEffect[]; render: () => React.ReactNode}> = ({size, effects, render}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const look = useStoryLook();
	const pushes = effects.filter((effect): effect is Extract<GlassEffect, {kind: 'push'}> => effect.kind === 'push');
	const push = [...pushes].reverse().find((effect) => effect.at <= seconds);
	const H = size.height;
	const piece = (key: string, clipTop: number, clipBottom: number, shift: number, left = 0, stretch = 1) => (
		<div key={key} style={{position: 'absolute', left: 0, top: 0, width: size.width, height: H, clipPath: `inset(${clipTop}px 0 ${Math.max(0, H - clipBottom)}px ${left}px)`, transformOrigin: `0 ${clipTop}px`, transform: shift || stretch !== 1 ? `translateY(${shift}px) scaleY(${stretch})` : undefined}}>
			{render()}
		</div>
	);
	let drawing: React.ReactNode = render();
	if (push) {
		const grow = pushAt(push, seconds) * H;
		const [fillTop, fillBottom] = (push.fill ?? [push.y - FILL_SHARE, push.y]).map((share) => share * H);
		const slice = fillBottom - fillTop;
		const split = push.y * H;
		const copies = Math.ceil(grow / slice);
		// The gap's ground: the two points just above the split, stretched over it.
		const row = 2;
		drawing = (
			<>
				{piece('top', 0, split, 0)}
				{grow > 0 ? piece('ground', split - row, split, row, 0, grow / row) : null}
				{Array.from({length: copies}, (_, index) => piece(`fill${index}`, fillTop, fillBottom, split + index * slice - fillTop, (push.inset ?? 0) * size.width))}
				{piece('bottom', split, H, grow)}
			</>
		);
	}
	return (
		<div style={{position: 'relative', width: size.width, height: H, overflow: 'hidden'}}>
			{drawing}
			{effects.map((effect, index) => {
				if (effect.kind === 'swipe') {
					const mark = swipeAt(effect, seconds);
					const ring = size.width * 0.12;
					return (
						<React.Fragment key={index}>
							{mark.shown > 0 ? <div style={{position: 'absolute', left: mark.x * size.width - ring / 2, top: mark.y * H - ring / 2, width: ring, height: ring, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', border: `${ring * 0.06}px solid rgba(15,23,42,0.35)`, boxShadow: '0 4px 14px rgba(15,23,42,0.3)', opacity: mark.shown}} /> : null}
							<SoundEffect id="transitionWhoosh" atSeconds={effect.at} volume={0.35} />
						</React.Fragment>
					);
				}
				if (effect.kind === 'rise') {
					const up = partRiseAt(effect, seconds);
					const box = {left: effect.x * size.width, top: effect.y * H, width: effect.width * size.width, height: effect.height * H};
					return (
						<React.Fragment key={index}>
							{up < 1 || seconds < effect.at + (effect.seconds ?? RISE_SECONDS) ? (
								<div style={{position: 'absolute', ...box, overflow: 'hidden'}}>
									<div style={{position: 'absolute', inset: 0, background: effect.ground ?? '#FFFFFF'}} />
									<div style={{position: 'absolute', left: -box.left, top: -box.top + (1 - up) * box.height, width: size.width, height: H}}>{render()}</div>
								</div>
							) : null}
							<SoundEffect id="puzzleSnap" atSeconds={effect.at + (effect.seconds ?? RISE_SECONDS) * 0.75} volume={0.7} />
						</React.Fragment>
					);
				}
				if (effect.kind === 'tap') {
					const mark = glassTapAt(effect, seconds);
					const ring = size.width * 0.12;
					return (
						<React.Fragment key={index}>
							{mark.ring !== null ? <div style={{position: 'absolute', left: effect.x * size.width - ring, top: effect.y * H - ring, width: ring * 2, height: ring * 2, borderRadius: '50%', border: `${ring * 0.06}px solid ${look.accent}`, opacity: 1 - mark.ring, transform: `scale(${0.3 + 0.9 * mark.ring})`}} /> : null}
							{mark.shown > 0 ? <div style={{position: 'absolute', left: effect.x * size.width - ring / 2, top: effect.y * H - ring / 2, width: ring, height: ring, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', border: `${ring * 0.06}px solid rgba(15,23,42,0.35)`, boxShadow: '0 4px 14px rgba(15,23,42,0.3)', opacity: mark.shown, transform: `scale(${1 - 0.15 * mark.press})`}} /> : null}
							<SoundEffect id="uiTap" atSeconds={effect.at} volume={0.6} />
						</React.Fragment>
					);
				}
				if (effect.kind === 'highlight') {
					const since = seconds - effect.at;
					if (since < 0) return <SoundEffect key={index} id="pop" atSeconds={effect.at} volume={0.6} />;
					const grow = interpolate(since, [0, 0.18, 0.5], [1.12, 0.98, 1], CLAMP);
					const pulse = 0.5 + 0.5 * Math.cos(2 * Math.PI * Math.max(0, since - 0.5) * 1.1);
					return (
						<React.Fragment key={index}>
							<div style={{position: 'absolute', left: effect.x * size.width - 6, top: effect.y * H - 6, width: effect.width * size.width + 12, height: effect.height * H + 12, boxSizing: 'border-box', borderRadius: 24, border: `5px solid ${look.accent}`, boxShadow: `0 0 ${14 + 12 * pulse}px ${look.accent}`, opacity: interpolate(since, [0, 0.12], [0, 1], CLAMP), transform: `scale(${grow})`}} />
							<SoundEffect id="pop" atSeconds={effect.at} volume={0.6} />
						</React.Fragment>
					);
				}
				return null;
			})}
		</div>
	);
};
