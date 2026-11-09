import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, useSeconds} from '../PromoKit/PromoKit';
import {Morph, type Shape} from '../PromoKit/PromoMotion';

/**
 * 24 Kasım, Öğretmenler Günü (Kasım 2026). A thank-you, not an advert: no
 * product, no call to the app, no brand name; only a small logo at the end
 * (special-day rule). Chalk writes on a blackboard; public-domain archive of
 * Atatürk, warm and slow, with "24 Kasım 1928 · Başöğretmen"; his words to
 * teachers in chalk; the board travels through time from chalk to today's
 * classroom screen (drawn, no photographs); and the question "who taught you
 * your first letter?". Warm and hopeful, unlike 10 Kasım and 29 Ekim.
 * With `archive.speech` his own voice (a cut of a public-domain recording) follows the narration over the archive,
 * each word appearing as he says it (owner, 9 Nov 2026: the quiet pictures after the narration were too empty).
 */

const narration = z.string().trim().min(1).max(200);
/**
 * An archive picture or film: `caption` names the place and day in small letters, `focus` is where a landscape
 * picture is cut for the phone (CSS object-position).
 */
const ShotSchema = z.object({src: z.string().min(1), kind: z.enum(['image', 'video']), seconds: z.number().min(1).max(8), rate: z.number().min(0.25).max(1).default(0.6), caption: plainText(40).optional(), focus: z.string().max(20).optional()});

/** A cut of his recorded voice: `from`/`to` in seconds into the recording, each word with the second (from the cut's start) it is said at. */
const SpeechSchema = z.object({
	src: z.string().default('Media/History/ataturk-10-yil-nutku-1933.ogg'),
	source: plainText(48),
	from: z.number().min(0),
	to: z.number().positive(),
	words: z.array(z.object({text: plainText(24), at: z.number().min(0)})).min(1).max(30),
});

/** Quiet after the narration before his voice comes in, and after his last word. */
const SPEECH_LEAD = 0.6;
const SPEECH_TAIL = 0.8;

const BasogretmenSchema = z.object({
	/** The opening lines, written in chalk one after another. */
	chalk: z.object({lines: z.array(plainText(22)).min(2).max(3)}),
	archive: z.object({date: plainText(20), title: plainText(20), credit: plainText(40), shots: z.array(ShotSchema).min(1).max(7), dateNarration: narration, narration, speech: SpeechSchema.optional()}),
	/** His words to teachers, in chalk; over `photo` (an archive picture, darkened) instead of the slate when given. */
	quote: z.object({opening: plainText(16), words: plainText(48), author: plainText(28), seconds: z.number().min(5).max(10).default(8), photo: ShotSchema.optional()}),
	/** From his day to ours: the drawn classroom, or with `film` an archive film of the young under the counting years. */
	time: z.object({from: z.number().int(), to: z.number().int(), letters: plainText(20), narration, film: ShotSchema.optional()}),
	thanks: z.object({question: plainText(30), ask: plainText(44), line: plainText(44), narration}),
	script: VoiceScriptSchema,
});
type Content = z.infer<typeof BasogretmenSchema>;

const BOARD = '#1F3229';
const CHALK = '#F4F3EC';
const CHALK_YELLOW = '#FDE68A';
const WHITE = '#FFFFFF';

/** The slate: green-black with the grey clouds of old erasing. */
const Board: React.FC = () => (
	<AbsoluteFill style={{background: BOARD}}>
		<AbsoluteFill style={{background: 'radial-gradient(40% 18% at 30% 25%, rgba(255,255,255,0.07), transparent 70%), radial-gradient(35% 15% at 70% 62%, rgba(255,255,255,0.06), transparent 70%), radial-gradient(50% 20% at 45% 85%, rgba(255,255,255,0.05), transparent 70%)'}} />
		<AbsoluteFill style={{opacity: 0.18, backgroundImage: 'repeating-radial-gradient(circle at 17% 31%, rgba(255,255,255,0.35) 0 1px, transparent 1px 4px)'}} />
		<AbsoluteFill style={{boxShadow: 'inset 0 0 240px rgba(0,0,0,0.65)'}} />
	</AbsoluteFill>
);

