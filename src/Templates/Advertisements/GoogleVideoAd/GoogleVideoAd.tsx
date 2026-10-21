import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {findConcept, PLATFORM_CTA, PLATFORM_LINE, type AdConcept, type AdLang, type AdPlatform} from '../../../Ads/Google/GoogleAdsPlan';
import {AdMobileScreen, AdWebScreen} from '../../../Ads/Google/AdScreens';
import {ExamTag} from '../../../Ads/Google/ExamTag';
import {ProofCard} from '../../../Ads/Google/ProofCard';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {UIProvider, useT} from '../../../UIUX/Context';
import type {ModuleKey} from '../../../UIUX/ModuleIdentity';
import {Logo} from '../../../UIUX/Parts/Shared';
import {DeviceBrowser, DevicePhone} from '../../../UIUX/Parts/Web';
import {defineTemplate} from '../../TemplateDefinition';
import {PROMO_END_CARD} from '../PromoKit/PromoEndCard';

/**
 * Google Ads video (YouTube in-stream, App campaigns, Performance Max): the
 * moving version of the Google Ads pictures, so a student who saw a banner
 * recognises the video. Module-coloured ground, the hook in white, the real
 * product in a phone or a browser, the white proof card, then the end card.
 *
 * Two lengths: `short` (about 15 s, voiced in Turkish, subtitled) and `bumper`
 * (6 s, music only, the hook and the proof). Works in 16:9, 1:1 and 9:16; the
 * end card shows the exam's own screen.
 */

const narration = z.string().trim().min(1).max(160);

