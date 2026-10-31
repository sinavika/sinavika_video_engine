import React, {createContext, useContext, useId} from 'react';
import {easeFrom, smoothStep} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {useBeatStartFor} from '../VisualTimeline';
import {LANDFORM_PARTS} from './GeographySchema';
import {type CourseVisual} from '../VisualSchema';
import {H, pathOf, Tag, usePartLook, W, World} from '../VisualWorld';

// ---------------------------------------------------------------- landforms

type Landform = Extract<CourseVisual, {kind: 'landform'}>;

const ROCK_BANDS = ['#C9A97A', '#B88E5E', '#D8C3A5', '#A27747'];
const LIMESTONE = '#D9D4C7';
const LIMESTONE_DARK = '#B9B2A1';

/** A label with a short leader to the point it names, shown with its part. */
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
/** With `numbered`, a scene names its forms I, II, III… in the order of the scene's part list, for questions. */
const NumberingContext = createContext<readonly string[] | null>(null);

const Callout: React.FC<{id: string; x: number; y: number; tx: number; ty: number; text: string; look: {opacity: number; focused: number}; anchor?: 'start' | 'middle' | 'end'}> = ({id, x, y, tx, ty, text, look, anchor = 'middle'}) => {
	const palette = useVisualPalette();
	const numbering = useContext(NumberingContext);
	const label = numbering ? (ROMAN[numbering.indexOf(id)] ?? text) : text;
	return (
		<g opacity={look.opacity}>
			<line x1={x} y1={y} x2={tx} y2={ty + (ty > y ? -12 : 12)} stroke={look.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={2.5} />
			<circle cx={x} cy={y} r={5} fill={look.focused > 0.5 ? palette.lesson : palette.ink} />
			<Tag x={tx} y={ty} text={label} anchor={anchor} size={numbering ? 30 : 22} weight={800} focused={look.focused} />
		</g>
	);
};

/**
 * Landforms the lessons name, each scene drawn and labelled as Turkish textbooks show it; beats bring in and point at
 * each named form. `fold`: layers squeezed into anticlines and synclines; `fault`: hard layers broken into horsts
 * and grabens; `karst`: a limestone plateau with lapies, doline, uvala, polje, sinkhole, swallow hole, a cave with
 * stalactites and stalagmites and travertine terraces; `coast`: a coast from above with cliff and wave-cut
 * platform, spit, lagoon behind a barrier, tombolo and beach; `glacier`: a glaciated mountain with the snow line,
 * cirque and cirque lake, U-shaped valley, moraine and roche moutonnée; `desert`: wind-shaped forms (mushroom rock,
 * barchan dunes, witness rock, tafoni, yardang). Parts are in LANDFORM_PARTS.
 */
export const LandformVisual: React.FC<VisualBoxProps & {visual: Landform}> = (props) => (
	<NumberingContext.Provider value={props.visual.numbered ? LANDFORM_PARTS[props.visual.scene] : null}>
		<LandformScene {...props} />
	</NumberingContext.Provider>
);

const LandformScene: React.FC<VisualBoxProps & {visual: Landform}> = (props) => {
	switch (props.visual.scene) {
		case 'fold':
			return <FoldScene {...props} />;
		case 'fault':
			return <FaultScene {...props} />;
		case 'karst':
			return <KarstScene {...props} />;
		case 'coast':
			return <CoastScene {...props} />;
		case 'glacier':
			return <GlacierScene {...props} />;
		case 'desert':
			return <DesertScene {...props} />;
		case 'volcano':
			return <VolcanoScene {...props} />;
		case 'coasttypes':
			return <CoastTypesScene {...props} />;
		case 'soil':
			return <SoilScene {...props} />;
		case 'vegetation':
			return <VegetationScene {...props} />;
		case 'landslide':
			return <LandslideScene {...props} />;
	}
};

const useSceneClock = (delaySeconds: number) => {
	const seconds = useSceneSeconds();
	return {seconds, t: Math.max(0, seconds - delaySeconds), enter: (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.7)};
};

const Sky: React.FC<{bottom?: number}> = ({bottom = H}) => {
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	return (
		<>
			<defs>
				<linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#CFE6F7" />
					<stop offset="1" stopColor="#F2F8FC" />
				</linearGradient>
			</defs>
			<rect x={0} y={0} width={W} height={bottom} fill={`url(#sky${id})`} />
		</>
	);
};

// Layers pushed from both sides fold into crests (anticlines) and troughs (synclines).
const FoldScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {t, enter} = useSceneClock(delaySeconds);
	const push = usePartLook('basinc', enter(0));
	const crest = usePartLook('antiklinal', enter(2));
	const trough = usePartLook('senklinal', enter(2.4));
	const amount = smoothStep(Math.min(1, t / 5));
	const left = 80 + 40 * amount;
	const right = W - 80 - 40 * amount;
	// Two crests and a trough between them: crests at a quarter and three quarters of the way.
	const wave = (x: number) => -80 * amount * Math.sin(((x - left) / (right - left)) * Math.PI * 4 - Math.PI / 2);
	const xs = Array.from({length: 121}, (_, index) => left + ((right - left) * index) / 120);
	const layer = (depth: number) => xs.map((x) => [x, 300 + depth + wave(x)] as const);
	const depths = [0, 45, 90, 135, 180];
	const crestA = left + (right - left) * 0.25;
	const crestB = left + (right - left) * 0.75;
	const troughX = left + (right - left) * 0.5;
	return (
		<World width={width} height={height}>
			<Sky />
			{depths.slice(0, -1).map((depth, index) => (
				<path key={index} d={pathOf([...layer(depth), ...layer(depths[index + 1]).reverse()], true)} fill={ROCK_BANDS[index]} stroke={withAlpha('#3D2B1A', 0.3)} strokeWidth={1.5} />
			))}
			<path d={pathOf([...layer(180), [right, H], [left, H]], true)} fill="#8C6239" />
			{/* Side pressure. */}
			<g opacity={push.opacity}>
				{[-1, 1].map((side) => {
					const x = side < 0 ? left - 70 : right + 70;
					const d = side < 0 ? 'M-40 0 L30 0 M30 0 l-18 -14 M30 0 l-18 14' : 'M40 0 L-30 0 M-30 0 l18 -14 M-30 0 l18 14';
					return <path key={side} d={d} transform={`translate(${x} 390)`} fill="none" stroke={push.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={7} strokeLinecap="round" />;
				})}
				<Tag x={W / 2} y={560} text="Yan basınç: tabakalar sıkışıp kıvrılır" anchor="middle" size={22} focused={push.focused} />
			</g>
			<Callout id="antiklinal" x={crestA} y={300 + wave(crestA) - 4} tx={crestA} ty={90} text="Antiklinal: kubbe → dağ" look={crest} />
			<Callout id="antiklinal" x={crestB} y={300 + wave(crestB) - 4} tx={crestB} ty={90} text="Antiklinal" look={crest} />
			<Callout id="senklinal" x={troughX} y={300 + wave(troughX) - 4} tx={troughX} ty={190} text="Senklinal: çanak → ova" look={trough} />
		</World>
	);
};

// Hard layers break along faults: raised blocks are horsts, sunken blocks grabens.
const FaultScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {t, enter} = useSceneClock(delaySeconds);
	const faults = usePartLook('fay', enter(0));
	const horst = usePartLook('horst', enter(2));
	const graben = usePartLook('graben', enter(2.4));
	const move = smoothStep(Math.min(1, t / 4)) * 70;
	// Five blocks between four oblique faults; blocks 1 and 3 rise, 0, 2 and 4 sink.
	const edges = [0, 210, 400, 600, 790, W];
	const lean = 50;
	const offsets = [move * 0.4, -move, move * 0.6, -move, move * 0.4];
	const blocks = edges.slice(0, -1).map((x0, index) => {
		const x1 = edges[index + 1];
		const top = 260 + offsets[index];
		return {index, poly: [[x0 + (index === 0 ? 0 : lean / 2), top], [x1 + (index === 4 ? 0 : lean / 2), top], [x1 - (index === 4 ? 0 : lean / 2), H], [x0 - (index === 0 ? 0 : lean / 2), H]] as const, top, middle: (x0 + x1) / 2};
	});
	return (
		<World width={width} height={height}>
			<Sky />
			{blocks.map((block) => (
				<g key={block.index}>
					<path d={pathOf(block.poly, true)} fill={block.index % 2 === 1 ? ROCK_BANDS[1] : ROCK_BANDS[0]} stroke={withAlpha('#3D2B1A', 0.4)} strokeWidth={2} />
					{[40, 85, 130].map((depth) => (
						<line key={depth} x1={block.poly[0][0] - (depth / (H - block.top)) * (block.poly[0][0] - block.poly[3][0])} y1={block.top + depth} x2={block.poly[1][0] - (depth / (H - block.top)) * (block.poly[1][0] - block.poly[2][0])} y2={block.top + depth} stroke={withAlpha('#3D2B1A', 0.25)} strokeWidth={2} />
					))}
				</g>
			))}
			<g opacity={faults.opacity}>
				{edges.slice(1, -1).map((x, index) => (
					<line key={index} x1={x + lean / 2} y1={180} x2={x - lean / 2} y2={H} stroke={faults.focused > 0.5 ? palette.lesson : '#7B241C'} strokeWidth={faults.focused > 0.5 ? 6 : 4} strokeDasharray="12 8" />
				))}
				<Tag x={W / 2} y={30} text="Sert tabakalar kırılır: fay hatları" anchor="middle" size={22} focused={faults.focused} />
			</g>
			<Callout id="horst" x={blocks[1].middle} y={blocks[1].top} tx={blocks[1].middle} ty={110} text="Horst: yüksekte kalan blok → dağ" look={horst} />
			<Callout id="horst" x={blocks[3].middle} y={blocks[3].top} tx={blocks[3].middle} ty={110} text="Horst" look={horst} />
			<Callout id="graben" x={blocks[2].middle} y={blocks[2].top} tx={blocks[2].middle} ty={190} text="Graben: çöken blok → ova" look={graben} />
			<g opacity={Math.max(horst.opacity, graben.opacity) * 0.9}>
				<Tag x={W / 2} y={575} text="Batı Anadolu: Bozdağlar horst, Gediz ve Büyük Menderes ovaları graben" anchor="middle" size={19} fill={palette.muted} />
			</g>
		</World>
	);
};

