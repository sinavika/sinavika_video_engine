import React, {useId, useMemo} from 'react';
import {Easing, interpolate} from 'remotion';
import {NATURE_COLORS as C} from '../../Configurations/NatureColors';
import {withAlpha} from '../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {useStageClock} from './VisualTimeline';
import type {CourseVisual} from './VisualSchemas';

type River = Extract<CourseVisual, {kind: 'river'}>;
type Earthquake = Extract<CourseVisual, {kind: 'earthquake'}>;

/**
 * Natural processes shown as they happen, stage by stage. Each visual draws
 * in a 1000 x 600 world fitted into its box; the stage strip at the top names
 * the stages and marks the one being told. Stages follow the card's beats or,
 * without beats, play one after another.
 */

const W = 1000;
const H = 600;
const TOP = 70; // the stage strip

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => Easing.bezier(0.33, 0, 0.2, 1)(clamp01(value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** A colour between two hex colours. */
const mixColor = (from: string, to: string, t: number) => {
	const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
	const [a, b] = [channels(from), channels(to)];
	return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], clamp01(t)))).join(',')})`;
};
const pathOf = (points: readonly (readonly [number, number])[], close = false) => points.map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ') + (close ? ' Z' : '');

/** The world, fitted into the box with its proportions kept. */
const World: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => (
	<svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible'}}>
		{children}
	</svg>
);

/** The stages as chips, the current one in the lesson colour, with a bar for how far it has gone. */
const StageStrip: React.FC<{names: readonly string[]; stage: number; progress: number}> = ({names, stage, progress}) => {
	const palette = useVisualPalette();
	const gap = 12;
	const chip = (W - gap * (names.length - 1)) / names.length;
	return (
		<g fontFamily={palette.fontDisplay}>
			{names.map((name, index) => {
				const x = index * (chip + gap);
				const active = index === stage;
				const done = index < stage;
				return (
					<g key={name}>
						<rect x={x} y={8} width={chip} height={44} rx={22} fill={active ? palette.lesson : done ? withAlpha(palette.lesson, 0.22) : withAlpha(palette.ink, 0.07)} />
						{active ? <rect x={x} y={46} width={chip * progress} height={6} rx={3} fill={withAlpha(palette.onLesson, 0.7)} /> : null}
						<text x={x + chip / 2} y={37} textAnchor="middle" fontSize={names.length > 4 ? 20 : 22} fontWeight={800} fill={active ? palette.onLesson : palette.ink}>
							{`${index + 1}. ${name}`}
						</text>
					</g>
				);
			})}
		</g>
	);
};

const Label: React.FC<{x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; show?: number; size?: number; color?: string}> = ({x, y, children, anchor = 'middle', show = 1, size = 24, color}) => {
	const palette = useVisualPalette();
	if (show <= 0) return null;
	return (
		<text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={800} fill={color ?? palette.ink} opacity={show} fontFamily={palette.fontBody} paintOrder="stroke" stroke={palette.surface} strokeWidth={size * 0.28} strokeLinejoin="round">
			{children}
		</text>
	);
};

// ---------------------------------------------------------------- rivers

export const RiverVisual: React.FC<VisualBoxProps & {visual: River}> = (props) => {
	switch (props.visual.view) {
		case 'profile':
			return <RiverProfile {...props} />;
		case 'meander':
			return <Meander {...props} />;
		case 'delta':
			return <Delta {...props} />;
	}
};

const PROFILE_STAGES = ['Yer şekli', 'Akış', 'Aşındırma', 'Taşıma', 'Biriktirme'] as const;
const SEA_LEVEL = 470;
const MOUTH_X = 800;

/** Height of the land along the river (concave profile: steep at the source, gentle near the mouth), before erosion. */
const groundAt = (x: number) => {
	const t = clamp01(x / MOUTH_X);
	return lerp(TOP + 70, SEA_LEVEL, 1 - (1 - t) ** 2.4);
};

/** How much the bed is lowered at x when erosion has gone `amount` (0-1): most in the upper course. */
const cutAt = (x: number, amount: number) => amount * 46 * Math.exp(-(((x - 250) / 170) ** 2));

/**
 * A river from source to sea, side view: the land rises at the source and
 * flattens near the mouth. The water flows faster where the slope is steep;
 * it cuts down in the upper course (the V valley beside it deepens), carries
 * its load (boulders roll on the bed, sand hops, silt floats) and lays it down
 * where it slows: the flood plain and the mouth.
 */
const RiverProfile: React.FC<VisualBoxProps & {visual: River}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const clipId = `river${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const {stage, progress} = useStageClock(PROFILE_STAGES.length, {delaySeconds});
	const time = Math.max(0, seconds - delaySeconds);
	const drawn = stage > 0 ? 1 : smooth(progress * 1.4);
	const flowing = stage >= 1 ? (stage === 1 ? smooth(progress * 2) : 1) : 0;
	const eroded = stage >= 2 ? (stage === 2 ? smooth(progress) : 1) : 0;
	const carrying = stage >= 3 ? (stage === 3 ? smooth(progress * 1.5) : 1) : 0;
	const deposited = stage >= 4 ? smooth(progress) : 0;

	const xs = useMemo(() => Array.from({length: 121}, (_, index) => (index / 120) * MOUTH_X), []);
	const bed = xs.map((x) => [x, groundAt(x) + cutAt(x, eroded)] as const);
	const surfaceLine = [...bed, [MOUTH_X + 1, SEA_LEVEL] as const];
	const landShape = [...surfaceLine, [MOUTH_X, H] as const, [0, H] as const];
	const depositShape = deposited > 0 ? [[MOUTH_X - 140, groundAt(MOUTH_X - 140)] as const, [MOUTH_X, SEA_LEVEL - 6 * deposited] as const, [MOUTH_X + 120 * deposited, SEA_LEVEL + 4] as const, [MOUTH_X + 150 * deposited, SEA_LEVEL + 40 * deposited] as const, [MOUTH_X - 40, SEA_LEVEL + 46] as const] : [];
	const plain = deposited > 0 ? [...xs.filter((x) => x > 470).map((x) => [x, groundAt(x) - 10 * deposited] as const), ...xs.filter((x) => x > 470).reverse().map((x) => [x, groundAt(x) + 2] as const)] : [];

	// Particles moving with the water: speed follows the slope; boulders stop where the land flattens.
	const slopeAt = (x: number) => Math.max(0.02, (groundAt(x + 4) - groundAt(x)) / 4);
	const loads = useMemo(
		() => [
			{kind: 'boulder', count: 5, size: 11, color: C.gravel, speed: 0.55, until: 330},
			{kind: 'sand', count: 9, size: 6, color: C.sand, speed: 0.9, until: 720},
			{kind: 'silt', count: 14, size: 3.2, color: C.silt, speed: 1.3, until: MOUTH_X + 150},
		],
		[],
	);

	return (
		<World width={width} height={height}>
			<StageStrip names={PROFILE_STAGES} stage={stage} progress={progress} />
			<clipPath id={clipId}>
				<rect x={0} y={TOP} width={W * drawn} height={H} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				<rect x={MOUTH_X} y={SEA_LEVEL} width={W - MOUTH_X} height={H - SEA_LEVEL} fill={C.waterLight} />
				<path d={pathOf(landShape, true)} fill={C.rock[0]} />
				{[1, 2, 3].map((band) => (
					<path key={band} d={pathOf([...xs.map((x) => [x, groundAt(x) + 40 + band * 34] as const), [MOUTH_X, H] as const, [0, H] as const], true)} fill={C.rock[band]} opacity={0.9} />
				))}
				<path d={pathOf(bed)} fill="none" stroke={C.landDark} strokeWidth={8} />
				{/* the land before the river cut into it: the gap is what erosion took */}
				{eroded > 0 ? <path d={pathOf(xs.filter((x) => x > 60 && x < 470).map((x) => [x, groundAt(x)] as const))} fill="none" stroke={palette.ink} strokeWidth={3} strokeDasharray="10 8" opacity={0.7 * eroded} /> : null}
				{plain.length ? <path d={pathOf(plain, true)} fill={C.silt} /> : null}
				{depositShape.length ? <path d={pathOf(depositShape, true)} fill={C.sand} stroke={withAlpha(C.gravel, 0.6)} strokeWidth={2} /> : null}
				{flowing > 0 ? (
					<g opacity={flowing}>
						<path d={pathOf(bed.filter(([x]) => x <= MOUTH_X * flowing + 5))} fill="none" stroke={C.water} strokeWidth={10} strokeLinecap="round" />
						{Array.from({length: 26}, (_, index) => {
							// Flow marks: dashes that run faster down the steep upper course.
							let x = ((index / 26) * MOUTH_X) % MOUTH_X;
							for (let step = 0; step < 30; step++) x = (x + slopeAt(x) * time * 7) % MOUTH_X;
							return <circle key={index} cx={x} cy={groundAt(x) + cutAt(x, eroded) - 2} r={3} fill="#FFFFFF" opacity={0.85} />;
						})}
					</g>
				) : null}
				{carrying > 0
					? loads.flatMap((load) =>
							Array.from({length: load.count}, (_, index) => {
								const start = (index / load.count) * load.until;
								let x = start;
								const travelled = time * 18 * load.speed;
								x = load.kind === 'boulder' ? Math.min(load.until, start + travelled * 0.4) : (start + travelled) % load.until;
								const hop = load.kind === 'sand' ? Math.abs(Math.sin(time * 4 + index)) * 10 : load.kind === 'silt' ? 9 + Math.sin(time * 2 + index) * 3 : 0;
								const y = (x > MOUTH_X ? SEA_LEVEL + 10 + index * 2 : groundAt(x) + cutAt(x, eroded)) - load.size - hop;
								return <circle key={`${load.kind}${index}`} cx={x} cy={y} r={load.size} fill={load.color} stroke={withAlpha('#000000', 0.25)} strokeWidth={1.5} opacity={carrying} />;
							}),
						)
					: null}
			</g>
			{visual.labels ? (
				<>
					<Label x={40} y={TOP + 50} anchor="start" show={drawn}>Kaynak</Label>
					<Label x={MOUTH_X + 10} y={SEA_LEVEL - 20} anchor="start" show={drawn}>Ağız</Label>
					<Label x={W - 20} y={SEA_LEVEL + 50} anchor="end" show={drawn} color={C.waterDeep}>Deniz</Label>
					<Label x={210} y={groundAt(210) - 46} show={stage === 1 ? flowing : 0} color={palette.lesson}>Eğim fazla → akış hızlı</Label>
					<Label x={600} y={groundAt(600) - 36} show={stage === 1 ? flowing : 0} color={palette.lesson}>Eğim az → akış yavaş</Label>
					<Label x={330} y={groundAt(330) + 70} show={stage === 2 ? eroded : 0} color={palette.lesson}>Yatağını derine kazar</Label>
					<Label x={430} y={groundAt(430) - 60} show={stage === 3 ? carrying : 0} color={palette.lesson}>İri yük yuvarlanır, ince yük askıda taşınır</Label>
					<Label x={MOUTH_X - 40} y={SEA_LEVEL - 70} anchor="end" show={deposited} color={palette.lesson}>Hız düşer → yük birikir</Label>
					{stage >= 2
						? (['Yukarı çığır', 'Orta çığır', 'Aşağı çığır'] as const).map((name, index) => (
								<g key={name} opacity={eroded}>
									<line x1={(index * MOUTH_X) / 3 + 8} x2={((index + 1) * MOUTH_X) / 3 - 8} y1={H - 26} y2={H - 26} stroke={palette.ink} strokeWidth={3} />
									<Label x={((index + 0.5) * MOUTH_X) / 3} y={H - 36} size={22}>{name}</Label>
								</g>
							))
						: null}
				</>
			) : null}
			{stage >= 2 ? <ValleyInset depth={eroded} widen={deposited} show={smooth((stage === 2 ? progress : 1) * 3)} /> : null}
		</World>
	);
};

