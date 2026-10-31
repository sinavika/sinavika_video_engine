import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
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
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {Tap} from '../PromoKit/PromoMotion';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * Pick a card (Kasım 2026, 23 Kasım). A table-top card trick without hands:
 * on navy cloth a deck fans out and one card comes forward. It turns to a
 * flash-card question, a countdown runs with the voice (3, 2, 1), and the
 * card flips to the answer. "Add to deck" sends it into the deck, and the
 * decks wait on the phone. Not magic: repetition.
 */

const narration = z.string().trim().min(1).max(170);

const CardTrickSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	card: z.object({deck: plainText(24), question: plainText(60), answer: plainText(12), note: plainText(40), count: plainText(14)}),
	/** The countdown's spoken words (e.g. "Üç, iki, bir."), shown as digits. */
	count: z.object({narration}),
	reveal: z.object({narration}),
	keep: z.object({know: plainText(14), add: plainText(16), deck: plainText(26), narration}),
	close: z.object({line: plainText(24), screen: z.enum(PROMO_PHONE_SCREEN_NAMES), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof CardTrickSchema>;

const NAVY = '#0B1C30';
const CLOTH = '#102540';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const CARDS = MODULES.flashcards.color.light;

/** The picked card, face up, in the middle of the frame. */
const BIG = {x: 476 - 260, y: 300, w: 520, h: 740};
/** The fan: seven cards around a pivot under the frame; the fifth is the one picked. */
const FAN = {count: 7, pick: 4, w: 360, h: 520, pivot: {x: 476, y: 1760}, spread: 13};

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(75% 55% at 50% 45%, #1B3A63 0%, ${CLOTH} 55%, #07111F 100%)`}}>
		<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 7px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 7px)'}} />
	</AbsoluteFill>
);

/** The back of a card: navy with an orange lattice and a question mark. */
const Back: React.FC = () => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, borderRadius: u(34), background: '#13294B', border: `${u(10)}px solid ${WHITE}`, boxSizing: 'border-box', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: u(14), borderRadius: u(22), border: `${u(4)}px solid ${ORANGE}`, backgroundImage: 'repeating-linear-gradient(45deg, rgba(234,88,12,0.28) 0 3px, transparent 3px 26px), repeating-linear-gradient(-45deg, rgba(234,88,12,0.28) 0 3px, transparent 3px 26px)'}} />
			<div style={{position: 'absolute', left: '50%', top: '50%', width: u(130), height: u(130), marginLeft: u(-65), marginTop: u(-65), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Text variant="display" size={84} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1}}>
					?
				</Text>
			</div>
		</div>
	);
};

const Question: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, borderRadius: u(34), background: WHITE, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
			<div style={{padding: `${u(26)}px ${u(34)}px`, background: CARDS, display: 'flex', alignItems: 'center', gap: u(12)}}>
				<Icon name="cards" size={u(36)} color={WHITE} stroke={2.4} />
				<Text size={32} weight={TYPE.weights.kinetic} color={WHITE}>
					{content.card.deck}
				</Text>
			</div>
			<div style={{flex: 1, padding: u(40), display: 'flex', alignItems: 'center'}}>
				<Text variant="display" size={60} weight={TYPE.weights.kinetic} color={NAVY} style={{lineHeight: 1.15}}>
					{content.card.question}
				</Text>
			</div>
			<div style={{padding: `0 ${u(40)}px ${u(30)}px`}}>
				<Text size={28} weight={TYPE.weights.display} color="#94A3B8">
					{content.card.count}
				</Text>
			</div>
		</div>
	);
};

const Answer: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, borderRadius: u(34), background: CARDS, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: u(24), padding: u(40), boxSizing: 'border-box'}}>
			<Text size={34} weight={TYPE.weights.display} color="rgba(255,255,255,0.85)">
				Cevap
			</Text>
			<Text variant="display" size={78} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums', whiteSpace: 'nowrap', letterSpacing: '-0.02em'}}>
				{content.card.answer}
			</Text>
			<Text size={36} weight={TYPE.weights.display} color="rgba(255,255,255,0.9)" align="center" style={{lineHeight: 1.3}}>
				{content.card.note}
			</Text>
		</div>
	);
};