/** Text written in chalk: letters appear one after another from `at`, a little rough at the edge. */
const Chalk: React.FC<{text: string; at: number; perSecond?: number; size: number; color?: string; weight?: number}> = ({text, at, perSecond = 16, size, color = CHALK, weight = TYPE.weights.display}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const shown = Math.max(0, Math.min(text.length, Math.floor((seconds - at) * perSecond)));
	return (
		<Text variant="display" size={size} weight={weight} color={color} align="center" style={{lineHeight: 1.18, textShadow: `0 0 ${u(3)}px rgba(255,255,255,0.55), ${u(1)}px ${u(1)}px 0 rgba(255,255,255,0.15)`, opacity: 0.94}}>
			{text.slice(0, shown)}
			<span style={{opacity: 0}}>{text.slice(shown)}</span>
		</Text>
	);
};

/** How long a line takes to write in chalk. */
const writing = (text: string, perSecond = 16) => text.length / perSecond;

const ChalkScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const lines = content.chalk.lines;
	const at = (index: number) => 0.15 + lines.slice(0, index).reduce((sum, line) => sum + writing(line) + 0.25, 0);
	return (
		<PromoStage ground={<Board />}>
			<At y={430} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(30)}}>
					{lines.map((line, index) => (
						<Chalk key={line} text={line} at={at(index)} size={104} />
					))}
				</div>
			</At>
			{lines.map((line, index) => <SoundEffect key={line} id="chalk" atSeconds={at(index)} seconds={writing(line)} volume={0.9} />)}
		</PromoStage>
	);
};

/** How an archive picture is shown: sepia, cut for the phone at its `focus`, pushed in slowly as `progress` runs 0→1. */
const archiveLook = (shot: z.infer<typeof ShotSchema>, progress: number): React.CSSProperties => ({
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	objectPosition: shot.focus ?? 'center',
	transform: `scale(${1.04 + 0.08 * Math.min(1, progress)})`,
	filter: 'grayscale(1) sepia(0.45) contrast(1.05) brightness(0.95)',
});

/** Archive pictures one after another, warm and slow, a gentle push in, with the date over them. */
const ArchiveScene: React.FC<{content: Content; seconds: number; speechAt?: number}> = ({content, seconds: total, speechAt}) => {
	const {u} = useVideoLayout();
	const {fps} = useVideoConfig();
	const seconds = useSeconds();
	const speech = content.archive.speech;
	// The date and title make room for his words just before he speaks.
	const leave = speech && speechAt !== undefined ? interpolate(seconds, [speechAt - 0.6, speechAt], [1, 0], CLAMP) : 1;
	const title = ease(interpolate(seconds, [0.6, 1.4], [0, 1], CLAMP)) * leave;
	let start = 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{content.archive.shots.map((shot, index) => {
				const from = start;
				// The last picture stays until the voice is done.
				const length = index === content.archive.shots.length - 1 ? Math.max(shot.seconds, total - from) : shot.seconds;
				start += length;
				const local = Math.max(0, seconds - from);
				const look = archiveLook(shot, local / length);
				const caption = ease(interpolate(local, [0.5, 1.2], [0, 1], CLAMP));
				return (
					<Sequence key={index} from={Math.round(from * fps)} durationInFrames={Math.round(length * fps)}>
						{shot.kind === 'image' ? <Img src={staticFile(shot.src)} style={look} /> : <OffthreadVideo muted src={staticFile(shot.src)} playbackRate={shot.rate} style={look} />}
						{shot.caption ? (
							<div style={{position: 'absolute', left: u(40), right: u(40), top: u(150), opacity: caption * 0.9}}>
								<Text size={30} weight={TYPE.weights.display} color={CHALK} align="center" style={{textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
									{shot.caption}
								</Text>
							</div>
						) : null}
					</Sequence>
				);
			})}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 40%, rgba(20,14,6,0.88) 82%, rgba(20,14,6,0.95) 100%)'}} />
			<PromoStage ground={null}>
				<At y={1080} w={952}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(10), opacity: title, transform: `translateY(${(1 - title) * u(24)}px)`}}>
						<Text variant="display" size={72} weight={TYPE.weights.kinetic} color={CHALK_YELLOW} align="center">
							{content.archive.date}
						</Text>
						<Text variant="display" size={96} weight={TYPE.weights.kinetic} color={WHITE} align="center">
							{content.archive.title}
						</Text>
					</div>
				</At>
				{/* The credit leaves with the title: his words take the lower part of the screen. */}
				<At x={40} y={1300} w={872}>
					<Text size={22} weight={TYPE.weights.strong} color={`rgba(255,255,255,${(0.6 * leave).toFixed(3)})`}>
						{content.archive.credit}
					</Text>
				</At>
				{speech && speechAt !== undefined ? <SpeechWords speech={speech} at={speechAt} /> : null}
			</PromoStage>
			{speech && speechAt !== undefined ? (
				<Sequence from={Math.round(speechAt * fps)} durationInFrames={Math.round((speech.to - speech.from + SPEECH_TAIL) * fps)}>
					<Audio src={staticFile(speech.src)} trimBefore={Math.round(speech.from * fps)} trimAfter={Math.round(speech.to * fps)} volume={1} />
				</Sequence>
			) : null}
		</AbsoluteFill>
	);
};

