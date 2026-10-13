import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {Narration} from '../../src/Services/ElevenLabsSpeech';

const VOICE = readFileSync(path.resolve(__dirname, 'Voice.mp3'));
const VOICE_SECONDS = 3.6;

/** What a speech service would return for a script: the fixture audio, its characters spread evenly over it. */
export const fakeNarration = (script: string): Narration => {
	const characters = [...script];
	const each = VOICE_SECONDS / characters.length;
	return {
		audio: VOICE,
		timing: {
			characters,
			startSeconds: characters.map((_, index) => index * each),
			endSeconds: characters.map((_, index) => (index + 1) * each),
		},
	};
};
