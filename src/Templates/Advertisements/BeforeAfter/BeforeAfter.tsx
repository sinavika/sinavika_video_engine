import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon, type UIIconName} from '../../../UIUX/Icons';
import {MODULES, MODULE_ORDER} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, PromoSubtitle, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Before / after: a screen overflowing with the mess of exam prep (sticky
 * notes, PDFs, tabs, alarms, question marks), counters that name it, an
 * orange wipe, and behind it everything snapping into place in the app.
 * Messy and loud first, clean and white after.
 */

const narration = z.string().trim().min(1).max(170);

export const BeforeAfterSchema = z.object({
	mess: z.object({headline: plainText(44), notes: z.array(plainText(18)).min(4).max(8), narration}),
	count: z.object({items: z.array(z.object({value: plainText(4), label: plainText(14)})).length(3), narration}),
	wipe: z.object({text: plainText(24), narration}),
	order: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), caption: plainText(40), narration}),
	closing: z.object({line: plainText(20), cta: plainText(26), channels: plainText(40).default('App Store · Google Play · sinavika.com'), narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof BeforeAfterSchema>;

const PAPER = '#F1EADF';
const INK = '#111827';
const ORANGE = '#EA580C';
const RED = '#DC2626';

type Mess = {x: number; y: number; r: number; kind: 'note' | 'pdf' | 'tab' | 'alarm' | 'ask'; delay: number; label: string};

/** The same scattered mess in every scene (seeded, so it never jumps). */
const messOf = (notes: string[]): Mess[] => {
	const kinds: Mess['kind'][] = ['note', 'pdf', 'tab', 'alarm', 'ask'];
	return Array.from({length: 16}, (_, index) => ({
		x: random(`x${index}`) * 760,
		y: 240 + random(`y${index}`) * 1060,
		r: (random(`r${index}`) - 0.5) * 40,
		kind: kinds[index % kinds.length],
		delay: index * 0.1,
		label: notes[index % notes.length],
	}));
};

const MessPiece: React.FC<{item: Mess; shake: number; fade?: number}> = ({item, shake, fade = 1}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const pop = interpolate(seconds, [item.delay, item.delay + 0.18], [0, 1], CLAMP);
	const wobble = Math.sin(seconds * 13 + item.x) * shake * 3;
	const base: React.CSSProperties = {position: 'absolute', left: u(item.x), top: u(item.y), transform: `rotate(${item.r + wobble}deg) scale(${pop})`, opacity: fade, boxShadow: `0 ${u(14)}px ${u(24)}px -${u(10)}px rgba(0,0,0,0.3)`};
	if (item.kind === 'note')
		return (
			<div style={{...base, width: u(200), height: u(170), background: '#FDE68A', padding: u(18), boxSizing: 'border-box'}}>
				<Text size={28} weight={TYPE.weights.strong} color="#78350F">
					{item.label}
				</Text>
			</div>
		);
	if (item.kind === 'pdf')
		return (
			<div style={{...base, width: u(160), height: u(200), background: '#FFFFFF', borderRadius: u(12), padding: u(16), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(10)}}>
				<div style={{alignSelf: 'flex-start', padding: `${u(4)}px ${u(10)}px`, borderRadius: u(6), background: RED}}>
					<Text size={22} weight={TYPE.weights.display} color="#FFFFFF">
						PDF
					</Text>
				</div>
				{[0.9, 0.7, 0.8, 0.5].map((w, index) => (
					<div key={index} style={{height: u(10), width: `${w * 100}%`, borderRadius: u(5), background: '#E5E7EB'}} />
				))}
			</div>
		);
	if (item.kind === 'tab')
		return (
			<div style={{...base, width: u(300), height: u(64), background: '#FFFFFF', borderRadius: `${u(14)}px ${u(14)}px 0 0`, display: 'flex', alignItems: 'center', gap: u(12), padding: `0 ${u(18)}px`, boxSizing: 'border-box'}}>
				<div style={{width: u(20), height: u(20), borderRadius: u(10), background: '#94A3B8'}} />
				<Text size={24} weight={TYPE.weights.strong} color={INK} style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
					{item.label}
				</Text>
				<Icon name="x" size={u(22)} color="#94A3B8" />
			</div>
		);
	if (item.kind === 'alarm')
		return (
			<div style={{...base, width: u(130), height: u(130), borderRadius: '50%', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${u(10 + Math.abs(wobble) * 3)}px rgba(220,38,38,0.25)`}}>
				<Icon name="clock" size={u(70)} color="#FFFFFF" stroke={2.2} />
			</div>
		);
	return (
		<div style={{...base, padding: `${u(18)}px ${u(26)}px`, borderRadius: `${u(28)}px ${u(28)}px ${u(28)}px ${u(6)}px`, background: INK}}>
			<Text size={34} weight={TYPE.weights.display} color="#FFFFFF">
				Hangi konu?
			</Text>
		</div>
	);
};

const Stage: React.FC<{content: Content; narration: string; shown?: string; ground?: string; children: React.ReactNode}> = ({content, narration: text, shown, ground = PAPER, children}) => (
	<PromoStage ground={<AbsoluteFill style={{background: ground}} />}>
		{children}
		<PromoSubtitle text={text} shown={shown} enabled={content.subtitles} ink="#FFFFFF" fill={INK} />
	</PromoStage>
);

const Label: React.FC<{text: string; at?: number}> = ({text, at = 0.2}) => {
	const {u} = useVideoLayout();
	const land = useLand(at, 260, 16);
	return (
		<div style={{display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(land, [0, 1], [1.3, 1])}) rotate(-2deg)`, opacity: Math.min(1, land * 1.5)}}>
			<div style={{padding: `${u(22)}px ${u(34)}px`, background: INK, borderRadius: u(10), maxWidth: u(860)}}>
				<Text variant="display" size={TYPE.adScale.headline * 0.78} weight={TYPE.weights.kinetic} color="#FFFFFF" align="center" style={{lineHeight: 1.08}}>
					{text}
				</Text>
			</div>
		</div>
	);
};

const MessScene: React.FC<{content: Content}> = ({content}) => {
	const mess = messOf(content.mess.notes);
	return (
		<Stage content={content} narration={content.mess.narration} shown={content.mess.headline}>
			{mess.map((item, index) => (
				<MessPiece key={index} item={item} shake={1} />
			))}
			<At y={90} w={952}>
				<Label text={content.mess.headline} at={0.8} />
			</At>
		</Stage>
	);
};

const CountScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const mess = messOf(content.mess.notes);
	return (
		<Stage content={content} narration={content.count.narration} shown={content.count.items.map((item) => `${item.value} ${item.label}`).join(' ')}>
			{mess.map((item, index) => (
				<MessPiece key={index} item={{...item, delay: -1}} shake={1.6} fade={0.45} />
			))}
			<At y={420} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30)}}>
					{content.count.items.map((item, index) => (
						<div key={item.label} style={{width: '100%'}}>
							<Slam text={`${item.value} ${item.label}`} at={0.1 + index * 0.55} size={TYPE.adScale.hook * 0.95} color={index === 2 ? RED : INK} />
						</div>
					))}
				</div>
			</At>
		</Stage>
	);
};

const WipeScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const mess = messOf(content.mess.notes);
	const wipe = ease(interpolate(seconds, [0.1, 0.9], [0, 1], CLAMP));
	return (
		<PromoStage
			ground={
				<AbsoluteFill style={{background: PAPER}}>
					<AbsoluteFill style={{background: '#FFFFFF', clipPath: `inset(0 ${100 - wipe * 100}% 0 0)`}} />
					<AbsoluteFill style={{left: `${wipe * 110 - 12}%`, width: '14%', background: ORANGE, transform: 'skewX(-12deg)'}} />
				</AbsoluteFill>
			}
		>
			<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${wipe * 100}%)`}}>
				{mess.map((item, index) => (
					<MessPiece key={index} item={{...item, delay: -1}} shake={2} />
				))}
			</div>
			<At y={640} w={952}>
				<div style={{opacity: interpolate(seconds, [0.7, 1.0], [0, 1], CLAMP)}}>
					<Text variant="display" size={TYPE.adScale.hook} weight={TYPE.weights.kinetic} color={INK} align="center">
						{content.wipe.text}
					</Text>
				</div>
			</At>
			<PromoSubtitle text={content.wipe.narration} shown={content.wipe.text} enabled={content.subtitles} ink="#FFFFFF" fill={INK} />
		</PromoStage>
	);
};

const TILE_ICONS: UIIconName[] = MODULE_ORDER.map((key) => MODULES[key].icon);

const OrderScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.order.screen];
	const rise = ease(interpolate(seconds, [0, 0.6], [0, 1], CLAMP));
	const slots = [
		{x: 40, y: 330},
		{x: 760, y: 330},
		{x: 20, y: 640},
		{x: 780, y: 640},
		{x: 40, y: 950},
		{x: 760, y: 950},
		{x: 400, y: 1160},
	];
	return (
		<Stage content={content} narration={content.order.narration} shown={content.order.caption} ground="#FFFFFF">
			<At y={120} w={952}>
				<div style={{opacity: rise}}>
					<Text variant="display" size={52} weight={TYPE.weights.display} color={INK} align="center">
						{content.order.caption}
					</Text>
				</div>
			</At>
			<At y={interpolate(rise, [0, 1], [500, 260])} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: rise}}>
					<PhoneShot width={440}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			{MODULE_ORDER.map((key, index) => {
				const snap = ease(interpolate(seconds, [0.4 + index * 0.18, 0.8 + index * 0.18], [0, 1], CLAMP));
				const slot = slots[index];
				const from = {x: random(`fx${index}`) * 760, y: 240 + random(`fy${index}`) * 1060};
				const color = key === 'sinoAi' ? '#334155' : MODULES[key].color.light;
				return (
					<At key={key} x={interpolate(snap, [0, 1], [from.x, slot.x])} y={interpolate(snap, [0, 1], [from.y, slot.y])}>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(10), opacity: snap, transform: `rotate(${(1 - snap) * 30}deg) scale(${0.6 + snap * 0.4})`}}>
							<div style={{width: u(130), height: u(130), borderRadius: u(40), background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${u(18)}px ${u(30)}px -${u(14)}px ${color}`}}>
								<Icon name={TILE_ICONS[index]} size={u(66)} color="#FFFFFF" stroke={2} />
							</div>
							<Text size={26} weight={TYPE.weights.display} color={INK} align="center" style={{whiteSpace: 'nowrap'}}>
								{MODULES[key].name.tr}
							</Text>
						</div>
					</At>
				);
			})}
		</Stage>
	);
};

