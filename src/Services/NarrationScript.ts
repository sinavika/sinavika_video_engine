/**
 * A narration is spoken as one script, not line by line: the speech model
 * hears every sentence in its context, so tone, energy and intonation carry
 * from one line to the next instead of restarting with each. Very short
 * texts spoken on their own are where synthetic voices are least consistent.
 *
 * The script is the lines joined by paragraph breaks. The service returns
 * when each character is spoken; from that, each line's place in the audio
 * is worked out here, so the picture can still be timed line by line.
 */
const LINE_SEPARATOR = '\n\n';

/** When each character of a spoken text starts and ends, in seconds. */
export type CharacterTiming = {characters: string[]; startSeconds: number[]; endSeconds: number[]};

export type LineSegment = {startSeconds: number; endSeconds: number};

/** Room kept around a line's first and last sound, so breaths and soft consonants are not clipped. */
const EDGE_PADDING_SECONDS = 0.12;

export const joinScript = (lines: readonly string[]): string => lines.join(LINE_SEPARATOR);

/**
 * Splits a script into groups of consecutive lines, each within the model's
 * length limit. Narrations almost always fit in one group; the split only
 * matters for very long videos.
 */
export const groupLines = (lines: readonly string[], maxCharacters: number): number[][] => {
	const groups: number[][] = [];
	let length = 0;
	lines.forEach((line, index) => {
		const added = line.length + (length > 0 ? LINE_SEPARATOR.length : 0);
		if (groups.length === 0 || length + added > maxCharacters) {
			groups.push([index]);
			length = line.length;
		} else {
			groups[groups.length - 1].push(index);
			length += added;
		}
	});
	return groups;
};

/**
 * Where each line sits in the audio of its script. Neighbouring lines share
 * the pause between them: each takes up to the padding, never more than half
 * the pause, so two lines can never overlap.
 */
export const segmentLines = (lines: readonly string[], timing: CharacterTiming): LineSegment[] => {
	const script = joinScript(lines);
	if (timing.characters.length !== script.length) {
		throw new Error(`The speech service timed ${timing.characters.length} characters but the script has ${script.length}; lines cannot be located.`);
	}

	let offset = 0;
	const spans = lines.map((line) => {
		const span = {first: timing.startSeconds[offset], last: timing.endSeconds[offset + line.length - 1]};
		offset += line.length + LINE_SEPARATOR.length;
		return span;
	});

	return spans.map((span, index) => {
		const pauseBefore = index === 0 ? span.first : span.first - spans[index - 1].last;
		const pauseAfter = index === spans.length - 1 ? Infinity : spans[index + 1].first - span.last;
		return {
			startSeconds: Math.max(0, span.first - Math.min(EDGE_PADDING_SECONDS, Math.max(0, pauseBefore) / 2)),
			endSeconds: span.last + Math.min(EDGE_PADDING_SECONDS, Math.max(0, pauseAfter) / 2),
		};
	});
};

/** A spoken word of a line and when it starts, in seconds of the narration file. */
export type TimedWord = {text: string; startSeconds: number};

/**
 * When each word of each line starts in the audio of its script, from the
 * service's character timings. Kept with the narration so a picture can land
 * on the word it shows, as it is said, instead of on a guess from where the
 * word sits in the text (owner, 26 Oct 2026: cards came in while the previous
 * one was still being talked about).
 */
export const lineWords = (lines: readonly string[], timing: CharacterTiming): TimedWord[][] => {
	let offset = 0;
	return lines.map((line) => {
		const words: TimedWord[] = [];
		for (const match of line.matchAll(/\S+/g)) {
			const at = offset + (match.index ?? 0);
			words.push({text: match[0], startSeconds: timing.startSeconds[at]});
		}
		offset += line.length + LINE_SEPARATOR.length;
		return words;
	});
};
