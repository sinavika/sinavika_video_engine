import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {APP_SCREENS} from '../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame} from '../../../Components/AppScreens/PhoneFrame';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import type {AppPromotionContent} from './AppPromotionSchema';

type Content = AppPromotionContent;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 to 1 with a soft landing, starting `delaySeconds` into the scene. */
const useRise = (delaySeconds: number, damping = 16): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delaySeconds * fps, fps, config: {damping, mass: 0.7, stiffness: 140}});
};

/**
 * The dark stage every scene plays on: two soft glows in the brand colour
 * drifting slowly, so the picture is never still even when the type is.
 */
export const StageGlow: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {colors} = useTheme();
	const t = frame / fps;
	const glow = (size: number, x: number, y: number, alpha: number) => (
		<div
			style={{
				position: 'absolute',
				width: size,
				height: size,
				left: x - size / 2,
				top: y - size / 2,
				borderRadius: '50%',
				background: `radial-gradient(circle, ${withAlpha(colors.primary, alpha)} 0%, ${withAlpha(colors.primary, 0)} 68%)`,
			}}
		/>
	);
	return (
		<AbsoluteFill style={{backgroundColor: colors.background, overflow: 'hidden'}}>
			{glow(width * 1.5, width * (0.25 + 0.12 * Math.sin(t * 0.5)), height * (0.22 + 0.05 * Math.cos(t * 0.4)), 0.34)}
			{glow(width * 1.3, width * (0.82 + 0.1 * Math.cos(t * 0.45)), height * (0.8 + 0.06 * Math.sin(t * 0.38)), 0.22)}
		</AbsoluteFill>
	);
};

