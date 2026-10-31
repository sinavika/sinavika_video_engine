import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {ROOT} from '../Support/Paths';

const JOBS = join(ROOT, 'Curriculum', 'Jobs');

// The YouTube notes beside each course job: the hashtag line is a line made only of hashtags.
const notes = readdirSync(JOBS, {withFileTypes: true})
	.filter((entry) => entry.isDirectory())
	.flatMap((camp) => readdirSync(join(JOBS, camp.name)).filter((file) => file.endsWith('.md')).map((file) => join(camp.name, file)));

describe('course job notes', () => {
	it('writes hashtags of letters and digits only (a platform cuts a hashtag at punctuation)', () => {
		const broken = notes.flatMap((note) =>
			readFileSync(join(JOBS, note), 'utf8')
				.split('\n')
				.filter((line) => /^#[^\s#]/.test(line))
				.flatMap((line) => line.split(/\s+/).filter((tag) => tag && !/^#[\p{L}\p{N}]+$/u.test(tag)))
				.map((tag) => `${note}: ${tag}`),
		);
		expect(notes.length).toBeGreaterThan(0);
		expect(broken).toEqual([]);
	});
});
