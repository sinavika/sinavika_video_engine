import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate, interpolateColors} from 'remotion';
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
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, type Shape} from '../PromoKit/PromoMotion';

/**
 * The missing piece (Kasım 2026, 18 Kasım). A jigsaw of the lesson's topics,
 * thick pieces with shadows, is whole but for one hole. The camera dives into
 * the hole and comes out on the exam result, where that topic is the one
 * missed; its row becomes today's study-plan task, the task shrinks into the
 * piece, and the piece snaps into the hole. The puzzle lights up piece by
 * piece and the net line rises (marked as an example, not a promise).
 */

const narration = z.string().trim().min(1).max(170);
const COLS = 4;
const ROWS = 5;

const PuzzleGapSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	/** The topics on the pieces, row by row (4 × 5); `gap` is the missing one. */
	topics: z.array(plainText(13)).length(COLS * ROWS),
	gap: z.number().int().min(0).max(COLS * ROWS - 1),
	find: z.object({title: plainText(28), rows: z.array(z.object({topic: plainText(16), score: plainText(5)})).min(3).max(5), badge: plainText(14), narration}),
	plan: z.object({kicker: plainText(20), meta: plainText(30), narration}),
	snap: z.object({from: z.number().min(0).max(120), to: z.number().min(0).max(120), label: plainText(22), example: plainText(18), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof PuzzleGapSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const PLAN = MODULES.studyPlan.color.light;
const EXAM = MODULES.exam.color.light;
/** The pieces before the puzzle is whole, and after. */
const DIM = ['#1E3A5F', '#24476F', '#1B3354'];
const LIT = ['#F8FAFC', '#E2E8F0', '#F1F5F9'];

/** The board on the canvas: 4 × 5 cells of 200 px. */
const BOARD = {x: 76, y: 360, cell: 200};
const cellOf = (index: number) => ({col: index % COLS, row: Math.floor(index / COLS)});
const cellCentre = (index: number) => {
	const {col, row} = cellOf(index);
	return {x: BOARD.x + (col + 0.5) * BOARD.cell, y: BOARD.y + (row + 0.5) * BOARD.cell};
};

/** Which way each inner edge's tab points (+1: out of the piece above / to the left). Fixed, so every frame agrees. */
const across = (row: number, col: number) => ((row * 7 + col * 3) % 2 ? 1 : -1);
const down = (row: number, col: number) => ((row * 5 + col * 11 + 1) % 2 ? 1 : -1);

/** One edge from (x0, y0) to (x1, y1) with a knob outwards (`sign` 1), inwards (-1) or none (0); clockwise outline in y-down space. */
const edge = (x0: number, y0: number, x1: number, y1: number, sign: number): string => {
	const length = Math.hypot(x1 - x0, y1 - y0);
	const d = {x: (x1 - x0) / length, y: (y1 - y0) / length};
	const n = {x: d.y, y: -d.x};
	const p = (along: number, out: number) => `${(x0 + d.x * along * length + n.x * out * sign * length).toFixed(1)} ${(y0 + d.y * along * length + n.y * out * sign * length).toFixed(1)}`;
	if (sign === 0) return `L${p(1, 0)}`;
	return `L${p(0.36, 0)} C${p(0.4, 0.1)} ${p(0.28, 0.26)} ${p(0.5, 0.26)} C${p(0.72, 0.26)} ${p(0.6, 0.1)} ${p(0.64, 0)} L${p(1, 0)}`;
};

/** The outline of the piece at `index`, in board pixels. */
const piecePath = (index: number): string => {
	const {col, row} = cellOf(index);
	const s = BOARD.cell;
	const x = col * s;
	const y = row * s;
	const top = row === 0 ? 0 : -across(row - 1, col);
	const right = col === COLS - 1 ? 0 : down(row, col);
	const bottom = row === ROWS - 1 ? 0 : across(row, col);
	const left = col === 0 ? 0 : -down(row, col - 1);
	return `M${x} ${y} ${edge(x, y, x + s, y, top)} ${edge(x + s, y, x + s, y + s, right)} ${edge(x + s, y + s, x, y + s, bottom)} ${edge(x, y + s, x, y, left)} Z`;
};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(85% 60% at 50% 45%, #16304F 0%, ${NAVY} 70%)`}} />;

/**
 * The puzzle: each piece thick (a darker copy under it) with a shadow. `lit`
 * turns pieces light in a wave from the top (0 → 1); the hole is dark until
 * `filled`, when the orange piece sits in it.
 */
const Puzzle: React.FC<{content: Content; lit?: number; filled?: boolean; pulse?: number}> = ({content, lit = 0, filled = false, pulse = 0}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const width = COLS * BOARD.cell;
	const height = ROWS * BOARD.cell;
	const colour = (index: number) => {
		const {row, col} = cellOf(index);
		const wave = Math.max(0, Math.min(1, lit * (ROWS + 2) - row - col * 0.3));
		return interpolateColors(wave, [0, 1], [DIM[(row + col) % 3], LIT[(row + col) % 3]]);
	};
	const ink = (index: number) => {
		const {row, col} = cellOf(index);
		return lit * (ROWS + 2) - row - col * 0.3 > 0.5 ? NAVY : 'rgba(255,255,255,0.92)';
	};
	return (
		<div style={{position: 'absolute', left: u(BOARD.x), top: u(BOARD.y), width: u(width), height: u(height)}}>
			<svg width={u(width)} height={u(height)} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: `drop-shadow(0 ${u(30)}px ${u(40)}px rgba(0,0,0,0.5))`}}>
				{content.topics.map((topic, index) => {
					if (index === content.gap) return null;
					const lift = Math.sin(seconds * 2 + index * 1.3) * 1.5;
					return (
						<g key={topic} transform={`translate(0 ${lift.toFixed(2)})`}>
							<path d={piecePath(index)} transform="translate(0 12)" fill="#050B14" />
							<path d={piecePath(index)} fill={colour(index)} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
						</g>
					);
				})}
				{filled ? (
					<g>
						<path d={piecePath(content.gap)} transform="translate(0 12)" fill="#7C2D12" />
						<path d={piecePath(content.gap)} fill={ORANGE} />
					</g>
				) : (
					<path d={piecePath(content.gap)} fill="#020617" stroke={ORANGE} strokeOpacity={0.35 + pulse * 0.5} strokeWidth={4 + pulse * 4} />
				)}
			</svg>
			{content.topics.map((topic, index) => {
				if (index === content.gap && !filled) return null;
				const {col, row} = cellOf(index);
				return (
					<div key={topic} style={{position: 'absolute', left: u(col * BOARD.cell + 14), top: u(row * BOARD.cell), width: u(BOARD.cell - 28), height: u(BOARD.cell), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Text size={30} weight={TYPE.weights.kinetic} color={index === content.gap ? WHITE : ink(index)} align="center" style={{lineHeight: 1.1}}>
							{topic}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	return (
		<Stage>
			<Puzzle content={content} pulse={(Math.sin(seconds * 6) + 1) / 2} />
			<At y={110} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline * 0.9} color={WHITE} />
			</At>
			<At y={220} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** The exam result as SinoAI's analysis shows it: topic rows, the missed one marked. */
const CARD: Shape = {x: 56, y: 330, w: 840, h: 800, radius: 44, fill: WHITE};
const RESULT_ROW = (index: number): Shape => ({x: CARD.x + 30, y: CARD.y + 150 + index * 128, w: CARD.w - 60, h: 108, radius: 26, fill: '#F8FAFC'});

const ResultRow: React.FC<{row: Content['find']['rows'][number]; missing: boolean; badge: string}> = ({row, missing, badge}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: u(18), padding: `0 ${u(26)}px`}}>
			<Icon name={missing ? 'alert' : 'checkCircle'} size={u(40)} color={missing ? ORANGE : '#0F766E'} stroke={2.4} />
			<Text size={40} weight={TYPE.weights.kinetic} color={NAVY} style={{flex: 1}}>
				{row.topic}
			</Text>
			{missing ? (
				<div style={{padding: `${u(8)}px ${u(18)}px`, borderRadius: u(999), background: ORANGE}}>
					<Text size={28} weight={TYPE.weights.kinetic} color={WHITE}>
						{badge}
					</Text>
				</div>
			) : null}
			<Text size={38} weight={TYPE.weights.kinetic} color={missing ? ORANGE : NAVY} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
				{row.score}
			</Text>
		</div>
	);
};

const missingRow = (content: Content) => Math.max(0, content.find.rows.findIndex((row) => row.topic === content.topics[content.gap]));

const FindScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const hole = cellCentre(content.gap);
	const open = ease(interpolate(seconds, [0.55, 0.85], [0, 1], CLAMP));
	const missing = missingRow(content);
	const glow = interpolate(seconds, [1.2, 1.5], [0, 1], CLAMP);
	return (
		<Stage>
			{/* Into the hole: the camera comes so close that the dark fills the frame. */}
			<CameraZoom
				keys={[
					{at: 0, to: {x: 476, y: 860, zoom: 1}},
					{at: 0.05, to: {x: hole.x, y: hole.y + 10, zoom: 6}},
				]}
			>
				<Puzzle content={content} pulse={1} />
			</CameraZoom>
			<div style={{position: 'absolute', inset: 0, opacity: open}}>
				<Morph
					keys={[
						{at: 0, to: {x: 456, y: 745, w: 40, h: 40, radius: 20, fill: WHITE}},
						{at: 0.55, to: CARD},
					]}
					sound={null}
					shadow="0 40px 80px -30px rgba(0,0,0,0.6)"
					render={() => (
						<div style={{position: 'absolute', left: u(34), top: u(40), display: 'flex', alignItems: 'center', gap: u(14)}}>
							<div style={{width: u(56), height: u(56), borderRadius: u(16), background: EXAM, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="exam" size={u(32)} color={WHITE} stroke={2.2} />
							</div>
							<Text size={40} weight={TYPE.weights.kinetic} color={NAVY}>
								{content.find.title}
							</Text>
						</div>
					)}
				/>
				{content.find.rows.map((row, index) => {
					const show = ease(interpolate(seconds, [0.75 + index * 0.08, 1 + index * 0.08], [0, 1], CLAMP));
					const shape = RESULT_ROW(index);
					const isMissing = index === missing;
					return (
						<div key={row.topic} style={{position: 'absolute', left: u(shape.x), top: u(shape.y), width: u(shape.w), height: u(shape.h), borderRadius: u(shape.radius), background: isMissing ? interpolateColors(glow, [0, 1], ['#F8FAFC', '#FFF7ED']) : '#F8FAFC', border: `${u(isMissing ? 4 : 0)}px solid ${isMissing ? `rgba(234,88,12,${glow})` : 'transparent'}`, boxSizing: 'border-box', opacity: show, transform: `translateY(${(1 - show) * u(24)}px) scale(${isMissing ? 1 + glow * 0.03 : 1})`}}>
							<ResultRow row={row} missing={isMissing && glow > 0} badge={content.find.badge} />
						</div>
					);
				})}
			</div>
			<SoundEffect id="pop" atSeconds={0.6} />
			<SoundEffect id="warning" atSeconds={1.2} volume={0.7} />
		</Stage>
	);
};

const TASK: Shape = {x: 76, y: 470, w: 800, h: 460, radius: 44, fill: PLAN};

const TaskFace: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, padding: u(44), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(18)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(12)}}>
				<Icon name="calendar" size={u(38)} color={WHITE} stroke={2.4} />
				<Text size={36} weight={TYPE.weights.display} color="rgba(255,255,255,0.88)">
					{content.plan.kicker}
				</Text>
			</div>
			<Text variant="display" size={100} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1.02}}>
				{content.topics[content.gap]}
			</Text>
			<Text size={38} weight={TYPE.weights.display} color="rgba(255,255,255,0.88)">
				{content.plan.meta}
			</Text>
		</div>
	);
};

const PlanScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const missing = missingRow(content);
	const fade = ease(interpolate(seconds, [0.05, 0.4], [0, 1], CLAMP));
	return (
		<Stage>
			<div style={{position: 'absolute', left: u(CARD.x), top: u(CARD.y), width: u(CARD.w), height: u(CARD.h), borderRadius: u(CARD.radius), background: WHITE, opacity: 1 - fade, transform: `scale(${1 - fade * 0.05})`}} />
			<Morph
				keys={[
					{at: 0, to: {...RESULT_ROW(missing), fill: '#FFF7ED'}},
					{at: 0.08, to: TASK},
				]}
				shadow="0 40px 80px -30px rgba(0,0,0,0.6)"
				render={(state) => (state === 0 ? <ResultRow row={content.find.rows[missing]} missing badge={content.find.badge} /> : <TaskFace content={content} />)}
			/>
			<SoundEffect id="success" atSeconds={0.6} />
		</Stage>
	);
};

const SnapScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const hole = cellCentre(content.gap);
	// The task card shrinks into a piece-sized square; the piece takes its place and flies into the hole.
	const board = ease(interpolate(seconds, [0.15, 0.45], [0, 1], CLAMP));
	const flyFrom = 0.45;
	const snapAt = 0.95;
	const fly = ease(interpolate(seconds, [flyFrom, snapAt], [0, 1], CLAMP));
	const filled = seconds >= snapAt;
	const lit = interpolate(seconds, [snapAt + 0.1, snapAt + 1], [0, 1], CLAMP);
	const chart = ease(interpolate(seconds, [snapAt + 0.3, Math.min(total - 0.3, snapAt + 1.3)], [0, 1], CLAMP));
	const piece = {x: interpolate(fly, [0, 1], [476, hole.x]), y: interpolate(fly, [0, 1], [700, hole.y]), scale: interpolate(fly, [0, 1], [1.6, 1])};
	const net = Math.round(interpolate(chart, [0, 1], [content.snap.from, content.snap.to]));
	const points = [0, 1, 2, 3, 4, 5].map((index) => {
		const x = 30 + index * 90;
		const value = index < 3 ? 0.3 + Math.sin(index) * 0.04 : 0.3 + ((index - 2) / 3) * 0.55 * chart;
		return `${x},${110 - value * 100}`;
	});
	return (
		<Stage>
			<div style={{position: 'absolute', inset: 0, opacity: board}}>
				<Puzzle content={content} filled={filled} lit={lit} />
			</div>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - board}}>
				<Morph
					keys={[
						{at: 0, to: TASK},
						{at: 0.02, to: {x: 476 - (BOARD.cell / 2) * 1.6, y: 700 - (BOARD.cell / 2) * 1.6, w: BOARD.cell * 1.6, h: BOARD.cell * 1.6, radius: 40, fill: ORANGE}},
					]}
					render={(state) => (state === 0 ? <TaskFace content={content} /> : null)}
				/>
			</div>
			{!filled && seconds >= flyFrom - 0.05 ? (
				<div style={{position: 'absolute', left: u(piece.x - BOARD.cell / 2), top: u(piece.y - BOARD.cell / 2), width: u(BOARD.cell), height: u(BOARD.cell), transform: `scale(${piece.scale})`, filter: `drop-shadow(0 ${u(40)}px ${u(40)}px rgba(0,0,0,0.6))`}}>
					<svg width={u(BOARD.cell * 1.6)} height={u(BOARD.cell * 1.6)} viewBox={`${-BOARD.cell * 0.3} ${-BOARD.cell * 0.3} ${BOARD.cell * 1.6} ${BOARD.cell * 1.6}`} style={{position: 'absolute', left: u(-BOARD.cell * 0.3), top: u(-BOARD.cell * 0.3), overflow: 'visible'}}>
						<g transform={`translate(${-cellOf(content.gap).col * BOARD.cell} ${-cellOf(content.gap).row * BOARD.cell})`}>
							<path d={piecePath(content.gap)} transform="translate(0 12)" fill="#7C2D12" />
							<path d={piecePath(content.gap)} fill={ORANGE} />
						</g>
					</svg>
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: u(14)}}>
						<Text size={30} weight={TYPE.weights.kinetic} color={WHITE} align="center">
							{content.topics[content.gap]}
						</Text>
					</div>
				</div>
			) : null}
			<At x={96} y={120} w={760}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(24), padding: `${u(18)}px ${u(26)}px`, borderRadius: u(30), background: 'rgba(255,255,255,0.08)', opacity: chart > 0 ? 1 : 0}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(4)}}>
						<Text size={30} weight={TYPE.weights.display} color="rgba(255,255,255,0.75)">
							{content.snap.label}
						</Text>
						<Text variant="display" size={80} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
							{String(net)}
						</Text>
						<Text size={24} weight={TYPE.weights.strong} color="rgba(255,255,255,0.6)">
							{content.snap.example}
						</Text>
					</div>
					<svg width={u(500)} height={u(130)} viewBox="0 0 500 130" style={{flex: 1}}>
						<polyline points={points.join(' ')} fill="none" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</At>
			<SoundEffect id="puzzleSnap" atSeconds={snapAt} volume={1} />
			<SoundEffect id="lineClear" atSeconds={snapAt + 0.15} volume={0.8} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof PuzzleGapSchema> = {
	hook: {lines: ['Netin neden artmıyor?', 'Eksik parça.'], narration: 'Netin neden artmıyor? Eksik parça.'},
	topics: ['Sayılar', 'Bölünebilme', 'Rasyonel', 'Üslü sayılar', 'Köklü sayılar', 'Mutlak değer', 'Çarpanlar', 'Oran orantı', 'Problemler', 'Olasılık', 'Kümeler', 'Fonksiyonlar', 'Polinomlar', 'Permütasyon', 'Kombinasyon', 'Veri', 'Üçgenler', 'Çember', 'Analitik', 'Katı cisimler'],
	gap: 9,
	find: {
		title: 'Son deneme · Matematik',
		rows: [
			{topic: 'Problemler', score: '6/8'},
			{topic: 'Fonksiyonlar', score: '3/4'},
			{topic: 'Olasılık', score: '0/2'},
			{topic: 'Üçgenler', score: '4/5'},
		],
		badge: 'Eksik konu',
		narration: 'Sınavika deneme sonucunda eksik konunu bulur.',
	},
	plan: {kicker: 'Bugünün görevi', meta: 'Mikro ders + 10 soru · 30 dk', narration: 'Ders Planı onu bugünün görevine çevirir.'},
	snap: {from: 61, to: 63, label: 'TYT neti', example: 'Örnek gösterim', narration: 'Parça yerine oturur.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const find = say('find', content.find.narration, Math.max(beat(content.find.narration, 3.2), 3.2), 3);
	const plan = say('plan', content.plan.narration, Math.max(beat(content.plan.narration, 2.8), 2.8), 2.6);
	const snap = say('snap', content.snap.narration, Math.max(beat(content.snap.narration, 2.8), 2.8), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'find', seconds: find.seconds, label: 'Boşluk', voice: [find], element: <FindScene content={content} />},
		{id: 'plan', seconds: plan.seconds, label: 'Görev', voice: [plan], element: <PlanScene content={content} />},
		{id: 'snap', seconds: snap.seconds, label: 'Parça', voice: [snap], element: <SnapScene content={content} seconds={snap.seconds} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const PuzzleGap = defineTemplate({
	id: 'PuzzleGap',
	category: 'Advertisements',
	title: 'Eksik parça',
	description: 'Konulardan kalın parçalı bir yapboz, ortasında tek boşluk; kamera boşluğa dalar ve deneme sonucunda eksik konu yanar. Satır Ders Planı görevine, görev yapboz parçasına dönüşür; parça yerine oturur, yapboz parça parça aydınlanır, net çizgisi yükselir (örnek gösterim).',
	contentSchema: PuzzleGapSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
