import {describe, expect, it} from 'vitest';
import {ANIMATION_PRESETS, AnimationSpecSchema, normalizeAnimation} from '../../src/Animations/AnimationSpec';
import {animationStyle} from '../../src/Animations/AnimationStyle';
import {EASING_NAMES, animationProgress, typewriterLength} from '../../src/Animations/Motion';

describe('animationProgress', () => {
	it('is 0 before the delay and 1 after the animation', () => {
		const input = {fps: 30, delaySeconds: 1, durationSeconds: 0.5};
		expect(animationProgress({...input, frame: 0})).toBe(0);
		expect(animationProgress({...input, frame: 30})).toBe(0);
		expect(animationProgress({...input, frame: 45})).toBe(1);
		expect(animationProgress({...input, frame: 500})).toBe(1);
	});

	it('is deterministic: the same frame always gives the same value', () => {
		for (const easing of EASING_NAMES) {
			for (let frame = 0; frame < 60; frame += 7) {
				const input = {frame, fps: 30, delaySeconds: 0.2, durationSeconds: 0.8, easing};
				expect(animationProgress(input)).toBe(animationProgress(input));
			}
		}
	});

	it('takes the same wall-clock time at any fps', () => {
		const at = (fps: number) => animationProgress({frame: fps * 0.5, fps, durationSeconds: 1, easing: 'linear'});
		expect(at(24)).toBeCloseTo(0.5);
		expect(at(30)).toBeCloseTo(0.5);
		expect(at(60)).toBeCloseTo(0.5);
	});
});

describe('animationStyle', () => {
	it('is fully hidden at 0 and fully settled at 1 for every preset', () => {
		for (const preset of ANIMATION_PRESETS) {
			if (preset === 'none') continue;
			const hidden = animationStyle({preset}, 0);
			const settled = animationStyle({preset}, 1);
			expect(hidden.opacity).toBe(0);
			expect(settled.opacity).toBe(1);
			if (settled.transform) expect(settled.transform).toMatch(/scale\(1\.0000\)|translate\(0\.000px, 0\.000px\)/);
			if (settled.clipPath) expect(settled.clipPath).toContain('0.000%');
		}
	});

	it('never touches layout properties', () => {
		const allowed = new Set(['opacity', 'transform', 'clipPath']);
		for (const preset of ANIMATION_PRESETS) {
			Object.keys(animationStyle({preset}, 0.4)).forEach((property) => expect(allowed.has(property)).toBe(true));
		}
	});

	it('slides from the side opposite to its direction and scales with the layout unit', () => {
		expect(animationStyle({preset: 'slide', direction: 'up', distance: 100}, 0).transform).toBe('translate(0.000px, 100.000px)');
		expect(animationStyle({preset: 'slide', direction: 'right', distance: 100}, 0, 2).transform).toBe('translate(-200.000px, 0.000px)');
	});
});

describe('AnimationSpec', () => {
	it('accepts a preset name as shorthand', () => {
		expect(normalizeAnimation('fade')).toEqual({preset: 'fade'});
	});

	it('rejects unknown presets and out-of-range timings coming from data', () => {
		expect(AnimationSpecSchema.safeParse({preset: 'spin'}).success).toBe(false);
		expect(AnimationSpecSchema.safeParse({preset: 'fade', durationSeconds: -1}).success).toBe(false);
		expect(AnimationSpecSchema.safeParse({preset: 'slide', direction: 'left', durationSeconds: 0.4, easing: 'overshoot'}).success).toBe(true);
	});
});

describe('typewriterLength', () => {
	it('reveals characters at a steady rate and stops at the end', () => {
		expect(typewriterLength(10, 0, 30, 0.5, 20)).toBe(0);
		expect(typewriterLength(10, 30, 30, 0.5, 20)).toBe(10);
		expect(typewriterLength(100, 30, 30, 0.5, 20)).toBe(10);
		expect(typewriterLength(5, 9000, 30, 0, 20)).toBe(5);
	});
});
