import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, Tap, type Key, type Shape} from '../PromoKit/PromoMotion';

/**
 * The exam weather forecast (Kasım 2026, 16 Kasım). A TV weather bulletin,
 * only graphics, no presenter: the lessons are regions of a tile map with
 * their weather (sunny, partly cloudy, windy, a storm over Matematik) and the
 * net in place of the temperature; a ticker runs at the bottom. The regions
 * then fold into the rows of the last exam's topic-by-topic result (one shape
 * each, no cut), and the stormy row becomes this week's study-plan task under
 * an umbrella. The weather is the result of a real exam, not a prediction.
 */

const narration = z.string().trim().min(1).max(170);
const WEATHER = ['sun', 'partly', 'wind', 'storm'] as const;
type Weather = (typeof WEATHER)[number];

const StudyForecastSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(24)]), narration}),
	bulletin: z.object({title: plainText(22), exam: plainText(22)}),
	/** Four lessons, in map order: top left, top right (tall), bottom left, bottom right. */
	regions: z.array(z.object({lesson: plainText(12), weather: z.enum(WEATHER), net: plainText(5), of: plainText(3)})).length(4),
	map: z.object({ticker: z.array(plainText(44)).min(2).max(4), narration}),
	result: z.object({title: plainText(26), weak: plainText(26), narration}),
	task: z.object({line: plainText(22), kicker: plainText(22), title: plainText(18), meta: plainText(26), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof StudyForecastSchema>;

const NAVY = '#0B1C30';
const STUDIO = '#0E2A4D';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const PLAN = MODULES.studyPlan.color.light;

/** Each weather's tile colour and the ink on it. */
const SKY: Record<Weather, {fill: string; ink: string; label: string}> = {
	sun: {fill: '#FCD34D', ink: NAVY, label: 'Güneşli'},
	partly: {fill: '#7DD3FC', ink: NAVY, label: 'Parçalı bulutlu'},
	wind: {fill: '#86EFAC', ink: NAVY, label: 'Hafif rüzgârlı'},
	storm: {fill: '#334155', ink: WHITE, label: 'Fırtına'},
};

/** The tile map (canvas px): top left, top right (tall), bottom left, bottom right. */
const TILES: Omit<Shape, 'fill'>[] = [
	{x: 50, y: 330, w: 480, h: 380, radius: 44},
	{x: 550, y: 330, w: 352, h: 560, radius: 44},
	{x: 50, y: 730, w: 480, h: 400, radius: 44},
	{x: 550, y: 910, w: 352, h: 220, radius: 44},
];
/** The result card's rows the tiles fold into. */
const ROW = (index: number): Omit<Shape, 'fill'> => ({x: 80, y: 430 + index * 156, w: 792, h: 136, radius: 30});
const CARD = {x: 46, y: 300, w: 860, h: 820};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 35%, #1D4F8C 0%, ${STUDIO} 55%, ${NAVY} 100%)`}} />;

/** A cloud of three puffs, drawn in a 120 × 70 box. */
const Cloud: React.FC<{size: number; color: string}> = ({size, color}) => {
	const {u} = useVideoLayout();
	return (
		<svg width={u(size)} height={u(size * 0.58)} viewBox="0 0 120 70" style={{display: 'block', overflow: 'visible'}}>
			<path d="M24 66 a22 22 0 0 1 2-44 a28 28 0 0 1 52-6 a22 22 0 0 1 20 28 a16 16 0 0 1 -4 22 Z" fill={color} />
		</svg>
	);
};

/** The weather symbol, moving: the sun turns, clouds drift, wind blows, the storm rains and flashes. */
const WeatherIcon: React.FC<{weather: Weather; size: number; seconds: number}> = ({weather, size, seconds}) => {
	const {u} = useVideoLayout();
	const box: React.CSSProperties = {position: 'relative', width: u(size), height: u(size)};
	if (weather === 'sun') {
		return (
			<div style={box}>
				<svg width={u(size)} height={u(size)} viewBox="0 0 100 100" style={{transform: `rotate(${seconds * 30}deg)`}}>
					{Array.from({length: 10}, (_, index) => (
						<line key={index} x1="50" y1="6" x2="50" y2="18" stroke={ORANGE} strokeWidth="6" strokeLinecap="round" transform={`rotate(${index * 36} 50 50)`} />
					))}
					<circle cx="50" cy="50" r="24" fill={ORANGE} />
				</svg>
			</div>
		);
	}
	if (weather === 'partly') {
		return (
			<div style={box}>
				<svg width={u(size * 0.7)} height={u(size * 0.7)} viewBox="0 0 100 100" style={{position: 'absolute', right: 0, top: 0}}>
					<circle cx="50" cy="50" r="30" fill={ORANGE} />
				</svg>
				<div style={{position: 'absolute', left: u(Math.sin(seconds * 1.4) * size * 0.06), bottom: u(size * 0.08)}}>
					<Cloud size={size * 0.9} color={WHITE} />
				</div>
			</div>
		);
	}
	if (weather === 'wind') {
		return (
			<div style={box}>
				<svg width={u(size)} height={u(size)} viewBox="0 0 100 100">
					{[28, 50, 72].map((y, index) => (
						<path key={y} d={`M${8 + index * 6} ${y} H${70 - index * 8} a10 10 0 1 0 -10 -10`} fill="none" stroke={NAVY} strokeWidth="6" strokeLinecap="round" strokeDasharray="120" strokeDashoffset={(seconds * 90 + index * 30) % 240 - 120} />
					))}
				</svg>
			</div>
		);
	}
	const flash = (seconds * 1.6) % 1 < 0.08;
	return (
		<div style={box}>
			{[0, 1, 2, 3, 4].map((index) => {
				const fall = (seconds * 1.8 + index * 0.23) % 1;
				return <div key={index} style={{position: 'absolute', left: u(size * (0.18 + index * 0.15)), top: u(size * (0.5 + fall * 0.45)), width: u(size * 0.035), height: u(size * 0.14), borderRadius: u(4), background: '#93C5FD', opacity: 1 - fall, transform: 'rotate(12deg)'}} />;
			})}
			<div style={{position: 'absolute', left: 0, top: u(size * 0.05)}}>
				<Cloud size={size} color={flash ? '#E2E8F0' : '#94A3B8'} />
			</div>
			<svg width={u(size * 0.36)} height={u(size * 0.5)} viewBox="0 0 36 50" style={{position: 'absolute', left: u(size * 0.36), top: u(size * 0.42)}}>
				<path d="M20 0 L4 28 H16 L10 50 L32 18 H20 L26 0 Z" fill="#FDE047" />
			</svg>
		</div>
	);
};

/** One region of the lesson map: its name and weather at the top, the net as the "temperature" at the bottom, the symbol beside. */
const RegionFace: React.FC<{region: Content['regions'][number]; tall: boolean; small: boolean; seconds: number; count: number}> = ({region, tall, small, seconds, count}) => {
	const {u} = useVideoLayout();
	const sky = SKY[region.weather];
	const pad = small ? 26 : 34;
	const icon = small ? 100 : tall ? 230 : 160;
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<div style={{position: 'absolute', left: u(pad), top: u(pad), display: 'flex', flexDirection: 'column', gap: u(4)}}>
				<Text variant="display" size={small ? 44 : 54} weight={TYPE.weights.kinetic} color={sky.ink}>
					{region.lesson}
				</Text>
				<Text size={small ? 26 : 32} weight={TYPE.weights.display} color={sky.ink} style={{opacity: 0.75}}>
					{sky.label}
				</Text>
			</div>
			<div style={tall ? {position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -55%)'} : {position: 'absolute', right: u(pad), ...(small ? {bottom: u(pad - 6)} : {top: u(pad)})}}>
				<WeatherIcon weather={region.weather} size={icon} seconds={seconds} />
			</div>
			<div style={{position: 'absolute', left: u(pad), bottom: u(pad - 6), display: 'flex', alignItems: 'baseline', gap: u(8), opacity: count}}>
				<Text variant="display" size={small ? 64 : 96} weight={TYPE.weights.kinetic} color={sky.ink} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
					{region.net}
				</Text>
				<Text size={small ? 26 : 32} weight={TYPE.weights.display} color={sky.ink} style={{opacity: 0.75}}>
					{`/${region.of} net`}
				</Text>
			</div>
		</div>
	);
};

/** One row of the topic-by-topic result: the weather small, the lesson, the net and its bar. */
const RowFace: React.FC<{region: Content['regions'][number]; weak?: string; seconds: number}> = ({region, weak, seconds}) => {
	const {u} = useVideoLayout();
	const sky = SKY[region.weather];
	const share = Number(region.net.replace(',', '.')) / Number(region.of);
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: u(22), padding: `0 ${u(28)}px`}}>
			<div style={{width: u(84), height: u(84), borderRadius: u(24), background: sky.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<WeatherIcon weather={region.weather} size={62} seconds={seconds} />
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: u(10)}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
					<Text size={40} weight={TYPE.weights.kinetic} color={NAVY}>
						{region.lesson}
					</Text>
					<Text size={36} weight={TYPE.weights.kinetic} color={region.weather === 'storm' ? ORANGE : NAVY} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{`${region.net}/${region.of}`}
					</Text>
				</div>
				<div style={{height: u(14), borderRadius: u(7), background: '#E2E8F0', overflow: 'hidden'}}>
					<div style={{width: `${Math.round(share * 100)}%`, height: '100%', borderRadius: u(7), background: region.weather === 'storm' ? ORANGE : '#0F766E'}} />
				</div>
				{weak ? (
					<Text size={28} weight={TYPE.weights.display} color={ORANGE}>
						{weak}
					</Text>
				) : null}
			</div>
		</div>
	);
};

