import {describe, expect, it} from 'vitest';
import {cardCues, cuesInLine, markCues, passageLineBreaks, passageSentences, readingCues, spreadCues, stepCues} from '../../src/Courses/LessonCue';
import {QuestionSchema} from '../../src/Courses/LessonScript';
import {VOICE_LEAD_SECONDS, type VoiceClip} from '../../src/Scenes/Voiceover';

/** A clip whose words start one second apart. */
const clipOf = (text: string): VoiceClip => {
	const words = text.split(/\s+/).filter(Boolean);
	return {src: 'x.mp3', startSeconds: 0, durationSeconds: words.length, playbackRate: 1, words: words.map((word, index) => ({text: word, startSeconds: index}))};
};
const lineOf = (text: string, startSeconds = 0) => ({clip: clipOf(text), text, startSeconds, seconds: text.split(/\s+/).length + 1});

describe('lesson cues', () => {
	it('places each phrase at the word that starts it, in order', () => {
		const line = lineOf('Bir: kendi başına anlaşılır. İki: bu yüzden ile başlamaz.');
		const [first, second] = cuesInLine(line, ['Kendi başına **anlaşılır**; önceki cümleye bakmaz.', '**Bu yüzden** gibi sözlerle başlamaz.']);
		expect(first).toBeCloseTo(VOICE_LEAD_SECONDS + 1 - 0.08);
		expect(second).toBeCloseTo(VOICE_LEAD_SECONDS + 5 - 0.08);
	});

	it('spreads parts the narration does not name between their neighbours, never out of order', () => {
		expect(spreadCues([1, undefined, 5], 0, 9)).toEqual([1, 3, 5]);
		expect(spreadCues([undefined, undefined], 0, 3)).toEqual([1, 2]);
		expect(spreadCues([4, 2], 0, 9)[1]).toBeGreaterThan(4);
	});

	it('marks a bold phrase when it is said and leaves an unsaid one plain', () => {
		const line = lineOf('Konu ne anlatıldığıdır, ana düşünce ise mesajdır.');
		const [[konu, missing]] = markCues(line, ['**Konu** ve **başlık**']);
		expect(konu).toBeDefined();
		expect(missing).toBeUndefined();
	});

	it('brings a mistake card\'s correction with the narrator\'s turn to it', () => {
		const card = {kind: 'mistake' as const, title: 'x', wrong: 'Yanlış inanç burada.', right: 'Konu bütün cümlelerin ortak anlattığıdır.', narration: 'x'};
		const cues = cardCues(card, lineOf('Öğrenci yanlış yapar. Oysa konu bütün cümlelerin ortak anlattığıdır.'));
		expect(cues.right).toBeCloseTo(VOICE_LEAD_SECONDS + 4 - 0.08);
	});

	it('cuts a passage into its numbered parts and sentences', () => {
		expect(passageSentences('(I) Bir. (II) İki iki. (III) Üç')).toEqual(['(I) Bir.', '(II) İki iki.', '(III) Üç']);
		expect(passageSentences('----. Arı çalışır. Bal olur!')).toEqual(['----.', 'Arı çalışır.', 'Bal olur!']);
	});

	it('keeps the line breaks of a passage written as lines', () => {
		const context = 'Gezi programı:\nBirinci gün, Milet. Thales konuşulur.\nİkinci gün, Efes';
		expect(passageSentences(context)).toEqual(['Gezi programı:', 'Birinci gün, Milet.', 'Thales konuşulur.', 'İkinci gün, Efes']);
		expect(passageLineBreaks(context)).toEqual([true, false, true, false]);
	});

	it('follows the reading of a question sentence by sentence', () => {
		const question = QuestionSchema.parse({stem: 'Hangisi doğru?', context: '(I) Zeytin dayanıklıdır. (II) Yağı yemeklerde kullanılır.', options: ['I.', 'II.'], answer: 0, steps: [{text: 'x', narration: 'x'}], narration: 'x'});
		const line = lineOf(', bir numara, Zeytin dayanıklıdır. , iki numara, Yağı yemeklerde kullanılır. Hangisi doğru?', 10);
		const cues = readingCues(question, line);
		expect(cues.sentences[0] ?? 0).toBeLessThan(cues.sentences[1] ?? 0);
		expect(cues.sentences[0] ?? 0).toBeGreaterThan(10);
		expect(cues.stem).toBeGreaterThan(cues.sentences[1] ?? 0);
	});

	it('strikes an option when its letter is said, not at a word that starts with it', () => {
		const step = {text: 'x', narration: 'x', eliminate: ['A' as const], mark: [], sentences: [3]};
		const cues = stepCues(step, lineOf('Ama önce bakalım: A bu yüzden ile başlıyor; üç numaralı cümle başka yöne gidiyor.', 20));
		expect(cues.eliminate[0]).toEqual({option: 0, at: expect.closeTo(20 + VOICE_LEAD_SECONDS + 3 - 0.08)});
		expect(cues.sentences[0].at).toBeCloseTo(20 + VOICE_LEAD_SECONDS + 8 - 0.08);
	});

	it('refuses a step that rules out the answer or marks words the question does not have', () => {
		const base = {stem: 'Hangisi?', context: 'Oysa ustalar hata yapar.', options: ['A şık', 'B şık'], answer: 1, narration: 'x'};
		expect(QuestionSchema.safeParse({...base, steps: [{text: 'x', narration: 'x', eliminate: ['B']}]}).success).toBe(false);
		expect(QuestionSchema.safeParse({...base, steps: [{text: 'x', narration: 'x', mark: ['yoktur']}]}).success).toBe(false);
		expect(QuestionSchema.safeParse({...base, steps: [{text: 'x', narration: 'x', eliminate: ['A'], mark: ['oysa']}]}).success).toBe(true);
	});
});

describe('mistake card without the correction\'s own words', () => {
	it('brings the correction with the narrator\'s turn, and the reason after it', () => {
		const card = {kind: 'mistake' as const, title: 'x', wrong: 'Sayı geçen cümle nesneldir.', right: 'Bilgi olsa da yorum varsa öznel olur.', why: 'Karar veren doğrulanabilirliktir.', narration: 'x'};
		const cues = cardCues(card, lineOf('Burada çok yapılan bir hata var. Öğrenci amaç olarak bunu sanır. Ama dur bir saniye, gereksiz uzun bir yorumdur ve bunun için yargı öznel olur.'));
		expect(cues.right).toBeCloseTo(VOICE_LEAD_SECONDS + 11 - 0.08);
		expect(cues.why ?? 0).toBeGreaterThan(cues.right ?? 0);
	});
});
