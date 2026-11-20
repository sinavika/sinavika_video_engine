import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {useTheme} from '../../../Themes/ThemeContext';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';

/**
 * "Soruya çevirdik" (Kasım 2026): a series that turns an everyday thing, or a
 * real viewer comment, into a TYT-style question and solves it step by step,
 * in a warm "biz" voice (docs/Social/Seri-Soruya-Cevirdik.md). Owner rules for
 * the series (15 Nov 2026): 30–45 s, no narration subtitles, no app card and
 * no sales call, it ends on a question with only a small corner logo.
 *
 * The look is the series' own: a graph-paper page with an orange marker, so it
 * reads as a notebook, not as an ad. Each beat is one narrated line and one
 * view; the view is chosen per beat (the hook, a drawing, the question card,
 * a countdown, the working, a tag, the closing).
 */

const narration = z.string().trim().min(1).max(260);
const line = z.string().trim().min(1).max(90);

/** Option marks: which options are dimmed, crossed or ticked on the card. */
const MarkSchema = z.object({index: z.number().int().min(0).max(4), state: z.enum(['dim', 'wrong', 'correct'])});

const ArtSchema = z.discriminatedUnion('kind', [
	/** A teapot that turns into a cylinder (`morph` 0 → teapot, 1 → cylinder). */
	z.object({kind: z.literal('teapot'), morph: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).default([0, 0]), r: line.optional(), h: line.optional()}),
	/** A cylinder with its measures; water rises from `level[0]` to `level[1]`; `gap` labels the empty band at the top. */
	z.object({kind: z.literal('cylinder'), r: line, h: line, level: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).default([0, 0]), gap: line.optional()}),
	/** A goal in three zones; the keeper dives to `dive`, the ball goes to `shot` (0 left, 1 centre, 2 right). */
	z.object({kind: z.literal('goal'), zones: z.tuple([line, line, line]), dive: z.number().int().min(0).max(2).optional(), shot: z.number().int().min(0).max(2).optional()}),
	/** A 3 × 3 table of outcomes; cells fill one by one, the diagonal can light up. */
	z.object({kind: z.literal('grid'), rows: line, cols: line, labels: z.tuple([line, line, line]), diagonal: z.boolean().default(false)}),
	/** A viewer comment, shown without the username. */
	z.object({kind: z.literal('comment'), text: line, stamp: line.optional()}),
	/** Score boxes: `ticks` of `boxes` ticked, the rest waiting. */
	z.object({kind: z.literal('score'), boxes: z.number().int().min(2).max(6), ticks: z.number().int().min(0).max(6), label: line.optional()}),
]);

const ViewSchema = z.discriminatedUnion('type', [
	z.object({type: z.literal('hook'), text: line, art: ArtSchema.optional()}),
	z.object({type: z.literal('art'), art: ArtSchema, title: line.optional()}),
	z.object({type: z.literal('question'), label: line.optional(), marks: z.array(MarkSchema).default([])}),
	z.object({type: z.literal('countdown')}),
	z.object({type: z.literal('work'), lines: z.array(line).min(1).max(5), result: line.optional(), marks: z.array(MarkSchema).default([]), art: ArtSchema.optional()}),
	z.object({type: z.literal('compare'), marks: z.array(MarkSchema).default([]), pick: z.tuple([z.number().int().min(0).max(4), z.number().int().min(0).max(4)]), title: line.optional()}),
	z.object({type: z.literal('tag'), text: line, sub: line.optional(), art: ArtSchema.optional()}),
	z.object({type: z.literal('close'), text: line}),
]);

const SoruyaCevirdikSchema = z.object({
	/** The series name on the chip at the top. */
	series: z.string().trim().min(1).max(24).default('Soruya çevirdik'),
	/** The question every beat refers to: its stem and five options; `_word_` underlines a word. */
	question: z.object({text: z.string().trim().min(1).max(260), options: z.array(z.string().trim().min(1).max(70)).length(5)}),
	beats: z.array(z.object({id: z.string().regex(/^[a-z0-9-]+$/), narration, minSeconds: z.number().min(1).max(8).default(2), view: ViewSchema})).min(5).max(16),
	script: VoiceScriptSchema,
});
type Content = z.infer<typeof SoruyaCevirdikSchema>;
type Art = z.infer<typeof ArtSchema>;
type Mark = z.infer<typeof MarkSchema>;

const PAPER = '#FBFAF5';
const GRID = '#DCE6F2';
const INK = '#0B1C30';
const MUTED = '#475569';
const ORANGE = '#EA580C';
const RED = '#DC2626';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';
const WATER = '#38BDF8';

