import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, PromoSubtitle, Slam, useSeconds, wordCues} from '../PromoKit/PromoKit';
import {PromoEndCard} from '../PromoKit/PromoEndCard';

/**
 * A motion-design showreel: one huge word per beat, each on its module's
 * colour, with solid 3D shapes turning around it. Fast, loud and rhythmic;
 * the only reel of the campaign that uses every module colour.
 */

const narration = z.string().trim().min(1).max(170);

export const KineticTypeSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(20), plainText(20)]), narration}),
	words: z.object({items: z.array(z.object({word: plainText(10), module: z.enum(MODULE_ORDER as unknown as [ModuleKey, ...ModuleKey[]]), caption: plainText(26)})).min(4).max(7), narration}),
	stack: z.object({line: plainText(30), narration}),
	closing: z.object({slogan: plainText(28).default('Ölç, öğren, geliş.'), cta: plainText(28), channels: plainText(40).default('App Store · Google Play · sinavika.com'), narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof KineticTypeSchema>;

const BLACK = '#0A0A0A';
const WHITE = '#FFFFFF';
const ORANGE = '#EA580C';
/** Grounds per module: the identity colour, SinoAI as near-black ink. */
const groundOf = (module: ModuleKey) => (module === 'sinoAi' ? '#111827' : MODULES[module].color.light);

const Stage: React.FC<{content: Content; narration: string; shown?: string; ground: string; children: React.ReactNode}> = ({content, narration: text, shown, ground, children}) => (
	<PromoStage ground={<AbsoluteFill style={{background: ground}} />}>
		{children}
		<PromoSubtitle text={text} shown={shown} enabled={content.subtitles} ink={BLACK} fill={WHITE} />
	</PromoStage>
);

/** A solid shape turning in 3D: a cube made of six faces. */
const Cube: React.FC<{size: number; x: number; y: number; spin: number; color: string}> = ({size, x, y, spin, color}) => {
	const {u} = useVideoLayout();
	const s = u(size);
	const face = (transform: string, shade: number) => <div style={{position: 'absolute', width: s, height: s, background: color, filter: `brightness(${shade})`, transform, backfaceVisibility: 'hidden', borderRadius: u(size * 0.08)}} />;
	return (
		<div style={{position: 'absolute', left: u(x), top: u(y), width: s, height: s, perspective: u(900)}}>
			<div style={{position: 'relative', width: s, height: s, transformStyle: 'preserve-3d', transform: `rotateX(${spin * 0.8 + 20}deg) rotateY(${spin}deg)`}}>
				{face(`translateZ(${s / 2}px)`, 1)}
				{face(`rotateY(180deg) translateZ(${s / 2}px)`, 0.7)}
				{face(`rotateY(90deg) translateZ(${s / 2}px)`, 0.85)}
				{face(`rotateY(-90deg) translateZ(${s / 2}px)`, 0.8)}
				{face(`rotateX(90deg) translateZ(${s / 2}px)`, 1.15)}
				{face(`rotateX(-90deg) translateZ(${s / 2}px)`, 0.6)}
			</div>
		</div>
	);
};

const Ring: React.FC<{size: number; x: number; y: number; spin: number; color: string}> = ({size, x, y, spin, color}) => {
	const {u} = useVideoLayout();
	return <div style={{position: 'absolute', left: u(x), top: u(y), width: u(size), height: u(size), borderRadius: '50%', border: `${u(size * 0.16)}px solid ${color}`, transform: `perspective(${u(900)}px) rotateX(${60 + Math.sin(spin / 40) * 20}deg) rotateZ(${spin}deg)`, boxSizing: 'border-box'}} />;
};

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage content={content} narration={content.hook.narration} shown={content.hook.lines.join(' ')} ground={BLACK}>
		<At y={560} w={952}>
			<Slam text={content.hook.lines[0]} at={0.05} size={TYPE.adScale.hook} color={WHITE} />
		</At>
		<At y={700} w={952}>
			<Slam text={content.hook.lines[1]} at={0.5} size={TYPE.adScale.hook * 1.1} color={ORANGE} />
		</At>
	</Stage>
);

const WordsScene: React.FC<{content: Content; seconds: number; spoken?: string; voiceSeconds?: number}> = ({content, seconds: total, spoken, voiceSeconds}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const items = content.words.items;
	const per = total / items.length;
	// Each word holds the screen from the moment it is said until the next one is.
	const cues = wordCues(spoken ?? content.words.narration, items.map((entry) => entry.word), voiceSeconds, items.map((_, index) => index * per));
	cues[0] = 0;
	const index = Math.max(0, cues.reduce((found, cue, position) => (seconds >= cue ? position : found), 0));
	const local = seconds - cues[index];
	const item = items[index];
	const ground = groundOf(item.module);
	const hit = Math.exp(-local * 9);
	const size = Math.min(300, (952 * 1.55) / Math.max(item.word.length, 3));
	const spin = seconds * 140;
	return (
		<Stage content={content} narration={content.words.narration} shown={items.map((entry) => entry.word).join(' ')} ground={ground}>
			<Cube size={150} x={60 + Math.sin(seconds) * 20} y={260 - local * 40} spin={spin} color="rgba(255,255,255,0.92)" />
			<Ring size={220} x={690} y={1040 + local * 30} spin={spin * 0.7} color="rgba(255,255,255,0.85)" />
			<Cube size={90} x={780} y={300 + local * 20} spin={-spin * 1.2} color={BLACK} />
			<At y={600 - size * 0.1} w={952}>
				<div style={{transform: `scale(${1 + hit * 0.25})`, filter: hit > 0.2 ? `blur(${hit * 10}px)` : undefined}}>
					<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{letterSpacing: '-0.05em', lineHeight: 0.95}}>
						{item.word}
					</Text>
				</div>
			</At>
			<At y={600 + size * 1.05} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: interpolate(local, [0.1, 0.3], [0, 1], CLAMP)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(16), padding: `${u(16)}px ${u(28)}px`, borderRadius: u(999), background: WHITE}}>
						<Icon name={MODULES[item.module].icon} size={u(40)} color={ground} stroke={2.2} />
						<Text size={38} weight={TYPE.weights.display} color={BLACK}>
							{item.caption}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const StackScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const items = content.words.items;
	const collapse = ease(interpolate(seconds, [0.9, 1.6], [0, 1], CLAMP));
	return (
		<Stage content={content} narration={content.stack.narration} shown={content.stack.line} ground={BLACK}>
			<At y={180} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(interpolate(collapse, [0, 1], [6, -150]))}}>
					{items.map((item, index) => {
						const land = ease(interpolate(seconds, [index * 0.1, index * 0.1 + 0.35], [0, 1], CLAMP));
						return (
							<div key={item.word} style={{opacity: land * (1 - collapse * 0.85), transform: `translateX(${(1 - land) * (index % 2 ? 1 : -1) * u(600)}px) scale(${1 - collapse * 0.3})`}}>
								<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={groundOf(item.module)} align="center" style={{letterSpacing: '-0.05em', lineHeight: 1}}>
									{item.word}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
			<At y={660} w={952}>
				<div style={{opacity: collapse, transform: `scale(${interpolate(collapse, [0, 1], [1.3, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline * 1.05} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.stack.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof KineticTypeSchema> = {
	hook: {lines: ['Sınav hazırlığı', 'altı kelime.'], narration: 'Sınav hazırlığı altı kelime.'},
	words: {
		items: [
			{word: 'DENE.', module: 'exam', caption: 'Denemeler'},
			{word: 'GÖR.', module: 'tests', caption: 'Konu konu sonuç'},
			{word: 'PLANLA.', module: 'studyPlan', caption: 'Ders Planı'},
			{word: 'ÖĞREN.', module: 'lessons', caption: 'Dersler'},
			{word: 'SOR.', module: 'sinoAi', caption: 'SinoAI'},
			{word: 'HATIRLA.', module: 'flashcards', caption: 'Bilgi Kartları'},
		],
		narration: 'Dene. Gör. Planla. Öğren. Sor. Hatırla.',
	},
	stack: {line: 'Hepsi tek uygulamada.', narration: 'Hepsi tek uygulamada.'},
	closing: {cta: 'Ücretsiz indir', narration: 'Sınavika. Ölç, öğren, geliş.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 10});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.2), 2);
	const words = say('words', content.words.narration, Math.max(beat(content.words.narration, 4), content.words.items.length * 0.8), content.words.items.length * 0.7);
	const stack = say('stack', content.stack.narration, beat(content.stack.narration, 2.4), 2.2);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.8), 2.6);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'words', seconds: words.seconds, label: 'Kelimeler', voice: [words], element: <WordsScene content={content} seconds={words.seconds} spoken={words.text} voiceSeconds={voiceClips.words?.durationSeconds} />},
		{id: 'stack', seconds: stack.seconds, label: 'Yığın', voice: [stack], element: <StackScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <PromoEndCard cta={content.closing.cta} />}] : []),
	];
};

export const KineticType = defineTemplate({
	id: 'KineticType',
	category: 'Advertisements',
	title: 'Kinetik tipografi vitrini',
	description: 'Her vuruşta tek dev kelime, modül renginde zemin ve dönen 3B şekiller; sonunda kelimeler tek cümleye çöker.',
	contentSchema: KineticTypeSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 26},
	buildScenes,
});
