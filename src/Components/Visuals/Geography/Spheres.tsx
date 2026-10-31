import React, {useId} from 'react';
import {easeFrom, lerp} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {Chip, H, pathOf, usePartLook, W, World} from '../VisualWorld';

// ---------------------------------------------------------------- the four spheres

type Spheres = Extract<CourseVisual, {kind: 'spheres'}>;

const SEA = 395;
/** The land's surface: a mountain on the left, a plain in the middle, the coast and the sea floor on the right. */
const groundAt = (x: number) => {
	if (x <= 230) return 170 + 160 * ((230 - x) / 230) ** 1.3;
	if (x <= 430) return 170 + 200 * ((x - 230) / 200) ** 1.2;
	if (x <= 630) return 370 + 10 * ((x - 430) / 200);
	if (x <= 700) return 380 + 90 * ((x - 630) / 70) ** 1.4;
	return 470 + 40 * ((x - 700) / 300);
};
const XS = Array.from({length: 201}, (_, index) => (index / 200) * W);

const Pine: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-size * 0.08} y={-size * 0.3} width={size * 0.16} height={size * 0.32} fill="#7A5534" />
		<path d={`M0 ${-size * 1.25} L${size * 0.42} ${-size * 0.25} L${-size * 0.42} ${-size * 0.25} Z`} fill="#3F7D3A" />
		<path d={`M0 ${-size * 1.55} L${size * 0.32} ${-size * 0.75} L${-size * 0.32} ${-size * 0.75} Z`} fill="#4E9145" />
	</g>
);

const House: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-18} y={-26} width={36} height={26} fill={C.house} stroke="#8A7A66" strokeWidth={2} />
		<path d="M-24 -24 L0 -44 L24 -24 Z" fill={C.roof} />
		<rect x={-5} y={-14} width={10} height={14} fill="#8A6A4A" />
	</g>
);

/**
 * The four spheres of the natural environment in one landscape: the atmosphere (sky, sun, a cloud, wind), the
 * hydrosphere (sea, river, snow), the lithosphere (a mountain and its rock layers), the biosphere (forest, birds,
 * a fish) and, with `human`, the human environment (a village, fields, a road). `interactions` shows the water
 * moving between them: evaporation from the sea, rain on the mountain, the river carrying it back.
 * Parts: atmosfer, hidrosfer, litosfer, biyosfer, insan, etkileşim.
 */
