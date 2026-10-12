import React from 'react';
import {paceSeconds} from '../../../Animations/Motion';
import {Animated, Stagger} from '../../../Components/Animations/Animated';
import {DrawPath} from '../../../Components/Animations/DrawPath';
import {Highlight} from '../../../Components/Animations/Highlight';
import {ProgressBar} from '../../../Components/Animations/ProgressBar';
import {Illustration, naturalIllustrationHeight} from '../../../Components/Illustrations/Illustration';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {ChromeBar, SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {SegmentedProgress} from '../../../Components/Overlays/SegmentedProgress';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import type {ScenePlan} from '../../../Scenes/ScenePlan';
import {SPACING} from '../../../Themes/DesignTokens';
import {useTheme} from '../../../Themes/ThemeContext';
import type {TopicBlock, TopicExplanationContent, TopicSection} from './TopicExplanationSchema';

type Content = TopicExplanationContent;

export const sectionSceneId = (index: number): string => `section-${index + 1}`;

/** Chapter bar: one labelled segment per section. */
export const TopicChrome: React.FC<{content: Content; plan: ScenePlan}> = ({content, plan}) => {
	const {isLandscape} = useVideoLayout();
	return (
		<ChromeBar style={{alignItems: 'flex-start'}}>
			<BrandMark height={40} showName={isLandscape} />
			<SegmentedProgress
				plan={plan}
				sceneIds={content.sections.map((_, index) => sectionSceneId(index))}
				labels={isLandscape ? content.sections.map((section) => section.heading) : undefined}
			/>
		</ChromeBar>
	);
};

export const CoverScene: React.FC<{content: Content}> = ({content}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors, typography} = useTheme();
	return (
		<SafeArea chrome>
			<FitBox fill>
				<div
					style={{
						display: 'flex',
						flexDirection: isLandscape ? 'row' : 'column',
						alignItems: isLandscape ? 'center' : 'stretch',
						gap: u(SPACING.xxl),
					}}
				>
					<div style={{flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
						{content.subject ? (
							<Animated>
								<Badge tone="primary" icon="book">
									{content.subject} · Konu Anlatımı
								</Badge>
							</Animated>
						) : null}
						<Animated delaySeconds={0.15}>
							<Text variant="display" size={isLandscape ? 118 : 104}>
								<Highlight delaySeconds={0.7}>{content.title}</Highlight>
							</Text>
						</Animated>
						{content.subtitle ? (
							<Animated animation="fade" delaySeconds={0.5}>
								<Text variant="subtitle" tone="muted">
									{content.subtitle}
								</Text>
							</Animated>
						) : null}
					</div>
					<Animated delaySeconds={0.6} style={{flex: 1, minWidth: 0}}>
						<Card>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
								<Text variant="label" tone="emphasis">
									Bu derste
								</Text>
								<Stagger delaySeconds={0.9} stepSeconds={0.18} animation={{preset: 'slide', direction: 'left', distance: 40}}>
									{content.sections.map((section, index) => (
										<div key={index} style={{display: 'flex', alignItems: 'baseline', gap: u(SPACING.md)}}>
											<span
												style={{
													fontFamily: typography.display,
													fontWeight: typography.displayWeight,
													fontSize: u(40 * typography.displayScale),
													color: colors.primaryText,
													minWidth: u(56),
												}}
											>
												{String(index + 1).padStart(2, '0')}
											</span>
											<Text size={36} weight={typography.strongWeight}>
												{section.heading}
											</Text>
										</div>
									))}
								</Stagger>
							</div>
						</Card>
					</Animated>
				</div>
			</FitBox>
		</SafeArea>
	);
};

type TopicBlockViewProps = {
	block: TopicBlock;
	width: number;
	delaySeconds: number;
	/** Time until the next block arrives (or the scene ends). */
	spanSeconds: number;
};

const TopicBlockView: React.FC<TopicBlockViewProps> = ({block, width, delaySeconds, spanSeconds}) => {
	const {colors} = useTheme();
	const {u, unit} = useVideoLayout();

	switch (block.kind) {
		case 'paragraph':
			return <RichText text={block.text} size={40} />;
		case 'definition':
			return (
				<Card padding={SPACING.lg} style={{borderLeft: `${u(12)}px solid ${colors.primary}`}}>
					<Text variant="label" tone="muted">
						Tanım
					</Text>
					<Text variant="subtitle" tone="emphasis" style={{margin: `${u(SPACING.xs)}px 0`}}>
						{block.term}
					</Text>
					<RichText text={block.text} size={36} />
				</Card>
			);
		case 'example':
			return (
				<Card tone="alt" padding={SPACING.lg}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
							<Badge tone="accent" icon="pencil">
								Örnek
							</Badge>
							{block.title ? <Text variant="subtitle" size={38}>{block.title}</Text> : null}
						</div>
						<RichText text={block.text} size={38} />
						{block.solution ? (
							<Animated delaySeconds={delaySeconds + Math.max(1.4, spanSeconds * 0.55)}>
								<div style={{borderTop: `${u(3)}px dashed ${colors.border}`, paddingTop: u(SPACING.md)}}>
									<Text variant="label" tone="emphasis" style={{marginBottom: u(SPACING.xs)}}>
										Çözüm
									</Text>
									<RichText text={block.solution} size={42} />
								</div>
							</Animated>
						) : null}
					</div>
				</Card>
			);
		case 'formula':
			return (
				<Card tone="primary" padding={SPACING.lg}>
					<Text size={60} align="center">
						<MathExpression latex={block.latex} display style={{margin: 0}} />
					</Text>
					{block.caption ? (
						<Text tone="muted" align="center" size={28} style={{marginTop: u(SPACING.sm)}}>
							{block.caption}
						</Text>
					) : null}
				</Card>
			);
		case 'bullets':
			return (
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					<Stagger delaySeconds={delaySeconds} stepSeconds={paceSeconds(spanSeconds, block.items.length, {leadSeconds: 0, maxSeconds: 4})}>
						{block.items.map((item, index) => (
							<Card key={index} padding={SPACING.md} elevated={false}>
								<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
									<div style={{width: u(16), height: u(16), borderRadius: '50%', backgroundColor: colors.accent, flexShrink: 0}} />
									<RichText text={item} size={38} style={{minWidth: 0, flex: 1}} />
								</div>
							</Card>
						))}
					</Stagger>
				</div>
			);
		case 'visual':
			return (
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.sm)}}>
					<Illustration
						visual={block.visual}
						width={width}
						height={u(naturalIllustrationHeight(block.visual, width, unit))}
						delaySeconds={delaySeconds + 0.2}
					/>
					{block.caption ? (
						<Text tone="muted" align="center" size={28}>
							{block.caption}
						</Text>
					) : null}
				</div>
			);
	}
};

