import React, {useId, useMemo} from 'react';
import {clamp01, lerp, smooth} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {H, pathOf, W, World} from '../VisualWorld';
import {Label, mixColor, StageStrip, TOP} from './ProcessStage';

type River = Extract<CourseVisual, {kind: 'river'}>;

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
