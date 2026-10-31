import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BRAND_THEME_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import type {ScenePlan, TemplateScene} from '../../../Scenes/ScenePlan';
import {plainText} from '../../../Schemas/RichText';
import {defineTemplate} from '../../TemplateDefinition';
import {CLAMP, ease, useSeconds} from '../PromoKit/PromoKit';

/**
 * National day tribute (29 Ekim): Atatürk's own voice from an archival recording, cut into short clips, each
 * sentence appearing word by word as he says it over period film (or his portrait); an original score kept at
 * one low, steady level under the whole video; a crescent-and-star finale. No narrator: the speech is never imitated.
 */

const RED = '#E30A17';
const WHITE = '#FFFFFF';
const INK = '#0A0A0A';
const FONT = BRAND_THEME_TYPOGRAPHY.display;

/** A shot of archival film: a muted mp4 in public/, from `from` seconds, shown for `seconds`, framed at `focus` (% across). */
const ShotSchema = z.object({src: z.string().min(1), from: z.number().min(0).default(0), seconds: z.number().positive(), focus: z.number().min(0).max(100).default(50)});

const ClipSchema = z.object({
	/** Seconds into the recording where the clip starts and ends. */
	from: z.number().min(0),
	to: z.number().positive(),
	/** Each word with the second (from the clip's start) at which it is said, from a speech-to-text pass. */
	words: z.array(z.object({text: z.string().trim().min(1).max(30), at: z.number().min(0)})).min(1).max(30),
	/** Film shots one after another under the clip; without them the portrait is shown. */
	footage: z.array(ShotSchema).max(6).default([]),
});

const RepublicDaySchema = z.object({
	portrait: z.string().default('Media/History/ataturk-portre.png'),
	speech: z.string().default('Media/History/ataturk-10-yil-nutku-1933.ogg'),
	music: z.string().default('Music/cumhuriyet-29-ekim-destansi.mp3'),
	intro: z.object({date: plainText(20), year: plainText(10), line: plainText(40), seconds: z.number().min(1).max(5).default(2.6), footage: z.array(ShotSchema).max(3).default([])}),
	/** Where the voice comes from, shown above the words. */
	source: plainText(60),
	clips: z.array(ClipSchema).min(1).max(6),
	/** Pause after each clip. */
	gapSeconds: z.number().min(0).max(3).default(0.8),
	closing: z.object({title: plainText(40), line: plainText(60), seconds: z.number().min(2).max(8).default(4.2)}),
	/** The closing card (title, line, logo) is this template's outro; it can be left out like every template's. */
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	/** The score's one level under the whole video (owner, 29 Oct 2026: no swells, keep it low and steady). */
	musicLevel: z.number().min(0).max(1).default(0.2),
	/** Where in the score the closing picks up again, so the finale is never silent when the score is shorter than the video. */
	closingMusicFrom: z.number().min(0).default(36),
});
type Content = z.infer<typeof RepublicDaySchema>;

/** When each part starts, in seconds of the video. */
const timeline = (content: Content) => {
	let at = content.intro.seconds;
	const clips = content.clips.map((clip) => {
		const start = at;
		const length = clip.to - clip.from;
		at += length + content.gapSeconds;
		return {start, length};
	});
	return {clips, closing: at, total: at + content.closing.seconds};
};

/** A white flash and a slight shake at a cut, the beat the music hits on. */
const Flash: React.FC<{at?: number}> = ({at = 0}) => {
	const t = useSeconds() - at;
	return <AbsoluteFill style={{background: WHITE, opacity: interpolate(t, [0, 0.04, 0.32], [0, 0.85, 0], CLAMP), pointerEvents: 'none'}} />;
};

const Grain: React.FC = () => {
	const t = useSeconds();
	const shift = Math.floor(t * 24) % 7;
	return (
		<AbsoluteFill
			style={{
				opacity: 0.08,
				backgroundImage: 'repeating-radial-gradient(circle at 17% 32%, rgba(255,255,255,0.9) 0 1px, transparent 1px 3px)',
				backgroundPosition: `${shift * 13}px ${shift * 7}px`,
				mixBlendMode: 'overlay',
			}}
		/>
	);
};

