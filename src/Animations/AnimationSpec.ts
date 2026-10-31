import {z} from 'zod';
import {EASING_NAMES} from './Motion';

export const ANIMATION_PRESETS = ['none', 'fade', 'slide', 'scale', 'zoom', 'reveal'] as const;
type AnimationPreset = (typeof ANIMATION_PRESETS)[number];

const ANIMATION_DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export type AnimationDirection = (typeof ANIMATION_DIRECTIONS)[number];

/**
 * A serialisable description of an animation. Because it is plain data it can
 * come from a theme, a template or straight from a JSON job.
 */
export const AnimationSpecSchema = z.object({
	preset: z.enum(ANIMATION_PRESETS),
	/** Direction of travel: `up` enters from below, `right` wipes or slides rightwards. */
	direction: z.enum(ANIMATION_DIRECTIONS).optional(),
	durationSeconds: z.number().positive().max(10).optional(),
	delaySeconds: z.number().min(0).max(120).optional(),
	easing: z.enum(EASING_NAMES).optional(),
	/** Slide distance in reference pixels. */
	distance: z.number().min(0).max(2000).optional(),
});

export type AnimationSpec = z.infer<typeof AnimationSpecSchema>;
export type AnimationInput = AnimationSpec | AnimationPreset;

export const normalizeAnimation = (input: AnimationInput): AnimationSpec =>
	typeof input === 'string' ? {preset: input} : input;