/** The valley's cross-section in the upper course: a V that deepens as the river cuts down. */
const ValleyInset: React.FC<{depth: number; widen: number; show: number}> = ({depth, widen, show}) => {
	const palette = useVisualPalette();
	const [x, y, w, h] = [700, TOP + 30, 270, 170];
	const bottom = y + 40 + 90 * depth;
	const half = 18 + 10 * widen;
	return (
		<g opacity={show}>
			<rect x={x} y={y} width={w} height={h} rx={18} fill={palette.surface} stroke={palette.border} strokeWidth={3} />
			<path d={pathOf([[x + 14, y + 36], [x + w / 2 - half, bottom], [x + w / 2 + half, bottom], [x + w - 14, y + 36], [x + w - 14, y + h - 10], [x + 14, y + h - 10]], true)} fill={C.rock[1]} />
			<path d={pathOf([[x + w / 2 - half + 4, bottom - 6], [x + w / 2 + half - 4, bottom - 6]])} stroke={C.water} strokeWidth={10} strokeLinecap="round" />
			<Label x={x + w / 2} y={y + 28} size={20}>{depth > 0.5 ? 'V vadi derinleşir' : 'Vadi kesiti'}</Label>
		</g>
	);
};

const MEANDER_STAGES = ['Kıvrılma', 'Dış kıyı aşınır', 'Boyun daralır', 'Kopuk menderes'] as const;

