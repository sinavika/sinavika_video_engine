import React from 'react';
import {clamp01, easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps, useFigureFont} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';
import {KINSHIP_PARENT, KINSHIP_ROLES, type KinshipRole} from './CivicsSchema';
import {FigureText} from '../VisualWorld';
import {textWidth} from '../FigureLabel';

type Kinship = Extract<CourseVisual, {kind: 'kinship'}>;

const CAPTIONS: Readonly<Record<KinshipRole, string>> = {
	dede: 'Dede',
	baba: 'Baba',
	amca: 'Amca',
	kayinpeder: 'Kayınpeder',
	esinKardesi: 'Eşin kardeşi',
	es: 'Eş',
	ego: 'Kendisi',
	kardes: 'Kardeş',
	kuzen: 'Kuzen',
	cocuk: 'Çocuk',
	yegen: 'Yeğen',
	torun: 'Torun',
};

/** Where each person stands: a column (0–5) and a generation (0 the grandfather's, 4 the grandchild's). */
const PLACE: Readonly<Record<KinshipRole, readonly [number, number]>> = {
	dede: [3.5, 0],
	kayinpeder: [1, 1],
	baba: [2.5, 1],
	amca: [4.5, 1],
	esinKardesi: [0.5, 2],
	es: [1.5, 2],
	ego: [2.5, 2],
	kardes: [3.5, 2],
	kuzen: [4.5, 2],
	cocuk: [2, 3],
	yegen: [3.5, 3],
	torun: [2, 4],
};

type KinshipDegree = {
	/** "kan": by birth; "kayın": the spouse's blood relative; "yok": the spouse, no relative. */
	kind: 'kan' | 'kayın' | 'yok';
	degree: number;
	line: 'üstsoy' | 'altsoy' | 'yansoy' | '';
	half: boolean;
	/** The steps from ego to the person, each a pair of roles; the marriage step (ego to spouse) is not counted. */
	steps: readonly (readonly [KinshipRole, KinshipRole])[];
	counted: number;
};

const ancestors = (role: KinshipRole): KinshipRole[] => {
	const chain: KinshipRole[] = [role];
	for (let parent = KINSHIP_PARENT[role]; parent; parent = KINSHIP_PARENT[parent]) chain.push(parent);
	return chain;
};

/** Blood kinship between two people: up from `from` to the common ancestor, down to `to`, one degree a birth. */
const bloodPath = (from: KinshipRole, to: KinshipRole) => {
	const up = ancestors(from);
	const theirs = ancestors(to);
	const common = theirs.find((role) => up.includes(role));
	if (!common) return undefined;
	const rising = up.slice(0, up.indexOf(common) + 1);
	const falling = theirs.slice(0, theirs.indexOf(common) + 1).reverse();
	const route = [...rising, ...falling.slice(1)];
	const steps = route.slice(1).map((role, index) => [route[index], role] as const);
	const line: KinshipDegree['line'] = common === to ? 'üstsoy' : common === from ? 'altsoy' : 'yansoy';
	return {steps, line};
};

/**
 * The kinship between ego and a role, as the Medeni Kanun counts it. The spouse is no relative; the spouse's blood
 * relatives are ego's relatives by marriage in the same line and degree as they are the spouse's.
 */
export const kinshipDegree = (role: KinshipRole, half = false): KinshipDegree => {
	if (role === 'ego') return {kind: 'yok', degree: 0, line: '', half: false, steps: [], counted: 0};
	if (role === 'es') return {kind: 'yok', degree: 0, line: '', half: false, steps: [['ego', 'es']], counted: 0};
	const marriage = role === 'kayinpeder' || role === 'esinKardesi';
	const path = bloodPath(marriage ? 'es' : 'ego', role);
	if (!path) return {kind: 'yok', degree: 0, line: '', half: false, steps: [], counted: 0};
	const steps = marriage ? [['ego', 'es'] as const, ...path.steps] : path.steps;
	// A half sibling shares one parent: the line through the sibling is of half blood.
	const throughSibling = path.steps.some(([a, b]) => a === 'kardes' || b === 'kardes');
	return {kind: marriage ? 'kayın' : 'kan', degree: path.steps.length, line: path.line, half: half && !marriage && throughSibling, steps, counted: path.steps.length};
};

/** "3. derece yansoy kan hısmı": the degree as the law names it. */
export const kinshipCaption = (result: KinshipDegree): string =>
	result.kind === 'yok' ? 'Eş: hısım değil' : `${result.degree}. derece ${result.line} ${result.half ? 'yarım ' : ''}${result.kind} hısmı`;

const STEP_SECONDS = 0.55;

/**
 * A family tree that counts kinship (hısımlık): the father's line up to the grandfather, the spouse's family beside
 * it, children and grandchildren below. When a beat points at a person the path from "Kendisi" lights up step by
 * step, each birth numbered 1, 2, 3 at its line, the marriage line drawn dashed and not counted; then the person's
 * box names the degree ("3. derece yansoy kan hısmı"). Without beats the tree stands with no path.
 */
