import React from 'react';
import {easeFrom} from '../../../../Animations/Motion';
import {Animated} from '../../../../Components/Animations/Animated';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Countdown} from '../../../../Components/Overlays/Countdown';
import {Badge} from '../../../../Components/Typography/Badge';
import {RichInline} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {CourseVisual} from '../../../../Components/Visuals/CourseVisual';
import {useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {VisualTimelineProvider} from '../../../../Components/Visuals/VisualTimeline';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import type {LessonCard} from '../../../../Courses/LessonScript';
import {PRACTICE_TASKS} from '../../../../Courses/LessonSpeech';
import {SPACING} from '../../../../Themes/DesignTokens';
import {useTheme} from '../../../../Themes/ThemeContext';
import {StudioHeading, TYPE, useStudio, useVisualBox} from './LessonChrome';

type PracticeCard = Extract<LessonCard, {kind: 'practice'}>;

/** When the parts of a practice card happen, in seconds into its scene. */
type PracticeTiming = {thinkAt: number; thinkSeconds: number; beatStarts: number[]; beatEnds: number[]};

/** The badge of every practice card. */
const PRACTICE_BADGE = 'Sıra sende';

/** The rail beside the board (layout units): the task, then the countdown, then how many answers have come. */
const RAIL = 260;

/** The items of the board, for the count of answers given. */
const itemCount = (card: PracticeCard): number => {
	const visual = card.visual;
	return visual.kind === 'matching' ? visual.pairs.length : visual.kind === 'flipcards' ? visual.cards.length : visual.kind === 'ordering' ? visual.items.length : 0;
};

/** The rail: the task while it is said, the countdown while the viewer answers, then the answers counted as they come. */
const PracticeRail: React.FC<{card: PracticeCard; timing: PracticeTiming}> = ({card, timing}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const lesson = colors.lesson?.fill ?? colors.accent;
	const showAt = timing.thinkAt + timing.thinkSeconds;
	const task = PRACTICE_TASKS[card.visual.kind as keyof typeof PRACTICE_TASKS]?.shown ?? '';
	const total = itemCount(card);
	// An answer is counted when the beat that focuses its item starts.
	const answered = Array.from({length: total}, (_, index) => {
		const beat = card.beats.findIndex((entry) => entry.focus.some((name) => name.toLocaleLowerCase('tr') === `p${index + 1}`));
		return beat >= 0 && seconds >= (timing.beatStarts[beat] ?? Infinity);
	}).filter(Boolean).length;
	const label = (text: string, size: number, color = lesson) => <div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(size), color, textAlign: 'center', lineHeight: 1.1}}>{text}</div>;
	if (seconds >= timing.thinkAt && seconds < showAt) return <Countdown left={showAt - seconds} total={timing.thinkSeconds} size={200} />;
	if (seconds < timing.thinkAt) return <Animated animation={{preset: 'scale'}} delaySeconds={0.3}>{label(task, 40)}</Animated>;
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(10), opacity: easeFrom(seconds, showAt, 0.4)}}>
			{label(`${answered}/${total}`, 72)}
			{label('Kontrol', 30, colors.onSurface)}
		</div>
	);
};

/**
 * Your turn: the board (matching, flip cards or ordering) on screen from the start, the task beside it, a countdown
 * while the viewer answers in their head, then the answers one by one as the beats say them. The board never hides
 * during the countdown (unlike a prediction, whose figure is the answer): the board is the question.
 */
export const PracticeScene: React.FC<{card: PracticeCard; timing: PracticeTiming; section: string; number: string; sceneSeconds?: number}> = ({card, timing, section, number, sceneSeconds}) => {
	const {u, isLandscape} = useVideoLayout();
	const studio = useStudio();
	const full = useVisualBox(true, false);
	const box = isLandscape ? {width: full.width - u(RAIL + SPACING.lg), height: full.height} : {width: full.width, height: full.height - u(RAIL)};
	return (
		<SafeArea chrome={!studio} gap={SPACING.lg}>
			{studio ? (
				<StudioHeading badge={PRACTICE_BADGE} title={card.title} />
			) : (
				<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md), flexShrink: 0}}>
					<Badge lesson size={TYPE.label}>
						{PRACTICE_BADGE}
					</Badge>
					<Text variant="title" size={TYPE.cardTitle - 8} style={{flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
						<RichInline text={card.title} />
					</Text>
					<Text variant="label" tone="muted" size={TYPE.label}>
						{section} · {number}
					</Text>
				</div>
			)}
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.lg), alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: box.width, height: box.height, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<VisualTimelineProvider beats={card.beats} starts={timing.beatStarts} ends={timing.beatEnds} sceneSeconds={sceneSeconds}>
						<CourseVisual visual={card.visual} width={box.width} height={box.height} delaySeconds={0.3} />
					</VisualTimelineProvider>
				</div>
				<div style={{width: isLandscape ? u(RAIL) : box.width, height: isLandscape ? box.height : u(RAIL), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<PracticeRail card={card} timing={timing} />
				</div>
			</div>
		</SafeArea>
	);
};