// A limestone plateau dissolved by water, above and below ground.
const KarstScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {t, enter} = useSceneClock(delaySeconds);
	const looks = {
		lapya: usePartLook('lapya', enter(0.5)),
		dolin: usePartLook('dolin', enter(1)),
		uvala: usePartLook('uvala', enter(1.4)),
		polye: usePartLook('polye', enter(1.8)),
		obruk: usePartLook('obruk', enter(2.2)),
		duden: usePartLook('duden', enter(2.6)),
		magara: usePartLook('magara', enter(3)),
		sarkit: usePartLook('sarkit', enter(3.4)),
		traverten: usePartLook('traverten', enter(3.8)),
	};
	const SURFACE = 230;
	// The surface: lapies on the left, a doline, an uvala, a wide polje, a sinkhole shaft, then the slope down to a spring.
	const surface: [number, number][] = [
		[0, SURFACE], [60, SURFACE], [70, SURFACE + 14], [80, SURFACE], [92, SURFACE + 16], [104, SURFACE], [116, SURFACE + 14], [128, SURFACE],
		[190, SURFACE], [215, SURFACE + 38], [240, SURFACE],
		[290, SURFACE], [310, SURFACE + 34], [335, SURFACE + 22], [360, SURFACE + 40], [385, SURFACE],
		[430, SURFACE], [460, SURFACE + 60], [610, SURFACE + 60], [640, SURFACE],
		[700, SURFACE], [700, SURFACE + 150], [730, SURFACE + 150], [730, SURFACE],
		[800, SURFACE], [870, SURFACE + 120], [W, SURFACE + 160],
	];
	const rock = pathOf([...surface, [W, H], [0, H]], true);
	return (
		<World width={width} height={height}>
			<Sky bottom={SURFACE + 60} />
			<path d={rock} fill={LIMESTONE} stroke={LIMESTONE_DARK} strokeWidth={2} />
			{/* Bedding lines in the limestone. */}
			{[300, 360, 420, 480, 540].map((y) => (
				<line key={y} x1={0} y1={y} x2={y < 400 ? 860 : W} y2={y} stroke={withAlpha(LIMESTONE_DARK, 0.6)} strokeWidth={2} />
			))}
			{/* The sinkhole: a collapsed shaft, dark inside, with groundwater at its floor. */}
			<rect x={700} y={SURFACE} width={30} height={150} fill="#4E463A" />
			<rect x={700} y={SURFACE + 128} width={30} height={22} fill={C.water} />
			{/* Polje floor: flat alluvium with a seasonal lake; the swallow hole drains it. */}
			<path d={pathOf([[466, SURFACE + 54], [604, SURFACE + 54], [610, SURFACE + 60], [460, SURFACE + 60]], true)} fill="#9CBB6B" />
			<ellipse cx={560} cy={SURFACE + 52} rx={34} ry={6} fill={C.water} opacity={0.8} />
			{/* The cave: a hollow with stalactites, stalagmites and a column. */}
			<g opacity={looks.magara.opacity}>
				<path d="M380 470 Q420 400 520 405 Q640 400 690 460 Q660 520 540 525 Q420 525 380 470 Z" fill="#5D5446" stroke={looks.magara.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={5} />
			</g>
			<g opacity={looks.sarkit.opacity}>
				{[430, 470, 520, 580, 630].map((x, index) => (
					<path key={`s${x}`} d={`M${x - 8} ${410 + (index % 2) * 4} L${x} ${450 + (index % 3) * 8} L${x + 8} ${410 + (index % 2) * 4} Z`} fill="#E8E1D0" />
				))}
				{[450, 500, 600, 650].map((x, index) => (
					<path key={`d${x}`} d={`M${x - 10} 522 L${x} ${488 - (index % 2) * 10} L${x + 10} 522 Z`} fill="#E8E1D0" />
				))}
				<rect x={548} y={405} width={14} height={118} fill="#E8E1D0" />
			</g>
			{/* Swallow hole: the polje's water goes underground. */}
			<g opacity={looks.duden.opacity}>
				<path d={`M600 ${SURFACE + 60} Q620 ${SURFACE + 120} 600 ${SURFACE + 190} Q580 ${SURFACE + 220} 560 ${SURFACE + 175}`} fill="none" stroke={C.water} strokeWidth={6} strokeDasharray="10 8" strokeDashoffset={-t * 30} />
			</g>
			{/* Travertine terraces where the underground water comes out on the slope. */}
			<g opacity={looks.traverten.opacity}>
				{[0, 1, 2, 3].map((step) => (
					<path key={step} d={`M${850 + step * 34} ${SURFACE + 104 + step * 18} q14 10 30 0 l0 8 q-16 8 -30 0 z`} fill="#F7F5EE" stroke="#D5CFC0" strokeWidth={1.5} />
				))}
				<circle cx={845} cy={SURFACE + 100} r={6} fill={C.water} />
			</g>
			<Callout id="lapya" x={95} y={SURFACE + 8} tx={95} ty={110} text="Lapya" look={looks.lapya} />
			<Callout id="dolin" x={215} y={SURFACE + 34} tx={215} ty={70} text="Dolin" look={looks.dolin} />
			<Callout id="uvala" x={335} y={SURFACE + 28} tx={335} ty={110} text="Uvala" look={looks.uvala} />
			<Callout id="polye" x={535} y={SURFACE + 50} tx={535} ty={70} text="Polye (ova, göl)" look={looks.polye} />
			<Callout id="obruk" x={715} y={SURFACE + 60} tx={740} ty={110} text="Obruk" look={looks.obruk} />
			<Callout id="duden" x={608} y={SURFACE + 150} tx={760} ty={380} text="Düden" anchor="start" look={looks.duden} />
			<Callout id="magara" x={420} y={470} tx={170} ty={420} text="Mağara" look={looks.magara} />
			<Callout id="sarkit" x={470} y={445} tx={190} ty={500} text="Sarkıt ve dikit" look={looks.sarkit} />
			<Callout id="traverten" x={890} y={SURFACE + 130} tx={900} ty={575} text="Traverten" look={looks.traverten} />
		</World>
	);
};