/**
 * A card that turns over around its vertical axis: `turn` 0 shows `front`,
 * 1 shows `back`. Each face hides its back side, as a real card does.
 */
const FlipCard: React.FC<{x: number; y: number; w: number; h: number; turn: number; rotate?: number; scale?: number; front: React.ReactNode; back: React.ReactNode; shadow?: boolean}> = ({x, y, w, h, turn, rotate = 0, scale = 1, front, back, shadow = true}) => {
	const {u} = useVideoLayout();
	const face: React.CSSProperties = {position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'};
	return (
		<div style={{position: 'absolute', left: u(x), top: u(y), width: u(w), height: u(h), perspective: u(2200), transform: `rotate(${rotate}deg) scale(${scale})`, filter: shadow ? `drop-shadow(0 ${u(36)}px ${u(40)}px rgba(0,0,0,0.5))` : undefined}}>
			<div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${turn * 180}deg)`}}>
				<div style={face}>{front}</div>
				<div style={{...face, transform: 'rotateY(180deg)'}}>{back}</div>
			</div>
		</div>
	);
};

/** One card of the fan at its angle; `lift` raises the picked one out of the fan. */
const fanCard = (index: number, open: number, lift: number) => {
	const angle = (index - (FAN.count - 1) / 2) * FAN.spread * open;
	const radius = 980;
	const radians = (angle * Math.PI) / 180;
	const cx = FAN.pivot.x + Math.sin(radians) * radius;
	const cy = FAN.pivot.y - Math.cos(radians) * radius;
	const up = index === FAN.pick ? lift : 0;
	return {x: cx - FAN.w / 2, y: cy - FAN.h / 2 - up * 220, rotate: angle * (1 - up * 0.7), scale: 1 + up * 0.08};
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const open = 0.55 + 0.45 * ease(interpolate(seconds, [0, 0.5], [0, 1], CLAMP));
	const lift = ease(interpolate(seconds, [0.9, 1.3], [0, 1], CLAMP));
	return (
		<Stage>
			{Array.from({length: FAN.count}, (_, index) => {
				const card = fanCard(index, open, lift);
				return <FlipCard key={index} {...card} w={FAN.w} h={FAN.h} turn={1} front={<Question content={content} />} back={<Back />} />;
			})}
			<SoundEffect id="cardShuffle" atSeconds={0} volume={0.8} />
			<SoundEffect id="transitionWhoosh" atSeconds={0.9} volume={0.5} />
			<At y={70} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
			</At>
			<At y={180} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** The picked card leaves the fan for the middle and turns face up; the rest drop away. */
const CountScene: React.FC<{content: Content; digits: number[]}> = ({content, digits}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const move = ease(interpolate(seconds, [0, 0.45], [0, 1], CLAMP));
	const turn = 1 - ease(interpolate(seconds, [0.15, 0.6], [0, 1], CLAMP));
	const from = fanCard(FAN.pick, 1, 1);
	const shown = digits.reduce((last, at, index) => (seconds >= at ? index : last), -1);
	const pop = shown >= 0 ? ease(Math.min(1, (seconds - digits[shown]) / 0.18)) : 0;
	return (
		<Stage>
			{Array.from({length: FAN.count}, (_, index) => {
				if (index === FAN.pick) return null;
				const card = fanCard(index, 1, 0);
				return <FlipCard key={index} {...card} y={card.y + move * 1300} w={FAN.w} h={FAN.h} turn={1} front={<Question content={content} />} back={<Back />} />;
			})}
			<FlipCard x={interpolate(move, [0, 1], [from.x, BIG.x])} y={interpolate(move, [0, 1], [from.y, BIG.y])} w={interpolate(move, [0, 1], [FAN.w, BIG.w])} h={interpolate(move, [0, 1], [FAN.h, BIG.h])} rotate={from.rotate * (1 - move)} turn={turn} front={<Question content={content} />} back={<Back />} />
			{shown >= 0 ? (
				<At y={1070} w={952}>
					<div style={{display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(pop, [0, 1], [1.5, 1])})`, opacity: pop}}>
						<div style={{width: u(200), height: u(200), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${u(30)}px ${u(60)}px -${u(20)}px ${ORANGE}`}}>
							<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1}}>
								{String(digits.length - shown)}
							</Text>
						</div>
					</div>
				</At>
			) : null}
			<SoundEffect id="cardFlip" atSeconds={0.2} />
			{digits.map((at, index) => <SoundEffect key={index} id="countdownTick" atSeconds={at} volume={0.8} />)}
		</Stage>
	);
};

const RevealScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const turn = ease(interpolate(seconds, [0.1, 0.5], [0, 1], CLAMP));
	return (
		<Stage>
			<FlipCard {...BIG} turn={turn} front={<Question content={content} />} back={<Answer content={content} />} />
			<SoundEffect id="cardFlip" atSeconds={0.1} />
			<SoundEffect id="correctAnswer" atSeconds={0.45} volume={0.8} />
		</Stage>
	);
};

const KeepScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const buttons = useLand(0.1, 180, 20);
	const tapAt = Math.min(1.3, total - 1.2);
	const go = ease(interpolate(seconds, [tapAt + 0.15, tapAt + 0.6], [0, 1], CLAMP));
	const deck = useLand(tapAt + 0.05, 170, 20);
	const label = useLand(tapAt + 0.6, 170, 20);
	const DECK = {x: 476 - 150, y: 760, w: 300, h: 430};
	return (
		<Stage>
			{/* The deck the card goes into: three backs, a little apart. */}
			{[2, 1, 0].map((index) => (
				<div key={index} style={{position: 'absolute', left: u(DECK.x + index * 14), top: u(DECK.y + index * 14), width: u(DECK.w), height: u(DECK.h), opacity: deck, transform: `translateY(${(1 - deck) * u(200)}px)`}}>
					<Back />
				</div>
			))}
			<FlipCard
				x={interpolate(go, [0, 1], [BIG.x, DECK.x])}
				y={interpolate(go, [0, 1], [BIG.y, DECK.y - 6])}
				w={interpolate(go, [0, 1], [BIG.w, DECK.w])}
				h={interpolate(go, [0, 1], [BIG.h, DECK.h])}
				turn={1 - go}
				front={<Back />}
				back={<Answer content={content} />}
			/>
			<At y={1080} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', gap: u(24), opacity: Math.min(1, buttons * 1.4) * (1 - go), transform: `translateY(${(1 - buttons) * u(40)}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(10), padding: `${u(22)}px ${u(34)}px`, borderRadius: u(999), background: WHITE}}>
						<Icon name="check" size={u(34)} color="#15803D" stroke={2.8} />
						<Text size={38} weight={TYPE.weights.kinetic} color={NAVY}>
							{content.keep.know}
						</Text>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: u(10), padding: `${u(22)}px ${u(34)}px`, borderRadius: u(999), background: ORANGE}}>
						<Icon name="plus" size={u(34)} color={WHITE} stroke={2.8} />
						<Text size={38} weight={TYPE.weights.kinetic} color={WHITE}>
							{content.keep.add}
						</Text>
					</div>
				</div>
			</At>
			<At y={1230} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: label, transform: `translateY(${(1 - label) * u(30)}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(16)}px ${u(28)}px`, borderRadius: u(999), background: CARDS}}>
						<Icon name="cards" size={u(34)} color={WHITE} stroke={2.4} />
						<Text size={36} weight={TYPE.weights.kinetic} color={WHITE}>
							{content.keep.deck}
						</Text>
					</div>
				</div>
			</At>
			<Tap x={476 + 160} y={1080 + 44} at={tapAt} color="rgba(255,255,255,0.6)" />
			<SoundEffect id="cardShuffle" atSeconds={tapAt + 0.4} volume={0.7} />
			<SoundEffect id="success" atSeconds={tapAt + 0.6} volume={0.8} />
		</Stage>
	);
};

const CloseScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const phone = useLand(0.05, 150, 22);
	const Screen = PROMO_PHONE_SCREENS[content.close.screen];
	return (
		<Stage>
			<At x={476 - 250} y={330 + (1 - phone) * 700} w={500}>
				<div style={{filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(0,0,0,0.55))`}}>
					<PhoneShot width={500}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			<At y={90} w={952}>
				<Slam text={content.close.line} at={0.15} size={TYPE.adScale.headline} color={WHITE} sound={null} />
			</At>
			<SoundEffect id="transitionWhoosh" atSeconds={0.05} volume={0.6} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof CardTrickSchema> = {
	hook: {lines: ['Bir kart seç.', 'Biliyor musun?'], narration: 'Bir kart seç. Biliyor musun?'},
	card: {deck: 'Bilgi Kartları · Tarih', question: 'Lale Devri hangi yıllar arasındadır?', answer: '1718–1730', note: 'Pasarofça’dan Patrona Halil İsyanı’na', count: 'Kart 7 / 20'},
	count: {narration: 'Üç, iki, bir.'},
	reveal: {narration: '1718–1730.'},
	keep: {know: 'Biliyorum', add: 'Desteye ekle', deck: 'Tarih destesi · 21 kart', narration: 'Bildiysen harika, bilmediysen desteye ekle.'},
	close: {line: 'Sihir değil, tekrar.', screen: 'cardsToday', narration: 'Sihir değil, tekrar.'},
	script: {reveal: 'Bin yedi yüz on sekiz, bin yedi yüz otuz.'},
};

/** When the countdown's words are heard: from the clip's word timings, else every 0.6 s. */
const countdownCues = (voiceClips: VoiceClips): number[] => {
	const words = voiceClips.count?.words ?? [];
	if (words.length >= 3) return words.slice(0, 3).map((word) => VOICE_LEAD_SECONDS + word.startSeconds);
	return [0.7, 1.3, 1.9];
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const digits = countdownCues(voiceClips);
	const count = say('count', content.count.narration, Math.max(beat(content.count.narration, 2.6), 2.6), Math.max(2.4, digits[2] + 0.7));
	const reveal = say('reveal', content.reveal.narration, Math.max(beat(content.reveal.narration, 3), 3), 2.6);
	const keep = say('keep', content.keep.narration, Math.max(beat(content.keep.narration, 3), 3), 3);
	const close = say('close', content.close.narration, Math.max(beat(content.close.narration, 2.2), 2.2), 2.2);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'count', seconds: count.seconds, label: 'Geri sayım', voice: [count], element: <CountScene content={content} digits={digits} />},
		{id: 'reveal', seconds: reveal.seconds, label: 'Cevap', voice: [reveal], element: <RevealScene content={content} />},
		{id: 'keep', seconds: keep.seconds, label: 'Deste', voice: [keep], element: <KeepScene content={content} seconds={keep.seconds} />},
		{id: 'close', seconds: close.seconds, label: 'Kapanış', voice: [close], element: <CloseScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const CardTrick = defineTemplate({
	id: 'CardTrick',
	category: 'Advertisements',
	title: 'Bir kart seç',
	description: 'Elsiz masa üstü kart gösterisi: lacivert kumaşta deste yelpaze olur, bir kart öne çıkar ve bilgi kartı sorusuna döner; sesle birlikte 3, 2, 1, kart çevrilir, cevap. “Desteye ekle” ile kart desteye girer, desteler telefonda bekler. Sihir değil, tekrar.',
	contentSchema: CardTrickSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
