import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {markRanges, splitLineEnd, stopOffsets, syllableCount} from './Hece';

// ---------------------------------------------------------------- a poem's lines with their verse marks

type Poem = Extract<CourseVisual, {kind: 'poem'}>;

const SIZE = 40;
const LINE = 66;
const STANZA_GAP = 30;
const LEFT = 40;
const TOP = 56;
const SCHEME = 74;
const COUNT = 96;

// Manrope's advance widths at weight 600, in ems, by kind of letter. A flat width per letter made a line of narrow
// letters (i, l, ı are a quarter em) look a third longer than it is, and the poem was drawn small in its box.
const NARROW = new Set([...'iıìíîjlI.,;:!\'’"|()[] ']);
const SEMI = new Set([...'frtJ-']);
const WIDE = new Set([...'mwMW']);
const emWidth = (text: string) => [...text].reduce((sum, letter) => sum + (NARROW.has(letter) ? 0.27 : SEMI.has(letter) ? 0.38 : WIDE.has(letter) ? 0.85 : letter !== letter.toLocaleLowerCase('tr') ? 0.66 : 0.55), 0);
/** A line's drawn width: its letters, 6% for the bold rhyme and marks, and each caesura slash. */
const lineWidth = (text: string, stops: number) => (emWidth(text) * 1.06 + stops * 0.6) * SIZE;

/** Where each line sits and how wide the stage is: the text column, then the rhyme letters, then the syllable counts. */
export const poemLayout = (visual: Poem) => {
	const widest = Math.max(...visual.lines.map((line) => lineWidth(line.text, visual.stops.length)), visual.poet ? emWidth(visual.poet) * 1.06 * 28 : 0);
	const textRight = LEFT + widest + 40;
	const schemeX = textRight + SCHEME / 2;
	const hasScheme = visual.lines.some((line) => line.scheme);
	const countX = textRight + (hasScheme ? SCHEME : 0) + COUNT / 2;
	const ys: number[] = [];
	let y = TOP;
	visual.lines.forEach((_, index) => {
		ys.push(y);
		y += LINE + (visual.stanzas.includes(index + 1) ? STANZA_GAP : 0);
	});
	const bottom = y - LINE + 30 + (visual.poet ? 64 : 0);
	return {ys, schemeX, countX, hasScheme, width: textRight + (hasScheme ? SCHEME : 0) + (visual.syllables ? COUNT : 0) + 20, height: bottom + 20};
};

/**
 * A poem as a lesson shows it: the lines one by one, the rhyme of each line in the lesson colour and its redif after it
 * in a second tone, the caesura (durak) as a slash after the given syllables, the rhyme letters (a, b, a, b) and the
 * syllable count of each line on the right, the marked words bold in the lesson colour. A beat lights a line (l1…) or
 * one kind of mark: kafiye, redif, durak, hece, şema (the letters), işaret (the marked words). The poet's name, when
 * given, stands under the lines.
 */
export const PoemVisual: React.FC<VisualBoxProps & {visual: Poem}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const layout = poemLayout(visual);
	const marksAt = delaySeconds + visual.lines.length * 0.35 + 0.3;
	const kafiye = usePartLook('kafiye', easeFrom(seconds, marksAt, 0.5));
	const redif = usePartLook('redif', easeFrom(seconds, marksAt + 0.2, 0.5));
	const durak = usePartLook('durak', easeFrom(seconds, marksAt + 0.4, 0.5));
	const hece = usePartLook('hece', easeFrom(seconds, marksAt + 0.6, 0.5));
	const sema = usePartLook('sema', easeFrom(seconds, marksAt + 0.8, 0.5));
	const isaret = usePartLook('isaret', easeFrom(seconds, marksAt, 0.5));
	const marks = {kafiye, redif, durak, isaret};
	return (
		<World width={width} height={height} viewWidth={layout.width} viewHeight={layout.height}>
			{visual.lines.map((line, index) => (
				<PoemLine key={index} index={index} line={line} stops={visual.stops} y={layout.ys[index]} marks={marks} entrance={easeFrom(seconds, delaySeconds + index * 0.35, 0.45)} />
			))}
			{layout.hasScheme
				? visual.lines.map((line, index) =>
						line.scheme ? (
							<g key={`s${index}`} opacity={sema.opacity}>
								<circle cx={layout.schemeX} cy={layout.ys[index] - SIZE * 0.34} r={24} fill={sema.focused > 0.5 ? palette.lesson : withAlpha(palette.lesson, 0.14)} stroke={palette.lesson} strokeWidth={2} />
								<text x={layout.schemeX} y={layout.ys[index] - SIZE * 0.34 + 10} textAnchor="middle" fontSize={30} fontWeight={800} fill={sema.focused > 0.5 ? palette.onLesson : palette.lesson} fontFamily={palette.fontBody}>
									{line.scheme}
								</text>
							</g>
						) : null,
					)
				: null}
			{visual.syllables
				? visual.lines.map((line, index) => (
						<text key={`h${index}`} x={layout.countX} y={layout.ys[index]} textAnchor="middle" fontSize={32} fontWeight={800} fill={hece.focused > 0.5 ? palette.lesson : palette.muted} fontFamily={palette.fontBody} opacity={hece.opacity}>
							{syllableCount(line.text)}
						</text>
					))
				: null}
			{visual.poet ? (
				<text x={LEFT} y={layout.ys[layout.ys.length - 1] + 70} fontSize={28} fontWeight={700} fontStyle="italic" fill={palette.muted} fontFamily={palette.fontBody} opacity={easeFrom(seconds, marksAt, 0.5)}>
					{visual.poet}
				</text>
			) : null}
		</World>
	);
};

