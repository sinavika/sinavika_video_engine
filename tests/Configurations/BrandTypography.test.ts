import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {BRAND_THEME_TYPOGRAPHY, BRAND_TYPOGRAPHY, brandUpperCase} from '../../src/Configurations/BrandTypography';
import {FONT_FAMILIES} from '../../src/Themes/FontFamilies';
import {THEMES} from '../../src/Themes/ThemeRegistry';
import {ROOT} from '../Support/Paths';

const source = (file: string) => readFileSync(path.resolve(ROOT, 'src', file), 'utf8');

describe('brand typography', () => {
	it('is the approved one: a change here is a brand decision', () => {
		expect(BRAND_TYPOGRAPHY).toEqual({
			families: {display: 'manrope', body: 'manrope', mono: 'jetBrainsMono'},
			mathFallback: 'KaTeX_Main',
			weights: {display: 800, kinetic: 800, body: 500, strong: 700},
			displayLetterSpacing: '-0.02em',
			labelTransform: 'uppercase',
			displayLineHeight: 1.05,
			adScale: {numeral: 230, hook: 112, headline: 92, closing: 84, action: 36, subtitle: 40},
		});
	});

	it('names only fonts the engine actually loads', () => {
		Object.values(BRAND_TYPOGRAPHY.families).forEach((family) => expect(FONT_FAMILIES[family]).toBeTruthy());
		expect(BRAND_THEME_TYPOGRAPHY.display).toBe("'Manrope Variable', 'KaTeX_Main', sans-serif");
		expect(BRAND_THEME_TYPOGRAPHY.body).toBe("'Manrope Variable', 'KaTeX_Main', sans-serif");
		expect(BRAND_THEME_TYPOGRAPHY.mono).toBe("'JetBrains Mono Variable', monospace");
		// Only the brand face and the code face are bundled.
		const imports = source('Themes/FontFaces.ts').match(/@fontsource[^'"]+/g);
		expect(imports).toEqual(['@fontsource-variable/manrope/index.css', '@fontsource-variable/jetbrains-mono/index.css']);
	});

	it('is the typography of every theme, so all content speaks with the face of the apps', () => {
		for (const [id, theme] of Object.entries(THEMES)) {
			const {labelTransform: _labels, ...faces} = theme.typography;
			const {labelTransform: _brandLabels, ...brandFaces} = BRAND_THEME_TYPOGRAPHY;
			expect(faces, id).toEqual(brandFaces);
		}
	});

	it('asks for no weight the brand face does not have (Manrope stops at 800)', () => {
		const walk = (dir: string): string[] =>
			readdirSync(dir, {withFileTypes: true}).flatMap((entry) =>
				entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [path.join(dir, entry.name)] : [],
			);
		for (const file of walk(path.resolve(ROOT, 'src'))) {
			expect(readFileSync(file, 'utf8'), file).not.toMatch(/(fontWeight|weight)(:\s*|=\{)9\d\d/);
		}
		expect(Math.max(...Object.values(BRAND_TYPOGRAPHY.weights))).toBeLessThanOrEqual(800);
	});

	it('writes capitals in the language of the text', () => {
		expect(brandUpperCase('bilgi işlem', 'tr')).toBe('BİLGİ İŞLEM');
		expect(brandUpperCase('bilgi', 'en')).toBe('BILGI');
		expect(brandUpperCase('straße', 'de')).toBe('STRASSE');
		expect(source('Components/Layouts/VideoFrame.tsx')).toMatch(/lang=\{lang\}/);
	});

	it('keeps an ad hierarchy of clearly different sizes', () => {
		const {hook, headline, closing, action} = BRAND_TYPOGRAPHY.adScale;
		expect(hook).toBeGreaterThan(headline);
		expect(headline).toBeGreaterThan(closing);
		expect(closing).toBeGreaterThan(action * 2);
	});

	it('leaves no type size or weight hard-coded in the ad templates', () => {
		for (const file of ['AppPromotion/AppPromotionScenes.tsx', 'ExamJourney/ExamJourneyScenes.tsx']) {
			const scenes = source(`Templates/Advertisements/${file}`);
			expect(scenes, file).not.toMatch(/\bsize=\{\d+\}/);
			expect(scenes, file).not.toMatch(/\bweight=\{\d+\}/);
		}
		expect(source('Themes/SinavikaBrand.ts')).not.toMatch(/FONT_FAMILIES|displayWeight/);
	});
});