// A coast seen from above: rocky headland with a cliff, a spit, a lagoon, a tombolo, a beach.
const CoastScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const {t, enter} = useSceneClock(delaySeconds);
	const looks = {
		falez: usePartLook('falez', enter(0.5)),
		asinim: usePartLook('asinim', enter(1)),
		kiyioku: usePartLook('kiyioku', enter(1.5)),
		lagun: usePartLook('lagun', enter(2)),
		tombolo: usePartLook('tombolo', enter(2.5)),
		kumsal: usePartLook('kumsal', enter(3)),
	};
	const LAND = '#B7D39A';
	const SAND = C.sand;
	const sea = withAlpha(C.water, 0.85);
	// Land along the top; the coast line dips and rises left to right.
	const coast: [number, number][] = [[0, 200], [120, 210], [180, 300], [230, 310], [270, 220], [400, 200], [560, 205], [700, 210], [760, 230], [W, 220]];
	return (
		<World width={width} height={height}>
			<rect x={0} y={0} width={W} height={H} fill={sea} />
			{Array.from({length: 7}, (_, index) => (
				<path key={index} d={`M${-40 + ((t * 30 + index * 160) % 1100)} ${420 + (index % 3) * 50} q30 -10 60 0 t60 0`} fill="none" stroke={withAlpha('#FFFFFF', 0.6)} strokeWidth={3} />
			))}
			<path d={pathOf([...coast, [W, 0], [0, 0]], true)} fill={LAND} />
			{/* Headland with cliff and the wave-cut platform in front of it. */}
			<g opacity={looks.asinim.opacity}>
				<path d="M140 300 Q205 380 270 300 Q205 345 140 300 Z" fill={withAlpha('#8D8070', 0.7)} />
			</g>
			<g opacity={looks.falez.opacity}>
				{Array.from({length: 10}, (_, index) => {
					const x = 182 + index * 5;
					return <line key={index} x1={x} y1={300 + Math.sin(index / 3) * 6} x2={x} y2={316 + Math.sin(index / 3) * 6} stroke="#4A3B2A" strokeWidth={3} />;
				})}
			</g>
			{/* Spit growing across a bay, a lagoon behind a barrier. */}
			<g opacity={looks.kiyioku.opacity}>
				<path d="M270 220 Q340 245 420 250 Q440 252 445 246 Q420 240 340 232 Q300 226 270 220 Z" fill={SAND} />
			</g>
			<g opacity={looks.lagun.opacity}>
				<path d="M520 205 Q600 290 720 212 Z" fill={withAlpha(C.water, 0.55)} />
				<path d="M515 205 Q600 300 725 210 Q600 285 515 205 Z" fill={SAND} />
			</g>
			{/* Tombolo: a sand bar that ties an island to the land. */}
			<g opacity={looks.tombolo.opacity}>
				<path d="M880 225 Q875 290 870 340 L890 340 Q895 290 905 225 Z" fill={SAND} />
				<ellipse cx={882} cy={380} rx={60} ry={42} fill={LAND} stroke="#6E8B4E" strokeWidth={2} />
			</g>
			<g opacity={looks.kumsal.opacity}>
				<path d="M0 200 L120 210 L125 222 L0 214 Z" fill={SAND} />
			</g>
			<Callout id="falez" x={205} y={312} tx={205} ty={470} text="Falez (yalıyar)" look={looks.falez} />
			<Callout id="asinim" x={205} y={348} tx={140} ty={540} text="Aşınım düzlüğü" look={looks.asinim} />
			<Callout id="kiyioku" x={420} y={250} tx={420} ty={350} text="Kıyı oku" look={looks.kiyioku} />
			<Callout id="lagun" x={620} y={240} tx={620} ty={110} text="Lagün (kıyı gölü)" look={looks.lagun} />
			<Callout id="tombolo" x={884} y={300} tx={760} ty={480} text="Tombolo" look={looks.tombolo} />
			<Callout id="kumsal" x={60} y={212} tx={60} ty={110} text="Kumsal" look={looks.kumsal} />
		</World>
	);
};