/** The portrait, slowly pushing in, graded black and white with a red glow and a passing light. */
const Portrait: React.FC<{content: Content; seed: number; length: number}> = ({content, seed, length}) => {
	const t = useSeconds();
	const p = Math.min(1, t / Math.max(1, length));
	const scale = 1.12 + 0.14 * ease(p) + (seed % 2) * 0.04;
	const drift = (seed % 2 === 0 ? -1 : 1) * 18 * p;
	const sweep = interpolate(t, [0.2, 2.4], [-60, 160], CLAMP);
	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Img src={staticFile(content.portrait)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%', transform: `scale(${scale}) translateX(${drift}px)`, filter: 'grayscale(1) contrast(1.2) brightness(0.82)'}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.75) 100%)`}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(227,10,23,0.35) 0%, transparent 30%, transparent 45%, rgba(0,0,0,0.92) 78%, #000 100%)`}} />
			<AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${sweep - 18}%, rgba(255,255,255,0.16) ${sweep}%, transparent ${sweep + 18}%)`, mixBlendMode: 'screen'}} />
			<Grain />
		</AbsoluteFill>
	);
};

/** Bars that move while he speaks: louder near each word's start. */
const VoiceBars: React.FC<{words: Content['clips'][number]['words']}> = ({words}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const near = Math.max(0, ...words.map((word) => 1 - Math.min(1, Math.abs(t - word.at - 0.12) / 0.45)));
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: u(6), height: u(40)}}>
			{Array.from({length: 9}, (_, index) => {
				const wave = 0.35 + 0.65 * Math.abs(Math.sin(t * (7 + index) + index * 1.7));
				return <div key={index} style={{width: u(6), height: u(8 + 30 * near * wave), borderRadius: u(3), background: index % 2 ? WHITE : RED}} />;
			})}
		</div>
	);
};

/** Period film, cut shot after shot, graded black and white with the same red light and grain as the portrait. */
const Footage: React.FC<{shots: z.infer<typeof ShotSchema>[]}> = ({shots}) => {
	const {fps} = useVideoConfig();
	const t = useSeconds();
	let start = 0;
	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			{shots.map((shot, index) => {
				const from = Math.round(start * fps);
				start += shot.seconds;
				const local = Math.max(0, t - from / fps);
				return (
					<Sequence key={index} from={from} durationInFrames={Math.round(shot.seconds * fps)}>
						<OffthreadVideo muted src={staticFile(shot.src)} trimBefore={Math.round(shot.from * fps)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${shot.focus}% 40%`, transform: `scale(${1.04 + 0.05 * Math.min(1, local / shot.seconds)})`, filter: 'grayscale(1) contrast(1.18) brightness(0.92)'}} />
					</Sequence>
				);
			})}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.7) 100%)`}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(227,10,23,0.28) 0%, transparent 26%, transparent 48%, rgba(0,0,0,0.9) 80%, #000 100%)`}} />
			<Grain />
		</AbsoluteFill>
	);
};