export const SpheresVisual: React.FC<VisualBoxProps & {visual: Spheres}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	// Without beats each sphere comes in after the one before.
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.45, 0.6);
	const air = usePartLook('atmosfer', enter(0));
	const rock = usePartLook('litosfer', enter(1));
	const water = usePartLook('hidrosfer', enter(2));
	const life = usePartLook('biyosfer', enter(3));
	const people = usePartLook('insan', enter(4));
	const flow = usePartLook('etkileşim', visual.interactions ? enter(5) : 0);

	const surface = XS.map((x) => [x, groundAt(x)] as const);
	const layers = [0, 16, 60, 120, 200, 320];
	const layerColors = ['#7DB35A', C.soil, C.rock[0], C.rock[1], C.rock[2]];
	const snow = XS.filter((x) => groundAt(x) < 228).map((x) => [x, groundAt(x)] as const);
	const river = [[300, 248], [330, 290], [312, 318], [356, 345], [420, 362], [470, 376], [540, 380], [600, 388], [648, SEA + 2]] as const;
	const riverPath = `M${river[0].join(' ')} ` + river.slice(1).map(([px, py]) => `L${px} ${py}`).join(' ');
	const cloud = {x: 330 + Math.sin(t * 0.3) * 12, y: 110};
	const waves = Array.from({length: 61}, (_, index) => {
		const x = 640 + index * 6;
		return [x, SEA + Math.sin(index * 0.6 + t * 2.4) * 3] as const;
	});
	const birds = [0, 1, 2].map((index) => ({x: ((t * 40 + index * 70) % 700) + 120, y: 150 + index * 22 + Math.sin(t * 3 + index) * 6}));
	const fishX = 760 + ((t * 30) % 180);
	const label = (title: string, subtitle: string) => (visual.labels ? {title, subtitle} : null);
	const labels = {
		atmosfer: label('Atmosfer', 'hava küre'),
		hidrosfer: label('Hidrosfer', 'su küre'),
		litosfer: label('Litosfer', 'taş küre'),
		biyosfer: label('Biyosfer', 'canlılar küresi'),
		insan: label('Beşerî ortam', 'insan ve etkinlikleri'),
	};

	return (
		<World width={width} height={height}>
			<defs>
				<linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#BFDDF3" />
					<stop offset="1" stopColor="#EEF7FD" />
				</linearGradient>
				<clipPath id={`frame${id}`}>
					<rect width={W} height={H} rx={28} />
				</clipPath>
			</defs>
			<g clipPath={`url(#frame${id})`}>
				{/* Atmosphere: sky, sun, cloud, wind. */}
				<g opacity={air.opacity}>
					<rect width={W} height={H} fill={`url(#sky${id})`} />
					<g transform={`translate(110 92) rotate(${t * 8})`}>
						{Array.from({length: 12}, (_, index) => (
							<line key={index} x1={0} y1={-56} x2={0} y2={-74} stroke="#F6B73C" strokeWidth={6} strokeLinecap="round" transform={`rotate(${index * 30})`} />
						))}
					</g>
					<circle cx={110} cy={92} r={44} fill="#F9C74F" />
					<g transform={`translate(${cloud.x} ${cloud.y})`} fill="#FFFFFF" stroke="#C9D9E6" strokeWidth={2}>
						<ellipse cx={0} cy={0} rx={70} ry={34} />
						<ellipse cx={-48} cy={10} rx={44} ry={28} />
						<ellipse cx={52} cy={8} rx={48} ry={30} />
					</g>
					{[0, 1].map((index) => {
						const x = ((t * 90 + index * 260) % 520) + 520;
						return <path key={index} d={`M${x} ${190 + index * 50} q40 -18 80 0 t80 0`} fill="none" stroke={withAlpha('#5A7FA0', 0.55)} strokeWidth={4} strokeLinecap="round" />;
					})}
				</g>
				{/* Lithosphere: the mountain, the plain and the rock layers under them. */}
				<g opacity={rock.opacity}>
					{/* Bedrock fills down to the frame, the bands above follow the surface; under the sea the top is sand. */}
					<path d={pathOf([...surface.map(([x, y]) => [x, y + layers[layers.length - 2]] as const), [W, H], [0, H]], true)} fill={C.rock[3]} />
					{layers.slice(0, -2).map((depth, index) => (
						<path key={index} d={pathOf([...surface.map(([x, y]) => [x, y + depth] as const), ...surface.map(([x, y]) => [x, y + layers[index + 1]] as const).reverse()], true)} fill={layerColors[index]} />
					))}
					<path d={pathOf([...surface.filter(([x]) => x >= 630), ...surface.filter(([x]) => x >= 630).map(([x, y]) => [x, y + 16] as const).reverse()], true)} fill={C.sand} />
					<path d={pathOf(surface)} fill="none" stroke={withAlpha('#3D2B1A', 0.35)} strokeWidth={2} />
				</g>
				{/* Hydrosphere: the sea with its waves, the river from the mountain, the snow on the peak. */}
				<g opacity={water.opacity}>
					<path d={pathOf([...waves, [W, H], [640, H]], true)} fill={withAlpha(C.water, 0.82)} />
					<path d={pathOf(waves)} fill="none" stroke={C.waterLight} strokeWidth={4} />
					<path d={riverPath} fill="none" stroke={C.water} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
					<path d={riverPath} fill="none" stroke={C.waterLight} strokeWidth={4} strokeLinecap="round" strokeDasharray="14 22" strokeDashoffset={-t * 60} />
					<path d={pathOf(snow, true)} fill="#FFFFFF" stroke="#DDE7EF" strokeWidth={2} />
				</g>
				{/* Biosphere: forest on the slopes, birds, a fish. */}
				<g opacity={life.opacity}>
					{[[40, 0.85], [345, 0.9], [380, 1.05], [410, 0.8], [440, 0.75]].map(([x, size], index) => (
						<Pine key={index} x={x} y={groundAt(x) + 4} size={46 * size} />
					))}
					{birds.map((bird, index) => (
						<path key={index} d={`M${bird.x - 14} ${bird.y - 6} Q${bird.x - 6} ${bird.y - 12} ${bird.x} ${bird.y} Q${bird.x + 6} ${bird.y - 12} ${bird.x + 14} ${bird.y - 6}`} fill="none" stroke="#33415C" strokeWidth={3.5} strokeLinecap="round" />
					))}
					<g transform={`translate(${fishX} 470)`}>
						<ellipse cx={0} cy={0} rx={22} ry={10} fill="#F28C38" />
						<path d="M-20 0 L-34 -10 L-34 10 Z" fill="#F28C38" />
						<circle cx={12} cy={-3} r={2.5} fill="#1F2A44" />
					</g>
				</g>
				{/* The human environment: a village, its fields and a road on the plain. */}
				{visual.human ? (
					<g opacity={people.opacity}>
						{Array.from({length: 6}, (_, index) => (
							<path key={index} d={pathOf([[455 + index * 26, groundAt(455 + index * 26) - 1], [475 + index * 26, groundAt(475 + index * 26) - 1]])} stroke="#C8A24A" strokeWidth={7} strokeLinecap="round" />
						))}
						<path d={pathOf(XS.filter((x) => x > 430 && x < 630).map((x) => [x, groundAt(x) + 6] as const))} stroke="#7C7C7C" strokeWidth={5} strokeDasharray="12 8" fill="none" />
						<House x={560} y={groundAt(560)} />
						<House x={600} y={groundAt(600)} />
						<House x={530} y={groundAt(530) + 2} />
					</g>
				) : null}
				{/* Interactions: evaporation rising from the sea, rain falling on the mountain. */}
				{visual.interactions ? (
					<g opacity={flow.opacity}>
						<path d="M830 380 C820 260 560 160 420 128" fill="none" stroke={palette.lesson} strokeWidth={5} strokeDasharray="10 12" strokeDashoffset={t * 40} />
						<path d="M420 128 l18 -10 l-4 18 z" fill={palette.lesson} />
						{Array.from({length: 5}, (_, index) => {
							const phase = (t * 0.6 + index / 5) % 1;
							return <circle key={`v${index}`} cx={lerp(830, 430, phase)} cy={lerp(380, 132, Math.sqrt(phase))} r={5} fill={withAlpha(palette.lesson, 1 - phase * 0.6)} />;
						})}
						{Array.from({length: 14}, (_, index) => {
							const x = cloud.x - 80 + (index % 7) * 26;
							const fall = (t * 1.2 + (index * 0.37) % 1) % 1;
							const y = cloud.y + 36 + fall * 120;
							return <line key={`r${index}`} x1={x} y1={y} x2={x - 4} y2={y + 14} stroke={C.waterDeep} strokeWidth={3} strokeLinecap="round" opacity={1 - fall * 0.5} />;
						})}
					</g>
				) : null}
				{/* Names last, over everything. */}
				{labels.atmosfer ? <Chip x={800} y={70} {...labels.atmosfer} focused={air.focused} opacity={air.opacity} /> : null}
				{labels.hidrosfer ? <Chip x={850} y={540} {...labels.hidrosfer} focused={water.focused} opacity={water.opacity} /> : null}
				{labels.litosfer ? <Chip x={170} y={530} {...labels.litosfer} focused={rock.focused} opacity={rock.opacity} /> : null}
				{labels.biyosfer ? <Chip x={128} y={214} {...labels.biyosfer} focused={life.focused} opacity={life.opacity} /> : null}
				{visual.human && labels.insan ? <Chip x={575} y={305} {...labels.insan} focused={people.focused} opacity={people.opacity} /> : null}
			</g>
		</World>
	);
};
