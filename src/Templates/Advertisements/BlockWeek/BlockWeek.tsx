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
import {At, CLAMP, ease, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {Morph, type Shape} from '../PromoKit/PromoMotion';

/**
 * Will it fit this week? (Kasım 2026, 25 Kasım). Falling blocks, no game's
 * look copied: lesson blocks drop on the beat into one day's column and pile
 * up until it overflows and warns. Then Ders Planı takes over: the one column
 * splits into the seven days and every block turns, shrinks and drops into
 * its day; full days light up one by one. Block by block, day by day.
 */

const narration = z.string().trim().min(1).max(170);
const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as const;

const BlockWeekSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	day: plainText(14),
	/** The week's tasks: the first ones are the pile; each goes to its `day` (0 = Monday). */
	tasks: z.array(z.object({title: plainText(16), short: plainText(12), minutes: z.number().int().min(15).max(90), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), day: z.number().int().min(0).max(6)})).min(8).max(14),
	pile: z.object({count: z.number().int().min(3).max(8), warning: plainText(16), narration}),
	plan: z.object({narration}),
	week: z.object({line: plainText(22), summary: plainText(32), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof BlockWeekSchema>;
type Task = Content['tasks'][number];

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const RED = '#EF4444';
const PLAN = MODULES.studyPlan.color.light;

/** The one day the blocks are piled on. */
const COLUMN: Shape = {x: 266, y: 420, w: 420, h: 900, radius: 26, fill: 'rgba(255,255,255,0.06)'};
const BIG_SCALE = 4;
/** The week: seven columns of the same height. */
const DAY_W = 118;
const DAY_GAP = 12;
const dayColumn = (day: number): Shape => ({x: 27 + day * (DAY_W + DAY_GAP), y: 420, w: DAY_W, h: 600, radius: 20, fill: 'rgba(255,255,255,0.06)'});
const SMALL_SCALE = 3.2;

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(80% 60% at 50% 45%, #15325A 0%, ${NAVY} 70%)`}}>
		<AbsoluteFill style={{opacity: 0.08, backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
	</AbsoluteFill>
);

/** One block: a bevelled tile in the lesson's colour with its name and minutes. */
const Block: React.FC<{task: Task; x: number; y: number; w: number; h: number; rotate?: number; small?: boolean; glow?: number}> = ({task, x, y, w, h, rotate = 0, small, glow = 0}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(x), top: u(y), width: u(w), height: u(h), transform: `rotate(${rotate}deg)`, borderRadius: u(small ? 12 : 18), background: task.color, boxShadow: `inset 0 ${u(-8)}px 0 rgba(0,0,0,0.22), inset 0 ${u(6)}px 0 rgba(255,255,255,0.25)${glow > 0 ? `, 0 0 ${u(30 * glow)}px ${u(6 * glow)}px rgba(255,255,255,${0.5 * glow})` : ''}`, display: 'flex', flexDirection: small ? 'column' : 'row', alignItems: 'center', justifyContent: small ? 'center' : 'space-between', padding: small ? 0 : `0 ${u(26)}px`, boxSizing: 'border-box', overflow: 'hidden'}}>
			<Text size={small ? 21 : 40} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{lineHeight: 1.05}}>
				{small ? task.short : task.title}
			</Text>
			<Text size={small ? 20 : 34} weight={TYPE.weights.display} color="rgba(255,255,255,0.88)">
				{`${task.minutes} dk`}
			</Text>
		</div>
	);
};

/** Where each block sits in the pile: from the column's floor upwards. */
const pileSlots = (tasks: Task[]) => {
	let top = COLUMN.y + COLUMN.h;
	return tasks.map((task) => {
		const h = task.minutes * BIG_SCALE;
		top -= h + 6;
		return {x: COLUMN.x + 10, y: top, w: COLUMN.w - 20, h};
	});
};

/** Where each block sits in its day: stacked from the day's floor. */
const daySlots = (tasks: Task[]) => {
	const floors = DAYS.map((_, day) => dayColumn(day).y + dayColumn(day).h - 4);
	return tasks.map((task) => {
		const column = dayColumn(task.day);
		const h = task.minutes * SMALL_SCALE;
		floors[task.day] -= h + 6;
		return {x: column.x + 4, y: floors[task.day], w: column.w - 8, h};
	});
};

const DayLabel: React.FC<{text: string; x: number; w: number; done?: number}> = ({text, x, w, done = 0}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(x), top: u(340), width: u(w), display: 'flex', justifyContent: 'center', alignItems: 'center', gap: u(6)}}>
			<Text size={30} weight={TYPE.weights.kinetic} color={done > 0.5 ? PLAN : 'rgba(255,255,255,0.8)'}>
				{text}
			</Text>
			{done > 0 ? <div style={{transform: `scale(${done})`}}><Icon name="checkCircle" size={u(28)} color={PLAN} stroke={2.6} /></div> : null}
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

/** A block falling to its slot, landing at `at` (it starts above the frame 0.35 s before). */
const fall = (seconds: number, at: number, slotY: number) => {
	const t = ease(interpolate(seconds, [at - 0.35, at], [0, 1], CLAMP));
	return {y: interpolate(t, [0, 1], [-260, slotY]), shown: seconds >= at - 0.35};
};

