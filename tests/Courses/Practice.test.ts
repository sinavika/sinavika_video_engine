import {describe, expect, it} from 'vitest';
import {LESSON_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {LessonCardSchema, LessonScriptSchema, lessonNarrations, practiceIssues, practiceSuggestions, practiceTaughtShare, unansweredItems} from '../../src/Courses/LessonScript';
import {PRACTICE_TASKS, spokenPracticeAsk, THINK_PROMPT} from '../../src/Courses/LessonSpeech';
import {worksCard} from '../../src/Works/WorksView';
import {CourseLesson} from '../../src/Templates/Courses/CourseLesson/CourseLesson';
import {CampLesson} from '../../src/Templates/Camps/CampLesson/CampLesson';
import {CAMP_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';

/** "Sıra sende" (8 Nov 2026): the app's match, flip and ordering steps as a lesson card. */
const board = {kind: 'ordering', items: [{label: 'Borsa çöktü'}, {label: 'Bankalar battı'}, {label: 'İşsizlik arttı'}]};
const practice = (overrides: Record<string, unknown> = {}) => ({
	kind: 'practice',
	title: 'Bunalımın zinciri',
	visual: board,
	narration: 'Bunalım bir zincir gibi ilerledi.',
	beats: [
		{narration: 'Önce borsa çöktü.', focus: ['p1']},
		{narration: 'Sonra bankalar battı ve işsizlik arttı.', focus: ['p2', 'p3']},
	],
	...overrides,
});

describe('practice card', () => {
	it('takes a matching board, flip cards or an ordering board, nothing else', () => {
		expect(LessonCardSchema.safeParse(practice()).success).toBe(true);
		expect(LessonCardSchema.safeParse(practice({visual: {kind: 'flipcards', cards: [{front: 'Ribat', back: 'Sınır yapısı'}, {front: 'Ahilik', back: 'Esnaf teşkilatı'}]}, beats: [{narration: 'Ribat ve ahilik.', focus: ['p1', 'p2']}]})).success).toBe(true);
		expect(LessonCardSchema.safeParse(practice({visual: {kind: 'flow', nodes: board.items}})).success).toBe(false);
	});

	it('answers every item: an item no beat focuses is refused', () => {
		const card = practice({beats: [{narration: 'Önce borsa çöktü.', focus: ['p1']}]});
		expect(LessonCardSchema.safeParse(card).success).toBe(false);
		expect(unansweredItems(board as never, [{focus: ['p1']}])).toEqual(['p2', 'p3']);
		expect(unansweredItems(board as never, [{focus: ['P1', 'p2', 'p3']}])).toEqual([]);
	});

	it('is asked by the template: lead-in, the task for its board, the cue to think', () => {
		const card = LessonCardSchema.parse(practice());
		const asked = spokenPracticeAsk(card as never);
		expect(asked).toBe(`Bunalım bir zincir gibi ilerledi. ${PRACTICE_TASKS.ordering.said} ${THINK_PROMPT}`);
		expect(Object.keys(PRACTICE_TASKS).sort()).toEqual(['flipcards', 'matching', 'ordering']);
	});

	it('plays the ask, a silent countdown, then one voice line per beat', () => {
		const script = LessonScriptSchema.parse(LESSON_SCRIPT_SAMPLE);
		const scenes = CourseLesson.buildScenes(script);
		const scene = scenes.find((entry) => entry.label?.startsWith('Sıra sende'));
		expect(scene).toBeDefined();
		const card = script.lesson.sections.flatMap((section) => section.cards).find((entry) => entry.kind === 'practice');
		if (!scene || card?.kind !== 'practice') throw new Error('The sample has a practice card.');
		const [ask, ...beats] = scene.voice ?? [];
		expect(ask.id).toMatch(/-q$/);
		expect(beats).toHaveLength(card.beats.length);
		// The countdown is time of its own after the ask's words.
		expect(scene.seconds).toBeCloseTo([ask, ...beats].reduce((sum, slot) => sum + slot.seconds, 0), 5);
		expect(ask.seconds).toBeGreaterThanOrEqual(card.thinkSeconds);
		expect(lessonNarrations(script)).toContain(spokenPracticeAsk(card));
	});

	it('keeps its place in a camp lesson', () => {
		const scenes = CampLesson.buildScenes(LessonScriptSchema.parse(CAMP_SCRIPT_SAMPLE));
		expect(scenes.some((scene) => scene.label?.startsWith('Sıra sende'))).toBe(true);
	});

	it('goes to Works as the visual card it was, an ordering board as the flow of its items', () => {
		const card = LessonCardSchema.parse(practice());
		if (card.kind !== 'practice') throw new Error('A practice card.');
		expect(worksCard(card)).toEqual({kind: 'visual', title: card.title, visual: {kind: 'flow', nodes: board.items}, narration: card.narration, beats: card.beats});
		const concept = LessonCardSchema.parse({kind: 'concept', title: 'Bunalım', text: 'Ekonomik çöküş.', narration: 'Bunalım ekonomik bir çöküştür.'});
		expect(worksCard(concept)).toBe(concept);
	});

	it('asks only after teaching: never first in a section, and mostly about what the section said', () => {
		const script = LessonScriptSchema.parse(LESSON_SCRIPT_SAMPLE);
		expect(practiceIssues(script)).toEqual([]);
		expect(practiceSuggestions(script)).toEqual([]);
		const section = script.lesson.sections[2];
		const at = section.cards.findIndex((card) => card.kind === 'practice');
		expect(practiceTaughtShare(section, at)).toBeGreaterThanOrEqual(0.5);
		const first = {...section, cards: [section.cards[at], ...section.cards.filter((_, index) => index !== at)]};
		const opened = {...script, lesson: {...script.lesson, sections: [script.lesson.sections[0], script.lesson.sections[1], first]}};
		expect(practiceIssues(opened)).toHaveLength(1);
		const card = LessonCardSchema.parse(practice());
		const untaught = {narration: 'Yeni bölüm.', cards: [LessonCardSchema.parse({kind: 'concept', title: 'Giriş', text: 'Ekonomi.', narration: 'Ekonomiye bakalım.'}), card]};
		expect(practiceTaughtShare(untaught, 1)).toBe(0);
		const taught = {narration: 'Borsa çöktü, bankalar battı, işsizlik arttı.', cards: untaught.cards};
		expect(practiceTaughtShare(taught, 1)).toBe(1);
	});
});
