import {CUE_LEAD_SECONDS, findTokens, spokenTokens, spokenWords, VOICE_LEAD_SECONDS, type VoiceClip} from '../Scenes/Voiceover';
import {parseRichText} from '../Schemas/RichText';
import type {LessonCard, Question} from './LessonScript';

/**
 * When the parts of a card arrive on screen: with the words that name them,
 * never all at once at the start of a card whose narration runs for half a
 * minute (owner, 26 Oct 2026: "söylemler olurken bir sonraki kart çıkıyor";
 * 27 Oct 2026: "animasyonlarımız çok iyi olmalı"). A rule's items come in as
 * each is said, a mistake's correction when the narrator turns to it, and a
 * bold word gets its marker stroke as it is spoken.
 *
 * Times are seconds into the card's scene. The words' own timings come from
 * the narration (ElevenLabs character timings); a narration without them is
 * spread evenly over its length.
 */

/** A spoken line of a scene: its clip, its text, the second of the scene its slot starts at, and how long the slot is. */
type SpokenLine = {clip?: VoiceClip; text: string; startSeconds: number; seconds: number};

/** Seconds into the scene, per part; undefined when the part is not said and has no place of its own. */
export type Cues = readonly (number | undefined)[];

/** The plain words of rich text: emphasis marks dropped, formulas left out. */
const plainWords = (text: string): string =>
	parseRichText(text)
		.filter((segment) => segment.kind === 'text' || segment.kind === 'strong')
		.map((segment) => segment.value)
		.join(' ');

/** Longest first: four words of a phrase find its place more surely than two; one word only for a one-word phrase. */
const PREFIX_LENGTHS = [4, 3, 2];

/**
 * When each phrase is heard in a line, searching in order (a phrase is looked
 * for after the previous one). The phrase is matched by its first words, as
 * narration often goes on differently from the screen text. With `anywhere`, a
 * phrase not found after the previous one is looked for from the line's start.
 */
export const cuesInLine = (line: SpokenLine, phrases: readonly string[], {anywhere = false} = {}): Cues => {
	const spoken = spokenWords(line.clip, line.text, line.seconds);
	if (!spoken) return phrases.map(() => undefined);
	let from = 0;
	return phrases.map((phrase) => {
		const tokens = spokenTokens(plainWords(phrase));
		const lengths = tokens.length === 1 ? [1] : PREFIX_LENGTHS.filter((length) => length <= tokens.length);
		for (const length of lengths) {
			const wanted = tokens.slice(0, length);
			let at = findTokens(spoken.tokens, wanted, from);
			if (at < 0 && anywhere) at = findTokens(spoken.tokens, wanted, 0);
			if (at >= 0) {
				from = at + wanted.length;
				return line.startSeconds + Math.max(0, VOICE_LEAD_SECONDS + spoken.seconds[at] - CUE_LEAD_SECONDS);
			}
		}
		return undefined;
	});
};

/** The smallest gap between two parts arriving one after another. */
const MIN_GAP_SECONDS = 0.35;

/**
 * A time for every part: the ones found keep theirs, the others are placed
 * evenly between their found neighbours (or the line's ends), and no part
 * arrives before the one above it.
 */
export const spreadCues = (cues: Cues, startSeconds: number, endSeconds: number): number[] => {
	const known = (index: number) => (index < 0 ? startSeconds : index >= cues.length ? endSeconds : cues[index]);
	const placed = cues.map((cue, index) => {
		if (cue !== undefined) return cue;
		let before = index - 1;
		while (before >= 0 && cues[before] === undefined) before--;
		let after = index + 1;
		while (after < cues.length && cues[after] === undefined) after++;
		const from = known(before) ?? startSeconds;
		const to = known(after) ?? endSeconds;
		return from + ((to - from) * (index - before)) / (after - before);
	});
	for (let index = 1; index < placed.length; index++) placed[index] = Math.max(placed[index], placed[index - 1] + MIN_GAP_SECONDS);
	return placed;
};

/** The emphasised (**bold**) phrases of rich text, in order. */
const strongPhrases = (text: string): string[] => parseRichText(text).filter((segment) => segment.kind === 'strong').map((segment) => segment.value);

