import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {FOOD_WEB_ROW, foodWebNodeWidth, TROPHIC_NAMES} from './Ecology';

// ---------------------------------------------------------------- food chains and food webs

type FoodWeb = Extract<CourseVisual, {kind: 'foodweb'}>;
type Organism = FoodWeb['organisms'][number];

const ROW = 124;
const NODE_H = 66;
const TOP = 36;
const LABELS = 300;

/**
 * Where each organism sits: one row per trophic level (producers at the bottom), spread evenly in its row. The chart
 * is as wide as its fullest row needs (each organism a slot as wide as the widest name, up to 1100): a web of two or
 * three a row stays compact, so in a question's narrow figure its names stay large.
 */
export const foodWebLayout = (visual: FoodWeb) => {
	const top = Math.max(...visual.organisms.map((organism) => organism.level));
	const left = visual.levels ? LABELS : 0;
	const rows = Array.from({length: top}, (_, k) => visual.organisms.filter((organism) => organism.level === k + 1));
	const slot = Math.max(...visual.organisms.map((organism) => foodWebNodeWidth(organism.label))) + 70;
	const chart = Math.min(FOOD_WEB_ROW, Math.max(560, ...rows.map((row) => row.length * slot)));
	const rowY = (level: number) => TOP + (top - level) * ROW + NODE_H / 2;
	const spots = new Map<string, {x: number; y: number; w: number}>();
	rows.forEach((row, k) => row.forEach((organism, i) => spots.set(organism.id, {x: left + ((i + 0.5) * chart) / row.length, y: rowY(k + 1), w: foodWebNodeWidth(organism.label)})));
	return {spots, rowY, top, left, width: left + chart + 20, height: TOP + (top - 1) * ROW + NODE_H + 30};
};

/**
 * A food web as ÖSYM draws it: organisms in rows by trophic level, producers at the bottom, an arrow from each food to
 * the one that eats it (the way energy flows). A single chain is a web with one organism a row. With `levels` the
 * rows are named on the left (Üreticiler … Dördüncül tüketiciler). Rows come in from the bottom; a beat that points
 * at an organism lights it and its arrows. Parts: the organisms' ids and t1… (the rows).
 */
export const FoodWebVisual: React.FC<VisualBoxProps & {visual: FoodWeb}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const layout = foodWebLayout(visual);
	const arrival = (level: number) => easeFrom(seconds, delaySeconds + 0.2 + (level - 1) * 0.55, 0.5);
	const byId = new Map(visual.organisms.map((organism) => [organism.id, organism]));
	// Arrows leave a node's top and reach a node's bottom side by side, not all through one point.
	const outgoing = (id: string) => visual.links.filter(([food]) => food === id);
	const incoming = (id: string) => visual.links.filter(([, eater]) => eater === id);
	const offset = (list: [string, string][], link: [string, string], w: number) => {
		const index = list.indexOf(link);
		const step = Math.min(34, w / (list.length + 1));
		return (index - (list.length - 1) / 2) * step;
	};
	return (
		<World width={width} height={height} viewWidth={layout.width} viewHeight={layout.height}>
			<defs>
				<marker id="foodWebArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
					<path d="M0 0 L10 5 L0 10 Z" fill={withAlpha(palette.ink, 0.6)} />
				</marker>
				<marker id="foodWebArrowLit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
					<path d="M0 0 L10 5 L0 10 Z" fill={palette.lesson} />
				</marker>
			</defs>
			{visual.levels
				? Array.from({length: layout.top}, (_, k) => k + 1).map((level) => <LevelName key={level} level={level} y={layout.rowY(level)} entrance={arrival(level)} />)
				: null}
			{visual.links.map((link, index) => {
				const [food, eater] = link;
				const from = layout.spots.get(food)!;
				const to = layout.spots.get(eater)!;
				return (
					<Arrow
						key={index}
						food={byId.get(food)!}
						eater={byId.get(eater)!}
						x1={from.x + offset(outgoing(food), link, from.w)}
						y1={from.y - NODE_H / 2}
						x2={to.x + offset(incoming(eater), link, to.w)}
						y2={to.y + NODE_H / 2 + 4}
						entrance={arrival(byId.get(eater)!.level + 0.4)}
					/>
				);
			})}
			{visual.organisms.map((organism) => {
				const spot = layout.spots.get(organism.id)!;
				return <Node key={organism.id} organism={organism} x={spot.x} y={spot.y} w={spot.w} entrance={arrival(organism.level)} />;
			})}
		</World>
	);
};

const LevelName: React.FC<{level: number; y: number; entrance: number}> = ({level, y, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`t${level}`, entrance);
	return (
		<text x={12} y={y + 9} fontSize={26} fontWeight={look.focused > 0.5 ? 800 : 700} fill={look.focused > 0.5 ? palette.lesson : palette.muted} fontFamily={palette.fontBody} opacity={look.opacity}>
			{TROPHIC_NAMES[level - 1]}
		</text>
	);
};

/** An organism lights with its own part or its row's. */
const useOrganismLook = (organism: Organism, entrance: number) => {
	const own = usePartLook(organism.id, entrance);
	const row = usePartLook(`t${organism.level}`, entrance);
	return {opacity: Math.max(own.opacity, row.opacity), focused: Math.max(own.focused, row.focused)};
};

const Node: React.FC<{organism: Organism; x: number; y: number; w: number; entrance: number}> = ({organism, x, y, w, entrance}) => {
	const palette = useVisualPalette();
	const look = useOrganismLook(organism, entrance);
	const lit = look.focused;
	const producer = organism.level === 1;
	return (
		<g opacity={look.opacity} transform={`translate(${x} ${y}) scale(${(0.85 + 0.15 * entrance) * (1 + 0.06 * lit)}) translate(${-x} ${-y})`}>
			<rect x={x - w / 2} y={y - NODE_H / 2} width={w} height={NODE_H} rx={NODE_H / 2} fill={lit > 0.5 ? palette.lesson : producer ? withAlpha(palette.lesson, 0.22) : palette.surface} stroke={palette.lesson} strokeWidth={3} />
			<text x={x} y={y + 10} textAnchor="middle" fontSize={30} fontWeight={800} fill={lit > 0.5 ? palette.onLesson : palette.ink} fontFamily={palette.fontBody}>
				{organism.label}
			</text>
		</g>
	);
};

const Arrow: React.FC<{food: Organism; eater: Organism; x1: number; y1: number; x2: number; y2: number; entrance: number}> = ({food, eater, x1, y1, x2, y2, entrance}) => {
	const palette = useVisualPalette();
	const from = useOrganismLook(food, entrance);
	const to = useOrganismLook(eater, entrance);
	const lit = Math.max(from.focused, to.focused);
	return (
		<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lit > 0.5 ? palette.lesson : withAlpha(palette.ink, 0.6)} strokeWidth={lit > 0.5 ? 5 : 3} markerEnd={lit > 0.5 ? 'url(#foodWebArrowLit)' : 'url(#foodWebArrow)'} opacity={entrance * Math.max(from.opacity, to.opacity)} />
	);
};
