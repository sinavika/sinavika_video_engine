import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {StoreBadges} from '../../../Components/Brand/StoreBadge';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {STORY_STAGE, StoryStage} from '../../../Components/Story/StoryStage';
import {StoryCamera} from '../../../Components/Story/StoryCamera';
import {CompareBars, ExamSheet, landing, NetChart, StickyNote, TopicList} from '../../../Components/Story/StoryCard';
import {StoryCursor} from '../../../Components/Story/StoryCursor';
import {StoryDevice} from '../../../Components/Story/StoryDevice';
import {cardGround, StoryLookFieldSchema, StoryLookProvider, storyTone, type StoryLook} from '../../../Components/Story/StoryLook';
import {StoryGround} from '../../../Components/Story/StoryMaterial';
import {HOME_APPS, StoryPhone} from '../../../Components/Story/StoryPhone';
import {STUDENT_POSES, StoryStudent} from '../../../Components/Story/StoryStudent';
import {subBeats} from '../../../Components/Story/StoryTiming';
import {KeyPhrase, NumberPop} from '../../../Components/Story/StoryType';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {SINAVIKA_TR_TEMPO} from '../../../Configurations/SocialTempo';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, phraseCues, VoiceScriptSchema, type VoiceClip, type VoiceClips} from '../../../Scenes/Voiceover';
import {useTheme} from '../../../Themes/ThemeContext';
import {defineTemplate} from '../../TemplateDefinition';
import {CLAMP, ease, useLand, useSeconds} from '../PromoKit/PromoKit';

/**
 * A study-desk story for sinavika.tr (docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md), built on the story kit
 * (src/Components/Story, docs/Social/Hikaye-Kiti.md): a problem the student lives, told on paper cards, a drawn
 * student and real UI/UX screens, in the owner's approved pace (Configurations/SocialTempo, 15 Nov 2026). Each video
 * has its own look (`look`, StoryLook: ground, palette, ink, accent, cards), from a prompt-motion.com direction; the
 * default is warm grey, navy only when asked, and two videos in a row never share one (owner, 17 Nov 2026).
 *
 * Each scene is one narrated line and a few items placed on a 1080 × 1920 canvas. An item lands when the voice says
 * its `on` phrase (or at `at` seconds), so the picture changes on the words; on top of that the camera punches in on
 * every ≤1.2 s sub-beat of the line, so nothing rests. Long hooks are allowed, there are no subtitles (only key
 * phrases), and the reel closes on a 2 s plain card: the logo and the store badges, no call.
 */

const line = z.string().trim().min(1).max(90);
const place = {x: z.number().min(-200).max(1080), y: z.number().min(-200).max(1920)};
/** When an item lands: the phrase the voice says (`on`), else `at` seconds into the scene. */
const timing = {on: line.optional(), at: z.number().min(0).max(8).default(0)};
const screenId = z.string().regex(/^[mtkw]-[a-z0-9-]+$/);
const homeApp = z.enum(Object.keys(HOME_APPS) as [keyof typeof HOME_APPS, ...(keyof typeof HOME_APPS)[]]);
const pose = z.enum(Object.keys(STUDENT_POSES) as [keyof typeof STUDENT_POSES, ...(keyof typeof STUDENT_POSES)[]]);