// A glaciated mountain: snow line, cirque and lake, U-valley, moraine, roche moutonnée.
const GlacierScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {enter} = useSceneClock(delaySeconds);
	const looks = {
		karsiniri: usePartLook('karsiniri', enter(0.5)),
		sirk: usePartLook('sirk', enter(1)),
		buzulvadisi: usePartLook('buzulvadisi', enter(1.5)),
		moren: usePartLook('moren', enter(2)),
		horguc: usePartLook('horguc', enter(2.5)),
	};
	const mountain: [number, number][] = [[0, 520], [120, 380], [260, 150], [330, 90], [400, 140], [470, 120], [560, 230], [700, 380], [850, 470], [W, 500], [W, H], [0, H]];
	return (
		<World width={width} height={height}>
			<Sky />
			<path d={pathOf(mountain, true)} fill="#9A8C7A" />
			{/* Snow and ice above the snow line. */}
			<path d="M200 250 L260 150 L330 90 L400 140 L470 120 L520 200 Q440 230 380 220 Q300 240 200 250 Z" fill="#FFFFFF" />
			<g opacity={looks.karsiniri.opacity}>
				<line x1={60} y1={250} x2={940} y2={250} stroke={looks.karsiniri.focused > 0.5 ? palette.lesson : '#2E86C1'} strokeWidth={3} strokeDasharray="14 10" />
				<Tag x={940} y={232} text="Kalıcı kar sınırı" anchor="end" size={21} focused={looks.karsiniri.focused} />
			</g>
			{/* Cirque bowl with its lake. */}
			<g opacity={looks.sirk.opacity}>
				<path d="M330 190 Q360 235 400 190" fill="none" stroke="#5D6D7E" strokeWidth={4} />
				<ellipse cx={365} cy={222} rx={22} ry={7} fill={C.water} />
			</g>
			{/* The U-shaped valley the glacier carved, with an inset cross-section. */}
			<g opacity={looks.buzulvadisi.opacity}>
				<path d="M430 240 Q520 330 640 410" fill="none" stroke="#D6EAF8" strokeWidth={34} strokeLinecap="round" />
				<g transform="translate(760 70)">
					<rect x={0} y={0} width={210} height={120} rx={12} fill={palette.surface} stroke={palette.border} strokeWidth={2} />
					<path d="M20 30 L20 70 Q20 105 105 105 Q190 105 190 70 L190 30" fill="none" stroke={looks.buzulvadisi.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={5} />
					<Tag x={105} y={22} text="U biçimli kesit" anchor="middle" size={16} />
				</g>
			</g>
			{/* Moraine: rubble the ice pushed and left at its front. */}
			<g opacity={looks.moren.opacity}>
				{Array.from({length: 16}, (_, index) => (
					<circle key={index} cx={630 + (index % 8) * 9} cy={418 + Math.floor(index / 8) * 9 + (index % 3) * 2} r={5 + (index % 3)} fill="#7F7468" />
				))}
			</g>
			<g opacity={looks.horguc.opacity}>
				<path d="M520 330 Q545 300 575 318 Q590 330 600 340 Z" fill="#6E6255" />
			</g>
			<Callout id="sirk" x={365} y={215} tx={250} ty={60} text="Sirk ve sirk gölü" look={looks.sirk} />
			<Callout id="buzulvadisi" x={540} y={320} tx={430} ty={420} text="Buzul vadisi" look={looks.buzulvadisi} />
			<Callout id="moren" x={665} y={425} tx={700} ty={540} text="Moren" look={looks.moren} />
			<Callout id="horguc" x={560} y={318} tx={720} ty={300} text="Hörgüç kaya" anchor="start" look={looks.horguc} />
		</World>
	);
};

// Wind-shaped forms in a dry land.
const DesertScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {t, enter} = useSceneClock(delaySeconds);
	const looks = {
		ruzgar: usePartLook('ruzgar', enter(0)),
		mantar: usePartLook('mantar', enter(0.8)),
		barkan: usePartLook('barkan', enter(1.3)),
		sahit: usePartLook('sahit', enter(1.8)),
		tafoni: usePartLook('tafoni', enter(2.3)),
	};
	const GROUND = 430;
	return (
		<World width={width} height={height}>
			<Sky bottom={GROUND} />
			<rect x={0} y={GROUND} width={W} height={H - GROUND} fill="#E8D3A2" />
			{/* Wind carrying sand from the left. */}
			<g opacity={looks.ruzgar.opacity}>
				{Array.from({length: 5}, (_, index) => {
					const x = ((t * 120 + index * 220) % 1200) - 150;
					return <path key={index} d={`M${x} ${GROUND - 40 - index * 18} q40 -14 80 0 t80 0`} fill="none" stroke={looks.ruzgar.focused > 0.5 ? palette.lesson : withAlpha('#8C6D3F', 0.7)} strokeWidth={4} strokeLinecap="round" />;
				})}
				<Tag x={30} y={60} text="Rüzgâr →" size={22} focused={looks.ruzgar.focused} />
			</g>
			{/* Mushroom rock: sand-laden wind wears the base most. */}
			<g opacity={looks.mantar.opacity}>
				<path d={`M140 ${GROUND} L160 ${GROUND - 70} Q150 ${GROUND - 90} 120 ${GROUND - 110} Q170 ${GROUND - 150} 230 ${GROUND - 115} Q205 ${GROUND - 90} 190 ${GROUND - 70} L205 ${GROUND} Z`} fill="#B5764B" />
			</g>
			{/* Barchan dunes: crescents with horns pointing downwind. */}
			<g opacity={looks.barkan.opacity}>
				{[[380, GROUND + 60, 1], [520, GROUND + 110, 0.8]].map(([x, y, s], index) => (
					<path key={index} d={`M${x} ${y} q${60 * s} ${-70 * s} ${120 * s} 0 q${-20 * s} ${-20 * s} ${-60 * s} ${-30 * s} q${-40 * s} ${10 * s} ${-60 * s} ${30 * s} Z`} fill="#D9B676" stroke="#B8955A" strokeWidth={2} />
				))}
			</g>
			{/* Witness rock: hard caps keep softer layers standing. */}
			<g opacity={looks.sahit.opacity}>
				<path d={`M680 ${GROUND} L690 ${GROUND - 120} L780 ${GROUND - 120} L790 ${GROUND} Z`} fill="#C08A5A" />
				{[0, 1, 2, 3].map((index) => (
					<rect key={index} x={686 + (index % 2) * 4} y={GROUND - 120 + index * 30} width={98 - (index % 2) * 8} height={10} fill="#8E5E3A" />
				))}
			</g>
			{/* Tafoni: hollows in a rock face. */}
			<g opacity={looks.tafoni.opacity}>
				<path d={`M850 ${GROUND} L860 ${GROUND - 90} Q900 ${GROUND - 110} 950 ${GROUND - 80} L960 ${GROUND} Z`} fill="#C89B6D" />
				{[[880, GROUND - 60], [915, GROUND - 40], [930, GROUND - 70]].map(([x, y], index) => (
					<ellipse key={index} cx={x} cy={y} rx={10} ry={7} fill="#7A5534" />
				))}
			</g>
			<Callout id="mantar" x={175} y={GROUND - 120} tx={175} ty={150} text="Mantar kaya" look={looks.mantar} />
			<Callout id="barkan" x={440} y={GROUND + 30} tx={440} ty={570} text="Barkan (hilal kumul)" look={looks.barkan} />
			<Callout id="sahit" x={735} y={GROUND - 120} tx={735} ty={150} text="Şahit kaya" look={looks.sahit} />
			<Callout id="tafoni" x={915} y={GROUND - 40} tx={900} ty={520} text="Tafoni" look={looks.tafoni} />
		</World>
	);
};

