import React from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, useElementState} from '../VisualTimeline';

type Timeline = Extract<CourseVisual, {kind: 'timeline'}>;

const yearText = (year: number, era: Timeline['era']): string => {
	if (era === 'hijri') return `${year} H.`;
	return year < 0 ? `MÖ ${-year}` : String(year);
};

/**
 * Type sizes of a timeline's year, label and detail: a short timeline (five events or fewer) reads larger, a crowded
 * one keeps the small sizes (a five-event timeline of Christianity had its details at 22 with half the card empty,
 * 30 Oct 2026).
 */
const timelineType = (count: number) => (count <= 5 ? {year: 44, label: 32, detail: 26} : count === 6 ? {year: 40, label: 30, detail: 24} : {year: 38, label: 28, detail: 22});

type TimelineType = ReturnType<typeof timelineType>;

/**
 * Dated events on one line, spaced by time (not evenly), so gaps between
 * events can be seen. Labels alternate above and below the line, and each
 * event appears in turn.
 */
export const TimelineVisual: React.FC<VisualBoxProps & {visual: Timeline}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const events = [...visual.events].sort((a, b) => a.year - b.year);
	const type = timelineType(events.length);
	const [first, last] = [events[0].year, events[events.length - 1].year];
	const pad = u(90);
	const labelWidth = Math.min(u(320), (width - pad * 2) / Math.max(1, events.length - 1) + u(140));
	// Dates bunched at one end (1897, 1911, 1913, 1926 after 1803) left no room for their labels even with the label
	// slots below; the line then leans towards even spacing, keeping the order and some of the real gaps.
	const span = width - pad * 2;
	const proportional = events.map((event) => (event.year - first) / Math.max(1, last - first));
	const tightest = Math.min(Infinity, ...proportional.slice(1).map((share, index) => (share - proportional[index]) * span));
	const blend = tightest < labelWidth * 0.5 ? 0.6 : 0;
	const shareOfYear = new Map(events.map((event, index) => [event.year, proportional[index] * (1 - blend) + (index / Math.max(1, events.length - 1)) * blend]));
	const xOf = (year: number) => pad + (shareOfYear.get(year) ?? (year - first) / Math.max(1, last - first)) * span;
	const lineY = height / 2;
	const axis = useReveal(delaySeconds, 0.7);
	// Labels alternate above and below the line. Each label's real extent (its longest line, where its box is aligned)
	// is checked against the last label in each of four slots: above and below, near the line and one row further out.
	// A label takes the first free slot (its own side first), so close dates (1989, 1991) or a crowded end of the line
	// (İbn Rüşd 1126, Ockham 1287) do not print over each other; with no free slot it takes the least crowded one.
	// The far row's text must end inside the figure: its stem clears the tallest near label where there is room and is
	// cut short so the tallest label still fits, down to a short step that keeps the two rows apart (1880 above and
	// 1886 below a crowded 19th century ran off a 610 px card when the room was reckoned for three short lines).
	const tallest = Math.max(...events.map((event) => timelineTextHeight(event, labelWidth, u, type)));
	const room = height / 2 - u(TIMELINE_STEM);
	const farRow = room - tallest >= u(TIMELINE_ROW_MIN);
	const row = farRow ? Math.min(room - tallest, Math.max(u(TIMELINE_ROW), tallest + u(16))) : 0;
	// When a slot is short of room, a centred label may lean: the new one to the right of its event (start-aligned) or
	// the one before it to the left (end-aligned), whichever makes room without touching a third label.
	type Placed = {above: boolean; far: boolean; align?: TimelineAlign; backdrop?: boolean};
	const placements: Placed[] = (() => {
		const gap = u(16);
		const history: Record<string, number[]> = {};
		const placed: Placed[] = [];
		const extentOf = (index: number, align?: TimelineAlign) => labelExtent(xOf(events[index].year), labelWidth, width, events[index], yearText(events[index].year, visual.era), u, type, align);
		const rightOf = (slot: string, back: number) => {
			const list = history[slot] ?? [];
			const index = list[list.length - 1 - back];
			return index === undefined ? -Infinity : extentOf(index, placed[index].align).right;
		};
		const fit = (index: number, slot: string): {align?: TimelineAlign; previous?: TimelineAlign} | null => {
			// A far-row label's stem must not run through a near-row label on its side.
			if (slot.endsWith('1')) {
				const x = xOf(events[index].year);
				const near = history[`${slot.slice(0, -1)}0`] ?? [];
				if (near.some((other) => {
					const extent = extentOf(other, placed[other].align);
					return extent.left - gap < x && x < extent.right + gap;
				})) return null;
			}
			const list = history[slot] ?? [];
			const previous = list[list.length - 1];
			const own = extentOf(index);
			const centredFree = (left: number) => rightOf(slot, 0) + gap <= left;
			if (centredFree(own.left)) return {};
			const leaning = extentOf(index, 'start');
			if (timelineLabelBox(xOf(events[index].year), labelWidth, width, u).align === 'center' && leaning.right <= width && centredFree(leaning.left)) return {align: 'start'};
			if (previous !== undefined && placed[previous].align === undefined && timelineLabelBox(xOf(events[previous].year), labelWidth, width, u).align === 'center') {
				const moved = extentOf(previous, 'end');
				if (moved.left >= rightOf(slot, 1) + gap) {
					if (moved.right + gap <= own.left) return {previous: 'end'};
					if (leaning.right <= width && moved.right + gap <= leaning.left) return {align: 'start', previous: 'end'};
				}
			}
			return null;
		};
		events.forEach((_, index) => {
			const preferred = index % 2 === 0 ? 'above' : 'below';
			const other = preferred === 'above' ? 'below' : 'above';
			const slots = [`${preferred}0`, `${other}0`, ...(farRow ? [`${preferred}1`, `${other}1`] : [])];
			const found = slots.map((slot) => ({slot, fit: fit(index, slot)})).find((option) => option.fit !== null);
			const slot = found?.slot ?? slots.reduce((best, slot) => (rightOf(slot, 0) < rightOf(best, 0) ? slot : best));
			const list = history[slot] ?? [];
			if (found?.fit?.previous) placed[list[list.length - 1]].align = found.fit.previous;
			placed.push({above: slot.startsWith('above'), far: slot.endsWith('1'), align: found?.fit?.align});
			history[slot] = [...list, index];
		});
		// When a crowded line leaves a far-row stem no way past a near-row label, that label gets a backdrop in the
		// scene's colour, so the stem passes behind it instead of through its letters.
		placed.forEach((placement, index) => {
			if (!placement.far) return;
			const x = xOf(events[index].year);
			placed.forEach((other, near) => {
				if (other.far || other.above !== placement.above) return;
				const extent = extentOf(near, other.align);
				if (extent.left - gap < x && x < extent.right + gap) other.backdrop = true;
			});
		});
		return placed;
	})();

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<line x1={pad - u(40)} x2={pad - u(40) + (width - pad * 2 + u(80)) * axis} y1={lineY} y2={lineY} stroke={palette.ink} strokeWidth={u(6)} strokeLinecap="round" />
			{/* Stems and dots first, labels over them: a far-row stem passes behind a near-row label, never over its text. */}
			{(['stem', 'label'] as const).map((layer) =>
				events.map((event, index) => (
					<TimelineEvent key={`${layer}-${event.year}-${index}`} layer={layer} id={`e${index + 1}`} x={xOf(event.year)} lineY={lineY} above={placements[index].above} far={placements[index].far} lean={placements[index].align} backdrop={placements[index].backdrop} row={row} boxHeight={Math.max(u(TIMELINE_BOX), timelineTextHeight(event, labelWidth, u, type) * 1.2)} type={type} year={yearText(event.year, visual.era)} label={event.label} detail={event.detail} delaySeconds={delaySeconds + 0.5 + index * 0.4} width={labelWidth} areaWidth={width} />
				)),
			)}
		</svg>
	);
};

