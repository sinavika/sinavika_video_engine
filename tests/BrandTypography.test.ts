import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {BRAND_THEME_TYPOGRAPHY, BRAND_TYPOGRAPHY} from '../src/Configurations/BrandTypography';
import {FONT_FAMILIES} from '../src/Themes/FontFamilies';
import {THEMES} from '../src/Themes/ThemeRegistry';

const source = (file: string) => readFileSync(path.resolve(__dirname, '..', 'src', file), 'utf8');

describe('brand typography', () => {
	it('is the approved one: a change here is a brand decision', () => {
		expect(BRAND_TYPOGRAPHY).toEqual({
			families: {display: 'plusJakartaSans', body: 'inter', mono: 'jetBrainsMono'},
			weights: {display: 800, kinetic: 900, body: 450, strong: 700},
			displayLetterSpacing: '-0.02em',
			labelTransform: 'uppercase',
			displayLineHeight: 1.05,
			adScale: {hook: 112, headline: 92, closing: 84, action: 36, subtitle: 40},
		});
	});

	it('names only fonts the engine actually loads', () => {
		Object.values(BRAND_TYPOGRAPHY.families).forEach((family) => expect(FONT_FAMILIES[family]).toBeTruthy());
		expect(BRAND_THEME_TYPOGRAPHY.display).toBe("'Plus Jakarta Sans Variable', sans-serif");
		expect(BRAND_THEME_TYPOGRAPHY.body).toBe("'Inter Variable', sans-serif");
		expect(BRAND_THEME_TYPOGRAPHY.mono).toBe("'JetBrains Mono Variable', monospace");
	});

	it('is what every brand theme uses', () => {
		for (const id of ['SinavikaBrand', 'SinavikaLight', 'SinavikaDark'] as const) {
			expect(THEMES[id].typography, id).toEqual(BRAND_THEME_TYPOGRAPHY);
		}
	});

	it('keeps an ad hierarchy of clearly different sizes', () => {
		const {hook, headline, closing, action} = BRAND_TYPOGRAPHY.adScale;
		expect(hook).toBeGreaterThan(headline);
		expect(headline).toBeGreaterThan(closing);
		expect(closing).toBeGreaterThan(action * 2);
	});

	it('leaves no type size or weight hard-coded in the ad templates', () => {
		for (const file of ['AppPromotion/AppPromotionScenes.tsx', 'MobilePromotion/MobilePromotionScenes.tsx']) {
			const scenes = source(`Templates/Advertisements/${file}`);
			expect(scenes, file).not.toMatch(/\bsize=\{\d+\}/);
			expect(scenes, file).not.toMatch(/\bweight=\{\d+\}/);
		}
		expect(source('Themes/SinavikaBrand.ts')).not.toMatch(/FONT_FAMILIES|displayWeight/);
	});
});