/** The graph-paper page; it drifts slowly so no frame stands still. */
const Ground: React.FC = () => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const cell = u(56);
	const drift = (seconds * u(6)) % cell;
	return (
		<AbsoluteFill
			style={{
				background: PAPER,
				backgroundImage: `linear-gradient(${GRID} ${u(2)}px, transparent ${u(2)}px), linear-gradient(90deg, ${GRID} ${u(2)}px, transparent ${u(2)}px)`,
				backgroundSize: `${cell}px ${cell}px`,
				backgroundPosition: `${drift}px ${drift * 0.6}px`,
			}}
		/>
	);
};

/** The series chip at the top, on every scene. No corner logo (owner, 20 Nov 2026: "hiçbir reels de olmasın"); the brand is on the closing card. */
const Chrome: React.FC<{series: string}> = ({series}) => {
	const {u} = useVideoLayout();
	return (
		<>
			<At y={20} w={952}>
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(10)}px ${u(24)}px`, borderRadius: u(999), background: INK}}>
						<div style={{width: u(14), height: u(14), borderRadius: '50%', background: ORANGE}} />
						<Text size={34} weight={TYPE.weights.kinetic} color={WHITE} style={{letterSpacing: '0.04em', textTransform: 'uppercase'}}>
							{series}
						</Text>
					</div>
				</div>
			</At>
		</>
	);
};

const Stage: React.FC<{series: string; children: React.ReactNode}> = ({series, children}) => {
	const {typography} = useTheme();
	return (
		<PromoStage ground={<Ground />}>
			<div style={{position: 'absolute', inset: 0, fontFamily: typography.body}}>
				<Chrome series={series} />
				{children}
			</div>
		</PromoStage>
	);
};

/** `_word_` → the word underlined in orange marker. */
const Marked: React.FC<{text: string}> = ({text}) => {
	const {u} = useVideoLayout();
	const parts = text.split(/(_[^_]+_)/g).filter(Boolean);
	return (
		<>
			{parts.map((part, index) =>
				part.startsWith('_') && part.endsWith('_') ? (
					<span key={index} style={{textDecoration: 'underline', textDecorationColor: ORANGE, textDecorationThickness: u(6), textUnderlineOffset: u(8)}}>
						{part.slice(1, -1)}
					</span>
				) : (
					<React.Fragment key={index}>{part}</React.Fragment>
				),
			)}
		</>
	);
};

const markOf = (marks: Mark[], index: number): Mark['state'] | undefined => marks.find((mark) => mark.index === index)?.state;

/** The five options; short ones in a row, long ones as a list. Marks dim, cross or tick them. */
const Options: React.FC<{options: string[]; marks: Mark[]; size?: number; markAt?: number}> = ({options, marks, size = 40, markAt = 0.2}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const short = options.every((option) => option.length <= 6);
	const markIn = ease(interpolate(seconds, [markAt, markAt + 0.3], [0, 1], CLAMP));
	return (
		<div style={{display: 'flex', flexDirection: short ? 'row' : 'column', flexWrap: 'wrap', gap: short ? u(18) : u(14)}}>
			{options.map((option, index) => {
				const state = markOf(marks, index);
				const tone = state === 'correct' ? GREEN : state === 'wrong' ? RED : INK;
				const opacity = state === 'dim' ? interpolate(markIn, [0, 1], [1, 0.28]) : 1;
				const lit = state === 'correct' || state === 'wrong' ? markIn : 0;
				return (
					<div
						key={index}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: u(14),
							padding: `${u(12)}px ${u(20)}px`,
							borderRadius: u(18),
							background: lit > 0 ? `rgba(${state === 'correct' ? '22,163,74' : '220,38,38'},${0.12 * lit})` : 'rgba(255,255,255,0.9)',
							border: `${u(3)}px solid ${lit > 0 ? tone : '#CBD5E1'}`,
							opacity,
							transform: `scale(${1 + 0.04 * lit})`,
							transformOrigin: 'left center',
						}}
					>
						<Text size={size} weight={TYPE.weights.kinetic} color={lit > 0 ? tone : ORANGE}>
							{`${'ABCDE'[index]})`}
						</Text>
						<Text size={size} weight={TYPE.weights.strong} color={INK} style={{lineHeight: 1.25}}>
							<Marked text={option} />
						</Text>
						{lit > 0 ? <Icon name={state === 'correct' ? 'check' : 'x'} size={u(size)} color={tone} stroke={3.2} /> : null}
					</div>
				);
			})}
		</div>
	);
};

/** The question card: label, stem and options, landing as a sheet. */
const QuestionCard: React.FC<{content: Content; label?: string; marks: Mark[]; compact?: boolean}> = ({content, label, marks, compact}) => {
	const {u} = useVideoLayout();
	const land = useLand(0.05, 180, 20);
	return (
		<div style={{padding: u(compact ? 26 : 36), borderRadius: u(32), background: WHITE, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(30)}px rgba(15,23,42,0.45)`, border: `${u(3)}px solid ${INK}`, opacity: Math.min(1, land * 1.5), transform: `translateY(${(1 - land) * u(80)}px) rotate(${(1 - land) * -2}deg)`, display: 'flex', flexDirection: 'column', gap: u(compact ? 16 : 24)}}>
			{label ? (
				<Text size={36} weight={TYPE.weights.kinetic} color={ORANGE} style={{textTransform: 'uppercase', letterSpacing: '0.05em'}}>
					{label}
				</Text>
			) : null}
			{compact ? null : (
				<Text size={54} weight={TYPE.weights.display} color={INK} style={{lineHeight: 1.25}}>
					<Marked text={content.question.text} />
				</Text>
			)}
			<Options options={content.question.options} marks={marks} size={compact ? 38 : 46} />
		</div>
	);
};