const ItemSchema = z.discriminatedUnion('kind', [
	z.object({kind: z.literal('phrase'), text: line, keywords: z.array(line).default([]), size: z.number().min(40).max(160).default(92), width: z.number().min(300).max(1000).default(900), ...place, ...timing}),
	z.object({kind: z.literal('student'), poses: z.array(z.object({pose, ...timing})).min(1).max(4), size: z.number().min(200).max(700).default(440), ...place}),
	z.object({kind: z.literal('exam'), title: line, rows: z.array(z.object({number: z.number().int().min(1).max(200), choice: z.string().max(2), result: z.enum(['right', 'wrong', 'blank']), ...timing})).min(2).max(8), net: z.object({text: line, ...timing}).optional(), width: z.number().default(640), tilt: z.number().default(2), ...place, ...timing}),
	z.object({kind: z.literal('sticky'), text: line, width: z.number().default(420), tilt: z.number().default(-4), ...place, ...timing}),
	z.object({kind: z.literal('topics'), title: line, items: z.array(z.object({text: line, ok: z.boolean(), ...timing})).min(2).max(6), width: z.number().default(640), ...place, ...timing}),
	z.object({kind: z.literal('chart'), title: line, values: z.array(z.number()).min(2).max(8), labels: z.array(line).optional(), width: z.number().default(760), ...place, ...timing}),
	z.object({kind: z.literal('bars'), title: line, rows: z.array(z.object({label: line, value: z.number().min(0).max(1), text: line, tone: z.enum(['accent', 'muted']).default('accent'), ...timing})).min(2).max(3), width: z.number().default(760), ...place, ...timing}),
	z.object({kind: z.literal('number'), to: z.number(), from: z.number().default(0), suffix: z.string().max(12).default(''), size: z.number().default(170), ...place, ...timing}),
	/** A real UI/UX screen on its own device (m-… phone, t-… tablet, k-… watch); `screens` slides one device through several pages of the same kind. */
	z.object({kind: z.literal('device'), id: screenId, width: z.number().min(150).max(1000), rotate: z.number().default(0), transition: z.enum(['slide', 'morph']).default('slide'), screens: z.array(z.object({id: screenId, ...timing})).min(2).max(5).optional(), ...place, ...timing}),
	/** The phone's home screen (no real apps but Sınavika): the thumb's touches, and the app the last tap opens into `screens`. */
	z.object({kind: z.literal('home'), width: z.number().min(250).max(800), touches: z.array(z.object({app: homeApp, touch: z.enum(['hover', 'tap']), ...timing})).min(1).max(4), screens: z.array(z.object({id: screenId, ...timing})).max(4).default([]), wallpaper: z.enum(['dark', 'light']).default('dark'), rotate: z.number().default(0), ...place, ...timing}),
	/** A small label in the look's chip colours (what the screen shows). */
	z.object({kind: z.literal('chip'), text: line, ...place, ...timing}),
	/** A mouse pointer that glides from its place to each click (pixels from that place) and clicks on the voice. */
	z.object({kind: z.literal('cursor'), clicks: z.array(z.object({x: z.number().min(-1080).max(1080), y: z.number().min(-1920).max(1920), ...timing})).min(1).max(4), size: z.number().min(40).max(140).default(64), ...place}),
]);
type Item = z.infer<typeof ItemSchema>;

const MoveSchema = z.object({kind: z.enum(['punch', 'shake', 'flash', 'whipIn', 'whipOut']), ...timing});

const StudyDeskStorySchema = z.object({
	/** The video's look: a ready one by name (warmGrey, paper, boldColour, ink, navy) or one changed (`{preset, ...}`). */
	look: StoryLookFieldSchema,
	beats: z
		.array(
			z.object({
				id: z.string().regex(/^[a-z0-9-]+$/),
				narration: z.string().trim().min(1).max(220),
				minSeconds: z.number().min(1).max(8).default(1.2),
				/** Camera moves on top of the automatic punch on every sub-beat. */
				moves: z.array(MoveSchema).max(6).default([]),
				items: z.array(ItemSchema).min(1).max(8),
			}),
		)
		.min(4)
		.max(12),
	/** The silent closing card: logo and store badges, no call. */
	card: z.object({seconds: z.number().min(1).max(3).default(2), line: line.optional()}).default({seconds: 2}),
	/** `enabled: false` drops the closing card (holidays end on the logo alone). */
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
	script: VoiceScriptSchema,
});
type Content = z.infer<typeof StudyDeskStorySchema>;
type Beat = Content['beats'][number];

const CANVAS = STORY_STAGE;
const Place: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => <div style={{position: 'absolute', left: x, top: y}}>{children}</div>;

