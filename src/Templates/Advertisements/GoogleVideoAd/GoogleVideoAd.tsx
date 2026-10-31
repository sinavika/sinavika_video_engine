import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {findConcept, PLATFORM_CTA, PLATFORM_LINE, type AdConcept, type AdLang, type AdPlatform} from '../../../Ads/Google/GoogleAdsPlan';
import {AdMobileScreen, AdWebScreen} from '../../../Ads/Google/AdScreens';
import {adGroundOf} from '../../../Ads/Google/AdGround';
import {ExamTag} from '../../../Ads/Google/ExamTag';
import {ProofCard} from '../../../Ads/Google/ProofCard';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {UIProvider, useT} from '../../../UIUX/Context';
import {Logo} from '../../../UIUX/Parts/Shared';
import {DeviceBrowser, DevicePhone} from '../../../UIUX/Parts/Web';
import {defineTemplate} from '../../TemplateDefinition';
import {StoreBadges} from '../../../Components/Brand/StoreBadge';
import {APP_END_CARD} from '../../../Configurations/SocialIdentity';

/**
 * Google Ads video (YouTube in-stream, App campaigns, Performance Max): the
 * moving version of the Google Ads pictures, so a student who saw a banner
 * recognises the video. Brand ground (orange, then navy for the second idea:
 * AdGround), the white logo, the hook in white, the real product in a phone or
 * a browser, the white proof card, then the end card.
 *
 * Nothing lies over text (owner, 30 Oct 2026: "yazılar üst üste binmiş"): the
 * copy, the device and the proof card each have their own part of the frame
 * (PLACE). In 9:16 the proof card takes the device's place instead of covering
 * it. No narration subtitles (owner, 30 Oct 2026: they crowd the frame).
 *
 * Two lengths: `short` (about 15 s, voiced) and `bumper`
 * (6 s, music only, the hook and the proof). Works in 16:9, 1:1 and 9:16; the
 * end card shows the exam's own screen.
 */

const narration = z.string().trim().min(1).max(160);

