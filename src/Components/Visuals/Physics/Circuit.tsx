import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {circuitLayout, type CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Circuit = Extract<CourseVisual, {kind: 'circuit'}>;

type CircuitElement = {kind: 'resistor' | 'lamp' | 'ammeter' | 'switch'; label?: string; brightness?: number; open: boolean};

type PlacedElement = CircuitElement & {x: number; y: number; index: number};

type Wire = [number, number, number, number];

const ElementGlyph: React.FC<{element: PlacedElement; cell: number; colour: string; strokeWidth: number; fontSize: number; glow: number}> = ({element, cell, colour, strokeWidth, fontSize, glow}) => {
	const palette = useVisualPalette();
	const {x, y} = element;
	const half = cell * 0.31;
	const r = cell * 0.2;
	switch (element.kind) {
		case 'resistor': {
			const teeth = 6;
			const step = (half * 2 * 0.7) / teeth;
			const start = x - half * 0.7;
			const points = Array.from({length: teeth + 1}, (_, index) => `${start + index * step} ${index === 0 || index === teeth ? y : y + (index % 2 ? -1 : 1) * cell * 0.13}`);
			return <path d={`M${x - half} ${y} L${start} ${y} L${points.join(' L')} L${x + half} ${y}`} fill="none" stroke={colour} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />;
		}
		case 'lamp': {
			const d = r * 0.7;
			return (
				<g>
					{element.brightness ? <circle cx={x} cy={y} r={r * 1.8} fill="#FFD54A" opacity={element.brightness * 0.65 * glow} /> : null}
					<line x1={x - half} y1={y} x2={x - r} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<line x1={x + r} y1={y} x2={x + half} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<circle cx={x} cy={y} r={r} fill={palette.surface} stroke={colour} strokeWidth={strokeWidth} />
					<line x1={x - d} y1={y - d} x2={x + d} y2={y + d} stroke={colour} strokeWidth={strokeWidth * 0.8} />
					<line x1={x - d} y1={y + d} x2={x + d} y2={y - d} stroke={colour} strokeWidth={strokeWidth * 0.8} />
				</g>
			);
		}
		case 'ammeter':
			return (
				<g>
					<line x1={x - half} y1={y} x2={x - r} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<line x1={x + r} y1={y} x2={x + half} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<circle cx={x} cy={y} r={r} fill={palette.surface} stroke={colour} strokeWidth={strokeWidth} />
					<text x={x} y={y + fontSize * 0.35} textAnchor="middle" fill={colour} fontSize={fontSize} fontWeight={800}>
						A
					</text>
				</g>
			);
		default: {
			// A switch: two contacts and a lever, lifted when open.
			const from = x - half * 0.75;
			const to = x + half * 0.75;
			const angle = element.open ? -0.5 : 0;
			const length = to - from;
			return (
				<g>
					<line x1={x - half} y1={y} x2={from} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<line x1={to} y1={y} x2={x + half} y2={y} stroke={colour} strokeWidth={strokeWidth} />
					<line x1={from} y1={y} x2={from + Math.cos(angle) * length} y2={y + Math.sin(angle) * length} stroke={colour} strokeWidth={strokeWidth} strokeLinecap="round" />
					<circle cx={from} cy={y} r={strokeWidth * 1.3} fill={colour} />
					<circle cx={to} cy={y} r={strokeWidth * 1.3} fill={colour} />
				</g>
			);
		}
	}
};

/**
 * An electric circuit drawn from its structure: a battery on the bottom wire, the elements and parallel groups
 * along the top; the wires come first, then the elements, then the lamps light up by their brightness.
 */
export const CircuitVisual: React.FC<VisualBoxProps & {visual: Circuit}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const wiresIn = useReveal(delaySeconds, 0.6);
	const elementsIn = useReveal(delaySeconds + 0.4, 0.6);
	const glow = useReveal(delaySeconds + 1, 0.8);
	const {widths, rows, span, gap, tall} = circuitLayout(visual.items);
	const rowGap = 0.9;
	const cell = Math.min(width / span, height / tall);
	const left = (width - span * cell) / 2;
	const top = (height - tall * cell) / 2 + 0.55 * cell;
	const right = left + span * cell;
	const bottom = top + ((rows - 1) * rowGap + 1.25) * cell;
	const strokeWidth = Math.max(u(4), cell * 0.035);
	const fontSize = Math.max(u(24), Math.min(u(36), cell * 0.2));
	const colour = palette.ink;
	const elements: PlacedElement[] = [];
	const wires: Wire[] = [];
	let cursor = left + 0.6 * cell;
	wires.push([left, top, cursor, top]);
	visual.items.forEach((item, itemIndex) => {
		const w = widths[itemIndex] * cell;
		if ('parallel' in item) {
			const railLeft = cursor + 0.35 * cell;
			const railRight = cursor + w - 0.35 * cell;
			wires.push([cursor, top, railLeft, top], [railRight, top, cursor + w, top]);
			wires.push([railLeft, top, railLeft, top + (item.parallel.length - 1) * rowGap * cell], [railRight, top, railRight, top + (item.parallel.length - 1) * rowGap * cell]);
			item.parallel.forEach((branch, branchIndex) => {
				const y = top + branchIndex * rowGap * cell;
				const slotWidth = (railRight - railLeft) / branch.length;
				let wireFrom = railLeft;
				branch.forEach((element, elementIndex) => {
					const x = railLeft + slotWidth * (elementIndex + 0.5);
					wires.push([wireFrom, y, x - cell * 0.31, y]);
					wireFrom = x + cell * 0.31;
					elements.push({...element, x, y, index: elements.length});
				});
				wires.push([wireFrom, y, railRight, y]);
			});
		} else {
			const x = cursor + w / 2;
			wires.push([cursor, top, x - cell * 0.31, top], [x + cell * 0.31, top, cursor + w, top]);
			elements.push({...item, x, y: top, index: elements.length});
		}
		cursor += w;
		if (itemIndex < visual.items.length - 1) {
			wires.push([cursor, top, cursor + gap * cell, top]);
			cursor += gap * cell;
		}
	});
	wires.push([cursor, top, right, top]);
	// The loop: down both sides and along the bottom, broken in the middle for the battery.
	const centre = (left + right) / 2;
	const plate = cell * 0.09;
	wires.push([left, top, left, bottom], [right, top, right, bottom], [left, bottom, centre - plate, bottom], [centre + plate, bottom, right, bottom]);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={wiresIn} stroke={colour} strokeWidth={strokeWidth} strokeLinecap="round">
				{wires.map(([x1, y1, x2, y2], index) => (
					<line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
				))}
				{/* The battery: the long thin plate is the + pole, the short thick one the − pole. */}
				<line x1={centre - plate} y1={bottom - cell * 0.22} x2={centre - plate} y2={bottom + cell * 0.22} strokeWidth={strokeWidth} />
				<line x1={centre + plate} y1={bottom - cell * 0.12} x2={centre + plate} y2={bottom + cell * 0.12} strokeWidth={strokeWidth * 2.2} />
			</g>
			{visual.battery ? (
				<text x={centre} y={bottom + cell * 0.22 + fontSize * 1.2} textAnchor="middle" fill={colour} fontSize={fontSize} fontWeight={800} opacity={wiresIn}>
					{visual.battery}
				</text>
			) : null}
			{elements.map((element) => (
				<Part key={element.index} id={`e${element.index + 1}`}>
					{(look) => (
						<g opacity={elementsIn * look.opacity}>
							<ElementGlyph element={element} cell={cell} colour={look.scale > 1 ? palette.brand : colour} strokeWidth={strokeWidth * look.scale} fontSize={fontSize} glow={glow} />
							{element.label ? (
								<text x={element.x} y={element.y - cell * 0.27 - fontSize * 0.25} textAnchor="middle" fill={look.scale > 1 ? palette.brand : colour} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(5)} paintOrder="stroke">
									{element.label}
								</text>
							) : null}
						</g>
					)}
				</Part>
			))}
		</svg>
	);
};
