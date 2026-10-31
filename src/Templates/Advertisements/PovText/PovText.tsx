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
import {ease, PhoneShot, PromoStage, useCount, useLand, useSeconds} from '../PromoKit/PromoKit';
import {Morph, speedBlur, Tap, useSpringKeys, type Shape} from '../PromoKit/PromoMotion';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * The POV format (Kasım 2026, 22 Kasım): a big caption on top that lands word
 * by word, and under it the phone as the student sees it. The "finish the
 * exam" button is pressed and grows into the result card (one shape); then
 * quick push cuts from screen to screen: the missing topic, the plan, a test.
 * The caption changes at the end. The phone shows the real product screens;
 * the music is our own, not a trending sound.
 */

const narration = z.string().trim().min(1).max(170);
const screen = z.enum(PROMO_PHONE_SCREEN_NAMES);

const PovTextSchema = z.object({
	/** The caption's words, landing one by one; the first may be the written-only "POV:". */
	hook: z.object({words: z.array(plainText(12)).min(3).max(6), narration}),
	exam: z.object({screen, button: plainText(16)}),
	result: z.object({screen, title: plainText(24), net: z.number().min(0).max(120), change: plainText(8), narration}),
	/** The push cuts: each screen with the chip that names what happens on it. */
	cuts: z.object({steps: z.array(z.object({screen, chip: plainText(26)})).min(2).max(3), narration}),
	close: z.object({words: z.array(plainText(12)).min(3).max(7), screen, narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof PovTextSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';

/** The phone as held: centred under the caption. */
const PHONE = {x: 236, y: 360, w: 480};
const PILL: Shape = {x: 286, y: 1200, w: 380, h: 100, radius: 50, fill: ORANGE};
const CARD: Shape = {x: 36, y: 640, w: 560, h: 300, radius: 40, fill: WHITE};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(70% 55% at 50% 60%, #22324A 0%, ${NAVY} 65%, #050B14 100%)`}} />;

/** The caption: big white words with a dark edge, each landing on its own moment. */
const Caption: React.FC<{words: string[]; at: (index: number) => number}> = ({words, at}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<div style={{position: 'absolute', left: u(30), top: u(60), width: u(892), display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: u(22), rowGap: u(4)}}>
			{words.map((word, index) => {
				const t = seconds - at(index);
				const land = ease(Math.max(0, Math.min(1, t / 0.16)));
				return (
					<div key={`${word}-${index}`} style={{opacity: t < 0 ? 0 : 1, transform: `scale(${interpolate(land, [0, 1], [1.4, 1])})`, filter: land < 1 ? `blur(${u((1 - land) * 10)}px)` : undefined}}>
						<Text variant="display" size={88} weight={TYPE.weights.kinetic} color={index === 0 && word.startsWith('POV') ? ORANGE : WHITE} style={{lineHeight: 1.08, textShadow: `0 ${u(4)}px ${u(18)}px rgba(0,0,0,0.65)`}}>
							{word}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

/** The phone with a real screen; `x` slides it for the push cuts. */
const Phone: React.FC<{name: Content['exam']['screen']; x?: number; blur?: number}> = ({name, x = PHONE.x, blur = 0}) => {
	const {u} = useVideoLayout();
	const Screen = PROMO_PHONE_SCREENS[name];
	return (
		<div style={{position: 'absolute', left: u(x), top: u(PHONE.y), width: u(PHONE.w), transform: 'rotate(-1.5deg)', filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(0,0,0,0.55))${blur > 0.4 ? ` blur(${u(blur)}px)` : ''}`}}>
			<PhoneShot width={PHONE.w}>
				<Screen />
			</PhoneShot>
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

/** The words land quickly, within the first second and a half. */
const wordAt = (count: number) => (index: number) => index * Math.min(0.28, 1.3 / count);

const PillFace: React.FC<{text: string}> = ({text}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u(14)}}>
			<Icon name="check" size={u(40)} color={WHITE} stroke={3} />
			<Text size={42} weight={TYPE.weights.kinetic} color={WHITE}>
				{text}
			</Text>
		</div>
	);
};

const HookScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const tapAt = Math.min(total - 0.35, 1.6);
	return (
		<Stage>
			<Phone name={content.exam.screen} />
			<Morph keys={[{at: 0, to: PILL}]} sound={null} shadow="0 30px 60px -20px rgba(234,88,12,0.6)" render={() => <PillFace text={content.exam.button} />} />
			<Caption words={content.hook.words} at={wordAt(content.hook.words.length)} />
			{content.hook.words.map((word, index) => <SoundEffect key={`${word}-${index}`} id={index === content.hook.words.length - 1 ? 'impact' : 'pop'} atSeconds={wordAt(content.hook.words.length)(index)} volume={index === content.hook.words.length - 1 ? 0.8 : 0.45} />)}
			<Tap x={PILL.x + PILL.w / 2} y={PILL.y + PILL.h / 2} at={tapAt} color="rgba(255,255,255,0.55)" />
		</Stage>
	);
};

const ResultScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const net = useCount(content.result.net, 0.3, 1.1, 1);
	const screenIn = useLand(0.05, 160, 22);
	return (
		<Stage>
			<Caption words={content.hook.words} at={() => -1} />
			<div style={{opacity: 1}}>
				<Phone name={content.result.screen} />
			</div>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - screenIn}}>
				<Phone name={content.exam.screen} />
			</div>
			{/* The button grows into the result card. */}
			<Morph
				keys={[
					{at: 0, to: PILL},
					{at: 0.05, to: CARD},
				]}
				shadow="0 40px 80px -30px rgba(0,0,0,0.6)"
				render={(index) =>
					index === 0 ? (
						<PillFace text={content.exam.button} />
					) : (
						<div style={{position: 'absolute', inset: 0, padding: u(34), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(8)}}>
							<Text size={32} weight={TYPE.weights.display} color="#64748B">
								{content.result.title}
							</Text>
							<div style={{display: 'flex', alignItems: 'baseline', gap: u(14)}}>
								<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={NAVY} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
									{net}
								</Text>
								<Text size={44} weight={TYPE.weights.kinetic} color={NAVY}>
									net
								</Text>
							</div>
							<div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: u(8), padding: `${u(8)}px ${u(18)}px`, borderRadius: u(999), background: '#DCFCE7'}}>
								<Icon name="trend" size={u(30)} color="#15803D" stroke={2.6} />
								<Text size={32} weight={TYPE.weights.kinetic} color="#15803D">
									{content.result.change}
								</Text>
							</div>
						</div>
					)
				}
			/>
			<SoundEffect id="impact" atSeconds={0.05} volume={0.7} />
		</Stage>
	);
};

const CutsScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const steps = content.cuts.steps;
	const span = Math.min(1.1, (total - 0.3) / steps.length);
	const cutAt = (index: number) => 0.05 + index * span;
	// One push per step: the next screen shoves the last one off to the left.
	const position = useSpringKeys(
		steps.map((_, index) => ({at: index === 0 ? 0 : cutAt(index), to: index})),
		220,
	);
	const current = steps.reduce((last, _, index) => (seconds >= cutAt(index) ? index : last), 0);
	const chip = useLand(cutAt(current) + 0.12, 200, 20);
	return (
		<Stage>
			<Caption words={content.hook.words} at={() => -1} />
			{steps.map((step, index) => {
				const offset = index - position.value;
				if (Math.abs(offset) > 1.2) return null;
				return <Phone key={`${step.screen}-${index}`} name={step.screen} x={PHONE.x + offset * 640} blur={speedBlur(position.speed * 640, 0.004, 14)} />;
			})}
			<div style={{position: 'absolute', left: u(60), top: u(1150), display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(18)}px ${u(30)}px`, borderRadius: u(999), background: current === steps.length - 1 ? ORANGE : WHITE, opacity: chip, transform: `translateY(${(1 - chip) * u(40)}px)`, boxShadow: `0 ${u(20)}px ${u(40)}px -${u(16)}px rgba(0,0,0,0.6)`}}>
				<Icon name={['alert', 'calendar', 'quiz'][current] as 'alert'} size={u(36)} color={current === steps.length - 1 ? WHITE : ORANGE} stroke={2.6} />
				<Text size={40} weight={TYPE.weights.kinetic} color={current === steps.length - 1 ? WHITE : NAVY}>
					{steps[current].chip}
				</Text>
			</div>
			{steps.map((_, index) => (index === 0 ? null : <SoundEffect key={index} id="transitionWhoosh" atSeconds={cutAt(index)} volume={0.7} />))}
			{steps.map((_, index) => <SoundEffect key={`chip-${index}`} id="pop" atSeconds={cutAt(index) + 0.12} volume={0.6} />)}
		</Stage>
	);
};

const CloseScene: React.FC<{content: Content}> = ({content}) => {
	const at = (index: number) => 0.1 + index * 0.2;
	return (
		<Stage>
			<Phone name={content.close.screen} />
			<Caption words={content.close.words} at={at} />
			{content.close.words.map((word, index) => <SoundEffect key={`${word}-${index}`} id={index === content.close.words.length - 1 ? 'success' : 'pop'} atSeconds={at(index)} volume={0.45} />)}
		</Stage>
	);
};

const SAMPLE: z.input<typeof PovTextSchema> = {
	hook: {words: ['POV:', 'Deneme', 'bitti,', 'planın', 'hazır.'], narration: 'Deneme bitti, planın hazır.'},
	exam: {screen: 'testSolve', button: 'Sınavı bitir'},
	result: {screen: 'examResult', title: 'TYT Deneme 3', net: 78.5, change: '+6,5', narration: 'Sonucu aç, eksik konunu gör,'},
	cuts: {
		steps: [
			{screen: 'examAnalysis', chip: 'Eksik: Fonksiyonlar'},
			{screen: 'planToday', chip: 'Plana eklendi'},
			{screen: 'testsHome', chip: 'Test · 20 soru'},
		],
		narration: 'planına ekle.',
	},
	close: {words: ['POV:', 'Artık', 'deneme', 'sonrası', 'panik', 'yok.'], screen: 'planToday', narration: 'Artık deneme sonrası panik yok.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, Math.max(beat(content.hook.narration, 2.4), 2.4), 2.4);
	const result = say('result', content.result.narration, Math.max(beat(content.result.narration, 3), 3), 3);
	const cuts = say('cuts', content.cuts.narration, Math.max(beat(content.cuts.narration, 3.4), 3.4), 3.4);
	const close = say('close', content.close.narration, Math.max(beat(content.close.narration, 3), 3), 3);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} seconds={hook.seconds} />},
		{id: 'result', seconds: result.seconds, label: 'Sonuç', voice: [result], element: <ResultScene content={content} />},
		{id: 'cuts', seconds: cuts.seconds, label: 'Kesmeler', voice: [cuts], element: <CutsScene content={content} seconds={cuts.seconds} />},
		{id: 'close', seconds: close.seconds, label: 'Kapanış', voice: [close], element: <CloseScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const PovText = defineTemplate({
	id: 'PovText',
	category: 'Advertisements',
	title: 'POV: deneme bitti',
	description: 'POV biçimi: üstte kelime kelime inen büyük yazı, altta öğrencinin gözünden telefon. “Sınavı bitir” düğmesine basılır ve düğme sonuç kartına dönüşür; sonra itme kesmeleriyle eksik konu, plan, test. Üst yazı sonda değişir.',
	contentSchema: PovTextSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 10, max: 22},
	buildScenes,
});
