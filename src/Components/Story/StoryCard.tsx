import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SoundEffectId} from '../../Configurations/SoundEffects';
import {useTheme} from '../../Themes/ThemeContext';
import {SoundEffect} from '../Sounds/SoundEffect';
import {STORY_COLORS, useStoryLook, type StoryTone} from './StoryLook';
import {HandMark, Highlight, Paper} from './StoryMaterial';

/**
 * The story reels' cards, all of one material (StoryMaterial): a sticky note, a test paper, a topic list, a net chart,
 * compared bars and a question card. Each drops in at `at` as a sheet lands on a desk (a little too big and tilted,
 * then flat) with its own sound, and draws its marks on the voice: `marks` times come from phraseCues or subBeats.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const settle = (value: number) => 1 - (1 - value) ** 3;

const useSeconds = () => useCurrentFrame() / useVideoConfig().fps;

/** A card's landing: scale, tilt and opacity `seconds` after it starts at `at`. */
export const landing = (seconds: number, at: number, tilt = 0): {opacity: number; transform: string} => {
	const land = settle(interpolate(seconds, [at, at + 0.24], [0, 1], CLAMP));
	return {opacity: seconds < at ? 0 : Math.min(1, land * 1.6), transform: `scale(${1.18 - 0.18 * land}) rotate(${tilt + (1 - land) * 5}deg)`};
};

const Land: React.FC<{at: number; tilt?: number; sound?: SoundEffectId | null; children: React.ReactNode}> = ({at, tilt = 0, sound = 'pop', children}) => {
	const seconds = useSeconds();
	const look = landing(seconds, at, tilt);
	return (
		<div style={{display: 'inline-block', ...look}}>
			{children}
			{sound ? <SoundEffect id={sound} atSeconds={at} volume={0.8} /> : null}
		</div>
	);
};

const useHand = () => {
	const {typography} = useTheme();
	return {display: typography.display, body: typography.body};
};

/** A sticky note with a line in marker; tilted, with a strip of tape. */
export const StickyNote: React.FC<{text: string; at?: number; width?: number; color?: string; tilt?: number; tone?: StoryTone; sound?: SoundEffectId | null}> = ({text, at = 0, width = 420, color, tilt = -4, tone, sound}) => {
	const font = useHand();
	const look = useStoryLook();
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} height={width * 0.86} color={color ?? look.sticky} tone={tone} padding={40} style={{borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', top: -18, left: '50%', width: 140, height: 40, marginLeft: -70, background: 'rgba(255,255,255,0.55)', transform: 'rotate(3deg)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)'}} />
				<div style={{fontFamily: font.display, fontWeight: 800, fontSize: width * 0.11, lineHeight: 1.18, textAlign: 'center', color: STORY_COLORS.ink}}>{text}</div>
			</Paper>
		</Land>
	);
};

/** One answer row of a test paper: the question number, the student's choice and how it is marked. */
type ExamRow = {number: number; choice: string; result: 'right' | 'wrong' | 'blank'; at?: number};

/**
 * A test paper (deneme kâğıdı): a header with the test's name, a column of answers marked in red and green pen as the
 * voice reads them, and the net written at the bottom when `net` is given.
 */
export const ExamSheet: React.FC<{title: string; rows: readonly ExamRow[]; net?: {text: string; at: number}; at?: number; width?: number; tilt?: number; tone?: StoryTone; sound?: SoundEffectId | null}> = ({title, rows, net, at = 0, width = 640, tilt = 2, tone, sound = 'flip'}) => {
	const font = useHand();
	const seconds = useSeconds();
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} tone={tone} ruled padding={48} style={{paddingLeft: 104}}>
				<div style={{fontFamily: font.display, fontWeight: 800, fontSize: 40, marginBottom: 22, color: STORY_COLORS.ink}}>{title}</div>
				{rows.map((row) => {
					const markAt = row.at ?? at + 0.3;
					return (
						<div key={row.number} style={{position: 'relative', display: 'flex', alignItems: 'center', height: 57, fontFamily: font.body, fontSize: 36, fontWeight: 700, color: STORY_COLORS.pencil}}>
							<span style={{width: 70}}>{row.number}.</span>
							<span style={{width: 60, color: row.result === 'blank' ? '#94A3B8' : STORY_COLORS.bluePen}}>{row.result === 'blank' ? '—' : row.choice}</span>
							{row.result === 'blank' ? null : <HandMark kind={row.result === 'right' ? 'check' : 'cross'} at={markAt} width={50} color={row.result === 'right' ? STORY_COLORS.greenPen : STORY_COLORS.redPen} strokeWidth={7} />}
							{row.result !== 'blank' ? <SoundEffect id={row.result === 'right' ? 'uiTap' : 'warning'} atSeconds={markAt} volume={0.45} /> : null}
						</div>
					);
				})}
				{net ? (
					<div style={{marginTop: 18, fontFamily: font.display, fontWeight: 800, fontSize: 52, color: STORY_COLORS.redPen, opacity: seconds < net.at ? 0 : 1, transform: `rotate(-4deg) scale(${1 + 0.2 * interpolate(seconds, [net.at, net.at + 0.1, net.at + 0.3], [0, 1, 0], CLAMP)})`, transformOrigin: 'left center'}}>
						{net.text}
					</div>
				) : null}
			</Paper>
		</Land>
	);
};