const ClipScene: React.FC<{content: Content; index: number; length: number}> = ({content, index, length}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const clip = content.clips[index];
	const letters = clip.words.reduce((sum, word) => sum + word.text.length + 1, 0);
	const size = letters > 90 ? 72 : letters > 60 ? 84 : letters > 30 ? 100 : 124;
	const last = clip.words.length - 1;
	const header = interpolate(t, [0.05, 0.4], [0, 1], CLAMP);
	return (
		<AbsoluteFill>
			{clip.footage.length ? <Footage shots={clip.footage} /> : <Portrait content={content} seed={index} length={length} />}
			<AbsoluteFill style={{padding: `${u(150)}px ${u(70)}px ${u(250)}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: u(26)}}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(18), opacity: header, transform: `translateX(${(1 - header) * -40}px)`}}>
					<div style={{background: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: u(26), letterSpacing: u(2), padding: `${u(8)}px ${u(16)}px`, borderRadius: u(8)}}>ATATÜRK'ÜN SESİNDEN</div>
					<VoiceBars words={clip.words} />
				</div>
				<div style={{color: 'rgba(255,255,255,0.75)', fontFamily: FONT, fontWeight: 700, fontSize: u(26), opacity: header}}>{content.source}</div>
				<div style={{display: 'flex', flexWrap: 'wrap', columnGap: u(size * 0.28), rowGap: u(size * 0.08)}}>
					{clip.words.map((word, w) => {
						const p = interpolate(t, [word.at - 0.06, word.at + 0.16], [0, 1], CLAMP);
						const spoken = t >= word.at;
						const isLast = w === last;
						return (
							<span
								key={w}
								style={{
									fontFamily: FONT,
									fontWeight: 800,
									fontSize: u(size * (isLast ? 1.06 : 1)),
									lineHeight: 1.08,
									letterSpacing: -u(1),
									color: isLast && spoken ? RED : WHITE,
									opacity: p,
									transform: `translateY(${(1 - p) * 26}px) scale(${1 + (1 - p) * 0.25})`,
									filter: `blur(${(1 - p) * 6}px)`,
									textShadow: '0 4px 24px rgba(0,0,0,0.85)',
								}}
							>
								{word.text}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
			<Flash />
		</AbsoluteFill>
	);
};

const IntroScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const slam = interpolate(t, [0.05, 0.35], [1.6, 1], {...CLAMP, easing: (x) => 1 - (1 - x) ** 3});
	const year = interpolate(t, [0.55, 0.85], [0, 1], CLAMP);
	const line = interpolate(t, [1.1, 1.5], [0, 1], CLAMP);
	const glow = interpolate(t, [0, 0.4, content.intro.seconds], [0, 0.9, 0.5], CLAMP);
	return (
		<AbsoluteFill style={{background: INK, alignItems: 'center', justifyContent: 'center'}}>
			<AbsoluteFill style={{opacity: content.intro.footage.length ? 0.5 : 0.28}}>
				{content.intro.footage.length ? <Footage shots={content.intro.footage} /> : <Portrait content={content} seed={7} length={content.intro.seconds} />}
			</AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(227,10,23,${glow}) 0%, transparent 62%)`}} />
			<div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 800, color: WHITE}}>
				<div style={{fontSize: u(190), lineHeight: 0.95, letterSpacing: -u(6), transform: `scale(${slam})`, textShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>{content.intro.date}</div>
				<div style={{fontSize: u(150), lineHeight: 1, color: RED, opacity: year, transform: `translateY(${(1 - year) * 40}px)`, WebkitTextStroke: `${u(3)}px ${WHITE}`}}>{content.intro.year}</div>
				<div style={{marginTop: u(40), fontSize: u(46), fontWeight: 700, opacity: line, letterSpacing: u(1)}}>{content.intro.line}</div>
			</div>
			<Flash />
		</AbsoluteFill>
	);
};

/** The crescent and star, in the flag's proportions (Bayrak Kanunu), on a 1200 × 800 field. */
const CrescentStar: React.FC<{size: number; turn: number}> = ({size, turn}) => {
	const star = Array.from({length: 10}, (_, k) => {
		const r = k % 2 === 0 ? 100 : 38.2;
		const a = Math.PI + (k * Math.PI) / 5;
		return `${(583.334 + r * Math.cos(a)).toFixed(2)},${(400 + r * Math.sin(a)).toFixed(2)}`;
	}).join(' ');
	return (
		<svg width={size} height={(size * 2) / 3} viewBox="200 150 600 500" style={{overflow: 'visible', transform: `rotate(${turn}deg)`}}>
			<circle cx={425} cy={400} r={200} fill={WHITE} />
			<circle cx={475} cy={400} r={160} fill={RED} />
			<polygon points={star} fill={WHITE} />
		</svg>
	);
};

