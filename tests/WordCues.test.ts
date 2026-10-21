import {describe, expect, it} from 'vitest';
import {wordCues} from '../src/Templates/Advertisements/PromoKit/PromoKit';
import {VOICE_LEAD_SECONDS} from '../src/Scenes/Voiceover';

describe('wordCues', () => {
	it('lands each word when it is said, in order', () => {
		const cues = wordCues('Sor. Anla. Üret.', ['Sor.', 'Anla.', 'Üret.'], 1.6, [0, 1, 2]);
		expect(cues[0]).toBeCloseTo(VOICE_LEAD_SECONDS - 0.08, 2);
		expect(cues[1]).toBeGreaterThan(cues[0]);
		expect(cues[2]).toBeGreaterThan(cues[1]);
		expect(cues[2]).toBeLessThan(VOICE_LEAD_SECONDS + 1.6);
	});

	it('uses the fallback without narration or for a word that is not said', () => {
		expect(wordCues('Sor.', ['Sor.'], undefined, [0.3])).toEqual([0.3]);
		expect(wordCues('Sor.', ['Sor.', 'Planla.'], 1, [0, 0.9])[1]).toBe(0.9);
	});
});