/* ---------- drawings ---------- */

const TeapotOrCylinder: React.FC<{morph: number; r?: string; h?: string; level?: number; gap?: string}> = ({morph, r, h, level = 0, gap}) => {
	const {u} = useVideoLayout();
	// Cylinder geometry in drawing units (520 × 560 box).
	const cx = 260;
	const top = 110;
	const bottom = 470;
	const rx = 150;
	const ry = 36;
	const height = bottom - top;
	const waterTop = bottom - height * level;
	const teapot = 1 - morph;
	return (
		<svg width={u(860)} height={u(775)} viewBox="-50 0 620 560" style={{overflow: 'visible'}}>
			{/* Teapot: spout, handle and lid fade out as it becomes a cylinder. */}
			<g opacity={teapot}>
				<path d="M110 300 C40 280 20 200 60 170" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
				<path d="M410 200 C500 210 500 360 410 380" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
				<rect x="215" y="62" width="90" height="34" rx="14" fill={ORANGE} />
				<circle cx="260" cy="52" r="14" fill={ORANGE} />
			</g>
			{level > 0 ? (
				<g>
					<path d={`M${cx - rx} ${waterTop} L${cx - rx} ${bottom} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L${cx + rx} ${waterTop} Z`} fill={WATER} opacity={0.55} />
					<ellipse cx={cx} cy={waterTop} rx={rx} ry={ry} fill={WATER} opacity={0.8} />
				</g>
			) : null}
			<path d={`M${cx - rx} ${top} L${cx - rx} ${bottom} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L${cx + rx} ${top}`} fill={teapot > 0.5 ? '#FDE7D6' : 'none'} fillOpacity={teapot} stroke={INK} strokeWidth="10" />
			<ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth="10" />
			<g opacity={morph}>
				<line x1={cx} y1={top} x2={cx + rx} y2={top} stroke={ORANGE} strokeWidth="8" strokeDasharray="14 10" />
				<line x1={cx + rx + 40} y1={top} x2={cx + rx + 40} y2={bottom} stroke={ORANGE} strokeWidth="8" />
				<line x1={cx + rx + 26} y1={top} x2={cx + rx + 54} y2={top} stroke={ORANGE} strokeWidth="8" />
				<line x1={cx + rx + 26} y1={bottom} x2={cx + rx + 54} y2={bottom} stroke={ORANGE} strokeWidth="8" />
			</g>
			{gap && level > 0 ? (
				<g>
					<line x1={cx - rx - 40} y1={top} x2={cx - rx - 40} y2={waterTop} stroke={RED} strokeWidth="8" />
					<text x={cx - rx - 60} y={(top + waterTop) / 2 + 12} textAnchor="end" fontSize="46" fontWeight="800" fill={RED}>
						{gap}
					</text>
				</g>
			) : null}
			{r ? (
				<text x={cx + rx / 2} y={top - 50} textAnchor="middle" fontSize="50" fontWeight="800" fill={ORANGE} opacity={morph}>
					{r}
				</text>
			) : null}
			{h ? (
				<text x={cx + rx + 70} y={(top + bottom) / 2 + 14} fontSize="50" fontWeight="800" fill={ORANGE} opacity={morph}>
					{h}
				</text>
			) : null}
		</svg>
	);
};

