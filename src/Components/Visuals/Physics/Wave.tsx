import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Wave = Extract<CourseVisual, {kind: 'wave'}>;

/**
 * Which way a point of a transverse wave travelling to the right is moving: for y = A sin(kx − ωt) the velocity
 * is −v·dy/dx, so a point on a rising slope moves down and one on a falling slope moves up (1 up, −1 down, 0 at a
 * crest or trough).
 */
const waveVelocitySign = (x: number, wavelength: number, phase = 0): number => {
	const slope = Math.cos((2 * Math.PI * x) / wavelength - phase);
	return Math.abs(slope) < 1e-6 ? 0 : -Math.sign(slope);
};

const DoubleArrow: React.FC<{x1: number; y1: number; x2: number; y2: number; colour: string; strokeWidth: number; head: number}> = ({x1, y1, x2, y2, colour, strokeWidth, head}) => {
	const angle = Math.atan2(y2 - y1, x2 - x1);
	return (
		<g>
			<line x1={x1 + Math.cos(angle) * head * 0.8} y1={y1 + Math.sin(angle) * head * 0.8} x2={x2 - Math.cos(angle) * head * 0.8} y2={y2 - Math.sin(angle) * head * 0.8} stroke={colour} strokeWidth={strokeWidth} />
			<path d={arrowHead(x2, y2, angle, head)} fill={colour} />
			<path d={arrowHead(x1, y1, angle + Math.PI, head)} fill={colour} />
		</g>
	);
};

/**
 * Waves on a grid: a transverse wave as a curve that travels to the right with its wavelength and amplitude
 * marked on a crest that moves with it, or a longitudinal wave as lines bunching into compressions; one or two
 * rows to compare, and points that show which way they move.
 */
