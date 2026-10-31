import {describe, expect, it} from 'vitest';
import {LessonScriptSchema, processVisualSuggestions, type LessonScript} from '../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {lessonMix, repeatedSentences, similarQuestions, textSimilarity} from '../../src/Courses/ScriptAudit';

const sample = (): LessonScript => LessonScriptSchema.parse(structuredClone(LESSON_SCRIPT_SAMPLE));

/** The sample with its first card's narration replaced. */
const withNarration = (narration: string): LessonScript => {
	const script = sample();
	(script.lesson.sections[0].cards[0] as {narration: string}).narration = narration;
	return script;
};

describe('script audit', () => {
	it('measures how alike two texts are, formulas by their own symbols', () => {
		expect(textSimilarity('Bir sayının yarısının üç fazlası kaçtır acaba', 'Bir sayının yarısının üç fazlası kaçtır acaba')).toBe(1);
		expect(textSimilarity('$x^2 - 4 = 0$ denkleminin kökleri kaçtır', '$x^3 + 9 = 1$ denkleminin kökleri kaçtır')).toBeLessThan(0.8);
	});

	it('lists a sentence two lessons share, but not a fixed solution formula', () => {
		const shared = 'Bu cümle iki ayrı derste aynen geçen uzun bir anlatım cümlesidir.';
		const a = withNarration(`${shared} Parçayı ve soruyu birlikte okuyalım.`);
		const b = withNarration(`${shared} Parçayı ve soruyu birlikte okuyalım.`);
		const repeated = repeatedSentences([
			{code: 'A', script: a},
			{code: 'B', script: b},
		]);
		expect(repeated.map((item) => item.sentence)).toContain(shared);
		expect(repeated.some((item) => item.sentence.startsWith('Parçayı ve soruyu'))).toBe(false);
	});

	it('finds no near-copies between two different lessons of the sample', () => {
		expect(similarQuestions([{code: 'A', script: sample()}])).toEqual([]);
	});

	it("counts a lesson's cards and figures", () => {
		const mix = lessonMix(sample());
		expect(mix.cards).toBeGreaterThan(0);
		expect(mix.questions).toBeGreaterThan(0);
		expect(mix.tableShare).toBeGreaterThanOrEqual(0);
		expect(mix.tableShare).toBeLessThanOrEqual(1);
	});
});

describe('process figures', () => {
	it('asks for a moving figure when the narration names a process and none is near', () => {
		const suggestions = processVisualSuggestions(withNarration('Yamaçta heyelan olunca toprak aşağı kayar.'));
		expect(suggestions.some((line) => line.includes('"heyelan"'))).toBe(true);
	});

	it('is satisfied by the landslide scene on the card', () => {
		const script = withNarration('Yamaçta heyelan olunca toprak aşağı kayar.');
		const card = script.lesson.sections[0].cards[0];
		if (!('visual' in card)) throw new Error('the sample opens with a card that can carry a figure');
		card.visual = {kind: 'landform', scene: 'landslide', numbered: false};
		expect(processVisualSuggestions(script).filter((line) => line.startsWith('s1-c1') && line.includes('"heyelan"'))).toEqual([]);
	});

	it('takes the desert scene for wind erosion', () => {
		const script = withNarration("Karapınar'da rüzgâr erozyonu kumulları tarlalara taşıdı.");
		const card = script.lesson.sections[0].cards[0];
		if (!('visual' in card)) throw new Error('the sample opens with a card that can carry a figure');
		card.visual = {kind: 'process', process: 'desert', stages: [], labels: []} as unknown as typeof card.visual;
		expect(processVisualSuggestions(script).filter((line) => line.startsWith('s1-c1') && line.includes('"erozyon"'))).toEqual([]);
	});

	it('does not take a name or an era for a process', () => {
		const said = (narration: string) => processVisualSuggestions(withNarration(narration)).filter((line) => line.startsWith('s1-c1'));
		expect(said('1950 seçimlerini Adnan Menderes ve arkadaşlarının partisi kazandı.')).toEqual([]);
		expect(said("II. Dünya Savaşı'ndan sonra Soğuk Savaş başladı; Türkiye savaş ilan etti ama savaş dışı kaldı.")).toEqual([]);
		expect(said('Büyük Menderes ovasında akarsu menderesler çizer.').some((line) => line.includes('"akarsu aşındırması"'))).toBe(true);
		expect(said("Malazgirt Savaşı'nda Selçuklu süvarisi sahte ricat yaptı.").some((line) => line.includes('"savaş"'))).toBe(true);
		expect(said('Tehlike anında beden savaş ya da kaç tepkisi verir; afetler, salgınlar, savaş, kirlilik stres yaratır.')).toEqual([]);
		expect(said("Hobbes'a göre doğa durumu herkesin herkese savaşıdır; herkes herkese karşı savaş hâlindedir.")).toEqual([]);
		// Polyester is a fibre, not a karst polje (KIM 10).
		expect(said('Naylon ve polyester sentetik liflerdir.')).toEqual([]);
		expect(said('Karstik arazide polyeler ve obruklar oluşur.').some((line) => line.includes('"karst"'))).toBe(true);
		expect(said('Buzul dönemlerinde canlılar güneye göç etti; buzullaşma deniz seviyesini düşürdü.')).toEqual([]);
		expect(said('Buzul vadiyi oyarak U şekline getirir.').some((line) => line.includes('"buzul"'))).toBe(true);
		expect(said('Küresel ısınmayla buzullar hızla erir; buzulların erimesi deniz seviyesini yükseltir.')).toEqual([]);
		expect(said('Kızılırmak ve Göksu deltaları kuşların konakladığı sulak alanlardır; Kızılırmak Deltası en büyüğüdür.')).toEqual([]);
		expect(said('Akarsu ağzında biriktirdiği tortullarla delta kurar.').some((line) => line.includes('"akarsu aşındırması"'))).toBe(true);
		// A difference read aloud ("delta y bölü delta x", Δt) is mathematics, not a river mouth.
		expect(said('Eğim, delta y bölü delta x; hız da delta x bölü delta t.')).toEqual([]);
	});
});
