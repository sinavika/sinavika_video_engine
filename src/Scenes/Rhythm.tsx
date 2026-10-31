import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateScene} from './ScenePlan';

/**
 * Cutting on the beat. A video with music gets the music's beat grid
 * (Services/MusicBeats, in seconds from the start); every scene but the last
 * is held until the next beat, at most one beat longer, so each cut and the
 * end card land on a beat. The narration is untouched: a scene only gains a
 * moment of silence at its end. Inside a scene, `useBeat` tells where the
 * beats fall, so a template can make something happen on every beat.
 */

/** The beat grid: when each beat falls, in seconds from the video's start. */
export type Beats = readonly number[];

/** The time between beats: the median gap, so one missed beat does not skew it. */
export const beatInterval = (beats: Beats | undefined): number | undefined => {
	if (!beats || beats.length < 3) return undefined;
	const gaps = beats.slice(1).map((beat, index) => beat - beats[index]).sort((a, b) => a - b);
	return gaps[Math.floor(gaps.length / 2)];
};

/** The scenes with every cut moved to the next beat (never more than one beat later). */
export const snapScenesToBeats = (scenes: TemplateScene[], beats: Beats | undefined): TemplateScene[] => {
	const interval = beatInterval(beats);
	if (!beats || !interval) return scenes;
	let start = 0;
	return scenes.map((scene, index) => {
		if (index === scenes.length - 1) return scene;
		const end = start + scene.seconds;
		const next = beats.find((beat) => beat >= end - 0.02);
		const shift = next === undefined ? 0 : next - end;
		const seconds = shift > 0 && shift <= interval ? scene.seconds + shift : scene.seconds;
		start += seconds;
		return seconds === scene.seconds ? scene : {...scene, seconds};
	});
};

const RhythmContext = createContext<number | undefined>(undefined);

/** Gives the scenes below it the video's beat interval. */
export const RhythmProvider: React.FC<{beats?: Beats; children: React.ReactNode}> = ({beats, children}) => <RhythmContext.Provider value={beatInterval(beats)}>{children}</RhythmContext.Provider>;

/** Without music the grid is 120 BPM, the tempo the reels are asked for. */
const DEFAULT_INTERVAL = 0.5;

/**
 * The beat inside a scene: scenes start on a beat, so the beats of a scene
 * fall every `interval` seconds from its first frame. `index` is the beat
 * being played, `phase` how far into it (0 to 1), `hit` a pulse that is 1 on
 * the beat and fades quickly, for a small accent on each beat.
 */
export const useBeat = () => {
	const interval = useContext(RhythmContext) ?? DEFAULT_INTERVAL;
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const index = Math.floor(seconds / interval);
	const phase = (seconds - index * interval) / interval;
	return {interval, index, phase, hit: Math.exp(-phase * 6), at: (beat: number) => beat * interval};
};
