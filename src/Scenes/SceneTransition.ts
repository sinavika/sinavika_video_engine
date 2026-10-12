import type {TransitionPresentation} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {z} from 'zod';

export const SCENE_TRANSITION_PRESETS = ['none', 'fade', 'slide'] as const;
export const SCENE_TRANSITION_DIRECTIONS = [
	'from-left',
	'from-right',
	'from-top',
	'from-bottom',
] as const;

export const SceneTransitionSchema = z.object({
	preset: z.enum(SCENE_TRANSITION_PRESETS),
	direction: z.enum(SCENE_TRANSITION_DIRECTIONS).optional(),
	durationSeconds: z.number().min(0).max(3).optional(),
});

export type SceneTransition = z.infer<typeof SceneTransitionSchema>;

const DEFAULT_TRANSITION_SECONDS = 0.4;

export const transitionSeconds = (transition: SceneTransition): number =>
	transition.preset === 'none' ? 0 : (transition.durationSeconds ?? DEFAULT_TRANSITION_SECONDS);

type Presentation = TransitionPresentation<Record<string, unknown>>;

/**
 * Scenes are transparent and share one background that never moves, so only
 * transitions that take the outgoing scene away (cross-fade, push) are offered.
 * A wipe would leave the old scene visible underneath the new one.
 */
export const toPresentation = (transition: SceneTransition): Presentation => {
	switch (transition.preset) {
		case 'slide':
			return slide({direction: transition.direction ?? 'from-right'}) as Presentation;
		case 'fade':
		case 'none':
			return fade({shouldFadeOutExitingScene: true}) as Presentation;
	}
};
