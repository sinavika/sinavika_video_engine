import type {CSSProperties} from 'react';
import type {AnimationDirection, AnimationSpec} from './AnimationSpec';
import {clamp01} from './Motion';

const DEFAULT_SLIDE_DISTANCE = 64;

const SLIDE_ORIGIN: Record<AnimationDirection, [number, number]> = {
	up: [0, 1],
	down: [0, -1],
	left: [1, 0],
	right: [-1, 0],
};

const revealInset = (direction: AnimationDirection, hidden: number): string => {
	const amount = `${(clamp01(hidden) * 100).toFixed(3)}%`;
	switch (direction) {
		case 'right':
			return `inset(0 ${amount} 0 0)`;
		case 'left':
			return `inset(0 0 0 ${amount})`;
		case 'down':
			return `inset(0 0 ${amount} 0)`;
		case 'up':
			return `inset(${amount} 0 0 0)`;
	}
};

/**
 * Maps an animation and its progress (0 = hidden, 1 = settled) to CSS.
 * Only opacity, transform and clip-path are animated, so an animating element
 * never changes the layout around it.
 */
export const animationStyle = (spec: AnimationSpec, progress: number, unit = 1): CSSProperties => {
	const remaining = 1 - progress;
	switch (spec.preset) {
		case 'none':
			return {};
		case 'fade':
			return {opacity: clamp01(progress)};
		case 'slide': {
			const [x, y] = SLIDE_ORIGIN[spec.direction ?? 'up'];
			const distance = (spec.distance ?? DEFAULT_SLIDE_DISTANCE) * unit * remaining;
			return {
				opacity: clamp01(progress * 2),
				transform: `translate(${(x * distance).toFixed(3)}px, ${(y * distance).toFixed(3)}px)`,
			};
		}
		case 'scale':
			return {
				opacity: clamp01(progress * 2),
				transform: `scale(${(0.8 + 0.2 * progress).toFixed(4)})`,
			};
		case 'zoom':
			return {
				opacity: clamp01(progress * 1.5),
				transform: `scale(${(1.35 - 0.35 * progress).toFixed(4)})`,
			};
		case 'reveal':
			return {
				opacity: progress <= 0 ? 0 : 1,
				clipPath: revealInset(spec.direction ?? 'right', remaining),
			};
	}
};