const Goal: React.FC<{zones: [string, string, string]; dive?: number; shot?: number}> = ({zones, dive, shot}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const move = ease(interpolate(seconds, [0.3, 0.9], [0, 1], CLAMP));
	const zoneX = (zone: number) => 150 + zone * 260;
	return (
		<svg width={u(860)} height={u(520)} viewBox="0 0 860 520">
			<rect x="40" y="60" width="780" height="360" fill="none" stroke={INK} strokeWidth="14" />
			{[0, 1, 2].map((zone) => (
				<g key={zone}>
					{zone > 0 ? <line x1={40 + zone * 260} y1="60" x2={40 + zone * 260} y2="420" stroke={GRID} strokeWidth="6" strokeDasharray="16 12" /> : null}
					<text x={zoneX(zone) + 20} y="470" textAnchor="middle" fontSize="40" fontWeight="800" fill={MUTED}>
						{zones[zone]}
					</text>
				</g>
			))}
			<line x1="0" y1="420" x2="860" y2="420" stroke={INK} strokeWidth="6" />
			{dive !== undefined ? (
				<g transform={`translate(${interpolate(move, [0, 1], [430, zoneX(dive) + 20])} 300) rotate(${interpolate(move, [0, 1], [0, dive === 1 ? 0 : dive === 0 ? -40 : 40])})`}>
					<rect x="-26" y="-90" width="52" height="120" rx="20" fill={ORANGE} />
					<circle cx="0" cy="-118" r="26" fill={INK} />
				</g>
			) : null}
			{shot !== undefined ? <circle cx={interpolate(move, [0, 1], [430, zoneX(shot) + 20])} cy={interpolate(move, [0, 1], [500, 200])} r="30" fill={WHITE} stroke={INK} strokeWidth="8" /> : null}
		</svg>
	);
};

