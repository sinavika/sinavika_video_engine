import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated} from '../../../Components/Animations/Animated';
import {Icon} from '../../../Components/Illustrations/Icon';
import {ChromeBar, SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {VoiceOrb, type VoiceTrack} from '../../../Components/Overlays/VoiceOrb';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import type {CampEpisode} from '../../../Courses/Camp';
import type {LessonScript} from '../../../Courses/LessonScript';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';
import {lineCount} from '../../../Images/Components/TextMeasure';
import {useStudio} from '../../Courses/CourseLesson/Scenes/LessonChrome';
import {CampProgress, lessonNumberText} from './CampChrome';

/** Topic size on the studio camp card: the largest that keeps the topic to two lines beside the orb. */
const STUDIO_TOPIC_SIZES = [136, 120, 104] as const;

/**
 * The camp card in the studio layout (camp lessons since 31 Oct 2026), set like the camp cover the owner approved (29 Oct): the
 * camp and its exams as pills, the topic largest (it is what the viewer opened), then the lesson number and the
 * camp's progress. The classic card set the camp's name largest and the topic under it.
 */
const StudioCampBody: React.FC<{script: LessonScript; camp: CampEpisode; promise?: string; ink: string; orb: React.ReactNode}> = ({script, camp, promise, ink, orb}) => {
	const {typography} = useTheme();
	const {u, contentWidth} = useVideoLayout();
	const room = contentWidth / u(1) - 440 - SPACING.lg;
	const size = STUDIO_TOPIC_SIZES.find((step) => lineCount(script.title, room, {size: step, weight: 800}) <= 2) ?? STUDIO_TOPIC_SIZES.at(-1);
	const pill = (text: string, filled: boolean) => (
		<div key={text} style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(10)}px ${u(22)}px`, borderRadius: u(999), backgroundColor: filled ? withAlpha(ink, 0.16) : 'transparent', border: filled ? 'none' : `${u(3)}px solid ${withAlpha(ink, 0.7)}`, color: ink, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(30), lineHeight: 1, whiteSpace: 'nowrap'}}>
			{filled ? <div style={{width: u(12), height: u(12), borderRadius: '50%', backgroundColor: ink}} /> : null}
			{text}
		</div>
	);
	return (
		<SafeArea chrome gap={SPACING.lg} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg), justifyContent: 'center'}}>
				<Animated animation={{preset: 'slide', direction: 'down', distance: 30}}>
					<div style={{display: 'flex', gap: u(14), flexWrap: 'wrap'}}>
						{pill(camp.name, true)}
						{script.exams.map((exam) => pill(exam, false))}
					</div>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.1}>
					<Text variant="display" size={size} style={{lineHeight: 1}}>
						{script.title}
					</Text>
				</Animated>
				<Animated delaySeconds={0.35}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.lg), flexWrap: 'wrap'}}>
						<Text variant="label" size={34} tone="muted">
							{lessonNumberText(camp)}
						</Text>
						<CampProgress camp={camp} ink={ink} delaySeconds={0.5} />
					</div>
				</Animated>
				{promise ? (
					<Animated delaySeconds={1}>
						<Text variant="subtitle" tone="muted" size={38}>
							{promise}
						</Text>
					</Animated>
				) : null}
			</div>
			{orb}
		</SafeArea>
	);
};

/**
 * The camp card that opens every camp lesson, in the lesson's colour (the
 * colour of the cover, so the video continues it): SinoAI greets the viewer
 * while the card shows the camp's name, which lesson this is and where the
 * camp stands. Docs: Courses.md §8, colours: CourseColors.md.
 */
export const CampCardScene: React.FC<{script: LessonScript; camp: CampEpisode; promise?: string; welcome?: boolean; voice?: readonly VoiceTrack[]}> = ({script, camp, promise, welcome = false, voice = []}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.primary, on: colors.onPrimary};
	const ink = tone.on;
	const studio = useStudio();
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, backgroundImage: `radial-gradient(circle at 85% 20%, ${withAlpha('#FFFFFF', 0.14)} 0%, transparent 45%)`}}>
			<InkProvider ink={{text: ink, muted: withAlpha(ink, 0.8), emphasis: ink}}>
				<ChromeBar style={{justifyContent: 'space-between'}}>
					{welcome ? (
						<Animated animation={{preset: 'slide', direction: 'right', distance: 40}}>
							<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(10)}px ${u(22)}px ${u(10)}px ${u(16)}px`, borderRadius: u(999), backgroundColor: withAlpha(ink, 0.16), color: ink, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(30), lineHeight: 1}}>
								<Icon name="sparkles" size={34} color={ink} />
								<span>SinoAI</span>
								<span style={{opacity: 0.75, fontWeight: 600}}>· Hoş geldin</span>
							</div>
						</Animated>
					) : (
						<div />
					)}
					<BrandMark color={ink} />
				</ChromeBar>
				{studio ? <StudioCampBody script={script} camp={camp} promise={promise} ink={ink} orb={welcome ? <VoiceOrb size={440} color={tone.fill} tracks={voice} /> : null} /> : null}
				{studio ? null : (
				<SafeArea chrome gap={SPACING.lg} style={{flexDirection: isLandscape ? 'row' : 'column', alignItems: isLandscape ? 'center' : 'stretch', justifyContent: 'center'}}>
					<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg), justifyContent: 'center'}}>
						<Animated animation={{preset: 'slide', direction: 'down', distance: 30}}>
							<Text variant="label" size={34} tone="muted">
								{lessonNumberText(camp)}
							</Text>
						</Animated>
						<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.1}>
							<Text variant="display" size={isLandscape ? 140 : 116} style={{lineHeight: 0.98}}>
								{camp.name}
							</Text>
						</Animated>
						<Animated delaySeconds={0.35}>
							<Text variant="title" size={isLandscape ? 64 : 58}>
								{script.title}
							</Text>
						</Animated>
						<div style={{marginTop: u(SPACING.md)}}>
							<CampProgress camp={camp} ink={ink} delaySeconds={0.5} />
						</div>
						{promise ? (
							<Animated delaySeconds={1}>
								<Text variant="subtitle" tone="muted" size={38}>
									{promise}
								</Text>
							</Animated>
						) : null}
					</div>
					{welcome && isLandscape ? <VoiceOrb size={440} color={tone.fill} tracks={voice} /> : null}
				</SafeArea>
				)}
			</InkProvider>
		</AbsoluteFill>
	);
};
