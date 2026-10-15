import 'katex/contrib/mhchem';
import katex from 'katex';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import SmilesDrawer from 'smiles-drawer';
import {KATEX_OPTIONS} from '../../Schemas/RichText';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {parseExpression} from './PlotExpression';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {elementLook, useElementState} from './VisualTimeline';
import type {CourseVisual} from './VisualSchemas';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';

type Reaction = Extract<CourseVisual, {kind: 'reaction'}>;
type Forces = Extract<CourseVisual, {kind: 'forces'}>;
type Motion = Extract<CourseVisual, {kind: 'motion'}>;
type Molecule = Extract<CourseVisual, {kind: 'molecule'}>;
type Atom = Extract<CourseVisual, {kind: 'atom'}>;

/** A reaction equation, set by KaTeX's mhchem: subscripts, arrows and states come out right without LaTeX. */
export const ReactionVisual: React.FC<VisualBoxProps & {visual: Reaction}> = ({visual, width, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.5);
	const html = useMemo(() => katex.renderToString(`\\ce{${visual.equation}}`, {...KATEX_OPTIONS, throwOnError: false, displayMode: true}), [visual.equation]);
	return (
		<div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(24), opacity: show, transform: `translateY(${(1 - show) * u(30)}px)`}}>
			<div style={{fontSize: u(70), color: palette.ink, padding: `${u(28)}px ${u(40)}px`, borderRadius: u(28), backgroundColor: palette.fill}} dangerouslySetInnerHTML={{__html: html}} />
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontSize: u(32), color: palette.muted, textAlign: 'center'}}>{visual.caption}</div> : null}
		</div>
	);
};

export const arrowHead = (x: number, y: number, angle: number, size: number) => {
	const back = angle + Math.PI;
	const left = [x + size * Math.cos(back - 0.45), y + size * Math.sin(back - 0.45)];
	const right = [x + size * Math.cos(back + 0.45), y + size * Math.sin(back + 0.45)];
	return `M${x} ${y} L${left[0]} ${left[1]} L${right[0]} ${right[1]} Z`;
};

/** A force's direction in degrees (0 right, 90 up), relative to the surface where the direction names one. */
export const forceAngle = (force: Forces['forces'][number], surfaceDegrees: number): number => {
	switch (force.direction) {
		case 'weight':
		case 'down':
			return -90;
		case 'up':
			return 90;
		case 'right':
			return 0;
		case 'left':
			return 180;
		case 'normal':
			return 90 + surfaceDegrees;
		case 'upSlope':
			return surfaceDegrees;
		case 'downSlope':
			return 180 + surfaceDegrees;
		default:
			return force.angle ?? 0;
	}
};

/**
 * A free-body diagram: the body on its surface (flat or inclined) and the
 * forces on it as arrows from its centre, each growing out in turn with its
 * label at the tip. Directions given relative to the surface stay right when
 * the incline changes (the normal force perpendicular, friction along it);
 * arrow lengths are in proportion to the magnitudes.
 */
export const ForcesVisual: React.FC<VisualBoxProps & {visual: Forces}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const surfaceDegrees = visual.surface ?? 0;
	const tilt = (surfaceDegrees * Math.PI) / 180;
	const bodySize = Math.min(width, height) * 0.2;
	const maxArrow = Math.min(width, height) * 0.36;
	const scene = useReveal(delaySeconds, 0.5);
	const colours = [palette.lesson, palette.brand, palette.ink, palette.lesson, palette.brand, palette.ink];
	const pivot: [number, number] = [width / 2, height * 0.56 + bodySize / 2];
	const surfaceY = pivot[1];
	// The body sits on the incline: its centre is half its height away from the surface, perpendicular to it.
	const centre: [number, number] = [pivot[0] - (bodySize / 2) * Math.sin(tilt), pivot[1] - (bodySize / 2) * Math.cos(tilt)];
	const largest = Math.max(0, ...visual.forces.map((force) => force.magnitude ?? 0));
	const lengthOf = (force: Forces['forces'][number]) => maxArrow * (largest > 0 && force.magnitude ? Math.max(0.12, force.magnitude / largest) : (force.size ?? 0.6));

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g opacity={scene} transform={`rotate(${-surfaceDegrees} ${pivot[0]} ${surfaceY})`}>
				{visual.surface !== null ? (
					<>
						<line x1={pivot[0] - width * 0.45} x2={pivot[0] + width * 0.45} y1={surfaceY} y2={surfaceY} stroke={palette.axis} strokeWidth={u(6)} />
						{Array.from({length: 14}, (_, index) => {
							const hx = pivot[0] - width * 0.45 + index * ((width * 0.9) / 13);
							return <line key={index} x1={hx} y1={surfaceY} x2={hx - u(18)} y2={surfaceY + u(22)} stroke={palette.grid} strokeWidth={u(4)} />;
						})}
					</>
				) : null}
				{visual.body === 'box' ? (
					<rect x={pivot[0] - bodySize / 2} y={surfaceY - bodySize} width={bodySize} height={bodySize} rx={u(10)} fill={palette.fill} stroke={palette.ink} strokeWidth={u(5)} />
				) : (
					<circle cx={pivot[0]} cy={surfaceY - bodySize / 2} r={bodySize / 2} fill={palette.fill} stroke={palette.ink} strokeWidth={u(5)} />
				)}
			</g>
			{visual.forces.map((force, index) => (
				<ForceArrow key={index} id={force.label} centre={centre} angle={(-forceAngle(force, surfaceDegrees) * Math.PI) / 180} length={lengthOf(force)} label={force.label} colour={colours[index]} delaySeconds={delaySeconds + 0.5 + index * 0.45} headSize={u(30)} stroke={u(9)} fontSize={u(40)} />
			))}
		</svg>
	);
};

