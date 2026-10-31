import {existsSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {SOUND_EFFECTS} from '../../src/Configurations/SoundEffects';
import {ROOT} from '../Support/Paths';

const PUBLIC = path.resolve(ROOT, 'public');

describe('sound effects', () => {
	it('has every effect generated and kept under public/', () => {
		for (const [id, effect] of Object.entries(SOUND_EFFECTS)) expect(existsSync(path.join(PUBLIC, effect.file)), `${id}: ${effect.file} (npm run sound-effects)`).toBe(true);
	});

	it('asks ElevenLabs only for lengths it accepts (0.5–30 s)', () => {
		for (const [id, effect] of Object.entries(SOUND_EFFECTS)) {
			expect(effect.seconds, id).toBeGreaterThanOrEqual(0.5);
			expect(effect.seconds, id).toBeLessThanOrEqual(30);
		}
	});

	it('keeps every effect under the narration (peak below -4 dBFS)', () => {
		for (const [id, effect] of Object.entries(SOUND_EFFECTS)) expect(effect.peakDb, id).toBeLessThan(-4);
	});

	it('names each file by where it is used and what it is', () => {
		for (const [id, effect] of Object.entries(SOUND_EFFECTS)) expect(effect.file, id).toMatch(/^SoundEffects\/(camp-reels|promo)-[a-z]+(-[a-z]+)*\.wav$/);
	});
});
