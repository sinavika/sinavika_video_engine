import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {animationProgress, paceSeconds} from '../../../Animations/Motion';
import {Animated, Stagger} from '../../../Components/Animations/Animated';
import {Icon, type IconName} from '../../../Components/Illustrations/Icon';
import {Callout} from '../../../Components/Layouts/Callout';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {ChromeBar, SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {SegmentedProgress} from '../../../Components/Overlays/SegmentedProgress';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import type {ScenePlan} from '../../../Scenes/ScenePlan';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import type {ExamPreparationContent, TimePlan} from './ExamPreparationSchema';

type Content = ExamPreparationContent;

/** Coach bar: which part of the briefing is playing. */
export const ExamChrome: React.FC<{content: Content; plan: ScenePlan; labels: Record<string, string>}> = ({content, plan, labels}) => {
	const {isLandscape} = useVideoLayout();
	const sceneIds = plan.scenes.map((scene) => scene.id).filter((id) => id !== OUTRO_SCENE_ID);
	return (
		<ChromeBar style={{alignItems: 'flex-start'}}>
			<BrandMark />
			<Badge tone="primary" icon="flag">
				{content.exam.name}
			</Badge>
			<SegmentedProgress plan={plan} sceneIds={sceneIds} labels={isLandscape ? sceneIds.map((id) => labels[id]) : undefined} />
		</ChromeBar>
	);
};

/** Section heading shared by the briefing screens. */
const ScreenTitle: React.FC<{icon: IconName; label: string; title: string}> = ({icon, label, title}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	return (
		<Animated style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md), flexShrink: 0}}>
			<div
				style={{
					width: u(92),
					height: u(92),
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: colors.accent,
					color: colors.onAccent,
					borderRadius: u(20),
					flexShrink: 0,
				}}
			>
				<Icon name={icon} size={54} />
			</div>
			<div style={{minWidth: 0}}>
				<Text variant="label" tone="muted">
					{label}
				</Text>
				<Text variant="title">{title}</Text>
			</div>
		</Animated>
	);
};

export const ExamInfoScene: React.FC<{content: Content}> = ({content}) => {
	const {isLandscape, u} = useVideoLayout();
	const {exam} = content;
	return (
		<SafeArea chrome>
			<FitBox fill>
				<div
					style={{
						display: 'flex',
						flexDirection: isLandscape ? 'row' : 'column',
						alignItems: isLandscape ? 'center' : 'stretch',
						gap: u(SPACING.xl),
					}}
				>
					<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
						<Animated>
							<Badge tone="accent" icon="flag">
								Sınav Hazırlığı
							</Badge>
						</Animated>
						<Animated delaySeconds={0.15}>
							<Text variant="headline" size={92}>
								{content.title}
							</Text>
						</Animated>
						{exam.description ? (
							<Animated animation="fade" delaySeconds={0.4}>
								<Text variant="subtitle" tone="muted" size={40}>
									{exam.description}
								</Text>
							</Animated>
						) : null}
					</div>
					<div style={{flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: u(SPACING.md)}}>
						<Stagger delaySeconds={0.6} stepSeconds={0.18} animation={{preset: 'scale', easing: 'overshoot'}}>
							{exam.stats.map((stat, index) => (
								<Card key={index} tone={index === 0 ? 'primary' : 'surface'} padding={SPACING.lg} style={{height: '100%'}}>
									<Text variant="headline" size={82} tone="emphasis" style={{whiteSpace: 'nowrap'}}>
										{stat.value}
									</Text>
									<Text variant="label" tone="muted" style={{marginTop: u(SPACING.xs)}}>
										{stat.label}
									</Text>
								</Card>
							))}
						</Stagger>
					</div>
				</div>
			</FitBox>
		</SafeArea>
	);
};

type TimedSceneProps = {content: Content; seconds: number};