const OneColumn: React.FC<{content: Content; warn?: number}> = ({content, warn = 0}) => {
	const {u} = useVideoLayout();
	return (
		<>
			<div style={{position: 'absolute', left: u(COLUMN.x), top: u(COLUMN.y), width: u(COLUMN.w), height: u(COLUMN.h), borderRadius: u(COLUMN.radius), background: COLUMN.fill, border: `${u(4)}px solid ${warn > 0 ? `rgba(239,68,68,${0.4 + warn * 0.6})` : 'rgba(255,255,255,0.18)'}`, boxSizing: 'border-box'}} />
			<DayLabel text={content.day} x={COLUMN.x} w={COLUMN.w} />
		</>
	);
};

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const slots = pileSlots(content.tasks.slice(0, content.pile.count));
	const landAt = 0.7;
	const first = fall(seconds, landAt, slots[0].y);
	return (
		<Stage>
			<OneColumn content={content} />
			{first.shown ? <Block task={content.tasks[0]} {...slots[0]} y={first.y} /> : null}
			<SoundEffect id="blockDrop" atSeconds={landAt} />
			<At y={70} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
			</At>
			<At y={175} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
			</At>
		</Stage>
	);
};

const PileScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const beat = useBeat();
	const pile = content.tasks.slice(0, content.pile.count);
	const slots = pileSlots(pile);
	// One block on every beat, faster than the last scene; the first one is already down.
	const step = Math.min(beat.interval, (total - 0.8) / Math.max(1, pile.length - 1));
	const landAt = (index: number) => (index === 0 ? -1 : 0.15 + (index - 1) * step);
	const overflowIndex = slots.findIndex((slot) => slot.y < COLUMN.y);
	const warnAt = overflowIndex < 0 ? total : landAt(overflowIndex);
	const warn = seconds >= warnAt ? (Math.sin((seconds - warnAt) * 14) + 1) / 2 : 0;
	return (
		<Stage>
			<OneColumn content={content} warn={warn} />
			{pile.map((task, index) => {
				const drop = fall(seconds, landAt(index), slots[index].y);
				if (!drop.shown && index > 0) return null;
				// The blocks over the top lean as if they would slide off.
				const over = slots[index].y < COLUMN.y ? (index % 2 ? 6 : -6) * ease(interpolate(seconds, [landAt(index), landAt(index) + 0.3], [0, 1], CLAMP)) : 0;
				return <Block key={task.title} task={task} {...slots[index]} y={index === 0 ? slots[0].y : drop.y} rotate={over} />;
			})}
			{pile.map((task, index) => (index === 0 ? null : <SoundEffect key={task.title} id="blockDrop" atSeconds={landAt(index)} />))}
			{seconds >= warnAt ? (
				<At y={110} w={952}>
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: RED}}>
							<Icon name="alert" size={u(36)} color={WHITE} stroke={2.6} />
							<Text size={40} weight={TYPE.weights.kinetic} color={WHITE}>
								{content.pile.warning}
							</Text>
						</div>
					</div>
				</At>
			) : null}
			<SoundEffect id="warning" atSeconds={warnAt} />
		</Stage>
	);
};

const PlanScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	const pileCount = content.pile.count;
	const from = pileSlots(content.tasks.slice(0, pileCount));
	const to = daySlots(content.tasks);
	// The one column opens into seven; the piled blocks turn and shrink into their days, then the rest drop in.
	const splitAt = 0.1;
	const moveAt = (index: number) => 0.35 + index * Math.min(0.14, (total - 1.6) / content.tasks.length);
	const lastLanding = moveAt(content.tasks.length - 1) + 0.45;
	const doneAt = (day: number) => lastLanding + day * 0.12;
	return (
		<Stage>
			{DAYS.map((day, index) => (
				<React.Fragment key={day}>
					<Morph keys={[{at: 0, to: COLUMN}, {at: splitAt, to: dayColumn(index)}]} sound={index === 0 ? 'morph' : null} render={() => null} />
					<DayLabel text={day} x={dayColumn(index).x} w={DAY_W} done={ease(interpolate(seconds, [doneAt(index), doneAt(index) + 0.25], [0, 1], CLAMP))} />
				</React.Fragment>
			))}
			{content.tasks.map((task, index) => {
				const t = ease(interpolate(seconds, [moveAt(index), moveAt(index) + 0.45], [0, 1], CLAMP));
				const start = index < pileCount ? from[index] : {...to[index], y: -200};
				if (index >= pileCount && seconds < moveAt(index)) return null;
				const glow = interpolate(seconds, [doneAt(task.day), doneAt(task.day) + 0.2, doneAt(task.day) + 0.6], [0, 1, 0], CLAMP);
				return (
					<Block
						key={task.title}
						task={task}
						x={interpolate(t, [0, 1], [start.x, to[index].x])}
						y={interpolate(t, [0, 1], [start.y, to[index].y])}
						w={interpolate(t, [0, 1], [start.w, to[index].w])}
						h={interpolate(t, [0, 1], [start.h, to[index].h])}
						rotate={index < pileCount ? Math.sin(t * Math.PI) * 90 : 0}
						small={t > 0.5}
						glow={glow}
					/>
				);
			})}
			{content.tasks.map((task, index) => <SoundEffect key={task.title} id="blockDrop" atSeconds={moveAt(index) + 0.45} volume={0.45} />)}
			<SoundEffect id="lineClear" atSeconds={lastLanding} />
		</Stage>
	);
};

const WeekScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const slots = daySlots(content.tasks);
	const chip = useLand(0.3, 170, 20);
	const line = useLand(0.05, 150, 20);
	return (
		<Stage>
			{DAYS.map((day, index) => {
				const column = dayColumn(index);
				return (
					<React.Fragment key={day}>
						<div style={{position: 'absolute', left: u(column.x), top: u(column.y), width: u(column.w), height: u(column.h), borderRadius: u(column.radius), background: column.fill}} />
						<DayLabel text={day} x={column.x} w={DAY_W} done={1} />
					</React.Fragment>
				);
			})}
			{content.tasks.map((task, index) => <Block key={task.title} task={task} {...slots[index]} small />)}
			<At y={120} w={952}>
				<div style={{opacity: Math.min(1, line * 1.5), transform: `scale(${interpolate(line, [0, 1], [1.12, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.week.line}
					</Text>
				</div>
			</At>
			<At y={1220} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: chip, transform: `translateY(${(1 - chip) * u(30)}px)`}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(18)}px ${u(32)}px`, borderRadius: u(999), background: PLAN}}>
						<Icon name="calendar" size={u(38)} color={WHITE} stroke={2.4} />
						<Text size={40} weight={TYPE.weights.kinetic} color={WHITE}>
							{content.week.summary}
						</Text>
					</div>
				</div>
			</At>
			<SoundEffect id="success" atSeconds={0.3} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof BlockWeekSchema> = {
	hook: {lines: ['Bu haftaya', 'kaç konu sığar?'], narration: 'Bu haftaya kaç konu sığar?'},
	day: 'Pazartesi',
	tasks: [
		{title: 'Paragraf', short: 'Paragraf', minutes: 30, color: '#F59E0B', day: 0},
		{title: 'Fonksiyonlar', short: 'Fonksiyon', minutes: 45, color: '#3B82F6', day: 0},
		{title: 'Mol kavramı', short: 'Mol', minutes: 30, color: '#10B981', day: 1},
		{title: 'Hücre', short: 'Hücre', minutes: 45, color: '#22C55E', day: 1},
		{title: 'Problemler', short: 'Problem', minutes: 60, color: '#6366F1', day: 2},
		{title: 'Tarih', short: 'Tarih', minutes: 30, color: '#EF4444', day: 2},
		{title: 'Geometri', short: 'Geometri', minutes: 45, color: '#06B6D4', day: 3},
		{title: 'Dil bilgisi', short: 'Dil bilgisi', minutes: 30, color: '#F97316', day: 3},
		{title: 'Fizik', short: 'Fizik', minutes: 45, color: '#8B5CF6', day: 4},
		{title: 'Coğrafya', short: 'Coğrafya', minutes: 30, color: '#84CC16', day: 4},
		{title: 'Olasılık', short: 'Olasılık', minutes: 30, color: '#0EA5E9', day: 5},
		{title: 'Deneme', short: 'Deneme', minutes: 90, color: '#EC4899', day: 6},
	],
	pile: {count: 7, warning: 'Taşıyor!', narration: 'Hepsini aynı güne yığarsan taşar.'},
	plan: {narration: 'Ders Planı konuları günlere böler, her güne yetecek kadar görev koyar.'},
	week: {line: 'Blok blok, gün gün.', summary: '7 gün · 12 görev · taşma yok', narration: 'Blok blok, gün gün.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const pile = say('pile', content.pile.narration, Math.max(beat(content.pile.narration, 3), 3), 3);
	const plan = say('plan', content.plan.narration, Math.max(beat(content.plan.narration, 4.2), 4.2), 4.2);
	const week = say('week', content.week.narration, Math.max(beat(content.week.narration, 2.4), 2.4), 2.4);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'pile', seconds: pile.seconds, label: 'Yığın', voice: [pile], element: <PileScene content={content} seconds={pile.seconds} />},
		{id: 'plan', seconds: plan.seconds, label: 'Ders Planı', voice: [plan], element: <PlanScene content={content} seconds={plan.seconds} />},
		{id: 'week', seconds: week.seconds, label: 'Hafta', voice: [week], element: <WeekScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const BlockWeek = defineTemplate({
	id: 'BlockWeek',
	category: 'Advertisements',
	title: 'Haftana sığar',
	description: 'Düşen bloklar (bir oyunun görünüşü kopyalanmaz): ders blokları vuruşta tek günün sütununa düşer, yığılır, taşar ve uyarır. Ders Planı devreye girer: sütun yedi güne ayrılır, bloklar dönüp küçülerek günlerine oturur, dolan günler sırayla yanar. Blok blok, gün gün.',
	contentSchema: BlockWeekSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
