import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {parseExpression, isExpression} from '../src/Components/Visuals/PlotExpression';
import {COURSE_VISUAL_KINDS, CourseVisualSchema} from '../src/Components/Visuals/VisualSchemas';
import {COURSE_LESSON_COLORS} from '../src/Configurations/LessonColors';
import {LESSON_VISUAL_KITS, visualKitOf} from '../src/Courses/CourseDesign';
import {ChecklistSchema, inProductionOrder, nextEntry, type Category} from '../src/Courses/Curriculum';
import {checklistMarkdown, parseLessonList} from '../src/Courses/CurriculumImport';
import {LESSON_SCRIPT_SAMPLE} from '../src/Courses/LessonScriptSample';
import {LessonScriptSchema, reviewScript} from '../src/Courses/LessonScript';
import {creditLine} from '../src/Courses/MediaLibrary';
import {contrastRatio} from '../src/Themes/ColorPalette';
import {courseLessonTheme} from '../src/Themes/LessonAccent';

const row = (category: string, lesson: string, topic: string, subtopic: string, subtopicName = subtopic) =>
	['EX', 'ex-id', 'Exam', category, `${category}-id`, category, lesson, `${category}-${lesson}`, lesson, topic, `${category}-${lesson}-${topic}`, topic, subtopic, `${subtopic}-id`, subtopicName].join(';');

describe('lesson list', () => {
	it('builds the hierarchy exam → category → lesson → topic → subtopic, keeping the order of the list', () => {
		const [category] = parseLessonList([row('C1', 'TRK', 'T1', 'T1_01'), row('C1', 'TRK', 'T1', 'T1_02'), row('C1', 'TRK', 'T2', 'T2_01')].join('\n'));
		expect(category.lessons[0].topics.map((topic) => topic.code)).toEqual(['T1', 'T2']);
		expect(category.lessons[0].topics[0].subtopics.map((subtopic) => subtopic.code)).toEqual(['T1_01', 'T1_02']);
	});

	it('reads a quoted value that contains the separator', () => {
		const [category] = parseLessonList(`﻿${row('C1', 'TRK', 'NOKTALAMA', 'N_03', '"Noktalı Virgül (;)"')}`);
		expect(category.lessons[0].topics[0].subtopics[0].name).toBe('Noktalı Virgül (;)');
	});

	it('rejects a line with the wrong number of columns', () => {
		expect(() => parseLessonList('a;b;c')).toThrow(/15 expected/);
	});
});

describe('production order', () => {
	const category = (code: string, lessons: string[]): Category => ({
		exam: code.split('_')[0],
		examId: 'x',
		examName: 'x',
		code,
		id: code,
		name: code,
		lessons: lessons.map((lesson) => ({code: lesson, id: lesson, name: lesson, topics: [{code: 'T', id: `${code}${lesson}`, name: 'T', subtopics: [{code: 'S', id: 'S', name: 'S'}]}]})),
	});

	it('goes TYT, AYT, YDT, then KPSS, then the rest in list order', () => {
		const ordered = inProductionOrder([category('KPSS_LISANS', ['TRK']), category('US_SAT_DIGITAL', ['MATH']), category('YKS_YDT', ['ING']), category('YKS_AYT', ['TDE']), category('YKS_TYT', ['TRK'])]);
		expect(ordered.map((item) => item.code)).toEqual(['YKS_TYT', 'YKS_AYT', 'YKS_YDT', 'KPSS_LISANS', 'US_SAT_DIGITAL']);
	});

	it('puts Türkçe, Matematik and Tarih first in each category, and keeps the list order after them', () => {
		const [tyt] = inProductionOrder([category('YKS_TYT', ['COG', 'TAR', 'FEL', 'MAT', 'TRK', 'GEO'])]);
		expect(tyt.lessons.map((lesson) => lesson.code)).toEqual(['TRK', 'MAT', 'TAR', 'COG', 'FEL', 'GEO']);
		const [ayt] = inProductionOrder([category('YKS_AYT', ['TAR2', 'MAT', 'TAR1', 'TDE', 'FIZ'])]);
		expect(ayt.lessons.map((lesson) => lesson.code)).toEqual(['TDE', 'MAT', 'TAR2', 'TAR1', 'FIZ']);
	});
});

describe('production checklist', () => {
	const file = path.resolve(__dirname, '..', 'Curriculum', 'Production', 'Checklist.json');
	const checklist = existsSync(file) ? ChecklistSchema.parse(JSON.parse(readFileSync(file, 'utf8'))) : null;

	it.runIf(checklist)('starts with TYT Türkçe, Sözcükte Anlam, as the lesson list does', () => {
		const [first] = checklist!.entries;
		expect([first.category, first.lesson, first.topic, first.topicName]).toEqual(['YKS_TYT', 'TRK', 'SOZCUKTE_ANLAM', 'Sözcükte Anlam']);
		expect(checklist!.entries.map((entry) => entry.order)).toEqual(checklist!.entries.map((_, index) => index + 1));
		expect(new Set(checklist!.entries.map((entry) => entry.id)).size).toBe(checklist!.entries.length);
	});

	it.runIf(checklist)('lists every category in priority order', () => {
		const categories = [...new Set(checklist!.entries.map((entry) => entry.category))];
		expect(categories.slice(0, 6)).toEqual(['YKS_TYT', 'YKS_AYT', 'YKS_YDT', 'KPSS_LISANS', 'KPSS_ONLISANS', 'KPSS_ORTAOGRETIM']);
	});

	it.runIf(checklist)('renders as a Markdown table per lesson and finds the next topic to produce', () => {
		const markdown = checklistMarkdown(checklist!);
		expect(markdown).toContain('## YKS · TYT');
		expect(markdown).toContain('| 1 | Sözcükte Anlam `SOZCUKTE_ANLAM` |');
		expect(nextEntry({...checklist!, entries: checklist!.entries.map((entry, index) => (index === 0 ? {...entry, status: {...entry.status, youtube: '2026-10-14T10:00:00+03:00'}} : entry))})?.order).toBe(2);
	});
});

