import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Animated, type AnimatedProps} from '../../../Components/Animations/Animated';
import {Icon} from '../../../Components/Illustrations/Icon';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Countdown} from '../../../Components/Overlays/Countdown';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {useSceneSeconds} from '../../../Components/Visuals/VisualFrame';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import type {CampEpisode} from '../../../Courses/Camp';
import type {ChallengeRound} from '../../../Courses/LessonScript';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';

/**
 * The scenes of a challenge reel: rounds that ask, count down and answer,
 * the first one on screen from the first frame with the dare over it, and a
 * closing that asks for the score. In the lesson's colour, like the camp
 * lesson on YouTube (docs/CourseColors.md).
 */

const useTone = () => {
	const {colors} = useTheme();
	return colors.lesson ?? {fill: colors.primary, on: colors.onPrimary};
};

/** A full-bleed page in the lesson colour, as the section openings of the lesson. */
const LessonColourPage: React.FC<{children: React.ReactNode}> = ({children}) => {
	const tone = useTone();
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, backgroundImage: `radial-gradient(circle at 80% 15%, ${withAlpha('#FFFFFF', 0.16)} 0%, transparent 45%)`}}>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.8), emphasis: tone.on}}>{children}</InkProvider>
		</AbsoluteFill>
	);
};

/** Enters like `Animated`, or is simply there: the first round shows its question on the very first frame (the reel's thumbnail and first second). */
const Enter: React.FC<AnimatedProps & {instant: boolean}> = ({instant, children, ...props}) => (instant ? <>{children}</> : <Animated {...props}>{children}</Animated>);

export type RoundTiming = {thinkAt: number; thinkSeconds: number; revealAt: number};

/**
 * One round: the sentence with its word in focus, the question, the choices;
 * a countdown; then the answer lit and why. The first round carries the
 * reel's dare above it and enters without animation.
 */
export const ChallengeRoundScene: React.FC<{round: ChallengeRound; index: number; total: number; title: string; hook?: string; timing: RoundTiming}> = ({round, index, total, title, hook, timing}) => {
	const {colors, typography} = useTheme();
	const tone = useTone();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const thinking = seconds >= timing.thinkAt && seconds < timing.revealAt;
	const revealed = seconds >= timing.revealAt;
	const reveal = interpolate(seconds, [timing.revealAt, timing.revealAt + 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const instant = index === 0;
	return (
		<SafeArea chrome gap={SPACING.lg} style={{justifyContent: 'center'}}>
			{hook ? (
				<div style={{alignSelf: 'flex-start', padding: `${u(16)}px ${u(30)}px`, borderRadius: u(999), backgroundColor: tone.fill}}>
					<Text variant="headline" size={50} color={tone.on}>
						{hook}
					</Text>
				</div>
			) : null}
			<Enter instant={instant} animation={{preset: 'slide', direction: 'down', distance: 24, durationSeconds: 0.3}}>
				<Text variant="label" size={46} color={tone.fill}>
					{title} · Soru {index + 1}/{total}
				</Text>
			</Enter>
			<Enter instant={instant} animation={{preset: 'slide', direction: 'up', distance: 50, durationSeconds: 0.35}} delaySeconds={0.05}>
				<div style={{padding: `${u(40)}px ${u(44)}px`, borderRadius: u(36), backgroundColor: colors.surface, border: `${u(4)}px solid ${withAlpha(tone.fill, 0.25)}`, boxShadow: `0 ${u(18)}px ${u(48)}px ${withAlpha('#000000', 0.08)}`}}>
					<RichText text={round.sentence} size={78} weight={typography.strongWeight} />
				</div>
			</Enter>
			<Enter instant={instant} delaySeconds={0.3}>
				<Text variant="headline" size={66}>
					{round.question}
				</Text>
			</Enter>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(18)}}>
				{round.choices.map((choice, choiceIndex) => {
					const right = choiceIndex === round.answer;
					const lit = revealed && right;
					return (
						<Enter key={choice} instant={instant} animation={{preset: 'slide', direction: 'left', distance: 50}} delaySeconds={0.45 + choiceIndex * 0.12}>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: u(22),
									padding: `${u(24)}px ${u(32)}px`,
									borderRadius: u(28),
									border: `${u(4)}px solid ${lit ? tone.fill : colors.border}`,
									backgroundColor: lit ? tone.fill : colors.surface,
									opacity: revealed && !right ? 1 - 0.55 * reveal : 1,
									transform: `scale(${lit ? 1 + 0.04 * reveal : 1})`,
								}}
							>
								<div style={{width: u(64), height: u(64), borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: lit ? tone.on : withAlpha(tone.fill, 0.12)}}>
									{lit ? <Icon name="check" size={42} color={tone.fill} /> : <Text size={32} weight={BRAND_TYPOGRAPHY.weights.kinetic} color={tone.fill}>{String.fromCharCode(65 + choiceIndex)}</Text>}
								</div>
								<Text size={62} weight={BRAND_TYPOGRAPHY.weights.kinetic} color={lit ? tone.on : colors.onSurface}>
									{choice}
								</Text>
							</div>
						</Enter>
					);
				})}
			</div>
			<div style={{minHeight: u(300), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				{thinking ? <Countdown left={timing.revealAt - seconds} total={timing.thinkSeconds} size={200} /> : null}
				{revealed ? (
					<div style={{opacity: reveal, transform: `translateY(${(1 - reveal) * u(30)}px)`, padding: `${u(28)}px ${u(34)}px`, borderRadius: u(28), backgroundColor: withAlpha(tone.fill, 0.1), borderLeft: `${u(12)}px solid ${tone.fill}`}}>
						<RichText text={round.why} size={64} />
					</div>
				) : null}
			</div>
		</SafeArea>
	);
};

/**
 * The close, one ask: the score in the comments. The camp lesson is named
 * small and silent below it, as where the series lives, not a second ask:
 * a YouTube ask and an app card one after the other drew neither (27 Oct 2026).
 */
export const ChallengeScoreScene: React.FC<{camp: CampEpisode}> = ({camp}) => {
	const tone = useTone();
	const {u} = useVideoLayout();
	return (
		<LessonColourPage>
			<SafeArea chrome gap={SPACING.lg} style={{justifyContent: 'center'}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot', durationSeconds: 0.35}}>
					<Text variant="display" size={170} style={{lineHeight: 0.95}}>
						Kaçta kaç?
					</Text>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 40, durationSeconds: 0.3}} delaySeconds={0.2}>
					<div style={{display: 'inline-flex', padding: `${u(20)}px ${u(38)}px`, borderRadius: u(999), backgroundColor: tone.on}}>
						<Text variant="headline" size={68} color={tone.fill}>
							Yoruma yaz.
						</Text>
					</div>
				</Animated>
				<Animated delaySeconds={0.5}>
					<Text size={40} color={withAlpha(tone.on, 0.8)} style={{marginTop: u(SPACING.lg)}}>
						Konunun tamamı YouTube'da · {camp.name}, Ders {camp.number}
					</Text>
				</Animated>
			</SafeArea>
		</LessonColourPage>
	);
};
