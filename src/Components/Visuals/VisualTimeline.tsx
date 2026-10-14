import React, {createContext, useContext} from 'react';
import {Easing, interpolate} from 'remotion';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette} from './VisualFrame';
import type {VisualBeat} from './VisualSchemas';

/**
 * Keeps a visual in step with what is being said.
 *
 * A card with a visual may be told in beats: each beat is a sentence of the
 * narration with what the figure does while it is said — which parts appear
 * (`show`), which are pointed at (`focus`, the rest dims), where the camera
 * goes (`zoom`), what a coefficient becomes (`params`) and which stage of a
 * process is on (`stage`). The scene knows when each beat's sentence starts
 * and provides it here; visuals ask through the hooks below.
 *
 * Without beats a visual behaves as before: it builds itself in its first
 * seconds, and a process plays its stages one after another.
 */

type Timeline = {beats: readonly VisualBeat[]; starts: readonly number[]; ends: readonly number[]};

const TimelineContext = createContext<Timeline | null>(null);
/** How long the scene lasts, so a visual without beats can spread its stages over the narration. */
const SceneLengthContext = createContext<number | null>(null);

export const VisualTimelineProvider: React.FC<{beats?: readonly VisualBeat[]; starts?: readonly number[]; ends?: readonly number[]; sceneSeconds?: number; children: React.ReactNode}> = ({beats, starts, ends, sceneSeconds, children}) => {
	const inner = !beats?.length || !starts?.length ? <>{children}</> : <TimelineContext.Provider value={{beats, starts, ends: ends ?? starts.map((start, index) => starts[index + 1] ?? start + 6)}}>{children}</TimelineContext.Provider>;
	return <SceneLengthContext.Provider value={sceneSeconds ?? null}>{inner}</SceneLengthContext.Provider>;
};

export const useTimeline = (): Timeline | null => useContext(TimelineContext);

const ease = (from: number, seconds: number, duration: number) =>
	interpolate(seconds, [from, from + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});

/** The beat being said now: -1 before the first one starts. */
export const useBeatIndex = (): number => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	if (!timeline) return -1;
	let index = -1;
	timeline.starts.forEach((start, beat) => {
		if (seconds >= start) index = beat;
	});
	return index;
};

/**
 * How a named part of a figure stands now: `appear` 0→1 when it comes in,
 * `emphasis` 0→1 while a beat points at it, `dim` 0→1 while a beat points at
 * something else. Parts that no beat shows are there from the start (their
 * own drawing animation still plays).
 */
export const useElementState = (id: string | undefined): {appear: number; emphasis: number; dim: number} => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	const current = useBeatIndex();
	if (!timeline || !id) return {appear: 1, emphasis: 0, dim: 0};
	const key = id.toLocaleLowerCase('tr');
	const listed = (list: readonly string[] | undefined) => (list ?? []).some((item) => item.toLocaleLowerCase('tr') === key);
	const introducedAt = timeline.beats.findIndex((beat) => listed(beat.show));
	const appear = introducedAt < 0 ? 1 : ease(timeline.starts[introducedAt], seconds, 0.6);
	if (current < 0) return {appear, emphasis: 0, dim: 0};
	const beat = timeline.beats[current];
	const focused = (beat.focus ?? []).length > 0;
	const ramp = ease(timeline.starts[current], seconds, 0.45);
	if (!focused) {
		// Coming out of a focused beat, the dimming fades back.
		const previous = current > 0 ? timeline.beats[current - 1] : undefined;
		const wasFocused = (previous?.focus ?? []).length > 0;
		return wasFocused ? {appear, emphasis: listed(previous?.focus) ? 1 - ramp : 0, dim: listed(previous?.focus) ? 0 : 1 - ramp} : {appear, emphasis: 0, dim: 0};
	}
	return listed(beat.focus) ? {appear, emphasis: ramp, dim: 0} : {appear, emphasis: 0, dim: ramp};
};

/** Opacity and stroke scale for a part, from its state. */
export const elementLook = (state: {appear: number; emphasis: number; dim: number}) => ({
	opacity: state.appear * (1 - 0.68 * state.dim),
	scale: 1 + 0.5 * state.emphasis,
});

/** A named part of a figure, drawn with its look (for parts drawn inline in a list). */
export const Part: React.FC<{id?: string; children: (look: ReturnType<typeof elementLook>) => React.ReactNode}> = ({id, children}) => <>{children(elementLook(useElementState(id)))}</>;

/**
 * Values of a visual's parameters now. Each beat may set some; a change eases
 * in over 1.4 s from the start of its beat. Without beats a parameter with a
 * `to` sweeps from its `from` once the figure is drawn.
 */
export const useParams = (defaults: Partial<Record<string, {from: number; to?: number}>>, sweep: {delaySeconds: number; seconds: number}): Record<string, number> => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	const values: Record<string, number> = {};
	for (const [name, range] of Object.entries(defaults)) {
		if (!range) continue;
		const {from, to} = range;
		if (!timeline) {
			values[name] = to === undefined ? from : from + (to - from) * ease(sweep.delaySeconds, seconds, sweep.seconds);
			continue;
		}
		let value = from;
		timeline.beats.forEach((beat, index) => {
			const target = (beat.params as Record<string, number> | undefined)?.[name];
			if (target === undefined || seconds < timeline.starts[index]) return;
			value = value + (target - value) * ease(timeline.starts[index], seconds, 1.4);
		});
		values[name] = value;
	}
	return values;
};

