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
import {defineTemplate} from '../../TemplateDefinition';
import {At, BrowserShot, ease, PhoneShot, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {Morph, type Shape} from '../PromoKit/PromoMotion';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS, PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Two screens, one account (Kasım 2026, 29 Kasım). A desk with depth: a
 * laptop and a phone beside it. The phone's camera island stretches like
 * liquid into the laptop's browser window (one shape) and the same plan is on
 * sinavika.com; the exam is solved on the big screen and its result drops on
 * the phone as a notification; then the two screens side by side, linked.
 */

const narration = z.string().trim().min(1).max(170);
const phoneScreen = z.enum(PROMO_PHONE_SCREEN_NAMES);
const webScreen = z.enum(PROMO_WEB_SCREEN_NAMES);

const DualScreenSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(24)]), web: webScreen, phone: phoneScreen, narration}),
	sync: z.object({web: webScreen, chip: plainText(18), narration}),
	exam: z.object({solve: webScreen, result: webScreen, phone: phoneScreen, app: plainText(12), notice: plainText(40), narration}),
	both: z.object({line: plainText(24), web: webScreen, phone: phoneScreen, site: plainText(16), app: plainText(16), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof DualScreenSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';

/** The laptop: its lid holds the browser window; the base sits on the desk. */
const LID = {x: 56, y: 300, w: 840, h: 548};
const WINDOW = {x: LID.x + 10, y: LID.y + 10, w: LID.w - 20};
/** The window's height on the canvas: the 16:10 page plus the title bar. */
const WINDOW_H = WINDOW.w * (900 / 1440) + 14;
const PHONE = {x: 650, y: 890, w: 250};
/** The camera island at the top of the phone (PHONE_GEOMETRY: 3 % down, 30 % wide, 7.5 % high). */
const ISLAND: Shape = {x: PHONE.x + PHONE.w * 0.35, y: PHONE.y + PHONE.w * 0.03, w: PHONE.w * 0.3, h: PHONE.w * 0.075, radius: 40, fill: '#0B0F17'};
const WINDOW_SHAPE: Shape = {x: WINDOW.x, y: WINDOW.y, w: WINDOW.w, h: WINDOW_H, radius: 16, fill: WHITE};

/** A desk with depth, in the brand's navy (no brown, no warm glow over navy): a dark wall, a slate top in perspective, a cool pool of light. */
const Ground: React.FC = () => (
	<AbsoluteFill style={{background: '#0B1C30'}}>
		<AbsoluteFill style={{top: '55%', background: 'linear-gradient(180deg, #334155 0%, #1E293B 55%, #0F172A 100%)'}} />
		<AbsoluteFill style={{top: '55%', opacity: 0.18, backgroundImage: 'repeating-linear-gradient(92deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 44px)'}} />
		<AbsoluteFill style={{background: 'radial-gradient(60% 40% at 45% 52%, rgba(255,255,255,0.10) 0%, transparent 70%)'}} />
	</AbsoluteFill>
);

const Laptop: React.FC<{screen: Content['hook']['web']}> = ({screen}) => {
	const {u} = useVideoLayout();
	const Screen = PROMO_WEB_SCREENS[screen];
	return (
		<>
			<div style={{position: 'absolute', left: u(LID.x), top: u(LID.y), width: u(LID.w), height: u(LID.h), borderRadius: u(26), background: '#111827', boxShadow: `0 ${u(40)}px ${u(80)}px -${u(30)}px rgba(0,0,0,0.7)`}} />
			<div style={{position: 'absolute', left: u(WINDOW.x), top: u(WINDOW.y)}}>
				<BrowserShot width={WINDOW.w}>
					<Screen />
				</BrowserShot>
			</div>
			<div style={{position: 'absolute', left: u(LID.x - 50), top: u(LID.y + LID.h), width: u(LID.w + 100), height: u(30), borderRadius: `${u(4)}px ${u(4)}px ${u(24)}px ${u(24)}px`, background: 'linear-gradient(180deg, #CBD5E1 0%, #64748B 100%)', boxShadow: `0 ${u(24)}px ${u(30)}px rgba(0,0,0,0.5)`}} />
		</>
	);
};

const Phone: React.FC<{screen: Content['hook']['phone']}> = ({screen}) => {
	const {u} = useVideoLayout();
	const Screen = PROMO_PHONE_SCREENS[screen];
	return (
		<div style={{position: 'absolute', left: u(PHONE.x), top: u(PHONE.y), width: u(PHONE.w), filter: `drop-shadow(0 ${u(30)}px ${u(30)}px rgba(0,0,0,0.6))`}}>
			<PhoneShot width={PHONE.w}>
				<Screen />
			</PhoneShot>
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Laptop screen={content.hook.web} />
		<Phone screen={content.hook.phone} />
		<At y={60} w={952}>
			<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
		</At>
		<At y={165} w={952}>
			<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline * 0.92} color={ORANGE} />
		</At>
	</Stage>
);

const SyncScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const chip = useLand(0.9, 170, 20);
	const Web = PROMO_WEB_SCREENS[content.sync.web];
	return (
		<Stage>
			<Laptop screen={content.hook.web} />
			<Phone screen={content.hook.phone} />
			{/* The island stretches out of the phone and becomes the laptop's window. */}
			<Morph
				keys={[
					{at: 0, to: ISLAND},
					{at: 0.2, to: WINDOW_SHAPE},
				]}
				shadow="0 30px 60px -20px rgba(0,0,0,0.6)"
				render={(index) =>
					index === 0 ? null : (
						<BrowserShot width={WINDOW.w}>
							<Web />
						</BrowserShot>
					)
				}
			/>
			<At x={56} y={960} w={560}>
				<div style={{display: 'flex', opacity: chip, transform: `translateY(${(1 - chip) * u(30)}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(18)}px ${u(28)}px`, borderRadius: u(999), background: WHITE}}>
						<Icon name="refresh" size={u(36)} color={ORANGE} stroke={2.6} />
						<Text size={38} weight={TYPE.weights.kinetic} color={NAVY}>
							{content.sync.chip}
						</Text>
					</div>
				</div>
			</At>
			<SoundEffect id="success" atSeconds={0.9} volume={0.6} />
		</Stage>
	);
};

const ExamScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const doneAt = Math.min(total * 0.55, 1.9);
	const done = seconds >= doneAt;
	const drop = useLand(doneAt + 0.15, 200, 20);
	const banner = {x: PHONE.x - 230, y: PHONE.y + 40, w: PHONE.w + 250};
	return (
		<Stage>
			<Laptop screen={done ? content.exam.result : content.exam.solve} />
			<Phone screen={done ? content.exam.phone : content.hook.phone} />
			{done ? (
				<div style={{position: 'absolute', left: u(banner.x), top: u(banner.y - (1 - drop) * 120), width: u(banner.w), opacity: Math.min(1, drop * 1.5), padding: u(16), borderRadius: u(26), background: 'rgba(248,250,252,0.97)', boxShadow: `0 ${u(24)}px ${u(40)}px -${u(16)}px rgba(0,0,0,0.6)`, display: 'flex', gap: u(12), alignItems: 'center', boxSizing: 'border-box'}}>
					<div style={{width: u(54), height: u(54), borderRadius: u(14), background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						<Icon name="exam" size={u(30)} color={WHITE} stroke={2.4} />
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(2), minWidth: 0}}>
						<Text size={26} weight={TYPE.weights.kinetic} color="#64748B">
							{content.exam.app}
						</Text>
						<Text size={32} weight={TYPE.weights.display} color={NAVY} style={{lineHeight: 1.2}}>
							{content.exam.notice}
						</Text>
					</div>
				</div>
			) : null}
			<SoundEffect id="impact" atSeconds={doneAt} volume={0.5} />
			<SoundEffect id="notification" atSeconds={doneAt + 0.15} />
		</Stage>
	);
};

const BothScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const line = useLand(0.05, 150, 20);
	const chips = useLand(0.5, 170, 20);
	// A dot runs along the link between the two screens, both ways.
	const run = (seconds * 0.9) % 1;
	const path = `M${LID.x + LID.w * 0.35} ${LID.y + LID.h + 30} C ${LID.x + LID.w * 0.35} ${PHONE.y + 120}, ${PHONE.x - 140} ${PHONE.y + 160}, ${PHONE.x} ${PHONE.y + 200}`;
	const point = {x: interpolate(run, [0, 1], [LID.x + LID.w * 0.35, PHONE.x]), y: interpolate(ease(run), [0, 1], [LID.y + LID.h + 30, PHONE.y + 200])};
	return (
		<Stage>
			<Laptop screen={content.both.web} />
			<Phone screen={content.both.phone} />
			<svg width={u(952)} height={u(1530)} viewBox="0 0 952 1530" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<path d={path} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeDasharray="12 12" />
				<circle cx={point.x} cy={point.y} r="12" fill={ORANGE} />
			</svg>
			<At y={60} w={952}>
				<div style={{opacity: Math.min(1, line * 1.5), transform: `scale(${interpolate(line, [0, 1], [1.12, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.both.line}
					</Text>
				</div>
			</At>
			<At x={56} y={1060} w={520}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: u(18), opacity: chips, transform: `translateY(${(1 - chips) * u(30)}px)`}}>
					{[
						{icon: 'globe' as const, text: content.both.site},
						{icon: 'phone' as const, text: content.both.app},
					].map((chip) => (
						<div key={chip.text} style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(16)}px ${u(26)}px`, borderRadius: u(999), background: WHITE}}>
							<Icon name={chip.icon} size={u(34)} color={ORANGE} stroke={2.4} />
							<Text size={36} weight={TYPE.weights.kinetic} color={NAVY}>
								{chip.text}
							</Text>
						</div>
					))}
				</div>
			</At>
			<SoundEffect id="transitionWhoosh" atSeconds={0.05} volume={0.6} />
			<SoundEffect id="pop" atSeconds={0.5} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof DualScreenSchema> = {
	hook: {lines: ['Plan telefonda,', 'sen bilgisayarda mı?'], web: 'webHome', phone: 'planToday', narration: 'Plan telefonda, sen bilgisayarda mı?'},
	sync: {web: 'webPlanToday', chip: 'Aynı plan', narration: 'Sınavika’da tek hesap, iki ekran.'},
	exam: {solve: 'webExamSolve', result: 'webResult', phone: 'examResult', app: 'Sınavika', notice: 'Deneme sonucun hazır: 78,5 net', narration: 'Denemeni büyük ekranda çöz, planına cepten bak.'},
	both: {line: 'Tek hesap, iki ekran.', web: 'webPlanToday', phone: 'planToday', site: 'sinavika.com', app: 'Uygulama', narration: 'sinavika.com’da ya da uygulamada.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.6), 2.4);
	const sync = say('sync', content.sync.narration, Math.max(beat(content.sync.narration, 3), 3), 3);
	const exam = say('exam', content.exam.narration, Math.max(beat(content.exam.narration, 3.4), 3.4), 3.4);
	const both = say('both', content.both.narration, Math.max(beat(content.both.narration, 2.8), 2.8), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'sync', seconds: sync.seconds, label: 'Ada → pencere', voice: [sync], element: <SyncScene content={content} />},
		{id: 'exam', seconds: exam.seconds, label: 'Deneme', voice: [exam], element: <ExamScene content={content} seconds={exam.seconds} />},
		{id: 'both', seconds: both.seconds, label: 'İki ekran', voice: [both], element: <BothScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const DualScreen = defineTemplate({
	id: 'DualScreen',
	category: 'Advertisements',
	title: 'İki ekran, tek hesap',
	description: 'Derinlikli masada dizüstü ve telefon. Telefonun kamera adası sıvı gibi uzayıp dizüstünün tarayıcı penceresine dönüşür (tek şekil): sinavika.com’da aynı plan. Deneme büyük ekranda çözülür, sonuç telefona bildirim olarak düşer; sonda iki ekran yan yana, bağlı.',
	contentSchema: DualScreenSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
