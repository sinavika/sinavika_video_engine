import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {spokenScreenText} from '../../src/Courses/LessonSpeech';
import {readMath} from '../../src/Schemas/MathSpeech';
import {pronounceAbbreviations, toSpokenText} from '../../src/Schemas/SpokenText';
import {FIXTURES, ROOT} from '../Support/Paths';

/**
 * The Turkish math reader (docs/MatematikOkunus.md, 29 Oct 2026). Readings are what the voice is given: the
 * formula read by MathSpeech, then its numbers said by spokenNumbers ("2'ye" → "ikiye").
 */
const voiced = (latex: string) => pronounceAbbreviations(spokenScreenText(`$${latex}$`));

/** Typical AYT formulas, as the owner approves them in docs/MatematikOkunus.md. */
const AYT: [string, string][] = [
	// Limit
	['\\lim_{x\\to 2}', 'x ikiye giderken limit'],
	['\\lim_{x \\to 2} (x^2 + 1) = 5', 'x ikiye giderken limit parantez içinde x kare artı bir, eşittir beş'],
	['\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 4', 'x ikiye giderken limit kesrin payı x kare eksi dört, paydası x eksi iki, eşittir dört'],
	['\\lim_{x \\to 0^+} \\frac{1}{x} = \\infty', 'x sıfıra sağdan giderken limit bir bölü x eşittir sonsuz'],
	['\\lim_{x \\to 3^-} f(x)', 'x üçe soldan giderken limit f x'],
	['\\lim_{x \\to \\infty} \\frac{2x + 1}{x - 3} = 2', 'x sonsuza giderken limit kesrin payı iki x artı bir, paydası x eksi üç, eşittir iki'],
	['\\lim_{x \\to -\\infty} e^x = 0', 'x eksi sonsuza giderken limit e üssü x eşittir sıfır'],
	['\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e', 'n sonsuza giderken limit parantez içinde bir artı bir bölü n, üssü n eşittir e'],
	['\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', 'x sıfıra giderken limit sinüs x bölü x eşittir bir'],
	['\\lim\\limits_{x \\to a} f(x) = L', 'x a\'ya giderken limit f x eşittir L'],
	['x \\to 2^+', 'x ikiye sağdan giderken'],
	// Türev
	['f\'(x)', 'f türev x'],
	['f\'\'(x)', 'f ikinci türev x'],
	['f\'\'\'(x)', 'f üçüncü türev x'],
	['f\'(2) = 3', 'f türev iki eşittir üç'],
	['y\' = 2x', 'y türev eşittir iki x'],
	['f\'(x) = 0', 'f türev x eşittir sıfır'],
	['(f \\cdot g)\'(x) = f\'(x)g(x) + f(x)g\'(x)', 'parantez içinde f çarpı g, türev x eşittir f türev x g x artı f x g türev x'],
	['(f \\circ g)\'(x) = f\'(g(x)) \\cdot g\'(x)', 'parantez içinde f bileşke g, türev x eşittir f türev g x çarpı g türev x'],
	['\\left(\\frac{f}{g}\\right)\'(x) = \\frac{f\'(x)g(x) - f(x)g\'(x)}{g^2(x)}', 'parantez içinde f bölü g, türev x eşittir kesrin payı f türev x g x eksi f x g türev x, paydası g kare x'],
	['\\frac{d}{dx}(x^n) = n x^{n-1}', 'x\'e göre türev parantez içinde x üssü n, eşittir n x üssü n eksi bir'],
	['\\frac{dy}{dx}', 'y\'nin x\'e göre türevi'],
	['(x^n)\' = n \\cdot x^{n-1}', 'parantez içinde x üssü n, türev eşittir n çarpı x üssü n eksi bir'],
	['(\\sin x)\' = \\cos x', 'parantez içinde sinüs x, türev eşittir kosinüs x'],
	['f\'(a) = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}', 'f türev a eşittir h sıfıra giderken limit kesrin payı f a artı h, eksi f a, paydası h'],
	// İntegral
	['\\int_0^1 x^2\\,dx', 'sıfırdan bire x kare dx\'in integrali'],
	['\\int_0^1 x^2\\,dx = \\frac{1}{3}', 'sıfırdan bire x kare dx\'in integrali eşittir bir bölü üç'],
	['\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + c', 'x üssü n dx\'in integrali eşittir kesrin payı x üssü n artı bir, paydası n artı bir, artı c'],
	['\\int (2x + 1)\\,dx = x^2 + x + c', 'parantez içinde iki x artı bir, dx\'in integrali eşittir x kare artı x artı c'],
	['\\int_a^b f(x)\\,dx = F(b) - F(a)', 'a\'dan b\'ye f x dx\'in integrali eşittir F b eksi F a'],
	['\\int_{-1}^{2} 3x^2\\,dx = 9', 'eksi birden ikiye üç x kare dx\'in integrali eşittir dokuz'],
	['\\int_0^{\\pi} \\sin x\\,dx = 2', 'sıfırdan pi\'ye sinüs x dx\'in integrali eşittir iki'],
	['\\int \\frac{1}{x}\\,dx = \\ln|x| + c', 'bir bölü x dx\'in integrali eşittir l n mutlak değer x, artı c'],
	['\\int e^x\\,dx = e^x + c', 'e üssü x dx\'in integrali eşittir e üssü x artı c'],
	['\\int_1^e \\frac{1}{t}\\,dt = 1', 'birden e\'ye bir bölü t dt\'nin integrali eşittir bir'],
	// Toplam ve diziler
	['\\sum_{k=1}^{n}', 'k eşittir birden n\'e toplam'],
	['\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}', 'k eşittir birden n\'e toplam k eşittir n parantez içinde n artı bir, bölü iki'],
	['\\sum_{k=1}^{10} (2k - 1) = 100', 'k eşittir birden ona toplam parantez içinde iki k eksi bir, eşittir yüz'],
	['\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}', 'i eşittir birden n\'e toplam i kare eşittir n parantez içinde n artı bir, parantez içinde iki n artı bir, bölü altı'],
	['\\prod_{k=1}^{n} k = n!', 'k eşittir birden n\'e çarpım k eşittir n faktöriyel'],
	['a_n', 'a n'],
	['a_n = a_1 + (n - 1)d', 'a n eşittir a bir artı parantez içinde n eksi bir, d'],
	['a_{n+1} = a_n + 3', 'a n artı bir, eşittir a n artı üç'],
	['a_n = a_1 \\cdot r^{n-1}', 'a n eşittir a bir çarpı r üssü n eksi bir'],
	['S_n = \\frac{n}{2}(a_1 + a_n)', 'S n eşittir n bölü iki parantez içinde a bir artı a n'],
	['a_{10} = 21', 'a on eşittir yirmi bir'],
	// Logaritma ve üstel
	['\\log_2 8', 'log iki tabanında sekiz'],
	['\\log_2 8 = 3', 'log iki tabanında sekiz eşittir üç'],
	['\\ln x', 'l n x'],
	['\\log x + \\log y = \\log(xy)', 'log x artı log y eşittir log xy'],
	['\\log_a b = \\frac{\\log b}{\\log a}', 'log a tabanında b eşittir log b bölü log a'],
	['\\log_3(x - 1) = 2', 'log üç tabanında x eksi bir, eşittir iki'],
	['\\ln e = 1', 'l n e eşittir bir'],
	['e^{\\ln x} = x', 'e üssü l n x eşittir x'],
	['2^{x+1} = 8', 'iki üssü x artı bir, eşittir sekiz'],
	['\\log_{\\frac{1}{2}} 4 = -2', 'log bir bölü iki tabanında dört eşittir eksi iki'],
	['\\log_a(b \\cdot c) = \\log_a b + \\log_a c', 'log a tabanında b çarpı c eşittir log a tabanında b artı log a tabanında c'],
	// Trigonometri
	['\\sin^2 x', 'sinüs kare x'],
	['\\sin^2 x + \\cos^2 x = 1', 'sinüs kare x artı kosinüs kare x eşittir bir'],
	['\\tan^2 x + 1 = \\frac{1}{\\cos^2 x}', 'tanjant kare x artı bir eşittir bir bölü kosinüs kare x'],
	['\\cot x = \\frac{\\cos x}{\\sin x}', 'kotanjant x eşittir kosinüs x bölü sinüs x'],
	['\\sin 2x = 2\\sin x\\cos x', 'sinüs iki x eşittir iki sinüs x kosinüs x'],
	['\\cos(a + b) = \\cos a \\cos b - \\sin a \\sin b', 'kosinüs a artı b, eşittir kosinüs a kosinüs b eksi sinüs a sinüs b'],
	['\\arcsin\\left(\\frac{1}{2}\\right) = \\frac{\\pi}{6}', 'arksinüs bir bölü iki, eşittir pi bölü altı'],
	['\\sin^{-1} x', 'arksinüs x'],
	['\\tan\\left(\\frac{\\pi}{4}\\right) = 1', 'tanjant pi bölü dört, eşittir bir'],
	['\\sin(-x) = -\\sin x', 'sinüs eksi x eşittir eksi sinüs x'],
	['\\sin 30° = \\frac{1}{2}', 'sinüs otuz derece eşittir bir bölü iki'],
	// Aralıklar
	['[a,b)', 'a kapalı b açık aralığı'],
	['[a, b]', 'a, b kapalı aralığı'],
	['(a, b]', 'a açık b kapalı aralığı'],
	['x \\in (2, 5)', 'x elemanıdır iki, beş açık aralığı'],
	['x \\in [-1, 3)', 'x elemanıdır eksi bir kapalı üç açık aralığı'],
	['(-\\infty, 2]', 'eksi sonsuz açık iki kapalı aralığı'],
	['[0, \\infty)', 'sıfır kapalı sonsuz açık aralığı'],
	// Karmaşık sayılar
	['i^2 = -1', 'i kare eşittir eksi bir'],
	['z = 3 + 4i', 'z eşittir üç artı dört i'],
	['z = a + bi', 'z eşittir a artı b i'],
	['|z| = \\sqrt{a^2 + b^2}', 'mutlak değer z, eşittir karekök içinde a kare artı b kare'],
	['\\overline{z} = a - bi', 'z eşleniği eşittir a eksi b i'],
	['\\overline{4a73b}', 'dört a yedi üç b'],
	['\\overline{3a7b} + \\overline{ab}', 'üç a yedi b artı a b'],
	['i^{4n+1} = i', 'i üssü dört n artı bir, eşittir i'],
	['\\text{Re}(z) = 3', 'z\'nin reel kısmı eşittir üç'],
	['(2 + i)(2 - i) = 5', 'parantez içinde iki artı i, parantez içinde iki eksi i, eşittir beş'],
	// Kesir, kök, iç içe
	['\\frac{\\sqrt{x}}{x^2+1}', 'kesrin payı karekök x, paydası x kare artı bir'],
	['\\frac{x+1}{x-1}', 'kesrin payı x artı bir, paydası x eksi bir'],
	['\\frac{1}{\\sqrt{x} + 1}', 'kesrin payı bir, paydası karekök x artı bir'],
	['\\sqrt{\\frac{a}{b}}', 'karekök içinde a bölü b'],
	['\\sqrt[3]{x^2 + 1}', 'küpkök içinde x kare artı bir'],
	['\\sqrt[n]{a}', 'n\'inci dereceden kök a'],
	['\\frac{\\frac{1}{2}}{3}', 'kesrin payı bir bölü iki, paydası üç'],
	['\\frac{1}{2(x + 1)}', 'kesrin payı bir, paydası iki parantez içinde x artı bir'],
	['x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}', 'x bir, iki eşittir kesrin payı eksi b artı eksi karekök delta, paydası iki a'],
	// Fonksiyon, polinom, olasılık
	['f: \\mathbb{R} \\to \\mathbb{R}', 'f, reel sayılardan reel sayılara'],
	['f(x) = 2x - 3m', 'f x eşittir iki x eksi üç m'],
	['f^{-1}(x) = \\frac{x + 3}{2}', 'f tersi x eşittir kesrin payı x artı üç, paydası iki'],
	['P(2m - 1) = 0', 'P iki m eksi bir, eşittir sıfır'],
	['x^2 - (m + 1)x + 2m = 0', 'x kare eksi parantez içinde m artı bir, x artı iki m eşittir sıfır'],
	['\\binom{n}{r}', 'C n r'],
	['P(n, r) = \\frac{n!}{(n - r)!}', 'P n, r eşittir n faktöriyel bölü parantez içinde n eksi r, faktöriyel'],
	['P(A\') = 1 - P(A)', 'P A tümleyen eşittir bir eksi P A'],
	['P(A \\cap B) = P(A) \\cdot P(B)', 'P A kesişim B eşittir P A çarpı P B'],
	['P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}', 'P A, B verilmişken, eşittir kesrin payı P A kesişim B, paydası P B'],
	['\\mathbb{Z}^+', 'pozitif tam sayılar'],
	['\\mathbb{R}^-', 'negatif reel sayılar'],
	// Geometri ve vektör
	['\\triangle ABC', 'A B C üçgeni'],
	['\\angle ABC', 'A B C açısı'],
	['m(\\widehat{ABC}) = 90°', 'A B C açısı eşittir doksan derece'],
	['\\vec{AB}', 'A B vektörü'],
	['|\\vec{u}| = 5', 'u vektörünün uzunluğu eşittir beş'],
	['|AB| = 5', 'A B uzunluğu eşittir beş'],
	['[AB] \\perp [CD]', 'A B diktir C D'],
	['ABC \\sim DEF', 'ABC benzerdir DEF'],
];

