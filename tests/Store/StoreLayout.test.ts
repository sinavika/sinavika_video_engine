import {describe, expect, it} from 'vitest';
import {STORE_FORMATS, STORE_LANGUAGES, STORE_SLIDES} from '../../src/Store/StoreListing';
import {fitStage, GAP, PHONE_STAGE, phoneBox, phoneHeight, TABLET_STAGE, tabletStageDevice, textBottom, toPicture, type Box} from '../../src/Store/StoreLayout';

/** Every phone and iPad picture size the stores get. */
const sizes = (devices: readonly string[]) => STORE_FORMATS.filter((format) => devices.includes(format.device)).flatMap((format) => format.sizes.map(([w, h]) => ({folder: format.folder, device: format.device, w, h})));

const inside = (box: Box, w: number, h: number, bottom: number) => {
	expect(box.x, 'left').toBeGreaterThanOrEqual(0);
	expect(box.y, 'top').toBeGreaterThanOrEqual(0);
	expect(box.x + box.width, 'right').toBeLessThanOrEqual(w);
	expect(box.y + box.height, 'bottom').toBeLessThanOrEqual(h - bottom);
};

describe('store picture layout (owner, 16 Nov 2026: phone fully visible, same place on every shot)', () => {
	it('keeps the whole phone on the stage with room below it, iPhone and Android', () => {
		for (const android of [false, true]) {
			const phone = phoneBox(android);
			inside(phone, PHONE_STAGE.width, PHONE_STAGE.height, GAP.bottom);
		}
	});

	it('centres the phone and gives it one size and place on every slide, in every language', () => {
		for (const android of [false, true]) {
			const phone = phoneBox(android);
			expect(phone.x * 2 + phone.width).toBeCloseTo(PHONE_STAGE.width, 6);
			// phoneBox takes no slide: the slide's floating card can no longer move the phone.
			expect(phoneBox.length).toBe(1);
		}
		expect(phoneBox(true).y).toBe(phoneBox(false).y);
		expect(phoneBox(true).width).toBe(phoneBox(false).width);
	});

	it('ends every headline and subline above the phone, within two lines each', () => {
		for (const slide of STORE_SLIDES) {
			for (const lang of STORE_LANGUAGES) {
				const text = textBottom(PHONE_STAGE.text, slide.headline[lang], slide.subline[lang]);
				const where = `${slide.file} ${lang}`;
				expect(text.lines, `${where} başlık satırı`).toBeLessThanOrEqual(PHONE_STAGE.text.maxLines);
				expect(text.subLines, `${where} alt satır`).toBeLessThanOrEqual(PHONE_STAGE.text.maxSubLines);
				expect(text.bottom + GAP.textToDevice, `${where} yazı telefona değiyor`).toBeLessThanOrEqual(phoneBox(false).y);
			}
		}
	});

	it('fits the whole stage into every phone picture size, so no store size cuts the phone', () => {
		for (const size of sizes(['iphone', 'android'])) {
			const fit = fitStage(PHONE_STAGE, size.w, size.h);
			const phone = toPicture(phoneBox(size.device === 'android'), fit);
			inside(phone, size.w, size.h, GAP.bottom * fit.u);
			expect(Math.abs(phone.x * 2 + phone.width - size.w), size.folder).toBeLessThan(1);
		}
	});

	it('anchors the floating card inside the phone height, on the stage, the same for every slide', () => {
		const phone = phoneBox(false);
		const {float} = PHONE_STAGE;
		expect(float.x).toBeGreaterThanOrEqual(0);
		expect(float.x + float.width).toBeLessThan(phone.x + phone.width);
		expect(float.bottom).toBeGreaterThan(phone.y + phone.height * 0.5);
		expect(float.bottom).toBeLessThan(phone.y + phone.height);
	});

	it('keeps the iPad and the phone shown on the iPad inside the picture, centred, below the text', () => {
		for (const hasTablet of [true, false]) {
			const device = tabletStageDevice(hasTablet);
			inside(device, TABLET_STAGE.width, TABLET_STAGE.height, GAP.bottom);
			expect(device.x * 2 + device.width).toBeCloseTo(TABLET_STAGE.width, 6);
		}
		for (const slide of STORE_SLIDES) {
			for (const lang of STORE_LANGUAGES) {
				const text = textBottom(TABLET_STAGE.text, slide.headline[lang], slide.subline[lang]);
				const device = tabletStageDevice(Boolean(slide.screens.tablet));
				expect(text.lines, `${slide.file} ${lang}`).toBeLessThanOrEqual(TABLET_STAGE.text.maxLines);
				expect(text.subLines, `${slide.file} ${lang}`).toBeLessThanOrEqual(TABLET_STAGE.text.maxSubLines);
				expect(text.bottom + GAP.textToDevice, `${slide.file} ${lang}`).toBeLessThanOrEqual(device.y);
			}
		}
		for (const size of sizes(['ipad'])) {
			const fit = fitStage(TABLET_STAGE, size.w, size.h);
			for (const hasTablet of [true, false]) inside(toPicture(tabletStageDevice(hasTablet), fit), size.w, size.h, GAP.bottom * fit.u);
		}
	});

	it('measures the phone from the drawing canvas (390 × 844 plus bezel)', () => {
		expect(phoneHeight(1000, false)).toBeCloseTo(930 * (844 / 390) + 70, 6);
	});
});