const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const logo = useLand(0.4, 170);
	const cta = useLand(0.7);
	return (
		<Stage content={content} narration={content.closing.narration} shown={`${content.closing.line} ${content.closing.cta}`} ground="#FFFFFF">
			<At y={380} w={952}>
				<Slam text={content.closing.line} at={0.05} size={TYPE.adScale.hook * 1.1} color={ORANGE} />
			</At>
			<At y={700} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(44)}}>
					<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
						<BrandMark size="hero" color={INK} />
					</div>
					<div style={{opacity: cta, padding: `${u(26)}px ${u(56)}px`, borderRadius: u(999), background: ORANGE}}>
						<Text size={TYPE.adScale.action * 1.35} weight={TYPE.weights.kinetic} color="#FFFFFF">
							{content.closing.cta}
						</Text>
					</div>
					<div style={{opacity: cta}}>
						<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color="#64748B" align="center">
							{content.closing.channels}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof BeforeAfterSchema> = {
	mess: {headline: 'Sınav hazırlığın böyle mi görünüyor?', notes: ['Paragraf?!', 'Türev tekrar', 'Deneme ne zaman?', 'Mol kavramı', 'Tarih ezber', 'Plan yap!!'], narration: 'Sınav hazırlığın böyle mi görünüyor?'},
	count: {
		items: [
			{value: '12', label: 'sekme'},
			{value: '4', label: 'uygulama'},
			{value: '0', label: 'plan'},
		],
		narration: 'On iki sekme, dört uygulama, sıfır plan.',
	},
	wipe: {text: 'Hepsini topla.', narration: 'Hepsini topla.'},
	order: {screen: 'hub', caption: 'Hepsi tek uygulamada.', narration: 'Deneme, ders, plan ve SinoAI tek uygulamada.'},
	closing: {line: 'Böyle olsun.', cta: 'Ücretsiz indir', narration: 'Böyle olsun. Sınavika’yı ücretsiz indir.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const mess = say('mess', content.mess.narration, beat(content.mess.narration, 2.8), 2.6);
	const count = say('count', content.count.narration, beat(content.count.narration, 2.8), 2.4);
	const wipe = say('wipe', content.wipe.narration, beat(content.wipe.narration, 1.6), 1.5);
	const order = say('order', content.order.narration, beat(content.order.narration, 3.6), 3.2);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.8), 2.6);
	return [
		{id: 'mess', seconds: mess.seconds, label: 'Dağınıklık', voice: [mess], element: <MessScene content={content} />},
		{id: 'count', seconds: count.seconds, label: 'Sayılar', voice: [count], element: <CountScene content={content} />},
		{id: 'wipe', seconds: wipe.seconds, label: 'Silme', voice: [wipe], element: <WipeScene content={content} />},
		{id: 'order', seconds: order.seconds, label: 'Düzen', voice: [order], element: <OrderScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <ClosingScene content={content} />}] : []),
	];
};

export const BeforeAfter = defineTemplate({
	id: 'BeforeAfter',
	category: 'Advertisements',
	title: 'Önce / sonra',
	description: 'Mobil uygulama tanıtımı: dağınık sınav hazırlığı ekranı doldurur, turuncu perde geçer, her şey uygulamada yerine oturur.',
	contentSchema: BeforeAfterSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 14, max: 28},
	buildScenes,
});