/** Resolves every `on` phrase of a scene to seconds, from the voice clip's word timings (or the estimate). */
const cueResolver = (beat: Beat, clip: VoiceClip | undefined, seconds: number) => {
	const phrases: string[] = [];
	const collect = (value: {on?: string}) => {
		if (value.on && !phrases.includes(value.on)) phrases.push(value.on);
	};
	beat.moves.forEach(collect);
	for (const item of beat.items) {
		if ('on' in item) collect(item);
		if (item.kind === 'student') item.poses.forEach(collect);
		if (item.kind === 'exam') {
			item.rows.forEach(collect);
			if (item.net) collect(item.net);
		}
		if (item.kind === 'topics') item.items.forEach(collect);
		if (item.kind === 'bars') item.rows.forEach(collect);
		if (item.kind === 'device') item.screens?.forEach(collect);
		if (item.kind === 'cursor') item.clicks.forEach(collect);
		if (item.kind === 'home') {
			item.touches.forEach(collect);
			item.screens.forEach(collect);
		}
	}
	const times = phraseCues(clip, beat.narration, phrases, phrases.map(() => 0), seconds, SINAVIKA_TR_TEMPO.lineGap.lead);
	const when = (value: {on?: string; at: number}): number => (value.on ? times[phrases.indexOf(value.on)] : value.at);
	return Object.assign(when, {all: () => times});
};

type When = ReturnType<typeof cueResolver>;

const ItemView: React.FC<{item: Item; when: When; look: StoryLook}> = ({item, when, look}) => {
	const seconds = useSeconds();
	const at = 'at' in item ? when(item) : 0;
	switch (item.kind) {
		case 'phrase':
			return <KeyPhrase text={item.text} keywords={item.keywords} at={at} size={item.size} width={item.width} />;
		case 'student':
			return <StoryStudent keys={item.poses.map((key) => ({pose: key.pose, at: when(key)}))} size={item.size} />;
		case 'exam':
			return <ExamSheet title={item.title} at={at} width={item.width} tilt={item.tilt} rows={item.rows.map((row) => ({number: row.number, choice: row.choice, result: row.result, at: when(row)}))} net={item.net ? {text: item.net.text, at: when(item.net)} : undefined} />;
		case 'sticky':
			return <StickyNote text={item.text} at={at} width={item.width} tilt={item.tilt} />;
		case 'topics':
			return <TopicList title={item.title} at={at} width={item.width} items={item.items.map((topic) => ({text: topic.text, ok: topic.ok, at: when(topic)}))} />;
		case 'chart':
			return <NetChart title={item.title} values={item.values} labels={item.labels} at={at} width={item.width} />;
		case 'bars':
			return <CompareBars title={item.title} at={at} width={item.width} rows={item.rows.map((row) => ({label: row.label, value: row.value, text: row.text, tone: row.tone, at: when(row)}))} />;
		case 'number':
			return <NumberPop to={item.to} from={item.from} at={at} suffix={item.suffix} size={item.size} />;
		case 'device':
			return (
				<div style={landing(seconds, at, item.rotate)}>
					<StoryDevice id={item.id} screens={item.screens?.map((screen) => ({id: screen.id, at: when(screen)}))} width={item.width} transition={item.transition} />
				</div>
			);
		case 'home':
			return (
				<div style={landing(seconds, at)}>
					<StoryPhone width={item.width} rotate={item.rotate} wallpaper={item.wallpaper} touches={item.touches.map((touch) => ({app: touch.app, kind: touch.touch, at: when(touch)}))} screens={item.screens.map((screen) => ({id: screen.id, at: when(screen)}))} />
				</div>
			);
		case 'chip':
			return (
				<div style={{...landing(seconds, at), padding: '14px 32px', borderRadius: 999, background: look.chip.background}}>
					<Text size={46} weight={TYPE.weights.kinetic} color={look.chip.ink}>
						{item.text}
					</Text>
				</div>
			);
		case 'cursor':
			return <StoryCursor clicks={item.clicks.map((click) => ({x: click.x, y: click.y, at: when(click)}))} size={item.size} />;
	}
};

/** The small logo in the corner, outside the camera so it never moves. */
const Corner: React.FC<{look: StoryLook}> = ({look}) => (
	<Place x={CANVAS.width - 250} y={CANVAS.height - 330}>
		<div style={{width: 200, display: 'flex', justifyContent: 'flex-end', opacity: 0.8}}>
			<BrandMark size="chrome" color={look.ink} />
		</div>
	</Place>
);

