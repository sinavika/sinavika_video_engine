import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

type BarModel = Extract<CourseVisual, {kind: 'barModel'}>;

const FONT = 44;
const BAR = 96;
const BRACE = 128;
const GAP = 34;
const PAD = 30;
const BAR_ROOM = 1100;

/** Where each bar sits: its label column, one shared unit length, and room for braces above or below. */
export const barModelFrame = (visual: BarModel) => {
	const labelWidth = Math.max(...visual.bars.map((bar) => textWidth(bar.label, FONT, 800))) + 2 * PAD;
	const longest = Math.max(...visual.bars.map((bar) => bar.pieces.reduce((total, piece) => total + piece.units, 0)));
	const unit = BAR_ROOM / longest;
	let y = PAD;
	const bars = visual.bars.map((_, index) => {
		const above = visual.braces.some((brace) => brace.bar === index && brace.side === 'above') ? BRACE : 0;
		const below = visual.braces.some((brace) => brace.bar === index && brace.side === 'below') ? BRACE : 0;
		const top = y + above;
		y = top + BAR + below + GAP;
		return {top, above, below};
	});
	return {labelWidth, unit, bars, width: labelWidth + BAR_ROOM + PAD, height: y - GAP + PAD};
};

/** A curly brace from x1 to x2, its tip at the middle, opening towards the bar (above: tip up). */
const bracePath = (x1: number, x2: number, y: number, direction: 1 | -1): string => {
	const depth = 26 * direction;
	const middle = (x1 + x2) / 2;
	return `M${x1} ${y} q0 ${depth} ${Math.min(30, (middle - x1) / 2)} ${depth} L${middle - 22} ${y + depth} q22 0 22 ${depth} q0 ${-depth} 22 ${-depth} L${x2 - Math.min(30, (x2 - middle) / 2)} ${y + depth} q${Math.min(30, (x2 - middle) / 2)} 0 ${Math.min(30, (x2 - middle) / 2)} ${-depth}`;
};

/**
 * The bar model (şerit modeli) of a word problem: every quantity a bar of pieces on one shared scale, so a part three
 * times another is three times as long, and braces carry what the problem tells about pieces together ("toplam 60").
 * Bars come in one by one with their pieces from the left; beats show or point at bars (b1), pieces (b1-2) and
 * braces (k1).
 */
export const BarModelVisual: React.FC<VisualBoxProps & {visual: BarModel}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = barModelFrame(visual);
	const barLooks = [0, 1, 2, 3].map((index) => usePartLook(`b${index + 1}`, useReveal(delaySeconds + 0.4 + index * 0.8, 0.8)));
	const pieceLooks = [0, 1, 2, 3].map((bar) => Array.from({length: 10}, (_, piece) => usePartLook(`b${bar + 1}-${piece + 1}`, 1)));
	const braceLooks = [0, 1, 2, 3].map((index) => usePartLook(`k${index + 1}`, useReveal(delaySeconds + 0.6 + visual.bars.length * 0.8 + index * 0.6, 0.6)));
	const fillOf = (shade: BarModel['bars'][number]['pieces'][number]['shade'], focused: number) =>
		shade === 'empty' ? withAlpha(palette.ink, 0.04 + 0.08 * focused) : withAlpha(shade === 'brand' ? palette.brand : palette.lesson, 0.22 + 0.25 * focused);

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontBody}}>
				{visual.bars.map((bar, index) => {
					const look = barLooks[index];
					const {top} = frame.bars[index];
					let x = frame.labelWidth;
					return (
						<g key={index} opacity={look.opacity}>
							<text x={frame.labelWidth - PAD} y={top + BAR / 2} textAnchor="end" dominantBaseline="central" fill={look.focused > 0.5 ? palette.lesson : palette.ink} fontSize={FONT} fontWeight={800}>
								{bar.label}
							</text>
							{bar.pieces.map((piece, pieceIndex) => {
								const left = x;
								const pieceWidth = piece.units * frame.unit;
								x += pieceWidth;
								// The pieces of a bar sweep in from the left as the bar comes in.
								const grown = Math.max(0, Math.min(1, look.drawn * bar.pieces.length - pieceIndex));
								const pieceLook = pieceLooks[index][pieceIndex];
								const focused = Math.max(pieceLook.focused, look.focused * 0.4);
								return (
									<g key={pieceIndex} opacity={grown * pieceLook.opacity}>
										<rect x={left} y={top} width={pieceWidth * grown} height={BAR} fill={fillOf(piece.shade, focused)} stroke={piece.shade === 'empty' ? palette.axis : palette.lesson} strokeWidth={4} strokeDasharray={piece.shade === 'empty' ? '12 10' : undefined} />
										{piece.label && grown > 0.9 ? (
											<text x={left + pieceWidth / 2} y={top + BAR / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={Math.min(FONT, (pieceWidth - 12) / Math.max(1, textWidth(piece.label, 1, 800)))} fontWeight={800}>
												{piece.label}
											</text>
										) : null}
									</g>
								);
							})}
						</g>
					);
				})}
				{visual.braces.map((brace, index) => {
					const look = braceLooks[index];
					const bar = visual.bars[brace.bar];
					const start = bar.pieces.slice(0, brace.from).reduce((total, piece) => total + piece.units, 0);
					const end = bar.pieces.slice(0, brace.to + 1).reduce((total, piece) => total + piece.units, 0);
					const x1 = frame.labelWidth + start * frame.unit + 4;
					const x2 = frame.labelWidth + end * frame.unit - 4;
					const {top} = frame.bars[brace.bar];
					const above = brace.side === 'above';
					const y = above ? top - 10 : top + BAR + 10;
					return (
						<g key={index} opacity={look.opacity}>
							<path d={bracePath(x1, x2, y, above ? -1 : 1)} fill="none" stroke={look.focused > 0.5 ? palette.brand : palette.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
							<text x={(x1 + x2) / 2} y={above ? y - 66 : y + 52 + FONT * 0.95} textAnchor="middle" fill={look.focused > 0.5 ? palette.brand : palette.ink} fontSize={FONT * 0.9} fontWeight={800}>
								{brace.label}
							</text>
						</g>
					);
				})}
			</g>
		</World>
	);
};