type Look = ReturnType<typeof usePartLook>;

const PoemLine: React.FC<{index: number; line: Poem['lines'][number]; stops: number[]; y: number; marks: {kafiye: Look; redif: Look; durak: Look; isaret: Look}; entrance: number}> = ({index, line, stops, y, marks, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`l${index + 1}`, entrance);
	const end = splitLineEnd(line.text, line.rhyme, line.redif) ?? {before: line.text, rhyme: '', redif: '', after: ''};
	// The caesura slashes and the marked words go into the part before the rhyme (a stop never falls inside the line's
	// last word): the text is cut at every stop and at both ends of every mark.
	const offsets = stopOffsets(line.text, stops).filter((offset) => offset > 0 && offset < end.before.length);
	const ranges = markRanges(end.before, line.marks) ?? [];
	const cuts = [...new Set([0, ...offsets, ...ranges.flat(), end.before.length])].sort((a, b) => a - b);
	const markLit = marks.isaret.focused > 0.5;
	const pieces: React.ReactNode[] = [];
	cuts.slice(0, -1).forEach((start, k) => {
		const text = end.before.slice(start, cuts[k + 1]);
		const marked = ranges.some(([from, to]) => start >= from && start < to);
		pieces.push(
			marked ? (
				<tspan key={`m${k}`} fill={withAlpha(palette.lesson, 0.35 + 0.65 * marks.isaret.opacity)} fontWeight={800} textDecoration={markLit ? 'underline' : undefined}>
					{text}
				</tspan>
			) : (
				<tspan key={`b${k}`}>{text}</tspan>
			),
		);
		if (offsets.includes(cuts[k + 1]))
			pieces.push(
				<tspan key={`d${k}`} fill={marks.durak.focused > 0.5 ? palette.lesson : palette.muted} fontWeight={800} opacity={marks.durak.opacity}>
					{' /'}
				</tspan>,
			);
	});
	const rhymeLit = marks.kafiye.focused > 0.5;
	const redifLit = marks.redif.focused > 0.5;
	return (
		<text x={LEFT} y={y} fontSize={SIZE} fontWeight={look.focused > 0.5 ? 800 : 600} fill={palette.ink} fontFamily={palette.fontBody} opacity={look.opacity}>
			{pieces}
			{end.rhyme ? (
				<tspan fill={withAlpha(palette.lesson, 0.35 + 0.65 * marks.kafiye.opacity)} fontWeight={800} textDecoration={rhymeLit ? 'underline' : undefined}>
					{end.rhyme}
				</tspan>
			) : null}
			{end.redif ? (
				<tspan fill={withAlpha(palette.lessonDeep, 0.35 + 0.65 * marks.redif.opacity)} fontWeight={800} fontStyle="italic" textDecoration={redifLit ? 'underline' : undefined}>
					{end.redif}
				</tspan>
			) : null}
			{end.after ? <tspan>{end.after}</tspan> : null}
		</text>
	);
};