type SectionSceneProps = {section: TopicSection; index: number; total: number; seconds: number};

/** A lecture slide: an editorial heading column next to (or above) the section's blocks. */
export const SectionScene: React.FC<SectionSceneProps> = ({section, index, total, seconds}) => {
	const {isLandscape, contentWidth, u} = useVideoLayout();
	const {colors} = useTheme();
	const number = String(index + 1).padStart(2, '0');
	const gap = u(isLandscape ? SPACING.xxl : SPACING.lg);
	const headingWidth = contentWidth * 0.3;
	const blocksWidth = isLandscape ? contentWidth - headingWidth - gap : contentWidth;
	// Blocks arrive one by one, spread over the scene so each gets time to be read.
	const interval = paceSeconds(seconds, section.blocks.length, {leadSeconds: 2, minSeconds: 0.6, maxSeconds: 12});

	const heading = isLandscape ? (
		<div style={{width: headingWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(SPACING.md)}}>
			<Animated animation="fade">
				<Text variant="display" size={230} color={colors.canvasAccent} style={{lineHeight: 0.9}}>
					{number}
				</Text>
			</Animated>
			<ProgressBar value={1} delaySeconds={0.2} durationSeconds={0.7} height={8} color={colors.canvasAccent} trackColor="transparent" style={{width: '45%'}} />
			<Animated delaySeconds={0.25}>
				<Text variant="title">{section.heading}</Text>
			</Animated>
			<Text variant="label" tone="muted">
				Bölüm {index + 1} / {total}
			</Text>
		</div>
	) : (
		<Animated style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md), flexShrink: 0}}>
			<Text variant="display" size={120} color={colors.canvasAccent} style={{lineHeight: 0.9}}>
				{number}
			</Text>
			<Text variant="title" style={{flex: 1, minWidth: 0}}>
				{section.heading}
			</Text>
		</Animated>
	);

	return (
		<SafeArea chrome style={{flexDirection: isLandscape ? 'row' : 'column', gap}}>
			{heading}
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					{section.blocks.map((block, blockIndex) => {
						const delaySeconds = 0.5 + blockIndex * interval;
						return (
							<Animated key={blockIndex} delaySeconds={delaySeconds}>
								<TopicBlockView block={block} width={blocksWidth} delaySeconds={delaySeconds} spanSeconds={interval} />
							</Animated>
						);
					})}
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const SummaryScene: React.FC<{content: Content; seconds: number}> = ({content, seconds}) => {
	const {isLandscape, u} = useVideoLayout();
	const {colors} = useTheme();
	const {summary} = content;
	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '16%', paddingRight: '16%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					<Animated>
						<Text variant="label" tone="emphasis" size={30}>
							{content.title}
						</Text>
						<Text variant="headline">{summary.title}</Text>
					</Animated>
					{summary.points.map((point, index) => {
						const delaySeconds = 1 + index * paceSeconds(seconds, summary.points.length, {leadSeconds: 2, maxSeconds: 5});
						return (
							<Animated key={index} delaySeconds={delaySeconds}>
								<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
									<svg width={u(60)} height={u(60)} viewBox="0 0 60 60" style={{flexShrink: 0}}>
										<circle cx={30} cy={30} r={28} fill={colors.success} />
										<DrawPath d="M17 31l9 9 17-19" stroke={colors.onStatus} strokeWidth={6} delaySeconds={delaySeconds + 0.2} durationSeconds={0.35} />
									</svg>
									<RichText text={point} size={40} style={{flex: 1, minWidth: 0}} />
								</div>
							</Animated>
						);
					})}
				</div>
			</FitBox>
		</SafeArea>
	);
};
