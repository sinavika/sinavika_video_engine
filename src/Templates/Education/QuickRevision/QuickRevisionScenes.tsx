import React from 'react';
import {AbsoluteFill} from 'remotion';
import {paceSeconds} from '../../../Animations/Motion';
import {Animated, Stagger} from '../../../Components/Animations/Animated';
import {Highlight} from '../../../Components/Animations/Highlight';
import {Icon, type IconName} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {ChromeBar, SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SegmentedProgress} from '../../../Components/Overlays/SegmentedProgress';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import type {ScenePlan} from '../../../Scenes/ScenePlan';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha, type CategoricalColor} from '../../../Themes/Theme';
import {InkProvider, useInk, useTheme} from '../../../Themes/ThemeContext';
import type {QuickRevisionContent, RevisionCard} from './QuickRevisionSchema';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';

type Content = QuickRevisionContent;

const CARD_KINDS: Record<RevisionCard['kind'], {label: string; icon: IconName}> = {
	fact: {label: 'Bilgi', icon: 'bolt'},
	formula: {label: 'Formül', icon: 'pencil'},
	term: {label: 'Kavram', icon: 'target'},
	warning: {label: 'Dikkat', icon: 'alert'},
};

const WHITE = '#FFFFFF';
/** Where the lesson name sits on the opening, in reference pixels from the top: the same place as on the cover, below the story bar. */
const INTRO_CORNER_TOP = 274;

/** Story bar. Sits on a dark pill so it stays readable over any card colour. */
export const RevisionChrome: React.FC<{plan: ScenePlan}> = ({plan}) => {
	const {u} = useVideoLayout();
	return (
		<ChromeBar>
			<div
				style={{
					flex: 1,
					display: 'flex',
					padding: `${u(14)}px ${u(18)}px`,
					borderRadius: u(40),
					backgroundColor: withAlpha('#000000', 0.34),
				}}
			>
				<InkProvider ink={{text: WHITE, muted: WHITE, emphasis: WHITE}}>
					<SegmentedProgress
						plan={plan}
						sceneIds={plan.scenes.map((scene) => scene.id).filter((id) => id !== OUTRO_SCENE_ID)}
						height={10}
					/>
				</InkProvider>
			</div>
		</ChromeBar>
	);
};

export const IntroScene: React.FC<{content: Content; totalSeconds: number}> = ({content, totalSeconds}) => {
	const {colors, typography} = useTheme();
	const ink = useInk();
	const {u} = useVideoLayout();
	return (
		<SafeArea chrome gap={SPACING.lg} style={{alignItems: 'center', justifyContent: 'center'}}>
			{content.subject ? (
				<div style={{position: 'absolute', top: u(INTRO_CORNER_TOP), left: u(64)}}>
					<Animated animation={{preset: 'slide', direction: 'right', durationSeconds: 0.35}}>
						<div style={{padding: `${u(14)}px ${u(30)}px`, borderRadius: u(16), backgroundColor: ink.text, color: colors.primary, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(50), lineHeight: 1}}>{content.subject}</div>
					</Animated>
				</div>
			) : null}
			{content.exams.length > 0 ? (
				<Animated animation="fade" delaySeconds={0.05}>
					<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: u(14)}}>
						{content.exams.map((exam) => (
							<div key={exam} style={{padding: `${u(10)}px ${u(24)}px`, borderRadius: u(999), border: `${u(4)}px solid ${ink.text}`, color: ink.text, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(40), lineHeight: 1}}>
								{exam}
							</div>
						))}
					</div>
				</Animated>
			) : null}
			<Animated animation={{preset: 'zoom', durationSeconds: 0.4}}>
				<Badge tone="accent" icon="bolt" size={34}>
					Hızlı Tekrar
				</Badge>
			</Animated>
			<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.15}>
				<Text variant="display" align="center">
					<Highlight delaySeconds={0.5} durationSeconds={0.5} color={withAlpha(colors.accent, 0.5)}>
						{content.title}
					</Highlight>
				</Text>
			</Animated>
			<Animated animation="fade" delaySeconds={0.5}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.sm)}}>
					<Icon name="clock" size={40} color={colors.textMuted} />
					<Text variant="subtitle" tone="muted" size={38}>
						{content.cards.length} kart · {Math.round(totalSeconds)} saniye
					</Text>
				</div>
			</Animated>
		</SafeArea>
	);
};

