import {describe, expect, it} from 'vitest';
import {UI_SCREENS} from '../../src/UIUX/Registry';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_FORMATS, STORE_LANGUAGES, STORE_SLIDES} from '../../src/Store/StoreListing';
import {StoreSetPropsSchema} from '../../src/Store/StoreProps';

const ids = new Set(UI_SCREENS.map((screen) => screen.id));

describe('store listing', () => {
	it('has 2–8 slides, each fully written in every language', () => {
		expect(STORE_SLIDES.length).toBeGreaterThanOrEqual(2);
		expect(STORE_SLIDES.length).toBeLessThanOrEqual(8);
		for (const slide of STORE_SLIDES) {
			expect(slide.file).toMatch(/^\d\d-[a-z0-9-]+$/);
			for (const lang of STORE_LANGUAGES) {
				expect(slide.headline[lang], slide.file).toMatch(/\*[^*]+\*/);
				expect(slide.subline[lang].length, slide.file).toBeLessThan(90);
			}
		}
		for (const lang of STORE_LANGUAGES) expect(FEATURE_GRAPHIC.headline[lang]).toMatch(/\*[^*]+\*/);
	});

	it('shows only current UI/UX drawings, each on its own platform', () => {
		for (const slide of STORE_SLIDES) {
			expect(ids.has(slide.screens.phone) && slide.screens.phone.startsWith('m-'), slide.screens.phone).toBe(true);
			expect(ids.has(slide.screens.web) && slide.screens.web.startsWith('w-'), slide.screens.web).toBe(true);
			if (slide.screens.tablet) expect(ids.has(slide.screens.tablet) && slide.screens.tablet.startsWith('t-'), slide.screens.tablet).toBe(true);
		}
	});

	it('opens with studying, not the assistant (owner, 14 Nov 2026)', () => {
		for (const slide of STORE_SLIDES.slice(0, 3)) {
			for (const lang of STORE_LANGUAGES) expect(slide.headline[lang]).not.toMatch(/SinoAI/);
		}
	});

	it('asks only for sizes the stores accept', () => {
		for (const format of STORE_FORMATS) {
			for (const [width, height] of format.sizes) {
				if (format.platform === 'android' && format.device !== 'feature') {
					// Google Play: 16:9 or 9:16, sides within its limits.
					expect(Math.max(width, height) / Math.min(width, height), format.folder).toBeCloseTo(16 / 9, 2);
					expect(Math.max(width, height), format.folder).toBeLessThanOrEqual(3840);
				}
				expect(StoreSetPropsSchema.safeParse({width, height}).success).toBe(true);
			}
		}
		expect(STORE_FORMATS.find((format) => format.device === 'feature')?.sizes).toEqual([[1024, 500]]);
	});

	it('has the App Store creative in every size Apple lists, with copy in every language', () => {
		const sizes = (device: string) => STORE_FORMATS.filter((format) => format.device === device).flatMap((format) => format.sizes);
		expect(sizes('header')).toEqual([[5244, 2950], [3840, 1646]]);
		expect(sizes('search')).toEqual([[5244, 2950], [3840, 2560], [1920, 1280]]);
		for (const creative of Object.values(STORE_CREATIVE)) {
			expect(creative.file).toMatch(/^[a-z0-9-]+$/);
			for (const lang of STORE_LANGUAGES) expect(creative.headline[lang]).toMatch(/\*[^*]+\*/);
		}
	});
});
