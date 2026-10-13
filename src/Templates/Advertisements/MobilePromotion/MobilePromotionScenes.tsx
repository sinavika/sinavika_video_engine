import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {APP_SCREENS, type AppScreenName} from '../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame, phoneHeight} from '../../../Components/AppScreens/PhoneFrame';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {StageGlow} from '../AppPromotion/AppPromotionScenes';
import type {MobilePromotionContent} from './MobilePromotionSchema';

type Content = MobilePromotionContent;
type Step = Content['steps'][number];

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Blur of something moving at full speed, in reference pixels. It is gone the moment the thing stops. */
const MOTION_BLUR = 26;

/** 0 to 1, fast and without overshoot: things arrive and stand still, sharp. */
const useArrive = (delaySeconds = 0, stiffness = 150): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delaySeconds * fps, fps, config: {damping: 22, mass: 0.7, stiffness}});
};

const useSeconds = (): number => useCurrentFrame() / useVideoConfig().fps;

/** Words sliding in from one side, blurred while they move. */
const SweepLine: React.FC<{text: string; size: number; delaySeconds?: number; from?: 1 | -1; emphasis?: string; align?: 'center' | 'flex-start'}> = ({
	text,
	size,
	delaySeconds = 0,
	from = 1,
	emphasis,
	align = 'center',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const marked = new Set(emphasis?.split(' ') ?? []);
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align, columnGap: u(size * 0.26), rowGap: u(size * 0.04)}}>
			{text.split(' ').map((word, index) => {
				const arrive = spring({frame: frame - (delaySeconds + index * 0.16) * fps, fps, config: {damping: 22, mass: 0.6, stiffness: 190}});
				return (
					<div key={`${word}-${index}`} style={{transform: `translateX(${(1 - arrive) * from * u(size * 2.4)}px)`, opacity: interpolate(arrive, [0, 0.3], [0, 1], CLAMP), filter: `blur(${(1 - arrive) * u(MOTION_BLUR)}px)`}}>
						<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={marked.has(word.replace(/[?.!,]/g, '')) ? colors.primary : undefined} style={{lineHeight: TYPE.displayLineHeight, whiteSpace: 'nowrap'}}>
							{word}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

/** The narration as a subtitle, for viewers without sound. Not drawn when the screen already says the same words. */
const Subtitle: React.FC<{content: Content; text: string; shown: string}> = ({content, text, shown}) => {
	const {colors} = useTheme();
	const {u, safeArea} = useVideoLayout();
	const arrive = useArrive(0.35);
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '');
	if (!content.subtitles || plain(text) === plain(shown)) return null;
	return (
		<div style={{position: 'absolute', left: safeArea.left, right: safeArea.right, bottom: safeArea.bottom, display: 'flex', justifyContent: 'center', opacity: arrive}}>
			<div style={{padding: `${u(14)}px ${u(28)}px`, borderRadius: u(18), backgroundColor: withAlpha(colors.background, 0.82)}}>
				<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.strong} align="center">
					{text}
				</Text>
			</div>
		</div>
	);
};

const Phone: React.FC<{screen: AppScreenName; width: number; mode: Content['appMode']; style?: React.CSSProperties}> = ({screen, width, mode, style}) => {
	const Screen = APP_SCREENS[screen].Component;
	return (
		<PhoneFrame width={width} mode={mode} style={style}>
			<Screen />
		</PhoneFrame>
	);
};

export const QuestionScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const words = content.question.text.split(' ').length;
	const line = useArrive(0.2 + words * 0.16, 70);
	return (
		<AbsoluteFill>
			<StageGlow />
			<SafeArea gap={SPACING.xl} style={{alignItems: 'center', justifyContent: 'center'}}>
				<SweepLine text={content.question.text} size={TYPE.adScale.hook} delaySeconds={0.1} emphasis={content.question.emphasis} />
				{/* The line that points to where the product is about to arrive. */}
				<div style={{width: u(10), height: u(isLandscape ? 150 : 380) * line, borderRadius: u(5), background: `linear-gradient(${colors.primary}, ${withAlpha(colors.primary, 0)})`}} />
			</SafeArea>
			<Subtitle content={content} text={content.question.narration} shown={content.question.text} />
		</AbsoluteFill>
	);
};

/** Headline and product: stacked on vertical video, side by side on horizontal. */
const ProductLayout: React.FC<{headline: React.ReactNode; children: React.ReactNode}> = ({headline, children}) => {
	const {u, isLandscape} = useVideoLayout();
	return (
		<SafeArea gap={SPACING.lg} style={{flexDirection: isLandscape ? 'row' : 'column', alignItems: 'center', justifyContent: isLandscape ? 'space-evenly' : 'flex-start'}}>
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: isLandscape ? undefined : u(210), flexShrink: 0, maxWidth: isLandscape ? '46%' : '100%'}}>{headline}</div>
			{children}
		</SafeArea>
	);
};

