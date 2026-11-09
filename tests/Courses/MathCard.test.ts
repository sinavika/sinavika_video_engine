import {describe, expect, it} from 'vitest';
import {cardCues, plainWords} from '../../src/Courses/LessonCue';
import {cardBeats, lessonNarrations, LessonScriptSchema, questionFigureBeats, reviewScript, stillScreenSuggestions, type LessonCard, type LessonScript} from '../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';

/** The sample lesson with these cards as its first section's, made a TYT Matematik lesson. */
const lessonWith = (cards: unknown[], lesson = 'MAT'): LessonScript => {
	const sample = structuredClone(LESSON_SCRIPT_SAMPLE) as Record<string, any>;
	sample.topic = {...sample.topic, lesson, code: 'MAT_DENEME'};
	sample.lesson.sections[0].cards = [...cards, ...sample.lesson.sections[0].cards];
	return LessonScriptSchema.parse(sample);
};

const refusedCards = (cards: unknown[]) => {
	const sample = structuredClone(LESSON_SCRIPT_SAMPLE) as Record<string, any>;
	sample.lesson.sections[0].cards = cards;
	return !LessonScriptSchema.safeParse(sample).success;
};

const worked = {
	kind: 'example',
	title: 'Yakalama',
	example: 'Aradaki **90 km**, saatte **30 km** kapanıyor.',
	narration: 'Aradaki 90 km, saatte 30 km kapanıyor. Kaç saatte yakalar?',
	steps: [
		{narration: 'Her saat ara 30 kilometre kapanır.', math: '30 \\cdot t = 90', text: 'Aynı yön: hızlar çıkarılır'},
		{narration: 'İki tarafı 30\'a bölelim: t eşittir 3.', math: 't = 3'},
	],
};

describe('worked example: the solution line by line', () => {
	it('tells the example in its steps, each with its own sentence', () => {
		const script = lessonWith([worked]);
		const card = script.lesson.sections[0].cards[0];
		expect(cardBeats(card).map((step) => step.narration)).toEqual(['Her saat ara 30 kilometre kapanır.', "İki tarafı 30'a bölelim: t eşittir 3."]);
		const said = lessonNarrations(script);
		expect(said).toContain('Her saat ara 30 kilometre kapanır.');
		expect(said).toContain("İki tarafı 30'a bölelim: t eşittir 3.");
	});

	it('refuses a step that writes nothing, steps with beats, and steps with a separate explanation', () => {
		expect(refusedCards([{...worked, steps: [{narration: 'Bir şey söylenir.'}]}])).toBe(true);
		expect(refusedCards([{...worked, visual: {kind: 'formula', latex: 't = 3'}, beats: [{narration: 'Formül.'}]}])).toBe(true);
		expect(refusedCards([{...worked, explanation: 'Üç saatte yakalar.'}])).toBe(true);
	});

	it('moves the example\'s figure with its steps and refuses a step that points at a part it does not have', () => {
		const withBars = {...worked, visual: {kind: 'barModel', bars: [{label: 'Ara', pieces: [{units: 3, label: '90'}]}]}, steps: [{...worked.steps[0], show: ['b1']}, worked.steps[1]]};
		expect(cardBeats(lessonWith([withBars]).lesson.sections[0].cards[0])[0].show).toEqual(['b1']);
		expect(refusedCards([{...withBars, steps: [{...worked.steps[0], show: ['b7']}]}])).toBe(true);
	});

	it('suggests steps for a solution squeezed into a table or a block of formulas', () => {
		const table = {kind: 'example', title: 'Tablo', example: 'İki denklemi topla.', narration: 'İki denklemi topla.', visual: {kind: 'table', header: ['Adım', 'İşlem'], rows: [['Topla', '3c + 3s = 75'], ['Böl', 'c + s = 25']]}};
		const block = {kind: 'example', title: 'Blok', example: 'Paylaştır.', narration: 'Paylaştır.', explanation: '$3k + 5k = 120$ ve $k = 15$.'};
		const {suggestions} = reviewScript(lessonWith([table, block, worked]));
		expect(suggestions.filter((line) => line.includes('`steps`')).map((line) => line.slice(0, 5))).toEqual(['s1-c1', 's1-c2']);
	});
});

describe('the cue of an explanation that opens with a formula', () => {
	it('reads a formula as it is said, so it can be found in the narration', () => {
		expect(plainWords('$123 \\equiv 6$ olur')).toMatch(/123/);
		expect(plainWords('**Toplam** $3 + 4$')).toContain('Toplam');
	});

	it('brings in the explanation when its formula is said', () => {
		const card = {kind: 'example', title: 'Mod', example: '123 sayısının 9 ile bölümünden kalan.', explanation: '$123 \\equiv 6$ çünkü rakamlar toplamı 6.', narration: '123 sayısının 9 ile bölümünden kalan. 123, 6 ile denktir çünkü rakamlar toplamı 6.', beats: [], steps: []} as Extract<LessonCard, {kind: 'example'}>;
		const cues = cardCues(card, {text: card.narration, startSeconds: 0, seconds: 10});
		expect(cues.explanation).toBeDefined();
		expect(cues.explanation).toBeGreaterThan(3);
	});
});