/**
 * When each bold phrase of each text is said: the marker stroke under it is
 * drawn then. Texts are taken in reading order; a bold phrase the narration
 * does not say gets no stroke and stays plain bold.
 */
export const markCues = (line: SpokenLine, texts: readonly string[]): Cues[] => {
	const phrases = texts.map(strongPhrases);
	const cues = cuesInLine(line, phrases.flat(), {anywhere: true});
	let offset = 0;
	return phrases.map((list) => {
		const own = cues.slice(offset, offset + list.length);
		offset += list.length;
		return own;
	});
};

/** Marks that would be drawn before their text is on screen are dropped: the word was said elsewhere, not here. */
export const marksAfter = (marks: Cues, shownAt: number): Cues => marks.map((cue) => (cue !== undefined && cue >= shownAt - 0.2 ? cue : undefined));

/** When the parts of a text card arrive and its bold words are marked. Absent parts fall back to the card's own timing. */
export type CardCues = {
	/** Bold phrases of the card's text (concept), caption (visual) or example. */
	marks?: Cues;
	/** A rule's items, one time each, and their bold phrases. */
	items?: number[];
	itemMarks?: Cues[];
	/** A mistake: the correction, and why. */
	right?: number;
	why?: number;
	rightMarks?: Cues;
	whyMarks?: Cues;
	/** An example's explanation. */
	explanation?: number;
	explanationMarks?: Cues;
};

/** Words with which a narrator turns from a wrong belief to the right one. */
const TURN_WORDS = new Set(['ama', 'oysa', 'ancak', 'fakat', 'aslında', 'halbuki', 'doğrusu']);

/** When the narrator first turns ("Ama…", "Oysa…") after the line's opening words; a whole word, never "amaç". */
const turnCue = (line: SpokenLine): number | undefined => {
	const spoken = spokenWords(line.clip, line.text, line.seconds);
	if (!spoken) return undefined;
	const at = spoken.tokens.findIndex((token, index) => index >= 4 && TURN_WORDS.has(token));
	return at < 0 ? undefined : line.startSeconds + Math.max(0, VOICE_LEAD_SECONDS + spoken.seconds[at] - CUE_LEAD_SECONDS);
};

/** The card's own line is the first of its scene; the lead-in before it is the voice's. */
export const cardCues = (card: LessonCard, line: SpokenLine): CardCues => {
	const start = line.startSeconds + VOICE_LEAD_SECONDS;
	const end = line.startSeconds + line.seconds - 0.4;
	switch (card.kind) {
		case 'concept':
			return {marks: markCues(line, [card.text])[0]};
		case 'visual':
			return card.caption ? {marks: markCues(line, [card.caption])[0]} : {};
		case 'rule': {
			// The first item comes with the narration's first words about it, or right away.
			const items = spreadCues(cuesInLine(line, card.items), start, end);
			return {items, itemMarks: markCues(line, card.items).map((marks, index) => marksAfter(marks, items[index]))};
		}
		case 'example': {
			const [explanation] = card.explanation ? cuesInLine(line, [card.explanation], {anywhere: true}) : [undefined];
			const marks = markCues(line, [card.example, card.explanation ?? '']);
			return {marks: marks[0], explanation, explanationMarks: explanation === undefined ? marks[1] : marksAfter(marks[1], explanation)};
		}
		case 'mistake': {
			// The correction comes with its own words; when the narration says it differently, with the narrator's
			// turn ("Ama dur bir saniye", "Oysa…"), or else halfway through. The reason follows it.
			const [said, saidWhy] = cuesInLine(line, [card.right, card.why ?? '']);
			const right = said ?? turnCue(line) ?? start + (end - start) * 0.45;
			const why = card.why ? (saidWhy !== undefined && saidWhy > right ? saidWhy : Math.max(right + 1.5, start + (end - start) * 0.75)) : undefined;
			const marks = markCues(line, [card.right, card.why ?? '']);
			return {right, why, rightMarks: marksAfter(marks[0], right), whyMarks: why === undefined ? [] : marksAfter(marks[1], why)};
		}
		default:
			return {};
	}
};