const CardBody: React.FC<{card: RevisionCard; tone: CategoricalColor}> = ({card, tone}) => {
	const {u, isLandscape} = useVideoLayout();
	const {typography, shape} = useTheme();
	const big = isLandscape ? 1 : 1.08;

	switch (card.kind) {
		case 'fact':
			return (
				<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.15}>
					<RichText text={card.text} variant="headline" size={78 * big} />
				</Animated>
			);
		case 'warning':
			return (
				<>
					<Animated animation={{preset: 'zoom', durationSeconds: 0.35}} delaySeconds={0.1}>
						<Icon name="alert" size={150} strokeWidth={2} />
					</Animated>
					<Animated delaySeconds={0.25}>
						<RichText text={card.text} variant="headline" size={72 * big} />
					</Animated>
				</>
			);
		case 'term':
			return (
				<>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.1}>
						<Text variant="display" size={112 * big}>
							{card.term}
						</Text>
					</Animated>
					<Animated delaySeconds={0.35}>
						<RichText text={card.definition} size={48 * big} weight={typography.bodyWeight + 100} />
					</Animated>
				</>
			);
		case 'formula':
			return (
				<>
					<Animated delaySeconds={0.1}>
						<Text variant="title" size={62 * big}>
							{card.title}
						</Text>
					</Animated>
					<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.3}>
						{/* Inverted panel: the formula sits on the card's ink colour. */}
						<div
							style={{
								padding: `${u(SPACING.xl)}px ${u(SPACING.lg)}px`,
								borderRadius: u(shape.radius.lg),
								backgroundColor: tone.on,
								color: tone.fill,
								fontSize: u(96 * big),
							}}
						>
							<MathExpression latex={card.latex} display style={{margin: 0}} />
						</div>
					</Animated>
					{card.note ? (
						<Animated animation="fade" delaySeconds={0.7}>
							<RichText text={card.note} size={40 * big} tone="muted" />
						</Animated>
					) : null}
				</>
			);
	}
};

type CardSceneProps = {card: RevisionCard; index: number; total: number};

/** One idea per screen: a full-bleed colour, a huge index number and very large type. */
export const CardScene: React.FC<CardSceneProps> = ({card, index, total}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const tone: CategoricalColor =
		card.kind === 'warning'
			? {fill: colors.danger, on: colors.onStatus}
			: colors.categorical[index % colors.categorical.length];
	const kind = CARD_KINDS[card.kind];

	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<div
				style={{
					position: 'absolute',
					right: u(-20),
					bottom: u(isLandscape ? -150 : 40),
					fontFamily: typography.display,
					fontWeight: BRAND_TYPOGRAPHY.weights.kinetic,
					fontSize: u(isLandscape ? 720 : 620),
					lineHeight: 0.8,
					color: tone.on,
					opacity: 0.1,
				}}
			>
				{String(index + 1).padStart(2, '0')}
			</div>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.78), emphasis: tone.on}}>
				<SafeArea chrome gap={SPACING.lg}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: u(SPACING.md)}}>
						<Animated animation={{preset: 'slide', direction: 'down', distance: 30, durationSeconds: 0.3}}>
							<Badge tone={{fill: tone.on, on: tone.fill}} icon={kind.icon} size={30}>
								{kind.label}
							</Badge>
						</Animated>
						<Text variant="label" size={30}>
							{index + 1} / {total}
						</Text>
					</div>
					<FitBox fill style={isLandscape ? {paddingRight: '22%'} : undefined}>
						<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.xl)}}>
							<CardBody card={card} tone={tone} />
						</div>
					</FitBox>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};

export const RecapScene: React.FC<{content: Content; seconds: number}> = ({content, seconds}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '16%', paddingRight: '16%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					<Animated>
						<Text variant="label" tone="emphasis" size={30}>
							{content.title}
						</Text>
						<Text variant="headline">Özet</Text>
					</Animated>
					<Stagger
						delaySeconds={0.5}
						stepSeconds={paceSeconds(seconds, content.summary.length, {leadSeconds: 1.5, minSeconds: 0.3, maxSeconds: 3})}
						animation={{preset: 'slide', direction: 'left', distance: 80}}
					>
						{content.summary.map((item, index) => (
							<Card key={index} tone={colors.categorical[index % colors.categorical.length]} padding={SPACING.lg}>
								<RichText text={item} variant="subtitle" size={50} />
							</Card>
						))}
					</Stagger>
				</div>
			</FitBox>
		</SafeArea>
	);
};
