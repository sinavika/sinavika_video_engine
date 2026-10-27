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
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, PromoSubtitle, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';
import {PromoEndCard} from '../PromoKit/PromoEndCard';

/**
 * A product launch: a silver spotlight, one object at a time in the middle,
 * slow turns and calm type. Used to introduce SinoAI Çalışma's tools. Neutral
 * like SinoAI; the only colour is a faint warm haze and the logo.
 */

const narration = z.string().trim().min(1).max(170);
const TOOL_ICONS = ['book', 'quiz', 'exam', 'cards', 'calendar', 'note', 'layers', 'sparkles'] as const;

export const KeynoteSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(26), plainText(26)]), narration}),
	intro: z.object({kicker: plainText(20), name: plainText(24), narration}),
	tools: z.object({items: z.array(z.object({icon: z.enum(TOOL_ICONS), name: plainText(20), line: plainText(40)})).min(3).max(6), narration}),
	sources: z.object({chips: z.array(plainText(14)).min(3).max(6), screen: z.enum(PROMO_PHONE_SCREEN_NAMES), caption: plainText(40), narration}),
	closing: z.object({name: plainText(24), line: plainText(30), channels: plainText(40).default('iOS · Android · sinavika.com'), narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof KeynoteSchema>;

const INK = '#0B1C30';
const GREY = '#64748B';
const SILVER = '#E2E8F0';

const Ground: React.FC = () => {
	const seconds = useSeconds();
	const drift = Math.sin(seconds * 0.6) * 4;
	return (
		<AbsoluteFill style={{background: `radial-gradient(55% 38% at 50% ${44 + drift}%, #FFFFFF 0%, #F4F6F9 42%, #E3E8EF 78%, #D5DCE5 100%)`}}>
			<AbsoluteFill style={{background: 'radial-gradient(60% 30% at 50% 100%, rgba(251,146,60,0.16) 0%, rgba(251,146,60,0) 70%)'}} />
		</AbsoluteFill>
	);
};

const Stage: React.FC<{content: Content; narration: string; shown?: string; children: React.ReactNode}> = ({content, narration: text, shown, children}) => (
	<PromoStage ground={<Ground />}>
		{children}
		<PromoSubtitle text={text} shown={shown} enabled={content.subtitles} ink="#FFFFFF" fill={INK} />
	</PromoStage>
);

/** Calm type: fades up a little, no blur, no bounce. */
const Rise: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const t = ease(interpolate(seconds, [at, at + 0.7], [0, 1], CLAMP));
	return <div style={{opacity: t, transform: `translateY(${(1 - t) * u(26)}px)`}}>{children}</div>;
};

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage content={content} narration={content.hook.narration} shown={content.hook.lines.join(' ')}>
		<At y={600} w={952}>
			<Rise at={0.1}>
				<Text variant="display" size={TYPE.adScale.hook} weight={TYPE.weights.display} color={GREY} align="center">
					{content.hook.lines[0]}
				</Text>
			</Rise>
			<Rise at={0.9}>
				<Text variant="display" size={TYPE.adScale.hook} weight={TYPE.weights.display} color={INK} align="center">
					{content.hook.lines[1]}
				</Text>
			</Rise>
		</At>
	</Stage>
);

const IntroScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	return (
		<Stage content={content} narration={content.intro.narration} shown={`${content.intro.kicker} ${content.intro.name}`}>
			<At y={620} w={952}>
				<Rise at={0.05}>
					<Text size={52} weight={TYPE.weights.strong} color={GREY} align="center">
						{content.intro.kicker}
					</Text>
				</Rise>
				<div style={{display: 'flex', justifyContent: 'center', marginTop: 20}}>
					{Array.from(content.intro.name).map((char, index) => {
						const t = ease(interpolate(seconds, [0.6 + index * 0.045, 1.0 + index * 0.045], [0, 1], CLAMP));
						return (
							<span key={index} style={{opacity: t, filter: `blur(${(1 - t) * 8}px)`, whiteSpace: 'pre'}}>
								<Text variant="display" size={TYPE.adScale.hook * 1.05} weight={TYPE.weights.kinetic} color={INK} style={{display: 'inline', letterSpacing: '-0.03em'}}>
									{char}
								</Text>
							</span>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

const ToolsScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const items = content.tools.items;
	const per = Math.max(1.1, (total - 0.2) / items.length);
	const index = Math.min(items.length - 1, Math.floor(seconds / per));
	const local = seconds - index * per;
	const enter = ease(interpolate(local, [0, 0.5], [0, 1], CLAMP));
	const leave = index === items.length - 1 ? 0 : ease(interpolate(local, [per - 0.35, per], [0, 1], CLAMP));
	const item = items[index];
	const angle = interpolate(enter, [0, 1], [-70, 0]) + leave * 70 + Math.sin(local * 1.4) * 6;
	return (
		<Stage content={content} narration={content.tools.narration}>
			<At y={150} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', gap: u(14)}}>
					{items.map((entry, dot) => (
						<div key={entry.name} style={{width: u(dot === index ? 46 : 14), height: u(14), borderRadius: u(7), background: dot === index ? INK : '#B8C2CF'}} />
					))}
				</div>
			</At>
			<At y={330} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', perspective: u(1400)}}>
					<div style={{width: u(420), height: u(420), borderRadius: u(96), background: 'linear-gradient(150deg, #FFFFFF 0%, #EEF2F6 55%, #DCE3EB 100%)', boxShadow: `0 ${u(60)}px ${u(110)}px -${u(40)}px rgba(15,23,42,0.35), inset 0 ${u(2)}px 0 #FFFFFF`, border: `${u(2)}px solid #FFFFFF`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotateY(${angle}deg) rotateX(${8 - enter * 4}deg)`, opacity: enter * (1 - leave)}}>
						<Icon name={item.icon} size={u(200)} color={INK} stroke={1.25} />
					</div>
					<div style={{marginTop: u(90), opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * u(20)}px)`}}>
						<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.display} color={INK} align="center">
							{item.name}
						</Text>
						<div style={{marginTop: u(16)}}>
							<Text size={44} weight={TYPE.weights.strong} color={GREY} align="center">
								{item.line}
							</Text>
						</div>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SourcesScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.sources.screen];
	const rise = ease(interpolate(seconds, [0, 0.8], [0, 1], CLAMP));
	const chips = content.sources.chips;
	return (
		<Stage content={content} narration={content.sources.narration} shown={content.sources.caption}>
			<At y={110} w={952}>
				<Rise at={0.2}>
					<Text variant="display" size={54} weight={TYPE.weights.display} color={INK} align="center">
						{content.sources.caption}
					</Text>
				</Rise>
			</At>
			<At y={interpolate(rise, [0, 1], [520, 330])} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: rise}}>
					<PhoneShot width={420}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			{chips.map((chip, index) => {
				const angle = (index / chips.length) * Math.PI * 2 + seconds * 0.55;
				const x = 476 + Math.cos(angle) * 410;
				const y = 760 + Math.sin(angle) * 280;
				const depth = (Math.sin(angle) + 1) / 2;
				const show = interpolate(seconds, [0.4 + index * 0.12, 0.8 + index * 0.12], [0, 1], CLAMP);
				return (
					<At key={chip} x={x - 110} y={y - 40} w={220} style={{zIndex: depth > 0.5 ? 2 : 0}}>
						<div style={{display: 'flex', justifyContent: 'center', opacity: show * (0.55 + depth * 0.45), transform: `scale(${0.82 + depth * 0.22})`}}>
							<div style={{padding: `${u(18)}px ${u(30)}px`, borderRadius: u(999), background: '#FFFFFF', border: `${u(2)}px solid ${SILVER}`, boxShadow: `0 ${u(18)}px ${u(40)}px -${u(22)}px rgba(15,23,42,0.35)`}}>
								<Text size={36} weight={TYPE.weights.strong} color={INK} align="center">
									{chip}
								</Text>
							</div>
						</div>
					</At>
				);
			})}
		</Stage>
	);
};

const SAMPLE: z.input<typeof KeynoteSchema> = {
	hook: {lines: ['Notunu at.', 'Test olsun.'], narration: 'Notunu at, test olsun. PDF’in mi var, deneme olsun.'},
	intro: {kicker: 'Tanıştırayım.', name: 'SinoAI Çalışma', narration: 'Tanıştırayım: SinoAI Çalışma.'},
	tools: {
		items: [
			{icon: 'book', name: 'Çalışma', line: 'Konu anlatımı ve sorular'},
			{icon: 'quiz', name: 'Test', line: '10 soru, anında açıklamalı'},
			{icon: 'exam', name: 'Kişisel deneme', line: 'Eksiklerine göre, tam ya da branş'},
			{icon: 'cards', name: 'Bilgi Kartları', line: 'Notlarından bir deste'},
			{icon: 'calendar', name: 'Çalışma planı', line: 'Bir haftalık konu planı'},
		],
		narration: 'Konu anlatımı, test, kişisel deneme, bilgi kartları ve çalışma planı.',
	},
	sources: {chips: ['PDF', 'Word', 'Sunum', 'Fotoğraf', 'Hedefin'], screen: 'sinoLibrary', caption: 'Kaynağı sen seç.', narration: 'Kaynağı sen seç; notun, sunumun ya da hedefin. Ürettiği her şey kütüphanende durur.'},
	closing: {name: 'SinoAI Çalışma', line: 'Sınavika’da.', narration: 'SinoAI Çalışma, Sınavika’da.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 10});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.6), 2.4);
	const intro = say('intro', content.intro.narration, beat(content.intro.narration, 2.6), 2.4);
	const tools = say('tools', content.tools.narration, Math.max(beat(content.tools.narration, 5), content.tools.items.length * 1.3), content.tools.items.length * 1.1);
	const sources = say('sources', content.sources.narration, beat(content.sources.narration, 4.2), 3.8);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.8), 2.6);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'intro', seconds: intro.seconds, label: 'Tanıtım', voice: [intro], element: <IntroScene content={content} />},
		{id: 'tools', seconds: tools.seconds, label: 'Araçlar', voice: [tools], element: <ToolsScene content={content} seconds={tools.seconds} />},
		{id: 'sources', seconds: sources.seconds, label: 'Kaynaklar', voice: [sources], element: <SourcesScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <PromoEndCard />}] : []),
	];
};

export const Keynote = defineTemplate({
	id: 'Keynote',
	category: 'Advertisements',
	title: 'Lansman filmi',
	description: 'Ürün lansmanı dili: gümüş ışık, ortada tek nesne, ağır dönüşler; SinoAI Çalışma araçlarını tek tek tanıtır.',
	contentSchema: KeynoteSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'fade', durationSeconds: 0.45},
	targetSeconds: {min: 18, max: 34},
	buildScenes,
});