const Grid: React.FC<{rows: string; cols: string; labels: [string, string, string]; diagonal: boolean}> = ({rows, cols, labels, diagonal}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const cell = 170;
	const left = 200;
	const top = 120;
	const fill = (index: number) => ease(interpolate(seconds, [0.2 + index * 0.12, 0.35 + index * 0.12], [0, 1], CLAMP));
	const lit = diagonal ? ease(interpolate(seconds, [0.4, 0.8], [0, 1], CLAMP)) : 0;
	return (
		<svg width={u(900)} height={u(805)} viewBox="0 0 760 680">
			<text x={left + cell * 1.5} y="40" textAnchor="middle" fontSize="36" fontWeight="800" fill={ORANGE}>
				{cols}
			</text>
			<text x="40" y={top + cell * 1.5} textAnchor="middle" fontSize="36" fontWeight="800" fill={ORANGE} transform={`rotate(-90 40 ${top + cell * 1.5})`}>
				{rows}
			</text>
			{labels.map((label, index) => (
				<g key={label}>
					<text x={left + cell * index + cell / 2} y={top - 20} textAnchor="middle" fontSize="32" fontWeight="700" fill={MUTED}>
						{label}
					</text>
					<text x={left - 20} y={top + cell * index + cell / 2 + 10} textAnchor="end" fontSize="32" fontWeight="700" fill={MUTED}>
						{label}
					</text>
				</g>
			))}
			{Array.from({length: 9}, (_, index) => {
				const row = Math.floor(index / 3);
				const col = index % 3;
				const onDiagonal = row === col;
				const shown = fill(index);
				return (
					<g key={index} opacity={shown}>
						<rect x={left + col * cell + 6} y={top + row * cell + 6} width={cell - 12} height={cell - 12} rx="18" fill={onDiagonal && lit > 0 ? `rgba(22,163,74,${0.2 + 0.6 * lit})` : WHITE} stroke={onDiagonal && lit > 0 ? GREEN : '#CBD5E1'} strokeWidth="5" />
						<text x={left + col * cell + cell / 2} y={top + row * cell + cell / 2 + 14} textAnchor="middle" fontSize="40" fontWeight="800" fill={onDiagonal && lit > 0 ? WHITE : INK}>
							{onDiagonal && lit > 0.5 ? '✓' : '•'}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

const Comment: React.FC<{text: string; stamp?: string}> = ({text, stamp}) => {
	const {u} = useVideoLayout();
	const land = useLand(0.05, 220, 18);
	return (
		<div style={{width: u(760), padding: u(34), borderRadius: u(34), background: WHITE, border: `${u(3)}px solid #CBD5E1`, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(30)}px rgba(15,23,42,0.45)`, transform: `scale(${interpolate(land, [0, 1], [0.7, 1])}) rotate(${(1 - land) * 6}deg)`, opacity: Math.min(1, land * 1.6), display: 'flex', gap: u(24), alignItems: 'center'}}>
			<div style={{width: u(96), height: u(96), borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name="user" size={u(56)} color={MUTED} stroke={2.2} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(8)}}>
				<Text size={28} weight={TYPE.weights.strong} color={MUTED}>
					{stamp ?? 'Bir dostumuz'}
				</Text>
				<Text size={88} weight={TYPE.weights.kinetic} color={INK}>
					{text}
				</Text>
			</div>
		</div>
	);
};

const Score: React.FC<{boxes: number; ticks: number; label?: string}> = ({boxes, ticks, label}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30)}}>
			<div style={{display: 'flex', gap: u(26)}}>
				{Array.from({length: boxes}, (_, index) => {
					const on = index < ticks ? ease(interpolate(seconds, [0.15 + index * 0.25, 0.35 + index * 0.25], [0, 1], CLAMP)) : 0;
					const waiting = index >= ticks;
					const pulse = waiting ? 0.6 + 0.4 * Math.abs(Math.sin(seconds * 4)) : 1;
					return (
						<div key={index} style={{width: u(150), height: u(150), borderRadius: u(30), border: `${u(6)}px solid ${waiting ? ORANGE : GREEN}`, background: on > 0 ? `rgba(22,163,74,${on})` : WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pulse, transform: `scale(${1 + 0.08 * on})`}}>
							{waiting ? (
								<Text size={90} weight={TYPE.weights.kinetic} color={ORANGE}>
									?
								</Text>
							) : (
								<Icon name="check" size={u(90)} color={WHITE} stroke={3.6} />
							)}
						</div>
					);
				})}
			</div>
			{label ? (
				<Text size={120} weight={TYPE.weights.kinetic} color={INK}>
					{label}
				</Text>
			) : null}
		</div>
	);
};

/** One drawing, animated over the beat. */
const Drawing: React.FC<{art: Art}> = ({art}) => {
	const seconds = useSeconds();
	const progress = (from: number, to: number) => interpolate(ease(interpolate(seconds, [0.15, 1.2], [0, 1], CLAMP)), [0, 1], [from, to]);
	switch (art.kind) {
		case 'teapot':
			return <TeapotOrCylinder morph={progress(art.morph[0], art.morph[1])} r={art.r} h={art.h} />;
		case 'cylinder':
			return <TeapotOrCylinder morph={1} r={art.r} h={art.h} level={progress(art.level[0], art.level[1])} gap={art.gap} />;
		case 'goal':
			return <Goal zones={art.zones} dive={art.dive} shot={art.shot} />;
		case 'grid':
			return <Grid rows={art.rows} cols={art.cols} labels={art.labels} diagonal={art.diagonal} />;
		case 'comment':
			return <Comment text={art.text} stamp={art.stamp} />;
		case 'score':
			return <Score boxes={art.boxes} ticks={art.ticks} label={art.label} />;
	}
};

/** Whether a drawing moves on its own over the beat; a still one gets a slow drift. */
const Centered: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => {
	const seconds = useSeconds();
	const breathe = 1 + 0.015 * Math.sin(seconds * 2.4);
	return (
		<At y={y} w={952}>
			<div style={{display: 'flex', justifyContent: 'center', transform: `scale(${breathe})`}}>{children}</div>
		</At>
	);
};

/* ---------- views ---------- */

const HookView: React.FC<{text: string; art?: Art}> = ({text, art}) => (
	<>
		<At y={170} w={952}>
			<div style={{padding: '0 40px'}}>
				<Slam text={text} at={0} size={TYPE.adScale.hook} color={INK} />
			</div>
		</At>
		{art ? (
			<Centered y={560}>
				<Drawing art={art} />
			</Centered>
		) : null}
		<SoundEffect id="transitionWhoosh" atSeconds={0} volume={0.5} />
	</>
);

const ArtView: React.FC<{art: Art; title?: string}> = ({art, title}) => {
	const {u} = useVideoLayout();
	const land = useLand(0, 200, 20);
	return (
		<>
			{title ? (
				<At y={150} w={952}>
					<div style={{padding: `0 ${u(40)}px`, opacity: Math.min(1, land * 1.5), transform: `translateY(${(1 - land) * u(30)}px)`}}>
						<Text size={84} weight={TYPE.weights.kinetic} color={INK} align="center" style={{lineHeight: 1.08}}>
							{title}
						</Text>
					</div>
				</At>
			) : null}
			<Centered y={title ? 400 : 330}>
				<Drawing art={art} />
			</Centered>
			<SoundEffect id={art.kind === 'comment' ? 'notification' : 'pop'} atSeconds={0.1} volume={0.6} />
		</>
	);
};

const QuestionView: React.FC<{content: Content; label?: string; marks: Mark[]}> = ({content, label, marks}) => (
	<>
		<At x={40} y={260} w={872}>
			<QuestionCard content={content} label={label} marks={marks} />
		</At>
		<SoundEffect id="paperTear" atSeconds={0} volume={0.45} />
	</>
);

const CountdownView: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	// A quick 3-2-1 under the short "Düşün!" line (owner 15 Nov: a full 3 s wait drags the video).
	const from = 0.15;
	const step = Math.min(0.5, Math.max(0.3, (total - from - 0.2) / 3));
	const index = Math.min(2, Math.max(0, Math.floor((seconds - from) / step)));
	const shown = seconds >= from;
	const local = shown ? (seconds - from - index * step) / step : 0;
	const pop = shown ? interpolate(local, [0, 0.18, 1], [1.4, 1, 0.92], CLAMP) : 1;
	return (
		<>
			<At x={40} y={160} w={872}>
				<QuestionCard content={content} marks={[]} compact />
			</At>
			<At y={content.question.options.every((option) => option.length <= 6) ? 620 : 860} w={952}>
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<div style={{width: u(480), height: u(480), borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`, boxShadow: `0 0 0 ${u(18)}px rgba(234,88,12,${shown ? 0.35 : 0.1})`}}>
						<Text size={TYPE.adScale.numeral} weight={TYPE.weights.kinetic} color={shown ? ORANGE : WHITE}>
							{shown ? String(3 - index) : '?'}
						</Text>
					</div>
				</div>
			</At>
			{[0, 1, 2].map((tick) => (
				<SoundEffect key={tick} id="countdownTick" atSeconds={from + tick * step} volume={0.7} />
			))}
		</>
	);
};

const WorkView: React.FC<{content: Content; lines: string[]; result?: string; marks: Mark[]; art?: Art; seconds: number}> = ({content, lines, result, marks, art, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const count = lines.length + (result ? 1 : 0);
	const step = Math.max(0.35, (total - 0.9) / Math.max(1, count));
	const at = (index: number) => 0.15 + index * step;
	const shown = (index: number) => ease(interpolate(seconds, [at(index), at(index) + 0.25], [0, 1], CLAMP));
	const resultIndex = lines.length;
	return (
		<>
			{art ? (
				<Centered y={120}>
					<div style={{transform: 'scale(0.8)', transformOrigin: 'top center', height: u(560)}}>
						<Drawing art={art} />
					</div>
				</Centered>
			) : null}
			<At x={60} y={art ? 720 : 300} w={832}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(art ? 22 : 36)}}>
					{lines.map((text, index) => (
						<div key={index} style={{opacity: shown(index), transform: `translateX(${(1 - shown(index)) * u(-40)}px)`}}>
							<Text size={art ? 64 : 80} weight={TYPE.weights.display} color={INK} style={{lineHeight: 1.15}}>
								{text}
							</Text>
						</div>
					))}
					{result ? (
						<div style={{alignSelf: 'flex-start', padding: `${u(14)}px ${u(30)}px`, borderRadius: u(20), background: ORANGE, opacity: shown(resultIndex), transform: `scale(${interpolate(shown(resultIndex), [0, 1], [1.3, 1])})`}}>
							<Text size={86} weight={TYPE.weights.kinetic} color={WHITE}>
								{result}
							</Text>
						</div>
					) : null}
				</div>
			</At>
			{marks.length > 0 ? (
				<At x={40} y={1210} w={872}>
					<Options options={content.question.options} marks={marks} size={46} markAt={Math.max(0.3, total - 1.2)} />
				</At>
			) : null}
			{lines.map((_, index) => (
				<SoundEffect key={index} id="chalk" atSeconds={at(index)} volume={0.35} />
			))}
			{result ? <SoundEffect id="impact" atSeconds={at(resultIndex)} volume={0.45} /> : null}
			{marks.some((mark) => mark.state === 'correct') ? <SoundEffect id="correctAnswer" atSeconds={Math.max(0.3, total - 1.2)} volume={0.6} /> : null}
			{marks.some((mark) => mark.state === 'wrong') && !marks.some((mark) => mark.state === 'correct') ? <SoundEffect id="warning" atSeconds={Math.max(0.3, total - 1.2)} volume={0.6} /> : null}
		</>
	);
};

const CompareView: React.FC<{content: Content; pick: [number, number]; marks: Mark[]; title?: string; seconds: number}> = ({content, pick, marks, title, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const markAt = Math.max(0.6, total - 1.3);
	const markIn = ease(interpolate(seconds, [markAt, markAt + 0.3], [0, 1], CLAMP));
	return (
		<>
			{title ? (
				<At y={150} w={952}>
					<Text size={84} weight={TYPE.weights.kinetic} color={INK} align="center">
						{title}
					</Text>
				</At>
			) : null}
			<At x={40} y={title ? 400 : 300} w={872}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(60)}}>
					{pick.map((index, order) => {
						const state = markOf(marks, index);
						const tone = state === 'correct' ? GREEN : state === 'wrong' ? RED : INK;
						const land = ease(interpolate(seconds, [0.1 + order * 0.25, 0.45 + order * 0.25], [0, 1], CLAMP));
						return (
							<div key={index} style={{padding: u(36), borderRadius: u(30), background: WHITE, border: `${u(5)}px solid ${markIn > 0 && state ? tone : INK}`, opacity: land, transform: `translateX(${(1 - land) * (order === 0 ? -1 : 1) * u(120)}px) scale(${1 + 0.04 * (state === 'correct' ? markIn : 0)})`, display: 'flex', gap: u(20), alignItems: 'center'}}>
								<Text size={56} weight={TYPE.weights.kinetic} color={markIn > 0 && state ? tone : ORANGE}>
									{`${'ABCDE'[index]})`}
								</Text>
								<Text size={62} weight={TYPE.weights.strong} color={INK} style={{lineHeight: 1.25, flex: 1}}>
									<Marked text={content.question.options[index]} />
								</Text>
								{markIn > 0 && state ? <Icon name={state === 'correct' ? 'check' : 'x'} size={u(60)} color={tone} stroke={3.4} /> : null}
							</div>
						);
					})}
				</div>
			</At>
			<SoundEffect id="cardFlip" atSeconds={0.1} volume={0.5} />
			{marks.some((mark) => mark.state === 'correct') ? <SoundEffect id="correctAnswer" atSeconds={markAt} volume={0.6} /> : null}
		</>
	);
};

const TagView: React.FC<{text: string; sub?: string; art?: Art}> = ({text, sub, art}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const stamp = useLand(0.1, 260, 14);
	const wobble = Math.sin(seconds * 3) * 1.5;
	return (
		<>
			{art ? (
				<Centered y={130}>
					<div style={{transform: 'scale(0.85)', transformOrigin: 'top center', height: u(620)}}>
						<Drawing art={art} />
					</div>
				</Centered>
			) : null}
			<At y={art ? 820 : 520} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30)}}>
					<div style={{padding: `${u(20)}px ${u(50)}px`, borderRadius: u(24), border: `${u(10)}px solid ${RED}`, transform: `rotate(${-6 + wobble}deg) scale(${interpolate(stamp, [0, 1], [2, 1])})`, opacity: Math.min(1, stamp * 1.5)}}>
						<Text size={170} weight={TYPE.weights.kinetic} color={RED} style={{letterSpacing: '0.04em'}}>
							{text}
						</Text>
					</div>
					{sub ? (
						<div style={{padding: `0 ${u(60)}px`}}>
							<Text size={68} weight={TYPE.weights.display} color={INK} align="center" style={{lineHeight: 1.2}}>
								{sub}
							</Text>
						</div>
					) : null}
				</div>
			</At>
			<SoundEffect id="impact" atSeconds={0.1} volume={0.5} />
		</>
	);
};

