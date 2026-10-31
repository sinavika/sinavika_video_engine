import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useCount, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * "Netin sana yalan söylüyor": a dark stage and one glowing orange orb. The
 * orb counts up a score, splits into the topics the points were lost on, and
 * the pieces fall into the phone where the app shows the same breakdown.
 * Provocative hook, one number, one idea.
 */

const narration = z.string().trim().min(1).max(170);

const OrbRevealSchema = z.object({
	hook: z.object({small: plainText(24), big: plainText(28), narration}),
	count: z.object({value: z.number().min(0).max(999), decimals: z.number().int().min(0).max(2).default(1), unit: plainText(8), question: plainText(24), narration}),
	split: z.object({items: z.array(z.object({topic: plainText(22), loss: plainText(10)})).length(3), narration}),
	product: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), caption: plainText(40), narration}),
	line: z.object({lines: z.tuple([plainText(28), plainText(28)]), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof OrbRevealSchema>;

const BLACK = '#050505';
const WHITE = '#FAFAF9';
const DIM = '#78716C';
const CORE = '#FDBA74';

const Ground: React.FC<{glow?: number}> = ({glow = 0}) => (
	<AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 46%, rgba(234,88,12,${0.22 * glow}) 0%, ${BLACK} 72%)`}} />
);

const Stage: React.FC<{glow?: number; children: React.ReactNode}> = ({glow, children}) => (
	<PromoStage ground={<Ground glow={glow} />}>
		{children}
	</PromoStage>
);

/** A glowing sphere: a hot core, a soft halo and a slow breath. */
const Orb: React.FC<{size: number; children?: React.ReactNode; intensity?: number}> = ({size, children, intensity = 1}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const breath = 1 + Math.sin(seconds * 2.4) * 0.025;
	return (
		<div style={{position: 'relative', width: u(size), height: u(size), display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${breath})`}}>
			<div style={{position: 'absolute', inset: -u(size * 0.45), borderRadius: '50%', background: `radial-gradient(circle, rgba(234,88,12,${0.55 * intensity}) 0%, rgba(234,88,12,0) 62%)`, filter: `blur(${u(20)}px)`}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 42% 36%, #FFF7ED 0%, ${CORE} 18%, #F97316 46%, #C2410C 78%, #7C2D12 100%)`, boxShadow: `0 0 ${u(size * 0.35)}px rgba(249,115,22,${0.65 * intensity}), inset 0 0 ${u(size * 0.2)}px rgba(124,45,18,0.7)`}} />
			<div style={{position: 'relative'}}>{children}</div>
		</div>
	);
};

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<At y={560} w={952}>
			<Slam text={content.hook.small} at={0.05} size={60} color={DIM} weight={TYPE.weights.strong} from={1.1} />
		</At>
		<At y={660} w={952}>
			<Slam text={content.hook.big} at={0.5} size={TYPE.adScale.hook * 1.05} color={WHITE} style={{textShadow: '0 0 40px rgba(234,88,12,0.55)'}} />
		</At>
	</Stage>
);

const CountScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const value = useCount(content.count.value, 0.2, 1.8, content.count.decimals);
	const grow = useLand(0, 90, 18);
	const ask = useLand(2.0);
	return (
		<Stage glow={1}>
			<At y={330} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(70)}}>
					<div style={{transform: `scale(${grow})`}}>
						<Orb size={520}>
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
								<Text variant="display" size={TYPE.adScale.numeral * 0.78} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{letterSpacing: '-0.05em', textShadow: '0 4px 30px rgba(124,45,18,0.6)'}}>
									{value}
								</Text>
								<Text size={46} weight={TYPE.weights.strong} color="rgba(255,255,255,0.9)">
									{content.count.unit}
								</Text>
							</div>
						</Orb>
					</div>
					<div style={{opacity: ask, transform: `translateY(${(1 - ask) * u(30)}px)`}}>
						<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.display} color={WHITE} align="center">
							{content.count.question}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SPLIT_TARGETS = [
	{x: 250, y: 420},
	{x: 700, y: 640},
	{x: 290, y: 980},
];

const SplitScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const apart = ease(interpolate(seconds, [0.15, 1.1], [0, 1], CLAMP));
	return (
		<Stage glow={0.8}>
			{content.split.items.map((item, index) => {
				const target = SPLIT_TARGETS[index];
				const x = interpolate(apart, [0, 1], [476, target.x]);
				const y = interpolate(apart, [0, 1], [620, target.y]);
				const label = interpolate(seconds, [1.0 + index * 0.25, 1.35 + index * 0.25], [0, 1], CLAMP);
				const size = interpolate(apart, [0, 1], [460, 230 - index * 22]);
				return (
					<At key={item.topic} x={x - size / 2} y={y - size / 2}>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(24)}}>
							<Orb size={size} intensity={0.9}>
								<Text variant="display" size={64 - index * 4} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{opacity: label}}>
									{item.loss}
								</Text>
							</Orb>
							<div style={{opacity: label, transform: `translateY(${(1 - label) * u(16)}px)`, whiteSpace: 'nowrap'}}>
								<Text size={42} weight={TYPE.weights.display} color={WHITE} align="center">
									{item.topic}
								</Text>
							</div>
						</div>
					</At>
				);
			})}
		</Stage>
	);
};