const GoogleVideoAdSchema = z.object({
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
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof GoogleVideoAdSchema>;

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

type Place = {
	/** The copy block: margin, logo height, hook size and width, supporting line size. */
	pad: number;
	logo: number;
	head: number;
	headW: number;
	sub: number;
	/** Width of the supporting line: in 1:1 it keeps to the left of the phone. */
	subW: number;
	phone: {x: number; y: number; w: number};
	browser: {x: number; y: number; w: number};
	proof: {x: number; y: number; scale: number};
	/** Whether the proof card fits beside the device (16:9, 1:1); in 9:16 it takes the device's place. */
	proofBeside: boolean;
};

/** Parts of the frame per shape (frame pixels), so that copy, device and proof card never meet. */
const PLACE: Record<Shape, Place> = {
	landscape: {pad: 110, logo: 58, head: 92, headW: 800, sub: 36, subW: 760, phone: {x: 1200, y: 90, w: 420}, browser: {x: 1000, y: 230, w: 820}, proof: {x: 110, y: 600, scale: 0.9}, proofBeside: true},
	square: {pad: 70, logo: 50, head: 78, headW: 940, sub: 32, subW: 560, phone: {x: 690, y: 420, w: 300}, browser: {x: 520, y: 610, w: 520}, proof: {x: 70, y: 480, scale: 0.92}, proofBeside: true},
	portrait: {pad: 90, logo: 58, head: 100, headW: 900, sub: 40, subW: 860, phone: {x: 365, y: 740, w: 350}, browser: {x: 60, y: 820, w: 960}, proof: {x: 210, y: 820, scale: 1.5}, proofBeside: false},
};


const Ground: React.FC<{concept: AdConcept; from?: AdConcept; reveal?: number}> = ({concept, from, reveal = 1}) => {
	const [a, b] = adGroundOf(concept);
	const glow = (
		<div style={{position: 'absolute', width: '90%', aspectRatio: '1', right: '-30%', top: '-45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 68%)'}} />
	);
	const [fromA, fromB] = from ? adGroundOf(from) : [a, b];
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			{from ? <AbsoluteFill style={{background: `linear-gradient(150deg, ${fromA} 0%, ${fromB} 100%)`}} /> : null}
			<AbsoluteFill style={{background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)`, clipPath: from ? `circle(${reveal * 150}% at 85% 50%)` : undefined}}>{glow}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Device: React.FC<{concept: AdConcept; platform: AdPlatform; lift: number}> = ({concept, platform, lift}) => {
	const {shape} = useShape();
	const place = platform === 'mobile' ? PLACE[shape].phone : PLACE[shape].browser;
	return (
		<div style={{position: 'absolute', left: place.x, top: place.y + (1 - lift) * 500, opacity: Math.min(1, lift * 1.5), filter: 'drop-shadow(0 40px 60px rgba(2, 8, 23, 0.35))'}}>
			{platform === 'mobile' ? (
				<DevicePhone width={place.w} rotate={4}>
					<AdMobileScreen concept={concept} />
				</DevicePhone>
			) : (
				<DeviceBrowser width={place.w} title="sinavika.com">
					<AdWebScreen concept={concept} />
				</DeviceBrowser>
			)}
		</div>
	);
};

/** The proof card in its own part of the frame. */
const Proof: React.FC<{concept: AdConcept; pop: number; breathe?: number}> = ({concept, pop, breathe = 1}) => {
	const {shape} = useShape();
	const place = PLACE[shape].proof;
	return (
		<div style={{position: 'absolute', left: place.x, top: place.y, opacity: Math.min(1, pop * 1.4), transform: `scale(${interpolate(pop, [0, 1], [0.8, 1]) * breathe})`, transformOrigin: 'top left'}}>
			<ProofCard proof={concept.proof} width={440} scale={place.scale} style={{position: 'relative'}} />
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
			<Logo height={place.logo} color="#FFFFFF" />
			<div style={{marginTop: place.head * 0.4}}>
				<ExamTag exam={concept.exam} size={place.sub * 0.8} maxWidth={place.headW} />
			</div>
			<div style={{marginTop: place.head * 0.3}}>
				<Hook text={t(concept.headline)} />
			</div>
			{showSub ? <div style={{marginTop: place.sub * 0.7, width: place.subW, fontSize: place.sub, fontWeight: 600, lineHeight: 1.32, color: 'rgba(255,255,255,0.9)', opacity: sub, textWrap: 'pretty'}}>{t(concept.subline)}</div> : null}
		</div>
	);
};

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const concept = findConcept(content.exam, content.hook.concept);
	const lift = useLand(0.5);
	return (
		<AbsoluteFill>
			<Ground concept={concept} />
			<Device concept={concept} platform={content.platform} lift={lift} />
			<Copy concept={concept} showSub={content.length === 'short'} />
		</AbsoluteFill>
	);
};

const ProofScene: React.FC<{content: Content}> = ({content}) => {
	const concept = findConcept(content.exam, content.hook.concept);
	const {shape} = useShape();
	const pop = useLand(0.1, 170, 16);
	const breathe = 1 + Math.sin(useSeconds() * 2.4) * 0.008;
	return (
		<AbsoluteFill>
			<Ground concept={concept} />
			{PLACE[shape].proofBeside ? <Device concept={concept} platform={content.platform} lift={1} /> : null}
			<Copy concept={concept} showSub={false} />
			<Proof concept={concept} pop={pop} breathe={breathe} />
		</AbsoluteFill>
	);
};

const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const first = findConcept(content.exam, content.hook.concept);
	const concept = findConcept(content.exam, content.product.concept);
	const {shape} = useShape();
	const reveal = interpolate(useSeconds(), [0, 0.55], [0, 1], CLAMP);
	const lift = useLand(0.25);
	const pop = useLand(0.8, 170, 16);
	return (
		<AbsoluteFill>
			<Ground concept={concept} from={first} reveal={reveal} />
			<Device concept={concept} platform={content.platform} lift={lift} />
			<Copy concept={concept} showSub={false} />
			{PLACE[shape].proofBeside ? <Proof concept={concept} pop={pop} /> : null}
		</AbsoluteFill>
	);
};

/** Every scene speaks the ad's language: screens, copy and cards (an English ad never shows a Turkish screen). */
const InLanguage: React.FC<{content: Content; children: React.ReactNode}> = ({content, children}) => (
	<UIProvider lang={content.lang} mode="light">
		{children}
	</UIProvider>
);

/**
 * End card for 16:9 and 1:1, and for the web site in 9:16. It follows the
 * shared AppEndCard (logo, product, orange call to action, the store badges),
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
	// Sized so the card's product, logo, button and badges fit the frame whole (in 1:1 a 300 px phone pushed the badges out).
	const deviceWidth = mobile ? (side ? 380 : shape === 'square' ? 210 : 460) : side ? 820 : shape === 'square' ? 560 : 900;
	const textBlock = (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: side ? 'flex-start' : 'center', gap: 34}}>
			<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
				<Logo height={side ? 92 : 80} color={ORANGE} />
			</div>
			<div style={{fontSize: side ? 46 : 42, fontWeight: 700, color: INK, opacity: logo, textAlign: side ? 'left' : 'center', maxWidth: side ? 720 : 900}}>{PLATFORM_LINE[content.platform][lang]}</div>
			<div style={{opacity: button, transform: `scale(${interpolate(button, [0, 1], [0.8, 1])})`, padding: '26px 64px', borderRadius: 999, background: ORANGE, boxShadow: `0 18px 36px -16px ${ORANGE}`, color: '#FFFFFF', fontSize: 46, fontWeight: 800}}>{PLATFORM_CTA[content.platform][lang]}</div>
			<div style={{opacity: store}}>{mobile ? <StoreBadges height={side ? 88 : 96} lang={lang} align={side ? 'flex-start' : 'center'} /> : <div style={{fontSize: 32, fontWeight: 700, color: APP_END_CARD.muted}}>{APP_END_CARD.site}</div>}</div>
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
			<AbsoluteFill style={{background: APP_END_CARD.ground, width, height}}>
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
	closing: {narration: APP_END_CARD.narration},
};

/** Bumper timings (seconds): hook, proof, end card = 6 s in all. */
const BUMPER = {hook: 2.2, proof: 2.1, closing: 1.7} as const;

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	if (content.length === 'bumper')
		return [
			{id: 'hook', seconds: BUMPER.hook, label: 'Kanca', silent: true, element: <InLanguage content={content}><HookScene content={content} /></InLanguage>},
			{id: 'proof', seconds: BUMPER.proof, label: 'Kanıt', silent: true, element: <InLanguage content={content}><ProofScene content={content} /></InLanguage>},
			...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: BUMPER.closing, label: 'Kapanış', silent: true, element: <Closing content={content} />}] : []),
		];
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 6});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const proof = say('proof', content.proof.narration, beat(content.proof.narration, 2.8), 2.6);
	const product = say('product', content.product.narration, beat(content.product.narration, 3), 2.8);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.4), 2.3);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Kanca', voice: [hook], element: <InLanguage content={content}><HookScene content={content} /></InLanguage>},
		{id: 'proof', seconds: proof.seconds, label: 'Kanıt', voice: [proof], element: <InLanguage content={content}><ProofScene content={content} /></InLanguage>},
		{id: 'product', seconds: product.seconds, label: 'Ürün', voice: [product], element: <InLanguage content={content}><ProductScene content={content} /></InLanguage>},
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