export const ForceArrow: React.FC<{id?: string; centre: [number, number]; angle: number; length: number; label: string; colour: string; delaySeconds: number; headSize: number; stroke: number; fontSize: number}> = ({id, centre, angle, length, label, colour, delaySeconds, headSize, stroke, fontSize}) => {
	// Dimming changes how strongly an arrow is drawn, never its length: the length is the force.
	const look = elementLook(useElementState(id));
	const grow = useReveal(delaySeconds, 0.5, 'overshoot');
	stroke *= look.scale;
	const tip = [centre[0] + Math.cos(angle) * length * grow, centre[1] + Math.sin(angle) * length * grow];
	const labelAt = [centre[0] + Math.cos(angle) * (length + fontSize * 1.1), centre[1] + Math.sin(angle) * (length + fontSize * 1.1)];
	return (
		<g opacity={grow <= 0 ? 0 : look.opacity}>
			<line x1={centre[0]} y1={centre[1]} x2={tip[0]} y2={tip[1]} stroke={colour} strokeWidth={stroke} strokeLinecap="round" />
			<path d={arrowHead(tip[0], tip[1], angle, headSize)} fill={colour} />
			<text x={labelAt[0]} y={labelAt[1] + fontSize * 0.35} fill={colour} fontSize={fontSize} fontWeight={800} textAnchor="middle" opacity={Math.min(1, grow)}>
				{label}
			</text>
		</g>
	);
};

/**
 * A body moving along x(t), y(t): the path it has travelled stays as a trail
 * and, if asked, its velocity is an arrow on it. The motion plays over
 * `duration` seconds of the video, then the body rests at the end.
 */