export const GoogleVideoAdSchema = z.object({
	exam: z.enum(['yks', 'kpss', 'sat', 'act']),
	platform: z.enum(['mobile', 'web']),
	lang: z.enum(['tr', 'en']).default('tr'),
	length: z.enum(['short', 'bumper']).default('short'),
	/** The first concept: hook and proof. */
	hook: z.object({concept: z.string(), narration}),
	proof: z.object({narration}),
	/** The second concept: what Sınavika does next. Not in bumpers. */
	product: z.object({concept: z.string(), narration}),
	closing: z.object({narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof GoogleVideoAdSchema>;

const GROUND: Record<ModuleKey, [string, string]> = {
	exam: ['#F26B1D', '#C2410C'],
	lessons: ['#0EA5E9', '#0369A1'],
	tests: ['#6366F1', '#3730A3'],
	studyPlan: ['#14B8A6', '#0F766E'],
	smartSummary: ['#8B5CF6', '#5B21B6'],
	flashcards: ['#EC4899', '#9D174D'],
	sinoAi: ['#334155', '#0F172A'],
};
const INK = '#0B1C30';
const ORANGE = '#EA580C';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useSeconds = () => useCurrentFrame() / useVideoConfig().fps;
const useLand = (delay: number, stiffness = 140, damping = 18) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay * fps, fps, config: {stiffness, damping}});
};

type Shape = 'landscape' | 'square' | 'portrait';
const useShape = (): {shape: Shape; width: number; height: number} => {
	const {width, height} = useVideoConfig();
	return {shape: width > height ? 'landscape' : width === height ? 'square' : 'portrait', width, height};
};

/** Positions per shape (frame pixels): copy block, device and proof card. */
const PLACE: Record<Shape, {pad: number; logo: number; head: number; headW: number; sub: number; device: {x: number; y: number; phone: number; browser: number}; proof: {x: number; y: number; scale: number}; subtitleBottom: number; subtitleSize: number}> = {
	landscape: {pad: 110, logo: 46, head: 96, headW: 820, sub: 38, device: {x: 1060, y: 120, phone: 420, browser: 900}, proof: {x: 930, y: 470, scale: 1.05}, subtitleBottom: 44, subtitleSize: 38},
	square: {pad: 80, logo: 40, head: 84, headW: 920, sub: 34, device: {x: 560, y: 400, phone: 400, browser: 760}, proof: {x: 70, y: 500, scale: 0.9}, subtitleBottom: 36, subtitleSize: 32},
	portrait: {pad: 90, logo: 46, head: 104, headW: 900, sub: 40, device: {x: 300, y: 600, phone: 560, browser: 980}, proof: {x: 70, y: 1020, scale: 1.3}, subtitleBottom: 260, subtitleSize: 40},
};

const Ground: React.FC<{module: ModuleKey; from?: ModuleKey; reveal?: number}> = ({module, from, reveal = 1}) => {
	const [a, b] = GROUND[module];
	const glow = (
		<div style={{position: 'absolute', width: '90%', aspectRatio: '1', right: '-30%', top: '-45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 68%)'}} />
	);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			{from ? <AbsoluteFill style={{background: `linear-gradient(150deg, ${GROUND[from][0]} 0%, ${GROUND[from][1]} 100%)`}} /> : null}
			<AbsoluteFill style={{background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)`, clipPath: from ? `circle(${reveal * 150}% at 85% 50%)` : undefined}}>{glow}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Device: React.FC<{concept: AdConcept; platform: AdPlatform; lift: number}> = ({concept, platform, lift}) => {
	const {shape} = useShape();
	const place = PLACE[shape].device;
	const width = platform === 'mobile' ? place.phone : place.browser;
	const x = platform === 'mobile' ? place.x : shape === 'landscape' ? place.x - 120 : shape === 'square' ? 300 : 50;
	return (
		<div style={{position: 'absolute', left: x, top: place.y + (1 - lift) * 500, opacity: Math.min(1, lift * 1.5), filter: 'drop-shadow(0 40px 60px rgba(2, 8, 23, 0.35))'}}>
			{platform === 'mobile' ? (
				<DevicePhone width={width} rotate={4}>
					<AdMobileScreen concept={concept} />
				</DevicePhone>
			) : (
				<DeviceBrowser width={width} title="sinavika.com">
					<AdWebScreen concept={concept} />
				</DeviceBrowser>
			)}
		</div>
	);
};

/** The hook word by word, in white. */
const Hook: React.FC<{text: string; at?: number}> = ({text, at = 0.1}) => {
	const {shape} = useShape();
	const place = PLACE[shape];
	const seconds = useSeconds();
	const words = text.split(' ');
	return (
		<div style={{width: place.headW, fontSize: place.head, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.035em', color: '#FFFFFF', textWrap: 'balance'}}>
			{words.map((word, index) => {
				const show = interpolate(seconds, [at + index * 0.09, at + index * 0.09 + 0.22], [0, 1], CLAMP);
				return (
					<span key={index} style={{display: 'inline-block', marginRight: '0.24em', opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
						{word}
					</span>
				);
			})}
		</div>
	);
};

const Copy: React.FC<{concept: AdConcept; showSub: boolean}> = ({concept, showSub}) => {
	const t = useT();
	const {shape} = useShape();
	const place = PLACE[shape];
	const sub = interpolate(useSeconds(), [0.7, 1.1], [0, 1], CLAMP);
	return (
		<div style={{position: 'absolute', left: place.pad, top: place.pad, display: 'flex', flexDirection: 'column'}}>
			<Logo wordmark height={place.logo} color="#FFFFFF" />
			<div style={{marginTop: place.head * 0.4}}>
				<ExamTag exam={concept.exam} size={place.sub * 0.8} maxWidth={place.headW} />
			</div>
			<div style={{marginTop: place.head * 0.3}}>
				<Hook text={t(concept.headline)} />
			</div>
			{showSub ? <div style={{marginTop: place.sub * 0.7, width: place.headW * 0.92, fontSize: place.sub, fontWeight: 600, lineHeight: 1.32, color: 'rgba(255,255,255,0.9)', opacity: sub, textWrap: 'pretty'}}>{t(concept.subline)}</div> : null}
		</div>
	);
};

const Subtitle: React.FC<{text: string; enabled: boolean}> = ({text, enabled}) => {
	const {shape, width} = useShape();
	const show = interpolate(useSeconds(), [0.15, 0.35], [0, 1], CLAMP);
	if (!enabled || !text) return null;
	const size = PLACE[shape].subtitleSize;
	return (
		<div style={{position: 'absolute', left: 0, width, bottom: PLACE[shape].subtitleBottom, display: 'flex', justifyContent: 'center', opacity: show}}>
			<div style={{maxWidth: width * 0.84, padding: '14px 28px', borderRadius: 18, background: 'rgba(11, 28, 48, 0.78)', color: '#FFFFFF', fontSize: size, fontWeight: 700, lineHeight: 1.25, textAlign: 'center'}}>{text}</div>
		</div>
	);
};

const HookScene: React.FC<{content: Content; text: string}> = ({content, text}) => {
	const concept = findConcept(content.exam, content.hook.concept);
	const lift = useLand(0.5);
	return (
		<UIProvider lang={content.lang} mode="light">
			<AbsoluteFill>
				<Ground module={concept.module} />
				<Device concept={concept} platform={content.platform} lift={lift} />
				<Copy concept={concept} showSub={content.length === 'short'} />
				<Subtitle text={text} enabled={content.subtitles} />
			</AbsoluteFill>
		</UIProvider>
	);
};

const ProofScene: React.FC<{content: Content; text: string}> = ({content, text}) => {
	const concept = findConcept(content.exam, content.hook.concept);
	const {shape} = useShape();
	const place = PLACE[shape].proof;
	const pop = useLand(0.1, 170, 16);
	const breathe = 1 + Math.sin(useSeconds() * 2.4) * 0.008;
	return (
		<UIProvider lang={content.lang} mode="light">
			<AbsoluteFill>
				<Ground module={concept.module} />
				<Device concept={concept} platform={content.platform} lift={1} />
				<Copy concept={concept} showSub={false} />
				<div style={{position: 'absolute', left: place.x, top: place.y, opacity: Math.min(1, pop * 1.4), transform: `scale(${interpolate(pop, [0, 1], [0.8, 1]) * breathe})`, transformOrigin: 'top left'}}>
					<ProofCard proof={concept.proof} width={440} scale={place.scale} style={{position: 'relative'}} />
				</div>
				<Subtitle text={text} enabled={content.subtitles} />
			</AbsoluteFill>
		</UIProvider>
	);
};

const ProductScene: React.FC<{content: Content; text: string}> = ({content, text}) => {
	const first = findConcept(content.exam, content.hook.concept);
	const concept = findConcept(content.exam, content.product.concept);
	const {shape} = useShape();
	const place = PLACE[shape].proof;
	const reveal = interpolate(useSeconds(), [0, 0.55], [0, 1], CLAMP);
	const lift = useLand(0.25);
	const pop = useLand(0.8, 170, 16);
	return (
		<UIProvider lang={content.lang} mode="light">
			<AbsoluteFill>
				<Ground module={concept.module} from={first.module} reveal={reveal} />
				<Device concept={concept} platform={content.platform} lift={lift} />
				<Copy concept={concept} showSub={false} />
				<div style={{position: 'absolute', left: place.x, top: place.y, opacity: Math.min(1, pop * 1.4), transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`, transformOrigin: 'top left'}}>
					<ProofCard proof={concept.proof} width={440} scale={place.scale} style={{position: 'relative'}} />
				</div>
				<Subtitle text={text} enabled={content.subtitles} />
			</AbsoluteFill>
		</UIProvider>
	);
};

