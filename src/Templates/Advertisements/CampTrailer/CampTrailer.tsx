import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VOICE_LEAD_SECONDS, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, TypeOn, useLand, useSeconds} from '../PromoKit/PromoKit';
import {Tap} from '../PromoKit/PromoMotion';

/**
 * The camp's film trailer (Kasım 2026, 27 Kasım). Black title cards and big
 * words; between them fast cuts from the camp's own rendered lessons (the
 * SinoAI welcome with its voice orb, chapter openings, "guess first"
 * questions, animated shapes, worked answers), letterboxed like cinema, the
 * words of the voice in the black bars. It ends on our channel's playlist:
 * the search types the name, a tap subscribes.
 */

const narration = z.string().trim().min(1).max(170);
/** A shot from a rendered camp lesson (16:9, under public/Media). */
const ShotSchema = z.object({src: z.string().min(1), label: plainText(30)});

const CampTrailerSchema = z.object({
	title: z.object({lines: z.tuple([plainText(24), plainText(14)]), narration}),
	/** The voice's words that flash in the bars, one per shot, and the shots under them. */
	montage: z.object({words: z.array(plainText(16)).min(2).max(4), shots: z.array(ShotSchema).min(2).max(4), narration}),
	teach: z.object({words: z.array(plainText(20)).min(2).max(3), shots: z.array(ShotSchema).min(2).max(4), narration}),
	channel: z.object({
		search: plainText(16),
		name: plainText(16),
		playlist: plainText(24),
		meta: plainText(30),
		videos: z.array(z.object({title: plainText(28), length: plainText(6), thumbnail: z.string().min(1)})).min(3).max(5),
		subscribe: plainText(14),
		subscribed: plainText(16),
		narration,
	}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof CampTrailerSchema>;
type Shot = z.infer<typeof ShotSchema>;

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const ORANGE = '#EA580C';
const DARK = '#0F0F12';

/** The letterboxed picture: full canvas width, 16:9. */
const FRAME = {x: 0, y: 500, w: 952, h: 535};

const Letterbox: React.FC<{shot: Shot; length: number; word?: string; wordAt?: number}> = ({shot, length, word, wordAt = 0}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const push = 1.02 + 0.05 * Math.min(1, seconds / length);
	const land = ease(Math.max(0, Math.min(1, (seconds - wordAt) / 0.14)));
	return (
		<>
			<div style={{position: 'absolute', left: u(FRAME.x - 40), top: u(FRAME.y), width: u(FRAME.w + 80), height: u(FRAME.h), overflow: 'hidden', background: BLACK}}>
				<OffthreadVideo muted src={staticFile(shot.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`}} />
			</div>
			<At x={40} y={FRAME.y + FRAME.h + 24} w={872}>
				<Text size={28} weight={TYPE.weights.display} color="rgba(255,255,255,0.6)">
					{shot.label}
				</Text>
			</At>
			{word && seconds >= wordAt ? (
				<At y={250} w={952}>
					<div style={{transform: `scale(${interpolate(land, [0, 1], [1.25, 1])})`, opacity: land, filter: land < 1 ? `blur(${u((1 - land) * 8)}px)` : undefined}}>
						<Text variant="display" size={110} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{letterSpacing: '-0.02em'}}>
							{word}
						</Text>
					</div>
				</At>
			) : null}
		</>
	);
};

/**
 * Shots cut on the spoken words: each word starts its own shot when it is
 * heard (from the narration's word timings; evenly spread without them).
 */
const Montage: React.FC<{words: string[]; shots: Shot[]; cues: number[]; total: number}> = ({words, shots, cues, total}) => {
	const {fps} = useVideoConfig();
	const count = Math.max(words.length, shots.length);
	const starts = Array.from({length: count}, (_, index) => (index === 0 ? 0 : cues[index] ?? (index * total) / count));
	return (
		<>
			{starts.map((start, index) => {
				const end = starts[index + 1] ?? total;
				const shot = shots[index % shots.length];
				return (
					<Sequence key={index} from={Math.round(start * fps)} durationInFrames={Math.max(1, Math.round((end - start) * fps))}>
						<Letterbox shot={shot} length={end - start} word={words[index]} wordAt={index === 0 ? Math.max(0, (cues[0] ?? 0) - start) : 0} />
						{index > 0 ? <SoundEffect id="impact" atSeconds={0} volume={0.5} /> : null}
					</Sequence>
				);
			})}
		</>
	);
};

const Black: React.FC = () => <AbsoluteFill style={{background: BLACK}} />;

const TitleScene: React.FC<{content: Content}> = ({content}) => (
	<PromoStage ground={<Black />}>
		<At y={460} w={952}>
			<Slam text={content.title.lines[0]} at={0} size={TYPE.adScale.hook * 0.85} color={WHITE} />
		</At>
		<At y={740} w={952}>
			<Slam text={content.title.lines[1]} at={0.45} size={TYPE.adScale.hook} color={ORANGE} />
		</At>
	</PromoStage>
);

const MontageScene: React.FC<{words: string[]; shots: Shot[]; cues: number[]; seconds: number}> = (props) => (
	<PromoStage ground={<Black />}>
		<Montage {...props} total={props.seconds} />
	</PromoStage>
);

/** Our channel as a video app shows it: the search, the channel, the playlist and its lessons. */
const ChannelScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const channel = content.channel;
	const page = useLand(0.9, 170, 22);
	const tapAt = Math.min(total - 0.7, 2.4);
	const subscribed = seconds >= tapAt + 0.05;
	return (
		<PromoStage ground={<AbsoluteFill style={{background: DARK}} />}>
			<At x={40} y={60} w={872}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(16), height: u(96), padding: `0 ${u(30)}px`, borderRadius: u(48), background: '#1F1F24'}}>
					<Icon name="search" size={u(40)} color="#A1A1AA" stroke={2.4} />
					<TypeOn text={channel.search} at={0.1} charsPerSecond={14} size={42} color={WHITE} caret={ORANGE} />
				</div>
			</At>
			<div style={{position: 'absolute', inset: 0, opacity: page, transform: `translateY(${(1 - page) * u(60)}px)`}}>
				<At x={40} y={210} w={872}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(24)}}>
						<div style={{width: u(120), height: u(120), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Img src={staticFile('Brand/SinavikaIcon.svg')} style={{width: u(66), height: u(70)}} />
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: u(6), flex: 1}}>
							<Text variant="display" size={50} weight={TYPE.weights.kinetic} color={WHITE}>
								{channel.name}
							</Text>
							<Text size={30} weight={TYPE.weights.display} color="#A1A1AA">
								{channel.meta}
							</Text>
						</div>
						<div style={{display: 'flex', alignItems: 'center', gap: u(10), padding: `${u(20)}px ${u(30)}px`, borderRadius: u(999), background: subscribed ? '#27272A' : ORANGE}}>
							<Icon name={subscribed ? 'bell' : 'plus'} size={u(32)} color={WHITE} stroke={2.6} />
							<Text size={34} weight={TYPE.weights.kinetic} color={WHITE}>
								{subscribed ? channel.subscribed : channel.subscribe}
							</Text>
						</div>
					</div>
				</At>
				<At x={40} y={400} w={872}>
					<Text size={40} weight={TYPE.weights.kinetic} color={WHITE}>
						{channel.playlist}
					</Text>
				</At>
				{channel.videos.map((video, index) => {
					const show = ease(interpolate(seconds, [1.1 + index * 0.1, 1.4 + index * 0.1], [0, 1], CLAMP));
					return (
						<At key={video.title} x={40} y={480 + index * 190} w={872}>
							<div style={{display: 'flex', gap: u(24), alignItems: 'center', opacity: show, transform: `translateX(${(1 - show) * u(60)}px)`}}>
								<div style={{position: 'relative', width: u(300), height: u(169), borderRadius: u(16), overflow: 'hidden', flexShrink: 0}}>
									<Img src={staticFile(video.thumbnail)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
									<div style={{position: 'absolute', right: u(8), bottom: u(8), padding: `${u(2)}px ${u(8)}px`, borderRadius: u(6), background: 'rgba(0,0,0,0.8)'}}>
										<Text size={22} weight={TYPE.weights.display} color={WHITE}>
											{video.length}
										</Text>
									</div>
								</div>
								<Text size={36} weight={TYPE.weights.display} color={WHITE} style={{lineHeight: 1.25}}>
									{video.title}
								</Text>
							</div>
						</At>
					);
				})}
			</div>
			<SoundEffect id="transitionWhoosh" atSeconds={0.9} volume={0.6} />
			<Tap x={40 + 872 - 120} y={210 + 60} at={tapAt} color="rgba(255,255,255,0.55)" />
			<SoundEffect id="bell" atSeconds={tapAt + 0.1} volume={0.8} />
		</PromoStage>
	);
};

const SAMPLE: z.input<typeof CampTrailerSchema> = {
	title: {lines: ['TYT kampı YouTube’da.', 'Ücretsiz.'], narration: 'TYT kampı YouTube’da, ücretsiz.'},
	montage: {
		words: ['Konu konu.', 'Ders ders.', 'Soru soru.'],
		shots: [
			{src: 'Media/CampTrailer/tyt-turkce-kampi-2-bolum-acilisi-mecaz.mp4', label: 'Sözcükte Anlam · Bölüm 2'},
			{src: 'Media/CampTrailer/tyt-turkce-kampi-4-gercek-mecaz-karsilastirma.mp4', label: 'Gerçek ve mecaz anlam'},
			{src: 'Media/CampTrailer/tyt-turkce-kampi-6-tyt-tarzi-cozum.mp4', label: 'TYT tarzı soru, adım adım'},
		],
		narration: 'Konu konu, ders ders, soru soru.',
	},
	teach: {
		words: ['SinoAI anlatıyor,', 'sen öğreniyorsun.'],
		shots: [
			{src: 'Media/CampTrailer/tyt-turkce-kampi-1-sinoai-karsilama.mp4', label: 'SinoAI karşılıyor'},
			{src: 'Media/CampTrailer/tyt-turkce-kampi-3-once-tahmin-et.mp4', label: 'Önce tahmin et'},
		],
		narration: 'SinoAI anlatıyor, sen öğreniyorsun.',
	},
	channel: {
		search: 'Sınavika',
		name: 'Sınavika',
		playlist: 'TYT Kampı · Türkçe',
		meta: 'Ücretsiz kamp dersleri',
		videos: [
			{title: 'TYT kampı: tanıtım', length: '3:09', thumbnail: 'Media/CampTrailer/tyt-turkce-kampi-kapak-00.jpg'},
			{title: '1. Sözcükte Anlam', length: '21:37', thumbnail: 'Media/CampTrailer/tyt-turkce-kampi-kapak-01.jpg'},
			{title: '2. Söz Yorumu', length: '16:33', thumbnail: 'Media/CampTrailer/tyt-turkce-kampi-kapak-02.jpg'},
			{title: '3. Deyim ve Atasözü', length: '17:08', thumbnail: 'Media/CampTrailer/tyt-turkce-kampi-kapak-03.jpg'},
			{title: '4. Cümlede Anlam', length: '27:03', thumbnail: 'Media/CampTrailer/tyt-turkce-kampi-kapak-04.jpg'},
		],
		subscribe: 'Abone ol',
		subscribed: 'Abone olundu',
		narration: 'YouTube’da Sınavika’yı ara, kampa katıl.',
	},
};

/** When each listed word is heard in a line (scene seconds), from the narration's word timings. */
const cuesOf = (voiceClips: VoiceClips, id: string, words: string[]): number[] => {
	const heard = voiceClips[id]?.words ?? [];
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '');
	let from = 0;
	return words.map((word) => {
		const first = plain(word.split(/\s+/)[0]);
		const index = heard.findIndex((item, position) => position >= from && plain(item.text) === first);
		if (index < 0) return Number.NaN;
		from = index + 1;
		return VOICE_LEAD_SECONDS + heard[index].startSeconds - 0.05;
	});
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const title = say('title', content.title.narration, Math.max(beat(content.title.narration, 2.6), 2.6), 2.4);
	const montage = say('montage', content.montage.narration, Math.max(beat(content.montage.narration, 3), 3), 3);
	const teach = say('teach', content.teach.narration, Math.max(beat(content.teach.narration, 2.8), 2.8), 2.8);
	const channel = say('channel', content.channel.narration, Math.max(beat(content.channel.narration, 3.6), 3.6), 3.6);
	const montageCues = cuesOf(voiceClips, 'montage', content.montage.words).map((cue, index) => (Number.isNaN(cue) ? 0.3 + index * 0.8 : cue));
	const teachCues = cuesOf(voiceClips, 'teach', content.teach.words).map((cue, index) => (Number.isNaN(cue) ? 0.3 + index * 1.2 : cue));
	return [
		{id: 'title', seconds: title.seconds, label: 'Başlık', voice: [title], element: <TitleScene content={content} />},
		{id: 'montage', seconds: montage.seconds, label: 'Kesmeler', voice: [montage], element: <MontageScene words={content.montage.words} shots={content.montage.shots} cues={montageCues} seconds={montage.seconds} />},
		{id: 'teach', seconds: teach.seconds, label: 'SinoAI', voice: [teach], element: <MontageScene words={content.teach.words} shots={content.teach.shots} cues={teachCues} seconds={teach.seconds} />},
		{id: 'channel', seconds: channel.seconds, label: 'Kanal', voice: [channel], element: <ChannelScene content={content} seconds={channel.seconds} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const CampTrailer = defineTemplate({
	id: 'CampTrailer',
	category: 'Advertisements',
	title: 'TYT kampı fragmanı',
	description: 'Film fragmanı: siyah ara kartlar ve büyük başlıklar; kampın kendi render edilmiş derslerinden sinema oranında hızlı kesmeler (SinoAI karşılaması, bölüm açılışları, “Önce tahmin et?”, çözümler), sesin kelimeleri siyah bantlarda. Sonda kanalımızın oynatma listesi: arama adı yazar, dokunuş abone olur.',
	contentSchema: CampTrailerSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 10, max: 22},
	buildScenes,
});