const CloseView: React.FC<{text: string}> = ({text}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const land = useLand(0.05, 180, 20);
	const blink = Math.floor(seconds * 2.2) % 2 === 0;
	return (
		<>
			<At x={60} y={260} w={832}>
				<div style={{padding: u(44), borderRadius: u(34), background: WHITE, border: `${u(4)}px dashed ${ORANGE}`, opacity: Math.min(1, land * 1.5), transform: `translateY(${(1 - land) * u(60)}px)`, display: 'flex', flexDirection: 'column', gap: u(28)}}>
					<Text size={44} weight={TYPE.weights.kinetic} color={ORANGE} style={{textTransform: 'uppercase', letterSpacing: '0.05em'}}>
						Sıradaki soru
					</Text>
					<div style={{display: 'flex', alignItems: 'center', gap: u(10), minHeight: u(220)}}>
						<Text size={140} weight={TYPE.weights.kinetic} color={INK}>
							{blink ? '▍' : ' '}
						</Text>
					</div>
				</div>
			</At>
			<At y={820} w={952}>
				<div style={{padding: `0 ${u(50)}px`}}>
					<Slam text={text} at={0.3} size={TYPE.adScale.hook} color={INK} sound={null} />
				</div>
			</At>
			<SoundEffect id="typing" atSeconds={0.2} seconds={0.6} volume={0.4} />
		</>
	);
};

