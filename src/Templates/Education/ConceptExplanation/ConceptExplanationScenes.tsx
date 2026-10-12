import React from 'react';
import {Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Animated} from '../../../Components/Animations/Animated';
import {Highlight} from '../../../Components/Animations/Highlight';
import {Typewriter} from '../../../Components/Animations/Typewriter';
import {ConceptMap} from '../../../Components/Illustrations/ConceptMap';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Illustration} from '../../../Components/Illustrations/Illustration';
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
import {activeSceneIndex, planScenes, type ScenePlan} from '../../../Scenes/ScenePlan';
import {visualNodeCount} from '../../../Schemas/Visual';
import {CHROME_HEIGHT, SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import type {ConceptExplanationContent, ConceptStep} from './ConceptExplanationSchema';

type Content = ConceptExplanationContent;

const FOCUS_IN_SECONDS = 0.4;
const FOCUS_OUT_SECONDS = 0.3;
const TYPING_SPEED = 16;

/**
 * Highlight level (0-1) of every visual node at `frame`. A node ramps up when
 * a step that focuses on it begins and down when it ends; it stays lit across
 * consecutive steps that both focus on it.
 */
export const focusLevelsAt = (
	nodeCount: number,
	steps: readonly (readonly number[])[],
	plan: ScenePlan,
	frame: number,
	fps: number,
): number[] =>
	Array.from({length: nodeCount}, (_, node) =>
		steps.reduce((level, focus, index) => {
			if (!focus.includes(node)) return level;
			const {from, durationInFrames} = plan.scenes[index];
			const end = from + durationInFrames;
			const heldFromPrevious = index > 0 && steps[index - 1].includes(node);
			const heldIntoNext = index < steps.length - 1 && steps[index + 1].includes(node);
			const isLast = index === steps.length - 1;
			if (frame < from || (frame >= end && !isLast)) return level;
			const rampIn = heldFromPrevious ? 1 : Math.min(1, (frame - from) / (FOCUS_IN_SECONDS * fps));
			const rampOut = heldIntoNext || isLast ? 1 : Math.min(1, (end - frame) / (FOCUS_OUT_SECONDS * fps));
			return Math.max(level, Math.min(rampIn, rampOut));
		}, 0),
	);

export const ConceptChrome: React.FC<{content: Content}> = ({content}) => (
	<ChromeBar style={{justifyContent: 'space-between'}}>
		<BrandMark height={44} />
		<Badge tone="surface" icon="target">
			{content.concept}
		</Badge>
	</ChromeBar>
);

export const TitleScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {isLandscape} = useVideoLayout();
	const typedAt = 0.2 + Array.from(content.concept).length / TYPING_SPEED;
	return (
		<SafeArea
			gap={SPACING.xl}
			style={{alignItems: 'center', justifyContent: 'center', ...(isLandscape ? {paddingLeft: '14%', paddingRight: '14%'} : {})}}
		>
			<Animated>
				<Badge tone="primary" icon="target" size={30}>
					{content.subject ? `${content.subject} · Kavram` : 'Kavram'}
				</Badge>
			</Animated>
			<Text variant="display" align="center" size={132}>
				<Highlight delaySeconds={typedAt} color={withAlpha(colors.highlight, 0.55)}>
					<Typewriter text={content.concept} delaySeconds={0.2} charactersPerSecond={TYPING_SPEED} />
				</Highlight>
			</Text>
			<Animated animation="fade" delaySeconds={typedAt + 0.3}>
				<RichText text={content.definition} size={46} tone="muted" align="center" />
			</Animated>
		</SafeArea>
	);
};

const StepCaption: React.FC<{step: ConceptStep; exitAtSeconds?: number}> = ({step, exitAtSeconds}) => {
	const {u} = useVideoLayout();
	return (
		<Animated animation="none" exitAtSeconds={exitAtSeconds} style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
			<FitBox align="start" fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					{step.title ? (
						<Animated>
							<Text variant="title" tone="emphasis">
								{step.title}
							</Text>
						</Animated>
					) : null}
					<Animated delaySeconds={0.2}>
						<RichText text={step.caption} size={44} />
					</Animated>
				</div>
			</FitBox>
		</Animated>
	);
};

