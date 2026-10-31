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
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useCount, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * A tear-off wall calendar (Kasım 2026, 2 Kasım): one leaf a day. The leaves
 * are ripped off faster and faster; each flies away showing the small lesson
 * of its day. Then the month is added up (30 days × 15 minutes) and the
 * leaves become the route in Dersler. Light paper on a light grey wall, navy
 * type, one orange date.
 */

const narration = z.string().trim().min(1).max(170);

const TearCalendarSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(26)]), narration}),
	month: plainText(12),
	/** The small lessons on the backs of the leaves, in the order they fly. */
	cards: z.array(z.object({title: plainText(24), minutes: z.number().int().min(1).max(60)})).min(4).max(12),
	tear: z.object({narration}),
	count: z.object({days: z.number().int().min(1).max(31), minutes: z.number().int().min(1).max(120), total: plainText(12), line: plainText(26), narration}),
	product: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), lines: z.array(plainText(26)).min(1).max(3), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof TearCalendarSchema>;

const WALL = '#E9EEF4';
const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const PAPER = '#FFFFFF';
const LESSONS = MODULES.lessons.color.light;

const PAD = {x: 156, y: 420, w: 640, h: 760};

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(70% 50% at 50% 42%, #FFFFFF 0%, ${WALL} 70%, #DCE3EC 100%)`}} />
);

