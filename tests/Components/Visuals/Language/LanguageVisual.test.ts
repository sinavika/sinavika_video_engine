import {describe, expect, it} from 'vitest';
import {linkLevels} from '../../../../src/Components/Visuals/Language/Sentence';
import {paragraphRails} from '../../../../src/Components/Visuals/Language/Paragraph';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';
import {LessonScriptSchema} from '../../../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../../../src/Courses/LessonScriptSample';

const sentence = (extra: object = {}) => ({kind: 'sentence', parts: [{text: 'Yağmur'}, {text: 'yağdığı için'}, {text: 'maç ertelendi.'}], ...extra});

describe('sentence links and swaps', () => {
	it('lifts an arc over the arcs nested inside it, so their labels do not stack', () => {
		// "evin giriş kapısı": evin → kapısı spans giriş → kapısı.
		expect(linkLevels([{from: 2, to: 3}, {from: 1, to: 3}])).toEqual([0, 1]);
		expect(linkLevels([{from: 1, to: 2}, {from: 2, to: 3}])).toEqual([0, 0]);
		expect(linkLevels([{from: 3, to: 1}, {from: 1, to: 2}, {from: 2, to: 3}])).toEqual([2, 0, 0]);
	});

	it('joins two different parts that the sentence has', () => {
		expect(CourseVisualSchema.safeParse(sentence({links: [{from: 2, to: 3, label: 'neden → sonuç'}]})).success).toBe(true);
		expect(CourseVisualSchema.safeParse(sentence({links: [{from: 2, to: 2}]})).success).toBe(false);
		expect(CourseVisualSchema.safeParse(sentence({links: [{from: 1, to: 4}]})).success).toBe(false);
	});

	it('lets a beat swap only a word that has a swap', () => {
		const withSwap = sentence({parts: [{text: 'Yağmur'}, {text: 'yağdığı için'}, {text: 'maç ertelendi.', swap: {text: 'maç iptal edildi.'}}]});
		const card = (swap: string[]) => ({kind: 'concept', title: 'Örnek', text: 'Metin', visual: withSwap, beats: [{narration: 'Yağmur yağdığı için maç ertelendi.', swap}], narration: 'Anlatım.'});
		const script = (swap: string[]) => ({...LESSON_SCRIPT_SAMPLE, lesson: {...LESSON_SCRIPT_SAMPLE.lesson, sections: [{...LESSON_SCRIPT_SAMPLE.lesson.sections[0], cards: [card(swap)]}, ...LESSON_SCRIPT_SAMPLE.lesson.sections.slice(1)]}});
		expect(LessonScriptSchema.safeParse(script(['w3'])).success).toBe(true);
		const refused = LessonScriptSchema.safeParse(script(['w1']));
		expect(refused.error?.issues.map((issue) => issue.message).join(' ')).toMatch(/w1 has no swap word/);
	});
});

describe('paragraph map', () => {
	const paragraph = (sentences: object[]) => ({kind: 'paragraph', sentences});

	it('has one main sentence, never the one that breaks the flow', () => {
		expect(CourseVisualSchema.safeParse(paragraph([{text: 'Bir.'}, {text: 'İki.', main: true}])).success).toBe(true);
		expect(CourseVisualSchema.safeParse(paragraph([{text: 'Bir.', main: true}, {text: 'İki.', main: true}])).success).toBe(false);
		expect(CourseVisualSchema.safeParse(paragraph([{text: 'Bir.', main: true, off: true}, {text: 'İki.'}])).success).toBe(false);
		expect(numberedPartNames(CourseVisualSchema.parse(paragraph([{text: 'Bir.'}, {text: 'İki.'}])))).toEqual(['topic', 's1', 's2']);
	});

	it('runs every supporting sentence\'s arrow into the main one, around the sentence that breaks the flow', () => {
		const sentences = [{main: false, off: false}, {main: false, off: true}, {main: true, off: false}, {main: false, off: false}];
		const rails = paragraphRails(sentences, [0, 1, 2, 3]);
		// Sentences I and IV send arrows, II (off) does not, III (main) receives one.
		expect(rails.map((rail) => rail.stubAt !== undefined)).toEqual([true, false, false, true]);
		expect(rails[2].arrowAt).toBeDefined();
		// The rail passes through II on its way down from I, and comes up from IV.
		expect(rails[1].top?.towards).toBe('down');
		expect(rails[1].bottom?.towards).toBe('down');
		expect(rails[3].top?.towards).toBe('up');
		// The rail reaches the main sentence after it leaves the first one.
		expect(rails[2].arrowAt ?? 0).toBeGreaterThan(rails[0].stubAt ?? 0);
	});

	it('lights the main sentence only after it is on screen, though its supports came first', () => {
		const rails = paragraphRails([{main: false, off: false}, {main: false, off: false}, {main: true, off: false}], [0, 1, 10]);
		expect(rails[2].arrowAt ?? 0).toBeGreaterThan(10);
		expect(rails[1].bottom?.start ?? 0).toBeGreaterThan(10);
	});

	it('draws no rail without a main sentence', () => {
		expect(paragraphRails([{main: false, off: false}, {main: false, off: false}], [0, 1])).toEqual([{}, {}]);
	});
});

describe('verses', () => {
	const verse = {text: 'Hakkında kesin bilgi sahibi olmadığın şeyin peşine düşme.', source: 'İsra suresi, 36. ayet', message: 'Bilgiyi **araştırmadan** hüküm verme.'};
	it('takes one to three passages, each with its source and an optional message', () => {
		const visual = CourseVisualSchema.parse({kind: 'verses', items: [verse, {text: 'Rabbim, ilmimi artır.', source: 'Taha suresi, 114. ayet'}]});
		expect(numberedPartNames(visual)).toEqual(['q1', 'q2']);
		expect(CourseVisualSchema.safeParse({kind: 'verses', items: []}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'verses', items: [verse, verse, verse, verse]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'verses', items: [{text: verse.text}]}).success).toBe(false);
	});
});