const BeatScene: React.FC<{beat: Beat; clip?: VoiceClip; seconds: number; look: StoryLook}> = ({beat, clip, seconds, look}) => {
	const {typography} = useTheme();
	const when = cueResolver(beat, clip, seconds);
	// The first sub-beat is the scene's hard cut; every later one punches in softly, so the frame moves on the words.
	const beats = subBeats(clip, beat.narration, 1.2, seconds, SINAVIKA_TR_TEMPO.lineGap.lead);
	const moves = [
		{kind: 'punch' as const, at: 0},
		...beats.slice(1).map((sub) => ({kind: 'punch' as const, at: sub.at, from: 1.05, sound: null})),
		...beat.moves.map((move) => ({kind: move.kind, at: when(move)})),
	];
	return (
		<StoryLookProvider look={look}>
			<AbsoluteFill style={{fontFamily: typography.body}}>
				<StoryGround />
				<StoryStage>
					<StoryCamera moves={moves} canvasWidth={CANVAS.width}>
						{beat.items.map((item, index) => (
							<Place key={index} x={item.x} y={item.y}>
								<ItemView item={item} when={when} look={look} />
							</Place>
						))}
					</StoryCamera>
					<Corner look={look} />
				</StoryStage>
			</AbsoluteFill>
		</StoryLookProvider>
	);
};

/** The closing card on the look's card ground (its own ground without the lamp when the look sets none): logo and type in the look's ink. */
const CardScene: React.FC<{text?: string; look: StoryLook}> = ({text, look}) => {
	const {typography} = useTheme();
	const seconds = useSeconds();
	const logo = useLand(0.05, 200);
	const badges = ease(interpolate(seconds, [0.3, 0.6], [0, 1], CLAMP));
	return (
		<StoryLookProvider look={look}>
		<AbsoluteFill style={{background: cardGround(look), fontFamily: typography.body}}>
			{look.card ? null : <StoryGround plain />}
			<StoryStage>
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 70}}>
					<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
						<BrandMark size="card" color={look.ink} />
					</div>
					{text ? (
						<Text size={56} weight={TYPE.weights.strong} color={look.ink} align="center">
							{text}
						</Text>
					) : null}
					<div style={{opacity: badges, transform: `translateY(${(1 - badges) * 20}px)`}}>
						<StoreBadges height={100} onDark={storyTone({...look, ground: {...look.ground, colors: [cardGround(look)]}}) === 'dark'} />
					</div>
				</div>
			</StoryStage>
		</AbsoluteFill>
		</StoryLookProvider>
	);
};

const SAMPLE: z.input<typeof StudyDeskStorySchema> = {
	beats: [
		{
			id: 'hook',
			narration: 'Günde 8 saat çalışıyorsun, netler yerinde sayıyor.',
			moves: [{kind: 'shake', on: 'yerinde'}],
			items: [
				{kind: 'phrase', text: 'Günde 8 saat çalışıyorsun ama netler yerinde sayıyor', keywords: ['8 saat', 'yerinde sayıyor'], x: 90, y: 240, at: 0.05},
				{kind: 'chart', title: 'Son 5 deneme', values: [52, 54, 51, 53, 52], x: 160, y: 760, on: 'netler'},
				{kind: 'student', poses: [{pose: 'slumped'}], x: 320, y: 1180},
			],
		},
		{id: 'why', narration: 'Kötü haber: saat, öğrenmek demek değil.', items: [{kind: 'bars', title: 'Bu hafta', rows: [{label: 'Çalıştığın', value: 0.95, text: '8 saat', tone: 'muted'}, {label: 'Öğrendiğin', value: 0.2, text: '?', on: 'öğrenmek'}], x: 160, y: 600}]},
		{id: 'mistakes', narration: 'Aynı soru, aynı yanlış. Üçüncü kez!', items: [{kind: 'sticky', text: 'Aynı hata, 3. kez!', x: 330, y: 700, on: 'Üçüncü'}]},
		{id: 'app', narration: 'Sınavika’da deneme eksiğini bulur, Ders Planı bugünkü görevini gösterir.', items: [{kind: 'device', id: 'm-deneme-gelisim', width: 420, x: 110, y: 420}, {kind: 'device', id: 'm-plan-bugun', width: 420, x: 560, y: 480, rotate: 4, on: 'Ders Planı'}]},
		{id: 'close', narration: 'Mesele ne kadar çalıştığın değil. Nasıl çalıştığın!', items: [{kind: 'phrase', text: 'Ne kadar değil, nasıl.', keywords: ['nasıl'], x: 90, y: 300}, {kind: 'student', poses: [{pose: 'upright'}, {pose: 'happy', on: 'Nasıl'}], x: 320, y: 1100}]},
	],
};