/** A topic list: done topics ticked in green; missing ones circled in red as the voice names them. */
export const TopicList: React.FC<{title: string; items: readonly {text: string; ok: boolean; at?: number}[]; at?: number; width?: number; tilt?: number; tone?: StoryTone; sound?: SoundEffectId | null}> = ({title, items, at = 0, width = 640, tilt = -2, tone, sound = 'pop'}) => {
	const font = useHand();
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} tone={tone} padding={48}>
				<div style={{fontFamily: font.display, fontWeight: 800, fontSize: 42, marginBottom: 20}}>{title}</div>
				{items.map((item, index) => {
					const markAt = item.at ?? at + 0.3 + index * 0.18;
					return (
						<div key={index} style={{display: 'flex', alignItems: 'center', gap: 22, height: 72, fontFamily: font.body, fontWeight: 700, fontSize: 38}}>
							<div style={{position: 'relative', width: 44, height: 44, borderRadius: 10, border: `4px solid ${STORY_COLORS.pencil}`}}>
								{item.ok ? <HandMark kind="check" at={markAt} width={56} color={STORY_COLORS.greenPen} strokeWidth={8} style={{position: 'absolute', left: -2, top: -14}} /> : null}
							</div>
							<span style={{position: 'relative', color: item.ok ? STORY_COLORS.pencil : STORY_COLORS.ink}}>
								{item.ok ? item.text : <Highlight at={markAt}>{item.text}</Highlight>}
								{item.ok ? null : <HandMark kind="circle" at={markAt + 0.15} width={item.text.length * 24 + 60} height={80} style={{position: 'absolute', left: -30, top: -18}} />}
							</span>
						</div>
					);
				})}
			</Paper>
		</Land>
	);
};

/** The net chart's title: its top and type size; it takes one line of 1.2 × its size. */
const NET_TITLE = {top: 26, size: 38};
/** How far a value sits above its point: the last one higher, over the circle ringed round its point. */
const VALUE_ABOVE = 24;
const LAST_VALUE_ABOVE = 58;
const VALUE_SIZE = 30;

/**
 * Where the net chart draws its points and their values. The plot starts below the title with room for the highest
 * value above its point, so a value never runs into the title (a curve that starts at its top, "100" on "Aklında
 * kalan", Sosyal Medya 16 Nov 2026).
 */
export const netChartLayout = (values: readonly number[], width: number) => {
	const height = width * 0.66;
	const titleBottom = NET_TITLE.top + NET_TITLE.size * 1.2;
	// The highest a value can stand: the last point's, ringed, LAST_VALUE_ABOVE over the point and its own type above that.
	const top = titleBottom + LAST_VALUE_ABOVE + VALUE_SIZE + 6;
	const plot = {left: 70, top, width: width - 130, height: height - top - 90};
	const min = Math.min(...values) - 5;
	const max = Math.max(...values) + 5;
	const points = values.map((value, index) => [plot.left + (plot.width * index) / Math.max(1, values.length - 1), plot.top + plot.height * (1 - (value - min) / (max - min))] as const);
	const valueY = points.map(([, y], index) => y - (index === values.length - 1 ? LAST_VALUE_ABOVE : VALUE_ABOVE));
	return {height, titleBottom, points, valueY, valueSize: VALUE_SIZE};
};

/**
 * A net chart on graph paper: one point per test, joined by a line drawn from `at` over `draw` seconds; the last point
 * is ringed. `flat` draws it as stuck (no rise), so a voice saying "netlerin yerinde sayıyor" is seen.
 */
export const NetChart: React.FC<{title: string; values: readonly number[]; labels?: readonly string[]; at?: number; draw?: number; width?: number; tilt?: number; tone?: StoryTone; sound?: SoundEffectId | null}> = ({title, values, labels, at = 0, draw = 0.8, width = 760, tilt = 1, tone, sound = 'flip'}) => {
	const font = useHand();
	const seconds = useSeconds();
	const look = useStoryLook();
	const {height, points, valueY} = netChartLayout(values, width);
	const drawn = interpolate(seconds, [at + 0.25, at + 0.25 + draw], [0, 1], CLAMP);
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} height={height} tone={tone} padding={0} curl={false} style={{backgroundImage: `repeating-linear-gradient(0deg, transparent 0 39px, #E2E8F0 39px 41px), repeating-linear-gradient(90deg, transparent 0 39px, #E2E8F0 39px 41px)`, backgroundColor: look.paper}}>
				<div style={{position: 'absolute', left: 40, top: NET_TITLE.top, fontFamily: font.display, fontWeight: 800, fontSize: NET_TITLE.size, lineHeight: 1.2}}>{title}</div>
				<svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0}}>
					<polyline points={points.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={STORY_COLORS.bluePen} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
					{points.map(([x, y], index) => {
						const shown = drawn >= index / Math.max(1, points.length - 1) ? 1 : 0;
						return <circle key={index} cx={x} cy={y} r={11} fill={STORY_COLORS.bluePen} opacity={shown} />;
					})}
					{labels?.map((label, index) => (
						<text key={label} x={points[index][0]} y={height - 34} textAnchor="middle" fontFamily={font.body} fontWeight={700} fontSize={28} fill={STORY_COLORS.pencil}>
							{label}
						</text>
					))}
					{values.map((value, index) => (
						<text key={`v${index}`} x={points[index][0]} y={valueY[index]} textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize={30} fill={STORY_COLORS.ink} opacity={drawn >= index / Math.max(1, points.length - 1) ? 1 : 0}>
							{value}
						</text>
					))}
				</svg>
				<HandMark kind="circle" at={at + 0.3 + draw} width={90} style={{position: 'absolute', left: points.at(-1)![0] - 45, top: points.at(-1)![1] - 45}} />
			</Paper>
		</Land>
	);
};