export const MotionVisual: React.FC<VisualBoxProps & {visual: Motion}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const xOf = useMemo(() => parseExpression(visual.x, ['t']), [visual.x]);
	const yOf = useMemo(() => parseExpression(visual.y, ['t']), [visual.y]);
	const [minX, minY, maxX, maxY] = visual.view;
	const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const toScreen = (px: number, py: number) => [offsetX + (px - minX) * scale, offsetY + (maxY - py) * scale];
	const progress = Math.min(1, Math.max(0, (seconds - delaySeconds) / visual.duration));
	const [t0, t1] = visual.t;
	const now = t0 + (t1 - t0) * progress;
	const steps = 120;
	const trail = Array.from({length: Math.max(2, Math.round(steps * progress) + 1)}, (_, index) => {
		const t = t0 + ((now - t0) * index) / Math.max(1, Math.round(steps * progress));
		return toScreen(xOf({t}), yOf({t}));
	});
	const [bx, by] = toScreen(xOf({t: now}), yOf({t: now}));
	const dt = (t1 - t0) / 200;
	const [vx, vy] = [xOf({t: now + dt}) - xOf({t: now}), yOf({t: now + dt}) - yOf({t: now})];
	// The arrow's length is the speed: the fastest moment of the motion gets the longest arrow.
	const fastest = useMemo(() => {
		let top = 0;
		for (let index = 0; index <= 200; index++) {
			const t = t0 + ((t1 - t0) * index) / 200;
			top = Math.max(top, Math.hypot(xOf({t: t + dt}) - xOf({t}), yOf({t: t + dt}) - yOf({t})));
		}
		return top || 1;
	}, [t0, t1, dt, xOf, yOf]);
	const arrowLength = u(170) * Math.hypot(vx, vy) / fastest;
	const angle = Math.atan2(-vy, vx);
	const ground = toScreen(minX, 0)[1];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{ground >= 0 && ground <= height ? <line x1={0} x2={width} y1={ground} y2={ground} stroke={palette.axis} strokeWidth={u(5)} /> : null}
			<path d={trail.map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${px} ${py}`).join(' ')} fill="none" stroke={palette.lesson} strokeWidth={u(6)} strokeDasharray={`${u(4)} ${u(14)}`} strokeLinecap="round" />
			<circle cx={bx} cy={by} r={u(26)} fill={palette.brand} stroke={palette.surface} strokeWidth={u(5)} />
			{visual.velocity && progress < 1 && arrowLength > u(8) ? (
				<g>
					<line x1={bx} y1={by} x2={bx + Math.cos(angle) * arrowLength} y2={by + Math.sin(angle) * arrowLength} stroke={palette.ink} strokeWidth={u(7)} />
					<path d={arrowHead(bx + Math.cos(angle) * arrowLength, by + Math.sin(angle) * arrowLength, angle, u(24))} fill={palette.ink} />
					<text x={bx + Math.cos(angle) * (arrowLength + u(34))} y={by + Math.sin(angle) * (arrowLength + u(34)) + u(12)} fill={palette.ink} fontSize={u(34)} fontWeight={800} textAnchor="middle">
						v
					</text>
				</g>
			) : null}
			{visual.label ? <text x={bx} y={by - u(44)} fill={palette.ink} fontSize={u(32)} fontWeight={800} textAnchor="middle">{visual.label}</text> : null}
		</svg>
	);
};

/**
 * A molecule from SMILES, drawn by SmilesDrawer into an SVG. The drawing is
 * done once, before the frame is captured; Remotion waits for it.
 */
export const MoleculeVisual: React.FC<VisualBoxProps & {visual: Molecule}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const target = useRef<SVGSVGElement>(null);
	const [handle] = useState(() => delayRender(`Drawing molecule ${visual.smiles}`));
	const [failed, setFailed] = useState(false);
	const show = useReveal(delaySeconds, 0.5);
	// Small molecules are drawn at a size that suits them, not blown up to fill the card.
	const heavyAtoms = (visual.smiles.match(/Cl|Br|[BCNOPSFI]|[cnops]/g) ?? []).length;
	const drawingHeight = Math.min(height - (visual.caption ? u(70) : 0), u(170 + heavyAtoms * 55));
	const drawingWidth = Math.min(width, drawingHeight * 1.6);

	useLayoutEffect(() => {
		const svg = target.current;
		if (!svg) return;
		const drawer = new SmilesDrawer.SvgDrawer({width: drawingWidth, height: drawingHeight, bondThickness: u(5), fontSizeLarge: u(30), fontSizeSmall: u(20), padding: u(20), themes: {sinavika: {C: palette.ink, O: palette.brand, N: palette.lesson, F: palette.ink, CL: palette.ink, BR: palette.ink, I: palette.ink, P: palette.ink, S: palette.ink, B: palette.ink, SI: palette.ink, H: palette.ink, BACKGROUND: 'transparent'}}});
		SmilesDrawer.parse(
			visual.smiles,
			(tree) => {
				drawer.draw(tree, svg, 'sinavika');
				continueRender(handle);
			},
			() => {
				setFailed(true);
				continueRender(handle);
			},
		);
	}, [visual.smiles, drawingWidth, drawingHeight, handle, palette.ink, palette.brand, palette.lesson, u]);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(20), opacity: show}}>
			{failed ? <div style={{fontFamily: palette.fontBody, color: palette.brand, fontSize: u(30)}}>{visual.smiles}</div> : <svg ref={target} width={drawingWidth} height={drawingHeight} />}
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontSize: u(32), color: palette.muted}}>{visual.caption}</div> : null}
		</div>
	);
};

/**
 * An atom in the Bohr model: the nucleus with its proton and neutron count,
 * and the electrons on their shells, appearing shell by shell and slowly
 * turning.
 */
export const AtomVisual: React.FC<VisualBoxProps & {visual: Atom}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const size = Math.min(width, height);
	const centre = [width / 2, height / 2];
	const nucleus = size * 0.11;
	const gap = (size / 2 - nucleus - u(30)) / visual.shells.length;
	const core = useReveal(delaySeconds, 0.5, 'overshoot');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{visual.shells.map((count, shell) => (
				<AtomShell key={shell} centre={centre as [number, number]} radius={nucleus + gap * (shell + 1)} count={count} turn={seconds * (0.25 / (shell + 1))} delaySeconds={delaySeconds + 0.4 + shell * 0.35} electron={u(13)} stroke={u(3)} />
			))}
			<circle cx={centre[0]} cy={centre[1]} r={nucleus * core} fill={palette.lesson} />
			<text x={centre[0]} y={centre[1] - nucleus * 0.12} fill={palette.onLesson} fontSize={nucleus * 0.62} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} textAnchor="middle" opacity={core}>
				{visual.symbol}
			</text>
			<text x={centre[0]} y={centre[1] + nucleus * 0.5} fill={palette.onLesson} fontSize={nucleus * 0.26} fontWeight={700} textAnchor="middle" opacity={core}>
				{`${visual.protons}p${visual.neutrons !== undefined ? ` ${visual.neutrons}n` : ''}`}
			</text>
		</svg>
	);
};

const AtomShell: React.FC<{centre: [number, number]; radius: number; count: number; turn: number; delaySeconds: number; electron: number; stroke: number}> = ({centre, radius, count, turn, delaySeconds, electron, stroke}) => {
	const palette = useVisualPalette();
	const show = useReveal(delaySeconds, 0.4);
	return (
		<g opacity={show}>
			<circle cx={centre[0]} cy={centre[1]} r={radius} fill="none" stroke={palette.axis} strokeWidth={stroke} />
			{Array.from({length: count}, (_, index) => {
				const angle = (index / count) * Math.PI * 2 + turn;
				return <circle key={index} cx={centre[0] + Math.cos(angle) * radius} cy={centre[1] + Math.sin(angle) * radius} r={electron} fill={palette.brand} />;
			})}
		</g>
	);
};
