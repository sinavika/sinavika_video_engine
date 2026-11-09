import {describe, expect, it} from 'vitest';
import {COURSE_DESIGN} from '../../src/Courses/CourseDesign';
import {CAMP_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {LessonScriptSchema, MAX_STILL_SCREEN_SECONDS, stillScreenSuggestions} from '../../src/Courses/LessonScript';
import {introObjectiveCues} from '../../src/Templates/Courses/CourseLesson/CourseLesson';
import {THINK_LABEL} from '../../src/Templates/Courses/CourseLesson/Scenes/QuestionScene';

/** Rules from the Gemini review of the Paragraf camp lesson (docs/Analiz/2026-11-09-Paragraf-Dersi-Gemini.md). */
describe('lesson pace (9 Nov 2026 review)', () => {
	const script = LessonScriptSchema.parse(CAMP_SCRIPT_SAMPLE);

	it('brings each "Bu videoda" objective in while the line is said, in order', () => {
		const cues = introObjectiveCues(script, {text: 'Bu derste üç şey öğreneceksin.', startSeconds: 0, seconds: 10});
		expect(cues).toHaveLength(script.lesson.objectives.length);
		const times = cues.map((cue) => cue ?? -1);
		for (const time of times) expect(time).toBeGreaterThan(0);
		for (const time of times) expect(time).toBeLessThanOrEqual(8.5);
		expect([...times].sort((a, b) => a - b)).toEqual(times);
	});

	it('keeps the thinking pause short and asks the viewer to pause and try', () => {
		expect(COURSE_DESIGN.pacing.questionThinkSeconds).toBe(3);
		expect(THINK_LABEL).toBe('Durdur ve dene');
	});

	it('flags narration said over an unchanged screen for too long', () => {
		const long = Array.from({length: 40}, () => 'kelime').join(' ');
		const still = LessonScriptSchema.parse({
			...script,
			lesson: {...script.lesson, sections: script.lesson.sections.map((section, index) => (index === 0 ? {...section, cards: [{kind: 'concept', title: 'Uzun kart', text: 'Düz bir metin.', narration: `${long}.`}, ...section.cards.slice(1)]} : section))},
		});
		const flags = stillScreenSuggestions(still).filter((line) => line.startsWith('s1-c1'));
		expect(flags).toHaveLength(1);
		expect(flags[0]).toContain(`nothing new on screen (at most ${MAX_STILL_SCREEN_SECONDS})`);
		// Marked phrases light up as the voice says them: spoken through the line, they keep the screen moving.
		const stretch = Array.from({length: 12}, () => 'kelime').join(' ');
		const spokenMarks = `${stretch} sıcaklık ${stretch} basınç ${stretch} yoğunluk ${stretch}.`;
		const marked = LessonScriptSchema.parse({
			...script,
			lesson: {...script.lesson, sections: script.lesson.sections.map((section, index) => (index === 0 ? {...section, cards: [{kind: 'concept', title: 'Uzun kart', text: '**Sıcaklık**, **basınç** ve **yoğunluk**.', narration: spokenMarks}, ...section.cards.slice(1)]} : section))},
		});
		// The same marks the voice never says do not count.
		const unsaid = LessonScriptSchema.parse({
			...script,
			lesson: {...script.lesson, sections: script.lesson.sections.map((section, index) => (index === 0 ? {...section, cards: [{kind: 'concept', title: 'Uzun kart', text: '**Sıcaklık**, **basınç** ve **yoğunluk**.', narration: `${long}.`}, ...section.cards.slice(1)]} : section))},
		});
		expect(stillScreenSuggestions(unsaid).filter((line) => line.startsWith('s1-c1'))).toHaveLength(1);
		expect(stillScreenSuggestions(marked).filter((line) => line.startsWith('s1-c1'))).toEqual([]);
	});
});
