import type {ReactNode} from 'react';
import {secondsToFrames} from '../Animations/Motion';
import type {SceneTransition} from './SceneTransition';
import type {VoiceSlot} from './Voiceover';

/**
 * Scene timing lives here; animation timing lives in src/Animations.
 * A scene only says how long it stays on screen. What moves inside it, and
 * when, is decided by the animation components relative to the scene start.
 */
export type SceneTiming = {id: string; seconds: number};

/** A scene as a template describes it: an id, a duration, what to draw and what to say. */
export type TemplateScene = SceneTiming & {
	element: ReactNode;
	label?: string;
	/** Starts a chapter of the video with this title (YouTube chapters, the chapter bar). See SceneChapters. */
	chapter?: string;
	/** How this scene comes in, instead of the template's transition (its length stays the template's). E.g. a section opening slides up while cards cross-fade. */
	transitionIn?: SceneTransition;
	/** Spoken lines, played one after another from the start of the scene. */
	voice?: VoiceSlot[];
	/** Shown, never spoken: e.g. a promotion at the end of a lesson. Its length is its own, not the narration's. */
	silent?: boolean;
};

export type PlannedScene = {id: string; from: number; durationInFrames: number};

export type ScenePlan = {
	scenes: PlannedScene[];
	durationInFrames: number;
	transitionFrames: number;
};

/**
 * Converts scene durations to frame ranges. Consecutive scenes overlap by the
 * transition length, so the total is the sum of scenes minus the overlaps.
 */
export const planScenes = (
	timings: readonly SceneTiming[],
	fps: number,
	transitionSeconds = 0,
): ScenePlan => {
	const transitionFrames = timings.length > 1 ? secondsToFrames(transitionSeconds, fps) : 0;
	const minimumFrames = transitionFrames * 2 + 1;
	let cursor = 0;
	const scenes = timings.map((timing, index) => {
		const durationInFrames = Math.max(minimumFrames, secondsToFrames(timing.seconds, fps));
		const from = index === 0 ? 0 : cursor - transitionFrames;
		cursor = from + durationInFrames;
		return {id: timing.id, from, durationInFrames};
	});
	return {scenes, durationInFrames: Math.max(1, cursor), transitionFrames};
};

/** Progress of every scene at `frame`: 0 before it starts, 1 once it is over. */
export const sceneProgressAt = (plan: ScenePlan, frame: number): number[] =>
	plan.scenes.map((scene) =>
		Math.min(1, Math.max(0, (frame - scene.from) / scene.durationInFrames)),
	);

export const activeSceneIndex = (plan: ScenePlan, frame: number): number => {
	let active = 0;
	plan.scenes.forEach((scene, index) => {
		if (frame >= scene.from) active = index;
	});
	return active;
};