const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.product.screen];
	const rise = ease(interpolate(seconds, [0.1, 0.9], [0, 1], CLAMP));
	const fall = ease(interpolate(seconds, [0, 0.7], [0, 1], CLAMP));
	return (
		<Stage glow={0.6}>
			{[0, 1, 2].map((index) => (
				<At key={index} x={interpolate(fall, [0, 1], [SPLIT_TARGETS[index].x - 60, 450])} y={interpolate(fall, [0, 1], [SPLIT_TARGETS[index].y - 60, 760])}>
					<div style={{opacity: 1 - fall, transform: `scale(${1 - fall * 0.8})`}}>
						<Orb size={120} />
					</div>
				</At>
			))}
			<At y={interpolate(rise, [0, 1], [700, 200])} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(36), opacity: rise}}>
					<div style={{filter: `drop-shadow(0 0 ${u(60)}px rgba(234,88,12,0.45))`}}>
						<PhoneShot width={470}>
							<Screen />
						</PhoneShot>
					</div>
				</div>
			</At>
			<At y={120} w={952}>
				<div style={{opacity: useLand(0.8)}}>
					<Text variant="display" size={50} weight={TYPE.weights.display} color={WHITE} align="center">
						{content.product.caption}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const LineScene: React.FC<{content: Content}> = ({content}) => (
	<Stage glow={0.3}>
		<At y={560} w={952}>
			<Slam text={content.line.lines[0]} at={0.05} size={TYPE.adScale.headline} color={DIM} from={1.1} />
		</At>
		<At y={700} w={952}>
			<Slam text={content.line.lines[1]} at={0.55} size={TYPE.adScale.headline * 1.05} color={WHITE} style={{textShadow: '0 0 36px rgba(234,88,12,0.5)'}} />
		</At>
	</Stage>
);

const SAMPLE: z.input<typeof OrbRevealSchema> = {
	hook: {small: 'Netin sana', big: 'yalan söylüyor.', narration: 'Netin sana yalan söylüyor.'},
	count: {value: 78.5, unit: 'net', question: 'İyi mi?', narration: 'Yetmiş sekiz buçuk net. İyi mi, kötü mü?'},
	split: {
		items: [
			{topic: 'Problemler', loss: '−3,25'},
			{topic: 'Paragraf', loss: '−2,5'},
			{topic: 'Kuvvet ve hareket', loss: '−1,75'},
		],
		narration: 'Asıl soru şu: nerede kaybettin? Problemlerden üç net, paragraftan iki buçuk.',
	},
	product: {screen: 'yksLoss', caption: 'Her denemeden sonra, konu konu.', narration: 'Sınavika her denemeden sonra netini konu konu gösterir; eksikler doğrudan planına eklenir.'},
	line: {lines: ['Toplam netine değil,', 'nerede kaybettiğine bak.'], narration: 'Toplam netine değil, nerede kaybettiğine bak.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.2), 2);
	const count = say('count', content.count.narration, beat(content.count.narration, 3.4), 3.2);
	const split = say('split', content.split.narration, beat(content.split.narration, 4), 3.6);
	const product = say('product', content.product.narration, beat(content.product.narration, 4), 3.6);
	const line = say('line', content.line.narration, beat(content.line.narration, 2.6), 2.4);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'count', seconds: count.seconds, label: 'Sayaç', voice: [count], element: <CountScene content={content} />},
		{id: 'split', seconds: split.seconds, label: 'Bölünme', voice: [split], element: <SplitScene content={content} />},
		{id: 'product', seconds: product.seconds, label: 'Uygulama', voice: [product], element: <ProductScene content={content} />},
		{id: 'line', seconds: line.seconds, label: 'Fikir', voice: [line], element: <LineScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const OrbReveal = defineTemplate({
	id: 'OrbReveal',
	category: 'Advertisements',
	title: 'Netin sana yalan söylüyor',
	description: 'Denemeler tanıtımı: siyah sahne, parlayan turuncu küre ve sayaç; küre kaybedilen konulara bölünür, uygulamaya akar.',
	contentSchema: OrbRevealSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'fade', durationSeconds: 0.2},
	targetSeconds: {min: 16, max: 32},
	buildScenes,
});