/** Bars compared (e.g. "8 saat çalışan" against "planlı 3 saat"): each fills to `value` (0–1) as the voice names it. */
export const CompareBars: React.FC<{title: string; rows: readonly {label: string; value: number; text: string; tone?: 'accent' | 'muted'; at?: number}[]; at?: number; width?: number; tilt?: number; tone?: StoryTone; sound?: SoundEffectId | null}> = ({title, rows, at = 0, width = 760, tilt = -1, tone, sound = 'pop'}) => {
	const font = useHand();
	const seconds = useSeconds();
	const look = useStoryLook();
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} tone={tone} padding={48}>
				<div style={{fontFamily: font.display, fontWeight: 800, fontSize: 40, marginBottom: 26}}>{title}</div>
				{rows.map((row, index) => {
					const start = row.at ?? at + 0.3 + index * 0.35;
					const filled = settle(interpolate(seconds, [start, start + 0.5], [0, 1], CLAMP));
					const colour = row.tone === 'muted' ? '#94A3B8' : look.cardAccent;
					return (
						<div key={index} style={{marginBottom: 24}}>
							<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: font.body, fontWeight: 700, fontSize: 34, marginBottom: 10}}>
								<span>{row.label}</span>
								<span style={{fontFamily: font.display, fontWeight: 800, color: colour, opacity: filled}}>{row.text}</span>
							</div>
							<div style={{height: 38, borderRadius: 19, background: '#EEF2F7', overflow: 'hidden'}}>
								<div style={{width: `${100 * row.value * filled}%`, height: '100%', borderRadius: 19, background: colour}} />
							</div>
							<SoundEffect id="uiTap" atSeconds={start} volume={0.4} />
						</div>
					);
				})}
			</Paper>
		</Land>
	);
};

/**
 * A question card: the stem, the options, and a wrong choice crossed or the right one circled when `mark` says so (no
 * solution, as the "bu soruyu çözdüm" card and the hook "bu soruyu yanlış çözüyorsan" show).
 */
export const QuestionCard: React.FC<{stem: string; options: readonly string[]; mark?: {option: number; kind: 'wrong' | 'right'; at: number}; at?: number; width?: number; tilt?: number; tone?: StoryTone; label?: string; sound?: SoundEffectId | null}> = ({
	stem,
	options,
	mark,
	at = 0,
	width = 820,
	tilt = 0,
	tone,
	label,
	sound = 'pop',
}) => {
	const font = useHand();
	const look = useStoryLook();
	const letters = ['A', 'B', 'C', 'D', 'E'];
	return (
		<Land at={at} tilt={tilt} sound={sound}>
			<Paper width={width} tone={tone} padding={52} curl={false} style={{borderRadius: 24}}>
				{label ? <div style={{display: 'inline-block', marginBottom: 18, padding: '8px 20px', borderRadius: 999, background: look.chip.background, color: look.chip.ink, fontFamily: font.display, fontWeight: 800, fontSize: 28}}>{label}</div> : null}
				<div style={{fontFamily: font.body, fontWeight: 700, fontSize: 40, lineHeight: 1.32, marginBottom: 26}}>{stem}</div>
				{options.map((option, index) => (
					<div key={index} style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 20, height: 70, fontFamily: font.body, fontWeight: 600, fontSize: 36}}>
						<span style={{width: 52, height: 52, borderRadius: 26, border: `4px solid ${STORY_COLORS.pencil}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.display, fontWeight: 800, fontSize: 28}}>{letters[index]}</span>
						<span>{option}</span>
						{mark && mark.option === index ? (
							<>
								<HandMark kind={mark.kind === 'wrong' ? 'cross' : 'circle'} at={mark.at} width={mark.kind === 'wrong' ? 64 : 76} color={mark.kind === 'wrong' ? STORY_COLORS.redPen : STORY_COLORS.greenPen} style={{position: 'absolute', left: -12, top: mark.kind === 'wrong' ? 3 : -3}} />
								<SoundEffect id={mark.kind === 'wrong' ? 'warning' : 'success'} atSeconds={mark.at} volume={0.6} />
							</>
						) : null}
					</div>
				))}
			</Paper>
		</Land>
	);
};

