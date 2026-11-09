import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Icon} from '../../../../Components/Illustrations/Icon';
import {FitBox} from '../../../../Components/Layouts/FitBox';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Countdown} from '../../../../Components/Overlays/Countdown';
import {SoundEffect} from '../../../../Components/Sounds/SoundEffect';
import {RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import type {ChallengeRound} from '../../../../Courses/LessonScript';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {useTheme} from '../../../../Themes/ThemeContext';
import {Enter, LessonColourPage, RoundSounds, RoundTiming, useTone} from './ChallengeKit';

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** How long the hook page takes to lift off the first question. */
const LIFT_SECONDS = 0.35;

/**
 * The reel's first second: the hook in big type on the lesson's colour, its
 * words landing one after another (the first already there on frame 0, the
 * reel's thumbnail), while the voice says it; then the page lifts and the
 * first question comes in under it.
 */
const HookPage: React.FC<{text: string; title: string; seconds: number}> = ({text, title, seconds: length}) => {
	const seconds = useSceneSeconds();
	const {u} = useVideoLayout();
	const lift = interpolate(seconds, [length - LIFT_SECONDS, length], [0, 1], {...CLAMP, easing: Easing.in(Easing.cubic)});
	if (lift >= 1) return null;
	const words = text.split(/\s+/);
	return (
		<AbsoluteFill style={{transform: `translateY(${(-lift * 100).toFixed(2)}%)`}}>
			<LessonColourPage>
				<SoundEffect id="impact" atSeconds={0} />
				<SoundEffect id="transitionWhoosh" atSeconds={length - LIFT_SECONDS} />
				<SafeArea reel gap={SPACING.lg} style={{justifyContent: 'center'}}>
					<Text variant="label" size={46} style={{opacity: 0.85}}>
						{title}
					</Text>
					<div style={{display: 'flex', flexWrap: 'wrap', columnGap: u(34), rowGap: u(6)}}>
						{words.map((word, index) => {
							// Every word is there on frame 0; each gives one beat as the voice reaches it.
							const beat = interpolate(seconds, [index * 0.22, index * 0.22 + 0.3], [0, 1], CLAMP);
							return (
								<span key={index} style={{display: 'inline-block', transform: `scale(${(1 + 0.06 * Math.sin(Math.PI * beat)).toFixed(3)})`, transformOrigin: 'center bottom'}}>
									<Text variant="display" size={132} style={{lineHeight: 1.02}}>
										{word}
									</Text>
								</span>
							);
						})}
					</div>
				</SafeArea>
			</LessonColourPage>
		</AbsoluteFill>
	);
};

/**
 * One round: the sentence with its word in focus, the question, the choices;
 * a countdown; then the answer lit and why. The first round opens on the
 * reel's hook (HookPage) and comes in as it lifts. Everything stays inside
 * the reel's safe area (REEL_SAFE_AREA), clear of the platforms' controls,
 * and is scaled down to fit if a sentence runs long.
 */
export const ChallengeRoundScene: React.FC<{round: ChallengeRound; index: number; total: number; title: string; hook?: {text: string; seconds: number}; timing: RoundTiming}> = ({round, index, total, title, hook, timing}) => {
	const {colors, typography} = useTheme();
	const tone = useTone();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const thinking = seconds >= timing.thinkAt && seconds < timing.revealAt;
	const revealed = seconds >= timing.revealAt;
	const reveal = interpolate(seconds, [timing.revealAt, timing.revealAt + 0.35], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
	// The first question comes in as the hook page lifts; the others as their slide arrives.
	const start = hook ? hook.seconds - LIFT_SECONDS * 0.6 : 0;
	return (
		<AbsoluteFill>
			<SafeArea chrome reel gap={0}>
				<RoundSounds index={index} timing={timing} />
				<FitBox minScale={0.7}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
						<Enter instant={false} animation={{preset: 'slide', direction: 'down', distance: 24, durationSeconds: 0.3}} delaySeconds={start}>
							<Text variant="label" size={46} color={tone.fill}>
								{total > 1 ? `${title} · Soru ${index + 1}/${total}` : title}
							</Text>
						</Enter>
						<Enter instant={false} animation={{preset: 'slide', direction: 'up', distance: 50, durationSeconds: 0.35}} delaySeconds={start + 0.05}>
							<div style={{padding: `${u(40)}px ${u(44)}px`, borderRadius: u(36), backgroundColor: colors.surface, border: `${u(4)}px solid ${withAlpha(tone.fill, 0.25)}`, boxShadow: `0 ${u(18)}px ${u(48)}px ${withAlpha('#000000', 0.08)}`}}>
								<RichText text={round.sentence} size={78} weight={typography.strongWeight} />
							</div>
						</Enter>
						<Enter instant={false} delaySeconds={start + 0.3}>
							<Text variant="headline" size={66}>
								{round.question}
							</Text>
						</Enter>
						<div style={{display: 'flex', flexDirection: 'column', gap: u(18)}}>
							{round.choices.map((choice, choiceIndex) => {
								const right = choiceIndex === round.answer;
								const lit = revealed && right;
								return (
									<Enter key={choice} instant={false} animation={{preset: 'slide', direction: 'left', distance: 50}} delaySeconds={start + 0.45 + choiceIndex * 0.12}>
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
												transform: `scale(${lit ? 1 + 0.03 * reveal : 1})`,
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
						{/* The answer's place is held from the start (the why, hidden until the reveal) so the fit never changes mid-round; the countdown sits over it. */}
						<div style={{position: 'relative', minHeight: u(260), display: 'flex', alignItems: 'center'}}>
							<div style={{opacity: revealed ? reveal : 0, transform: `translateY(${(1 - reveal) * u(30)}px)`, padding: `${u(28)}px ${u(34)}px`, borderRadius: u(28), backgroundColor: withAlpha(tone.fill, 0.1), borderLeft: `${u(12)}px solid ${tone.fill}`}}>
								<RichText text={round.why} size={64} />
							</div>
							{thinking ? (
								<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Countdown left={timing.revealAt - seconds} total={timing.thinkSeconds} size={200} />
								</div>
							) : null}
						</div>
					</div>
				</FitBox>
			</SafeArea>
			{hook ? <HookPage text={hook.text} title={title} seconds={hook.seconds} /> : null}
		</AbsoluteFill>
	);
};