/**
 * End card for 16:9 and 1:1, and for the web site in 9:16. It follows the
 * shared PromoEndCard (logo, product, orange call to action, where to get it),
 * laid out for the wider frames.
 */
const EndCard: React.FC<{content: Content}> = ({content}) => {
	const {shape, width, height} = useShape();
	const lang = content.lang as AdLang;
	const logo = useLand(0.05, 200);
	const device = useLand(0.15, 140, 18);
	const button = useLand(0.5, 220, 16);
	const store = interpolate(useSeconds(), [0.8, 1.1], [0, 1], CLAMP);
	const concept = findConcept(content.exam, content.hook.concept);
	const mobile = content.platform === 'mobile';
	const side = shape === 'landscape';
	const deviceWidth = mobile ? (side ? 380 : shape === 'square' ? 300 : 460) : side ? 820 : shape === 'square' ? 640 : 900;
	const channels = mobile ? 'App Store · Google Play' : 'sinavika.com';
	const textBlock = (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: side ? 'flex-start' : 'center', gap: 34}}>
			<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
				<Logo height={side ? 92 : 80} color={ORANGE} />
			</div>
			<div style={{fontSize: side ? 46 : 42, fontWeight: 700, color: INK, opacity: logo, textAlign: side ? 'left' : 'center', maxWidth: side ? 720 : 900}}>{PLATFORM_LINE[content.platform][lang]}</div>
			<div style={{opacity: button, transform: `scale(${interpolate(button, [0, 1], [0.8, 1])})`, padding: '26px 64px', borderRadius: 999, background: ORANGE, boxShadow: `0 18px 36px -16px ${ORANGE}`, color: '#FFFFFF', fontSize: 46, fontWeight: 800}}>{PLATFORM_CTA[content.platform][lang]}</div>
			<div style={{opacity: store, fontSize: 32, fontWeight: 700, color: '#475569'}}>{channels}</div>
		</div>
	);
	const product = (
		<div style={{opacity: Math.min(1, device * 1.4), transform: `translateY(${(1 - device) * 160}px)`, filter: 'drop-shadow(0 30px 50px rgba(2, 8, 23, 0.25))'}}>
			{mobile ? (
				<DevicePhone width={deviceWidth}>
					<AdMobileScreen concept={concept} />
				</DevicePhone>
			) : (
				<DeviceBrowser width={deviceWidth} title="sinavika.com">
					<AdWebScreen concept={concept} />
				</DeviceBrowser>
			)}
		</div>
	);
	return (
		<UIProvider lang={content.lang} mode="light">
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F6FB 55%, #E6ECF5 100%)', width, height}}>
				{side ? (
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 120px'}}>
						{textBlock}
						{product}
					</div>
				) : (
					<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: shape === 'square' ? 40 : 80, overflow: 'hidden'}}>
						{product}
						{textBlock}
					</div>
				)}
			</AbsoluteFill>
		</UIProvider>
	);
};