const NUMBER_WORDS = ['bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir', 'on iki'];

/** What a solution step points at, and when: marked words, lit sentences, options struck out. */
export type StepCues = {marks: {phrase: string; at: number}[]; sentences: {sentence: number; at: number}[]; eliminate: {option: number; at: number}[]};

/**
 * A step's pointers land with the words that name them: a marked phrase when
 * it is said, "üç numaralı cümle" when the sentence is named, an option when
 * its letter is said ("A bu yüzden ile başlıyor"). What the narration does not
 * name comes just after the step starts.
 */
export const stepCues = (step: Question['steps'][number], line: SpokenLine): StepCues => {
	const fallback = line.startSeconds + VOICE_LEAD_SECONDS + 0.2;
	const spoken = spokenWords(line.clip, line.text, line.seconds);
	const markAt = cuesInLine(line, step.mark, {anywhere: true});
	const sentenceAt = cuesInLine(line, step.sentences.map((number) => `${NUMBER_WORDS[number - 1] ?? number} numara`), {anywhere: true});
	// A letter is matched as a word of its own: "A" is said "A", never as the start of "ama".
	const letterAt = (letter: string) => {
		const index = spoken?.tokens.indexOf(letter.toLocaleLowerCase('tr')) ?? -1;
		return spoken && index >= 0 ? line.startSeconds + Math.max(0, VOICE_LEAD_SECONDS + spoken.seconds[index] - CUE_LEAD_SECONDS) : undefined;
	};
	return {
		marks: step.mark.map((phrase, index) => ({phrase, at: markAt[index] ?? fallback})),
		sentences: step.sentences.map((sentence, index) => ({sentence, at: sentenceAt[index] ?? fallback})),
		eliminate: step.eliminate.map((letter) => ({option: 'ABCDE'.indexOf(letter), at: letterAt(letter) ?? fallback})),
	};
};

/** Sentences of a passage, as they are shown and read: a numbered part ("(II) …") or a sentence ends at its full stop. */
export const passageSentences = (context: string): string[] =>
	context
		.split(/\s*\n\s*|(?<=[.!?…])\s+(?=\S)|\s+(?=\(\s*(?:I{1,3}|IV|V)\s*\))/)
		.map((sentence) => sentence.trim())
		.filter(Boolean);

/**
 * For each sentence of a passage, whether a line break follows it in the script: a list of days, steps or lines of
 * a dialogue keeps its lines on screen instead of running into one paragraph.
 */
export const passageLineBreaks = (context: string, sentences: readonly string[] = passageSentences(context)): boolean[] => {
	let cursor = 0;
	return sentences.map((sentence, index) => {
		const end = context.indexOf(sentence, cursor) + sentence.length;
		const next = index + 1 < sentences.length ? context.indexOf(sentences[index + 1], end) : -1;
		cursor = end;
		return next > end && context.slice(end, next).includes('\n');
	});
};

/** Where a question's parts are heard while it is read: each sentence of the passage, the stem, each option. */
export type ReadingCues = {start: number; end: number; sentences: Cues; stem?: number; options: Cues};

export const readingCues = (question: Question, line: SpokenLine): ReadingCues => {
	const sentences = question.context ? passageSentences(question.context) : [];
	// "(II)" is said "iki numara": the sentence is found by its words after the mark.
	const sentenceWords = sentences.map((sentence) => sentence.replace(/^\(\s*(?:I{1,3}|IV|V)\s*\)\s*/, ''));
	const cues = cuesInLine(line, [...sentenceWords, question.stem, ...question.options]);
	const start = line.startSeconds + VOICE_LEAD_SECONDS;
	const sentenceCues = sentences.length ? spreadCues(cues.slice(0, sentences.length), start, cues[sentences.length] ?? line.startSeconds + line.seconds * 0.7) : [];
	return {
		start,
		end: line.startSeconds + line.seconds,
		sentences: sentenceCues,
		stem: cues[sentences.length],
		options: cues.slice(sentences.length + 1),
	};
};