/** A meandering channel by the Kinoshita curve: the bends grow and skew as θ0 grows. */
const meanderPath = (theta0: number): [number, number][] => {
	const points: [number, number][] = [];
	const k = (2 * Math.PI) / 330;
	let [x, y] = [0, 0];
	for (let s = 0; s <= 1500; s += 4) {
		const angle = theta0 * Math.sin(k * s) + theta0 ** 3 * (0.012 * Math.cos(3 * k * s) - 0.03 * Math.sin(3 * k * s));
		x += Math.cos(angle) * 4;
		y += Math.sin(angle) * 4;
		points.push([x, y]);
	}
	// Fitted across the world, centred vertically.
	const [minX, maxX] = [Math.min(...points.map((p) => p[0])), Math.max(...points.map((p) => p[0]))];
	const meanY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
	const scale = (W - 80) / (maxX - minX);
	return points.map(([px, py]) => [40 + (px - minX) * scale, TOP + 260 + (py - meanY) * scale]);
};

/**
 * A lowland river from above. The water is fastest on the outside of a bend,
 * which it eats away (cut bank), and slowest on the inside, where it leaves
 * sand (point bar); so the bends grow, the neck between two of them narrows,
 * and a flood cuts it: the loop left behind becomes an oxbow lake.
 */