/**
 * When the picture changes inside each scene, for the render's tempo check (TemplateDefinition.tempo): every sub-beat
 * punch, every card, pose or screen landing on a word, and every camera move. The closing card is not measured.
 */
const pictureChanges = (content: Content, voiceClips: VoiceClips): number[][] =>
	buildScenes(content, voiceClips).map((scene) => {
		const beat = content.beats.find((candidate) => candidate.id === scene.id);
		if (!beat) return [];
		const clip = voiceClips[beat.id];
		const when = cueResolver(beat, clip, scene.seconds);
		const punches = subBeats(clip, beat.narration, 1.2, scene.seconds, SINAVIKA_TR_TEMPO.lineGap.lead).slice(1).map((sub) => sub.at);
		return [...punches, ...when.all(), ...beat.moves.map((move) => when(move))].filter((at) => at > 0 && at < scene.seconds).sort((a, b) => a - b);
	});

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips, content.script, SINAVIKA_TR_TEMPO.lineGap);
	const beats = content.beats.map((beat): TemplateScene => {
		const estimate = estimateReadingSeconds([beat.narration], {baseSeconds: 0.6, minSeconds: beat.minSeconds, maxSeconds: SINAVIKA_TR_TEMPO.maxSceneSeconds});
		const slot = say(beat.id, beat.narration, Math.max(estimate, beat.minSeconds), beat.minSeconds);
		return {id: beat.id, seconds: slot.seconds, label: beat.id, voice: [slot], element: <BeatScene beat={beat} clip={voiceClips[beat.id]} seconds={slot.seconds} look={content.look} />};
	});
	if (!content.outro.enabled) return beats;
	return [...beats, {id: OUTRO_SCENE_ID, seconds: content.card.seconds, label: 'Kart', silent: true, element: <CardScene text={content.card.line} look={content.look} />}];
};

export const StudyDeskStory = defineTemplate({
	id: 'StudyDeskStory',
	category: 'Advertisements',
	title: 'Masa başı hikâyesi',
	description: 'sinavika.tr için problem odaklı reels, hikâye kitiyle: video başına görünüm (look: sıcak gri, kâğıt, canlı renk, kömür, lacivert), kâğıt kartlar (deneme kâğıdı, not, konu listesi, net grafiği, karşılaştırma), pozlu öğrenci, sese bağlı anahtar ifadeler ve sayılar, gerçek UI/UX ekranları kendi cihazında (telefon, tablet, saat; kayarak ya da yaylı dönüşümle), tıklayan imleç; her alt vuruşta kamera yakınlaşması, onaylı tempo; sonda 2 sn sade kart (logo ve mağaza rozetleri, çağrı yok).',
	contentSchema: StudyDeskStorySchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: SINAVIKA_TR_TEMPO.cut.scenePreset},
	targetSeconds: SINAVIKA_TR_TEMPO.contentSeconds,
	buildScenes,
	tempo: {
		limits: {maxLineGapSeconds: SINAVIKA_TR_TEMPO.maxLineGapSeconds, maxSceneSeconds: SINAVIKA_TR_TEMPO.maxSceneSeconds, maxPictureGapSeconds: SINAVIKA_TR_TEMPO.maxPictureGapSeconds},
		pictureChanges,
	},
});