export const WaveVisual: React.FC<VisualBoxProps & {visual: Wave}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const appear = useReveal(delaySeconds, 0.6);
	const marksIn = useReveal(delaySeconds + 0.8, 0.5);
	const rows = visual.rows.length;
	const largest = Math.max(...visual.rows.map((row) => row.amplitude));
	const labelRoom = u(70);
	const unit = Math.min((width - u(120)) / visual.length, (height / rows - labelRoom) / (2 * largest + 1.6));
	const left = (width - unit * visual.length) / 2;
	const bandHeight = height / rows;
	const elapsed = Math.max(0, seconds - delaySeconds);
	// One wavelength every two seconds: slow enough to follow a crest with the eye.
	const travelled = visual.travel ? (elapsed / 2) * 2 * Math.PI : 0;
	const fontSize = u(32);
	const strokeWidth = Math.max(u(5), unit * 0.07);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{visual.rows.map((row, rowIndex) => {
				const axisY = bandHeight * rowIndex + labelRoom * 0.6 + (bandHeight - labelRoom * 0.6) / 2;
				const phase = travelled;
				const k = (2 * Math.PI) / row.wavelength;
				const xs = Array.from({length: 241}, (_, index) => (visual.length * index) / 240);
				const curve = xs.map((x) => `${left + x * unit} ${axisY - row.amplitude * unit * Math.sin(k * x - phase)}`).join(' L');
				// The first whole crest inside the view, moving with the wave.
				const crestX = (((phase / (2 * Math.PI) + 0.25) * row.wavelength) % row.wavelength + row.wavelength) % row.wavelength;
				const rowsTop = axisY - (largest + 0.8) * unit;
				const rowsBottom = axisY + (largest + 0.8) * unit;
				return (
					<Part key={rowIndex} id={`w${rowIndex + 1}`}>
						{(look) => (
							<g opacity={appear * look.opacity}>
								{visual.grid ? (
									<g stroke={palette.grid} strokeWidth={u(2)}>
										{Array.from({length: Math.floor(visual.length) + 1}, (_, index) => (
											<line key={`v${index}`} x1={left + index * unit} x2={left + index * unit} y1={rowsTop} y2={rowsBottom} />
										))}
										{Array.from({length: Math.floor((rowsBottom - rowsTop) / unit) + 1}, (_, index) => (
											<line key={`h${index}`} x1={left} x2={left + visual.length * unit} y1={axisY + (index - Math.floor((axisY - rowsTop) / unit)) * unit} y2={axisY + (index - Math.floor((axisY - rowsTop) / unit)) * unit} />
										))}
									</g>
								) : null}
								<line x1={left} x2={left + visual.length * unit} y1={axisY} y2={axisY} stroke={palette.muted} strokeWidth={u(2)} strokeDasharray={`${u(10)} ${u(8)}`} />
								{row.type === 'transverse' ? (
									<path d={`M${curve}`} fill="none" stroke={palette.lesson} strokeWidth={strokeWidth * look.scale} strokeLinejoin="round" />
								) : (
									<g stroke={palette.lesson} strokeWidth={strokeWidth * 0.7}>
										{/* Coils pushed back and forth: they bunch where the wave compresses the medium. */}
										{Array.from({length: Math.round((visual.length / row.wavelength) * 14) + 1}, (_, index) => {
											const rest = (index * row.wavelength) / 14;
											const x = rest - (row.wavelength / 14) * 1.6 * Math.sin(k * rest - phase);
											return x >= 0 && x <= visual.length ? <line key={index} x1={left + x * unit} x2={left + x * unit} y1={axisY - row.amplitude * unit} y2={axisY + row.amplitude * unit} /> : null;
										})}
									</g>
								)}
								{row.label ? (
									<text x={left} y={rowsTop - u(14)} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
										{row.label}
									</text>
								) : null}
								{/* The direction of travel. */}
								<g opacity={marksIn}>
									<line x1={left + visual.length * unit + u(18)} x2={left + visual.length * unit + u(70)} y1={axisY} y2={axisY} stroke={palette.brand} strokeWidth={u(6)} />
									<path d={arrowHead(left + visual.length * unit + u(90), axisY, 0, u(22))} fill={palette.brand} />
								</g>
								{row.marks && row.type === 'transverse' && crestX + row.wavelength <= visual.length ? (
									<g opacity={marksIn}>
										<DoubleArrow x1={left + crestX * unit} y1={axisY - (row.amplitude + 0.45) * unit} x2={left + (crestX + row.wavelength) * unit} y2={axisY - (row.amplitude + 0.45) * unit} colour={palette.ink} strokeWidth={u(4)} head={u(18)} />
										<text x={left + (crestX + row.wavelength / 2) * unit} y={axisY - (row.amplitude + 0.45) * unit - u(14)} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(5)} paintOrder="stroke">
											λ
										</text>
										<DoubleArrow x1={left + crestX * unit} y1={axisY} x2={left + crestX * unit} y2={axisY - row.amplitude * unit} colour={palette.brand} strokeWidth={u(4)} head={u(16)} />
										<text x={left + crestX * unit + u(14)} y={axisY - (row.amplitude * unit) / 2 + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(5)} paintOrder="stroke">
											A
										</text>
									</g>
								) : null}
								{row.marks && row.type === 'longitudinal' ? (
									<g opacity={marksIn}>
										<text x={left + (((((phase / (2 * Math.PI)) * row.wavelength) % row.wavelength) + row.wavelength) % row.wavelength) * unit} y={axisY + (row.amplitude + 0.6) * unit + fontSize * 0.6} textAnchor="middle" fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800}>
											sıkışma
										</text>
									</g>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			{visual.points.map((point, index) => {
				const row = visual.rows[Math.min(point.row, rows - 1)];
				const axisY = bandHeight * Math.min(point.row, rows - 1) + labelRoom * 0.6 + (bandHeight - labelRoom * 0.6) / 2;
				const phase = travelled;
				const k = (2 * Math.PI) / row.wavelength;
				const x = left + point.x * unit;
				const y = axisY - row.amplitude * unit * Math.sin(k * point.x - phase);
				const direction = waveVelocitySign(point.x, row.wavelength, phase);
				return (
					<Part key={`p${index}`} id={`p${index + 1}`}>
						{(look) => (
							<g opacity={marksIn * look.opacity}>
								<circle cx={x} cy={y} r={u(11) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
								{visual.motion && direction !== 0 ? (
									<g>
										<line x1={x} y1={y - direction * u(18)} x2={x} y2={y - direction * u(56)} stroke={palette.ink} strokeWidth={u(5)} />
										<path d={arrowHead(x, y - direction * u(66), direction > 0 ? -Math.PI / 2 : Math.PI / 2, u(18))} fill={palette.ink} />
									</g>
								) : null}
								<text x={x + u(18)} y={y + (direction > 0 ? u(36) : -u(18))} fill={palette.ink} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(5)} paintOrder="stroke">
									{point.label}
								</text>
							</g>
						)}
					</Part>
				);
			})}
		</svg>
	);
};