describe('plot expressions', () => {
	it('evaluates arithmetic, powers, implicit products and functions', () => {
		expect(parseExpression('x^2 - 4x + 3', ['x'])({x: 3})).toBe(0);
		expect(parseExpression('2(x+1)', ['x'])({x: 2})).toBe(6);
		expect(parseExpression('-x^2', ['x'])({x: 3})).toBe(-9);
		expect(parseExpression('16t - 5t^2', ['t'])({t: 2})).toBe(12);
		expect(parseExpression('sqrt(16 - x^2) + 2sin(pi/2)', ['x'])({x: 0})).toBeCloseTo(6, 10);
	});

	it('rejects unknown names and broken expressions instead of running them', () => {
		expect(isExpression('process.exit()', ['x'])).toBe(false);
		expect(isExpression('x +', ['x'])).toBe(false);
		expect(isExpression('y^2', ['x'])).toBe(false);
	});
});

describe('course visuals', () => {
	it('has a kit for the core lessons, made only of known visual kinds', () => {
		for (const [lesson, kit] of Object.entries(LESSON_VISUAL_KITS)) {
			kit.forEach((kind) => expect(COURSE_VISUAL_KINDS, `${lesson}/${kind}`).toContain(kind));
		}
		expect(visualKitOf('UNKNOWN').length).toBeGreaterThan(0);
	});

	it('rejects a plot whose expression does not parse and a picture from outside the media library', () => {
		expect(CourseVisualSchema.safeParse({kind: 'plot', x: [0, 1], y: [0, 1], curves: [{expression: 'x^'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'picture', src: 'https://example.com/a.jpg', credit: 'x'}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'picture', src: 'Media/History/a.jpg', credit: 'Anonim · Kamu malı · Wikimedia Commons'}).success).toBe(true);
	});

	it('every gallery visual in the samples is valid', () => {
		const gallery = JSON.parse(readFileSync(path.resolve(__dirname, '..', 'samples', 'Courses', 'VisualGallery.json'), 'utf8'));
		expect(LessonScriptSchema.safeParse(gallery.content).success).toBe(true);
	});
});

describe('lesson colours', () => {
	it('gives every course lesson a colour that carries white text', () => {
		for (const [code, colour] of Object.entries(COURSE_LESSON_COLORS)) expect(contrastRatio('#FFFFFF', colour), code).toBeGreaterThanOrEqual(4.5);
	});

	it('colours the brand themes by lesson code and leaves other themes alone', () => {
		expect(courseLessonTheme('SinavikaLight', 'MAT')?.colors.lesson?.fill).toBe(COURSE_LESSON_COLORS.MAT);
		expect(courseLessonTheme('SinavikaDark', 'MAT')?.colors.lesson?.fill).not.toBe(COURSE_LESSON_COLORS.MAT);
		expect(courseLessonTheme('VibrantDynamic', 'MAT')).toBeUndefined();
		expect(courseLessonTheme('SinavikaLight', 'NOPE')).toBeUndefined();
	});
});

describe('lesson script', () => {
	const script = LessonScriptSchema.parse(LESSON_SCRIPT_SAMPLE);

	it('requires a worked question and an answer that is one of the options', () => {
		const withoutQuestions = {...LESSON_SCRIPT_SAMPLE, lesson: {...LESSON_SCRIPT_SAMPLE.lesson, sections: LESSON_SCRIPT_SAMPLE.lesson.sections.map((section) => ({...section, cards: section.cards.filter((card) => card.kind !== 'question')})).filter((section) => section.cards.length > 0)}};
		expect(LessonScriptSchema.safeParse(withoutQuestions).success).toBe(false);
		const question = script.lesson.sections[2].cards[1];
		expect(question.kind).toBe('question');
		if (question.kind === 'question') expect(question.question.options[question.question.answer]).toContain('sıcak** davrandı');
	});

	it('reviews length, coverage and questions against the targets', () => {
		const review = reviewScript(script, ['SOZCUKTE_ANLAM_01', 'SOZCUKTE_ANLAM_13']);
		expect(review.questions).toBe(1);
		expect(review.issues.join(' ')).toMatch(/at least 8 min/);
		expect(review.issues.join(' ')).toMatch(/SOZCUKTE_ANLAM_13/);
		expect(review.issues.join(' ')).not.toMatch(/SOZCUKTE_ANLAM_01,/);
	});
});

describe('media library', () => {
	it('writes the credit line a licence asks for', () => {
		expect(creditLine({author: 'Anonim', license: 'PD'}, 'Wikimedia Commons')).toBe('Anonim · Kamu malı · Wikimedia Commons');
		expect(creditLine({author: 'A. Yazar', license: 'CC BY-SA', licenseVersion: '4.0'}, 'Wikimedia Commons')).toBe('A. Yazar · CC BY-SA 4.0 · Wikimedia Commons');
	});
});
