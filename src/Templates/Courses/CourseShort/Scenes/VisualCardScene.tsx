import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated} from '../../../../Components/Animations/Animated';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Badge} from '../../../../Components/Typography/Badge';
import {Text} from '../../../../Components/Typography/Text';
import {CourseVisual} from '../../../../Components/Visuals/CourseVisual';
import type {CourseVisual as CourseVisualSpec} from '../../../../Components/Visuals/VisualSchema';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {SPACING} from '../../../../Themes/DesignTokens';
import {type CategoricalColor, withAlpha} from '../../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../../Themes/ThemeContext';

/**
 * A figure card of the short, in the look of the Reels cards
 * (QuickRevision): a full-bleed colour, the card's title, and the figure on
 * a light panel so its own colours read.
 */
export const VisualCardScene: React.FC<{title: string; visual: CourseVisualSpec; index: number; total: number}> = ({title, visual, index, total}) => {
	const {colors, typography, shape} = useTheme();
	const {u, contentWidth, contentHeight} = useVideoLayout();
	const tone: CategoricalColor = colors.categorical[index % colors.categorical.length];
	const panel = {width: contentWidth - u(SPACING.lg * 2), height: contentHeight * 0.52};
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<div style={{position: 'absolute', right: u(-20), bottom: u(40), fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(620), lineHeight: 0.8, opacity: 0.1}}>
				{String(index + 1).padStart(2, '0')}
			</div>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.78), emphasis: tone.on}}>
				<SafeArea chrome gap={SPACING.lg}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: u(SPACING.md)}}>
						<Badge tone={{fill: tone.on, on: tone.fill}} icon="lightbulb" size={30}>
							Şekil
						</Badge>
						<Text variant="label" size={30}>
							{index + 1} / {total}
						</Text>
					</div>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.1}>
						<Text variant="display" size={88}>
							{title}
						</Text>
					</Animated>
					<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.3}>
						<div style={{padding: u(SPACING.lg), borderRadius: u(shape.radius.lg), backgroundColor: colors.background, color: colors.text}}>
							<InkProvider ink={{text: colors.text, muted: colors.textMuted, emphasis: colors.primaryText}}>
								<div style={{width: panel.width, height: panel.height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<CourseVisual visual={visual} width={panel.width} height={panel.height} delaySeconds={0.6} />
								</div>
							</InkProvider>
						</div>
					</Animated>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};
