import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {VideoJobValidationError, resolveVideoJob} from '../../src/Renderers/VideoJob';
import {readVideoJob} from '../../src/Renderers/VideoJobFile';
import {ROOT} from '../Support/Paths';

const SCRIPT = 'Curriculum/Scripts/YKS_TYT/TRK/SOZCUKTE_ANLAM.json';
const directory = mkdtempSync(path.join(tmpdir(), 'video-job-'));
const jobFile = (name: string, job: unknown) => {
	const file = path.join(directory, name);
	writeFileSync(file, JSON.stringify(job));
	return file;
};
const issues = (run: () => unknown) => {
	try {
		run();
	} catch (error) {
		return error instanceof VideoJobValidationError ? error.issues.join(' ') : String(error);
	}
	return '';
};

describe('video job files', () => {
	it('loads the script a camp job names into its content, so it resolves like any job', () => {
		const job = readVideoJob(jobFile('camp.json', {template: 'CampLesson', format: 'Horizontal', voiceover: true, script: SCRIPT})) as {content: unknown};
		expect(job.content).toEqual(JSON.parse(readFileSync(path.join(ROOT, SCRIPT), 'utf8')));
		expect(resolveVideoJob(job).compositionId).toMatch(/^CampLesson/);
	});

	it('passes a job that carries its own content through unchanged', () => {
		const job = {template: 'QuickRevision', content: {any: 'thing'}};
		expect(readVideoJob(jobFile('inline.json', job))).toEqual(job);
	});

	it('refuses a missing script, a script and a content together, and a raw job with a script', () => {
		expect(issues(() => readVideoJob(jobFile('missing.json', {template: 'CampLesson', script: 'Curriculum/Scripts/NOPE.json'})))).toMatch(/does not exist/);
		expect(issues(() => readVideoJob(jobFile('both.json', {template: 'CampLesson', script: SCRIPT, content: {}})))).toMatch(/not both/);
		expect(issues(() => resolveVideoJob({template: 'CampLesson', script: SCRIPT}))).toMatch(/readVideoJob/);
	});
});