/** His words over the archive, each one appearing as he says it, with where the voice comes from above them. */
const SpeechWords: React.FC<{speech: z.infer<typeof SpeechSchema>; at: number}> = ({speech, at}) => {
	const {u} = useVideoLayout();
	const t = useSeconds() - at;
	const source = ease(interpolate(t, [-0.2, 0.4], [0, 1], CLAMP));
	return (
		<At x={40} y={760} w={872}>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(22)}}>
				<div style={{opacity: source * 0.85}}>
					<Text size={28} weight={TYPE.weights.strong} color={CHALK_YELLOW} style={{letterSpacing: '0.05em'}}>
						{speech.source}
					</Text>
				</div>
				<div style={{display: 'flex', flexWrap: 'wrap', columnGap: u(18), rowGap: u(4)}}>
					{speech.words.map((word, position) => {
						const p = ease(interpolate(t, [word.at - 0.05, word.at + 0.35], [0, 1], CLAMP));
						return (
							<span key={position} style={{opacity: p, transform: `translateY(${(1 - p) * u(14)}px)`, filter: p < 1 ? `blur(${u((1 - p) * 4)}px)` : undefined}}>
								<Text variant="display" size={66} weight={TYPE.weights.display} color={WHITE} style={{lineHeight: 1.14, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
									{word.text}
								</Text>
							</span>
						);
					})}
				</div>
			</div>
		</At>
	);
};

const QuoteScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const quote = content.quote;
	const wordsAt = 0.3 + writing(quote.opening, 12) + 0.35;
	const authorAt = wordsAt + writing(quote.words, 18) + 0.5;
	const seconds = useSeconds();
	const ground = quote.photo ? (
		<AbsoluteFill style={{background: '#000'}}>
			{quote.photo.kind === 'image' ? <Img src={staticFile(quote.photo.src)} style={archiveLook(quote.photo, seconds / quote.seconds)} /> : <OffthreadVideo muted src={staticFile(quote.photo.src)} playbackRate={quote.photo.rate} style={archiveLook(quote.photo, seconds / quote.seconds)} />}
			<AbsoluteFill style={{background: 'rgba(12,9,4,0.62)'}} />
		</AbsoluteFill>
	) : (
		<Board />
	);
	return (
		<PromoStage ground={ground}>
			<At y={480} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(40), padding: `0 ${u(30)}px`}}>
					<Chalk text={quote.opening} at={0.3} perSecond={12} size={120} weight={TYPE.weights.kinetic} />
					<Chalk text={quote.words} at={wordsAt} perSecond={18} size={84} />
					<Chalk text={quote.author} at={authorAt} perSecond={20} size={46} color={CHALK_YELLOW} />
				</div>
			</At>
			<SoundEffect id="chalk" atSeconds={0.3} seconds={writing(quote.opening, 12)} />
			<SoundEffect id="chalk" atSeconds={wordsAt} seconds={writing(quote.words, 18)} />
			<SoundEffect id="chalk" atSeconds={authorAt} seconds={writing(quote.author, 20)} volume={0.7} />
		</PromoStage>
	);
};

/** The board through time: the slate becomes a white board, then a classroom screen; the first letters stay. */
const BOARD_SHAPE: Shape = {x: -100, y: -200, w: 1152, h: 1930, radius: 0, fill: BOARD};
const CLASS_BOARD = (fill: string): Shape => ({x: 76, y: 380, w: 800, h: 500, radius: 24, fill});

const TimeScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const third = total / 3;
	const year = Math.round(interpolate(seconds, [0.6, total - 0.6], [content.time.from, content.time.to], CLAMP));
	const desks = ease(interpolate(seconds, [0.5, 1.2], [0, 1], CLAMP));
	const stage = seconds < third ? 0 : seconds < 2 * third ? 1 : 2;
	const ink = [CHALK, '#1E3A8A', '#38BDF8'][stage];
	const film = content.time.film;
	if (film) {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				{film.kind === 'image' ? <Img src={staticFile(film.src)} style={archiveLook(film, seconds / total)} /> : <OffthreadVideo muted src={staticFile(film.src)} playbackRate={film.rate} style={archiveLook(film, seconds / total)} />}
				<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,9,4,0.75) 0%, transparent 35%, transparent 70%, rgba(12,9,4,0.8) 100%)'}} />
				<PromoStage ground={null}>
					<At y={170} w={952}>
						<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{fontVariantNumeric: 'tabular-nums lining-nums', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
							{String(year)}
						</Text>
					</At>
				</PromoStage>
			</AbsoluteFill>
		);
	}
	return (
		<PromoStage ground={<AbsoluteFill style={{background: '#0B1C30'}} />}>
			{/* The classroom: a navy wall (no brown), the rows of desks drawn simply. */}
			<div style={{position: 'absolute', left: u(-100), top: u(-200), width: u(1152), height: u(1930), background: 'radial-gradient(70% 50% at 50% 35%, #1E3A5F 0%, #0B1C30 70%)', opacity: desks}} />
			{/* Three rows of school desks, the back row smaller: a top, a front panel, two legs. */}
			{[0, 1, 2].map((row) => {
				const scale = 0.72 + row * 0.14;
				const width = 230 * scale;
				const gap = 40 * scale;
				const total = width * 3 + gap * 2;
				return (
					<div key={row} style={{position: 'absolute', left: u(476 - total / 2), top: u(990 + row * (110 + row * 24)), display: 'flex', gap: u(gap), opacity: desks, transform: `translateY(${(1 - desks) * u(80)}px)`}}>
						{[0, 1, 2].map((desk) => (
							<div key={desk} style={{position: 'relative', width: u(width), height: u(110 * scale)}}>
								<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: u(22 * scale), borderRadius: u(6), background: '#CBD5E1'}} />
								<div style={{position: 'absolute', left: u(10 * scale), right: u(10 * scale), top: u(22 * scale), height: u(46 * scale), background: '#64748B'}} />
								<div style={{position: 'absolute', left: u(18 * scale), top: u(68 * scale), width: u(10 * scale), height: u(42 * scale), background: '#334155'}} />
								<div style={{position: 'absolute', right: u(18 * scale), top: u(68 * scale), width: u(10 * scale), height: u(42 * scale), background: '#334155'}} />
							</div>
						))}
					</div>
				);
			})}
			<Morph
				keys={[
					{at: 0, to: BOARD_SHAPE},
					{at: 0.3, to: CLASS_BOARD(BOARD)},
					{at: third, to: CLASS_BOARD('#F8FAFC')},
					{at: 2 * third, to: CLASS_BOARD('#0F172A')},
				]}
				shadow="0 30px 60px -20px rgba(0,0,0,0.6)"
				render={() => (
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Text variant="display" size={130} weight={TYPE.weights.kinetic} color={ink} style={{letterSpacing: '0.08em'}}>
							{content.time.letters}
						</Text>
					</div>
				)}
			/>
			<At y={170} w={952}>
				<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={stage === 0 ? CHALK : WHITE} align="center" style={{fontVariantNumeric: 'tabular-nums lining-nums', lineHeight: 1}}>
					{String(year)}
				</Text>
			</At>
		</PromoStage>
	);
};

const ThanksScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const askAt = 0.3 + writing(content.thanks.question, 16) + 0.5;
	const line = ease(interpolate(seconds, [askAt + writing(content.thanks.ask, 18) + 0.8, askAt + writing(content.thanks.ask, 18) + 1.6], [0, 1], CLAMP));
	const logo = interpolate(seconds, [askAt + 3, askAt + 3.8], [0, 1], CLAMP);
	return (
		<PromoStage ground={<Board />}>
			<At y={420} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(50), padding: `0 ${u(30)}px`}}>
					<Chalk text={content.thanks.question} at={0.3} size={100} weight={TYPE.weights.kinetic} />
					<Chalk text={content.thanks.ask} at={askAt} perSecond={18} size={56} color={CHALK_YELLOW} />
				</div>
			</At>
			<At y={1120} w={952}>
				<div style={{opacity: line, padding: `0 ${u(40)}px`}}>
					<Text size={46} weight={TYPE.weights.display} color={CHALK} align="center" style={{lineHeight: 1.3}}>
						{content.thanks.line}
					</Text>
				</div>
			</At>
			<div style={{position: 'absolute', right: u(40), bottom: u(60), opacity: logo * 0.85}}>
				<BrandMark size="chrome" color={WHITE} />
			</div>
			<SoundEffect id="chalk" atSeconds={0.3} seconds={writing(content.thanks.question, 16)} />
			<SoundEffect id="chalk" atSeconds={askAt} seconds={writing(content.thanks.ask, 18)} volume={0.7} />
		</PromoStage>
	);
};