/** The visual holds the stage; captions change beside it and light up the part they talk about. */
export const ExploreScene: React.FC<{content: Content; stepSeconds: number[]}> = ({content, stepSeconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {contentWidth, contentHeight, isLandscape, isSquare, u} = useVideoLayout();
	const {steps, visual} = content;
	const plan = planScenes(
		steps.map((_, index) => ({id: `step-${index}`, seconds: stepSeconds[index]})),
		fps,
	);
	const active = activeSceneIndex(plan, frame);
	const focusLevels = focusLevelsAt(
		visualNodeCount(visual),
		steps.map((step) => step.focus ?? []),
		plan,
		frame,
		fps,
	);

	const available = contentHeight - u(CHROME_HEIGHT);
	const stageWidth = isLandscape ? contentWidth * 0.56 : contentWidth;
	const stageHeight = isLandscape ? available : available * (isSquare ? 0.56 : 0.58);
	const inset = u(SPACING.lg) * 2 + u(8);

	return (
		<SafeArea chrome gap={isLandscape ? SPACING.xl : SPACING.lg} style={{flexDirection: isLandscape ? 'row' : 'column'}}>
			<Animated animation="fade" style={{flexShrink: 0}}>
				<Card
					padding={SPACING.lg}
					style={{width: stageWidth, height: stageHeight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
				>
					<Illustration
						visual={visual}
						width={stageWidth - inset}
						height={stageHeight - inset}
						focusLevels={focusLevels}
						delaySeconds={0.3}
					/>
				</Card>
			</Animated>
			<div style={{flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
					<Badge tone="accent">
						{active + 1} / {steps.length}
					</Badge>
					<SegmentedProgress plan={plan} />
				</div>
				{steps.map((step, index) => {
					const isLast = index === steps.length - 1;
					return (
						<Sequence
							key={index}
							layout="none"
							from={plan.scenes[index].from}
							durationInFrames={isLast ? undefined : plan.scenes[index].durationInFrames}
						>
							<StepCaption step={step} exitAtSeconds={isLast ? undefined : stepSeconds[index] - 0.3} />
						</Sequence>
					);
				})}
			</div>
		</SafeArea>
	);
};

export const RelatedScene: React.FC<{content: Content}> = ({content}) => {
	const {contentWidth, contentHeight, u} = useVideoLayout();
	const headerHeight = u(150);
	const mapHeight = contentHeight - u(CHROME_HEIGHT) - headerHeight - u(SPACING.lg);
	return (
		<SafeArea chrome>
			<Animated style={{height: headerHeight, flexShrink: 0}}>
				<Text variant="label" tone="emphasis" size={30}>
					{content.concept}
				</Text>
				<Text variant="title">İlişkili Kavramlar</Text>
			</Animated>
			<ConceptMap
				center={content.concept}
				related={content.relatedConcepts ?? []}
				width={contentWidth}
				height={mapHeight}
				delaySeconds={0.3}
			/>
		</SafeArea>
	);
};

export const ExampleScene: React.FC<{content: Content; seconds: number}> = ({content, seconds}) => {
	const {u, isLandscape} = useVideoLayout();
	const {example, keyTakeaway} = content;
	// The result and the takeaway arrive roughly when the narration reaches them.
	const resultAt = Math.max(1.6, seconds * 0.45);
	const takeawayAt = example ? Math.max(example.result ? 3 : 1.8, seconds * 0.7) : 0.2;
	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '15%', paddingRight: '15%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					{example ? (
						<>
							<Animated style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
								<Badge tone="accent" icon="pencil">
									Örnek
								</Badge>
								{example.title ? <Text variant="subtitle">{example.title}</Text> : null}
							</Animated>
							<Animated delaySeconds={0.25}>
								<Card>
									<RichText text={example.text} size={40} />
								</Card>
							</Animated>
							{example.result ? (
								<Animated delaySeconds={resultAt}>
									<Callout icon="check" label="Sonuç" tone="success">
										<RichText text={example.result} size={36} />
									</Callout>
								</Animated>
							) : null}
						</>
					) : null}
					{keyTakeaway ? (
						<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={takeawayAt}>
							<Card tone="primary">
								<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.lg)}}>
									<Icon name="star" size={72} />
									<div style={{flex: 1, minWidth: 0}}>
										<Text variant="label" tone="muted">
											Aklında kalsın
										</Text>
										<RichText text={keyTakeaway} variant="subtitle" size={44} />
									</div>
								</div>
							</Card>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};