/** Stem, the far row's least extra stem and label box height of a timeline event, in layout units. */
const TIMELINE_STEM = 70;

const TIMELINE_ROW = 118;

const TIMELINE_ROW_MIN = 80;

const TIMELINE_BOX = 150;

/** Where an event's label box sits: centred on the event, or kept inside the figure and aligned to the end it is near. */
type TimelineAlign = 'start' | 'end' | 'center';

const timelineLabelBox = (x: number, width: number, areaWidth: number, u: (value: number) => number, lean?: TimelineAlign) => {
	const centred = x - width / 2;
	const align: TimelineAlign = centred < 0 ? 'start' : centred + width > areaWidth ? 'end' : lean ?? 'center';
	const boxX = align === 'start' ? Math.max(0, x - u(24)) : align === 'end' ? Math.min(areaWidth - width, x + u(24) - width) : centred;
	return {align, boxX};
};

/** How tall a label's text is: the year, the label and the detail, each wrapped to the box width (with some slack, since
 * words break early). */
const timelineTextHeight = (event: Timeline['events'][number], width: number, u: (value: number) => number, type: TimelineType): number => {
	const lines = (text: string, size: number, em: number) => Math.max(1, Math.ceil((text.length * u(size) * em) / (width * 0.9)));
	const detail = event.detail ? u(4) + lines(event.detail, type.detail, 0.5) * u(type.detail) * 1.2 : 0;
	return u(type.year) + u(4) + lines(event.label, type.label, 0.54) * u(type.label) * 1.15 + detail;
};

