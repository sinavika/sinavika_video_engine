import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {plainText} from '../../../Schemas/RichText';
import {defineTemplate} from '../../TemplateDefinition';
import {CLAMP, ease, useSeconds} from '../PromoKit/PromoKit';

/**
 * 10 Kasım, 09.05 (Kasım 2026). A remembrance, not an advert: no narrator, no
 * product, no call, no brand name; only a small logo at the very end (owner,
 * 29 Oct 2026). One clock stops at 09.05 and a distant siren rises; 1933
 * public-domain film in slow motion, black and white, with grain; Atatürk's
 * own voice from the Onuncu Yıl Nutku (cuts not used on 29 Ekim), each word
 * appearing as it is said; then the young, the flags, the crowd; and silence
 * with "Saygı, sevgi ve özlemle." Different from RepublicDay: no red, no
 * flashes, no cuts on a beat; everything slow and still.
 */

const ShotSchema = z.object({src: z.string().min(1), from: z.number().min(0).default(0), seconds: z.number().positive(), rate: z.number().min(0.25).max(1).default(0.5)});

const ClipSchema = z.object({
	/** Seconds into the speech recording. */
	from: z.number().min(0),
	to: z.number().positive(),
	/** Each word with the second (from the clip's start) at which it is said. */
	words: z.array(z.object({text: plainText(24), at: z.number().min(0)})).min(1).max(40),
	footage: z.array(ShotSchema).min(1).max(4),
});

const AtaturkMemorialSchema = z.object({
	clock: z.object({time: z.tuple([z.number().int().min(1).max(12), z.number().int().min(0).max(59)]), line: plainText(40), seconds: z.number().min(2).max(6).default(3.2)}),
	date: z.object({text: plainText(24), footage: z.array(ShotSchema).min(1).max(3)}),
	siren: z.object({src: z.string().min(1), seconds: z.number().min(2).max(14).default(9)}),
	speech: z.string().default('Media/History/ataturk-10-yil-nutku-1933.ogg'),
	source: plainText(48),
	clips: z.array(ClipSchema).min(1).max(4),
	/** Seconds of quiet between two cuts of the speech. */
	gapSeconds: z.number().min(0).max(2).default(0.6),
	montage: z.array(ShotSchema).min(1).max(4),
	closing: z.object({line: plainText(40), seconds: z.number().min(3).max(8).default(5)}),
});
type Content = z.infer<typeof AtaturkMemorialSchema>;
type Shot = z.infer<typeof ShotSchema>;

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.72)';

/** Film grain: a fine noise that shifts every frame. */
const Grain: React.FC = () => {
	const shift = Math.floor(useSeconds() * 24) % 9;
	return <AbsoluteFill style={{opacity: 0.1, backgroundImage: 'repeating-radial-gradient(circle at 23% 41%, rgba(255,255,255,0.9) 0 1px, transparent 1px 3px)', backgroundPosition: `${shift * 11}px ${shift * 5}px`, mixBlendMode: 'overlay'}} />;
};