const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const flag = interpolate(t, [0.05, 0.6], [0, 1], {...CLAMP, easing: (x) => 1 - (1 - x) ** 3});
	const title = interpolate(t, [0.7, 1.05], [0, 1], CLAMP);
	const line = interpolate(t, [1.3, 1.7], [0, 1], CLAMP);
	const brand = interpolate(t, [2.1, 2.5], [0, 1], CLAMP);
	const rays = t * 6;
	return (
		<AbsoluteFill style={{background: RED, alignItems: 'center', justifyContent: 'center'}}>
			<AbsoluteFill style={{background: `repeating-conic-gradient(from ${rays}deg at 50% 36%, rgba(255,255,255,0.07) 0deg 8deg, transparent 8deg 22deg)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 36%, transparent 30%, rgba(0,0,0,0.45) 100%)'}} />
			<div style={{position: 'absolute', top: u(330), transform: `scale(${0.4 + 0.6 * flag})`, opacity: flag}}>
				<CrescentStar size={u(620)} turn={(1 - flag) * -25} />
			</div>
			<div style={{position: 'absolute', top: u(900), left: u(70), right: u(70), textAlign: 'center', fontFamily: FONT, color: WHITE}}>
				<div style={{fontWeight: 800, fontSize: u(96), lineHeight: 1.04, letterSpacing: -u(2), opacity: title, transform: `translateY(${(1 - title) * 40}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.35)'}}>{content.closing.title}</div>
				<div style={{marginTop: u(36), fontWeight: 700, fontSize: u(44), opacity: line}}>{content.closing.line}</div>
			</div>
			<div style={{position: 'absolute', bottom: u(170), opacity: brand}}>
				<BrandMark size="card" color={WHITE} />
			</div>
			<Flash />
		</AbsoluteFill>
	);
};

/** The recording's clips over the score, which stays at one low level throughout and picks up again for the closing. */
const Soundtrack: React.FC<{content: Content}> = ({content}) => {
	const {fps} = useVideoConfig();
	const plan = timeline(content);
	const closingFrame = Math.round(plan.closing * fps);
	const level = (fadeIn: boolean, end: number) => (frame: number) => {
		const s = frame / fps;
		return content.musicLevel * interpolate(s, [0, fadeIn ? 0.3 : 0.05, end - 0.8, end], [0, 1, 1, 0], CLAMP);
	};
	return (
		<>
			<Sequence durationInFrames={closingFrame}>
				<Audio src={staticFile(content.music)} volume={level(true, plan.closing + 0.6)} />
			</Sequence>
			<Sequence from={closingFrame}>
				<Audio src={staticFile(content.music)} trimBefore={Math.round(content.closingMusicFrom * fps)} volume={level(false, content.closing.seconds)} />
			</Sequence>
			{content.clips.map((clip, index) => (
				<Sequence key={index} from={Math.round(plan.clips[index].start * fps)} durationInFrames={Math.round((clip.to - clip.from) * fps)}>
					<Audio src={staticFile(content.speech)} trimBefore={Math.round(clip.from * fps)} trimAfter={Math.round(clip.to * fps)} volume={1} />
				</Sequence>
			))}
		</>
	);
};

const buildScenes = (content: Content): TemplateScene[] => {
	const plan = timeline(content);
	return [
		{id: 'intro', seconds: content.intro.seconds, label: 'Açılış', silent: true, element: <IntroScene content={content} />},
		...content.clips.map((_clip, index) => ({
			id: `clip${index + 1}`,
			seconds: plan.clips[index].length + content.gapSeconds,
			label: `Nutuk ${index + 1}`,
			silent: true,
			element: <ClipScene content={content} index={index} length={plan.clips[index].length + content.gapSeconds} />,
		})),
		...(content.outro.enabled ? [{id: 'outro', seconds: content.closing.seconds, label: 'Kapanış', silent: true, element: <ClosingScene content={content} />}] : []),
	];
};

const SAMPLE: z.input<typeof RepublicDaySchema> = {
	intro: {date: '29 EKİM', year: '1923', line: 'Cumhuriyetimizin 103. yılı'},
	source: 'Onuncu Yıl Nutku · 29 Ekim 1933',
	clips: [{from: 41.4, to: 45.95, words: [{text: 'Az', at: 0.2}, {text: 'zamanda', at: 0.5}, {text: 'çok', at: 1.2}, {text: 've', at: 1.6}, {text: 'büyük', at: 1.9}, {text: 'işler', at: 2.6}, {text: 'yaptık.', at: 3.2}]}],
	closing: {title: 'Cumhuriyetimizin 103. yılı kutlu olsun!', line: 'Ne mutlu Türk\'üm diyene!'},
};

export const RepublicDay = defineTemplate({
	id: 'RepublicDay',
	category: 'Advertisements',
	title: 'Milli gün anması',
	description: 'Atatürk\'ün arşiv kaydından kesitler, söylendiği anda beliren kelimeler, portre üzerinde destansı kurgu ve ay-yıldızlı kapanış.',
	contentSchema: RepublicDaySchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 10, max: 60},
	buildScenes,
	renderOverlay: (content: Content, _plan: ScenePlan) => <Soundtrack content={content} />,
});