const SAMPLE: z.input<typeof BasogretmenSchema> = {
	chalk: {lines: ['Bir tebeşir,', 'bir kara tahta,', 'bir millet.']},
	archive: {
		date: '24 Kasım 1928',
		title: 'Başöğretmen',
		credit: 'Arşiv görüntüleri · kamu malı',
		shots: [
			{src: 'Media/History/ataturk-portre.png', kind: 'image', seconds: 4.5},
			{src: 'Media/History/Film1933/ataturk-yakin.mp4', kind: 'video', seconds: 4.5, rate: 0.6},
		],
		dateNarration: 'Yirmi dört Kasım bin dokuz yüz yirmi sekiz.',
		narration: 'Atatürk, Başöğretmen oldu; bir milleti kara tahtanın başında okumaya çağırdı.',
	},
	quote: {opening: 'Öğretmenler!', words: 'Yeni nesil sizin eseriniz olacaktır.', author: 'Mustafa Kemal Atatürk'},
	time: {from: 1928, to: 2026, letters: 'A a B b C c', narration: 'Bugün o tahtanın başında senin öğretmenlerin var.'},
	thanks: {question: 'Sana ilk harfi kim öğretti?', ask: 'Öğretmenini etiketle, ona teşekkür et.', line: 'Bütün öğretmenlerimize teşekkür ederiz.', narration: 'Sana ilk harfi kim öğrettiyse, bugün ona teşekkür et. Öğretmenler Günü kutlu olsun.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips, content.script);
	const chalkSeconds = 0.15 + content.chalk.lines.reduce((sum, line) => sum + writing(line) + 0.25, 0) + 1.2;
	const date = say('date', content.archive.dateNarration, 3, 2.5);
	// The pictures fill the time of the two lines; the second line holds on long enough for them.
	const shots = content.archive.shots.reduce((sum, shot) => sum + shot.seconds, 0);
	const speech = content.archive.speech;
	// With his voice after the narration, the narration keeps its own length and his words fill the rest of the pictures.
	const call = speech ? say('call', content.archive.narration, 6, 4) : say('call', content.archive.narration, Math.max(5, shots - date.seconds), Math.max(4, shots - date.seconds));
	const speechAt = speech ? date.seconds + call.seconds + SPEECH_LEAD : undefined;
	const archiveSeconds = speech && speechAt !== undefined ? Math.round(Math.max(shots, speechAt + speech.to - speech.from + SPEECH_TAIL) * 10) / 10 : date.seconds + call.seconds;
	const time = say('time', content.time.narration, 6, 6);
	const thanks = say('thanks', content.thanks.narration, 8, 8.5);
	// Atatürk first (owner, 1 Nov 2026: "video Atatürk ile başlamalı, tüyler ürpertmeli"): his portrait and the date, his
	// words to teachers, and only then the chalk lines.
	return [
		{id: 'archive', seconds: archiveSeconds, label: 'Arşiv', voice: [date, call], element: <ArchiveScene content={content} seconds={archiveSeconds} speechAt={speechAt} />},
		{id: 'quote', seconds: content.quote.seconds, label: 'Söz', silent: true, element: <QuoteScene content={content} />},
		{id: 'chalk', seconds: chalkSeconds, label: 'Tebeşir', silent: true, element: <ChalkScene content={content} />},
		{id: 'time', seconds: time.seconds, label: 'Zaman', voice: [time], element: <TimeScene content={content} seconds={time.seconds} />},
		{id: 'thanks', seconds: thanks.seconds, label: 'Teşekkür', voice: [thanks], element: <ThanksScene content={content} />},
	];
};

export const Basogretmen = defineTemplate({
	id: 'Basogretmen',
	category: 'Advertisements',
	title: '24 Kasım: Başöğretmen',
	description: 'Reklamsız Öğretmenler Günü: Atatürk’ün kamu malı arşiviyle açılır, “24 Kasım 1928 · Başöğretmen”; öğretmenlere sözü tebeşirle; “Bir tebeşir, bir kara tahta, bir millet.”; tahta 1928’den bugünün sınıf ekranına (çizim); “Sana ilk harfi kim öğretti?” Yalnız küçük logo.',
	contentSchema: BasogretmenSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	// Scenes melt into each other (owner, 1 Nov 2026: "çok daha duygusal, ağlamaklı").
	transition: {preset: 'fade', durationSeconds: 0.8},
	targetSeconds: {min: 25, max: 50},
	cutsOnBeat: false,
	buildScenes,
});
