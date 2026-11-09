import {readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {CAMP_SCRIPT_SAMPLE} from '../../src/Courses/LessonScriptSample';
import {readVideoJob} from '../../src/Renderers/VideoJobFile';
import {stillScreenGate} from '../../src/Renderers/StillScreenGate';
import {ROOT} from '../Support/Paths';

/** A camp lesson is not rendered before its still screens are fixed (owner, 9 Nov 2026). */
describe('still screen gate', () => {
	it('lets other templates through', () => {
		expect(stillScreenGate({template: 'QuestionSolution', content: {}})).toEqual([]);
	});

	it('stops a lesson whose script keeps a screen unchanged too long', () => {
		const long = Array.from({length: 60}, () => 'kelime').join(' ');
		const content = {
			...CAMP_SCRIPT_SAMPLE,
			lesson: {...CAMP_SCRIPT_SAMPLE.lesson, sections: CAMP_SCRIPT_SAMPLE.lesson.sections.map((section, index) => (index === 0 ? {...section, cards: [{kind: 'concept', title: 'Uzun kart', text: 'Düz bir metin.', narration: `${long}.`}, ...section.cards.slice(1)]} : section))},
		};
		const issues = stillScreenGate({template: 'CampLesson', content});
		expect(issues[0]).toMatch(/--allow-still-screens/);
		expect(issues.some((issue) => issue.startsWith('s1-c1'))).toBe(true);
	});

	// The TYT Matematik camp was fixed by hand on 9 Nov 2026: it stays renderable.
	it('lets every TYT Matematik camp lesson through', () => {
		const folder = path.join(ROOT, 'Curriculum/Jobs/yks-tyt-matematik-kampi');
		const jobs = readdirSync(folder).filter((file) => file.endsWith('-youtube.json') && !file.startsWith('00-'));
		expect(jobs.length).toBeGreaterThan(20);
		for (const file of jobs) expect(stillScreenGate(readVideoJob(path.join(folder, file)) as {template?: unknown; content?: unknown}), file).toEqual([]);
	});
});
