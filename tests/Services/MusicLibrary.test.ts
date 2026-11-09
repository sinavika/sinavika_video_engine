import {mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {resolveVideoJob} from '../../src/Renderers/VideoJob';
import {beatsFrom, musicPieceFor} from '../../src/Services/MusicLibrary';
import {ROOT} from '../Support/Paths';

const DESCRIPTION = 'Epic modern trailer music with a quiet heartbeat intro, then a driving groove.';
const pieceName = (length: number) => `${createHash('sha256').update(`${DESCRIPTION}|${length}`).digest('hex').slice(0, 20)}.mp3`;

describe('music start offset (soundtrack.from)', () => {
	it('moves the beats to where the video hears them and drops the skipped ones', () => {
		expect(beatsFrom([0.5, 4.2, 4.8, 5.3, 9.1], 4.8)).toEqual([0, 0.5, 4.3]);
		expect(beatsFrom([1, 2], 0)).toEqual([1, 2]);
	});

	it('keeps the piece the video already had instead of making a new one', async () => {
		const publicDirectory = mkdtempSync(path.join(os.tmpdir(), 'music-'));
		mkdirSync(path.join(publicDirectory, 'Music'));
		writeFileSync(path.join(publicDirectory, 'Music', pieceName(25)), 'liked piece');
		const compose = async () => {
			throw new Error('a new piece was made');
		};
		// An 18 s video found the 25 s piece before; starting 4.8 s in must not ask for a 30 s one.
		await expect(musicPieceFor(DESCRIPTION, 18.2, publicDirectory, compose, 4.8)).resolves.toBe(path.join(publicDirectory, 'Music', pieceName(25)));
	});

	it('makes a new piece long enough for the skipped start', async () => {
		const publicDirectory = mkdtempSync(path.join(os.tmpdir(), 'music-'));
		const lengths: number[] = [];
		const compose = async (_description: string, seconds: number) => {
			lengths.push(seconds);
			return Buffer.from('new piece');
		};
		await musicPieceFor(DESCRIPTION, 18.2, publicDirectory, compose, 8);
		expect(lengths).toEqual([30]);
	});

	it('is read from the job, 0 when not given', () => {
		const job = JSON.parse(readFileSync(path.join(ROOT, 'Posts/2026-11-27_TytKampiYoutube/Job.json'), 'utf8'));
		expect(resolveVideoJob(job).soundtrackFrom).toBe(4.8);
		expect(resolveVideoJob({...job, soundtrack: {music: job.soundtrack.music}}).soundtrackFrom).toBe(0);
		expect(resolveVideoJob({...job, soundtrack: true}).soundtrackFrom).toBe(0);
	});
});