const Meander: React.FC<VisualBoxProps & {visual: River}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const {stage, progress} = useStageClock(MEANDER_STAGES.length, {delaySeconds});
	const growth = stage === 0 ? 0.15 + 0.25 * smooth(progress) : stage === 1 ? 0.4 + 0.3 * smooth(progress) : stage === 2 ? 0.7 + 0.3 * smooth(progress) : 1;
	const theta0 = lerp(0.35, 1.95, growth);
	const path = useMemo(() => meanderPath(theta0), [theta0]);

	// The neck: two points of the channel far apart along it but close in space, around the middle loop.
	const neck = useMemo(() => {
		const full = meanderPath(1.95);
		let best = {i: 0, j: 0, d: Infinity};
		for (let i = Math.floor(full.length * 0.3); i < full.length * 0.55; i++) {
			for (let j = i + 40; j < Math.min(full.length, i + 140); j++) {
				const d = Math.hypot(full[i][0] - full[j][0], full[i][1] - full[j][1]);
				if (d < best.d) best = {i, j, d};
			}
		}
		return best;
	}, []);
	const cut = stage === 3 ? smooth(progress * 1.6) : 0;
	const channel = cut > 0 ? [...path.slice(0, neck.i + 1), ...path.slice(neck.j)] : path;
	const loop = path.slice(neck.i, neck.j + 1);

	// Bend apexes (the channel runs straight across there), with the outer side away from the valley's centre line.
	const apexes = useMemo(() => {
		const marks: {at: [number, number]; normal: [number, number]}[] = [];
		const k = (2 * Math.PI) / 330;
		for (let n = 1; n < 9; n++) {
			const index = Math.round(((n * Math.PI) / k) / 4);
			if (index <= 2 || index >= path.length - 2) continue;
			const [p, q] = [path[index - 2], path[index + 2]];
			const tangent = [q[0] - p[0], q[1] - p[1]];
			const length = Math.hypot(tangent[0], tangent[1]) || 1;
			let normal: [number, number] = [-tangent[1] / length, tangent[0] / length];
			const centreY = TOP + 260;
			if ((path[index][1] - centreY) * normal[1] < 0) normal = [-normal[0], -normal[1]];
			marks.push({at: path[index], normal});
		}
		return marks;
	}, [path]);
	const banks = stage >= 1 ? (stage === 1 ? smooth(progress * 2) : 1) : 0;

	return (
		<World width={width} height={height}>
			<StageStrip names={MEANDER_STAGES} stage={stage} progress={progress} />
			<rect x={0} y={TOP + 10} width={W} height={H - TOP - 10} rx={24} fill={withAlpha(C.land, 0.55)} />
			{/* the abandoned bend: a crescent of still water, its ends sealed by sediment */}
			{cut > 0 ? (
				<g>
					<path d={pathOf(loop)} fill="none" stroke={mixColor(C.water, C.waterLight, cut)} strokeWidth={22 - 6 * cut} strokeLinecap="round" strokeLinejoin="round" />
					{[loop[3], loop[loop.length - 4]].map((end, index) => (
						<circle key={index} cx={end[0]} cy={end[1]} r={15 * cut} fill={C.sand} />
					))}
				</g>
			) : null}
			{apexes.map(({at, normal}, index) => (
				<g key={index} opacity={banks}>
					{/* point bar: sand on the inside */}
					<ellipse cx={at[0] - normal[0] * 34} cy={at[1] - normal[1] * 34} rx={34} ry={16} transform={`rotate(${(Math.atan2(normal[1], normal[0]) * 180) / Math.PI + 90} ${at[0] - normal[0] * 34} ${at[1] - normal[1] * 34})`} fill={C.sand} />
					{/* cut bank: the outside is worn away */}
					<path d={`M${at[0] + normal[0] * 18 - normal[1] * 30} ${at[1] + normal[1] * 18 + normal[0] * 30} Q${at[0] + normal[0] * 34} ${at[1] + normal[1] * 34} ${at[0] + normal[0] * 18 + normal[1] * 30} ${at[1] + normal[1] * 18 - normal[0] * 30}`} fill="none" stroke={C.stress} strokeWidth={7} strokeLinecap="round" />
				</g>
			))}
			<path d={pathOf(channel)} fill="none" stroke={C.water} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
			{Array.from({length: 18}, (_, index) => {
				const position = Math.floor(((index / 18) * channel.length + seconds * 40) % channel.length);
				const [px, py] = channel[position];
				return <circle key={index} cx={px} cy={py} r={4} fill="#FFFFFF" opacity={0.85} />;
			})}
			{visual.labels ? (
				<>
					{apexes[0] ? <Label x={apexes[0].at[0] + apexes[0].normal[0] * 80} y={apexes[0].at[1] + apexes[0].normal[1] * 80} show={stage < 3 ? banks : 0} color={C.stress}>Dış kıyı: aşındırma</Label> : null}
					{apexes[apexes.length - 1] ? <Label x={apexes[apexes.length - 1].at[0] - apexes[apexes.length - 1].normal[0] * 30} y={apexes[apexes.length - 1].at[1] + (apexes[apexes.length - 1].normal[1] > 0 ? -150 : 160)} show={stage < 3 ? banks : 0}>İç kıyı: biriktirme</Label> : null}
					<Label x={(path[neck.i][0] + path[neck.j][0]) / 2} y={(path[neck.i][1] + path[neck.j][1]) / 2 - 40} show={stage === 2 ? smooth(progress * 2) : 0} color={palette.lesson}>Menderes boynu</Label>
					<Label x={loop.reduce((s, p) => s + p[0], 0) / loop.length} y={loop.reduce((s, p) => s + p[1], 0) / loop.length + 8} show={cut} color={C.waterDeep}>Menderes gölü</Label>
				</>
			) : null}
		</World>
	);
};