/** The pad on the wall: its rings, its header with the month and, on top, the leaf of `day`. */
const Pad: React.FC<{month: string; day: number; lift?: number}> = ({month, day, lift = 0}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(PAD.x), top: u(PAD.y), width: u(PAD.w), height: u(PAD.h), transform: `translateY(${-lift * u(40)}px)`}}>
			{/* The leaves under the top one, as edges. */}
			{[3, 2, 1].map((index) => (
				<div key={index} style={{position: 'absolute', left: u(index * 4), right: u(-index * 4), top: u(30 + index * 6), bottom: u(-index * 8), borderRadius: u(26), background: PAPER, boxShadow: '0 2px 0 rgba(15,23,42,0.08)'}} />
			))}
			<div style={{position: 'absolute', inset: 0, top: u(30), borderRadius: u(26), background: PAPER, boxShadow: `0 ${u(40)}px ${u(80)}px -${u(30)}px rgba(15,23,42,0.35)`, overflow: 'hidden'}}>
				<div style={{height: u(150), background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text variant="display" size={64} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{letterSpacing: '0.16em'}}>
						{month}
					</Text>
				</div>
				<div style={{height: u(PAD.h - 30 - 150), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text variant="display" size={360} weight={TYPE.weights.kinetic} color={day === 1 ? ORANGE : NAVY} style={{lineHeight: 1, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{day}
					</Text>
				</div>
			</div>
			{/* The rings the leaves hang on. */}
			{[0, 1, 2, 3, 4, 5].map((index) => (
				<div key={index} style={{position: 'absolute', top: u(6), left: u(70 + index * 100), width: u(28), height: u(56), borderRadius: u(14), border: `${u(7)}px solid #94A3B8`, boxSizing: 'border-box', background: 'transparent'}} />
			))}
		</div>
	);
};

/** A leaf torn off: it swings from its top corner and flies away, showing the day's small lesson on its back. */
const FlyingLeaf: React.FC<{t: number; card: {title: string; minutes: number}; day: number; side: number}> = ({t, card, day, side}) => {
	const {u} = useVideoLayout();
	const swing = ease(Math.min(1, t * 2.2));
	const fly = Math.max(0, t - 0.25);
	const turned = swing > 0.5;
	return (
		<div style={{position: 'absolute', left: u(PAD.x), top: u(PAD.y + 30), width: u(PAD.w), height: u(PAD.h - 30), transformOrigin: side > 0 ? '100% 0%' : '0% 0%', transform: `translate(${side * fly * u(1400)}px, ${fly * fly * u(900)}px) rotate(${side * (swing * 38 + fly * 120)}deg)`, borderRadius: u(26), background: turned ? '#F8FAFC' : PAPER, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(20)}px rgba(15,23,42,0.4)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(30), padding: u(50), boxSizing: 'border-box'}}>
			{turned ? (
				<>
					<div style={{display: 'flex', alignItems: 'center', gap: u(16), padding: `${u(14)}px ${u(26)}px`, borderRadius: u(999), background: `${LESSONS}1F`}}>
						<Icon name="book" size={u(36)} color={LESSONS} stroke={2.2} />
						<Text size={34} weight={TYPE.weights.display} color={LESSONS}>
							{`${day}. gün · Mikro ders`}
						</Text>
					</div>
					<Text variant="display" size={72} weight={TYPE.weights.kinetic} color={NAVY} align="center" style={{lineHeight: 1.05}}>
						{card.title}
					</Text>
					<Text size={44} weight={TYPE.weights.strong} color="#64748B" align="center">
						{`${card.minutes} dk`}
					</Text>
				</>
			) : (
				<Text variant="display" size={360} weight={TYPE.weights.kinetic} color={NAVY} style={{lineHeight: 1}}>
					{day}
				</Text>
			)}
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const land = useLand(0, 180, 18);
	return (
		<Stage>
			<div style={{opacity: Math.min(1, land * 1.4), transform: `scale(${interpolate(land, [0, 1], [0.92, 1])})`}}>
				<Pad month={content.month} day={1} />
			</div>
			<At y={90} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={NAVY} />
			</At>
			<At y={210} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline * 0.92} color={ORANGE} />
			</At>
		</Stage>
	);
};

const TearScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	const cards = content.cards;
	// Faster and faster: each tear comes sooner than the last.
	const starts = cards.map((_, index) => total * 0.82 * (1 - (1 - (index + 1) / (cards.length + 1)) ** 1.6) - total * 0.08);
	const torn = starts.filter((start) => seconds >= start).length;
	return (
		<Stage>
			<Pad month={content.month} day={Math.min(content.count.days, torn + 1)} />
			{starts.map((start, index) => (start >= 0 ? <SoundEffect key={index} id="paperTear" atSeconds={start} volume={0.85} /> : null))}
			{cards.map((card, index) => {
				const t = seconds - starts[index];
				if (t < 0 || t > 1.6) return null;
				return <FlyingLeaf key={index} t={t} card={card} day={index + 1} side={index % 2 ? -1 : 1} />;
			})}
		</Stage>
	);
};

const CountScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const days = useCount(content.count.days, 0.1, 0.8, 0);
	const minutes = useCount(content.count.minutes, 0.5, 1.1, 0);
	const result = ease(interpolate(seconds, [1.3, 1.7], [0, 1], CLAMP));
	const line = ease(interpolate(seconds, [2, 2.4], [0, 1], CLAMP));
	const box = (value: string, unit: string, color: string) => (
		<div style={{width: u(360), padding: `${u(34)}px 0`, borderRadius: u(40), background: PAPER, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(30)}px rgba(15,23,42,0.35)`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<Text variant="display" size={190} weight={TYPE.weights.kinetic} color={color} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
				{value}
			</Text>
			<Text size={44} weight={TYPE.weights.display} color="#64748B">
				{unit}
			</Text>
		</div>
	);
	return (
		<Stage>
			<SoundEffect id="pop" atSeconds={0.1} />
			<SoundEffect id="pop" atSeconds={0.5} />
			<SoundEffect id="impact" atSeconds={1.3} volume={0.8} />
			<At y={250} w={952}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u(36)}}>
					{box(days, 'gün', NAVY)}
					<Text variant="display" size={120} weight={TYPE.weights.kinetic} color="#94A3B8">
						×
					</Text>
					{box(minutes, 'dakika', NAVY)}
				</div>
			</At>
			<At y={720} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: result, transform: `scale(${interpolate(result, [0, 1], [1.25, 1])})`}}>
					<div style={{padding: `${u(26)}px ${u(60)}px`, borderRadius: u(48), background: ORANGE, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(24)}px ${ORANGE}`}}>
						<Text variant="display" size={150} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{lineHeight: 1}}>
							{`= ${content.count.total}`}
						</Text>
					</div>
				</div>
			</At>
			<At y={1020} w={952}>
				<div style={{opacity: line, transform: `translateY(${(1 - line) * u(30)}px)`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={NAVY} align="center">
						{content.count.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const land = useLand(0.05, 150, 20);
	const Screen = PROMO_PHONE_SCREENS[content.product.screen];
	return (
		<Stage>
			<SoundEffect id="transitionWhoosh" atSeconds={0.05} volume={0.7} />
			{content.product.lines.map((line, index) => <SoundEffect key={line} id="pop" atSeconds={0.3 + index * 0.3} />)}
			<At y={60} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(14)}}>
					{content.product.lines.map((line, index) => {
						const show = ease(interpolate(seconds, [0.3 + index * 0.3, 0.6 + index * 0.3], [0, 1], CLAMP));
						return (
							<div key={line} style={{opacity: show, transform: `translateY(${(1 - show) * u(30)}px)`, display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: index === 0 ? LESSONS : PAPER, boxShadow: `0 ${u(14)}px ${u(30)}px -${u(16)}px rgba(15,23,42,0.3)`}}>
								<Icon name={index === 0 ? 'book' : 'check'} size={u(32)} color={index === 0 ? '#FFFFFF' : NAVY} stroke={2.6} />
								<Text size={40} weight={TYPE.weights.display} color={index === 0 ? '#FFFFFF' : NAVY}>
									{line}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
			<At x={476 - 270} y={300 + (1 - land) * 700} w={540}>
				<div style={{filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(15,23,42,0.35))`}}>
					<PhoneShot width={540}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof TearCalendarSchema> = {
	hook: {lines: ['Kasım 30 gün.', 'Kaçında çalışacaksın?'], narration: 'Kasım 30 gün. Kaçında çalışacaksın?'},
	month: 'KASIM',
	cards: [
		{title: 'Sözcükte anlam', minutes: 8},
		{title: 'Üslü sayılar', minutes: 10},
		{title: 'Hücre', minutes: 12},
		{title: 'Paragraf', minutes: 15},
		{title: 'Kuvvet', minutes: 10},
		{title: 'Tanzimat', minutes: 12},
		{title: 'Oran orantı', minutes: 10},
	],
	tear: {narration: 'Her gün on beş dakikalık bir mikro ders yeter.'},
	count: {days: 30, minutes: 15, total: '7,5 saat', line: 'Küçük adım, her gün.', narration: 'Ay sonunda yedi buçuk saat olur.'},
	product: {screen: 'lessonsHome', lines: ['Dersler’de rotan hazır', 'Mikro ders · 15 dk'], narration: 'Dersler’de rotan hazır.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.6), 2.4);
	const tear = say('tear', content.tear.narration, Math.max(beat(content.tear.narration, 4.2), 4.2), 4);
	const count = say('count', content.count.narration, Math.max(beat(content.count.narration, 3.2), 3.2), 3);
	const product = say('product', content.product.narration, Math.max(beat(content.product.narration, 3), 3), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'tear', seconds: tear.seconds, label: 'Yapraklar', voice: [tear], element: <TearScene content={content} seconds={tear.seconds} />},
		{id: 'count', seconds: count.seconds, label: 'Hesap', voice: [count], element: <CountScene content={content} />},
		{id: 'product', seconds: product.seconds, label: 'Ürün', voice: [product], element: <ProductScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const TearCalendar = defineTemplate({
	id: 'TearCalendar',
	category: 'Advertisements',
	title: 'Koparılan takvim',
	description: 'Duvar takvimi: yapraklar giderek hızlanarak koparılır, her yaprağın arkasında o günün mikro dersi uçar; ay toplanır (30 gün × 15 dk) ve rota Dersler’de belirir.',
	contentSchema: TearCalendarSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