/** Google videos end on their own card: the exam's own screen, never another exam's (the shared promo card shows a TYT home). */
const Closing: React.FC<{content: Content}> = ({content}) => <EndCard content={content} />;

const SAMPLE: z.input<typeof GoogleVideoAdSchema> = {
	exam: 'kpss',
	platform: 'mobile',
	hook: {concept: 'puan-kaybi', narration: 'KPSS’de puanını nerede kaybettin?'},
	proof: {narration: 'Sınavika her denemeden sonra eksik konularını tek tek gösterir.'},
	product: {concept: 'isten-sonra-plan', narration: 'Ders Planı onları işten sonra çalışabileceğin kısa görevlere çevirir.'},
	closing: {narration: PROMO_END_CARD.narration},
};

/** Bumper timings (seconds): hook, proof, end card = 6 s in all. */
const BUMPER = {hook: 2.2, proof: 2.1, closing: 1.7} as const;

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	if (content.length === 'bumper')
		return [
			{id: 'hook', seconds: BUMPER.hook, label: 'Kanca', silent: true, element: <HookScene content={content} text="" />},
			{id: 'proof', seconds: BUMPER.proof, label: 'Kanıt', silent: true, element: <ProofScene content={content} text="" />},
			...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: BUMPER.closing, label: 'Kapanış', silent: true, element: <Closing content={content} />}] : []),
		];
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 6});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const proof = say('proof', content.proof.narration, beat(content.proof.narration, 2.8), 2.6);
	const product = say('product', content.product.narration, beat(content.product.narration, 3), 2.8);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.4), 2.3);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Kanca', voice: [hook], element: <HookScene content={content} text={content.hook.narration} />},
		{id: 'proof', seconds: proof.seconds, label: 'Kanıt', voice: [proof], element: <ProofScene content={content} text={content.proof.narration} />},
		{id: 'product', seconds: product.seconds, label: 'Ürün', voice: [product], element: <ProductScene content={content} text={content.product.narration} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <Closing content={content} />}] : []),
	];
};

export const GoogleVideoAd = defineTemplate({
	id: 'GoogleVideoAd',
	category: 'Advertisements',
	title: 'Google video reklamı',
	description: 'Google Ads videosu (YouTube, uygulama kampanyası, Maks. Performans): Google görselleriyle aynı dil; kanca, kanıt kartı, ürün ve kapanış. 15 sn sesli veya 6 sn bumper; 16:9, 1:1, 9:16.',
	contentSchema: GoogleVideoAdSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 5.5, max: 20},
	buildScenes,
});