const DELTA_STAGES = ['Yük taşınır', 'Akıntı yavaşlar', 'Kollara ayrılır', 'Delta ovası'] as const;
const COAST = TOP + 230;

/**
 * A river mouth from above. Where the river meets a shallow, calm sea its
 * flow slows and the load it carries settles: the deposits build out into
 * the sea as a fan, the river splits into distributaries across it, and the
 * new land becomes a delta plain.
 */
const Delta: React.FC<VisualBoxProps & {visual: River}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const {stage, progress} = useStageClock(DELTA_STAGES.length, {delaySeconds});
	const fan = stage === 0 ? 0 : stage === 1 ? smooth(progress) * 0.55 : stage === 2 ? 0.55 + 0.35 * smooth(progress) : 0.9 + 0.1 * smooth(progress);
	const branches = stage >= 2 ? (stage === 2 ? smooth(progress * 1.4) : 1) : 0;
	const plain = stage === 3 ? smooth(progress) : 0;
	const mouth = [W / 2, COAST] as const;
	const radius = 60 + 250 * fan;
	const fanShape = Array.from({length: 41}, (_, index) => {
		const angle = Math.PI * (0.06 + 0.88 * (index / 40));
		const wobble = 1 + 0.06 * Math.sin(index * 1.7);
		return [mouth[0] + Math.cos(angle) * radius * 1.35 * wobble, mouth[1] + Math.sin(angle) * radius * wobble] as const;
	});
	const plume = 0.5 + 0.5 * Math.sin(seconds * 1.5);
	const distributaries = [-0.75, -0.3, 0.15, 0.55, 0.9].map((spread) => {
		const end = [mouth[0] + spread * radius * 1.2, mouth[1] + radius * (0.95 - Math.abs(spread) * 0.25)] as const;
		const control = [mouth[0] + spread * radius * 0.45, mouth[1] + radius * 0.45] as const;
		return `M${mouth[0]} ${mouth[1]} Q${control[0]} ${control[1]} ${mouth[0] + (end[0] - mouth[0]) * branches} ${mouth[1] + (end[1] - mouth[1]) * branches}`;
	});

	return (
		<World width={width} height={height}>
			<StageStrip names={DELTA_STAGES} stage={stage} progress={progress} />
			<rect x={0} y={TOP + 10} width={W} height={COAST - TOP - 10} fill={C.land} />
			<rect x={0} y={COAST} width={W} height={H - COAST} fill={C.waterLight} />
			<path d={`M${W / 2 - 14} ${TOP + 10} C${W / 2 - 60} ${TOP + 90} ${W / 2 + 40} ${TOP + 150} ${W / 2 - 14} ${COAST} L${W / 2 + 14} ${COAST} C${W / 2 + 70} ${TOP + 150} ${W / 2 - 30} ${TOP + 90} ${W / 2 + 14} ${TOP + 10} Z`} fill={C.water} />
			<ellipse cx={mouth[0]} cy={mouth[1] + 70 + radius * 0.4} rx={110 + radius * 1.1} ry={60 + radius * 0.5} fill={withAlpha(C.silt, 0.25 + 0.15 * plume)} />
			{fan > 0 ? <path d={pathOf([mouth, ...fanShape], true)} fill={mixColor(C.sand, C.land, plain * 0.6)} stroke={withAlpha(C.gravel, 0.5)} strokeWidth={3} /> : null}
			{distributaries.map((d, index) => (
				<path key={index} d={d} fill="none" stroke={C.water} strokeWidth={9 - Math.abs(index - 2) * 1.5} strokeLinecap="round" opacity={branches} />
			))}
			{Array.from({length: 22}, (_, index) => {
				const t = ((index / 22 + seconds * 0.12) % 1);
				const spread = Math.sin(index * 2.3) * 0.9;
				const settle = Math.min(t, 0.25 + fan * 0.6);
				return <circle key={index} cx={mouth[0] + spread * radius * settle * 1.3} cy={mouth[1] + radius * settle} r={4} fill={C.silt} opacity={1 - t * 0.7} />;
			})}
			{visual.labels ? (
				<>
					<Label x={W / 2 + 60} y={TOP + 120} anchor="start">Akarsu</Label>
					<Label x={90} y={H - 30} anchor="start" color={C.waterDeep}>Sığ ve sakin deniz</Label>
					<Label x={W / 2} y={mouth[1] + 70 + radius * 0.9} show={stage === 1 ? smooth(progress * 2) : 0} color={palette.lesson}>Hız düşer, yük çöker</Label>
					<Label x={W / 2 + radius * 1.1} y={mouth[1] + radius * 0.5} anchor="start" show={stage === 2 ? branches : 0} color={palette.lesson}>Dağıtıcı kollar</Label>
					<Label x={W / 2} y={mouth[1] + radius * 0.6} show={plain} color={palette.lesson} size={30}>Delta ovası</Label>
				</>
			) : null}
		</World>
	);
};

