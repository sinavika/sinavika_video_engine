import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated} from '../../../../Components/Animations/Animated';
import {Icon} from '../../../../Components/Illustrations/Icon';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../../Themes/ThemeContext';
import {TYPE, useStudio} from './LessonChrome';

/** Sections listed on a studio section opening: the current one with up to three before and after it. */
const STUDIO_SECTION_WINDOW = 7;

/**
 * A section opening in the studio layout (camp lessons since 31 Oct 2026): the section's number and title, then the lesson's
 * sections as a short contents list (done ones ticked, this one lit), so the viewer sees where the lesson stands.
 * The large number behind the title is gone: SinoAI's orb on the right ran into it.
 */
const StudioSection: React.FC<{index: number; title: string; titles: readonly string[]}> = ({index, title, titles}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	const first = Math.max(0, Math.min(index - Math.floor(STUDIO_SECTION_WINDOW / 2), titles.length - STUDIO_SECTION_WINDOW));
	const shown = titles.slice(first, first + STUDIO_SECTION_WINDOW);
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.8), emphasis: tone.on}}>
				<SafeArea gap={SPACING.lg} style={{justifyContent: 'center', paddingRight: '32%'}}>
					<Animated animation={{preset: 'slide', direction: 'down', distance: 30}}>
						<Text variant="label" size={TYPE.label + 6}>
							Bölüm {index + 1} / {titles.length}
						</Text>
					</Animated>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.15}>
						<Text variant="display" size={TYPE.sectionTitle} style={{lineHeight: 1.02}}>
							{title}
						</Text>
					</Animated>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(10), marginTop: u(SPACING.lg), paddingTop: u(SPACING.lg), borderTop: `${u(3)}px solid ${withAlpha(tone.on, 0.25)}`}}>
						{shown.map((name, offset) => {
							const at = first + offset;
							const current = at === index;
							return (
								<Animated key={at} animation={{preset: 'slide', direction: 'left', distance: 30}} delaySeconds={0.35 + offset * 0.06}>
									<div style={{display: 'flex', alignItems: 'center', gap: u(16), opacity: current ? 1 : at < index ? 0.55 : 0.75}}>
										<div style={{width: u(34), height: u(34), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: current ? tone.on : 'transparent', border: current || at < index ? 'none' : `${u(3)}px solid ${withAlpha(tone.on, 0.7)}`}}>
											{at < index ? <Icon name="check" size={30} color={tone.on} /> : current ? <span style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(18), color: tone.fill}}>{at + 1}</span> : null}
										</div>
										<span style={{fontFamily: typography.display, fontWeight: current ? BRAND_TYPOGRAPHY.weights.kinetic : 600, fontSize: u(30), lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{name}</span>
									</div>
								</Animated>
							);
						})}
					</div>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};

/** The start of a section: the lesson colour, the section number set huge, and its title. */
export const SectionScene: React.FC<{index: number; title: string; total: number; titles?: readonly string[]}> = ({index, title, total, titles}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const studio = useStudio();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	if (studio && titles) return <StudioSection index={index} title={title} titles={titles} />;
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<div style={{position: 'absolute', right: u(-30), bottom: u(isLandscape ? -170 : 60), fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(isLandscape ? 760 : 620), lineHeight: 0.8, opacity: 0.12}}>
				{String(index + 1).padStart(2, '0')}
			</div>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.8), emphasis: tone.on}}>
				<SafeArea gap={SPACING.lg} style={{justifyContent: 'center', paddingRight: isLandscape ? '24%' : undefined}}>
					<Animated animation={{preset: 'slide', direction: 'down', distance: 30}}>
						<Text variant="label" size={TYPE.label + 6}>
							Bölüm {index + 1} / {total}
						</Text>
					</Animated>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.15}>
						<Text variant="display" size={TYPE.sectionTitle} style={{lineHeight: 1.02}}>
							{title}
						</Text>
					</Animated>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};
