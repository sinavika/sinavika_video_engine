import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {ORGANELLE_COLORS as C} from './Cell';

// ---------------------------------------------------------------- cells in hypotonic, isotonic and hypertonic media

type Tonicity = Extract<CourseVisual, {kind: 'tonicity'}>;
type Medium = Tonicity['media'][number];

const PANEL = 330;
const HEIGHT = 520;
/** The figure's stage: one 330-wide panel per medium. */
export const tonicityStage = (panels: number) => ({width: 20 + PANEL * panels, height: HEIGHT});

const MEDIUM = {
	hipotonik: {title: 'Hipotonik', note: 'ortam seyreltik', shade: 0.1, solutes: 4, water: 1},
	izotonik: {title: 'İzotonik', note: 'yoğunluk eşit', shade: 0.22, solutes: 11, water: 0},
	hipertonik: {title: 'Hipertonik', note: 'ortam derişik', shade: 0.4, solutes: 24, water: -1},
} as const;
const RESULT: Record<'animal' | 'plant', Record<Medium, [string, string]>> = {
	animal: {hipotonik: ['Su alır, şişer', 'patlayabilir: hemoliz'], izotonik: ['Değişmez', 'giren su = çıkan su'], hipertonik: ['Su kaybeder', 'büzülür']},
	plant: {hipotonik: ['Turgor', 'duvar patlamayı önler'], izotonik: ['Değişmez', 'giren su = çıkan su'], hipertonik: ['Plazmoliz', 'zar duvardan ayrılır']},
};
const ROMAN = ['I', 'II', 'III'];
const WATER = '#3E8ED0';
const RBC = '#D5574F';
const RBC_LIGHT = '#EE9A92';

/** Fixed solute dots in a beaker: more of them where the medium is denser. */
const solutes = (count: number, x0: number, seed: number): [number, number][] => {
	let state = seed;
	const next = () => (state = (state * 48271) % 2147483647) / 2147483647;
	const dots: [number, number][] = [];
	for (let tries = 0; dots.length < count && tries < 600; tries++) {
		const x = x0 + 40 + next() * (PANEL - 100);
		const y = 110 + next() * 270;
		if (Math.hypot(x - (x0 + PANEL / 2 - 10), y - 240) < 118) continue;
		dots.push([x, y]);
	}
	return dots;
};

/** A red blood cell from the side-on view textbooks use: a disc with a pale centre; it rounds up as it swells, puckers as it shrinks. */
const BloodCell: React.FC<{cx: number; cy: number; change: number}> = ({cx, cy, change}) => {
	// change: +1 swollen to a sphere, 0 normal, −1 shrunk and crenated.
	const rx = 72 + (change > 0 ? 14 * change : 20 * change);
	const ry = 48 + (change > 0 ? 38 * change : 14 * change);
	const spikes = change < 0 ? -change : 0;
	const outline = Array.from({length: 36}, (_, k) => {
		const a = (k / 36) * Math.PI * 2;
		const r = 1 + (k % 2 === 0 ? 0.09 : -0.04) * spikes;
		return `${(cx + rx * r * Math.cos(a)).toFixed(1)},${(cy + ry * r * Math.sin(a)).toFixed(1)}`;
	}).join(' ');
	return (
		<g>
			<polygon points={outline} fill={RBC} stroke="#9E2F29" strokeWidth={3} strokeLinejoin="round" strokeDasharray={change > 0.9 ? '10 6' : undefined} />
			<ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.42 * (1 - Math.max(0, change))} fill={RBC_LIGHT} opacity={0.85} />
		</g>
	);
};

/** A plant cell: the wall stays; the protoplast (membrane, cytoplasm, vacuole) swells against it or pulls away from it. */
const PlantCell: React.FC<{cx: number; cy: number; change: number; lesson: string}> = ({cx, cy, change, lesson}) => {
	const half = 82;
	const inset = change >= 0 ? 9 - 5 * change : 9 + 34 * -change;
	const round = change >= 0 ? 12 : 12 + 40 * -change;
	const vacuoleScale = 0.62 + 0.14 * change;
	return (
		<g>
			<rect x={cx - half} y={cy - half} width={half * 2} height={half * 2} rx={14} fill={withAlpha(C.wall, 0.35)} stroke={C.wallEdge} strokeWidth={9} />
			<rect x={cx - half + inset} y={cy - half + inset} width={(half - inset) * 2} height={(half - inset) * 2} rx={round} fill={C.cytoplasm} stroke={lesson} strokeWidth={3.5} />
			<ellipse cx={cx + 4} cy={cy + 6} rx={(half - inset) * vacuoleScale} ry={(half - inset) * vacuoleScale * 0.9} fill={C.vacuole} stroke={C.vacuoleEdge} strokeWidth={2.5} />
			<circle cx={cx - (half - inset) * 0.6} cy={cy - (half - inset) * 0.55} r={11} fill={C.nucleus} stroke={C.nucleusEdge} strokeWidth={2} />
			{[[-0.55, 0.45], [0.55, -0.6], [0.6, 0.55]].map(([fx, fy], i) => (
				<ellipse key={i} cx={cx + (half - inset) * fx} cy={cy + (half - inset) * fy} rx={11} ry={6} fill={C.chloroplast} stroke={C.chloroplastEdge} strokeWidth={1.5} />
			))}
		</g>
	);
};