// ---------------------------------------------------------------- earthquakes

const QUAKE_STAGES = ['Fay', 'Gerilme birikir', 'Kırılma', 'Dalgalar'] as const;
const SURFACE = TOP + 90;

/**
 * An earthquake in cross-section (plan view for a strike-slip fault). Rock on
 * both sides of a fault is held by friction while the plates keep pushing
 * (or pulling): it bends and stores energy. When the stress beats the
 * friction the fault slips at once at the focus, the bent rock snaps back
 * offset (elastic rebound), and the energy leaves as waves: P waves first,
 * then the slower S waves, and surface waves from the epicentre.
 */
export const EarthquakeVisual: React.FC<VisualBoxProps & {visual: Earthquake}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {stage, progress, seconds} = useStageClock(QUAKE_STAGES.length, {delaySeconds});
	const drawn = stage > 0 ? 1 : smooth(progress * 1.5);
	const stress = stage === 1 ? smooth(progress) : stage === 0 ? 0 : 1;
	// The slip happens in a fraction of a second, early in the rupture stage.
	const slip = stage >= 2 ? (stage === 2 ? smooth((seconds - 0.4) / 0.35) : 1) : 0;
	const bend = stress * (1 - slip);
	const waveTime = stage === 3 ? seconds : 0;
	const strikeSlip = visual.fault === 'strikeSlip';
	const sense = visual.fault === 'reverse' ? -1 : 1; // hanging wall: up (reverse) or down (normal)
	const offset = 46 * slip;

	// Fault plane: from the surface at x=480 down to the right (dip ~ 60°).
	const faultTop = [480, SURFACE] as const;
	const faultBottom = [480 + (H - SURFACE) / Math.tan((60 * Math.PI) / 180), H] as const;
	const focus = [lerp(faultTop[0], faultBottom[0], 0.55), lerp(faultTop[1], faultBottom[1], 0.55)] as const;
	const epicentre = [focus[0], SURFACE] as const;
	const xOnFault = (y: number) => faultTop[0] + ((y - faultTop[1]) / (faultBottom[1] - faultTop[1])) * (faultBottom[0] - faultTop[0]);

	if (strikeSlip) return <StrikeSlip width={width} height={height} stage={stage} progress={progress} bend={bend} slip={slip} waveTime={waveTime} labels={visual.labels} drawn={drawn} />;

	// Layers: horizontal bands; near the fault they drag (bend) before the slip and are offset after it.
	const layers = [0, 1, 2, 3].map((index) => SURFACE + 60 + index * 85);
	const layerLine = (baseY: number, side: 'foot' | 'hanging') => {
		const points: [number, number][] = [];
		const from = side === 'foot' ? 0 : xOnFault(baseY);
		const to = side === 'foot' ? xOnFault(baseY) : W;
		for (let x = from; x <= to; x += 10) {
			const distance = Math.abs(x - xOnFault(baseY));
			const drag = Math.exp(-distance / 140) * 30 * bend;
			const dy = side === 'hanging' ? sense * (offset - drag) : sense * drag;
			points.push([x, baseY + dy]);
		}
		return points;
	};
	const hangingShift = sense * offset;
	// The hanging wall slips along the fault plane: with the vertical move comes a sideways one (up-dip is to the left).
	const hangingSlide = (sense * offset) / Math.tan((60 * Math.PI) / 180);
	const hangingPolygon = [[faultTop[0], SURFACE + hangingShift], [W, SURFACE + hangingShift], [W, H], [faultBottom[0], H]] as const;
	const footPolygon = [[0, SURFACE], [faultTop[0], SURFACE], [faultBottom[0], H], [0, H]] as const;
	const shake = (x: number) => (waveTime > 0 ? Math.sin(waveTime * 30 + x) * Math.max(0, 6 - Math.abs(x - epicentre[0]) / 60) * Math.max(0, 1 - Math.abs(waveTime * 260 - Math.abs(x - epicentre[0])) / 220) : 0);

	return (
		<World width={width} height={height}>
			<StageStrip names={QUAKE_STAGES} stage={stage} progress={progress} />
			<g opacity={drawn}>
				<path d={pathOf(footPolygon, true)} fill={C.rock[0]} />
				{layers.map((y, index) => (
					<path key={index} d={pathOf(layerLine(y, 'foot'))} fill="none" stroke={C.rock[3]} strokeWidth={7} opacity={0.75} />
				))}
				<g transform={`translate(${hangingSlide} 0)`}>
					<path d={pathOf(hangingPolygon, true)} fill={C.rock[1]} />
					{layers.map((y, index) => (
						<path key={index} d={pathOf(layerLine(y, 'hanging'))} fill="none" stroke={C.rock[3]} strokeWidth={7} opacity={0.75} />
					))}
				</g>
				<line x1={faultTop[0]} y1={faultTop[1] - 6} x2={faultBottom[0]} y2={faultBottom[1]} stroke={palette.ink} strokeWidth={6} strokeDasharray="18 10" />
				{[180, 330, 760, 900].map((x) => (
					<House key={x} x={x + shake(x) + (x > faultTop[0] ? hangingSlide : 0)} y={(x > faultTop[0] ? SURFACE + hangingShift : SURFACE) + Math.abs(shake(x)) * 0.3} />
				))}
			</g>
			{/* plates pushing (reverse) or pulling (normal) */}
			{[0, 1].map((side) => {
				const y = SURFACE + 200;
				const inward = visual.fault === 'reverse';
				const x0 = side === 0 ? 40 : W - 40;
				const direction = (side === 0 ? 1 : -1) * (inward ? 1 : -1);
				const length = 110 * stress;
				return stress > 0 ? <Arrow key={side} x={inward ? x0 : x0 - direction * length} y={y} dx={direction * length} color={C.stress} /> : null;
			})}
			<StressMeter level={stress * (1 - slip)} />
			{slip > 0 && slip < 1 ? <circle cx={focus[0]} cy={focus[1]} r={30 + 80 * slip} fill={withAlpha(C.stress, 0.5 * (1 - slip))} /> : null}
			{stage >= 2 ? (
				<g>
					<circle cx={focus[0]} cy={focus[1]} r={13} fill={C.stress} stroke="#FFFFFF" strokeWidth={4} />
					<line x1={focus[0]} y1={focus[1]} x2={epicentre[0]} y2={epicentre[1] + hangingShift} stroke={palette.ink} strokeWidth={3} strokeDasharray="8 8" />
					<path d={`M${epicentre[0] - 14} ${epicentre[1] + hangingShift - 22} L${epicentre[0] + 14} ${epicentre[1] + hangingShift - 22} L${epicentre[0]} ${epicentre[1] + hangingShift - 2} Z`} fill={C.stress} />
				</g>
			) : null}
			{waveTime > 0 ? <Waves origin={focus} time={waveTime} top={SURFACE} /> : null}
			{visual.labels ? (
				<>
					<Label x={faultBottom[0] - 10} y={H - 20} anchor="end" show={drawn}>Fay düzlemi</Label>
					<Label x={W / 2} y={SURFACE + 240} show={stage === 1 ? stress : 0} color={C.stress} size={26}>Kayaçlar bükülür, enerji birikir</Label>
					<Label x={focus[0] + 26} y={focus[1] + 8} anchor="start" show={stage >= 2 ? 1 : 0} color={C.stress}>Odak (hiposantr)</Label>
					<Label x={epicentre[0]} y={SURFACE - 78} show={stage >= 2 ? 1 : 0}>Merkez üssü (episantr)</Label>
					<Label x={W / 2} y={SURFACE + 250} show={stage === 2 ? slip : 0} color={palette.lesson} size={26}>{visual.fault === 'reverse' ? 'Ters fay: üst blok yukarı kayar' : 'Normal fay: üst blok aşağı kayar'}</Label>
				</>
			) : null}
			{waveTime > 0 && visual.labels ? <WaveLegend /> : null}
		</World>
	);
};

