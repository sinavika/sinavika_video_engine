import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {useBeat} from '../../../Scenes/Rhythm';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, useSeconds} from '../PromoKit/PromoKit';
import {Tap, useSpringKeys} from '../PromoKit/PromoMotion';

/**
 * One evening, two students, one split screen (Kasım 2026, 8 Kasım). The same
 * clock runs over both halves from 18.00 to 21.00. On the left a new tab opens
 * on every beat and the page stays empty; on the right a fingertip ticks off
 * the day's plan, one task every two beats. Then the divider slides away and
 * the planned evening takes the whole screen. Cuts and ticks land on the beat.
 */

const narration = z.string().trim().min(1).max(170);

const SplitDaySchema = z.object({
	hook: z.object({lines: z.tuple([plainText(24), plainText(24)]), narration}),
	clock: z.object({from: plainText(5), to: plainText(5)}),
	left: z.object({label: plainText(18), tabs: z.array(plainText(24)).min(4).max(10), search: plainText(24), result: plainText(24)}),
	right: z.object({label: plainText(18), tasks: z.array(z.object({title: plainText(24), meta: plainText(20)})).min(2).max(4), result: plainText(24)}),
	evening: z.object({narration}),
	result: z.object({narration}),
	close: z.object({line: plainText(40), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof SplitDaySchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const GREYED = '#CBD5E1';
const PLAN = MODULES.studyPlan.color.light;
const HALF = 476;

/** Where canvas x falls in the frame, in pixels: the halves are painted full-bleed behind the canvas. */
const useFrameX = () => {
	const {u, contentWidth, contentHeight, safeArea} = useVideoLayout();
	const scale = Math.min(contentWidth / u(952), contentHeight / u(1530));
	const left = safeArea.left + (contentWidth - u(952) * scale) / 2;
	return (x: number) => left + u(x) * scale;
};

/** The two grounds, full-bleed: grey and tired on the left, white and calm on the right, split at `split` (canvas x). */
const Halves: React.FC<{split: number}> = ({split}) => {
	const {u} = useVideoLayout();
	const at = useFrameX()(split);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: at, background: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)'}} />
			<div style={{position: 'absolute', left: at, top: 0, bottom: 0, right: 0, background: WHITE}} />
			<div style={{position: 'absolute', left: at - u(3), top: 0, bottom: 0, width: u(6), background: NAVY}} />
		</AbsoluteFill>
	);
};

/** The shared clock at the top, running between two times over the scene. */
const Clock: React.FC<{time: string}> = ({time}) => {
	const {u} = useVideoLayout();
	return (
		<At y={40} w={952}>
			<div style={{display: 'flex', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(14)}px ${u(30)}px`, borderRadius: u(999), background: NAVY}}>
					<Icon name="clock" size={u(38)} color={WHITE} stroke={2.4} />
					<Text variant="display" size={50} weight={TYPE.weights.kinetic} color={WHITE} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{time}
					</Text>
				</div>
			</div>
		</At>
	);
};

const minutesOf = (time: string) => {
	const [hours, minutes] = time.split(/[.:]/).map(Number);
	return hours * 60 + (minutes || 0);
};
const timeOf = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}.${String(Math.floor(minutes % 60)).padStart(2, '0')}`;

/** The left half: a search box and tabs piling up, one per beat (`count`). */
const LeftEvening: React.FC<{content: Content; count: number; dim?: number}> = ({content, count, dim = 0}) => {
	const {u} = useVideoLayout();
	const tabs = content.left.tabs.slice(0, count);
	return (
		<div style={{opacity: 1 - dim}}>
			<At x={28} y={180} w={HALF - 56}>
				<Text size={34} weight={TYPE.weights.display} color="#475569">
					{content.left.label}
				</Text>
			</At>
			<At x={28} y={250} w={HALF - 56}>
				<div style={{padding: `${u(18)}px ${u(20)}px`, borderRadius: u(22), background: WHITE, border: `${u(2)}px solid ${GREYED}`, display: 'flex', alignItems: 'center', gap: u(12)}}>
					<Icon name="search" size={u(30)} color="#64748B" stroke={2.2} />
					<Text size={30} weight={TYPE.weights.strong} color="#64748B">
						{content.left.search}
					</Text>
				</div>
			</At>
			{tabs.map((tab, index) => (
				<At key={index} x={28 + (index % 2) * 18} y={380 + index * 92} w={HALF - 80}>
					<div style={{transform: `rotate(${(index % 3) - 1}deg)`, padding: `${u(16)}px ${u(18)}px`, borderRadius: u(16), background: '#F8FAFC', boxShadow: `0 ${u(8)}px ${u(16)}px rgba(15,23,42,0.12)`, display: 'flex', alignItems: 'center', gap: u(10)}}>
						<div style={{width: u(22), height: u(22), borderRadius: u(6), background: GREYED, flexShrink: 0}} />
						<Text size={28} weight={TYPE.weights.strong} color="#475569" style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
							{tab}
						</Text>
					</div>
				</At>
			))}
		</div>
	);
};

/** The right half: the day's plan, the first `done` tasks ticked. */
const RightEvening: React.FC<{content: Content; done: number; x?: number; width?: number}> = ({content, done, x = HALF + 26, width = HALF - 52}) => {
	const {u} = useVideoLayout();
	return (
		<>
			<At x={x} y={180} w={width}>
				<Text size={34} weight={TYPE.weights.display} color={PLAN}>
					{content.right.label}
				</Text>
			</At>
			{content.right.tasks.map((task, index) => {
				const ticked = index < done;
				return (
					<At key={task.title} x={x} y={260 + index * 150} w={width}>
						<div style={{padding: `${u(20)}px ${u(20)}px`, borderRadius: u(24), background: ticked ? `${PLAN}14` : WHITE, border: `${u(3)}px solid ${ticked ? PLAN : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: u(16)}}>
							<div style={{width: u(44), height: u(44), borderRadius: u(12), background: ticked ? PLAN : WHITE, border: ticked ? 'none' : `${u(4)}px solid ${PLAN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box'}}>
								{ticked ? <Icon name="check" size={u(30)} color={WHITE} stroke={3} /> : null}
							</div>
							<div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
								<Text size={30} weight={TYPE.weights.display} color={NAVY} style={{textDecoration: ticked ? 'line-through' : 'none'}}>
									{task.title}
								</Text>
								<Text size={24} weight={TYPE.weights.strong} color="#64748B">
									{task.meta}
								</Text>
							</div>
						</div>
					</At>
				);
			})}
		</>
	);
};

const Stage: React.FC<{split: number; children: React.ReactNode}> = ({split, children}) => (
	<PromoStage ground={<Halves split={split} />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	// The divider comes in from the right edge and settles in the middle: the screen splits as the hook lands.
	const split = useSpringKeys([
		{at: 0, to: 952},
		{at: 0.05, to: HALF},
	]);
	return (
		<Stage split={split.value}>
			<Clock time={content.clock.from} />
			<SoundEffect id="transitionWhoosh" atSeconds={0.05} />
			<At x={86} y={560} w={780}>
				<div style={{padding: `${u(40)}px 0 ${u(46)}px`, borderRadius: u(40), background: WHITE, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(24)}px rgba(15,23,42,0.35)`}}>
					<Slam text={content.hook.lines[0]} at={0.05} size={TYPE.adScale.headline} color={NAVY} />
					<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
				</div>
			</At>
		</Stage>
	);
};

/** The evening runs: the clock moves from `from` to `to` across the scene; tabs open on beats, tasks are ticked every two. */
const EveningScene: React.FC<{content: Content; seconds: number; toShare: number}> = ({content, seconds: total, toShare}) => {
	const seconds = useSeconds();
	const beat = useBeat();
	const share = interpolate(seconds, [0, total], [0, toShare], CLAMP);
	const minutes = interpolate(share, [0, 1], [minutesOf(content.clock.from), minutesOf(content.clock.to)]);
	// One new tab on every beat; one task ticked on every second beat, each by a tap on its box.
	const tabs = Math.min(content.left.tabs.length, beat.index + 1);
	const done = Math.min(content.right.tasks.length, Math.floor((beat.index + 1) / 2));
	return (
		<Stage split={HALF}>
			<Clock time={timeOf(minutes)} />
			<LeftEvening content={content} count={tabs} />
			<RightEvening content={content} done={done} />
			{content.right.tasks.map((task, index) => (
				<React.Fragment key={task.title}>
					<Tap x={HALF + 26 + 42} y={260 + index * 150 + 44} at={beat.at(2 * index + 1)} />
					<SoundEffect id="success" atSeconds={beat.at(2 * index + 1) + 0.05} volume={0.55} />
				</React.Fragment>
			))}
			{/* A soft pop for each new tab on the left, on its beat. */}
			{content.left.tabs.map((tab, index) => (index > 0 && beat.at(index) < total ? <SoundEffect key={tab} id="pop" atSeconds={beat.at(index)} volume={0.45} /> : null))}
		</Stage>
	);
};

const ResultScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const show = ease(interpolate(seconds, [0.1, 0.4], [0, 1], CLAMP));
	const badge = (text: string, ink: string, fill: string) => (
		<div style={{display: 'inline-flex', padding: `${u(16)}px ${u(24)}px`, borderRadius: u(999), background: fill, opacity: show, transform: `scale(${interpolate(show, [0, 1], [0.8, 1])})`}}>
			<Text size={32} weight={TYPE.weights.kinetic} color={ink}>
				{text}
			</Text>
		</div>
	);
	return (
		<Stage split={HALF}>
			<Clock time={content.clock.to} />
			<LeftEvening content={content} count={content.left.tabs.length} dim={0.35} />
			<RightEvening content={content} done={content.right.tasks.length} />
			<SoundEffect id="pop" atSeconds={0.1} />
			<At x={28} y={1240} w={HALF - 56}>
				{badge(content.left.result, '#475569', WHITE)}
			</At>
			<At x={HALF + 26} y={1240} w={HALF - 52}>
				{badge(content.right.result, WHITE, PLAN)}
			</At>
		</Stage>
	);
};

const CloseScene: React.FC<{content: Content}> = ({content}) => {
	const split = useSpringKeys([
		{at: 0, to: HALF},
		{at: 0.15, to: -220},
	]);
	const line = ease(interpolate(useSeconds(), [0.5, 0.9], [0, 1], CLAMP));
	return (
		<Stage split={split.value}>
			<Clock time={content.clock.to} />
			<SoundEffect id="transitionWhoosh" atSeconds={0.15} />
			<RightEvening content={content} done={content.right.tasks.length} x={Math.max(26, split.value + 26)} width={Math.min(900, 952 - Math.max(0, split.value) - 52)} />
			<At y={1050} w={952}>
				<div style={{opacity: line, transform: `translateY(${(1 - line) * 30}px)`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={NAVY} align="center">
						{content.close.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof SplitDaySchema> = {
	hook: {lines: ['Aynı sınav,', 'iki farklı akşam.'], narration: 'Aynı sınav, iki farklı akşam.'},
	clock: {from: '18.00', to: '21.00'},
	left: {label: 'Planı yok', tabs: ['TYT nasıl çalışılır', 'Paragraf taktikleri', 'Hangi kaynak?', 'Motivasyon videosu', 'ne çalışsam', 'Deneme önerisi', 'Konu listesi', 'Yine paragraf'], search: 'ne çalışsam…', result: '0 görev'},
	right: {label: 'Planı hazır', tasks: [{title: 'Paragraf · ana fikir', meta: 'Mikro ders · 25 dk'}, {title: 'Problemler', meta: 'Test · 20 soru'}, {title: 'Kimya · mol', meta: 'Bilgi Kartları · 20'}], result: '3 görev · 1 test'},
	evening: {narration: 'İkisi de üç saat masada.'},
	result: {narration: 'Biri ne çalışacağını aradı, öbürü planını açtı.'},
	close: {line: 'Fark saatte değil, planda.', narration: 'Fark çalışma saatinde değil, planda.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.2), 2);
	const evening = say('evening', content.evening.narration, Math.max(beat(content.evening.narration, 3.6), 3.6), 3.4);
	const result = say('result', content.result.narration, Math.max(beat(content.result.narration, 4), 4), 3.8);
	const close = say('close', content.close.narration, Math.max(beat(content.close.narration, 3.4), 3.4), 3.2);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'evening', seconds: evening.seconds, label: 'Akşam', voice: [evening], element: <EveningScene content={content} seconds={evening.seconds} toShare={0.7} />},
		{id: 'result', seconds: result.seconds, label: 'Sonuç', voice: [result], element: <ResultScene content={content} />},
		{id: 'close', seconds: close.seconds, label: 'Kapanış', voice: [close], element: <CloseScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const SplitDay = defineTemplate({
	id: 'SplitDay',
	category: 'Advertisements',
	title: 'Bölünmüş akşam',
	description: 'Ekran ikiye bölünür, ortak saat 18.00’den 21.00’e akar: solda her vuruşta yeni sekme açılır, sağda parmak planın görevlerini işaretler; sonunda bölme kayar ve planlı akşam ekranı alır.',
	contentSchema: SplitDaySchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
