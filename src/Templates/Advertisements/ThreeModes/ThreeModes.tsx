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
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, TypeOn, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Tap, useSpringKeys} from '../PromoKit/PromoMotion';

/**
 * SinoAI's three depths in one composer (Kasım 2026, 9 Kasım). One continuous
 * shot on SinoAI's neutral white: the question is typed once; a fingertip
 * taps Hızlı, Dengeli, Derin in turn, the liquid indicator stretches from one
 * to the next (its edges on different springs), and the answer below grows
 * from one sentence to steps to steps with an example and a test offer. The
 * scenes share one layout, so the cuts between them do not show.
 */

const narration = z.string().trim().min(1).max(170);

const ThreeModesSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(24), plainText(12)]), narration}),
	question: plainText(60),
	modes: z.tuple([plainText(10), plainText(10), plainText(10)]),
	fast: z.object({answer: plainText(60), narration}),
	balanced: z.object({steps: z.array(plainText(46)).min(2).max(4), narration}),
	deep: z.object({example: plainText(46), offer: plainText(48), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof ThreeModesSchema>;

const INK = '#0B1C30';
const SLATE = '#334155';
const LINE = '#E2E8F0';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';

const CARD = {x: 46, y: 300, w: 860};
const SELECT = {x: CARD.x + 30, y: CARD.y + 190, w: CARD.w - 60, h: 92};
const segment = SELECT.w / 3;

const Ground: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 30%, #FFFFFF 0%, #F8FAFC 70%, #EEF2F6 100%)'}} />;

/** The composer: the typed question and the three-way selector with its liquid indicator moving from `from` to `to`. */
const Composer: React.FC<{content: Content; from: number; to: number; typeAt?: number; moveAt?: number}> = ({content, from, to, typeAt, moveAt = 0.15}) => {
	const {u} = useVideoLayout();
	const left = useSpringKeys([{at: 0, to: from * segment}, {at: moveAt, to: to * segment}], to > from ? 120 : 230);
	const right = useSpringKeys([{at: 0, to: (from + 1) * segment}, {at: moveAt, to: (to + 1) * segment}], to > from ? 230 : 120);
	return (
		<>
			<div style={{position: 'absolute', left: u(CARD.x), top: u(CARD.y), width: u(CARD.w), height: u(310), borderRadius: u(44), background: WHITE, border: `${u(2)}px solid ${LINE}`, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(30)}px rgba(15,23,42,0.25)`}} />
			<At x={CARD.x + 36} y={CARD.y + 34} w={CARD.w - 150}>
				{typeAt === undefined ? (
					<Text size={40} weight={TYPE.weights.strong} color={INK} style={{lineHeight: 1.35}}>
						{content.question}
					</Text>
				) : (
					<TypeOn text={content.question} at={typeAt} charsPerSecond={34} size={40} color={INK} caret={ORANGE} />
				)}
			</At>
			<div style={{position: 'absolute', left: u(CARD.x + CARD.w - 100), top: u(CARD.y + 34), width: u(64), height: u(64), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="up" size={u(34)} color={WHITE} stroke={2.8} />
			</div>
			<div style={{position: 'absolute', left: u(SELECT.x), top: u(SELECT.y), width: u(SELECT.w), height: u(SELECT.h), borderRadius: u(999), background: '#F1F5F9'}} />
			{to === from ? null : <SoundEffect id="morph" atSeconds={moveAt} volume={0.7} />}
			<div style={{position: 'absolute', left: u(SELECT.x + left.value + 6), top: u(SELECT.y + 6), width: u(Math.max(40, right.value - left.value - 12)), height: u(SELECT.h - 12), borderRadius: u(999), background: INK, boxShadow: `0 ${u(10)}px ${u(20)}px -${u(8)}px rgba(15,23,42,0.5)`}} />
			{content.modes.map((mode, index) => (
				<At key={mode} x={SELECT.x + index * segment} y={SELECT.y + 24} w={segment}>
					<Text size={38} weight={TYPE.weights.kinetic} color={index === to ? WHITE : SLATE} align="center">
						{mode}
					</Text>
				</At>
			))}
		</>
	);
};

/** SinoAI's answer card under the composer; `lines` appear one after another from `at`. */
const Answer: React.FC<{lines: React.ReactNode[]; at?: number}> = ({lines, at = 0.35}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<At x={CARD.x} y={650} w={CARD.w}>
			<div style={{display: 'flex', gap: u(22), alignItems: 'flex-start'}}>
				<div style={{width: u(76), height: u(76), borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name="sparkles" size={u(40)} color={WHITE} stroke={2.2} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(18), flex: 1}}>
					{lines.map((line, index) => {
						const show = ease(interpolate(seconds, [at + index * 0.22, at + index * 0.22 + 0.3], [0, 1], CLAMP));
						return (
							<div key={index} style={{opacity: show, transform: `translateY(${(1 - show) * u(24)}px)`}}>
								{line}
								<SoundEffect id="pop" atSeconds={at + index * 0.22} volume={0.55} />
							</div>
						);
					})}
				</div>
			</div>
		</At>
	);
};

const Bubble: React.FC<{children: React.ReactNode; fill?: string; ink?: string}> = ({children, fill = WHITE, ink = INK}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{padding: `${u(22)}px ${u(26)}px`, borderRadius: u(28), background: fill, border: fill === WHITE ? `${u(2)}px solid ${LINE}` : 'none'}}>
			<Text size={36} weight={TYPE.weights.strong} color={ink} style={{lineHeight: 1.3}}>
				{children}
			</Text>
		</div>
	);
};

const Step: React.FC<{index: number; text: string}> = ({index, text}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{display: 'flex', gap: u(16), alignItems: 'center', padding: `${u(18)}px ${u(22)}px`, borderRadius: u(24), background: WHITE, border: `${u(2)}px solid ${LINE}`}}>
			<div style={{width: u(48), height: u(48), borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Text size={28} weight={TYPE.weights.kinetic} color={INK}>
					{String(index + 1)}
				</Text>
			</div>
			<Text size={34} weight={TYPE.weights.strong} color={INK} style={{lineHeight: 1.25}}>
				{text}
			</Text>
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

/** The tap on a segment, a moment before the indicator moves. */
const SegmentTap: React.FC<{index: number; at?: number}> = ({index, at = 0.1}) => <Tap x={SELECT.x + (index + 0.5) * segment} y={SELECT.y + SELECT.h / 2} at={at} />;

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		{/* The camera starts close on the selector and pulls back as the question starts. */}
		<CameraZoom
			keys={[
				{at: 0, to: {x: 476, y: SELECT.y + 46, zoom: 1.25}},
				{at: 1.1, to: {x: 476, y: 700, zoom: 1.18}},
			]}
		>
			<Composer content={content} from={1} to={1} typeAt={99} />
		</CameraZoom>
		<At y={60} w={952}>
			<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={INK} />
		</At>
		<At y={170} w={952}>
			<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
		</At>
	</Stage>
);

/** The camera held a little closer than the canvas, where the hook leaves it: composer and answer fill the frame. */
const Close: React.FC<{children: React.ReactNode}> = ({children}) => <CameraZoom keys={[{at: 0, to: {x: 476, y: 700, zoom: 1.18}}]}>{children}</CameraZoom>;

const FastScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Close>
			{/* The question is typed first; then the tap on Hızlı moves the indicator. */}
			<Composer content={content} from={1} to={0} typeAt={0} moveAt={1.2} />
			<SegmentTap index={0} at={1.15} />
			<Answer lines={[<Bubble key="a">{content.fast.answer}</Bubble>]} at={1.4} />
		</Close>
	</Stage>
);

const BalancedScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Close>
			<Composer content={content} from={0} to={1} />
			<SegmentTap index={1} />
			<Answer lines={content.balanced.steps.map((step, index) => <Step key={step} index={index} text={step} />)} at={0.3} />
		</Close>
	</Stage>
);

const DeepScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Close>
			<Composer content={content} from={1} to={2} />
			<SegmentTap index={2} />
			<Answer
			lines={[
				...content.balanced.steps.map((step, index) => <Step key={step} index={index} text={step} />),
				<Bubble key="example" fill="#F1F5F9">{content.deep.example}</Bubble>,
				<Bubble key="offer" fill={ORANGE} ink={WHITE}>{content.deep.offer}</Bubble>,
			]}
			at={0.3}
			/>
		</Close>
	</Stage>
);

const SAMPLE: z.input<typeof ThreeModesSchema> = {
	hook: {lines: ['Hızlı mı, derin mi?', 'Seç.'], narration: 'Hızlı mı, derin mi? Seç.'},
	question: 'Üslü sayılarda çarpma nasıl yapılır?',
	modes: ['Hızlı', 'Dengeli', 'Derin'],
	fast: {answer: 'Tabanlar aynıysa üsler toplanır.', narration: 'SinoAI’nin üç seviyesi var. Hızlı, tek cümle.'},
	balanced: {steps: ['Tabanların aynı olduğunu kontrol et.', 'Üsleri topla.', 'Tabanı yeni üsle yaz.'], narration: 'Dengeli, adım adım.'},
	deep: {example: 'Örnek: 2³ · 2⁴ = 2⁷ = 128', offer: 'Bu konudan 5 soruluk test ister misin?', narration: 'Derin, örneğiyle ve testiyle.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2), 1.8);
	const fast = say('fast', content.fast.narration, Math.max(beat(content.fast.narration, 4), 4), 3.8);
	const balanced = say('balanced', content.balanced.narration, Math.max(beat(content.balanced.narration, 2.8), 2.8), 2.6);
	const deep = say('deep', content.deep.narration, Math.max(beat(content.deep.narration, 3.6), 3.6), 3.4);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'fast', seconds: fast.seconds, label: 'Hızlı', voice: [fast], element: <FastScene content={content} />},
		{id: 'balanced', seconds: balanced.seconds, label: 'Dengeli', voice: [balanced], element: <BalancedScene content={content} />},
		{id: 'deep', seconds: deep.seconds, label: 'Derin', voice: [deep], element: <DeepScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const ThreeModes = defineTemplate({
	id: 'ThreeModes',
	category: 'Advertisements',
	title: 'Üç derinlik',
	description: 'SinoAI’nin yazma kutusunda tek plan: soru yazılır, parmak Hızlı, Dengeli ve Derin’e dokunur, sıvı gösterge uzayarak kayar, cevap tek cümleden adımlara, örneğe ve test önerisine büyür.',
	contentSchema: ThreeModesSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