/** The horizontal span a label's text takes: its longest line (measured em per letter of each line's type), placed as its box aligns it. */
const labelExtent = (x: number, width: number, areaWidth: number, event: Timeline['events'][number], year: string, u: (value: number) => number, type: TimelineType, lean?: TimelineAlign) => {
	const {align, boxX} = timelineLabelBox(x, width, areaWidth, u, lean);
	const text = Math.min(width, Math.max(year.length * u(type.year) * 0.58, event.label.length * u(type.label) * 0.54, (event.detail?.length ?? 0) * u(type.detail) * 0.5));
	if (align === 'start') return {left: boxX, right: boxX + text};
	if (align === 'end') return {left: boxX + width - text, right: boxX + width};
	return {left: x - text / 2, right: x + text / 2};
};

const TimelineEvent: React.FC<{layer: 'stem' | 'label'; id: string; x: number; lineY: number; above: boolean; far?: boolean; lean?: TimelineAlign; backdrop?: boolean; row: number; boxHeight: number; type: TimelineType; year: string; label: string; detail?: string; delaySeconds: number; width: number; areaWidth: number}> = ({layer, id, x, lineY, above, far = false, lean, backdrop = false, row, boxHeight, type, year, label, detail, delaySeconds, width, areaWidth}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const show = useReveal(delaySeconds, 0.45, 'overshoot') * look.opacity;
	const stem = u(TIMELINE_STEM) + (far ? row : 0);
	// The box is as tall as its text needs (a label that wraps to two lines would push the year out of a fixed box).
	const boxY = above ? lineY - stem - boxHeight : lineY + stem;
	// A label centred on an event near either end would leave the figure: it is kept inside and aligned to that end.
	const {align, boxX} = timelineLabelBox(x, width, areaWidth, u, lean);
	if (layer === 'stem') {
		return (
			<g opacity={Math.min(1, show)}>
				<line x1={x} x2={x} y1={lineY} y2={above ? lineY - stem : lineY + stem} stroke={palette.lesson} strokeWidth={u(4)} />
				<circle cx={x} cy={lineY} r={u(16) * show * look.scale} fill={palette.lesson} stroke={palette.surface} strokeWidth={u(5)} />
			</g>
		);
	}
	const halo = `0 0 ${u(5)}px ${palette.surface}, 0 0 ${u(5)}px ${palette.surface}, 0 0 ${u(5)}px ${palette.surface}`;
	return (
		<g opacity={Math.min(1, show)}>
			<foreignObject x={boxX} y={boxY} width={width} height={boxHeight}>
				<div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: above ? 'flex-end' : 'flex-start', alignItems: align === 'center' ? 'center' : `flex-${align}`, textAlign: align === 'center' ? 'center' : align === 'start' ? 'left' : 'right', fontFamily: palette.fontBody, textShadow: halo}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'inherit', gap: u(4), padding: backdrop ? `${u(4)}px ${u(8)}px` : 0, margin: backdrop ? `0 ${u(-8)}px` : 0, borderRadius: u(8), backgroundColor: backdrop ? palette.background : 'transparent'}}>
						<div style={{fontFamily: palette.fontDisplay, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(type.year), color: palette.lesson, lineHeight: 1}}>{year}</div>
						<div style={{fontWeight: 700, fontSize: u(type.label), color: palette.ink, lineHeight: 1.15}}>{label}</div>
						{detail ? <div style={{fontSize: u(type.detail), color: palette.muted, lineHeight: 1.2}}>{detail}</div> : null}
					</div>
				</div>
			</foreignObject>
		</g>
	);
};