export const StrategiesScene: React.FC<TimedSceneProps> = ({content, seconds}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors, typography} = useTheme();
	const count = content.strategies.length;
	const columns = isLandscape ? (count === 4 ? 2 : count) : 1;
	return (
		<SafeArea chrome>
			<ScreenTitle icon="target" label="Strateji" title="Soru Çözüm Stratejileri" />
			<FitBox fill>
				<div style={{display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: u(SPACING.md)}}>
					<Stagger delaySeconds={0.8} stepSeconds={paceSeconds(seconds, count, {leadSeconds: 1.8, minSeconds: 0.5})}>
						{content.strategies.map((strategy, index) => (
							<Card key={index} padding={SPACING.lg} style={{height: '100%'}}>
								<div style={{display: 'flex', gap: u(SPACING.lg), alignItems: 'flex-start'}}>
									<div
										style={{
											fontFamily: typography.display,
											fontWeight: typography.displayWeight,
											fontSize: u(92 * typography.displayScale),
											lineHeight: 0.9,
											color: colors.primaryText,
											flexShrink: 0,
										}}
									>
										{index + 1}
									</div>
									<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.xs), minWidth: 0}}>
										<Text variant="subtitle" size={42}>
											{strategy.title}
										</Text>
										<RichText text={strategy.detail} size={33} tone="muted" />
									</div>
								</div>
							</Card>
						))}
					</Stagger>
				</div>
			</FitBox>
		</SafeArea>
	);
};