/** Period film one shot after another, slowed down, black and white, a slow push in, a dark vignette. */
const Footage: React.FC<{shots: readonly Shot[]; dim?: number}> = ({shots, dim = 0.15}) => {
	const {fps} = useVideoConfig();
	const t = useSeconds();
	let start = 0;
	return (
		<AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
			{shots.map((shot, index) => {
				const from = Math.round(start * fps);
				const length = shot.seconds;
				start += length;
				const local = Math.max(0, t - from / fps);
				return (
					<Sequence key={index} from={from} durationInFrames={Math.round(length * fps)}>
						<OffthreadVideo muted src={staticFile(shot.src)} trimBefore={Math.round(shot.from * fps)} playbackRate={shot.rate} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.06 * Math.min(1, local / length)})`, filter: `grayscale(1) contrast(1.12) brightness(${0.9 - dim})`}} />
					</Sequence>
				);
			})}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.8) 100%)'}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.85) 82%, #000 100%)'}} />
			<Grain />
		</AbsoluteFill>
	);
};

/** The one clock: white on black, ticking until it stops at the given time. */
const ClockScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const [hours, minutes] = content.clock.time;
	// The second hand makes its last tick to the full minute at 1 s and stays there: time stopped at 09.05.
	const stopAt = 1;
	const second = t < stopAt ? 354 : 0;
	const minuteAngle = minutes * 6;
	const hourAngle = (hours % 12) * 30 + minutes * 0.5;
	const r = 300;
	const size = 700;
	const line = interpolate(t, [stopAt + 0.3, stopAt + 1.1], [0, 1], CLAMP);
	const hand = (angle: number, length: number, width: number, color = WHITE) => (
		<line x1={size / 2} y1={size / 2} x2={size / 2 + Math.sin((angle * Math.PI) / 180) * length} y2={size / 2 - Math.cos((angle * Math.PI) / 180) * length} stroke={color} strokeWidth={width} strokeLinecap="round" />
	);
	return (
		<AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
			<svg width={u(size)} height={u(size)} viewBox={`0 0 ${size} ${size}`} style={{opacity: interpolate(t, [0, 0.3], [0, 1], CLAMP)}}>
				<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={WHITE} strokeWidth={6} opacity={0.9} />
				{Array.from({length: 12}, (_, index) => {
					const a = (index / 12) * Math.PI * 2;
					return <line key={index} x1={size / 2 + Math.sin(a) * (r - 40)} y1={size / 2 - Math.cos(a) * (r - 40)} x2={size / 2 + Math.sin(a) * (r - 12)} y2={size / 2 - Math.cos(a) * (r - 12)} stroke={WHITE} strokeWidth={8} strokeLinecap="round" />;
				})}
				{hand(hourAngle, r * 0.5, 14)}
				{hand(minuteAngle, r * 0.78, 9)}
				{hand(second, r * 0.86, 3, SOFT)}
				<circle cx={size / 2} cy={size / 2} r={14} fill={WHITE} />
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: '22%', opacity: line, transform: `translateY(${(1 - line) * u(20)}px)`}}>
				<Text variant="display" size={72} weight={TYPE.weights.display} color={WHITE} align="center">
					{content.clock.line}
				</Text>
			</div>
		</AbsoluteFill>
	);
};

const DateScene: React.FC<{content: Content}> = ({content}) => {
	const t = useSeconds();
	const show = interpolate(t, [0.8, 2], [0, 1], CLAMP);
	return (
		<AbsoluteFill>
			<Footage shots={content.date.footage} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '24%'}}>
				<div style={{opacity: show}}>
					<Text variant="display" size={96} weight={TYPE.weights.display} color={WHITE} align="center" style={{letterSpacing: '0.02em'}}>
						{content.date.text}
					</Text>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** One cut of the speech: his voice, the film, and each word as it is said. */
const ClipScene: React.FC<{content: Content; index: number}> = ({content, index}) => {
	const {u} = useVideoLayout();
	const {fps} = useVideoConfig();
	const t = useSeconds();
	const clip = content.clips[index];
	return (
		<AbsoluteFill>
			<Footage shots={clip.footage} dim={0.25} />
			<Audio src={staticFile(content.speech)} trimBefore={Math.round(clip.from * fps)} trimAfter={Math.round(clip.to * fps)} />
			<AbsoluteFill style={{padding: `${u(160)}px ${u(80)}px ${u(300)}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: u(24)}}>
				<div style={{opacity: interpolate(t, [0.1, 0.6], [0, 1], CLAMP)}}>
					<Text size={30} weight={TYPE.weights.strong} color={SOFT} style={{letterSpacing: '0.06em'}}>
						{content.source}
					</Text>
				</div>
				<div style={{display: 'flex', flexWrap: 'wrap', columnGap: u(22), rowGap: u(6)}}>
					{clip.words.map((word, position) => {
						const p = ease(interpolate(t, [word.at - 0.05, word.at + 0.35], [0, 1], CLAMP));
						return (
							<span key={position} style={{opacity: p, transform: `translateY(${(1 - p) * u(14)}px)`, filter: p < 1 ? `blur(${u((1 - p) * 4)}px)` : undefined}}>
								<Text variant="display" size={76} weight={TYPE.weights.display} color={WHITE} style={{lineHeight: 1.12, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
									{word.text}
								</Text>
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const MontageScene: React.FC<{content: Content}> = ({content}) => <Footage shots={content.montage} dim={0.05} />;

const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const t = useSeconds();
	const line = interpolate(t, [0.6, 1.8], [0, 1], CLAMP);
	const logo = interpolate(t, [2, 2.8], [0, 1], CLAMP);
	return (
		<AbsoluteFill style={{background: BLACK, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{opacity: line}}>
				<Text variant="display" size={84} weight={TYPE.weights.display} color={WHITE} align="center">
					{content.closing.line}
				</Text>
			</div>
			<div style={{position: 'absolute', right: u(70), bottom: u(260), opacity: logo * 0.85}}>
				<BrandMark size="chrome" color={WHITE} />
			</div>
		</AbsoluteFill>
	);
};

/** The siren over the clock and the date, rising after the clock stops and fading before the speech. */
const Siren: React.FC<{content: Content}> = ({content}) => {
	const {fps} = useVideoConfig();
	const length = content.siren.seconds;
	return (
		<Sequence name="Siren" durationInFrames={Math.round(length * fps)} from={Math.round(1.1 * fps)}>
			<Audio src={staticFile(content.siren.src)} volume={(frame) => interpolate(frame, [0, 1.2 * fps, (length - 2) * fps, length * fps], [0, 0.55, 0.55, 0], CLAMP)} />
		</Sequence>
	);
};

const renderOverlay = (content: Content): React.ReactNode => <Siren content={content} />;

const SAMPLE: z.input<typeof AtaturkMemorialSchema> = {
	clock: {time: [9, 5], line: 'Saat 09.05. Zaman durdu.'},
	date: {text: '10 Kasım 1938', footage: [{src: 'Media/History/Film1933/ataturk-portre.mp4', seconds: 3.6, rate: 0.5}, {src: 'Media/History/Film1933/kalabalik.mp4', seconds: 3.4, rate: 0.5}]},
	siren: {src: 'Media/Sounds/saygi-durusu-siren.wav'},
	source: 'Onuncu Yıl Nutku · 29 Ekim 1933',
	clips: [
		{from: 195.7, to: 202, words: [{text: 'Türk', at: 0.24}, {text: 'milleti', at: 0.6}, {text: 'çalışkandır.', at: 1.74}, {text: 'Türk', at: 3.7}, {text: 'milleti', at: 4.06}, {text: 'zekidir.', at: 5.16}], footage: [{src: 'Media/History/Film1933/ataturk-konusma.mp4', seconds: 6.3, rate: 0.6}]},
	],
	montage: [{src: 'Media/History/Film1933/gencler.mp4', seconds: 4, rate: 0.6}],
	closing: {line: 'Saygı, sevgi ve özlemle.'},
};

const buildScenes = (content: Content): TemplateScene[] => [
	{id: 'clock', seconds: content.clock.seconds, label: 'Saat', silent: true, element: <ClockScene content={content} />},
	{id: 'date', seconds: content.date.footage.reduce((sum, shot) => sum + shot.seconds, 0), label: 'Tarih', silent: true, element: <DateScene content={content} />},
	...content.clips.map((clip, index) => ({id: `speech-${index + 1}`, seconds: clip.to - clip.from + content.gapSeconds, label: `Nutuk ${index + 1}`, silent: true, element: <ClipScene content={content} index={index} />})),
	{id: 'montage', seconds: content.montage.reduce((sum, shot) => sum + shot.seconds, 0), label: 'Gençler', silent: true, element: <MontageScene content={content} />},
	{id: 'closing', seconds: content.closing.seconds, label: 'Saygıyla', silent: true, element: <ClosingScene content={content} />},
];

export const AtaturkMemorial = defineTemplate({
	id: 'AtaturkMemorial',
	category: 'Advertisements',
	title: '10 Kasım anma',
	description: 'Reklamsız anma: saat 09.05’te durur, uzaktan siren; ağır çekim siyah-beyaz 1933 filmi, Atatürk’ün kendi sesinden Onuncu Yıl Nutku kesitleri (kelimeler söylendikçe), gençler ve bayraklar, “Saygı, sevgi ve özlemle.” Yalnız küçük logo.',
	contentSchema: AtaturkMemorialSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 20, max: 60},
	cutsOnBeat: false,
	renderOverlay,
	buildScenes,
});
