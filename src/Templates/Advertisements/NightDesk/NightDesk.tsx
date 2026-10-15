import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {UIProvider} from '../../../UIUX/Context';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, PromoSubtitle, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Late night at a desk: a drawn room (no photograph), a warm lamp, a monitor
 * seen at an angle. Everything happens on the monitor: kinetic words, an
 * orange band, the logo, then the web panel. The camera keeps pushing in.
 */

const narration = z.string().trim().min(1).max(170);

export const NightDeskSchema = z.object({
	time: z.object({clock: plainText(8), line: plainText(20), narration}),
	doubt: z.object({text: plainText(48), highlight: plainText(20), narration}),
	band: z.object({text: plainText(26), narration}),
	reveal: z.object({word: plainText(20), narration}),
	product: z.object({screen: z.enum(PROMO_WEB_SCREEN_NAMES), caption: plainText(30), narration}),
	closing: z.object({lines: z.tuple([plainText(22), plainText(22)]), site: plainText(30).default('sinavika.com'), narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof NightDeskSchema>;

const WALL = '#0B1C30';
const WARM = '#F59E0B';
const ORANGE = '#EA580C';
const SCREEN = {w: 860, h: 484};

/**
 * Where the design canvas sits in the frame, in pixels: the room is drawn
 * full-bleed behind it, so its desk line and the camera push must line up
 * with the furniture placed on the canvas.
 */
const useCanvasFrame = () => {
	const {u, contentWidth, contentHeight, safeArea} = useVideoLayout();
	const scale = Math.min(contentWidth / u(952), contentHeight / u(1530));
	const height = u(1530) * scale;
	const width = u(952) * scale;
	return {top: safeArea.top + (contentHeight - height) / 2, left: safeArea.left + (contentWidth - width) / 2, width, height};
};

/** The room behind everything, full-bleed: wall, lamp light, light bands, the desk and the screen's glow on it. */
const RoomGround: React.FC<{push: number; glow: string}> = ({push, glow}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const frame = useCanvasFrame();
	const flicker = 1 + Math.sin(seconds * 7) * 0.01;
	const deskTop = frame.top + frame.height * 0.64;
	const origin = `${frame.left + frame.width * 0.5}px ${frame.top + frame.height * 0.45}px`;
	return (
		<AbsoluteFill style={{background: WALL, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${1 + push * 0.18})`, transformOrigin: origin}}>
				<AbsoluteFill style={{background: `radial-gradient(45% 30% at 22% 20%, rgba(245,158,11,${0.32 * flicker}) 0%, rgba(245,158,11,0) 70%)`}} />
				<AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, rgba(255,170,80,0.06) 0px, rgba(255,170,80,0.06) 90px, rgba(0,0,0,0) 90px, rgba(0,0,0,0) 150px)', maskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 6%, #000 20%, #000 34%, rgba(0,0,0,0) 48%)', WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 6%, #000 20%, #000 34%, rgba(0,0,0,0) 48%)'}} />
				<div style={{position: 'absolute', left: '-10%', right: '-10%', top: deskTop, bottom: '-10%', background: 'linear-gradient(180deg, #16263D 0%, #070F1C 100%)', borderTop: `${u(3)}px solid #24364F`}} />
				<div style={{position: 'absolute', left: '15%', right: '15%', top: deskTop - frame.height * 0.02, height: frame.height * 0.18, background: `radial-gradient(50% 60% at 50% 0%, ${glow} 0%, rgba(0,0,0,0) 75%)`, opacity: 0.55}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** The furniture on the canvas (keyboard, mug, stand) and the monitor, pushed in with the room. */
const Room: React.FC<{push: number; children: React.ReactNode}> = ({push, children}) => {
	const {u} = useVideoLayout();
	return (
		<AbsoluteFill style={{transform: `scale(${1 + push * 0.18})`, transformOrigin: '50% 45%'}}>
			<div style={{position: 'absolute', left: '22%', width: '56%', top: '74%', height: '5%', borderRadius: u(18), background: 'linear-gradient(180deg, #2A3A52, #172338)', boxShadow: `0 ${u(10)}px ${u(20)}px rgba(0,0,0,0.6)`}} />
			<div style={{position: 'absolute', left: '82%', width: '8%', top: '66%', height: '9%', borderRadius: `${u(10)}px ${u(10)}px ${u(24)}px ${u(24)}px`, background: 'linear-gradient(90deg, #1E2D44, #33465F)'}} />
			<div style={{position: 'absolute', left: '47%', width: '6%', top: '56%', height: '9%', background: 'linear-gradient(90deg, #1A1A1A, #333)'}} />
			<div style={{position: 'absolute', left: '38%', width: '24%', top: '64%', height: '1.6%', borderRadius: u(10), background: '#2B2B2B'}} />
			{children}
		</AbsoluteFill>
	);
};

/** The monitor: a frame seen slightly from the side, its screen holding the scene. */
const Monitor: React.FC<{children: React.ReactNode; background?: string}> = ({children, background = '#0A0A0A'}) => {
	const {u} = useVideoLayout();
	return (
		<At x={(952 - SCREEN.w) / 2 - 18} y={380} style={{perspective: u(2200)}}>
			<div style={{padding: u(18), borderRadius: u(22), background: 'linear-gradient(160deg, #2A2A2A, #0D0D0D)', boxShadow: `0 ${u(40)}px ${u(90)}px rgba(0,0,0,0.7)`, transform: 'rotateY(-7deg) rotateX(2deg)'}}>
				<div style={{position: 'relative', width: u(SCREEN.w), height: u(SCREEN.h), borderRadius: u(6), overflow: 'hidden', background}}>{children}</div>
			</div>
		</At>
	);
};

const Scene: React.FC<{content: Content; narration: string; shown?: string; push: [number, number]; glow?: string; screenBg?: string; children: React.ReactNode}> = ({content, narration: text, shown, push, glow = 'rgba(234,88,12,0.5)', screenBg, children}) => {
	const seconds = useSeconds();
	const p = interpolate(seconds, [0, 6], push, CLAMP);
	return (
		<PromoStage ground={<RoomGround push={p} glow={glow} />}>
			<Room push={p}>
				<Monitor background={screenBg}>{children}</Monitor>
			</Room>
			<PromoSubtitle text={text} shown={shown} enabled={content.subtitles} ink="#0B1C30" fill="#FFFFFF" />
		</PromoStage>
	);
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}}>{children}</div>;

const TimeScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const show = interpolate(seconds, [0.2, 0.6], [0, 1], CLAMP);
	const blink = Math.floor(seconds * 2) % 2 === 0;
	return (
		<Scene content={content} narration={content.time.narration} shown={`${content.time.line} ${content.time.clock}`} push={[0, 0.15]} glow="rgba(255,255,255,0.18)">
			<Center>
				<div style={{opacity: show}}>
					<Text size={34} weight={TYPE.weights.strong} color="#A8A29E" align="center">
						{content.time.line}
					</Text>
					<Text variant="display" size={170} weight={TYPE.weights.kinetic} color="#FAFAF9" align="center" style={{letterSpacing: '-0.04em'}}>
						{content.time.clock.replace(/[.:]/, blink ? ':' : ' ')}
					</Text>
				</div>
			</Center>
		</Scene>
	);
};

const DoubtScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const [before, after] = content.doubt.text.split(content.doubt.highlight);
	const mark = ease(interpolate(seconds, [0.9, 1.4], [0, 1], CLAMP));
	return (
		<Scene content={content} narration={content.doubt.narration} shown={content.doubt.text} push={[0.15, 0.3]} glow="rgba(255,255,255,0.2)">
			<Center>
				<div style={{padding: `0 ${u(60)}px`, textAlign: 'center', opacity: interpolate(seconds, [0.1, 0.5], [0, 1], CLAMP)}}>
					<Text variant="display" size={58} weight={TYPE.weights.display} color="#FAFAF9" align="center" style={{lineHeight: 1.25}}>
						{before}
						<span style={{position: 'relative', whiteSpace: 'nowrap'}}>
							<span style={{position: 'absolute', left: -u(8), right: -u(8), top: '8%', bottom: '4%', background: '#BAE6FD', transform: `scaleX(${mark})`, transformOrigin: 'left', zIndex: 0}} />
							<span style={{position: 'relative', color: mark > 0.5 ? '#0C1A2B' : '#FAFAF9'}}>{content.doubt.highlight}</span>
						</span>
						{after}
					</Text>
				</div>
			</Center>
		</Scene>
	);
};

const BandScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const sweep = ease(interpolate(seconds, [0.05, 0.45], [0, 1], CLAMP));
	return (
		<Scene content={content} narration={content.band.narration} shown={content.band.text} push={[0.3, 0.42]} glow="rgba(234,88,12,0.75)">
			<div style={{position: 'absolute', left: 0, right: 0, top: '36%', height: '28%', background: ORANGE, transform: `scaleX(${sweep})`, transformOrigin: 'left', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{opacity: interpolate(seconds, [0.35, 0.6], [0, 1], CLAMP), padding: `0 ${u(30)}px`}}>
					<Text variant="display" size={70} weight={TYPE.weights.kinetic} color="#FFFFFF" align="center">
						{content.band.text}
					</Text>
				</div>
			</div>
		</Scene>
	);
};

const RevealScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const open = ease(interpolate(seconds, [0.1, 0.9], [0, 1], CLAMP));
	const word = interpolate(seconds, [1.0, 1.4], [0, 1], CLAMP);
	return (
		<Scene content={content} narration={content.reveal.narration} shown={content.reveal.word} push={[0.42, 0.55]} glow="rgba(251,146,60,0.7)" screenBg="linear-gradient(120deg, #FDE7D6 0%, #FFFFFF 45%, #DDF3F8 100%)">
			<Center>
				<div style={{opacity: open, transform: `scale(${interpolate(open, [0, 1], [0.85, 1])})`}}>
					<BrandMark size="chrome" color="#0B1C30" />
				</div>
				<div style={{opacity: word}}>
					<Text variant="display" size={64} weight={TYPE.weights.display} color="#0B1C30" align="center">
						{content.reveal.word}
					</Text>
				</div>
			</Center>
		</Scene>
	);
};

const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_WEB_SCREENS[content.product.screen];
	const scale = u(SCREEN.w) / 1440;
	const pan = ease(interpolate(seconds, [0.6, 3.2], [0, 1], CLAMP));
	return (
		<Scene content={content} narration={content.product.narration} shown={content.product.caption} push={[0.55, 0.7]} glow="rgba(255,255,255,0.35)">
			<div style={{width: 1440, height: 900, transform: `scale(${scale * (1 + pan * 0.35)}) translate(${-pan * 260}px, ${-pan * 120}px)`, transformOrigin: 'top left'}}>
				<UIProvider lang="tr" mode="light">
					<Screen />
				</UIProvider>
			</div>
			<div style={{position: 'absolute', left: u(24), bottom: u(20), padding: `${u(10)}px ${u(20)}px`, borderRadius: u(999), background: 'rgba(11,28,48,0.88)', opacity: interpolate(seconds, [0.8, 1.2], [0, 1], CLAMP)}}>
				<Text size={26} weight={TYPE.weights.strong} color="#FFFFFF">
					{content.product.caption}
				</Text>
			</div>
		</Scene>
	);
};

const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const one = interpolate(seconds, [0.1, 0.5], [0, 1], CLAMP);
	const two = interpolate(seconds, [0.7, 1.1], [0, 1], CLAMP);
	const site = interpolate(seconds, [1.3, 1.7], [0, 1], CLAMP);
	return (
		<Scene content={content} narration={content.closing.narration} shown={`${content.closing.lines.join(' ')} ${content.closing.site}`} push={[0.7, 0.8]} glow="rgba(234,88,12,0.6)">
			<Center>
				<div style={{opacity: one}}>
					<Text variant="display" size={74} weight={TYPE.weights.kinetic} color="#FAFAF9" align="center">
						{content.closing.lines[0]}
					</Text>
				</div>
				<div style={{opacity: two}}>
					<Text variant="display" size={74} weight={TYPE.weights.kinetic} color={WARM} align="center">
						{content.closing.lines[1]}
					</Text>
				</div>
				<div style={{opacity: site, marginTop: 10}}>
					<Text size={40} weight={TYPE.weights.strong} color="#D6D3D1" align="center">
						{content.closing.site}
					</Text>
				</div>
			</Center>
		</Scene>
	);
};

const SAMPLE: z.input<typeof NightDeskSchema> = {
	time: {clock: '23.40', line: 'Saat', narration: 'Saat yirmi üçü kırk geçiyor.'},
	doubt: {text: 'Hâlâ ne çalışacağını düşünüyorsun.', highlight: 'düşünüyorsun', narration: 'Hâlâ ne çalışacağını düşünüyorsun.'},
	band: {text: 'Önce şunu çözelim.', narration: 'Önce şunu çözelim.'},
	reveal: {word: 'Tek plan.', narration: 'Sınavika’da bugün ne çalışacağın hazır.'},
	product: {screen: 'webPlanToday', caption: 'Bugün · 3 görev · 45 dk', narration: 'Üç görev, kırk beş dakika. İlkine tıkla, odak sayacın başlasın.'},
	closing: {lines: ['Masaya otur.', 'Gerisi hazır.'], narration: 'Masaya otur, gerisi hazır. Web’de sinavika.com’da.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const time = say('time', content.time.narration, beat(content.time.narration, 2.4), 2.2);
	const doubt = say('doubt', content.doubt.narration, beat(content.doubt.narration, 2.8), 2.6);
	const band = say('band', content.band.narration, beat(content.band.narration, 1.8), 1.6);
	const reveal = say('reveal', content.reveal.narration, beat(content.reveal.narration, 2.6), 2.4);
	const product = say('product', content.product.narration, beat(content.product.narration, 4), 3.6);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 3), 2.8);
	return [
		{id: 'time', seconds: time.seconds, label: 'Saat', voice: [time], element: <TimeScene content={content} />},
		{id: 'doubt', seconds: doubt.seconds, label: 'Kararsızlık', voice: [doubt], element: <DoubtScene content={content} />},
		{id: 'band', seconds: band.seconds, label: 'Bant', voice: [band], element: <BandScene content={content} />},
		{id: 'reveal', seconds: reveal.seconds, label: 'Logo', voice: [reveal], element: <RevealScene content={content} />},
		{id: 'product', seconds: product.seconds, label: 'Panel', voice: [product], element: <ProductScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <ClosingScene content={content} />}] : []),
	];
};

export const NightDesk = defineTemplate({
	id: 'NightDesk',
	category: 'Advertisements',
	title: 'Gece masası',
	description: 'Web tanıtımı: çizim gece odası, lamba ışığı, açılı monitör; ekranda kinetik yazı, turuncu bant, logo ve web paneli.',
	contentSchema: NightDeskSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 16, max: 32},
	buildScenes,
});