/**
 * The stage of a process now, and how far into it: `stage` is the whole
 * stage, `progress` 0→1 across it, `seconds` since it began. With beats, a
 * beat's `stage` (or, when no beat names stages, its position) decides; a
 * stage lasts until the next beat. Without beats the stages share the
 * scene's narration (when the scene says how long it is), each at least 1.2 s;
 * otherwise each lasts `secondsPerStage`.
 */
export const useStageClock = (count: number, {delaySeconds = 0, secondsPerStage: preferred = 3.2} = {}): {stage: number; progress: number; seconds: number; duration: number} => {
	const timeline = useTimeline();
	const sceneLength = useContext(SceneLengthContext);
	const now = useSceneSeconds();
	const current = useBeatIndex();
	if (!timeline) {
		// The last stage should be reached with time to see it: the stages end a second before the scene does.
		const secondsPerStage = sceneLength ? Math.min(preferred * 1.6, Math.max(1.2, (sceneLength - delaySeconds - 1) / count)) : preferred;
		const elapsed = Math.max(0, now - delaySeconds);
		const stage = Math.min(count - 1, Math.floor(elapsed / secondsPerStage));
		const into = elapsed - stage * secondsPerStage;
		const duration = stage === count - 1 ? Math.max(secondsPerStage, into) : secondsPerStage;
		return {stage, progress: Math.min(1, into / secondsPerStage), seconds: into, duration};
	}
	const named = timeline.beats.some((beat) => beat.stage !== undefined);
	const stageOf = (index: number): number => {
		if (index < 0) return 0;
		if (!named) return Math.min(count - 1, index);
		for (let beat = index; beat >= 0; beat--) {
			const value = timeline.beats[beat].stage;
			if (value !== undefined) return Math.min(count - 1, value);
		}
		return 0;
	};
	if (current < 0) return {stage: 0, progress: 0, seconds: 0, duration: 1};
	// A stage that runs over several beats keeps its clock from its first beat.
	let first = current;
	while (first > 0 && stageOf(first - 1) === stageOf(current)) first--;
	let last = current;
	while (last < timeline.beats.length - 1 && stageOf(last + 1) === stageOf(current)) last++;
	const start = timeline.starts[first];
	const duration = Math.max(1, timeline.ends[last] - start);
	return {stage: stageOf(current), progress: Math.min(1, (now - start) / duration), seconds: now - start, duration};
};

/**
 * Moves the camera over the figure: each beat's `zoom` is a part of the
 * drawing as fractions [left, top, right, bottom]; null goes back to the
 * whole. The move takes 1.1 s, and the view never runs past the drawing's edges.
 */
export const BeatCamera: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	if (!timeline) return <>{children}</>;

	const whole: [number, number, number, number] = [0, 0, 1, 1];
	let view = whole;
	timeline.beats.forEach((beat, index) => {
		if (beat.zoom === undefined || seconds < timeline.starts[index]) return;
		const target = beat.zoom ?? whole;
		const t = ease(timeline.starts[index], seconds, 1.1);
		view = view.map((value, side) => value + (target[side] - value) * t) as typeof whole;
	});
	const [left, top, right, bottom] = view;
	// Zoom keeps the proportions: the chosen part is fitted whole, centred.
	const scale = Math.max(1, Math.min(1 / Math.max(0.05, right - left), 1 / Math.max(0.05, bottom - top)));
	const clampShift = (value: number, size: number) => Math.min(0, Math.max(size - size * scale, value));
	const translateX = clampShift(width / 2 - ((left + right) / 2) * width * scale, width);
	const translateY = clampShift(height / 2 - ((top + bottom) / 2) * height * scale, height);

	return (
		<div style={{position: 'relative', width, height, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`}}>{children}</div>
		</div>
	);
};

/** Height kept under a figure for its beats' notes, so a note never covers the drawing. */
export const useNoteSpace = (): number => {
	const timeline = useTimeline();
	const {u} = useVideoLayout();
	return timeline?.beats.some((beat) => beat.note) ? u(64) : 0;
};

/** The current beat's short note, under the figure. */
export const BeatNote: React.FC = () => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	const current = useBeatIndex();
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const space = useNoteSpace();
	if (!timeline || !space) return null;
	const note = current >= 0 ? timeline.beats[current].note : undefined;
	const show = current >= 0 ? ease(timeline.starts[current] + 0.2, seconds, 0.4) : 0;
	return (
		<div style={{height: space, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0}}>
			{note ? (
				<div style={{transform: `translateY(${(1 - show) * u(16)}px)`, opacity: show, maxWidth: '92%', padding: `${u(10)}px ${u(22)}px`, borderRadius: u(999), backgroundColor: palette.lesson, color: palette.onLesson, fontFamily: palette.fontDisplay, fontWeight: 800, fontSize: u(28), textAlign: 'center', lineHeight: 1.2}}>
					{note}
				</div>
			) : null}
		</div>
	);
};