/**
 * Every distinct formula of Curriculum/Scripts with its reading (29 Oct 2026): today's reading, or its fix listed in
 * docs/MatematikOkunus.md. A new script formula needs no row here; a changed reading needs the owner's approval.
 */
const GOLDEN: {formula: string; reading: string}[] = JSON.parse(readFileSync(path.join(FIXTURES, 'MathSpeechGolden.json'), 'utf8'));

const scriptStrings = (): string[] => {
	const found: string[] = [];
	const visit = (node: unknown) => {
		if (typeof node === 'string') found.push(node);
		else if (Array.isArray(node)) node.forEach(visit);
		else if (node && typeof node === 'object') Object.values(node).forEach(visit);
	};
	const walk = (directory: string): string[] =>
		readdirSync(directory).flatMap((name) => {
			const full = path.join(directory, name);
			return statSync(full).isDirectory() ? walk(full) : name.endsWith('.json') ? [full] : [];
		});
	for (const file of walk(path.join(ROOT, 'Curriculum', 'Scripts'))) visit(JSON.parse(readFileSync(file, 'utf8')));
	return found;
};

/** What the voice must never be given: LaTeX syntax, or digits that spokenNumbers did not say. */
const LEFTOVER = /[\\{}^_$]|\d/;

describe('math speech', () => {
	it('reads the AYT forms the way a teacher does', () => {
		const wrong = AYT.filter(([latex, reading]) => voiced(latex) !== reading).map(([latex, reading]) => `${latex}\n  expected ${reading}\n  got      ${voiced(latex)}`);
		expect(wrong).toEqual([]);
	});

	it('keeps the approved reading of every formula in the camp scripts', () => {
		expect(GOLDEN.length).toBeGreaterThan(3900);
		const wrong = GOLDEN.filter(({formula, reading}) => pronounceAbbreviations(spokenScreenText(formula)) !== reading).map(
			({formula, reading}) => `${formula}\n  expected ${reading}\n  got      ${pronounceAbbreviations(spokenScreenText(formula))}`,
		);
		expect(wrong.slice(0, 20)).toEqual([]);
	});

	it('reads nested parts whole and keeps numbers for spokenNumbers', () => {
		expect(readMath('\\frac{\\sqrt{x}}{x^2+1}')).toBe('kesrin payı karekök x, paydası x kare artı 1,');
		expect(readMath('\\lim_{x\\to 2}')).toBe("x 2'ye giderken limit");
		expect(readMath('\\int_0^1 x^2\\,dx')).toBe("0'dan 1'e x kare dx'in integrali");
		expect(readMath('\\sum_{k=1}^{n}')).toBe("k eşittir 1'den n'e toplam");
		expect(readMath('\\sqrt[4]{16} + \\sqrt[n]{a}')).toBe("4. dereceden kök 16 artı n'inci dereceden kök a");
		// A simple fraction stays "bölü"; a sum over or under the line is read with its parts named.
		expect(readMath('\\frac{1}{3} + \\frac{a+b}{2}')).toBe('1 bölü 3 artı kesrin payı a artı b, paydası 2,');
	});

	it('keeps a suffix written after a formula on its last word', () => {
		expect(toSpokenText("$\\frac{x+1}{2}$'ye bölünür")).toBe("kesrin payı x artı 1, paydası 2'ye bölünür");
		expect(toSpokenText("$(a + b)$'nin karesi")).toBe("parantez içinde a artı b'nin karesi");
		expect(spokenScreenText("Açısı $50°$'dir, $\\frac{1}{3}$'üne iner.")).toBe("Açısı 50 derece'dir, 1 bölü 3'üne iner.");
		expect(pronounceAbbreviations(toSpokenText("$\\sqrt{x + 1}$'in değeri"))).toBe('karekök içinde x artı birin değeri');
	});

	it('reads a formula left in a narration line instead of passing LaTeX to the voice', () => {
		expect(pronounceAbbreviations('Küpte dayanıklılık $\\propto \\frac{1}{a}$.')).toBe('Küpte dayanıklılık bir bölü a ile orantılıdır.');
		expect(pronounceAbbreviations('$P = \\frac{F}{A}$: kuvvet azalsın.')).toBe('P eşittir F bölü A: kuvvet azalsın.');
		// A line without a formula is left exactly as it was: its cached voice stays valid.
		expect(pronounceAbbreviations('Cevabımız E, 12 soru.')).toBe('Cevabımız E, on iki soru.');
	});

	it('reads an algebra letter after a number as a letter, never as a unit', () => {
		expect(voiced('4a + 2m = 74')).toBe('dört a artı iki m eşittir yetmiş dört');
		expect(voiced('E_K = \\frac{1}{2} m v^2')).toBe('E K eşittir bir bölü iki m v kare');
		expect(pronounceAbbreviations(toSpokenText('$|AB| = 6$ cm'))).toBe('A B uzunluğu eşittir altı santimetre');
	});

	it('tells a complement from a prime by what the text is about', () => {
		expect(toSpokenText("Tümleyen $A'$")).toBe('Tümleyen A tümleyen');
		expect(toSpokenText("Simetriği $B'$ noktası")).toBe('Simetriği B üssü noktası');
		expect(voiced("P(A') = 1 - P(A)")).toBe('P A tümleyen eşittir bir eksi P A');
		expect(voiced("(p \\wedge q)' \\equiv p' \\vee q'")).toBe('parantez içinde p ve q, değili denktir p değil veya q değil');
	});

	it('never leaves LaTeX or digits for the voice, in any formula or narration line of the scripts', () => {
		const strings = scriptStrings();
		const said = [
			...AYT.map(([latex]) => voiced(latex)),
			...GOLDEN.map(({formula}) => pronounceAbbreviations(spokenScreenText(formula))),
			...strings.filter((text) => text.includes('$')).flatMap((text) => [pronounceAbbreviations(spokenScreenText(text)), pronounceAbbreviations(toSpokenText(text)), pronounceAbbreviations(text)]),
		];
		expect(said.length).toBeGreaterThan(10_000);
		expect(said.filter((text) => LEFTOVER.test(text)).slice(0, 10)).toEqual([]);
		// It reads every script: about 4 s alone and past the 5 s default while the whole suite runs (210 lessons, 30 Oct).
	}, 30_000);
});