/** Stacked bar that allocates the exam's minutes, one segment growing after another. */
const TimeBar: React.FC<{plan: TimePlan; delaySeconds: number; intervalSeconds: number}> = ({plan, delaySeconds, intervalSeconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, shape} = useTheme();
	const {u} = useVideoLayout();
	return (
		<div
			style={{
				display: 'flex',
				height: u(104),
				borderRadius: u(shape.radius.md),
				overflow: 'hidden',
				backgroundColor: withAlpha(colors.border, 0.6),
				border: `${u(shape.borderWidth)}px solid ${colors.border}`,
			}}
		>
			{plan.segments.map((segment, index) => {
				const tone = colors.categorical[index % colors.categorical.length];
				const grown = animationProgress({
					frame,
					fps,
					delaySeconds: delaySeconds + index * intervalSeconds,
					durationSeconds: Math.min(0.6, intervalSeconds),
					easing: 'standard',
				});
				const share = (segment.minutes / plan.totalMinutes) * 100;
				return (
					<div
						key={index}
						style={{
							width: `${(share * grown).toFixed(3)}%`,
							backgroundColor: tone.fill,
							color: tone.on,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
						}}
					>
						<Text size={34} weight={800} color={tone.on} style={{whiteSpace: 'nowrap', opacity: grown > 0.9 && share > 9 ? 1 : 0}}>
							{segment.minutes}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

export const TimePlanScene: React.FC<TimedSceneProps> = ({content, seconds}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors, typography} = useTheme();
	const plan = content.timePlan;
	if (!plan) return null;
	const barAt = 0.8;
	const interval = paceSeconds(seconds, plan.segments.length + (plan.note ? 1 : 0), {leadSeconds: 2.4, maxSeconds: 3});
	return (
		<SafeArea chrome>
			<ScreenTitle icon="clock" label="Süre Yönetimi" title={`${plan.totalMinutes} dakikayı böyle paylaştır`} />
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					<TimeBar plan={plan} delaySeconds={barAt} intervalSeconds={interval} />
					<div style={{display: 'grid', gridTemplateColumns: `repeat(${isLandscape ? 3 : 1}, minmax(0, 1fr))`, gap: u(SPACING.md)}}>
						<Stagger delaySeconds={barAt} stepSeconds={interval} animation="fade">
							{plan.segments.map((segment, index) => (
								<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
									<div
										style={{
											width: u(34),
											height: u(34),
											borderRadius: u(8),
											backgroundColor: colors.categorical[index % colors.categorical.length].fill,
											border: `${u(2)}px solid ${colors.border}`,
											flexShrink: 0,
										}}
									/>
									<Text size={36} style={{flex: 1, minWidth: 0}}>
										{segment.label}
									</Text>
									<Text size={36} weight={typography.strongWeight} style={{whiteSpace: 'nowrap'}}>
										{segment.minutes} dk
									</Text>
								</div>
							))}
						</Stagger>
					</div>
					{plan.note ? (
						<Animated delaySeconds={barAt + plan.segments.length * interval + 0.3}>
							<Callout icon="lightbulb" tone="accent">
								<RichText text={plan.note} size={33} />
							</Callout>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const MistakesScene: React.FC<TimedSceneProps> = ({content, seconds}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors, typography} = useTheme();
	const mark = (icon: IconName, fill: string) => (
		<div
			style={{
				width: u(54),
				height: u(54),
				borderRadius: '50%',
				backgroundColor: fill,
				color: colors.onStatus,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			<Icon name={icon} size={32} strokeWidth={3} />
		</div>
	);
	return (
		<SafeArea chrome>
			<ScreenTitle icon="alert" label="Dikkat" title="Sık Yapılan Hatalar" />
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					{(content.mistakes ?? []).map((mistake, index) => {
						const interval = paceSeconds(seconds, content.mistakes?.length ?? 1, {leadSeconds: 1.8, minSeconds: 1.1});
						const delaySeconds = 0.8 + index * interval;
						return (
							<Animated key={index} delaySeconds={delaySeconds}>
								<Card padding={SPACING.lg}>
									<div
										style={{
											display: 'flex',
											flexDirection: isLandscape ? 'row' : 'column',
											alignItems: isLandscape ? 'center' : 'stretch',
											gap: u(SPACING.md),
										}}
									>
										<div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
											{mark('cross', colors.danger)}
											<Text size={34} tone="muted" style={{textDecoration: 'line-through', flex: 1, minWidth: 0}}>
												{mistake.wrong}
											</Text>
										</div>
										<Animated
											animation={{preset: 'slide', direction: isLandscape ? 'right' : 'up', distance: 40}}
											delaySeconds={delaySeconds + Math.max(0.6, interval * 0.5)}
											style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}
										>
											{mark('check', colors.success)}
											<Text size={36} weight={typography.strongWeight} style={{flex: 1, minWidth: 0}}>
												{mistake.right}
											</Text>
										</Animated>
									</div>
								</Card>
							</Animated>
						);
					})}
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const TipsScene: React.FC<TimedSceneProps> = ({content, seconds}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors, typography} = useTheme();
	const tips = content.tips ?? [];
	return (
		<SafeArea chrome>
			<ScreenTitle icon="lightbulb" label="Kontrol Listesi" title="Sınav İpuçları" />
			<FitBox fill>
				<div style={{display: 'grid', gridTemplateColumns: `repeat(${isLandscape && tips.length > 3 ? 2 : 1}, minmax(0, 1fr))`, gap: u(SPACING.md)}}>
					<Stagger
						delaySeconds={0.8}
						stepSeconds={paceSeconds(seconds, tips.length, {leadSeconds: 2})}
						animation={{preset: 'slide', direction: 'left', distance: 50}}
					>
						{tips.map((tip, index) => (
							<Card key={index} tone="alt" padding={SPACING.md} elevated={false} style={{height: '100%'}}>
								<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
									<div
										style={{
											width: u(60),
											height: u(60),
											borderRadius: u(12),
											backgroundColor: colors.primary,
											color: colors.onPrimary,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontFamily: typography.display,
											fontWeight: typography.displayWeight,
											fontSize: u(32),
											flexShrink: 0,
										}}
									>
										{index + 1}
									</div>
									<RichText text={tip} size={36} style={{flex: 1, minWidth: 0}} />
								</div>
							</Card>
						))}
					</Stagger>
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const MotivationScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {isLandscape, u} = useVideoLayout();
	const motivation = content.motivation;
	if (!motivation) return null;
	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '14%', paddingRight: '14%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(SPACING.lg)}}>
					<Animated animation={{preset: 'scale', easing: 'overshoot'}}>
						<Icon name="quote" size={130} color={colors.canvasAccent} strokeWidth={2.4} />
					</Animated>
					<Animated animation={{preset: 'zoom', durationSeconds: 0.7}} delaySeconds={0.2}>
						<Text variant="headline" align="center" size={78}>
							{motivation.quote}
						</Text>
					</Animated>
					{motivation.author ? (
						<Animated animation="fade" delaySeconds={0.9}>
							<Text variant="subtitle" tone="muted" align="center" size={36}>
								{motivation.author}
							</Text>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};
