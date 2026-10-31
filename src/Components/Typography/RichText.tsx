import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {parseRichText} from '../../Schemas/RichText';
import {withAlpha} from '../../Themes/Theme';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import {MathExpression} from './MathExpression';
import {Text, type TextProps} from './Text';

/** A phrase of the text to be marked, and when (seconds into the scene) its stroke is drawn. */
type TextMark = {phrase: string; at: number};

type RichTextProps = Omit<TextProps, 'children'> & {
	text: string;
	/** When each **bold** phrase is spoken, in order: a marker stroke is drawn under it then. Without it bold is plain bold. */
	markCues?: readonly (number | undefined)[];
	/** Phrases of the text (any part of it) to mark, each at its own time. */
	marks?: readonly TextMark[];
};

/** How long a marker stroke takes to draw, left to right. */
const STROKE_SECONDS = 0.5;

/**
 * The highlighter stroke under marked words: drawn left to right in the lesson
 * colour as the words are said, then kept. It sits low behind the letters, as
 * a pen stroke does, so the words stay as readable as before.
 */
const Marker: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const drawn = interpolate(frame / fps, [at, at + STROKE_SECONDS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});
	const colour = withAlpha(colors.lesson?.fill ?? colors.accent, 0.3);
	return (
		<span
			style={{
				backgroundImage: `linear-gradient(${colour}, ${colour})`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: '0 88%',
				backgroundSize: `${(drawn * 100).toFixed(2)}% 0.45em`,
				boxDecorationBreak: 'clone',
				WebkitBoxDecorationBreak: 'clone',
			}}
		>
			{children}
		</span>
	);
};

/** A text cut where marked phrases start and end (first occurrence of each, Turkish case ignored). */
const splitByMarks = (value: string, marks: readonly TextMark[]): {text: string; at?: number}[] => {
	const lower = value.toLocaleLowerCase('tr');
	const spans = marks
		.map((mark) => ({start: lower.indexOf(mark.phrase.toLocaleLowerCase('tr')), length: mark.phrase.length, at: mark.at}))
		.filter((span) => span.start >= 0)
		.sort((a, b) => a.start - b.start);
	const pieces: {text: string; at?: number}[] = [];
	let cursor = 0;
	for (const span of spans) {
		if (span.start < cursor) continue;
		if (span.start > cursor) pieces.push({text: value.slice(cursor, span.start)});
		pieces.push({text: value.slice(span.start, span.start + span.length), at: span.at});
		cursor = span.start + span.length;
	}
	if (cursor < value.length) pieces.push({text: value.slice(cursor)});
	return pieces;
};

const WithMarks: React.FC<{value: string; marks?: readonly TextMark[]}> = ({value, marks}) => {
	if (!marks?.length) return <>{value}</>;
	return (
		<>
			{splitByMarks(value, marks).map((piece, index) => (piece.at === undefined ? <React.Fragment key={index}>{piece.text}</React.Fragment> : <Marker key={index} at={piece.at}>{piece.text}</Marker>))}
		</>
	);
};

/** Text with inline `$math$`, `$$display math$$` and `**emphasis**`. See Schemas/RichText.ts. */
export const RichText: React.FC<RichTextProps> = ({text, markCues, marks, ...textProps}) => (
	<Text {...textProps}>
		<RichInline text={text} markCues={markCues} marks={marks} />
	</Text>
);

/** The same rich text without its own block, for a span inside a larger text (a sentence of a passage). */
export const RichInline: React.FC<Pick<RichTextProps, 'text' | 'markCues' | 'marks'>> = ({text, markCues, marks}) => {
	const {typography} = useTheme();
	const ink = useInk();
	const segments = useMemo(() => parseRichText(text), [text]);
	let strongIndex = -1;

	return (
		<>
			{segments.map((segment, index) => {
				switch (segment.kind) {
					case 'text':
						return <WithMarks key={index} value={segment.value} marks={marks} />;
					case 'strong': {
						strongIndex += 1;
						const at = markCues?.[strongIndex];
						const strong = (
							<strong style={{fontWeight: typography.strongWeight, color: ink.emphasis}}>
								<WithMarks value={segment.value} marks={marks} />
							</strong>
						);
						return at === undefined ? <React.Fragment key={index}>{strong}</React.Fragment> : <Marker key={index} at={at}>{strong}</Marker>;
					}
					case 'math':
						return <MathExpression key={index} latex={segment.value} />;
					case 'displayMath':
						return <MathExpression key={index} latex={segment.value} display />;
				}
			})}
		</>
	);
};
