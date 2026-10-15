import {describe, expect, it} from 'vitest';
import {assertProductCopy, checkProductCopy, MODULE_MESSAGING, moduleCopy, ProductCopyError} from '../src/Configurations/ProductMessaging';
import {IMAGE_TEMPLATES} from '../src/Images/ImageTemplateRegistry';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_SLIDES} from '../src/Store/StoreListing';
import {APP_PROMOTION_SAMPLE} from '../src/Templates/Advertisements/AppPromotion/AppPromotionSample';
import {MODULE_KEYS, MODULES} from '../src/UIUX/ModuleIdentity';

/** Every string inside a value, for scanning sample content. */
const strings = (value: unknown): string[] => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []);

describe('product messaging', () => {
	it('describes every module, taking the name from the module table', () => {
		for (const key of MODULE_KEYS) {
			const copy = MODULE_MESSAGING[key];
			expect(copy.name, key).toEqual(MODULES[key].name);
			for (const lang of ['tr', 'en'] as const) {
				// The tool line has the module as its subject; the invite ends with punctuation.
				expect(copy.tool[lang].startsWith(copy.name[lang]) || (key === 'lessons' && copy.tool[lang].startsWith(MODULES.lessons.name[lang])), `${key} ${lang}`).toBe(true);
				expect(copy.invite[lang], `${key} ${lang}`).toMatch(/[.!?]$/);
				expect(copy.tool[lang], `${key} ${lang}`).toMatch(/\.$/);
				expect(checkProductCopy(`${copy.claim[lang]} ${copy.tool[lang]} ${copy.invite[lang]}`).filter((issue) => issue.severity === 'error'), `${key} ${lang}`).toEqual([]);
			}
		}
		expect(moduleCopy('sinoAi').spoken).toBe('Sino Ey Ay');
	});

	it('catches the names and words advertising must not use', () => {
		const errors = (text: string) => checkProductCopy(text).filter((issue) => issue.severity === 'error').map((issue) => issue.term);
		expect(errors('Aklına takılanı sınav koçun SinoAI’ye sor.')).toEqual(['sınav koçun']);
		expect(errors('Koçuna sor.')).toEqual(['Koçuna']);
		expect(errors('Sınavika AI ile Kelime Kartları ve Ders Çalış')).toEqual(['Sınavika AI', 'Kelime Kartları', 'Ders Çalış']);
		expect(errors('Sinavika ile çalış')).toEqual(['Sinavika']);
		expect(errors('Meet your exam coach')).toEqual(['exam coach']);
		// Not errors: a university name, the domain, the hashtag, the verb in lower case.
		expect(errors('Koç Üniversitesi, sinavika.com ve #sinavika. Bugün ders çalış!')).toEqual([]);
		expect(checkProductCopy('Lens ile ışığın kırılması')[0].severity).toBe('warning');
		expect(() => assertProductCopy(['Koçuna sor.'])).toThrow(ProductCopyError);
		expect(assertProductCopy(['SinoAI’ye sor.'])).toEqual([]);
	});

	it('keeps the store pictures, ads and image templates within the rules', () => {
		const texts = [
			...strings(STORE_SLIDES),
			...strings(FEATURE_GRAPHIC),
			...strings(STORE_CREATIVE),
			...strings(APP_PROMOTION_SAMPLE),
			...IMAGE_TEMPLATES.flatMap((template) => strings((template as {sampleContent?: unknown}).sampleContent)),
		];
		// Single-word code names (screen keys such as SinoAi) are identifiers, not copy.
		const errors = texts.filter((text) => !/^[A-Z][A-Za-z]+$/.test(text)).flatMap((text) => checkProductCopy(text).filter((issue) => issue.severity === 'error').map((issue) => `${issue.term} ← ${text}`));
		expect(errors).toEqual([]);
	});

	it('ends every store headline made of commands with a full stop', () => {
		for (const slide of STORE_SLIDES) {
			for (const lang of ['tr', 'en'] as const) {
				const headline = slide.headline[lang].replace(/\*/g, '');
				// A Turkish headline with commas is a series of commands; the English one follows the same slide.
				if (slide.headline.tr.includes(',')) expect(headline, slide.file.tr).toMatch(/[.!]$/);
				if (slide.tool) expect(slide.tool.text[lang], slide.file.tr).toMatch(/\.$/);
				expect(slide.subline[lang], slide.file.tr).toMatch(/[.!?]$/);
			}
		}
	});
});