// Magma inside the crust and at the surface: intrusions and a volcano in one cross-section.
const VolcanoScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const {t, enter} = useSceneClock(delaySeconds);
	const looks = {
		batolit: usePartLook('batolit', enter(0.5)),
		lakolit: usePartLook('lakolit', enter(1)),
		sill: usePartLook('sill', enter(1.5)),
		dayk: usePartLook('dayk', enter(2)),
		koni: usePartLook('koni', enter(2.5)),
		krater: usePartLook('krater', enter(3)),
		lav: usePartLook('lav', enter(3.5)),
	};
	const GROUND = 250;
	const MAGMA = '#D35400';
	const COOLED = '#7B5B4B';
	const layers = [GROUND, 310, 370, 430, 490, H];
	return (
		<World width={width} height={height}>
			<Sky bottom={GROUND} />
			{/* Rock layers of the crust. */}
			{layers.slice(0, -1).map((top, index) => (
				<rect key={top} x={0} y={top} width={W} height={layers[index + 1] - top} fill={ROCK_BANDS[index % ROCK_BANDS.length]} />
			))}
			{/* Batholith: a wide dome of magma that cooled deep down. */}
			<g opacity={looks.batolit.opacity}>
				<path d="M60 600 Q90 470 220 455 Q350 450 390 520 Q410 560 420 600 Z" fill={COOLED} />
			</g>
			{/* Laccolith: magma that pushed the layers above into a mushroom-shaped dome. */}
			<g opacity={looks.lakolit.opacity}>
				<path d="M560 370 Q640 300 720 370 Z" fill={COOLED} />
				<rect x={634} y={370} width={14} height={120} fill={COOLED} />
			</g>
			{/* Sill: a sheet squeezed between two layers. */}
			<g opacity={looks.sill.opacity}>
				<rect x={420} y={425} width={190} height={11} fill={COOLED} />
				<rect x={604} y={425} width={14} height={65} fill={COOLED} />
			</g>
			{/* Dike: a wall that cuts across the layers. */}
			<g opacity={looks.dayk.opacity}>
				<path d="M250 455 L285 275 L300 278 L266 457 Z" fill={COOLED} />
			</g>
			{/* The volcano: conduit, cone, crater, lava. */}
			<g opacity={looks.koni.opacity}>
				<path d={`M760 ${H} L760 ${GROUND} L780 ${GROUND} L780 ${H} Z`} fill={MAGMA} />
				<path d={`M640 ${GROUND} L740 120 L800 120 L900 ${GROUND} Z`} fill="#6E4B3A" />
				<path d={`M760 ${GROUND} L765 130 L775 130 L780 ${GROUND} Z`} fill={MAGMA} />
			</g>
			<g opacity={looks.krater.opacity}>
				<path d="M740 120 Q770 140 800 120 Z" fill="#3B2A20" />
				{[0, 1, 2].map((index) => (
					<circle key={index} cx={770 + Math.sin(t * 1.5 + index) * 12} cy={100 - ((t * 25 + index * 20) % 60)} r={10 + index * 3} fill="rgba(127, 140, 141, 0.55)" />
				))}
			</g>
			<g opacity={looks.lav.opacity}>
				<path d={`M795 125 Q830 170 850 ${GROUND - 20} Q880 ${GROUND - 5} 930 ${GROUND}`} fill="none" stroke="#E74C3C" strokeWidth={9} strokeLinecap="round" />
			</g>
			<Callout id="batolit" x={230} y={500} tx={230} ty={560} text="Batolit" look={looks.batolit} />
			<Callout id="lakolit" x={640} y={345} tx={520} ty={290} text="Lakolit" look={looks.lakolit} />
			<Callout id="sill" x={500} y={430} tx={500} ty={520} text="Sill" look={looks.sill} />
			<Callout id="dayk" x={278} y={350} tx={140} ty={330} text="Dayk" look={looks.dayk} />
			<Callout id="koni" x={700} y={190} tx={560} ty={150} text="Volkan konisi" look={looks.koni} />
			<Callout id="krater" x={770} y={125} tx={770} ty={40} text="Krater" look={looks.krater} />
			<Callout id="lav" x={850} y={GROUND - 20} tx={930} ty={160} text="Lav" look={looks.lav} />
		</World>
	);
};