/** The bulletin's lower third: the label, the exam and the ticker running. */
const Ticker: React.FC<{content: Content; seconds: number}> = ({content, seconds}) => {
	const {u} = useVideoLayout();
	const text = content.map.ticker.join('   •   ');
	return (
		<div style={{position: 'absolute', left: 0, top: u(1180), width: u(952), height: u(84), display: 'flex', borderRadius: u(20), overflow: 'hidden', background: WHITE}}>
			<div style={{padding: `0 ${u(24)}px`, background: ORANGE, display: 'flex', alignItems: 'center', flexShrink: 0}}>
				<Text size={32} weight={TYPE.weights.kinetic} color={WHITE}>
					{content.bulletin.exam}
				</Text>
			</div>
			<div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
				<div style={{position: 'absolute', top: u(18), left: u(30 - ((seconds * 160) % (text.length * 22 + 300))), whiteSpace: 'nowrap'}}>
					<Text size={36} weight={TYPE.weights.display} color={NAVY} style={{whiteSpace: 'nowrap'}}>
						{`${text}   •   ${text}`}
					</Text>
				</div>
			</div>
		</div>
	);
};

/** The bulletin's title strip at the top. */
const Title: React.FC<{content: Content; opacity?: number}> = ({content, opacity = 1}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(50), top: u(220), display: 'flex', alignItems: 'center', gap: u(14), opacity}}>
			<div style={{width: u(18), height: u(18), borderRadius: '50%', background: ORANGE}} />
			<Text size={36} weight={TYPE.weights.kinetic} color={WHITE} style={{letterSpacing: '0.04em'}}>
				{content.bulletin.title.toLocaleUpperCase('tr')}
			</Text>
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const tileOf = (content: Content, index: number): Shape => ({...TILES[index], fill: SKY[content.regions[index].weather].fill});
const stormIndex = (content: Content) => Math.max(0, content.regions.findIndex((region) => region.weather === 'storm'));

