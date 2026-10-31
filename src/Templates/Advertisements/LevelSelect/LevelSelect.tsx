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
import {createNarrator, VOICE_LEAD_SECONDS, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, Tap, type Shape} from '../PromoKit/PromoMotion';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Which level are you? (Kasım 2026, 30 Kasım). A level map in the brand's
 * colours (no game's look copied): a road climbs past three stops, Kolay,
 * Orta and Zor. The Kolay stop grows into the test (one shape): twenty
 * answers tick in and the stars fill; it folds back into the stop, the road
 * to Orta draws itself and the lock opens; Zor waits at the top. Then the
 * Tests screen on the phone: topic, level, start.
 */

const narration = z.string().trim().min(1).max(170);

const LevelSelectSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	levels: z.tuple([plainText(8), plainText(8), plainText(8)]),
	test: z.object({title: plainText(26), questions: z.number().int().min(5).max(30), wrong: z.array(z.number().int().min(0)).max(5), narration}),
	next: z.object({line: plainText(32), narration}),
	phone: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), steps: z.array(plainText(16)).length(3), line: plainText(34), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof LevelSelectSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const TESTS = MODULES.tests.color.light;
const GOLD = '#FBBF24';
const GREEN = '#16A34A';

/** The three stops on the road, bottom to top. */
const STOPS = [
	{x: 300, y: 1210},
	{x: 640, y: 830},
	{x: 330, y: 470},
];
const NODE = 170;
/** The road as cubic segments ending at each stop (and past the last, off the top). */
const SEGMENTS: [number, number][][] = [
	[[200, 1560], [200, 1380], [260, 1260], [STOPS[0].x, STOPS[0].y]],
	[[STOPS[0].x, STOPS[0].y], [340, 1160], [640, 1020], [STOPS[1].x, STOPS[1].y]],
	[[STOPS[1].x, STOPS[1].y], [640, 640], [300, 620], [STOPS[2].x, STOPS[2].y]],
	[[STOPS[2].x, STOPS[2].y], [360, 320], [700, 260], [760, 120]],
];
const ROAD = `M ${SEGMENTS[0][0].join(' ')} ${SEGMENTS.map((segment) => `C ${segment.slice(1).map((point) => point.join(' ')).join(', ')}`).join(' ')}`;
/** A segment's length, by sampling the curve. */
const segmentLength = ([a, b, c, d]: [number, number][]): number => {
	const at = (t: number) => [0, 1].map((axis) => (1 - t) ** 3 * a[axis] + 3 * (1 - t) ** 2 * t * b[axis] + 3 * (1 - t) * t ** 2 * c[axis] + t ** 3 * d[axis]);
	let length = 0;
	for (let step = 1; step <= 60; step++) {
		const [x0, y0] = at((step - 1) / 60);
		const [x1, y1] = at(step / 60);
		length += Math.hypot(x1 - x0, y1 - y0);
	}
	return length;
};
const LENGTHS = SEGMENTS.map(segmentLength);
/** How far along the road (0 → 1) each stop sits, for drawing the opened part. */
const ROAD_AT = [1, 2, 3].map((count) => LENGTHS.slice(0, count).reduce((sum, length) => sum + length, 0) / LENGTHS.reduce((sum, length) => sum + length, 0));

const nodeShape = (index: number, fill: string): Shape => ({x: STOPS[index].x - NODE / 2, y: STOPS[index].y - NODE / 2, w: NODE, h: NODE, radius: NODE / 2, fill});
const CARD: Shape = {x: 76, y: 380, w: 800, h: 760, radius: 44, fill: WHITE};

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(85% 60% at 50% 40%, #1E1B4B 0%, ${NAVY} 70%)`}}>
		<AbsoluteFill style={{background: 'radial-gradient(28% 14% at 80% 70%, rgba(79,70,229,0.25), transparent 70%), radial-gradient(30% 12% at 15% 40%, rgba(79,70,229,0.2), transparent 70%), radial-gradient(25% 10% at 75% 22%, rgba(79,70,229,0.18), transparent 70%)'}} />
	</AbsoluteFill>
);

