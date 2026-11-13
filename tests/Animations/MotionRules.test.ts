import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {MOTION_DURATIONS, STAGGER_STEPS} from '../../src/Animations/Motion';

/**
 * The video motion rules (docs/Development.md, "Hareket ve sıralama"), as far as
 * they can be read from the code. src/UIUX draws still pictures and Html5Banner
 * is a live HTML ad, so neither is a Remotion scene.
 */
const ROOT = path.join(__dirname, '../../src');
const SKIP = [path.join(ROOT, 'UIUX')];

const sources = (directory: string): string[] =>
	readdirSync(directory).flatMap((name) => {
		const file = path.join(directory, name);
		if (SKIP.includes(file)) return [];
		if (statSync(file).isDirectory()) return sources(file);
		return /\.tsx?$/.test(name) && !name.endsWith('Html5Banner.ts') ? [file] : [];
	});

const FILES = sources(ROOT).map((file) => ({file: path.relative(ROOT, file).replaceAll('\\', '/'), text: readFileSync(file, 'utf8')}));

const offenders = (pattern: RegExp): string[] =>
	FILES.flatMap(({file, text}) => text.split('\n').flatMap((line, index) => (pattern.test(line) ? [`${file}:${index + 1}`] : [])));

describe('video motion rules', () => {
	it('frames move only by the frame number: no CSS transitions or keyframe animations', () => {
		// A CSS transition runs on the browser clock, so a rendered frame catches it anywhere (or not at all).
		expect(offenders(/transition:\s*['"`]|animation:\s*['"`]|@keyframes/)).toEqual([]);
	});

	it('no bouncing curves: back, bounce and elastic wobble below and above the target', () => {
		expect(offenders(/Easing\.(back|bounce|elastic)\b/)).toEqual([]);
	});

	it('nothing grows from (almost) zero: a scale entrance starts at 0.5 or more', () => {
		// scale(${interpolate(x, [..], [START, ...])}) with START below 0.5
		expect(offenders(/scale\(\$\{interpolate\([^\]]+\],\s*\[\s*0(\.[0-4]\d*)?\s*,/)).toEqual([]);
	});

	it('exits are shorter than entrances and staggers are short steps', () => {
		expect(MOTION_DURATIONS.fast).toBeLessThan(MOTION_DURATIONS.base);
		expect(Object.values(STAGGER_STEPS).every((step) => step <= 0.25)).toBe(true);
	});
});
