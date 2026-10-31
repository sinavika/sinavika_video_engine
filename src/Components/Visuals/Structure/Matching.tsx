import React from 'react';
import {clamp01, easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichText} from '../../Typography/RichText';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type Matching = Extract<CourseVisual, {kind: 'matching'}>;

const SLOTS = 6;
const LINE_SECONDS = 0.8;
const FOCUS_GROWTH = 0.04;

/** A small seeded random generator (mulberry32), so a board is shuffled the same way in every frame and render. */
const seeded = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

/**
 * Where each right-hand partner stands: a shuffle seeded by the pairs' text, so the same board always looks the same.
 * No partner stands level with its term, and from four pairs on the order is not a plain rotation either (every item
 * one place lower, 29 Oct 2026: a student read the pattern instead of the content). Two or three pairs can only rotate.
 */
export const matchingSlots = (pairs: readonly {left: string; right: string}[]): number[] => {
	const count = pairs.length;
	const text = pairs.map((pair) => pair.left + '|' + pair.right).join('#');
	let hash = 2166136261;
	for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
	const random = seeded(hash);
	const isRotation = (slots: number[]) => slots.every((slot, pair) => slot === (pair + slots[0]) % count);
	for (let attempt = 0; attempt < 200; attempt++) {
		const slots = Array.from({length: count}, (_, index) => index);
		for (let index = count - 1; index > 0; index--) {
			const other = Math.floor(random() * (index + 1));
			[slots[index], slots[other]] = [slots[other], slots[index]];
		}
		const deranged = slots.every((slot, pair) => slot !== pair);
		if (deranged && (count < 4 || !isRotation(slots))) return slots;
	}
	return Array.from({length: count}, (_, pair) => (pair + 1) % count);
};

/**
 * A matching exercise: terms on the left, their partners on the right in a shuffled order (matchingSlots), and a
 * line drawn from a term to its partner when the narration reaches the pair (parts p1…). Lines stay once drawn, so
 * the board fills up as the lesson goes; without beats the pairs connect one after another.
 */
export const MatchingVisual: React.FC<VisualBoxProps & {visual: Matching}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const count = visual.pairs.length;
	// One hook call per slot so the hook order never changes.
	const looks = Array.from({length: SLOTS}, (_, index) => useElementState(index < count ? `p${index + 1}` : undefined));
	const starts = Array.from({length: SLOTS}, (_, index) => useBeatStartFor(`p${index + 1}`, 'focus'));
	const header = useReveal(delaySeconds, 0.4);
	const board = useReveal(delaySeconds + 0.2, 0.5);

	const titleHeight = visual.titles ? u(64) : 0;
	const gap = u(16);
	const rowHeight = (height - titleHeight - gap * (count - 1)) / count;
	const columnWidth = width * 0.4;
	const rightX = width - columnWidth;
	// Short items that fit on one line grow with the row (a six-pair board of quotes stayed at the smallest size with
	// half the row empty, 30 Oct 2026); items that wrap keep the two-line size.
	const longest = Math.max(...visual.pairs.flatMap((pair) => [pair.left, pair.right]).map((text) => text.replace(/\*\*/g, '').length));
	const oneLine = Math.min(rowHeight * 0.45, (columnWidth - 2 * u(18)) / (longest * 0.62));
	const fontSize = Math.max(22, Math.min(40, Math.max(rowHeight * 0.3, oneLine) / u(1)));
	const slots = matchingSlots(visual.pairs);
	const slotOf = (pair: number) => slots[pair];
	const centreY = (slot: number) => titleHeight + slot * (rowHeight + gap) + rowHeight / 2;
	const drawn = (pair: number) => {
		const start = starts[pair] ?? delaySeconds + 0.9 + pair * 1.1;
		return easeFrom(seconds, start, LINE_SECONDS);
	};

	const chip = (text: string, x: number, y: number, look: {appear: number; emphasis: number; dim: number}, joined: number, side: 'left' | 'right') => (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y - rowHeight / 2,
				width: columnWidth,
				height: rowHeight,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: `0 ${u(18)}px`,
				boxSizing: 'border-box',
				borderRadius: u(22),
				border: `${u(4)}px solid ${joined > 0.5 || look.emphasis > 0.5 ? palette.lesson : palette.border}`,
				backgroundColor: side === 'left' ? withAlpha(palette.lesson, 0.1 + 0.25 * look.emphasis) : withAlpha(palette.surface, 1),
				// Every item is on the board from the start (the lines are what the narration brings).
				opacity: Math.max(look.appear, board) * (1 - UNFOCUSED_FADE * look.dim),
				// A focused chip grows away from the frame edge (left column from its left side, right column from its right
				// side), so the enlarged border is never clipped by the visual box (29 Oct 2026, BM kuruluşları board).
				transform: `scale(${1 + FOCUS_GROWTH * look.emphasis})`,
				transformOrigin: side === 'left' ? 'left center' : 'right center',
			}}
		>
			<RichText text={text} size={fontSize} weight={side === 'left' ? 800 : 600} align="center" />
		</div>
	);

	return (
		<div style={{position: 'relative', width, height}}>
			{visual.titles ? (
				<div style={{position: 'absolute', left: 0, top: 0, width, display: 'flex', justifyContent: 'space-between', opacity: header}}>
					{visual.titles.map((title, index) => (
						<div key={index} style={{width: columnWidth}}>
							<RichText text={title} size={28} weight={800} align="center" color={palette.muted} />
						</div>
					))}
				</div>
			) : null}
			<svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				{visual.pairs.map((_, pair) => {
					const progress = drawn(pair);
					if (progress <= 0.001) return null;
					const look = looks[pair];
					// The line meets the chip's edge, which moves when a focused chip grows.
					const x0 = columnWidth * (1 + FOCUS_GROWTH * look.emphasis);
					const y0 = centreY(pair);
					const x1 = rightX - columnWidth * FOCUS_GROWTH * look.emphasis;
					const y1 = centreY(slotOf(pair));
					const d = `M${x0} ${y0} C${x0 + (x1 - x0) * 0.45} ${y0} ${x1 - (x1 - x0) * 0.45} ${y1} ${x1} ${y1}`;
					const length = Math.hypot(x1 - x0, y1 - y0) * 1.15;
					return (
						<g key={pair} opacity={1 - UNFOCUSED_FADE * look.dim}>
							<path d={d} fill="none" stroke={palette.lesson} strokeWidth={u(6 + 3 * look.emphasis)} strokeLinecap="round" strokeDasharray={`${length * progress} ${length}`} />
							<circle cx={x0} cy={y0} r={u(9)} fill={palette.lesson} />
							<circle cx={x1} cy={y1} r={u(9)} fill={palette.lesson} opacity={clamp01(progress * 3 - 2)} />
						</g>
					);
				})}
			</svg>
			{visual.pairs.map((pair, index) => (
				<React.Fragment key={index}>
					{chip(pair.left, 0, centreY(index), looks[index], drawn(index), 'left')}
					{chip(pair.right, rightX, centreY(slotOf(index)), looks[index], drawn(index), 'right')}
				</React.Fragment>
			))}
		</div>
	);
};