/** One line of kinetic type: its words arrive one after another from below, tilting into place. */
const KineticLine: React.FC<{text: string; delaySeconds: number; size: number; color?: string}> = ({text, delaySeconds, size, color}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useVideoLayout();
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: u(size * 0.26), overflow: 'hidden', paddingBottom: u(size * 0.12)}}>
			{text.split(' ').map((word, index) => {
				const rise = spring({frame: frame - (delaySeconds + index * 0.09) * fps, fps, config: {damping: 14, mass: 0.6, stiffness: 170}});
				return (
					<div key={`${word}-${index}`} style={{transform: `translateY(${(1 - rise) * u(size * 1.1)}px) rotate(${(1 - rise) * 7}deg)`, opacity: interpolate(rise, [0, 0.35], [0, 1], CLAMP)}}>
						<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={color} style={{lineHeight: TYPE.displayLineHeight, whiteSpace: 'nowrap'}}>
							{word}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

export const HookScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const underline = useRise(0.25 + content.hook.lines.length * 0.3, 20);
	return (
		<AbsoluteFill>
			<StageGlow />
			<SafeArea gap={SPACING.sm} style={{alignItems: 'center', justifyContent: 'center'}}>
				{content.hook.lines.map((line, index) => (
					<KineticLine key={line} text={line} delaySeconds={0.1 + index * 0.3} size={TYPE.adScale.hook} color={line === content.hook.emphasis ? colors.primary : undefined} />
				))}
				<div style={{width: u(360) * underline, height: u(12), borderRadius: u(6), backgroundColor: colors.primary, marginTop: u(26)}} />
			</SafeArea>
		</AbsoluteFill>
	);
};

const SCREEN_CHANGE_SECONDS = 0.45;
const PHONE_WIDTH = 630;

type ShowcaseProps = {
	content: Content;
	/** How long each feature stays, in order; the phone changes screen as each one starts. */
	featureSeconds: number[];
};

/**
 * One phone for all features. It rises into the frame once and stays, while
 * its screen and the headline above it change with the narration: the eye
 * follows the product, not a series of cuts.
 */
export const ShowcaseScene: React.FC<ShowcaseProps> = ({content, featureSeconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const seconds = frame / fps;

	const starts = featureSeconds.map((_, index) => featureSeconds.slice(0, index).reduce((sum, value) => sum + value, 0));
	const current = Math.max(0, starts.filter((start) => seconds >= start).length - 1);
	const sinceChange = seconds - starts[current];

	const arrival = spring({frame, fps, config: {damping: 15, mass: 0.9, stiffness: 90}});
	// A nudge on every screen change, so the product visibly reacts to each new line.
	const nudge = Math.exp(-sinceChange * 5) * Math.sin(sinceChange * 16);
	const float = Math.sin(seconds * 1.3) * u(8);
	const side = current % 2 === 0 ? 1 : -1;
	const tilt = interpolate(arrival, [0, 1], [-16, 0]) + nudge * 2.2 * side;

	return (
		<AbsoluteFill>
			<StageGlow />
			<SafeArea gap={SPACING.lg} style={{alignItems: 'center', justifyContent: 'flex-start'}}>
				<div style={{position: 'relative', width: '100%', height: u(170), flexShrink: 0}}>
					{content.features.map((feature, index) => {
						const local = seconds - starts[index];
						const enter = spring({frame: local * fps, fps, config: {damping: 15, mass: 0.6, stiffness: 160}});
						const leave = index < current ? interpolate(seconds - starts[index + 1], [0, 0.22], [0, 1], CLAMP) : 0;
						if (local < 0 || leave >= 1) return null;
						return (
							<div
								key={feature.headline}
								style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(14), opacity: enter * (1 - leave), transform: `translateY(${(1 - enter) * u(70) - leave * u(60)}px) scale(${0.9 + 0.1 * enter})`}}
							>
								<div style={{width: u(120) * enter, height: u(10), borderRadius: u(5), backgroundColor: colors.primary}} />
								<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} align="center" style={{lineHeight: TYPE.displayLineHeight}}>
									{feature.headline}
								</Text>
							</div>
						);
					})}
				</div>
				<div style={{perspective: u(2400), transform: `translateY(${(1 - arrival) * u(1500) + float}px)`}}>
					<PhoneFrame width={u(PHONE_WIDTH)} mode={content.appMode} style={{transform: `rotateX(${interpolate(arrival, [0, 1], [26, 0])}deg) rotateZ(${tilt}deg) scale(${1 + nudge * 0.012})`}}>
						{content.features.map((feature, index) => {
							const Screen = APP_SCREENS[feature.screen].Component;
							const shown = index === 0 ? 1 : interpolate(seconds - starts[index], [0, SCREEN_CHANGE_SECONDS], [0, 1], CLAMP);
							if (shown <= 0 || index > current) return null;
							const eased = 1 - (1 - shown) ** 3;
							return (
								<div key={`${feature.screen}-${index}`} style={{width: '100%', height: '100%', transform: `translateX(${(1 - eased) * 100}%)`, boxShadow: '-24px 0 40px rgba(0, 0, 0, 0.18)'}}>
									<Screen />
								</div>
							);
						})}
					</PhoneFrame>
				</div>
			</SafeArea>
		</AbsoluteFill>
	);
};

export const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const logo = useRise(0.05, 13);
	const stores = useRise(0.75);
	return (
		<AbsoluteFill>
			<StageGlow />
			<SafeArea gap={SPACING.xl} style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{transform: `scale(${0.6 + 0.4 * logo})`, opacity: logo}}>
					<BrandMark size="hero" />
				</div>
				<KineticLine text={content.closing.title} delaySeconds={0.35} size={TYPE.adScale.closing} />
				<div style={{display: 'flex', gap: u(20), opacity: stores, transform: `translateY(${(1 - stores) * u(40)}px)`}}>
					{content.closing.stores.map((store) => (
						<div key={store} style={{padding: `${u(20)}px ${u(34)}px`, borderRadius: u(999), backgroundColor: colors.primary}}>
							<Text size={TYPE.adScale.action} weight={TYPE.weights.display} color={colors.onPrimary}>
								{store}
							</Text>
						</div>
					))}
				</div>
			</SafeArea>
		</AbsoluteFill>
	);
};
