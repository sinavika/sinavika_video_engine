import {describe, expect, it} from 'vitest';
import {APP_MODULES} from '../src/Components/AppScreens/AppModules';
import {APP_SCREEN_NAMES} from '../src/Components/AppScreens/AppScreenRegistry';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_FORMATS, STORE_LANGUAGES, STORE_SLIDES} from '../src/Store/StoreListing';
import {StoreScreenshotPropsSchema} from '../src/Store/StoreProps';

describe('store listing', () => {
	it('has 2–8 slides, each fully written in every language', () => {
		expect(STORE_SLIDES.length).toBeGreaterThanOrEqual(2);
		expect(STORE_SLIDES.length).toBeLessThanOrEqual(8);
		for (const slide of STORE_SLIDES) {
			for (const lang of STORE_LANGUAGES) {
				expect(slide.headline[lang], slide.file.tr).toMatch(/\*[^*]+\*/);
				expect(slide.subline[lang].length, slide.file.tr).toBeLessThan(125);
				expect(slide.file[lang]).toMatch(/^[a-z0-9-]+$/);
			}
			for (const screen of slide.screens) if (typeof screen === 'string') expect(APP_SCREEN_NAMES).toContain(screen);
		}
		for (const lang of STORE_LANGUAGES) expect(FEATURE_GRAPHIC.headline[lang]).toMatch(/\*[^*]+\*/);
	});

	it('asks only for sizes the stores accept', () => {
		for (const format of STORE_FORMATS) {
			for (const [width, height] of format.sizes) {
				if (format.platform === 'android' && format.device !== 'feature') {
					// Google Play: 16:9 or 9:16, sides within its limits.
					expect(Math.max(width, height) / Math.min(width, height), format.folder).toBeCloseTo(16 / 9, 2);
					expect(Math.min(width, height), format.folder).toBeGreaterThanOrEqual(format.device === 'phone' || format.folder.includes('7') ? 320 : 1080);
					expect(Math.max(width, height), format.folder).toBeLessThanOrEqual(format.device === 'phone' || format.folder.includes('7') ? 3840 : 7680);
				}
				expect(StoreScreenshotPropsSchema.safeParse({width, height}).success).toBe(true);
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
			for (const lang of STORE_LANGUAGES) {
				expect(creative.headline[lang]).toMatch(/\*[^*]+\*/);
				expect(creative.subline[lang].length).toBeLessThan(90);
			}
			for (const screen of creative.screens) expect(APP_SCREEN_NAMES).toContain(screen);
		}
	});

	it('names every module and tab in English too', () => {
		for (const module of Object.values(APP_MODULES)) {
			expect(module.en.length).toBeGreaterThan(1);
			for (const tab of module.tabs ?? []) expect(tab.en.length).toBeGreaterThan(1);
		}
	});
});
