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

/**
 * One object, one shot (Kasım 2026, 4 Kasım): a huge white stopwatch on
 * near-black navy, ticking. Notifications rain around it and pop one by one;
 * the stopwatch becomes Ders Planı's focus timer (25:00, counted down fast)
 * with only the topic left on screen; then a soft bell and the task to close.
 * Minimal on purpose: the ticking is the rhythm.
 */

const narration = z.string().trim().min(1).max(170);

const FocusTimerSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(26), plainText(26)]), narration}),
	/** The distractions that pop around the watch. */
	notifications: z.object({items: z.array(z.object({app: plainText(16), text: plainText(30)})).min(3).max(6), narration}),
	focus: z.object({minutes: z.number().int().min(5).max(90), topic: plainText(30), narration}),
	done: z.object({line: plainText(20), action: plainText(20), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof FocusTimerSchema>;

const NIGHT = '#070F1C';
const NAVY = '#0B1C30';
const WHITE = '#FFFFFF';
const ORANGE = '#EA580C';
const PLAN = MODULES.studyPlan.color.light;

const WATCH = {cx: 476, cy: 760, r: 330};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 48%, #12263F 0%, ${NAVY} 45%, ${NIGHT} 100%)`}} />;

/** The stopwatch: a white face with sixty ticks, its crown, and a hand at `angle` degrees. `progress` draws the remaining arc. */
const Watch: React.FC<{angle: number; progress?: number; digits?: string; dim?: number}> = ({angle, progress, digits, dim = 0}) => {
	const {u} = useVideoLayout();
	const {cx, cy, r} = WATCH;
	const size = (r + 70) * 2;
	const arc = progress === undefined ? null : (() => {
		const radius = r - 26;
		const length = 2 * Math.PI * radius;
		return <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={PLAN} strokeWidth={26} strokeDasharray={`${length * progress} ${length}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />;
	})();
	return (
		<div style={{position: 'absolute', left: u(cx - size / 2), top: u(cy - size / 2), width: u(size), height: u(size)}}>
			<svg viewBox={`0 0 ${size} ${size}`} width={u(size)} height={u(size)}>
				<rect x={size / 2 - 38} y={6} width={76} height={56} rx={14} fill="#CBD5E1" />
				<rect x={size / 2 - 22} y={44} width={44} height={40} rx={8} fill="#94A3B8" />
				<circle cx={size / 2} cy={size / 2} r={r + 18} fill="#CBD5E1" />
				<circle cx={size / 2} cy={size / 2} r={r} fill={WHITE} />
				{Array.from({length: 60}, (_, index) => {
					const a = (index / 60) * Math.PI * 2;
					const long = index % 5 === 0;
					const inner = r - (long ? 46 : 24);
					return <line key={index} x1={size / 2 + Math.sin(a) * inner} y1={size / 2 - Math.cos(a) * inner} x2={size / 2 + Math.sin(a) * (r - 10)} y2={size / 2 - Math.cos(a) * (r - 10)} stroke={NAVY} strokeWidth={long ? 8 : 3} strokeLinecap="round" opacity={1 - dim * 0.85} />;
				})}
				{arc}
				{digits === undefined ? (
					<>
						<line x1={size / 2} y1={size / 2} x2={size / 2 + Math.sin((angle * Math.PI) / 180) * (r - 60)} y2={size / 2 - Math.cos((angle * Math.PI) / 180) * (r - 60)} stroke={ORANGE} strokeWidth={12} strokeLinecap="round" />
						<circle cx={size / 2} cy={size / 2} r={22} fill={NAVY} />
					</>
				) : null}
			</svg>
			{digits !== undefined ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text variant="display" size={170} weight={TYPE.weights.kinetic} color={NAVY} style={{lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{digits}
					</Text>
				</div>
			) : null}
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

/** The hand jumps in steps, twice a second, as a stopwatch ticks. */
const tickAngle = (seconds: number) => Math.floor(seconds * 2) * 6;

const HookScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	const land = useLand(0, 170, 18);
	return (
		<Stage>
			{/* The watch ticks on every half second it moves. */}
			{Array.from({length: Math.ceil(total * 2)}, (_, index) => <SoundEffect key={index} id="countdownTick" atSeconds={index / 2} volume={0.45} />)}
			<div style={{opacity: Math.min(1, land * 1.5), transform: `scale(${interpolate(land, [0, 1], [0.9, 1])})`}}>
				<Watch angle={tickAngle(seconds)} />
			</div>
			<At y={60} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline * 0.95} color={WHITE} />
			</At>
			<At y={175} w={952}>
				<Slam text={content.hook.lines[1]} at={0.3} size={TYPE.adScale.headline * 0.95} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** Where the notifications fall to, around the watch. */
const SPOTS = [
	{x: 40, y: 330},
	{x: 520, y: 400},
	{x: 70, y: 1050},
	{x: 500, y: 1110},
	{x: 280, y: 250},
	{x: 300, y: 1230},
];

const NotificationScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const items = content.notifications.items;
	const step = (total - 0.6) / (items.length + 1);
	return (
		<Stage>
			<Watch angle={tickAngle(seconds + 2)} />
			{items.map((_, index) => (
				<React.Fragment key={index}>
					<SoundEffect id="notification" atSeconds={index * 0.16} volume={0.7} />
					<SoundEffect id="pop" atSeconds={0.6 + (index + 1) * step} />
				</React.Fragment>
			))}
			{items.map((item, index) => {
				const arrive = index * 0.16;
				const pop = 0.6 + (index + 1) * step;
				const fall = ease(interpolate(seconds, [arrive, arrive + 0.45], [0, 1], CLAMP));
				const burst = interpolate(seconds, [pop, pop + 0.18], [0, 1], CLAMP);
				if (burst >= 1) return null;
				const spot = SPOTS[index % SPOTS.length];
				return (
					<div key={index} style={{position: 'absolute', left: u(spot.x), top: u(spot.y - (1 - fall) * 500), width: u(400), opacity: fall * (1 - burst), transform: `scale(${1 + burst * 0.4}) rotate(${(index % 2 ? 1 : -1) * 3}deg)`, padding: `${u(20)}px ${u(24)}px`, borderRadius: u(28), background: 'rgba(255,255,255,0.96)', boxShadow: `0 ${u(20)}px ${u(40)}px rgba(0,0,0,0.4)`, display: 'flex', gap: u(16), alignItems: 'center'}}>
						<div style={{width: u(60), height: u(60), borderRadius: u(16), background: index % 3 === 0 ? '#EF4444' : index % 3 === 1 ? '#6366F1' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Icon name="bell" size={u(32)} color={WHITE} stroke={2.4} />
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: u(4), minWidth: 0}}>
							<Text size={26} weight={TYPE.weights.display} color="#64748B">
								{item.app}
							</Text>
							<Text size={30} weight={TYPE.weights.strong} color={NAVY} style={{lineHeight: 1.15}}>
								{item.text}
							</Text>
						</div>
					</div>
				);
			})}
		</Stage>
	);
};

const FocusScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	// The minutes run down fast: the whole session in the length of the scene.
	const left = Math.max(0, content.focus.minutes * 60 * (1 - interpolate(seconds, [0.5, total - 0.2], [0, 1], CLAMP)));
	const digits = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
	const chip = ease(interpolate(seconds, [0.2, 0.6], [0, 1], CLAMP));
	return (
		<Stage>
			<Watch angle={0} progress={left / (content.focus.minutes * 60)} digits={digits} dim={1} />
			<SoundEffect id="pop" atSeconds={0.2} />
			<At y={210} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: chip, transform: `translateY(${(1 - chip) * u(20)}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(16), padding: `${u(18)}px ${u(32)}px`, borderRadius: u(999), background: PLAN}}>
						<Icon name="focus" size={u(40)} color={WHITE} stroke={2.4} />
						<Text size={42} weight={TYPE.weights.display} color={WHITE}>
							{`Odak · ${content.focus.topic}`}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const DoneScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const ring = Math.max(0, Math.sin(seconds * 30) * Math.exp(-seconds * 3));
	const check = useLand(0.5, 200, 16);
	return (
		<Stage>
			<div style={{transform: `rotate(${ring * 6}deg)`, transformOrigin: `${u(WATCH.cx)}px ${u(WATCH.cy - WATCH.r)}px`}}>
				<Watch angle={0} progress={0} digits="00:00" dim={1} />
			</div>
			<SoundEffect id="bell" atSeconds={0} />
			<SoundEffect id="success" atSeconds={0.5} />
			<At y={150} w={952}>
				<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
					{content.done.line}
				</Text>
			</At>
			<At y={1180} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: Math.min(1, check * 1.5), transform: `scale(${interpolate(check, [0, 1], [0.7, 1])})`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(18), padding: `${u(26)}px ${u(48)}px`, borderRadius: u(999), background: ORANGE, boxShadow: `0 ${u(24)}px ${u(50)}px -${u(20)}px ${ORANGE}`}}>
						<Icon name="check" size={u(48)} color={WHITE} stroke={3} />
						<Text variant="display" size={54} weight={TYPE.weights.kinetic} color={WHITE}>
							{content.done.action}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof FocusTimerSchema> = {
	hook: {lines: ['Telefonu bırakmak için', 'telefonu kullan.'], narration: 'Telefonu bırakmak için telefonu kullan.'},
	notifications: {
		items: [
			{app: 'Grup', text: '12 yeni mesaj'},
			{app: 'Video', text: 'Sana bir video önerdik'},
			{app: 'Sosyal', text: 'Biri seni etiketledi'},
			{app: 'Mağaza', text: 'Bugüne özel indirim'},
		],
		narration: 'Ders Planı’nda odak süresini başlat.',
	},
	focus: {minutes: 25, topic: 'Paragraf', narration: 'Yirmi beş dakika, sadece sen ve konu.'},
	done: {line: 'Odak tamam.', action: 'Görevi bitir', narration: 'Süre bitince görevini tek dokunuşla bitir.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const notify = say('notify', content.notifications.narration, Math.max(beat(content.notifications.narration, 3.6), 3.6), 3.4);
	const focus = say('focus', content.focus.narration, Math.max(beat(content.focus.narration, 4.6), 4.6), 4.4);
	const done = say('done', content.done.narration, Math.max(beat(content.done.narration, 3.2), 3.2), 3);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} seconds={hook.seconds} />},
		{id: 'notify', seconds: notify.seconds, label: 'Bildirimler', voice: [notify], element: <NotificationScene content={content} seconds={notify.seconds} />},
		{id: 'focus', seconds: focus.seconds, label: 'Odak', voice: [focus], element: <FocusScene content={content} seconds={focus.seconds} />},
		{id: 'done', seconds: done.seconds, label: 'Bitti', voice: [done], element: <DoneScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const FocusTimer = defineTemplate({
	id: 'FocusTimer',
	category: 'Advertisements',
	title: 'Odak kronometresi',
	description: 'Tek plan: koyu lacivertte dev beyaz kronometre; bildirimler çevresinde patlar, kronometre Ders Planı’nın odak süresine dönüşür, süre biter ve görev bitirilir.',
	contentSchema: FocusTimerSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