const BeatScene: React.FC<{content: Content; view: z.infer<typeof ViewSchema>; seconds: number}> = ({content, view, seconds}) => {
	const body = (() => {
		switch (view.type) {
			case 'hook':
				return <HookView text={view.text} art={view.art} />;
			case 'art':
				return <ArtView art={view.art} title={view.title} />;
			case 'question':
				return <QuestionView content={content} label={view.label} marks={view.marks} />;
			case 'countdown':
				return <CountdownView content={content} seconds={seconds} />;
			case 'work':
				return <WorkView content={content} lines={view.lines} result={view.result} marks={view.marks} art={view.art} seconds={seconds} />;
			case 'compare':
				return <CompareView content={content} pick={view.pick} marks={view.marks} title={view.title} seconds={seconds} />;
			case 'tag':
				return <TagView text={view.text} sub={view.sub} art={view.art} />;
			case 'close':
				return <CloseView text={view.text} />;
		}
	})();
	return <Stage series={content.series}>{body}</Stage>;
};

const SAMPLE: z.input<typeof SoruyaCevirdikSchema> = {
	question: {text: 'Bir silindirin yarıçapı 6 cm, yüksekliği 10 cm. π = 3 alınırsa hacmi kaç cm³ olur?', options: ['360', '540', '720', '1080', '1200']},
	beats: [
		{id: 'hook', narration: 'Hayattaki her şeyden bir TYT sorusu çıkar.', view: {type: 'hook', text: 'Çaydanlıktan TYT sorusu çıkar mı?', art: {kind: 'teapot'}}},
		{id: 'shape', narration: 'Çaydanlık aslında bir silindir.', view: {type: 'art', art: {kind: 'teapot', morph: [0, 1], r: 'r = 6', h: 'h = 10'}}},
		{id: 'question', narration: 'Hacmi kaç santimetreküp?', view: {type: 'question', label: 'Soru'}},
		{id: 'countdown', narration: 'Hadi, düşün!', minSeconds: 1.8, view: {type: 'countdown'}},
		{id: 'solve', narration: 'Pi çarpı yarıçapın karesi çarpı yükseklik. 3 çarpı 36 çarpı 10, 1080.', view: {type: 'work', lines: ['V = π · r² · h', '3 · 36 · 10'], result: '1080 cm³', marks: [{index: 3, state: 'correct'}]}},
		{id: 'close', narration: 'Sırada ne var? Yoruma yaz.', view: {type: 'close', text: 'Sırada ne var? Yoruma yaz.'}},
	],
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const say = createNarrator(voiceClips, content.script);
	return content.beats.map((beat) => {
		const estimate = estimateReadingSeconds([beat.narration], {baseSeconds: 0.8, minSeconds: beat.minSeconds, maxSeconds: 9});
		const slot = say(beat.id, beat.narration, Math.max(estimate, beat.minSeconds), beat.minSeconds);
		return {id: beat.id, seconds: slot.seconds, label: beat.id, voice: [slot], element: <BeatScene content={content} view={beat.view} seconds={slot.seconds} />};
	});
};

export const SoruyaCevirdik = defineTemplate({
	id: 'SoruyaCevirdik',
	category: 'Advertisements',
	title: 'Soruya çevirdik',
	description: 'Kareli defter sayfasında bir seri: hayattan bir şey (ya da gerçek bir yorum) TYT tarzı soruya çevrilir. Çizim (çaydanlık → silindir, kale, 3 × 3 tablo, yorum kartı, skor kutuları), soru kartı, 3-2-1 geri sayım, adım adım çözüm, şık işaretleme, tuzak damgası; uygulama kartı yok, soruyla biter, köşede küçük logo.',
	contentSchema: SoruyaCevirdikSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 28, max: 46},
	buildScenes,
});
