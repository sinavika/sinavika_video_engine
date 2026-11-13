import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {UI_MOTION, UI_MOTION_MOMENTS} from '../../src/UIUX/Tokens';

const doc = readFileSync(path.join(__dirname, '../../docs/UIUX/Hareket-Standardi.md'), 'utf8');

/** y of a cubic-bezier at its first control point: a curve that starts flat (ease-in) has y1 ≈ 0 and x1 large. */
const startsSlow = ([x1, y1]: readonly number[]): boolean => y1 < x1 * 0.5 && x1 > 0.5;

describe('app motion standard (docs/UIUX/Hareket-Standardi.md)', () => {
	it('keeps product UI quick: under 300 ms except the sheet, exits shorter than entrances', () => {
		const {sheet, max, exit, enter, ...rest} = UI_MOTION.duration;
		expect(Object.values(rest).every((ms) => ms <= max)).toBe(true);
		expect(enter).toBeLessThanOrEqual(max);
		expect(max).toBe(300);
		expect(sheet).toBeLessThanOrEqual(500);
		expect(exit).toBeLessThan(enter);
		expect(UI_MOTION.reduced.duration).toBeLessThanOrEqual(150);
	});

	it('has no ease-in for entrances and exits, and nothing grows from zero', () => {
		expect(startsSlow(UI_MOTION.easing.out)).toBe(false);
		expect(startsSlow(UI_MOTION.easing.sheet)).toBe(false);
		expect(UI_MOTION.scale.enter).toBeGreaterThanOrEqual(0.9);
		expect(UI_MOTION.scale.press).toBeGreaterThanOrEqual(0.95);
		expect(UI_MOTION.scale.press).toBeLessThan(1);
	});

	it('staggers within 30–80 ms and finishes a group in 300 ms; springs do not bounce', () => {
		expect(UI_MOTION.stagger.step).toBeGreaterThanOrEqual(30);
		expect(UI_MOTION.stagger.step).toBeLessThanOrEqual(80);
		expect(UI_MOTION.stagger.groupMax).toBeLessThanOrEqual(300);
		Object.values(UI_MOTION.spring).forEach((spring) => expect(spring.dampingRatio).toBeGreaterThanOrEqual(0.8));
		expect(UI_MOTION.gesture.minTarget).toBeGreaterThanOrEqual(44);
	});

	it('the document shows the same numbers as the tokens', () => {
		const ms = (value: number) => `${value} ms`;
		[UI_MOTION.duration.press, UI_MOTION.duration.toggle, UI_MOTION.duration.menu, UI_MOTION.duration.enter, UI_MOTION.duration.screen, UI_MOTION.duration.sheet, UI_MOTION.duration.exit].forEach((value) => expect(doc).toContain(ms(value)));
		Object.values(UI_MOTION.easing).forEach((curve) => expect(doc).toContain(`cubic-bezier(${curve.join(', ')})`));
		expect(doc).toContain(`${UI_MOTION.stagger.step} ms / ${UI_MOTION.stagger.groupMax} ms`);
		expect(doc).toContain(`${UI_MOTION.gesture.dismissVelocity} pt/sn`);
	});

	it('the frequent moments do not animate and every moment has a row in the document', () => {
		expect(UI_MOTION_MOMENTS.tabSwitch.animate).toBe('none');
		expect(Object.keys(UI_MOTION_MOMENTS)).toHaveLength(13);
		expect(doc.split('\n').filter((line) => /^\| [^|]+ \| [^|]+ \| [^|]+ \|$/.test(line) && !line.includes('---')).length).toBeGreaterThanOrEqual(13 + 1);
	});
});
