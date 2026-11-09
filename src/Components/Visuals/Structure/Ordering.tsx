import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichText} from '../../Typography/RichText';
import {useFigureFont, useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';
import {shuffledSlots} from './BoardShuffle';
import {matchingFontSize} from './Matching';

type Ordering = Extract<CourseVisual, {kind: 'ordering'}>;

const SLOTS = 6;
const MOVE_SECONDS = 0.8;
/** A row never grows taller than this (layout units): three short steps would otherwise fill the box with empty chips. */
const MOST_ROW = 170;

/**
 * Which slot every item stands in once the items in `placed` have moved to their own: placed items in their slot,
 * the others in the slots left free, keeping the order they stood in on the shuffled board.
 */
export const orderingLayout = (start: readonly number[], placed: ReadonlySet<number>): number[] => {
	const free = start.map((_, slot) => slot).filter((slot) => !placed.has(slot));
	const waiting = start.map((slot, item) => ({slot, item})).filter(({item}) => !placed.has(item)).sort((a, b) => a.slot - b.slot);
	const layout = start.map((_, item) => item);
	waiting.forEach(({item}, index) => (layout[item] = free[index]));
	return layout;
};

/**
 * Where every item stands at `seconds` (in slots, fractional while it moves): the board as shuffled until the first
 * item is placed; at each placing the items glide from the layout before it to the layout after it.
 */
export const orderingPositions = (start: readonly number[], placedAt: readonly number[], seconds: number): number[] => {
	const times = [...new Set(placedAt.filter((time) => time <= seconds))].sort((a, b) => a - b);
	if (times.length === 0) return [...start];
	const last = times[times.length - 1];
	const before = orderingLayout(start, new Set(placedAt.flatMap((time, item) => (time < last ? [item] : []))));
	const after = orderingLayout(start, new Set(placedAt.flatMap((time, item) => (time <= last ? [item] : []))));
	const move = easeFrom(seconds, last, MOVE_SECONDS);
	return after.map((slot, item) => before[item] + (slot - before[item]) * move);
};

/**
 * An ordering exercise (the app's ordering step on video): numbered places down the left, the items shuffled beside
 * them. When the narration reaches an item (parts p1…, written in the right order) it glides to its place, the other
 * items making room, and its number lights. Placed items stay; without beats they move one after another.
 */
export const OrderingVisual: React.FC<VisualBoxProps & {visual: Ordering}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {typography} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const count = visual.items.length;
	// One hook call per slot so the hook order never changes.
	const looks = Array.from({length: SLOTS}, (_, index) => useElementState(index < count ? `p${index + 1}` : undefined));
	const starts = Array.from({length: SLOTS}, (_, index) => useBeatStartFor(`p${index + 1}`, 'focus'));
	const board = useReveal(delaySeconds, 0.5);
	const least = useFigureFont()(16);

	const gap = u(16);
	const rowHeight = Math.min(u(MOST_ROW), (height - gap * (count - 1)) / count);
	const top = (height - (rowHeight * count + gap * (count - 1))) / 2;
	const badge = Math.min(rowHeight * 0.72, u(84));
	const chipLeft = badge + u(28);
	// A focused item grows by 3 % and a moving one steps right: the chip keeps that much room inside the box.
	const chipWidth = (width - chipLeft - u(24)) / 1.03;
	const texts = visual.items.map((item) => (item.detail ? `${item.label} ${item.detail}` : item.label));
	const fontSize = matchingFontSize(texts, chipWidth, rowHeight, u, least);
	const start = shuffledSlots(visual.items.map((item) => item.label));
	const placedAt = visual.items.map((_, item) => starts[item] ?? delaySeconds + 1 + item * 1.1);
	const positions = orderingPositions(start, placedAt, seconds);
	const yOf = (slot: number) => top + slot * (rowHeight + gap);

	return (
		<div style={{position: 'relative', width, height, opacity: board}}>
			{visual.items.map((_, slot) => {
				// A place lights when its own item has arrived.
				const filled = easeFrom(seconds, placedAt[slot] + MOVE_SECONDS * 0.6, 0.3);
				return (
					<div
						key={`slot-${slot}`}
						style={{
							position: 'absolute',
							left: 0,
							top: yOf(slot) + (rowHeight - badge) / 2,
							width: badge,
							height: badge,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxSizing: 'border-box',
							border: `${u(4)}px solid ${filled > 0.5 ? palette.lesson : palette.border}`,
							backgroundColor: withAlpha(palette.lesson, filled),
							color: filled > 0.5 ? palette.onLesson : palette.muted,
							fontFamily: typography.display,
							fontWeight: BRAND_TYPOGRAPHY.weights.kinetic,
							fontSize: badge * 0.46,
						}}
					>
						{slot + 1}
					</div>
				);
			})}
			{visual.items.map((item, index) => {
				const look = looks[index];
				const placed = easeFrom(seconds, placedAt[index], MOVE_SECONDS);
				const moving = placed > 0 && placed < 1;
				return (
					<div
						key={`item-${index}`}
						style={{
							position: 'absolute',
							left: chipLeft,
							top: yOf(positions[index]),
							width: chipWidth,
							height: rowHeight,
							zIndex: moving ? 2 : 1,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start',
							justifyContent: 'center',
							gap: u(4),
							padding: `0 ${u(30)}px`,
							boxSizing: 'border-box',
							borderRadius: u(22),
							border: `${u(4)}px solid ${placed > 0.5 || look.emphasis > 0.5 ? palette.lesson : palette.border}`,
							backgroundColor: placed > 0.5 ? withAlpha(palette.lesson, 0.1 + 0.2 * look.emphasis) : palette.surface,
							boxShadow: moving ? `0 ${u(12)}px ${u(28)}px ${withAlpha('#000000', 0.18)}` : 'none',
							opacity: 1 - UNFOCUSED_FADE * look.dim,
							// A moving item lifts a little off the board, so it reads as carried to its place.
							transform: `translateX(${u(18) * Math.sin(Math.PI * placed)}px) scale(${1 + 0.03 * look.emphasis})`,
							transformOrigin: 'left center',
						}}
					>
						<RichText text={item.label} size={fontSize} weight={800} />
						{item.detail ? <RichText text={item.detail} size={fontSize * 0.78} weight={500} color={palette.muted} /> : null}
					</div>
				);
			})}
		</div>
	);
};