const House: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 18} y={y - 30} width={36} height={30} fill={C.house} stroke="#5B4A3A" strokeWidth={3} />
		<path d={`M${x - 24} ${y - 28} L${x} ${y - 50} L${x + 24} ${y - 28} Z`} fill={C.roof} />
	</g>
);

const Arrow: React.FC<{x: number; y: number; dx: number; color: string}> = ({x, y, dx, color}) => {
	const head = Math.sign(dx) * 22;
	return (
		<g>
			<line x1={x} y1={y} x2={x + dx - head * 0.6} y2={y} stroke={color} strokeWidth={12} strokeLinecap="round" />
			<path d={`M${x + dx} ${y} L${x + dx - head} ${y - 18} L${x + dx - head} ${y + 18} Z`} fill={color} />
		</g>
	);
};

/** How much stress the rock holds: fills while it builds, empties at the rupture. */
const StressMeter: React.FC<{level: number}> = ({level}) => {
	const palette = useVisualPalette();
	const [x, y, w, h] = [24, TOP + 14, 230, 26];
	return (
		<g>
			<rect x={x} y={y} width={w} height={h} rx={13} fill={withAlpha(palette.ink, 0.08)} />
			<rect x={x} y={y} width={w * level} height={h} rx={13} fill={C.stress} />
			<Label x={x + w + 12} y={y + 21} anchor="start" size={20}>Gerilme</Label>
		</g>
	);
};

