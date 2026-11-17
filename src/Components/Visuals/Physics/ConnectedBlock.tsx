import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {textWidth} from '../FigureLabel';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';
import {blockChain} from './BlockChain';

type ConnectedBlocks = Extract<CourseVisual, {kind: 'connectedBlocks'}>;

/** Stage units: block height, the rope between two blocks, F's arrow, label size and the margins. */
const BLOCK_H = 150;
const ROPE = 230;
const F_ARROW = 190;
const FONT = 42;
const PAD = 26;
const MIN_W = 170;
const MAX_W = 320;
const SIDE = 70;
const GROUND = 330;
const HEIGHT = 450;

const blockWidth = (visual: Pick<ConnectedBlocks, 'blocks'>) => Math.min(MAX_W, Math.max(MIN_W, ...visual.blocks.map((block) => textWidth(block.label, FONT) + 2 * PAD)));

const forceText = (visual: ConnectedBlocks) => visual.forceLabel ?? `F = ${format(visual.force)} N`;

/** The stage: the row of blocks and ropes, F's arrow and label on the pulled side, a margin on the other. */
export const connectedBlocksStage = (visual: ConnectedBlocks) => {
	const w = blockWidth(visual);
	const row = visual.blocks.length * w + (visual.blocks.length - 1) * ROPE;
	const forceSide = Math.max(F_ARROW, textWidth(forceText(visual), FONT) + 30);
	return {width: SIDE + row + forceSide + SIDE, height: HEIGHT, blockWidth: w, row, forceSide};
};

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');
const SUBSCRIPTS = ['₁', '₂'];

/**
 * Blocks tied by ropes on the ground, pulled at one end by F. Each rope pulls the two blocks it joins towards each other
 * (two T arrows meeting along the rope); the acceleration arrow, when asked for, rides above the row in F's direction.
 * The blocks come in one after another, then F, then the tensions, then a.
 */