describe('a solution step points at the question\'s own figure', () => {
	const figureQuestion = {
		kind: 'question',
		question: {
			stem: 'Grafikte f ve g verilmiştir. f(x) > g(x) olan aralık hangisidir?',
			figure: {kind: 'plot', x: [-1, 5], y: [-2, 8], curves: [{expression: '-(x-1)*(x-4)+2'}, {expression: '2'}], points: [{x: 1, y: 2}, {x: 4, y: 2}], regions: [{from: 1, to: 4, between: [0, 1]}]},
			options: ['(−1, 1)', '(1, 4)', '(0, 4)', '(4, 5)', '(2, 4)'],
			answer: 1,
			narration: 'Grafikten okunan bir soru.',
			steps: [
				{text: 'Kesişimler 1 ve 4.', narration: 'Kesişimler 1 ve 4.', figure: {focus: ['p1', 'p2']}},
				{text: 'Arada f üstte.', narration: 'Arada f üstte.', figure: {show: ['z1'], focus: ['z1']}},
				{text: 'Cevap B.', narration: 'Cevap B.'},
			],
		},
	};

	it('turns the steps into beats of the figure, one per step', () => {
		const card = lessonWith([figureQuestion]).lesson.sections[0].cards[0];
		if (card.kind !== 'question') throw new Error('not a question');
		const beats = questionFigureBeats(card.question);
		expect(beats?.map((beat) => [beat.show, beat.focus])).toEqual([
			[[], ['p1', 'p2']],
			[['z1'], ['z1']],
			[[], []],
		]);
	});

	it('leaves a figure no step points at as it was', () => {
		const plain = structuredClone(figureQuestion);
		plain.question.steps = plain.question.steps.map(({figure: _figure, ...step}) => step) as typeof plain.question.steps;
		const card = lessonWith([plain]).lesson.sections[0].cards[0];
		if (card.kind !== 'question') throw new Error('not a question');
		expect(questionFigureBeats(card.question)).toBeUndefined();
	});

	it('refuses a pointer at a part the figure does not have, or at a figure the question does not have', () => {
		const wrongPart = structuredClone(figureQuestion);
		wrongPart.question.steps[1].figure = {show: ['z3'], focus: []};
		expect(refusedCards([wrongPart])).toBe(true);
		const noFigure = structuredClone(figureQuestion) as Record<string, any>;
		delete noFigure.question.figure;
		expect(refusedCards([noFigure])).toBe(true);
	});
});

describe('review of a mathematics lesson', () => {
	it('names no river delta in a mathematics lesson, only in others', () => {
		const delta = {kind: 'concept', title: 'Diskriminant', text: 'Delta sıfırsa kökler eşittir.', narration: 'Delta sıfırsa kökler eşittir; delta pozitifse iki farklı kök vardır.'};
		expect(reviewScript(lessonWith([delta], 'MAT')).suggestions.some((line) => line.includes('akarsu'))).toBe(false);
		expect(reviewScript(lessonWith([delta], 'COG')).suggestions.some((line) => line.includes('akarsu'))).toBe(true);
	});

	it('stops "Hazırlandı" on arithmetic that does not hold, not on a mistake card\'s wrong belief', () => {
		const wrongSum = {kind: 'concept', title: 'Toplam', text: 'Sonuç: $5 \\cdot 4 \\cdot 3 = 50$.', narration: 'Beş çarpı dört çarpı üç.'};
		const belief = {kind: 'mistake', title: 'Üs', wrong: '$3^4 = 12$, çünkü üs ile taban çarpılır.', right: '$3^4 = 81$.', narration: 'Sık yapılan hata. Ama üç üssü dört seksen birdir.'};
		const {issues} = reviewScript(lessonWith([wrongSum, belief]));
		expect(issues.filter((line) => line.includes('does not hold'))).toEqual(['s1-c1: "5 \\cdot 4 \\cdot 3 = 50" does not hold (60 ≠ 50).']);
	});

	it('suggests beats for a staged figure whose line is too short for its stages', () => {
		const ladder = {kind: 'visual', title: 'Merdiven', narration: 'EBOB ve EKOK bulalım.', visual: {kind: 'primeLadder', numbers: [24, 36]}};
		const told = {...ladder, beats: [{narration: 'İkiye bölelim.', stage: 0}, {narration: 'Sonuca bakalım.', stage: 5}]};
		const suggestions = (cards: unknown[]) => reviewScript(lessonWith(cards)).suggestions.filter((line) => line.includes('stages in about'));
		expect(suggestions([ladder])).toHaveLength(1);
		expect(suggestions([told])).toEqual([]);
	});

	it('stops "Hazırlandı" on a backslash outside a formula, not on the set difference written in text', () => {
		const escaped = {kind: 'concept', title: 'Nokta', text: "$R$\\'nin sabit noktası", narration: 'R nin sabit noktası.'};
		const difference = {kind: 'concept', title: 'Fark', text: 'A \\ B kümesi', narration: 'A fark B kümesi.'};
		const {issues} = reviewScript(lessonWith([escaped, difference]));
		expect(issues.filter((line) => line.includes('backslash')).map((line) => line.slice(0, 5))).toEqual(['s1-c1']);
	});

	it('times a worked example\'s steps as beats, so a long solution is not one still screen', () => {
		const long = {
			...worked,
			steps: [{narration: 'Önce aradaki uzaklığı ve iki aracın hızlarını tek tek yazalım, sonra her saat kapanan mesafeyi bulalım, sonra da bunu toplam uzaklığa bölelim ve sonucu dakikaya çevirelim, en sonunda da cevabı kontrol edelim.', math: 't = 3'}],
		};
		expect(stillScreenSuggestions(lessonWith([long])).some((line) => line.startsWith('s1-c1: beat 1'))).toBe(true);
	});
});