/** The tile map with every region; `count` brings the nets in. */
const RegionMap: React.FC<{content: Content; count: number}> = ({content, count}) => {
	const seconds = useSeconds();
	return (
		<>
			{content.regions.map((region, index) => (
				<Morph key={region.lesson} keys={[{at: 0, to: tileOf(content, index)}]} sound={null} render={() => <RegionFace region={region} tall={index === 1} small={index === 3} seconds={seconds} count={count} />} />
			))}
		</>
	);
};

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const storm = TILES[stormIndex(content)];
	return (
		<Stage>
			{/* Close on the storm first; the camera pulls back on the next scene. */}
			<CameraZoom keys={[{at: 0, to: {x: storm.x + storm.w / 2, y: storm.y + storm.h / 2 + 60, zoom: 1.35}}]}>
				<RegionMap content={content} count={1} />
			</CameraZoom>
			<SoundEffect id="thunder" atSeconds={0.05} volume={0.8} />
			{/* A dark band behind the hook, so the words stay clear over the tiles. */}
			<div style={{position: 'absolute', left: u(-200), right: u(-200), top: u(-200), height: u(620), background: `linear-gradient(180deg, ${NAVY} 55%, transparent 100%)`}} />
			<At y={60} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline * 0.85} color={WHITE} />
			</At>
			<At y={165} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline * 0.92} color={ORANGE} />
			</At>
		</Stage>
	);
};

const MapScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const storm = TILES[stormIndex(content)];
	const count = ease(interpolate(seconds, [0.3, 0.9], [0, 1], CLAMP));
	return (
		<Stage>
			<Title content={content} />
			<CameraZoom
				keys={[
					{at: 0, to: {x: storm.x + storm.w / 2, y: storm.y + storm.h / 2 + 60, zoom: 1.35}},
					{at: 0.05, to: {x: 476, y: 765, zoom: 1}},
				]}
			>
				<RegionMap content={content} count={count} />
			</CameraZoom>
			<Ticker content={content} seconds={seconds} />
			{content.regions.map((region, index) => <SoundEffect key={region.lesson} id="pop" atSeconds={0.3 + index * 0.12} volume={0.5} />)}
		</Stage>
	);
};

const ResultScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const card = useLand(0, 160, 22);
	const storm = stormIndex(content);
	return (
		<Stage>
			<div style={{position: 'absolute', left: u(CARD.x), top: u(CARD.y), width: u(CARD.w), height: u(CARD.h), borderRadius: u(44), background: WHITE, opacity: card, transform: `scale(${interpolate(card, [0, 1], [0.94, 1])})`, boxShadow: `0 ${u(40)}px ${u(80)}px -${u(30)}px rgba(0,0,0,0.5)`}} />
			<At x={CARD.x + 34} y={CARD.y + 40} w={CARD.w - 68}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(14), opacity: card}}>
					<div style={{width: u(54), height: u(54), borderRadius: u(16), background: MODULES.exam.color.light, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="exam" size={u(32)} color={WHITE} stroke={2.2} />
					</div>
					<Text size={40} weight={TYPE.weights.kinetic} color={NAVY}>
						{content.result.title}
					</Text>
				</div>
			</At>
			{content.regions.map((region, index) => {
				const keys: Key<Shape>[] = [
					{at: 0, to: tileOf(content, index)},
					{at: 0.08 + index * 0.06, to: {...ROW(index), fill: index === storm ? '#FFF7ED' : '#F8FAFC'}},
				];
				return (
					<Morph
						key={region.lesson}
						keys={keys}
						sound={index === 0 ? 'morph' : null}
						render={(state) => (state === 0 ? <RegionFace region={region} tall={index === 1} small={index === 3} seconds={seconds} count={1} /> : <RowFace region={region} weak={index === storm ? content.result.weak : undefined} seconds={seconds} />)}
					/>
				);
			})}
		</Stage>
	);
};

/** An umbrella opening: the canopy widens from closed to open over `open`. */
const Umbrella: React.FC<{size: number; open: number}> = ({size, open}) => {
	const {u} = useVideoLayout();
	return (
		<svg width={u(size)} height={u(size)} viewBox="0 0 100 100" style={{display: 'block'}}>
			<g transform={`translate(50 0) scale(${0.25 + open * 0.75} 1) translate(-50 0)`}>
				<path d="M6 46 Q50 -8 94 46 Q83 38 72 46 Q61 38 50 46 Q39 38 28 46 Q17 38 6 46 Z" fill={ORANGE} />
			</g>
			<path d="M50 44 V84 a8 8 0 0 1 -16 0" fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round" />
		</svg>
	);
};

const TaskScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const storm = stormIndex(content);
	const region = content.regions[storm];
	const open = ease(interpolate(seconds, [0.6, 1.1], [0, 1], CLAMP));
	const line = useLand(0.1, 150, 20);
	const tapAt = Math.min(total - 0.6, 1.7);
	const done = seconds >= tapAt + 0.05;
	const TASK: Shape = {x: 76, y: 540, w: 800, h: 500, radius: 44, fill: PLAN};
	return (
		<Stage>
			<At y={250} w={952}>
				<div style={{opacity: Math.min(1, line * 1.5), transform: `scale(${interpolate(line, [0, 1], [1.12, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.task.line}
					</Text>
				</div>
			</At>
			{/* The stormy row becomes the plan's task. */}
			<Morph
				keys={[
					{at: 0, to: {...ROW(storm), fill: '#FFF7ED'}},
					{at: 0.05, to: TASK},
				]}
				shadow="0 40px 80px -30px rgba(0,0,0,0.55)"
				render={(state) =>
					state === 0 ? (
						<RowFace region={region} weak={content.result.weak} seconds={seconds} />
					) : (
						<div style={{position: 'absolute', inset: 0, padding: u(44), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(16)}}>
							<div style={{display: 'flex', alignItems: 'center', gap: u(12)}}>
								<Icon name="calendar" size={u(36)} color={WHITE} stroke={2.4} />
								<Text size={34} weight={TYPE.weights.display} color="rgba(255,255,255,0.85)">
									{content.task.kicker}
								</Text>
							</div>
							<Text variant="display" size={96} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1.05}}>
								{content.task.title}
							</Text>
							<Text size={36} weight={TYPE.weights.display} color="rgba(255,255,255,0.85)">
								{content.task.meta}
							</Text>
							<div style={{marginTop: 'auto', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(16)}px ${u(30)}px`, borderRadius: u(999), background: done ? WHITE : 'rgba(255,255,255,0.18)'}}>
								<Icon name={done ? 'check' : 'play'} size={u(32)} color={done ? PLAN : WHITE} stroke={2.6} />
								<Text size={36} weight={TYPE.weights.kinetic} color={done ? PLAN : WHITE}>
									{done ? 'Plana eklendi' : 'Plana ekle'}
								</Text>
							</div>
						</div>
					)
				}
			/>
			<At x={TASK.x + TASK.w - 280} y={TASK.y - 200} w={270}>
				<div style={{opacity: open}}>
					<Umbrella size={270} open={open} />
				</div>
			</At>
			<SoundEffect id="transitionWhoosh" atSeconds={0.6} volume={0.6} />
			<Tap x={TASK.x + 44 + 150} y={TASK.y + TASK.h - 44 - 36} at={tapAt} />
			<SoundEffect id="success" atSeconds={tapAt + 0.05} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof StudyForecastSchema> = {
	hook: {lines: ['Sınav hava durumu:', 'Matematik’te fırtına.'], narration: 'Sınav hava durumu: Matematik’te fırtına.'},
	bulletin: {title: 'Sınav hava durumu', exam: 'TYT · son deneme'},
	regions: [
		{lesson: 'Türkçe', weather: 'sun', net: '31', of: '40'},
		{lesson: 'Matematik', weather: 'storm', net: '12', of: '40'},
		{lesson: 'Fen', weather: 'partly', net: '11', of: '20'},
		{lesson: 'Sosyal', weather: 'wind', net: '14', of: '20'},
	],
	map: {ticker: ['Problemlerde yoğun yağış bekleniyor', 'Paragrafta açık hava', 'Fen’de öğleden sonra açılma'], narration: 'Türkçe’de güneşli, Fen’de parçalı bulutlu.'},
	result: {title: 'Son deneme · konu konu', weak: 'Problemler · 2/10', narration: 'Tahmin değil, son denemenin sonucu.'},
	task: {line: 'Şemsiyeni hazırla.', kicker: 'Bu haftanın görevi', title: 'Problemler', meta: '4 gün · günde 25 dk', narration: 'Şemsiyeni hazırla: bu haftanın görevi Problemler.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const map = say('map', content.map.narration, Math.max(beat(content.map.narration, 3), 3), 2.8);
	const result = say('result', content.result.narration, Math.max(beat(content.result.narration, 2.8), 2.8), 2.6);
	const task = say('task', content.task.narration, Math.max(beat(content.task.narration, 3), 3), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'map', seconds: map.seconds, label: 'Harita', voice: [map], element: <MapScene content={content} />},
		{id: 'result', seconds: result.seconds, label: 'Sonuç', voice: [result], element: <ResultScene content={content} />},
		{id: 'task', seconds: task.seconds, label: 'Görev', voice: [task], element: <TaskScene content={content} seconds={task.seconds} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const StudyForecast = defineTemplate({
	id: 'StudyForecast',
	category: 'Advertisements',
	title: 'Sınav hava durumu',
	description: 'Sunucusuz TV hava durumu bülteni: dersler bir karo haritanın bölgeleri, netler sıcaklık yerine; Matematik’te fırtına, altta kayan yazı. Bölgeler son denemenin konu konu sonuç satırlarına dönüşür, fırtınalı satır şemsiyenin altında Ders Planı görevine.',
	contentSchema: StudyForecastSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