// Four coast types from above, each in its own panel: how the mountains run decides the coast.
const CoastTypesScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {t, enter} = useSceneClock(delaySeconds);
	const numbering = useContext(NumberingContext);
	const looks = {
		boyuna: usePartLook('boyuna', enter(0)),
		enine: usePartLook('enine', enter(0.6)),
		dalmacya: usePartLook('dalmacya', enter(1.2)),
		ria: usePartLook('ria', enter(1.8)),
	};
	const LAND = '#B7D39A';
	const RIDGE = '#8D6E63';
	const sea = withAlpha(C.water, 0.85);
	const panels: {id: keyof typeof looks; x: number; y: number; title: string; where: string}[] = [
		{id: 'boyuna', x: 20, y: 20, title: 'Boyuna kıyı', where: 'Dağlar kıyıya paralel · Karadeniz, Akdeniz'},
		{id: 'enine', x: 510, y: 20, title: 'Enine kıyı', where: 'Dağlar kıyıya dik · Ege'},
		{id: 'dalmacya', x: 20, y: 310, title: 'Dalmaçya kıyı', where: 'Kıyıya paralel adalar · Kaş-Finike'},
		{id: 'ria', x: 510, y: 310, title: 'Ria kıyı', where: 'Su basmış akarsu vadileri · Boğazlar'},
	];
	const PW = 470;
	const PH = 270;
	// Each panel: land on top, sea below; drawn in panel coordinates.
	const drawPanel = (id: keyof typeof looks) => {
		switch (id) {
			case 'boyuna':
				return (
					<>
						<path d={`M0 0 L${PW} 0 L${PW} 150 Q${PW * 0.5} 160 0 148 Z`} fill={LAND} />
						{[60, 105].map((y) => (
							<path key={y} d={`M30 ${y} L${PW - 30} ${y - 6}`} stroke={RIDGE} strokeWidth={14} strokeLinecap="round" />
						))}
					</>
				);
			case 'enine':
				// Mountains run down to the sea: wide peninsulas with the sea reaching far in between.
				return (
					<>
						<rect x={0} y={0} width={PW} height={78} fill={LAND} />
						{[70, 185, 300, 410].map((x) => (
							<g key={x}>
								<path d={`M${x - 42} 76 L${x - 30} 196 Q${x} 226 ${x + 30} 196 L${x + 42} 76 Z`} fill={LAND} />
								<path d={`M${x} 18 L${x} 190`} stroke={RIDGE} strokeWidth={12} strokeLinecap="round" />
							</g>
						))}
					</>
				);
			case 'dalmacya':
				return (
					<>
						<path d={`M0 0 L${PW} 0 L${PW} 95 Q${PW * 0.5} 105 0 92 Z`} fill={LAND} />
						<path d={`M30 45 L${PW - 30} 40`} stroke={RIDGE} strokeWidth={12} strokeLinecap="round" />
						{[[60, 150, 120], [210, 145, 150], [380, 155, 70], [100, 210, 160], [300, 215, 110]].map(([x, y, w], index) => (
							<g key={index}>
								<ellipse cx={x + w / 2} cy={y} rx={w / 2} ry={13} fill={LAND} />
								<path d={`M${x + 12} ${y} L${x + w - 12} ${y - 2}`} stroke={RIDGE} strokeWidth={6} strokeLinecap="round" />
							</g>
						))}
					</>
				);
			case 'ria':
				// Drowned river valleys: the sea reaches far inland along winding, branching valleys.
				return (
					<>
						<path d={`M0 0 L${PW} 0 L${PW} 170 L0 170 Z`} fill={LAND} />
						{[[120, 1], [330, -1]].map(([x, side], index) => (
							<g key={index} fill="none" stroke={sea} strokeLinecap="round">
								<path d={`M${x} 176 Q${x - 18} 130 ${x + 6} 95 T${x - 4} 30`} strokeWidth={30} />
								<path d={`M${x + 2} 110 Q${x + 35 * side} 92 ${x + 70 * side} 60`} strokeWidth={16} />
								<path d={`M${x - 6} 70 Q${x - 30 * side} 55 ${x - 55 * side} 30`} strokeWidth={12} />
							</g>
						))}
					</>
				);
		}
	};
	return (
		<World width={width} height={height}>
			{panels.map((panel, index) => {
				const look = looks[panel.id];
				const label = numbering ? (ROMAN[numbering.indexOf(panel.id)] ?? panel.title) : panel.title;
				return (
					<g key={panel.id} opacity={look.opacity} transform={`translate(${panel.x} ${panel.y})`}>
						<rect x={0} y={0} width={PW} height={PH} rx={14} fill={sea} />
						{Array.from({length: 3}, (_, wave) => (
							<path key={wave} d={`M${((t * 25 + wave * 160 + index * 40) % (PW + 80)) - 60} ${PH - 40 + wave * 10} q20 -7 40 0 t40 0`} fill="none" stroke={withAlpha('#FFFFFF', 0.6)} strokeWidth={2.5} />
						))}
						<g>{drawPanel(panel.id)}</g>
						<rect x={0} y={0} width={PW} height={PH} rx={14} fill="none" stroke={look.focused > 0.5 ? palette.lesson : palette.border} strokeWidth={look.focused > 0.5 ? 6 : 2} />
						<Tag x={16} y={PH - 46} text={label} size={numbering ? 30 : 22} weight={800} focused={look.focused} />
						{numbering ? null : <Tag x={16} y={PH - 18} text={panel.where} size={16} weight={600} />}
					</g>
				);
			})}
		</World>
	);
};