const Star: React.FC<{size: number; fill: number}> = ({size, fill}) => {
	const {u} = useVideoLayout();
	return (
		<svg width={u(size)} height={u(size)} viewBox="0 0 24 24">
			<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill={fill > 0.5 ? GOLD : 'rgba(255,255,255,0.18)'} stroke={GOLD} strokeWidth={1.2} transform={`translate(12 12) scale(${0.7 + fill * 0.3}) translate(-12 -12)`} />
		</svg>
	);
};

/**
 * The map: the road (the opened part solid, the rest dashed), the stops with
 * their names; `open` is how far the road is open, `stars` how many stars
 * each stop has earned, `locked` which stops still wait.
 */
const LevelMap: React.FC<{content: Content; open: number; stars: number[]; locked: boolean[]; glow?: number; hide?: number}> = ({content, open, stars, locked, glow = -1, hide = -1}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<>
			<svg width={u(952)} height={u(1530)} viewBox="0 0 952 1530" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<path d={ROAD} fill="none" stroke="#1E293B" strokeWidth="80" strokeLinecap="round" />
				<path d={ROAD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeDasharray="22 22" strokeLinecap="round" />
				<path d={ROAD} fill="none" stroke={TESTS} strokeWidth="18" strokeLinecap="round" pathLength={1} strokeDasharray={`${open} 1`} />
			</svg>
			{STOPS.map((stop, index) => {
				const ring = index === glow ? (Math.sin(seconds * 5) + 1) / 2 : 0;
				return (
					<React.Fragment key={index}>
						{index === hide ? null : (
							<div style={{position: 'absolute', left: u(stop.x - NODE / 2), top: u(stop.y - NODE / 2), width: u(NODE), height: u(NODE), borderRadius: '50%', background: locked[index] ? '#334155' : TESTS, border: `${u(8)}px solid ${locked[index] ? '#475569' : WHITE}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${u(20)}px ${u(40)}px rgba(0,0,0,0.5), 0 0 0 ${u(10 + ring * 16)}px rgba(79,70,229,${0.35 * ring})`}}>
								{locked[index] ? <Icon name="lock" size={u(64)} color="#94A3B8" stroke={2.4} /> : <Text variant="display" size={72} weight={TYPE.weights.kinetic} color={WHITE}>{String(index + 1)}</Text>}
							</div>
						)}
						<div style={{position: 'absolute', left: u(stop.x - 150), top: u(stop.y + NODE / 2 + 10), width: u(300), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(6)}}>
							<Text variant="display" size={44} weight={TYPE.weights.kinetic} color={WHITE}>
								{content.levels[index]}
							</Text>
							<div style={{display: 'flex', gap: u(6)}}>
								{[0, 1, 2].map((star) => (
									<Star key={star} size={34} fill={Math.max(0, Math.min(1, stars[index] - star))} />
								))}
							</div>
						</div>
					</React.Fragment>
				);
			})}
		</>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content; cues: number[]}> = ({content, cues}) => {
	const seconds = useSeconds();
	// Each stop answers when its name is said.
	const pulse = (index: number) => interpolate(seconds, [cues[index], cues[index] + 0.15, cues[index] + 0.5], [0, 1, 0], CLAMP);
	const glow = [0, 1, 2].reduce((best, index) => (pulse(index) > 0.2 ? index : best), -1);
	return (
		<Stage>
			<LevelMap content={content} open={ROAD_AT[0]} stars={[0, 0, 0]} locked={[false, true, true]} glow={glow} />
			{[0, 1, 2].map((index) => <SoundEffect key={index} id="pop" atSeconds={cues[index]} volume={0.5} />)}
			<At y={60} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
			</At>
			<At y={165} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** The test as it runs: its title, the answers ticking in on a grid, the stars at the end. */
const TestCard: React.FC<{content: Content; tickAt: (index: number) => number; starsAt: number}> = ({content, tickAt, starsAt}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const count = content.test.questions;
	const done = Array.from({length: count}, (_, index) => seconds >= tickAt(index)).filter(Boolean).length;
	const right = Array.from({length: done}, (_, index) => !content.test.wrong.includes(index)).filter(Boolean).length;
	const stars = Math.max(0, Math.min(3, (seconds - starsAt) / 0.25));
	return (
		<div style={{position: 'absolute', inset: 0, padding: u(44), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(26)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
				<div style={{width: u(64), height: u(64), borderRadius: u(18), background: TESTS, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="quiz" size={u(36)} color={WHITE} stroke={2.4} />
				</div>
				<Text size={42} weight={TYPE.weights.kinetic} color={NAVY}>
					{content.test.title}
				</Text>
			</div>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: u(14)}}>
				{Array.from({length: count}, (_, index) => {
					const shown = seconds >= tickAt(index);
					const wrong = content.test.wrong.includes(index);
					return (
						<div key={index} style={{height: u(92), borderRadius: u(20), background: shown ? (wrong ? '#FEE2E2' : '#DCFCE7') : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${shown ? 1 : 0.92})`}}>
							{shown ? <Icon name={wrong ? 'x' : 'check'} size={u(42)} color={wrong ? '#DC2626' : GREEN} stroke={3} /> : <Text size={30} weight={TYPE.weights.display} color="#94A3B8">{String(index + 1)}</Text>}
						</div>
					);
				})}
			</div>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto'}}>
				<Text variant="display" size={76} weight={TYPE.weights.kinetic} color={NAVY} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
					{`${right}/${count}`}
				</Text>
				<div style={{display: 'flex', gap: u(8)}}>
					{[0, 1, 2].map((star) => (
						<Star key={star} size={72} fill={Math.max(0, Math.min(1, stars - star))} />
					))}
				</div>
			</div>
		</div>
	);
};

const TestScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const count = content.test.questions;
	const from = 0.55;
	const span = Math.max(1, total - from - 1.1);
	const tickAt = (index: number) => from + (index * span) / count;
	const starsAt = from + span + 0.15;
	return (
		<Stage>
			<LevelMap content={content} open={ROAD_AT[0]} stars={[0, 0, 0]} locked={[false, true, true]} hide={0} />
			{/* The Kolay stop grows into the test. */}
			<Morph
				keys={[
					{at: 0, to: nodeShape(0, TESTS)},
					{at: 0.1, to: CARD},
				]}
				shadow="0 40px 80px -30px rgba(0,0,0,0.7)"
				render={(index) => (index === 0 ? null : <TestCard content={content} tickAt={tickAt} starsAt={starsAt} />)}
			/>
			{Array.from({length: count}, (_, index) => <SoundEffect key={index} id={content.test.wrong.includes(index) ? 'blockDrop' : 'countdownTick'} atSeconds={tickAt(index)} volume={0.35} />)}
			{[0, 1, 2].map((star) => <SoundEffect key={`star-${star}`} id="star" atSeconds={starsAt + star * 0.25} />)}
		</Stage>
	);
};

const NextScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const open = interpolate(seconds, [0.45, 1.2], [ROAD_AT[0], ROAD_AT[1]], CLAMP);
	const unlocked = seconds >= 1.25;
	const line = useLand(Math.min(total - 1, 1.6), 150, 20);
	return (
		<Stage>
			<CameraZoom
				keys={[
					{at: 0, to: {x: 476, y: 765, zoom: 1}},
					{at: 1.3, to: {x: 476, y: 700, zoom: 1.08}},
				]}
				sound={null}
			>
				<LevelMap content={content} open={open} stars={[3, 0, 0]} locked={[false, !unlocked, true]} glow={unlocked ? 1 : -1} hide={seconds < 0.4 ? 0 : -1} />
				{/* The test folds back into its stop. */}
				{seconds < 0.4 ? (
					<Morph
						keys={[
							{at: 0, to: CARD},
							{at: 0.02, to: nodeShape(0, TESTS)},
						]}
						render={() => null}
					/>
				) : null}
			</CameraZoom>
			<At y={70} w={952}>
				<div style={{opacity: Math.min(1, line * 1.5), transform: `scale(${interpolate(line, [0, 1], [1.12, 1])})`, padding: `0 ${u(30)}px`}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.8} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.next.line}
					</Text>
				</div>
			</At>
			<SoundEffect id="transitionWhoosh" atSeconds={0.45} volume={0.6} />
			<SoundEffect id="unlock" atSeconds={1.25} />
		</Stage>
	);
};

const PhoneScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const phone = useLand(0.05, 150, 22);
	const Screen = PROMO_PHONE_SCREENS[content.phone.screen];
	const stepAt = (index: number) => 0.5 + index * Math.min(0.6, (total - 1.2) / 3);
	return (
		<Stage>
			<At x={40} y={330 + (1 - phone) * 600} w={440}>
				<div style={{filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(0,0,0,0.55))`}}>
					<PhoneShot width={440}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			<At x={510} y={520} w={410}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(26)}}>
					{content.phone.steps.map((step, index) => {
						const show = ease(interpolate(seconds, [stepAt(index), stepAt(index) + 0.3], [0, 1], CLAMP));
						const last = index === content.phone.steps.length - 1;
						return (
							<div key={step} style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(22)}px ${u(24)}px`, borderRadius: u(28), background: last ? ORANGE : WHITE, opacity: show, transform: `translateX(${(1 - show) * u(60)}px)`}}>
								<div style={{width: u(52), height: u(52), borderRadius: '50%', background: last ? WHITE : TESTS, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
									{last ? <Icon name="play" size={u(28)} color={ORANGE} stroke={2.6} /> : <Text size={28} weight={TYPE.weights.kinetic} color={WHITE}>{String(index + 1)}</Text>}
								</div>
								<Text size={38} weight={TYPE.weights.kinetic} color={last ? WHITE : NAVY}>
									{step}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
			<At y={70} w={952}>
				<div style={{padding: `0 ${u(30)}px`}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.78} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.phone.line}
					</Text>
				</div>
			</At>
			{content.phone.steps.map((step, index) => <SoundEffect key={step} id="pop" atSeconds={stepAt(index)} volume={0.6} />)}
			<Tap x={510 + 200} y={520 + 2 * 122 + 48} at={stepAt(2) + 0.5} color="rgba(255,255,255,0.6)" />
			<SoundEffect id="success" atSeconds={stepAt(2) + 0.55} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof LevelSelectSchema> = {
	hook: {lines: ['Hangi seviyedesin?', 'Kolay, Orta, Zor.'], narration: 'Hangi seviyedesin? Kolay, Orta, Zor.'},
	levels: ['Kolay', 'Orta', 'Zor'],
	test: {title: 'Kolay · 20 soru', questions: 20, wrong: [6, 13], narration: 'Testler’de her seviye yirmi soru.'},
	next: {line: 'Sıradaki seviye seni bekliyor.', narration: 'Konunu seç, Kolay’dan başla, seviye atla.'},
	phone: {screen: 'testsHome', steps: ['Konu seç', 'Seviye seç', 'Başla'], line: 'Aralık’a bir seviye yukarıda gir.', narration: 'Aralık’a bir seviye yukarıda gir.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.6), 2.6);
	const test = say('test', content.test.narration, Math.max(beat(content.test.narration, 3.4), 3.4), 3.4);
	const next = say('next', content.next.narration, Math.max(beat(content.next.narration, 3), 3), 3);
	const phone = say('phone', content.phone.narration, Math.max(beat(content.phone.narration, 3), 3), 3);
	// When each level's name is heard in the hook (word timings), else spread after the first line.
	const heard = voiceClips.hook?.words ?? [];
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}]+/gu, '');
	const cues = content.levels.map((level, index) => {
		const word = heard.find((item) => plain(item.text) === plain(level));
		return word ? VOICE_LEAD_SECONDS + word.startSeconds : 1.2 + index * 0.4;
	});
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} cues={cues} />},
		{id: 'test', seconds: test.seconds, label: 'Kolay', voice: [test], element: <TestScene content={content} seconds={test.seconds} />},
		{id: 'next', seconds: next.seconds, label: 'Sıradaki', voice: [next], element: <NextScene content={content} seconds={next.seconds} />},
		{id: 'phone', seconds: phone.seconds, label: 'Testler', voice: [phone], element: <PhoneScene content={content} seconds={phone.seconds} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const LevelSelect = defineTemplate({
	id: 'LevelSelect',
	category: 'Advertisements',
	title: 'Hangi seviyedesin',
	description: 'Marka renklerinde bölüm haritası (bir oyunun görünüşü kopyalanmaz): yukarı kıvrılan yolda Kolay, Orta, Zor durakları. Kolay durağı teste dönüşür (tek şekil), yirmi cevap işlenir, yıldızlar dolar; durağa geri döner, Orta’ya yol çizilir ve kilit açılır, Zor yukarıda bekler. Sonda telefonda Testler: konu, seviye, başla.',
	contentSchema: LevelSelectSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
