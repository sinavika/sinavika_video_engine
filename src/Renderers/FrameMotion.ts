import {readFileSync} from 'node:fs';
import {PNG} from 'pngjs';

/**
 * Finds the stretches of a video where the picture stands still while the lesson goes on: a student watches a frozen
 * card while the voice talks. The owner's measure for a lesson (29 Oct 2026) is whether it is worth following; a
 * long frozen screen is where viewers leave. Frames are sampled every few seconds (`npm run sweep -- --motion`) and
 * compared here.
 */

/** A pixel changed when one of its channels moved by more than this (0–255); below it is compression-like noise. */
const PIXEL_STEP = 12;

/** The share of pixels (0–1) that differ between two PNG files of the same size. */
export const changedShare = (fileA: string, fileB: string): number => {
	const [a, b] = [PNG.sync.read(readFileSync(fileA)), PNG.sync.read(readFileSync(fileB))];
	if (a.width !== b.width || a.height !== b.height) return 1;
	let changed = 0;
	for (let index = 0; index < a.data.length; index += 4) {
		if (Math.abs(a.data[index] - b.data[index]) > PIXEL_STEP || Math.abs(a.data[index + 1] - b.data[index + 1]) > PIXEL_STEP || Math.abs(a.data[index + 2] - b.data[index + 2]) > PIXEL_STEP) changed++;
	}
	return changed / (a.width * a.height);
};

export type MotionSample = {seconds: number; sceneId: string; label: string};
type StillStretch = {sceneId: string; label: string; fromSeconds: number; toSeconds: number};

/** Below this share of changed pixels a step counts as still (a progress bar creeping on is about 0.1 %). */
const STILL_SHARE = 0.005;
/** A stillness this long is worth a look. */
const STILL_SECONDS = 8;

/**
 * The still stretches of a run of samples: `changes[i]` is the changed share between sample i and i + 1. A stretch
 * stays within one scene (a cut to the next card is motion) and is reported when it lasts `minSeconds` or more.
 */
export const stillStretches = (samples: readonly MotionSample[], changes: readonly number[], minSeconds = STILL_SECONDS, stillShare = STILL_SHARE): StillStretch[] => {
	const stretches: StillStretch[] = [];
	let start = -1;
	const close = (end: number) => {
		if (start >= 0 && samples[end].seconds - samples[start].seconds >= minSeconds) {
			stretches.push({sceneId: samples[start].sceneId, label: samples[start].label, fromSeconds: samples[start].seconds, toSeconds: samples[end].seconds});
		}
		start = -1;
	};
	for (let index = 0; index < changes.length; index++) {
		const still = changes[index] < stillShare && samples[index].sceneId === samples[index + 1].sceneId;
		if (still && start < 0) start = index;
		if (!still && start >= 0) close(index);
	}
	if (start >= 0) close(samples.length - 1);
	return stretches;
};

export const clock = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
