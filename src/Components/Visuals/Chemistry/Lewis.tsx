import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Lewis = Extract<CourseVisual, {kind: 'lewis'}>;

/** Widths of Lewis tokens in units of the symbol's font size: an atom (with room for its dots and brackets), a shared bond, a sign. */
/**
 * Room a Lewis token takes, in units of the symbol's font size, split into what lies left and right of the
 * symbol's centre: the symbol itself, a dotted side, a bracket and a charge each get their own room, so dots,
 * charges and brackets never run into the next token (FIZ… KIM 3: Na⁺'s charge sat on the bracket of [Cl]⁻).
 */
const lewisRoom = (token: Lewis['tokens'][number]): {left: number; right: number} => {
	if (token.kind === 'shared') return {left: 0.3, right: 0.3};
	if (token.kind === 'sign') return {left: 0.5, right: 0.5};
	const half = token.symbol.length > 1 ? 0.62 : 0.42;
	const dotsLeft = token.dots[3] > 0 ? 0.28 : 0;
	const dotsRight = token.dots[1] > 0 ? 0.28 : 0;
	const bracket = token.brackets ? 0.32 : 0;
	const charge = token.charge ? 0.38 : 0;
	return {left: half + dotsLeft + bracket + 0.08, right: half + dotsRight + bracket + charge + 0.08};
};

const lewisWidth = (token: Lewis['tokens'][number]): number => lewisRoom(token).left + lewisRoom(token).right;

/**
 * Lewis notation on one line: valence electrons as dots on the four sides of a symbol, ions in brackets with their
 * charge, shared pairs between bonded atoms, and + and → between the steps of a reaction. The tokens appear one
 * after another, left to right.
 */
export const LewisVisual: React.FC<VisualBoxProps & {visual: Lewis}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const total = visual.tokens.reduce((sum, token) => sum + lewisWidth(token), 0);
	const font = Math.min(u(120), (width - u(40)) / total, height * 0.32);
	const left = (width - total * font) / 2;
	const midY = height * (visual.caption ? 0.45 : 0.5);
	const dot = font * 0.07;
	let cursor = left;
	const placed = visual.tokens.map((token) => {
		const x = cursor + lewisRoom(token).left * font;
		cursor += lewisWidth(token) * font;
		return {token, x};
	});
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{placed.map(({token, x}, index) => {
				const show = Math.min(1, Math.max(0, (seconds - delaySeconds - 0.3 - index * 0.45) / 0.4));
				return (
					<Part key={index} id={`t${index + 1}`}>
						{(look) => {
							const colour = look.scale > 1 ? palette.brand : palette.ink;
							if (token.kind === 'sign') {
								return (
									<text x={x} y={midY + font * 0.3} textAnchor="middle" fill={palette.muted} fontSize={font * 0.7} fontWeight={800} opacity={show * look.opacity}>
										{token.text}
									</text>
								);
							}
							if (token.kind === 'shared') {
								// Each shared pair is two dots side by side; double and triple bonds stack them.
								return (
									<g opacity={show * look.opacity} fill={palette.brand}>
										{Array.from({length: token.pairs}, (_, pair) => {
											const y = midY + (pair - (token.pairs - 1) / 2) * dot * 3.2;
											return [-1, 1].map((side) => <circle key={`${pair}${side}`} cx={x + side * dot * 1.4} cy={y} r={dot} />);
										})}
									</g>
								);
							}
							const half = (token.symbol.length > 1 ? 0.62 : 0.42) * font;
							const sides: [number, number, number, number][] = [
								[0, -1, 1, 0],
								[1, 0, 0, 1],
								[0, 1, 1, 0],
								[-1, 0, 0, 1],
							];
							return (
								<g opacity={show * look.opacity}>
									<text x={x} y={midY + font * 0.35} textAnchor="middle" fill={palette.ink} fontSize={font} fontWeight={800}>
										{token.symbol}
									</text>
									{token.dots.map((count, side) => {
										const [dx, dy, spreadX, spreadY] = sides[side];
										const cx = x + dx * (half + dot * 2.2);
										const cy = midY + dy * (font * 0.52 + dot * 1.2) - (dy === 0 ? font * 0.02 : 0);
										return Array.from({length: count}, (_, k) => {
											const offset = count === 2 ? (k === 0 ? -1 : 1) * dot * 1.6 : 0;
											return <circle key={`${side}${k}`} cx={cx + spreadX * offset} cy={cy + spreadY * offset} r={dot} fill={palette.lesson} />;
										});
									})}
									{token.brackets ? (
										<g stroke={colour} strokeWidth={Math.max(u(3), font * 0.04)} fill="none">
											<path d={`M${x - half - font * (token.dots[3] ? 0.3 : 0.08)} ${midY - font * 0.62} h${-font * 0.08} v${font * 1.24} h${font * 0.08}`} />
											<path d={`M${x + half + font * (token.dots[1] ? 0.3 : 0.08)} ${midY - font * 0.62} h${font * 0.08} v${font * 1.24} h${-font * 0.08}`} />
										</g>
									) : null}
									{token.charge ? (
										<text x={x + half + font * ((token.dots[1] ? 0.28 : 0) + (token.brackets ? 0.36 : 0) + 0.06)} y={midY - font * 0.55} fill={palette.ink} fontSize={font * 0.42} fontWeight={800}>
											{token.charge}
										</text>
									) : null}
								</g>
							);
						}}
					</Part>
				);
			})}
			{visual.caption ? (
				<text x={width / 2} y={midY + font * 1.25} textAnchor="middle" fill={palette.muted} fontSize={Math.min(u(34), font * 0.35)} fontWeight={700}>
					{visual.caption}
				</text>
			) : null}
		</svg>
	);
};