export const KinshipVisual: React.FC<VisualBoxProps & {visual: Kinship}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const captionSize = useFigureFont()(u(26));
	const seconds = useSceneSeconds();
	const looks = KINSHIP_ROLES.map((role) => useElementState(role));
	const starts = KINSHIP_ROLES.map((role) => useBeatStartFor(role, 'focus'));
	const appear = useReveal(delaySeconds, 0.6);
	const hidden = new Set<KinshipRole>(visual.hide);
	const shown = KINSHIP_ROLES.filter((role) => !hidden.has(role));

	const columns = 5;
	const rows = 5;
	// Boxes fill most of their column and row: a question's small figure stays readable (first draft: square cells
	// left 'Kayınpeder' in a box a third of the column wide, KPSS Vatandaşlık 1).
	const columnWidth = width / columns;
	const rowHeight = height / rows;
	const boxWidth = Math.max(u(60), columnWidth * 0.84);
	const boxHeight = Math.max(u(36), Math.min(rowHeight * 0.6, boxWidth * 0.5));
	const at = (role: KinshipRole): [number, number] => {
		const [column, row] = PLACE[role];
		return [column * columnWidth, (row + 0.5) * rowHeight];
	};
	const fontSize = Math.min(u(34), boxHeight * 0.34, (boxWidth / 12) * 1.6);
	const nameSize = fontSize * 0.82;

	// Lines: parent to child as an elbow, the marriage as a double line; the child of ego and the spouse hangs from it.
	const linePath = (parent: KinshipRole, child: KinshipRole): string => {
		const [px, py] = parent === 'ego' && !hidden.has('es') && child === 'cocuk' ? [(at('ego')[0] + at('es')[0]) / 2, at('ego')[1]] : at(parent);
		const [cx, cy] = at(child);
		const top = py + (parent === 'ego' && child === 'cocuk' && !hidden.has('es') ? 0 : boxHeight / 2);
		const middle = (top + cy - boxHeight / 2) / 2;
		return `M${px} ${top} V${middle} H${cx} V${cy - boxHeight / 2}`;
	};
	const stepMiddle = (a: KinshipRole, b: KinshipRole): [number, number] => {
		const [parent, child] = KINSHIP_PARENT[b] === a ? [a, b] : [b, a];
		const [cx, cy] = at(child);
		const [px] = parent === 'ego' && child === 'cocuk' && !hidden.has('es') ? [(at('ego')[0] + at('es')[0]) / 2] : at(parent);
		const middleY = (at(parent)[1] + boxHeight / 2 + cy - boxHeight / 2) / 2;
		return [(px + cx) / 2, middleY];
	};

	// The person a beat points at now: the latest started focus among the emphasised.
	const focused = KINSHIP_ROLES.map((role, index) => ({role, index, start: starts[index], emphasis: looks[index].emphasis}))
		.filter((item) => item.emphasis > 0.5 && item.start !== undefined && !hidden.has(item.role))
		.sort((a, b) => (b.start ?? 0) - (a.start ?? 0))[0];
	const result = focused ? kinshipDegree(focused.role, visual.half) : undefined;
	const pathStart = focused?.start ?? 0;
	const onPath = new Set(result?.steps.map(([a, b]) => `${a}>${b}`) ?? []);
	const stepShown = (index: number) => easeFrom(seconds, pathStart + 0.2 + index * STEP_SECONDS, 0.35);
	const captionShown = result ? easeFrom(seconds, pathStart + 0.3 + result.steps.length * STEP_SECONDS, 0.4) : 0;

	const marriageShown = !hidden.has('es');
	const [ex, ey] = at('ego');
	const [sx, sy] = at('es');

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}} opacity={appear}>
			{/* Family lines. */}
			{shown.flatMap((role) => {
				const parent = KINSHIP_PARENT[role];
				if (!parent || hidden.has(parent)) return [];
				return [<path key={`l-${role}`} d={linePath(parent, role)} fill="none" stroke={withAlpha(palette.ink, 0.28)} strokeWidth={u(4)} />];
			})}
			{marriageShown ? (
				<g>
					<line x1={sx + boxWidth / 2} y1={sy - u(6)} x2={ex - boxWidth / 2} y2={ey - u(6)} stroke={withAlpha(palette.ink, 0.35)} strokeWidth={u(3)} />
					<line x1={sx + boxWidth / 2} y1={sy + u(6)} x2={ex - boxWidth / 2} y2={ey + u(6)} stroke={withAlpha(palette.ink, 0.35)} strokeWidth={u(3)} />
				</g>
			) : null}
			{/* The counted path: each birth lights up in order and gets its number; the marriage step is dashed. */}
			{result
				? result.steps.map(([a, b], index) => {
						const shownAmount = stepShown(index);
						if (shownAmount <= 0.01) return null;
						const marriage = (a === 'ego' && b === 'es') || (a === 'es' && b === 'ego');
						if (marriage)
							return <line key={`p${index}`} x1={ex - boxWidth / 2} y1={ey} x2={ex - boxWidth / 2 - (ex - sx - boxWidth) * shownAmount} y2={ey} stroke={palette.lesson} strokeWidth={u(8)} strokeDasharray={`${u(14)} ${u(10)}`} strokeLinecap="round" />;
						const [parent, child] = KINSHIP_PARENT[b] === a ? [a, b] : [b, a];
						return <path key={`p${index}`} d={linePath(parent, child)} fill="none" stroke={palette.lesson} strokeWidth={u(9)} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - shownAmount} />;
					})
				: null}
			{/* The step numbers go over every line: the next step's line ran through the "1" (KPSS Vatandaşlık 1). */}
			{result
				? result.steps.map(([a, b], index) => {
						const shownAmount = stepShown(index);
						const marriage = (a === 'ego' && b === 'es') || (a === 'es' && b === 'ego');
						if (shownAmount <= 0.01 || marriage) return null;
						const counted = result.steps.slice(0, index + 1).filter(([x, y]) => !((x === 'ego' && y === 'es') || (x === 'es' && y === 'ego'))).length;
						const [mx, my] = stepMiddle(a, b);
						return (
							<g key={`n${index}`}>
								<g opacity={clamp01(shownAmount * 2 - 0.6)}>
									<circle cx={mx} cy={my} r={Math.min(u(26), rowHeight * 0.18)} fill={palette.lesson} stroke={palette.surface} strokeWidth={u(4)} />
									<FigureText x={mx} y={my + Math.min(u(26), rowHeight * 0.18) * 0.38} textAnchor="middle" fill={palette.onLesson} style={{fontFamily: palette.fontBody, fontWeight: 800, fontSize: Math.min(u(28), rowHeight * 0.2)}}>
										{counted}
									</FigureText>
								</g>
							</g>
						);
					})
				: null}
			{/* People. */}
			{shown.map((role) => {
				const index = KINSHIP_ROLES.indexOf(role);
				const look = looks[index];
				const [x, y] = at(role);
				const ego = role === 'ego';
				const target = focused?.role === role;
				const lit = ego || target || (result ? [...onPath].some((pair) => pair.split('>').includes(role)) : false);
				const name = visual.names[role];
				return (
					<g key={role} opacity={1 - UNFOCUSED_FADE * look.dim * (lit ? 0 : 1)}>
						<rect
							x={x - boxWidth / 2}
							y={y - boxHeight / 2}
							width={boxWidth}
							height={boxHeight}
							rx={u(18)}
							fill={ego ? palette.lesson : target ? withAlpha(palette.lesson, 0.18) : palette.surface}
							stroke={ego || target ? palette.lesson : palette.border}
							strokeWidth={u(ego || target ? 5 : 3)}
						/>
						<FigureText x={x} y={y + (name ? -nameSize * 0.25 : fontSize * 0.36)} textAnchor="middle" fill={ego ? palette.onLesson : palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 800, fontSize}}>
							{CAPTIONS[role]}
						</FigureText>
						{name ? (
							<FigureText x={x} y={y + nameSize * 1.05} textAnchor="middle" fill={ego ? palette.onLesson : palette.muted} style={{fontFamily: palette.fontBody, fontWeight: 700, fontSize: nameSize}}>
								{name}
							</FigureText>
						) : null}
						{role === 'kardes' && visual.half ? (
							<FigureText x={x} y={y + boxHeight / 2 + u(28)} textAnchor="middle" fill={palette.muted} style={{fontFamily: palette.fontBody, fontWeight: 700, fontSize: nameSize * 0.9}}>
								yarım kan
							</FigureText>
						) : null}
					</g>
				);
			})}
			{/* The degree, as the law names it, on a plate under the person. */}
			{result && focused && captionShown > 0.01
				? (() => {
						const text = kinshipCaption(result);
						const [x, y] = at(focused.role);
						const plateWidth = textWidth(text, captionSize) + u(40);
						const below = y + boxHeight / 2 + u(54) < height - u(8);
						const plateY = below ? y + boxHeight / 2 + u(14) : y - boxHeight / 2 - u(58);
						const plateX = Math.max(plateWidth / 2 + u(4), Math.min(width - plateWidth / 2 - u(4), x));
						return (
							<g opacity={captionShown}>
								<rect x={plateX - plateWidth / 2} y={plateY} width={plateWidth} height={u(44)} rx={u(22)} fill={palette.ink} />
								<FigureText x={plateX} y={plateY + u(30)} textAnchor="middle" fill={palette.surface} style={{fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(26)}}>
									{text}
								</FigureText>
							</g>
						);
					})()
				: null}
		</svg>
	);
};