// A mature soil cut open: A, B, C horizons over the parent rock.
const SoilScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {enter} = useSceneClock(delaySeconds);
	const numbering = useContext(NumberingContext);
	const looks = {
		ahorizon: usePartLook('ahorizon', enter(0.5)),
		bhorizon: usePartLook('bhorizon', enter(1)),
		chorizon: usePartLook('chorizon', enter(1.5)),
		dhorizon: usePartLook('dhorizon', enter(2)),
	};
	const left = 120;
	const right = 520;
	const bands: {id: keyof typeof looks; top: number; bottom: number; fill: string; name: string; text: string}[] = [
		{id: 'ahorizon', top: 90, bottom: 200, fill: '#4E3B2A', name: 'A horizonu · yıkanma katı', text: 'Humuslu, canlı ve verimli üst kat'},
		{id: 'bhorizon', top: 200, bottom: 320, fill: '#8C6A4A', name: 'B horizonu · birikme katı', text: 'Yukarıdan yıkanan kireç ve tuz birikir'},
		{id: 'chorizon', top: 320, bottom: 450, fill: '#B49A7A', name: 'C horizonu · ayrışma katı', text: 'Ana kayadan kopmuş iri parçalar'},
		{id: 'dhorizon', top: 450, bottom: 580, fill: '#7E7B76', name: 'D horizonu · ana kaya', text: 'Toprağın oluştuğu ana materyal'},
	];
	return (
		<World width={width} height={height}>
			<Sky bottom={90} />
			{/* Grass on top. */}
			{Array.from({length: 26}, (_, index) => (
				<path key={index} d={`M${left + 8 + index * 15} 90 l-4 -18 M${left + 8 + index * 15} 90 l5 -14`} stroke="#4E9145" strokeWidth={3} strokeLinecap="round" />
			))}
			{bands.map((band, index) => {
				const look = looks[band.id];
				const label = numbering ? (ROMAN[numbering.indexOf(band.id)] ?? band.name) : band.name;
				return (
					<g key={band.id} opacity={look.opacity}>
						<path d={`M${left} ${band.bottom} L${left} ${band.top} Q${(left + right) / 2} ${band.top + (index === 0 ? 0 : 8)} ${right} ${band.top} L${right} ${band.bottom} Z`} fill={band.fill} stroke={look.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={5} />
						{/* Texture: roots in A, white specks in B, stones in C, blocks in D. */}
						{index === 0 ? Array.from({length: 8}, (_, root) => <path key={root} d={`M${left + 30 + root * 48} ${band.top} q8 30 -4 60`} stroke="#C8A27A" strokeWidth={2} fill="none" />) : null}
						{index === 1 ? Array.from({length: 18}, (_, speck) => <circle key={speck} cx={left + 20 + ((speck * 67) % 360)} cy={band.top + 20 + ((speck * 37) % 90)} r={3} fill="#EDE6DA" />) : null}
						{index === 2 ? Array.from({length: 12}, (_, stone) => <ellipse key={stone} cx={left + 30 + ((stone * 83) % 340)} cy={band.top + 25 + ((stone * 41) % 90)} rx={18} ry={11} fill="#958067" />) : null}
						{index === 3 ? [0, 1, 2].map((row) => <line key={row} x1={left} y1={band.top + 40 + row * 35} x2={right} y2={band.top + 40 + row * 35} stroke="#5E5B57" strokeWidth={2} />) : null}
						<line x1={right + 6} y1={(band.top + band.bottom) / 2} x2={right + 34} y2={(band.top + band.bottom) / 2} stroke={look.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={2.5} />
						<Tag x={right + 42} y={(band.top + band.bottom) / 2 - 12} text={label} size={numbering ? 30 : 22} weight={800} focused={look.focused} />
						{numbering ? null : <Tag x={right + 42} y={(band.top + band.bottom) / 2 + 16} text={band.text} size={17} weight={600} fill={palette.muted} />}
					</g>
				);
			})}
		</World>
	);
};

// A belt's label right of the slope: its name, and its height range under it (one line would run off the scene),
// or only its numeral on a question figure.
const BeltLabel: React.FC<{y: number; numeral?: string; name: string; range: string; focused: number}> = ({y, numeral, name, range, focused}) =>
	numeral !== undefined ? (
		<Tag x={688} y={y} text={numeral} size={30} weight={800} focused={focused} />
	) : (
		<>
			<Tag x={688} y={y - 12} text={name} size={20} weight={800} focused={focused} />
			<Tag x={688} y={y + 13} text={range} size={16} weight={600} focused={focused} />
		</>
	);

// Plant belts up a southern Taurus slope: the higher, the colder; each belt is named with its height.
const VegetationScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {enter} = useSceneClock(delaySeconds);
	const numbering = useContext(NumberingContext);
	const looks = {
		maki: usePartLook('maki', enter(0.4)),
		kizilcam: usePartLook('kizilcam', enter(0.9)),
		karacam: usePartLook('karacam', enter(1.4)),
		agacsiniri: usePartLook('agacsiniri', enter(1.9)),
		alpin: usePartLook('alpin', enter(2.4)),
	};
	const SEA = 540;
	// Height (m) to y: 0 m at the sea, 3000 m near the top.
	const yOf = (metres: number) => SEA - (metres / 3000) * 470;
	const slope = (y: number) => 80 + ((SEA - y) / 470) * 560; // the slope's x at height y (rising to the right)
	const belts: {id: keyof typeof looks; from: number; to: number; color: string; name: string; range: string; tree: 'bush' | 'pine' | 'fir' | 'grass'}[] = [
		{id: 'maki', from: 0, to: 600, color: '#9DBF6B', name: 'Maki', range: '0–600 m', tree: 'bush'},
		{id: 'kizilcam', from: 600, to: 1200, color: '#6FA35A', name: 'Kızılçam', range: '600–1.200 m', tree: 'pine'},
		{id: 'karacam', from: 1200, to: 2000, color: '#3F7D4A', name: 'Karaçam, sedir', range: '1.200–2.000 m', tree: 'fir'},
		{id: 'alpin', from: 2200, to: 3000, color: '#C9D9A8', name: 'Alpin çayırlar', range: '2.200 m üstü', tree: 'grass'},
	];
	return (
		<World width={width} height={height}>
			<Sky bottom={SEA} />
			<rect x={0} y={SEA} width={W} height={H - SEA} fill={withAlpha(C.water, 0.85)} />
			{/* The mountain: one slope rising from the sea on the left to the summit on the right. */}
			<path d={`M60 ${SEA} L${slope(yOf(3000))} ${yOf(3000)} L${W} ${yOf(2600)} L${W} ${SEA} Z`} fill="#A1887F" />
			{belts.map((belt) => {
				const look = looks[belt.id];
				const y1 = yOf(belt.from);
				const y2 = yOf(belt.to);
				const numeral = numbering ? (ROMAN[numbering.indexOf(belt.id)] ?? belt.name) : undefined;
				const trees = Array.from({length: 7}, (_, index) => {
					const y = y1 - ((index + 0.5) / 7) * (y1 - y2);
					return {x: slope(y) + 10 + (index % 2) * 18, y};
				});
				return (
					<g key={belt.id} opacity={look.opacity}>
						<path d={`M${slope(y1)} ${y1} L${slope(y2)} ${y2} L${slope(y2) + 260} ${y2 + 30} L${slope(y1) + 260} ${y1 + 30} Z`} fill={belt.color} opacity={0.55} />
						{trees.map((tree, index) =>
							belt.tree === 'bush' ? (
								<circle key={index} cx={tree.x} cy={tree.y - 8} r={9} fill="#5E8C3A" />
							) : belt.tree === 'grass' ? (
								<path key={index} d={`M${tree.x} ${tree.y} l-4 -12 M${tree.x} ${tree.y} l4 -10`} stroke="#6B8E23" strokeWidth={3} />
							) : (
								<path key={index} d={`M${tree.x} ${tree.y - (belt.tree === 'fir' ? 34 : 26)} l${belt.tree === 'fir' ? 9 : 12} ${belt.tree === 'fir' ? 30 : 20} l${belt.tree === 'fir' ? -18 : -24} 0 z`} fill={belt.tree === 'fir' ? '#1F5E3A' : '#3E7D3A'} />
							),
						)}
						<line x1={slope((y1 + y2) / 2) + 40} y1={(y1 + y2) / 2} x2={680} y2={(y1 + y2) / 2} stroke={look.focused > 0.5 ? palette.lesson : palette.muted} strokeWidth={2} strokeDasharray="5 5" />
						<BeltLabel y={(y1 + y2) / 2} numeral={numeral} name={belt.name} range={belt.range} focused={look.focused} />
					</g>
				);
			})}
			{/* The tree line. */}
			<g opacity={looks.agacsiniri.opacity}>
				<line x1={slope(yOf(2100)) - 30} y1={yOf(2100)} x2={680} y2={yOf(2100)} stroke={looks.agacsiniri.focused > 0.5 ? palette.lesson : '#7B241C'} strokeWidth={3} strokeDasharray="12 8" />
				<BeltLabel y={yOf(2100)} numeral={numbering ? (ROMAN[numbering.indexOf('agacsiniri')] ?? '') : undefined} name="Orman üst sınırı" range="~2.100 m" focused={looks.agacsiniri.focused} />
			</g>
			<Tag x={20} y={SEA + 30} text="Akdeniz · güney yamaç" size={18} />
		</World>
	);
};