type StepSceneProps = {content: Content; step: Step; index: number};

/**
 * One step of the story. The first phone comes out of the light; later ones
 * open through a growing circle. Once the phone stands still, an outline
 * outside the app points at the part of the screen the line is about.
 */
export const StepScene: React.FC<StepSceneProps> = ({content, step, index}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const seconds = useSeconds();
	const arrive = useArrive(0.05, 110);
	const focus = useArrive(1.1, 120);
	const first = index === 0;
	const side = index % 2 === 0 ? 1 : -1;
	const width = u(isLandscape ? 400 : 540);
	const height = phoneHeight(width);
	const burst = interpolate(seconds, [0, 0.25, 0.9], [0.9, 0.55, 0], CLAMP);
	const reveal = first ? 150 : interpolate(arrive, [0, 1], [0, 150]);
	const pad = u(16);

	return (
		<AbsoluteFill>
			<StageGlow />
			<ProductLayout headline={<SweepLine text={step.headline} size={TYPE.adScale.headline} delaySeconds={0.35} from={side} />}>
				<div style={{position: 'relative', perspective: u(2200)}}>
					{first ? <div style={{position: 'absolute', inset: -u(260), borderRadius: '50%', background: `radial-gradient(closest-side, ${withAlpha(colors.onPrimary, burst)} 0%, ${withAlpha(colors.primary, burst * 0.6)} 45%, ${withAlpha(colors.primary, 0)} 100%)`}} /> : null}
					<div
						style={{
							transform: first ? `scale(${interpolate(arrive, [0, 1], [1.7, 1])}) rotateY(${(1 - arrive) * 22 * side}deg)` : `rotateY(${(1 - arrive) * -18 * side}deg)`,
							filter: `blur(${(1 - arrive) * u(MOTION_BLUR)}px)`,
							opacity: interpolate(arrive, [0, 0.25], [0, 1], CLAMP),
							clipPath: `circle(${reveal}% at 50% ${first ? 50 : 30}%)`,
						}}
					>
						<Phone screen={step.screen} width={width} mode={content.appMode} />
					</div>
					{step.focus ? (
						<div
							style={{
								position: 'absolute',
								left: -pad,
								right: -pad,
								top: height * step.focus.top,
								height: height * step.focus.height,
								borderRadius: u(34),
								border: `${u(6)}px solid ${colors.primary}`,
								boxShadow: `0 0 ${u(50)}px ${withAlpha(colors.primary, 0.55)}`,
								opacity: focus,
								transform: `scale(${interpolate(focus, [0, 1], [1.12, 1])})`,
							}}
						/>
					) : null}
				</div>
			</ProductLayout>
			<Subtitle content={content} text={step.narration} shown={step.headline} />
		</AbsoluteFill>
	);
};

