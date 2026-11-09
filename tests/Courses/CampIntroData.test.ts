import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {readCampIntroData} from '../../src/Courses/CampIntroData';
import {masterLessonList} from '../../src/Courses/CurriculumImport';
import {ROOT} from '../Support/Paths';

/** Every camp's episode-0 job made from the lesson intro template. */
const intros = readdirSync(path.join(ROOT, 'Curriculum', 'Jobs')).flatMap((campId) =>
	readdirSync(path.join(ROOT, 'Curriculum', 'Jobs', campId))
		.filter((name) => /^00-.*-tanitim-youtube\.json$/.test(name))
		.map((name) => ({campId, file: path.join(ROOT, 'Curriculum', 'Jobs', campId, name), job: JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Jobs', campId, name), 'utf8'))}))
		.filter(({job}) => job.template === 'CampLessonIntro'),
);

/** Every line the narrator says in an episode 0. */
const narrations = (content: Record<string, any>): string[] => [
	content.hook.narration,
	content.welcome.narration,
	content.map.narration,
	content.distribution.narration,
	content.lessonFlow.narration,
	...content.moments.map((moment: {narration: string}) => moment.narration),
	content.evidence.narration,
	content.tactics.narration,
	content.app.narration,
	content.closing.narration,
];

describe('camp episode 0 (CampLessonIntro jobs)', () => {
	it('exists for every camp', () => {
		const camps = readdirSync(path.join(ROOT, 'Curriculum', 'Camps')).filter((name) => name.endsWith('.json')).map((name) => name.replace('.json', ''));
		expect(intros.map((intro) => intro.campId).sort()).toEqual(camps.sort());
	});

	it.runIf(existsSync(masterLessonList()))('shows the numbers the data gives: konular, alt konular and ÖSYM questions per topic', () => {
		for (const {campId, job} of intros) {
			const camp = JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Camps', `${campId}.json`), 'utf8'));
			const data = readCampIntroData(camp, ROOT, masterLessonList());
			expect(job.content.map.topics, campId).toEqual(data.topics);
			expect(job.content.map.averageSubtopics, campId).toBe(data.averageSubtopics);
			expect([job.content.distribution.from, job.content.distribution.to], campId).toEqual([data.distribution.from, data.distribution.to]);
			for (const topic of job.content.distribution.topics) {
				expect(topic.questions, `${campId} ${topic.code}`).toBe(data.distribution.topics.find((entry) => entry.code === topic.code)?.questions ?? 0);
			}
		}
	});

	it('speaks numbers as words, names no narrator and says konu, not "mikro ders" (owner, 9 Nov 2026)', () => {
		for (const {campId, job} of intros) {
			for (const line of narrations(job.content)) {
				expect(line, campId).not.toMatch(/\d/);
				expect(line, campId).not.toMatch(/SinoAI|Sino Ey Ay|mikro ders/i);
			}
		}
	});

	it('opens on the lesson, never on a greeting or a self-introduction', () => {
		for (const {campId, job} of intros) expect(job.content.hook.narration, campId).not.toMatch(/^(Merhaba|Selam|Ben )/);
	});
});
