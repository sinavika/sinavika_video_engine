import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichText} from '../../Typography/RichText';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type FlipCards = Extract<CourseVisual, {kind: 'flipcards'}>;

const SLOTS = 6;
const plain = (text: string) => text.replace(/\*\*/g, '');
const FLIP_SECONDS = 0.7;

/**
 * Cards that turn over: each shows a term on its face (in the lesson colour) and turns to show what is behind it, an
 * example or an explanation, when the narration reaches it (parts p1…). Turned cards stay turned; without beats they
 * turn one after another. A test-yourself moment: the student sees the term before its answer.
 */
export const FlipCardVisual: React.FC<VisualBoxProps & {visual: FlipCards}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const count = visual.cards.length;
	const looks = Array.from({length: SLOTS}, (_, index) => useElementState(index < count ? `p${index + 1}` : undefined));
	const starts = Array.from({length: SLOTS}, (_, index) => useBeatStartFor(`p${index + 1}`, 'focus'));
	const reveals = Array.from({length: SLOTS}, (_, index) => useReveal(delaySeconds + index * 0.15, 0.4));
	const reveal = (index: number) => reveals[index];

	const columns = count <= 3 ? count : count === 4 ? 2 : 3;
	const rows = Math.ceil(count / columns);
	const gap = u(24);
	// A focused card grows by 4 %: the grid keeps that much room at its edges so the card is never cut.
	const inset = width * 0.025;
	const cardWidth = (width - 2 * inset - gap * (columns - 1)) / columns;
	const cardHeight = Math.min((height * 0.95 - gap * (rows - 1)) / rows, cardWidth * 0.8);
	const top = (height - (cardHeight * rows + gap * (rows - 1))) / 2;
	const frontSize = Math.max(26, Math.min(44, (cardHeight * 0.2) / u(1)));
	const padding = u(22);
	const headingSize = Math.max(18, Math.min(26, (cardHeight * 0.1) / u(1)));
	/**
	 * The back's type grows to fill its card: a short answer ("Son rakam 0") is set large, a long one small. A glyph
	 * takes about 0.55 × 1.3 of its size squared; 0.8 leaves room for the line breaks.
	 */
	const backSizeOf = (text: string) => {
		const area = (cardWidth - 2 * padding) * (cardHeight - 2 * padding - u(headingSize * 1.6));
		const fitted = (0.8 * Math.sqrt(area / (Math.max(8, plain(text).length) * 0.72))) / u(1);
		return Math.max(20, Math.min(40, fitted));
	};

	return (
		<div style={{position: 'relative', width, height}}>
			{visual.cards.map((card, index) => {
				const column = index % columns;
				const row = Math.floor(index / columns);
				// A last row with fewer cards is centred.
				const inRow = row === rows - 1 ? count - row * columns : columns;
				const offset = ((columns - inRow) * (cardWidth + gap)) / 2;
				const start = starts[index] ?? delaySeconds + 1 + index * 1.2;
				const turn = easeFrom(seconds, start, FLIP_SECONDS);
				const look = looks[index];
				// A flip as the eye reads it: the card narrows to an edge and opens again showing its back. Every face is
				// on the board from the start, so the student reads the term before its answer turns up.
				const back = turn >= 0.5;
				const width = Math.abs(Math.cos(Math.PI * turn));
				return (
					<div
						key={index}
						style={{
							position: 'absolute',
							left: inset + offset + column * (cardWidth + gap),
							top: top + row * (cardHeight + gap),
							width: cardWidth,
							height: cardHeight,
							transform: `scaleX(${Math.max(0.02, width)}) scale(${1 + 0.04 * look.emphasis})`,
							opacity: reveal(index) * (1 - UNFOCUSED_FADE * look.dim),
							borderRadius: u(26),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding,
							boxSizing: 'border-box',
							backgroundColor: back ? palette.surface : palette.lesson,
							border: back ? `${u(4)}px solid ${palette.lesson}` : 'none',
							boxShadow: `0 ${u(8)}px ${u(20)}px ${withAlpha('#000000', 0.12)}`,
						}}
					>
						{back ? (
							// The back keeps its term as a small heading, so the answer never loses its question.
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(10)}}>
								<RichText text={plain(card.front)} size={headingSize} weight={800} align="center" color={palette.lesson} />
								<RichText text={card.back} size={backSizeOf(card.back)} weight={600} align="center" />
							</div>
						) : (
							// The face is bold already; a marked word would take the emphasis colour, which on some lessons is the face's own.
							<RichText text={plain(card.front)} size={frontSize} weight={800} align="center" color={palette.onLesson} />
						)}
					</div>
				);
			})}
		</div>
	);
};