/** The step screens fly in from both sides and line up: one product, not separate tools. */
export const TogetherScene: React.FC<{content: Content}> = ({content}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const {u, isLandscape, contentWidth} = useVideoLayout();
	const seconds = frame / fps;
	const count = content.steps.length;
	const gap = u(28);
	const width = isLandscape ? u(300) : (contentWidth - gap * (count - 1)) / count;
	const bar = useArrive(0.75, 90);

	return (
		<AbsoluteFill>
			<StageGlow />
			<ProductLayout headline={<SweepLine text={content.together.headline} size={TYPE.adScale.headline} delaySeconds={0.45} />}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(34)}}>
					<div style={{display: 'flex', gap, perspective: u(2400)}}>
						{content.steps.map((step, index) => {
							const from = index < count / 2 ? -1 : 1;
							const arrive = spring({frame: frame - index * 0.12 * fps, fps, config: {damping: 20, mass: 0.8, stiffness: 120}});
							const float = Math.sin(seconds * 1.4 + index * 1.7) * u(7);
							return (
								<div key={`${step.screen}-${index}`} style={{transform: `translate(${(1 - arrive) * from * u(900)}px, ${float}px) rotateY(${(1 - arrive) * from * -34}deg)`, filter: `blur(${(1 - arrive) * u(MOTION_BLUR)}px)`}}>
									<Phone screen={step.screen} width={width} mode={content.appMode} />
								</div>
							);
						})}
					</div>
					{/* One line under all screens: they stand on the same ground. */}
					<div style={{width: `${bar * 100}%`, height: u(10), borderRadius: u(5), backgroundColor: colors.primary}} />
				</div>
			</ProductLayout>
			<Subtitle content={content} text={content.together.narration} shown={content.together.headline} />
		</AbsoluteFill>
	);
};

/** The product settles in the middle; the headline and the button stay until the end. */
export const ActionScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const seconds = useSeconds();
	const arrive = useArrive(0, 100);
	const button = useArrive(0.9, 170);
	const width = u(isLandscape ? 330 : 460);
	const sweep = interpolate(seconds, [1.3, 2.1], [-120, 220], CLAMP);

	return (
		<AbsoluteFill>
			<StageGlow />
			<ProductLayout
				headline={
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(34)}}>
						<SweepLine text={content.action.headline} size={TYPE.adScale.hook} delaySeconds={0.3} from={-1} />
						<div style={{position: 'relative', overflow: 'hidden', padding: `${u(26)}px ${u(52)}px`, borderRadius: u(999), backgroundColor: colors.primary, opacity: button, transform: `scale(${interpolate(button, [0, 1], [0.7, 1])})`, boxShadow: `0 0 ${u(70)}px ${withAlpha(colors.primary, 0.6)}`}}>
							<Text size={TYPE.adScale.action} weight={TYPE.weights.display} color={colors.onPrimary}>
								{content.action.button}
							</Text>
							<div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '40%', background: `linear-gradient(100deg, ${withAlpha(colors.onPrimary, 0)}, ${withAlpha(colors.onPrimary, 0.45)}, ${withAlpha(colors.onPrimary, 0)})`}} />
						</div>
					</div>
				}
			>
				<div style={{transform: `translateY(${(1 - arrive) * u(700) + Math.sin(seconds * 1.3) * u(6)}px) scale(${interpolate(arrive, [0, 1], [1.25, 1])})`, filter: `blur(${(1 - arrive) * u(MOTION_BLUR)}px)`}}>
					<Phone screen={content.action.screen} width={width} mode={content.appMode} />
				</div>
			</ProductLayout>
			<Subtitle content={content} text={content.action.narration} shown={content.action.headline} />
		</AbsoluteFill>
	);
};

/** The brand card: the logo, where to find Sınavika and where to get the app. */
export const BrandCloseScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const logo = useArrive(0.05, 120);
	const site = useArrive(0.4);
	const stores = useArrive(0.65);
	return (
		<AbsoluteFill>
			<StageGlow />
			<SafeArea gap={SPACING.xl} style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{opacity: logo, transform: `translateY(${(1 - logo) * u(60)}px)`, filter: `blur(${(1 - logo) * u(MOTION_BLUR)}px)`}}>
					<BrandMark size="hero" />
				</div>
				<div style={{width: u(200) * site, height: u(8), borderRadius: u(4), backgroundColor: colors.primary}} />
				<div style={{opacity: site}}>
					<Text variant="display" size={TYPE.adScale.closing} weight={TYPE.weights.display}>
						{content.closing.website}
					</Text>
				</div>
				<div style={{display: 'flex', gap: u(20), opacity: stores, transform: `translateY(${(1 - stores) * u(30)}px)`}}>
					{content.closing.stores.map((store) => (
						<div key={store} style={{padding: `${u(18)}px ${u(32)}px`, borderRadius: u(999), border: `${u(3)}px solid ${withAlpha(colors.primary, 0.9)}`}}>
							<Text size={TYPE.adScale.action} weight={TYPE.weights.strong}>
								{store}
							</Text>
						</div>
					))}
				</div>
			</SafeArea>
		</AbsoluteFill>
	);
};