// A slope of layers parallel to it, soaked by rain: the clay layer becomes a slip surface, a block slides down and
// dams the valley. The block starts to slide when a beat points at it (or 2 s in without beats).
const LandslideScene: React.FC<VisualBoxProps & {visual: Landform}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {seconds, t, enter} = useSceneClock(delaySeconds);
	const looks = {
		egim: usePartLook('egim', enter(0.3)),
		tabaka: usePartLook('tabaka', enter(0.7)),
		su: usePartLook('su', enter(1.1)),
		kayma: usePartLook('kayma', enter(1.5)),
		kutle: usePartLook('kutle', enter(1.9)),
		set: usePartLook('set', enter(2.3)),
	};
	// Both hooks always run (hooks must not be skipped); the first beat that points at or shows the block wins.
	const focusStart = useBeatStartFor('kutle', 'focus');
	const showStart = useBeatStartFor('kutle', 'show');
	const slideFrom = focusStart ?? showStart ?? delaySeconds + 2.4;
	const slide = smoothStep(Math.min(1, Math.max(0, (seconds - slideFrom) / 3.5)));
	// The slope runs from A (top right) down to B (valley floor); n points into the ground.
	const A = [880, 150] as const;
	const B = [270, 470] as const;
	const length = Math.hypot(B[0] - A[0], B[1] - A[1]);
	const u = [(B[0] - A[0]) / length, (B[1] - A[1]) / length] as const;
	const n = [u[1], -u[0]] as const; // about (0.46, 0.89): down into the hill
	const at = (s: number, depth = 0) => [A[0] + (B[0] - A[0]) * s + n[0] * depth, A[1] + (B[1] - A[1]) * s + n[1] * depth] as const;
	const depths = [0, 46, 92, 150, 220];
	const fills = ['#B98B5A', '#8E8E7A', '#C9A97A', '#A27747'];
	const ground = pathOf([[0, 470], B, A, [W, 140], [W, H], [0, H]], true);
	const clip = `ls${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	// The sliding block: the top layer between s = 0.28 and 0.62, moved down-slope and slightly rotated.
	const s1 = 0.28;
	const s2 = 0.62;
	const travel = slide * 230;
	const block = [at(s1, 0), at(s2, 0), at(s2, depths[1]), at(s1, depths[1])].map(([x, y]) => [x + u[0] * travel, y + u[1] * travel + slide * 18] as const);
	const toe = at(1, 0);
	const angle = (Math.atan2(A[1] - B[1], A[0] - B[0]) * 180) / Math.PI; // about 28° above the horizontal
	return (
		<World width={width} height={height}>
			<Sky bottom={470} />
			{/* Rain over the slope. */}
			<g opacity={looks.su.opacity}>
				{Array.from({length: 16}, (_, index) => {
					const x = 420 + index * 34;
					const fall = (t * 160 + index * 37) % 90;
					return <line key={index} x1={x} y1={30 + fall} x2={x - 8} y2={52 + fall} stroke="#5B9BD5" strokeWidth={3} strokeLinecap="round" />;
				})}
			</g>
			<defs>
				<clipPath id={clip}>
					<path d={ground} />
				</clipPath>
			</defs>
			<path d={ground} fill="#A27747" />
			{/* Layers parallel to the slope. */}
			<g clipPath={`url(#${clip})`} opacity={Math.max(0.55, looks.tabaka.opacity)}>
				{fills.map((fill, index) => (
					<path key={index} d={pathOf([at(-0.4, depths[index]), at(1.6, depths[index]), at(1.6, depths[index + 1]), at(-0.4, depths[index + 1])], true)} fill={fill} stroke={looks.tabaka.focused > 0.5 ? palette.lesson : withAlpha('#3D2B1A', 0.35)} strokeWidth={looks.tabaka.focused > 0.5 ? 3 : 1.5} />
				))}
				{/* The top layer soaked with water. */}
				<path d={pathOf([at(-0.4, 0), at(1.6, 0), at(1.6, depths[1]), at(-0.4, depths[1])], true)} fill="#5B9BD5" opacity={0.35 * looks.su.opacity} />
				{/* Where the block was: the scar. */}
				<path d={pathOf([at(s1, 0), at(s2, 0), at(s2, depths[1]), at(s1, depths[1])], true)} fill="#7A6A55" opacity={slide} />
			</g>
			{/* Water soaking in. */}
			<g opacity={looks.su.opacity}>
				{[0.3, 0.45, 0.6, 0.75].map((s) => {
					const [x, y] = at(s, -8);
					return <path key={s} d={`M${x} ${y - 26} L${x + n[0] * 30} ${y + n[1] * 30} m-8 -6 l8 6 l2 -10`} fill="none" stroke="#2F6A9F" strokeWidth={3.5} strokeLinecap="round" />;
				})}
			</g>
			{/* The clay layer as the slip surface. */}
			<g opacity={looks.kayma.opacity}>
				<path d={pathOf([at(0.1, depths[1]), at(0.95, depths[1])])} stroke={looks.kayma.focused > 0.5 ? palette.lesson : '#7B241C'} strokeWidth={5} strokeDasharray="14 9" fill="none" />
			</g>
			{/* The lake dammed behind the slid mass. */}
			<g opacity={looks.set.opacity * slide}>
				<ellipse cx={150} cy={472} rx={30 + 95 * slide} ry={10 + 8 * slide} fill="#5B9BD5" stroke={looks.set.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={4} />
			</g>
			{/* The sliding block. */}
			<g opacity={Math.max(looks.kutle.opacity, 0.85)}>
				<path d={pathOf(block, true)} fill="#9C7046" stroke={looks.kutle.focused > 0.5 ? palette.lesson : '#3D2B1A'} strokeWidth={looks.kutle.focused > 0.5 ? 5 : 2} />
				{[0.25, 0.5, 0.75].map((share) => {
					const [x, y] = [block[0][0] + (block[1][0] - block[0][0]) * share, block[0][1] + (block[1][1] - block[0][1]) * share];
					return <path key={share} d={`M${x} ${y} l-6 -26 l6 4 l6 -4 z`} fill="#3E7D3A" />;
				})}
			</g>
			{/* The slope angle at the foot. */}
			<g opacity={looks.egim.opacity}>
				<line x1={toe[0]} y1={toe[1]} x2={toe[0] + 150} y2={toe[1]} stroke={palette.ink} strokeWidth={2} strokeDasharray="8 6" />
				<path d={`M${toe[0] + 95} ${toe[1]} A95 95 0 0 0 ${toe[0] + 95 * Math.cos((angle * Math.PI) / 180)} ${toe[1] - 95 * Math.sin((angle * Math.PI) / 180)}`} fill="none" stroke={looks.egim.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={3.5} />
			</g>
			<Callout id="egim" x={toe[0] + 110} y={toe[1] - 22} tx={toe[0] + 210} ty={toe[1] + 50} text="Eğim fazla" look={looks.egim} anchor="start" />
			<Callout id="su" x={at(0.16, -6)[0]} y={at(0.16, -6)[1]} tx={985} ty={100} text="Yağış ve kar suyu zemini doyurur" look={looks.su} anchor="end" />
			<Callout id="tabaka" x={at(0.9, 120)[0]} y={at(0.9, 120)[1]} tx={560} ty={560} text="Tabakalar yamaca paralel" look={looks.tabaka} />
			<Callout id="kayma" x={at(0.3, depths[1])[0]} y={at(0.3, depths[1])[1]} tx={985} ty={300} text="Kil tabakası: kayma yüzeyi" look={looks.kayma} anchor="end" />
			<Callout id="kutle" x={(block[0][0] + block[2][0]) / 2} y={(block[0][1] + block[2][1]) / 2} tx={330} ty={200} text="Kütle yamaçtan kayar" look={looks.kutle} />
			<Callout id="set" x={150} y={474} tx={130} ty={560} text="Vadi kapanır: set gölü" look={looks.set} />
		</World>
	);
};
