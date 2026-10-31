import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {LESSON_GROUPS, lessonGroupOf} from '../../src/Configurations/LessonColors';
import {BRAND_COLORS} from '../../src/Configurations/BrandColors';
import {resolveImageJob} from '../../src/Images/Renderers/ImageJob';
import {resolveVideoJob} from '../../src/Renderers/VideoJob';
import {videoCoverJob} from '../../src/Services/VideoCoverGenerator';
import {contrastRatio} from '../../src/Themes/ColorPalette';
import {lessonTheme} from '../../src/Themes/LessonAccent';
import {THEMES} from '../../src/Themes/ThemeRegistry';
import {ROOT} from '../Support/Paths';

const sample = (name: string) => JSON.parse(readFileSync(path.resolve(ROOT, 'samples', `${name}.json`), 'utf8'));
const SAMPLES = ['QuestionSolution', 'TopicExplanation', 'QuickRevision', 'ConceptExplanation', 'ExamPreparation'];

describe('video cover', () => {
	it.each(SAMPLES)('builds a valid cover for %s in the video\u2019s size, theme and lesson', (name) => {
		const job = resolveVideoJob({...sample(name), theme: 'SinavikaLight'});
		const cover = videoCoverJob(job);
		const resolved = resolveImageJob(cover);

		expect(resolved.template.variant).toBe('VideoCover');
		expect([resolved.width, resolved.height]).toEqual([job.width, job.height]);
		expect(resolved.inputProps.theme).toBe('SinavikaLight');
		expect(resolved.inputProps.lesson).toBe(job.inputProps.lesson);
		expect(cover.content.title.length).toBeGreaterThan(2);
		// A lesson video is labelled with its kind; a video without a lesson never with the template's name.
		expect(cover.content.kicker).toBe(job.inputProps.lesson ? job.template.title : undefined);
	});

	it('takes its texts from the content, highlights the last word, and lets the job replace them', () => {
		const automatic = videoCoverJob(resolveVideoJob(sample('QuickRevision')));
		expect(automatic.content).toMatchObject({title: 'Ses Olayları', emphasis: 'Olayları', lesson: 'Türkçe', exams: ['KPSS', 'YKS']});
		expect(automatic.content.badge).toBeUndefined();

		const custom = videoCoverJob(resolveVideoJob({...sample('QuickRevision'), cover: {title: 'Ses olayları 60 saniyede', emphasis: '60 saniyede', glyph: '60', exams: ['KPSS']}}));
		expect(custom.content).toMatchObject({title: 'Ses olayları 60 saniyede', emphasis: '60 saniyede', glyph: '60', lesson: 'Türkçe', exams: ['KPSS']});
	});

	it('never lights a promotion’s last word on its own: the job chooses what the cover sells', () => {
		const promo = JSON.parse(readFileSync(path.resolve(ROOT, 'Posts', '2026-10-21_NetinYalanSoyluyor', 'Job.json'), 'utf8'));
		const {cover, ...job} = promo;
		expect(videoCoverJob(resolveVideoJob({...job, cover: {title: cover.title, kicker: cover.kicker}})).content.emphasis).toBeUndefined();
		expect(videoCoverJob(resolveVideoJob({...job, cover: {title: cover.title, emphasis: 'yalan', kicker: cover.kicker}})).content.emphasis).toBe('yalan');
	});

	it('shortens long titles at a word and drops formula marks', () => {
		const job = resolveVideoJob({...sample('QuickRevision'), content: {...sample('QuickRevision').content, title: 'Ses olaylarında ünsüz yumuşaması ve ünsüz benzeşmesi'}});
		const {title, emphasis} = videoCoverJob(job).content;
		expect(title.length).toBeLessThanOrEqual(48);
		expect(title.endsWith('…')).toBe(true);
		expect(title).toContain(emphasis);
		expect(() => resolveImageJob(videoCoverJob(job))).not.toThrow();
	});

	it('records what the job says about its cover', () => {
		expect(resolveVideoJob(sample('QuickRevision')).cover).toBeNull();
		expect(resolveVideoJob({...sample('QuickRevision'), cover: true}).cover).toEqual({});
		expect(resolveVideoJob({...sample('QuickRevision'), cover: false}).cover).toBe(false);
		expect(resolveVideoJob(sample('QuickRevision')).inputProps.lesson).toBe('Türkçe');
	});
});

describe('lesson colours', () => {
	it('groups lessons into five families, whatever the letter case', () => {
		expect(lessonGroupOf('Matematik')).toBe('Numeric');
		expect(lessonGroupOf('GEOMETRİ')).toBe('Numeric');
		expect(lessonGroupOf(' fizik ')).toBe('Science');
		expect(lessonGroupOf('Türkçe')).toBe('Verbal');
		expect(lessonGroupOf('Tarih')).toBe('Social');
		expect(lessonGroupOf('İngilizce')).toBe('ForeignLanguage');
		expect(lessonGroupOf('Rehberlik')).toBeNull();
		expect(lessonGroupOf(undefined)).toBeNull();
	});

	it('changes only the accent, and only on the brand themes', () => {
		const tinted = lessonTheme('SinavikaLight', 'Matematik')!;
		expect(tinted.colors.accent).toBe(LESSON_GROUPS.Numeric.light);
		expect(tinted.colors.highlight).toBe(LESSON_GROUPS.Numeric.light);
		expect(tinted.colors.primary).toBe(BRAND_COLORS.brand.primary);
		expect(tinted.colors.lesson).toEqual({fill: LESSON_GROUPS.Numeric.light, on: '#FFFFFF'});
		expect({...tinted.colors, accent: 0, onAccent: 0, highlight: 0, lesson: 0}).toEqual({...THEMES.SinavikaLight.colors, accent: 0, onAccent: 0, highlight: 0, lesson: 0});
		expect(tinted.typography).toBe(THEMES.SinavikaLight.typography);

		expect(lessonTheme('SinavikaDark', 'Matematik')!.colors.accent).toBe(LESSON_GROUPS.Numeric.dark);
		expect(lessonTheme('SinavikaBrand', 'Matematik')).toBeUndefined();
		expect(lessonTheme('SinavikaLight', 'Rehberlik')).toBeUndefined();
	});

	it('keeps every lesson colour readable, distinct, and clear of the status and review colours', () => {
		const reserved = [...Object.values(BRAND_COLORS.status).flatMap((pair) => [pair.light, pair.dark]), ...Object.values(BRAND_COLORS.review)];
		const colours = Object.values(LESSON_GROUPS).flatMap((group) => [group.light, group.dark]);
		expect(new Set(colours).size).toBe(colours.length);
		colours.forEach((colour) => expect(reserved).not.toContain(colour));

		for (const group of Object.keys(LESSON_GROUPS) as (keyof typeof LESSON_GROUPS)[]) {
			for (const themeId of ['SinavikaLight', 'SinavikaDark'] as const) {
				const {colors} = lessonTheme(themeId, LESSON_GROUPS[group].lessons[0])!;
				expect(contrastRatio(colors.onAccent, colors.accent), `${group} ${themeId}`).toBeGreaterThanOrEqual(4.5);
				expect(contrastRatio(colors.accent, colors.background), `${group} ${themeId}`).toBeGreaterThanOrEqual(3);
			}
		}
	});
});
