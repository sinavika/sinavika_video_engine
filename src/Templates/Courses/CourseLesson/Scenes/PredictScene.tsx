import React from 'react';
import {Easing, interpolate} from 'remotion';
import {easeFrom} from '../../../../Animations/Motion';
import {Animated} from '../../../../Components/Animations/Animated';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Countdown} from '../../../../Components/Overlays/Countdown';
import {Badge} from '../../../../Components/Typography/Badge';
import {RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {CourseVisual} from '../../../../Components/Visuals/CourseVisual';
import {useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {VisualTimelineProvider} from '../../../../Components/Visuals/VisualTimeline';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {type LessonCard, OPTION_LETTERS} from '../../../../Courses/LessonScript';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {useTheme} from '../../../../Themes/ThemeContext';
import {StudioHeading, TYPE, useStudio, useVisualBox} from './LessonChrome';

type PredictCard = Extract<LessonCard, {kind: 'predict'}>;

/** When the parts of a predict card happen, in seconds into its scene. */
type PredictTiming = {thinkAt: number; thinkSeconds: number; beatStarts: number[]; beatEnds: number[]; explainAt: number};

/** Smallest size a predict card's text may take; text that needs less says too much for the card (it warns). */
const PREDICT_MIN_SCALE = 0.6;

const PREDICT_SEARCH_STEPS = 7;

/** An unseen copy of the text, laid out at the column's width only to be measured. */
const PREDICT_GHOST: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: 0, visibility: 'hidden', pointerEvents: 'none'};

/**
 * Fits a predict card's text column. Its layout changes during the scene (the question shrinks when it steps aside,
 * the explanation comes in later), so a FitBox, which measures the layout it is mounted with, cannot fit it: long text
 * ran over the badge and the progress bar. Two unseen copies hold the text as read and as explained; the largest
 * scale at which both fit the column is set on the visible text at every frame, so all frames of a render agree.
 */
const usePredictFit = (content: string) => {
	const columnRef = React.useRef<HTMLDivElement>(null);
	const textRef = React.useRef<HTMLDivElement>(null);
	const startRef = React.useRef<HTMLDivElement>(null);
	const endRef = React.useRef<HTMLDivElement>(null);
	const fitted = React.useRef({key: '', scale: 1});
	React.useLayoutEffect(() => {
		const column = columnRef.current;
		const text = textRef.current;
		const states = [startRef.current, endRef.current];
		if (!column || !text || !states[0] || !states[1]) return;
		const key = `${column.clientWidth}x${column.clientHeight}:${content}`;
		if (fitted.current.key !== key) {
			const room = column.getBoundingClientRect().height;
			const fitsAt = (scale: number) =>
				states.every((state) => {
					state!.style.zoom = String(scale);
					return state!.getBoundingClientRect().height <= room + 0.5;
				});
			let scale = 1;
			if (!fitsAt(1)) {
				if (!fitsAt(PREDICT_MIN_SCALE)) {
					console.warn(`[PredictScene] Text overflows even at ${PREDICT_MIN_SCALE}x: "${content.slice(0, 80)}"`);
					scale = PREDICT_MIN_SCALE;
				} else {
					let [low, high] = [PREDICT_MIN_SCALE, 1];
					for (let step = 0; step < PREDICT_SEARCH_STEPS; step++) {
						const middle = (low + high) / 2;
						if (fitsAt(middle)) low = middle;
						else high = middle;
					}
					scale = low;
				}
			}
			fitted.current = {key, scale};
		}
		text.style.zoom = String(fitted.current.scale);
	});
	return {columnRef, textRef, startRef, endRef};
};

/**
 * The text of a predict card: what it is about, the question, the choices and (once explained) the explanation with
 * the right choice lit. `aside` 0 is the question as read; at 1 it has stepped aside for the figure. The unseen copies
 * that the fit measures are drawn without animation.
 */
const PredictText: React.FC<{card: PredictCard; aside: number; explained: boolean; animate: boolean; explainAt: number; seconds: number}> = ({card, aside, explained, animate, explainAt, seconds}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const lesson = colors.lesson?.fill ?? colors.accent;
	const explanation = (
		<div style={{padding: `${u(18)}px ${u(24)}px`, borderLeft: `${u(10)}px solid ${lesson}`, backgroundColor: withAlpha(lesson, 0.08), borderRadius: u(16)}}>
			<RichText text={card.explanation} size={TYPE.cardBody - 6} />
		</div>
	);
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
			{card.context ? (
				// What the question is about, on screen from the start and read before the choices.
				<div style={{padding: `${u(18)}px ${u(24)}px`, borderLeft: `${u(10)}px solid ${lesson}`, backgroundColor: colors.surface, borderRadius: u(16)}}>
					<RichText text={card.context} size={(TYPE.example + 4) * (1 - 0.2 * aside)} />
				</div>
			) : null}
			<RichText text={card.prompt} size={(TYPE.example + 6) * (1 - 0.3 * aside)} weight={typography.strongWeight} />
			{card.choices.length ? (
				<div style={{display: 'flex', flexDirection: 'column', gap: u(10)}}>
					{card.choices.map((choice, index) => {
						const right = explained && index === card.answer;
						// With the explanation the other choices step back, so the right one stands alone.
						const stepBack = animate && card.answer !== undefined && index !== card.answer ? easeFrom(seconds, explainAt, 0.5) : 0;
						return (
							<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(10)}px ${u(16)}px`, borderRadius: u(16), border: `${u(3)}px solid ${right ? lesson : colors.border}`, backgroundColor: right ? withAlpha(lesson, 0.14) : colors.surface, opacity: 1 - 0.5 * stepBack}}>
								<div style={{width: u(44), height: u(44), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: right ? lesson : colors.surfaceAlt, color: right ? (colors.lesson?.on ?? colors.onAccent) : colors.onSurface, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(24)}}>
									{OPTION_LETTERS[index]}
								</div>
								<RichText text={choice} size={32} />
							</div>
						);
					})}
				</div>
			) : null}
			{explained ? (
				animate ? (
					<Animated animation={{preset: 'slide', direction: 'up', distance: 30}} delaySeconds={explainAt}>
						{explanation}
					</Animated>
				) : (
					explanation
				)
			) : null}
		</div>
	);
};

/**
 * Predict, then see. The question fills the card while it is read; a
 * countdown gives time to think; then the question steps aside, the figure
 * plays its beats, and the explanation comes with the right choice lit.
 */
export const PredictScene: React.FC<{card: PredictCard; timing: PredictTiming; section: string; number: string}> = ({card, timing, section, number}) => {
	const {u, isLandscape} = useVideoLayout();
	const seconds = useSceneSeconds();
	const box = useVisualBox(false);
	const studio = useStudio();
	const showAt = timing.thinkAt + timing.thinkSeconds;
	const aside = interpolate(seconds, [showAt, showAt + 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});
	const explained = seconds >= timing.explainAt;
	const thinking = seconds >= timing.thinkAt && seconds < showAt;
	const fit = usePredictFit([card.context ?? '', card.prompt, ...card.choices, card.explanation].join(' | '));
	const text = (state: {aside: number; explained: boolean; animate: boolean}) => <PredictText card={card} explainAt={timing.explainAt} seconds={seconds} {...state} />;
	return (
		<SafeArea chrome={!studio} gap={SPACING.lg}>
			{/* No leading "?" icon (it read as "?Önce tahmin et") and no second heading under it (owner, 27 Oct 2026). */}
			{studio ? (
				<StudioHeading badge="Önce tahmin et?" />
			) : (
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
					<Badge lesson size={TYPE.label}>
						Önce tahmin et?
					</Badge>
					<Text variant="label" tone="muted" size={TYPE.label}>
						{section} · {number}
					</Text>
				</div>
			)}
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl), alignItems: 'stretch'}}>
				<div ref={fit.columnRef} style={{flex: 1, minWidth: 0, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
					<div ref={fit.textRef}>{text({aside, explained, animate: true})}</div>
					{/* The text as read and as explained, laid out unseen: the fit is taken from them (usePredictFit). */}
					<div ref={fit.startRef} aria-hidden style={PREDICT_GHOST}>
						{text({aside: 0, explained: false, animate: false})}
					</div>
					<div ref={fit.endRef} aria-hidden style={PREDICT_GHOST}>
						{text({aside: 1, explained: true, animate: false})}
					</div>
				</div>
				<div style={{width: box.width, height: box.height, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					{thinking ? (
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(SPACING.md)}}>
							<Countdown left={showAt - seconds} total={timing.thinkSeconds} />
						</div>
					) : null}
					{seconds >= showAt ? (
						<div style={{opacity: aside}}>
							<VisualTimelineProvider beats={card.beats} starts={timing.beatStarts} ends={timing.beatEnds}>
								<CourseVisual visual={card.visual} width={box.width} height={box.height} delaySeconds={showAt} />
							</VisualTimelineProvider>
						</div>
					) : null}
				</div>
			</div>
		</SafeArea>
	);
};