/** Net water arrows around the cell: inward, outward, or both ways alike, their dashes running the way the water goes. */
const WaterArrows: React.FC<{cx: number; cy: number; water: number; t: number; strength: number}> = ({cx, cy, water, t, strength}) => {
	const directions = [0, 90, 180, 270];
	const run = (t * 40) % 24;
	return (
		<g opacity={strength}>
			{directions.flatMap((angle) => {
				const a = (angle * Math.PI) / 180;
				const near = 112;
				const far = 150;
				const p = (r: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
				const arrow = (from: number, to: number, key: string, offset = 0) => {
					const [x1, y1] = p(from);
					const [x2, y2] = p(to);
					const perpendicular = [-Math.sin(a) * offset, Math.cos(a) * offset];
					return <line key={key} x1={x1 + perpendicular[0]} y1={y1 + perpendicular[1]} x2={x2 + perpendicular[0]} y2={y2 + perpendicular[1]} stroke={WATER} strokeWidth={5} strokeLinecap="round" strokeDasharray="12 12" strokeDashoffset={-run} markerEnd="url(#tonicityArrow)" />;
				};
				if (water > 0) return [arrow(far, near, `i${angle}`)];
				if (water < 0) return [arrow(near, far, `o${angle}`)];
				return [arrow(far, near + 4, `a${angle}`, -9), arrow(near + 4, far, `b${angle}`, 9)];
			})}
		</g>
	);
};

const Panel: React.FC<{visual: Tonicity; medium: Medium; index: number; delay: number}> = ({visual, medium, index, delay}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const look = usePartLook(`p${index + 1}`, easeFrom(seconds, delay + index * 0.35, 0.6));
	const t = Math.max(0, seconds - delay);
	const info = MEDIUM[medium];
	const x0 = 20 + index * PANEL;
	const cx = x0 + PANEL / 2 - 10;
	const cy = 240;
	const change = info.water * easeFrom(seconds, delay + 1.2 + index * 0.35, 2.6);
	const lit = look.focused;
	const [result, detail] = RESULT[visual.cell][medium];
	const dots = solutes(info.solutes, x0, 97 + index * 31);
	return (
		<g opacity={look.opacity}>
			<path d={`M${x0 + 18} 92 V372 Q${x0 + 18} 400 ${x0 + 46} 400 H${x0 + PANEL - 66} Q${x0 + PANEL - 38} 400 ${x0 + PANEL - 38} 372 V92`} fill={withAlpha(WATER, info.shade)} stroke={lit > 0.5 ? palette.lesson : palette.axis} strokeWidth={3 + 2 * lit} />
			{dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={withAlpha('#2E3A55', 0.55)} />)}
			{visual.cell === 'animal' ? <BloodCell cx={cx} cy={cy} change={change} /> : <PlantCell cx={cx} cy={cy} change={change} lesson={palette.lesson} />}
			<WaterArrows cx={cx} cy={cy} water={info.water} t={t} strength={easeFrom(seconds, delay + 0.9 + index * 0.35, 0.5)} />
			<text x={cx} y={46} textAnchor="middle" fontSize={30 * (1 + 0.08 * lit)} fontWeight={800} fill={lit > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody}>
				{visual.numbered ? `${ROMAN[index]}. kap` : info.title}
			</text>
			{visual.numbered ? null : (
				<g>
					<text x={cx} y={78} textAnchor="middle" fontSize={20} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody}>{info.note}</text>
					<text x={cx} y={446} textAnchor="middle" fontSize={27} fontWeight={800} fill={lit > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody} opacity={easeFrom(seconds, delay + 2.4 + index * 0.35, 0.5)}>{result}</text>
					<text x={cx} y={480} textAnchor="middle" fontSize={20} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody} opacity={easeFrom(seconds, delay + 2.6 + index * 0.35, 0.5)}>{detail}</text>
				</g>
			)}
		</g>
	);
};

/**
 * Osmosis made visible: one beaker per medium (`hipotonik` dilute, `izotonik` equal, `hipertonik` dense, darker
 * with more solute), a red blood cell or a plant cell in each, blue arrows for the net water flow, and the cell
 * changing as the water moves: the blood cell swells (and may burst) or shrinks; the plant cell's protoplast
 * presses on its wall (turgor) or pulls away from it (plasmolysis). Parts p1… (the beakers). `numbered` names the
 * beakers I., II., III. and hides the results: a question's figure.
 */
export const TonicityVisual: React.FC<VisualBoxProps & {visual: Tonicity}> = ({visual, width, height, delaySeconds = 0}) => {
	const stage = tonicityStage(visual.media.length);
	return (
		<World width={width} height={height} viewWidth={stage.width} viewHeight={stage.height}>
			<defs>
				<marker id="tonicityArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
					<path d="M0 0 L10 5 L0 10 Z" fill={WATER} />
				</marker>
			</defs>
			{visual.media.map((medium, index) => (
				<Panel key={medium} visual={visual} medium={medium} index={index} delay={delaySeconds} />
			))}
		</World>
	);
};