export const ConnectedBlocksVisual: React.FC<VisualBoxProps & {visual: ConnectedBlocks}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const stage = connectedBlocksStage(visual);
	const k = Math.min(width / stage.width, height / stage.height);
	const ox = (width - stage.width * k) / 2;
	const oy = (height - stage.height * k) / 2;
	const n = visual.blocks.length;
	const w = stage.blockWidth;
	const right = visual.pull === 'right';
	// The row starts after the margin, or after F's side when F pulls to the left.
	const rowLeft = right ? SIDE : SIDE + stage.forceSide;
	const xOf = (index: number) => rowLeft + index * (w + ROPE);
	const top = GROUND - BLOCK_H;
	const ropeY = GROUND - BLOCK_H / 2;
	const {acceleration, tensions} = blockChain({masses: visual.blocks.map((block) => block.mass), force: visual.force, pull: visual.pull, friction: visual.friction, g: visual.g});
	const ground = useReveal(delaySeconds, 0.5);
	const blockIn = (index: number) => easeFrom(seconds, delaySeconds + 0.2 + index * 0.25, 0.45);
	const forceIn = easeFrom(seconds, useShownAt('f') ?? delaySeconds + 0.3 + n * 0.25, 0.5);
	const tensionStart = delaySeconds + 0.6 + n * 0.25;
	// Read for both possible ropes every time: the hooks run in the same order whatever the block count.
	const tensionShownAt = [useShownAt('t1'), useShownAt('t2')];
	const accelerationIn = easeFrom(seconds, useShownAt('a') ?? tensionStart + (n - 1) * 0.3 + 0.3, 0.5);
	const groundStart = SIDE - 30;
	const groundEnd = stage.width - SIDE + 30;
	const tensionLabel = (rope: number) => {
		const name = visual.tensionLabels?.[rope] ?? (n === 2 ? 'T' : `T${SUBSCRIPTS[rope]}`);
		return visual.showValues ? `${name} = ${format(tensions[rope])} N` : name;
	};
	const pulled = right ? xOf(n - 1) + w : xOf(0);
	const fEnd = right ? pulled + F_ARROW : pulled - F_ARROW;
	const accelerationText = visual.showValues ? `a = ${format(acceleration)} m/s²` : 'a';

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				{/* The ground: a plain line when frictionless, hatched when it has friction. */}
				<g opacity={ground}>
					<line x1={groundStart} y1={GROUND} x2={groundEnd} y2={GROUND} stroke={palette.ink} strokeWidth={6} />
					{visual.friction > 0
						? Array.from({length: Math.ceil((groundEnd - groundStart) / 36)}, (_, index) => (
								<line key={index} x1={groundStart + index * 36} y1={GROUND + 4} x2={groundStart + index * 36 - 22} y2={GROUND + 28} stroke={palette.axis} strokeWidth={4} />
							))
						: null}
				</g>
				{/* The ropes, behind their arrows. */}
				{tensions.map((_, rope) => (
					<line key={`r${rope}`} opacity={Math.min(blockIn(rope), blockIn(rope + 1))} x1={xOf(rope) + w} y1={ropeY} x2={xOf(rope + 1)} y2={ropeY} stroke={palette.ink} strokeWidth={5} />
				))}
				{/* The blocks. */}
				{visual.blocks.map((block, index) => (
					<Part key={`b${index}`} id={`b${index + 1}`}>
						{(look) => (
							<g opacity={blockIn(index) * look.opacity}>
								<rect x={xOf(index)} y={top} width={w} height={BLOCK_H} rx={12} fill={palette.lesson} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} />
								<text x={xOf(index) + w / 2} y={top + BLOCK_H / 2 + FONT * 0.36} fill={palette.onLesson} fontSize={Math.min(FONT, (FONT * (w - 2 * PAD)) / textWidth(block.label, FONT))} fontWeight={800} textAnchor="middle">
									{block.label}
								</text>
							</g>
						)}
					</Part>
				))}
				{/* Each rope pulls the two blocks it joins towards each other: two T arrows from the faces, meeting at the rope's middle. */}
				{tensions.map((_, rope) => {
					const leftFace = xOf(rope) + w;
					const rightFace = xOf(rope + 1);
					const middle = (leftFace + rightFace) / 2;
					const tip = ROPE / 2 - 22;
					const shown = easeFrom(seconds, tensionShownAt[rope] ?? tensionStart + rope * 0.3, 0.45);
					return (
						<Part key={`t${rope}`} id={`t${rope + 1}`}>
							{(look) => (
								<g opacity={shown * look.opacity}>
									<line x1={leftFace} y1={ropeY} x2={leftFace + tip - 20} y2={ropeY} stroke={palette.lesson} strokeWidth={9 * look.scale} strokeLinecap="round" />
									<path d={arrowHead(leftFace + tip, ropeY, 0, 30)} fill={palette.lesson} />
									<line x1={rightFace} y1={ropeY} x2={rightFace - tip + 20} y2={ropeY} stroke={palette.lesson} strokeWidth={9 * look.scale} strokeLinecap="round" />
									<path d={arrowHead(rightFace - tip, ropeY, Math.PI, 30)} fill={palette.lesson} />
									<text x={middle} y={ropeY - 34} fill={palette.ink} fontSize={FONT} fontWeight={800} textAnchor="middle">
										{tensionLabel(rope)}
									</text>
								</g>
							)}
						</Part>
					);
				})}
				{/* F, from the pulled block's outer face. */}
				<Part id="f">
					{(look) => (
						<g opacity={forceIn * look.opacity}>
							<line x1={pulled} y1={ropeY} x2={right ? fEnd - 36 : fEnd + 36} y2={ropeY} stroke={palette.brand} strokeWidth={12 * look.scale} strokeLinecap="round" />
							<path d={arrowHead(fEnd, ropeY, right ? 0 : Math.PI, 42)} fill={palette.brand} />
							{/* From the block's face outwards, so a long label never runs back over the block. */}
							<text x={right ? pulled + 14 : pulled - 14} y={ropeY - 36} fill={palette.ink} fontSize={FONT} fontWeight={800} textAnchor={right ? 'start' : 'end'}>
								{forceText(visual)}
							</text>
						</g>
					)}
				</Part>
				{/* The acceleration of the whole row, above it. */}
				{visual.acceleration ? (
					<Part id="a">
						{(look) => {
							const y = top - 70;
							const from = xOf(0) + w / 2;
							const to = xOf(n - 1) + w / 2;
							const [start, end] = right ? [from, to] : [to, from];
							return (
								<g opacity={accelerationIn * look.opacity}>
									<line x1={start} y1={y} x2={right ? end - 30 : end + 30} y2={y} stroke={palette.ink} strokeWidth={6 * look.scale} />
									<path d={arrowHead(end, y, right ? 0 : Math.PI, 32)} fill={palette.ink} />
									<text x={(start + end) / 2} y={y - 22} fill={palette.ink} fontSize={FONT} fontWeight={800} textAnchor="middle">
										{accelerationText}
									</text>
								</g>
							);
						}}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