/** Wavefronts from the focus: P (fast, solid) ahead of S (slower, dashed); clipped to the ground. */
const Waves: React.FC<{origin: readonly [number, number]; time: number; top: number}> = ({origin, time, top}) => {
	const clipId = `ground${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const rings = [0, 0.6, 1.2];
	return (
		<g>
			<clipPath id={clipId}>
				<rect x={0} y={top} width={W} height={H - top} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				{rings.map((delay) => {
					const pRadius = Math.max(0, (time - delay) * 260);
					const sRadius = Math.max(0, (time - delay) * 150);
					return (
						<g key={delay}>
							{pRadius > 0 ? <circle cx={origin[0]} cy={origin[1]} r={pRadius} fill="none" stroke={C.wavePrimary} strokeWidth={5} opacity={Math.max(0, 1 - pRadius / 900)} /> : null}
							{sRadius > 0 ? <circle cx={origin[0]} cy={origin[1]} r={sRadius} fill="none" stroke={C.waveSecondary} strokeWidth={6} strokeDasharray="16 10" opacity={Math.max(0, 1 - sRadius / 700)} /> : null}
						</g>
					);
				})}
			</g>
			{/* surface waves run along the ground from the epicentre */}
			{time > 0.8 ? <path d={pathOf(Array.from({length: 101}, (_, index) => {
				const x = (index / 100) * W;
				const d = Math.abs(x - origin[0]);
				const front = (time - 0.8) * 120;
				const amp = d < front ? 8 * Math.max(0, 1 - d / 700) : 0;
				return [x, top - 4 + Math.sin(d / 22 - time * 8) * amp] as const;
			}))} fill="none" stroke={C.waveSurface} strokeWidth={5} /> : null}
		</g>
	);
};

const WaveLegend: React.FC = () => (
	<g>
		<line x1={W - 250} x2={W - 200} y1={H - 70} y2={H - 70} stroke={C.wavePrimary} strokeWidth={5} />
		<Label x={W - 190} y={H - 62} anchor="start" size={20}>P dalgası (hızlı)</Label>
		<line x1={W - 250} x2={W - 200} y1={H - 40} y2={H - 40} stroke={C.waveSecondary} strokeWidth={6} strokeDasharray="12 8" />
		<Label x={W - 190} y={H - 32} anchor="start" size={20}>S dalgası (yavaş)</Label>
		<line x1={W - 250} x2={W - 200} y1={H - 12} y2={H - 12} stroke={C.waveSurface} strokeWidth={5} />
		<Label x={W - 190} y={H - 4} anchor="start" size={20}>Yüzey dalgası</Label>
	</g>
);

/** A strike-slip fault from above: a road and a fence across it bend, then break and shift sideways. */
const StrikeSlip: React.FC<{width: number; height: number; stage: number; progress: number; bend: number; slip: number; waveTime: number; labels: boolean; drawn: number}> = ({width, height, stage, progress, bend, slip, waveTime, labels, drawn}) => {
	const palette = useVisualPalette();
	const faultY = TOP + 270;
	const offset = 70 * slip;
	const crossing = (baseX: number) => {
		const points: [number, number][] = [];
		for (let y = TOP + 30; y <= H - 20; y += 8) {
			const side = y < faultY ? -1 : 1;
			const drag = Math.exp(-Math.abs(y - faultY) / 90) * 40 * bend * -side;
			points.push([baseX + side * offset * 0.5 + drag * 0.5, y]);
		}
		return points;
	};
	return (
		<World width={width} height={height}>
			<StageStrip names={QUAKE_STAGES} stage={stage} progress={progress} />
			<g opacity={drawn}>
				<rect x={0} y={TOP + 20} width={W} height={faultY - TOP - 20} fill={C.land} />
				<rect x={0} y={faultY} width={W} height={H - faultY} fill={C.landDark} />
				<path d={pathOf(crossing(360))} fill="none" stroke="#555555" strokeWidth={26} />
				<path d={pathOf(crossing(360))} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="16 14" />
				<path d={pathOf(crossing(680))} fill="none" stroke={C.roof} strokeWidth={6} strokeDasharray="4 10" />
				<line x1={0} x2={W} y1={faultY} y2={faultY} stroke={palette.ink} strokeWidth={6} strokeDasharray="18 10" />
			</g>
			{bend > 0 || slip > 0 ? (
				<>
					<Arrow x={120} y={faultY - 70} dx={-90 * Math.max(bend, slip)} color={C.stress} />
					<Arrow x={W - 120} y={faultY + 70} dx={90 * Math.max(bend, slip)} color={C.stress} />
				</>
			) : null}
			<StressMeter level={bend} />
			{waveTime > 0 ? <circle cx={520} cy={faultY} r={waveTime * 200} fill="none" stroke={C.wavePrimary} strokeWidth={5} opacity={Math.max(0, 1 - waveTime / 4)} /> : null}
			{labels ? (
				<>
					<Label x={W - 30} y={faultY - 14} anchor="end" show={drawn}>Doğrultu atımlı fay</Label>
					<Label x={W / 2} y={TOP + 70} show={stage === 1 ? interpolate(progress, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}) : 0} color={C.stress}>Yol ve çit bükülür: enerji birikir</Label>
					<Label x={W / 2} y={TOP + 70} show={stage >= 2 ? slip : 0} color={palette.lesson}>Kırılma: bloklar yana kayar</Label>
				</>
			) : null}
		</World>
	);
};
