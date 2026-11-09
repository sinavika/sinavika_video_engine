import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {campWelcomeNarration} from '../../src/Courses/Camp';
import {LessonScriptSchema, openingCard, type LessonScript} from '../../src/Courses/LessonScript';
import {openingVarietyIssues} from '../../src/Courses/OpeningVariety';
import {COVER_HOOK_LIMIT} from '../../src/Images/Templates/Thumbnails/CampCover';
import {CampFlash} from '../../src/Templates/Camps/CampFlash/CampFlash';
import {COURSE_DESIGN} from '../../src/Courses/CourseDesign';

/**
 * Every camp lesson on disk against the opening rules (owner, 8 Nov 2026; docs/Courses.md): a cold open in the
 * lesson's own words, short, of a kind that varies within the camp, never a greeting. The 15 TYT Türkçe lessons
 * were published before cold opens existed and are left as they are (owner: "tyt 15 dersi için paylaşım yapıldı").
 */
const ROOT = path.resolve(__dirname, '..', '..');
const PUBLISHED_WITHOUT_OPENING = new Set(['yks-tyt-turkce-kampi']);

type Lesson = {camp: string; job: string; cover?: {hook?: string}; script: LessonScript};

const lessons: Lesson[] = readdirSync(path.join(ROOT, 'Curriculum', 'Jobs')).flatMap((camp) =>
	readdirSync(path.join(ROOT, 'Curriculum', 'Jobs', camp))
		.filter((name) => name.endsWith('-youtube.json'))
		.flatMap((job) => {
			const spec = JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Jobs', camp, job), 'utf8')) as {script?: string; cover?: {hook?: string}};
			return spec.script ? [{camp, job, cover: typeof spec.cover === 'object' ? spec.cover : undefined, script: LessonScriptSchema.parse(JSON.parse(readFileSync(path.join(ROOT, spec.script), 'utf8')))}] : [];
		}),
);
const camps = [...new Set(lessons.map((lesson) => lesson.camp))];
const words = (text: string) => text.split(/\s+/u).filter(Boolean).length;

describe('camp lesson openings on disk', () => {
	it('finds the camps', () => {
		expect(lessons.length).toBeGreaterThan(400);
	});

	it('gives every camp lesson a cold open on one of its own cards, except the published TYT Türkçe camp', () => {
		const missing = lessons.filter((lesson) => !PUBLISHED_WITHOUT_OPENING.has(lesson.camp) && !lesson.script.lesson.opening).map((lesson) => lesson.job);
		expect(missing).toEqual([]);
		const broken = lessons.filter(({script}) => script.lesson.opening && !openingCard(script.lesson.sections, script.lesson.opening)).map((lesson) => lesson.job);
		expect(broken).toEqual([]);
	});

	it('keeps cold opens short: a hook of 5 to 40 words, a promise of at most 25', () => {
		const long = lessons.flatMap(({job, script}) => {
			const opening = script.lesson.opening;
			if (!opening) return [];
			const said = words(opening.narration);
			return said < 5 || said > 40 || words(opening.promise) > 25 ? [`${job}: ${said} words`] : [];
		});
		expect(long).toEqual([]);
	});

	it('opens no two lessons of a camp with the same sentence, and never with a greeting', () => {
		const issues = lessons.flatMap((lesson) => {
			const opening = lesson.script.lesson.opening;
			if (!opening) return [];
			const others = lessons.filter((other) => other.camp === lesson.camp && other !== lesson && other.script.lesson.opening);
			return openingVarietyIssues(opening, others.map((other) => ({name: other.job, opening: other.script.lesson.opening!}))).map((issue) => `${lesson.job}: ${issue}`);
		});
		expect(issues).toEqual([]);
	});

	it('mixes opening kinds in every camp of eight lessons or more', () => {
		const alike = camps.filter((camp) => {
			const kinds = new Set(lessons.filter((lesson) => lesson.camp === camp && lesson.script.lesson.opening).map((lesson) => lesson.script.lesson.opening!.kind));
			const count = lessons.filter((lesson) => lesson.camp === camp).length;
			return !PUBLISHED_WITHOUT_OPENING.has(camp) && count >= 8 && kinds.size < 2;
		});
		expect(alike).toEqual([]);
	});

	it('gives every lesson cover a one-line hook: the job hook or the lesson hook headline', () => {
		const bare = lessons.filter((lesson) => {
			if (PUBLISHED_WITHOUT_OPENING.has(lesson.camp)) return false;
			const headline = lesson.script.lesson.hook.headline.replace(/[$*_`]/g, '').trim();
			return !(lesson.cover?.hook ?? (headline.length <= COVER_HOOK_LIMIT ? headline : undefined));
		});
		expect(bare.map((lesson) => lesson.job)).toEqual([]);
	});

	it('keeps every flash reel within its ceiling (8-12 s test reels)', () => {
		const long = lessons.flatMap(({job, script}) => {
			const seconds = CampFlash.buildScenes(script).reduce((sum, scene) => sum + scene.seconds, 0);
			return seconds > COURSE_DESIGN.length.flash.max ? [`${job}: ${seconds.toFixed(1)} s`] : [];
		});
		expect(long).toEqual([]);
	});

	it('welcomes without a greeting or a self-introduction', () => {
		const greeted = lessons.filter(({script}) => script.camp && /merhaba|ben sinoai/iu.test(campWelcomeNarration(script.camp, {title: script.title, lessonName: script.lessonName})));
		expect(greeted.map((lesson) => lesson.job)).toEqual([]);
	});
});
