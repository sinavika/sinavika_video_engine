import {describe, expect, it} from 'vitest';
import {findLatexError, findRichTextErrors, latex, parseRichText, richText} from '../src/Schemas/RichText';
import {ImageSchema, VisualSchema} from '../src/Schemas/Visual';

describe('parseRichText', () => {
	it('splits text, emphasis, inline and display math', () => {
		expect(parseRichText('Eğer $x = 2$ ise **sonuç** şudur: $$x^2 = 4$$')).toEqual([
			{kind: 'text', value: 'Eğer '},
			{kind: 'math', value: 'x = 2'},
			{kind: 'text', value: ' ise '},
			{kind: 'strong', value: 'sonuç'},
			{kind: 'text', value: ' şudur: '},
			{kind: 'displayMath', value: 'x^2 = 4'},
		]);
	});

	it('keeps Turkish characters intact', () => {
		const text = 'Çağrı, İstanbul’da ığdır ağacının gölgesinde öğle üzeri şiir okudu.';
		expect(parseRichText(text)).toEqual([{kind: 'text', value: text}]);
	});

	it('treats an escaped dollar as a literal', () => {
		expect(parseRichText('Fiyat 5\\$ oldu')).toEqual([{kind: 'text', value: 'Fiyat 5$ oldu'}]);
	});
});

describe('formula validation', () => {
	it('accepts valid LaTeX, including Turkish text inside formulas', () => {
		expect(findLatexError('\\frac{a^2 + b^2}{c}')).toBeNull();
		expect(findLatexError('n \\text{ tane çarpım}')).toBeNull();
	});

	it('rejects broken LaTeX with a readable message', () => {
		expect(findLatexError('\\frac{1}{')).toMatch(/KaTeX parse error/);
		expect(findLatexError('\\undefinedcommand{x}')).toMatch(/Undefined control sequence/);
	});

	it('reports unbalanced dollars and bad inline formulas in rich text', () => {
		expect(findRichTextErrors('Sonuç $x = 5 bulunur')).toHaveLength(1);
		expect(findRichTextErrors('Sonuç $\\frac{1}{$ bulunur')[0]).toMatch(/Invalid LaTeX/);
		expect(findRichTextErrors('Sonuç $x = 5$ bulunur')).toEqual([]);
	});

	it('fails schema validation instead of rendering a broken formula', () => {
		expect(richText(100).safeParse('$\\sqrt{2$').success).toBe(false);
		expect(latex().safeParse('x^{2').success).toBe(false);
		expect(richText(10).safeParse('çok uzun bir metin').success).toBe(false);
		expect(richText(100).safeParse('   ').success).toBe(false);
	});
});

describe('visual schemas', () => {
	it('accepts public-relative paths and web URLs for images', () => {
		expect(ImageSchema.safeParse({src: 'Samples/RightTriangle.svg'}).success).toBe(true);
		expect(ImageSchema.safeParse({src: 'https://example.com/a.png'}).success).toBe(true);
	});

	it('rejects paths that leave the public folder', () => {
		expect(ImageSchema.safeParse({src: '../secrets.png'}).success).toBe(false);
		expect(ImageSchema.safeParse({src: '/etc/passwd'}).success).toBe(false);
		expect(ImageSchema.safeParse({src: 'file:///C:/a.png'}).success).toBe(false);
	});

	it('rejects unknown visual kinds and diagrams with too few nodes', () => {
		expect(VisualSchema.safeParse({kind: 'hologram'}).success).toBe(false);
		expect(VisualSchema.safeParse({kind: 'cycle', nodes: [{label: 'A'}, {label: 'B'}]}).success).toBe(false);
	});
});
