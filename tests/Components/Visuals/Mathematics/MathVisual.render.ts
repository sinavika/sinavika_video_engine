import {mkdtempSync, readFileSync, statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';
import {bundleProject, renderFrame, sceneFrames} from '../../../../src/Renderers/VideoRenderer';
import {ROOT} from '../../../Support/Paths';

/**
 * The mathematics cards drawn for real (9 Nov 2026): worked example steps, the bar model beside its steps, the sign
 * table, long division, the prime ladder, counting slots, the area model, the sample space, the mapping, and two
 * questions whose steps point at their figure (a plot region, a table cell). Every card's frame, settled and while it
 * comes in, must render without a layout warning in the camp lesson (16:9 studio) and in the vertical lesson.
 */
const lesson = JSON.parse(readFileSync(path.join(ROOT, 'tests', 'Fixtures', 'MathCardLesson.json'), 'utf8'));
const outputDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-math-cards-'));

beforeAll(async () => {
	await bundleProject();
});

describe.each([
	['CampLesson', 'Horizontal'],
	['CourseLesson', 'Vertical'],
])('%s %s', (template, format) => {
	it('draws every mathematics card without a layout warning', async () => {
		const job = {template, format, quality: '720p', voiceover: false, content: lesson};
		const cards = sceneFrames(job).filter((scene) => /^s\d+-c\d+$/.test(scene.sceneId));
		expect(cards.length).toBe(11);
		for (const scene of cards) {
			for (const [moment, frame] of [
				['settled', scene.frame],
				['entering', scene.enteringFrame],
			] as const) {
				const result = await renderFrame(job, {outputPath: path.join(outputDirectory, `${template}-${format}-${scene.sceneId}-${moment}.png`), frame});
				expect(statSync(result.outputPath).size, `${scene.sceneId} is not blank`).toBeGreaterThan(8_000);
				// The fixture is a short lesson on purpose; its length is not what this test checks.
				const layout = result.warnings.filter((warning) => !/it is meant to be \d+-\d+s/.test(warning));
				expect(layout, `${scene.sceneId} ${moment}`).toEqual([]);
			}
		}
	});
});
