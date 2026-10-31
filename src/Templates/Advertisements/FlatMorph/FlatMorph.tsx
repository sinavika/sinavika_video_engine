import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Flat 2D explainer: one solid colour, flat shapes, a big bouncing word, an
 * icon that turns into another, a flash, a phone with tags orbiting it.
 * Playful and cartoon-clean; the campaign's only flat-animation reel.
 */

const narration = z.string().trim().min(1).max(170);
const TAG_ICONS = ['list', 'book', 'target', 'playCircle', 'quiz', 'sparkles', 'check'] as const;

const FlatMorphSchema = z.object({
	word: z.object({text: plainText(10), narration}),
	morph: z.object({narration}),
	phone: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), narration}),
	tags: z.object({items: z.array(z.object({icon: z.enum(TAG_ICONS), text: plainText(20)})).min(3).max(5), narration}),
	ground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#7C3AED'),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof FlatMorphSchema>;

const WHITE = '#FFFFFF';
const INK = '#1E1B4B';
const YELLOW = '#FDE047';

/** A bouncy spring with overshoot: the cartoon feel. */
const useBounce = (delay = 0): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay * fps, fps, config: {damping: 9, mass: 0.6, stiffness: 180}});
};

/** Flat circles drifting slowly behind everything. */
const Ground: React.FC<{color: string}> = ({color}) => {
	const seconds = useSeconds();
	const blobs = [
		{x: 8, y: 12, r: 26, a: 0.12},
		{x: 78, y: 22, r: 16, a: 0.16},
		{x: 70, y: 78, r: 34, a: 0.1},
		{x: 14, y: 72, r: 12, a: 0.18},
	];
	return (
		<AbsoluteFill style={{background: color, overflow: 'hidden'}}>
			{blobs.map((blob, index) => (
				<div key={index} style={{position: 'absolute', left: `${blob.x + Math.sin(seconds * 0.7 + index) * 2}%`, top: `${blob.y + Math.cos(seconds * 0.6 + index) * 2}%`, width: `${blob.r * 2}vmin`, height: `${blob.r * 2}vmin`, borderRadius: '50%', background: `rgba(255,255,255,${blob.a})`, transform: 'translate(-50%, -50%)'}} />
			))}
		</AbsoluteFill>
	);
};

const Stage: React.FC<{content: Content; children: React.ReactNode; flash?: number}> = ({content, children, flash = 0}) => (
	<PromoStage ground={<Ground color={content.ground} />} overlay={flash > 0 ? <AbsoluteFill style={{background: WHITE, opacity: flash}} /> : undefined}>
		{children}
	</PromoStage>
);

const WordScene: React.FC<{content: Content}> = ({content}) => {
	const pop = useBounce(0.05);
	const seconds = useSeconds();
	return (
		<Stage content={content}>
			<At y={520} w={952}>
				<div style={{transform: `scale(${pop}) rotate(${Math.sin(seconds * 3) * 2}deg)`}}>
					<Text variant="display" size={TYPE.adScale.numeral * 1.05} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{letterSpacing: '-0.05em', textShadow: `0 14px 0 rgba(30,27,75,0.25)`}}>
						{content.word.text}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

/** The flat camera: a rounded body, a lens and a flash bulb. */
const Camera: React.FC<{size: number}> = ({size}) => {
	const {u} = useVideoLayout();
	const s = u(size);
	return (
		<div style={{position: 'relative', width: s, height: s * 0.72}}>
			<div style={{position: 'absolute', left: s * 0.12, top: 0, width: s * 0.3, height: s * 0.16, borderRadius: s * 0.05, background: WHITE}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: s * 0.1, bottom: 0, borderRadius: s * 0.14, background: WHITE, boxShadow: `0 ${s * 0.06}px 0 rgba(30,27,75,0.25)`}} />
			<div style={{position: 'absolute', left: '50%', top: s * 0.42, width: s * 0.42, height: s * 0.42, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: INK, border: `${s * 0.05}px solid ${YELLOW}`}} />
			<div style={{position: 'absolute', right: s * 0.1, top: s * 0.2, width: s * 0.1, height: s * 0.1, borderRadius: '50%', background: YELLOW}} />
		</div>
	);
};

const MorphScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const turn = ease(interpolate(seconds, [0.1, 0.8], [0, 1], CLAMP));
	const cam = useBounce(0.6);
	const flash = interpolate(seconds, [1.5, 1.6, 2.0], [0, 1, 0], CLAMP);
	return (
		<Stage content={content} flash={flash}>
			<At y={500} w={952}>
				<div style={{position: 'relative', height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{position: 'absolute', opacity: 1 - turn, transform: `rotate(${turn * 200}deg) scale(${1 - turn * 0.7})`}}>
						<Text variant="display" size={TYPE.adScale.numeral * 1.3} weight={TYPE.weights.kinetic} color={WHITE}>
							?
						</Text>
					</div>
					<div style={{position: 'absolute', transform: `scale(${cam}) rotate(${(1 - Math.min(cam, 1)) * -30}deg)`}}>
						<Camera size={420} />
					</div>
				</div>
			</At>
		</Stage>
	);
};

const PhoneScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.phone.screen];
	const rise = useBounce(0);
	const flash = interpolate(seconds, [0, 0.35], [0.9, 0], CLAMP);
	return (
		<Stage content={content} flash={flash}>
			<At y={interpolate(rise, [0, 1], [900, 180])} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', filter: `drop-shadow(0 ${u(30)}px 0 rgba(30,27,75,0.25))`}}>
					<PhoneShot width={500} rotate={(1 - Math.min(rise, 1)) * 10}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
		</Stage>
	);
};

const TagsScene: React.FC<{content: Content; stick?: boolean}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.phone.screen];
	const items = content.tags.items;
	return (
		<Stage content={content}>
			<At y={180} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', filter: `drop-shadow(0 ${u(30)}px 0 rgba(30,27,75,0.25))`}}>
					<PhoneShot width={500}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			{items.map((tag, index) => {
				const pop = interpolate(seconds, [0.15 + index * 0.35, 0.45 + index * 0.35], [0, 1], CLAMP);
				const side = index % 2 === 0 ? -1 : 1;
				const x = 476 + side * (300 + Math.sin(seconds * 1.6 + index) * 18);
				const y = 330 + index * 210 + Math.cos(seconds * 1.3 + index) * 14;
				return (
					<At key={tag.text} x={x - 240} y={y} w={480}>
						<div style={{display: 'flex', justifyContent: 'center', transform: `scale(${pop}) rotate(${side * -4}deg)`}}>
							<div style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(18)}px ${u(28)}px`, borderRadius: u(999), background: index % 2 ? YELLOW : WHITE, boxShadow: `0 ${u(10)}px 0 rgba(30,27,75,0.25)`}}>
								<Icon name={tag.icon} size={u(38)} color={INK} stroke={2.3} />
								<Text size={38} weight={TYPE.weights.display} color={INK} style={{whiteSpace: 'nowrap'}}>
									{tag.text}
								</Text>
							</div>
						</div>
					</At>
				);
			})}
		</Stage>
	);
};

const SAMPLE: z.input<typeof FlatMorphSchema> = {
	word: {text: 'Soru?', narration: 'Çözemediğin soru mu var?'},
	morph: {narration: 'Fotoğrafını çek.'},
	phone: {screen: 'solve', narration: 'Akıllı Özet çözümü adım adım gösterir.'},
	tags: {
		items: [
			{icon: 'list', text: 'Adım adım çözüm'},
			{icon: 'book', text: 'Konusu'},
			{icon: 'target', text: 'Hatan nerede'},
			{icon: 'playCircle', text: 'Videolu anlatım'},
			{icon: 'quiz', text: 'Benzer sorular'},
		],
		narration: 'Konusunu ve hatanı söyler; istersen videolu anlatımı izle, benzer sorularla pekiştir.',
	},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const word = say('word', content.word.narration, beat(content.word.narration, 2), 1.8);
	const morph = say('morph', content.morph.narration, Math.max(beat(content.morph.narration, 2.2), 2.2), 2.2);
	const phone = say('phone', content.phone.narration, beat(content.phone.narration, 2.6), 2.4);
	const tags = say('tags', content.tags.narration, Math.max(beat(content.tags.narration, 4), 0.6 + content.tags.items.length * 0.4), 0.6 + content.tags.items.length * 0.35);
	return [
		{id: 'word', seconds: word.seconds, label: 'Kelime', voice: [word], element: <WordScene content={content} />},
		{id: 'morph', seconds: morph.seconds, label: 'Dönüşüm', voice: [morph], element: <MorphScene content={content} />},
		{id: 'phone', seconds: phone.seconds, label: 'Telefon', voice: [phone], element: <PhoneScene content={content} />},
		{id: 'tags', seconds: tags.seconds, label: 'Etiketler', voice: [tags], element: <TagsScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const FlatMorph = defineTemplate({
	id: 'FlatMorph',
	category: 'Advertisements',
	title: 'Düz renk açıklayıcı',
	description: 'Tek renk zemin, zıplayan dev kelime, biçim değiştiren ikon, flaş ve etrafında etiketler dönen telefon.',
	contentSchema: FlatMorphSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 14, max: 30},
	buildScenes,
});
