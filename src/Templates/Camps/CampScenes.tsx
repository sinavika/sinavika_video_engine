import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Animated} from '../../Components/Animations/Animated';
import {Icon} from '../../Components/Illustrations/Icon';
import {Card} from '../../Components/Layouts/Card';
import {ChromeBar, SafeArea} from '../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../Components/Overlays/BrandMark';
import {SegmentedProgress} from '../../Components/Overlays/SegmentedProgress';
import {VoiceOrb, type VoiceTrack} from '../../Components/Overlays/VoiceOrb';
import {RichText} from '../../Components/Typography/RichText';
import {Text} from '../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';
import type {CampEpisode} from '../../Courses/Camp';
import {COURSE_DESIGN} from '../../Courses/CourseDesign';
import type {LessonScript} from '../../Courses/LessonScript';
import {OUTRO_SCENE_ID} from '../../Scenes/BrandOutroScene';
import {activeSceneIndex, type ScenePlan} from '../../Scenes/ScenePlan';
import {SPACING} from '../../Themes/DesignTokens';
import {withAlpha} from '../../Themes/Theme';
import {InkProvider, useTheme} from '../../Themes/ThemeContext';

/** Scene ids the camp layer adds to the lesson. Section openings are `s1`, `s2`, ... (CourseLesson). */
export const CAMP_SCENE_IDS = {card: 'camp', task: 'camp-task'} as const;

const SECTION_OPENING = /^s\d+$/;

/** "Ders 3 / 15" */
export const lessonNumberText = (camp: CampEpisode): string => `Ders ${camp.number} / ${camp.total}`;

/** The camp pill: the camp's name and the lesson number, in the lesson colour. The same on the lesson and the reel. */
export const CampPill: React.FC<{camp: CampEpisode; compact?: boolean}> = ({camp, compact = false}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(10)}px ${u(20)}px`, borderRadius: u(999), backgroundColor: tone.fill, color: tone.on, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(compact ? 24 : 28), lineHeight: 1, whiteSpace: 'nowrap'}}>
			<span>{compact ? 'Kamp' : camp.name}</span>
			<span style={{opacity: 0.75}}>{camp.number}/{camp.total}</span>
		</div>
	);
};

/** One mark per lesson of the camp: done, this one (long and pulsing), still to come. All in the card's ink. */
const CampProgress: React.FC<{camp: CampEpisode; ink: string; delaySeconds: number}> = ({camp, ink, delaySeconds}) => {
	const {u} = useVideoLayout();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const size = camp.total > 30 ? 18 : camp.total > 16 ? 26 : 34;
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', gap: u(size * 0.45), maxWidth: '100%'}}>
			{Array.from({length: camp.total}, (_, index) => {
				const lesson = index + 1;
				const appear = interpolate(frame, [(delaySeconds + index * 0.03) * fps, (delaySeconds + index * 0.03 + 0.25) * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				const current = lesson === camp.number;
				const pulse = current ? 1 + 0.12 * Math.sin((frame / fps) * Math.PI * 2) : 1;
				return (
					<div
						key={lesson}
						style={{
							width: u(current ? size * 2.2 : size),
							height: u(size),
							borderRadius: u(size),
							backgroundColor: current ? ink : lesson < camp.number ? withAlpha(ink, 0.55) : 'transparent',
							border: lesson > camp.number ? `${u(3)}px solid ${withAlpha(ink, 0.35)}` : 'none',
							opacity: appear,
							transform: `scale(${appear * pulse})`,
						}}
					/>
				);
			})}
		</div>
	);
};

/**
 * SinoAI speaking beside a section's title: the voice orb on the right of a
 * section opening (whose title keeps to the left three quarters).
 */
export const SectionVoiceOrb: React.FC<{tracks: readonly VoiceTrack[]}> = ({tracks}) => {
	const {colors} = useTheme();
	const {isLandscape, safeArea} = useVideoLayout();
	if (!isLandscape) return null;
	const tone = colors.lesson ?? {fill: colors.primary, on: colors.onPrimary};
	return (
		<AbsoluteFill style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: safeArea.right * 1.6}}>
			<VoiceOrb size={360} color={tone.fill} tracks={tracks} delaySeconds={0.3} />
		</AbsoluteFill>
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
			</InkProvider>
		</AbsoluteFill>
	);
};

/** The end of a camp lesson: the camp task, and the next lesson (or the end of the camp). */
export const CampTaskScene: React.FC<{camp: CampEpisode; cues?: {items: number[]; next: number}}> = ({camp, cues}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	const last = camp.number === camp.total;
	return (
		<SafeArea chrome gap={SPACING.lg}>
			<Animated>
				<Text variant="headline" size={84}>
					Kamp görevi
				</Text>
			</Animated>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl), alignItems: isLandscape ? 'center' : 'stretch'}}>
				<div style={{flex: 1.4, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					{/* Each task arrives as it is said (without cues, one after another at the start). */}
					{camp.task.items.map((item, index) => (
						<Animated key={index} animation={{preset: 'slide', direction: 'left', distance: 60}} delaySeconds={cues?.items[index] ?? 0.4 + index * 0.7}>
							<Card padding={SPACING.lg} elevated={false}>
								<div style={{display: 'flex', gap: u(20), alignItems: 'center'}}>
									<div style={{flex: 'none', width: u(64), height: u(64), borderRadius: u(18), backgroundColor: tone.fill, color: tone.on, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										<Text size={34} weight={BRAND_TYPOGRAPHY.weights.kinetic} color={tone.on}>
											{index + 1}
										</Text>
									</div>
									<RichText text={item} size={38} />
								</div>
							</Card>
						</Animated>
					))}
				</div>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 80}} delaySeconds={cues?.next ?? 0.6 + camp.task.items.length * 0.7} style={{flex: 1}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(14), padding: u(SPACING.xl), borderRadius: u(32), backgroundColor: tone.fill}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
							<Icon name={last ? 'star' : 'arrowRight'} size={40} color={tone.on} />
							<Text variant="label" size={30} color={withAlpha(tone.on, 0.8)}>
								{last ? 'Kamp tamamlandı' : `Sıradaki ders · ${camp.number + 1} / ${camp.total}`}
							</Text>
						</div>
						<Text variant="title" size={58} color={tone.on}>
							{last ? `${camp.name} bitti. Tebrikler!` : camp.next ?? ''}
						</Text>
					</div>
				</Animated>
			</div>
		</SafeArea>
	);
};

/**
 * The chapter bar along the bottom of a camp lesson: one segment per chapter,
 * as long as the chapter, filling as it plays. It is the YouTube chapter list
 * on screen, so a viewer always sees how far the lesson has come.
 */
export const ChapterBar: React.FC<{plan: ScenePlan; chapterIds: readonly string[]}> = ({plan, chapterIds}) => {
	const frame = useCurrentFrame();
	const {colors} = useTheme();
	const {u, safeArea} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	const activeId = plan.scenes[activeSceneIndex(plan, frame)]?.id ?? '';
	// On the full-colour scenes (section openings, the camp card) the bar takes their ink.
	const onColour = SECTION_OPENING.test(activeId) || activeId === CAMP_SCENE_IDS.card;
	const ink = onColour ? tone.on : colors.text;
	const current = onColour ? ink : tone.fill;

	const starts = plan.scenes.filter((scene) => chapterIds.includes(scene.id)).map((scene) => scene.from);
	const end = plan.scenes.find((scene) => scene.id === OUTRO_SCENE_ID)?.from ?? plan.durationInFrames;
	const chapters = starts.map((from, index) => ({from, to: starts[index + 1] ?? end}));
	const height = COURSE_DESIGN.camp.chapterBarHeight;

	return (
		<div style={{position: 'absolute', left: safeArea.left, right: safeArea.right, bottom: safeArea.bottom * 0.38, display: 'flex', gap: u(8)}}>
			{chapters.map((chapter) => {
				const progress = Math.min(1, Math.max(0, (frame - chapter.from) / Math.max(1, chapter.to - chapter.from)));
				const playing = frame >= chapter.from && frame < chapter.to;
				return (
					<div key={chapter.from} style={{flex: chapter.to - chapter.from, height: u(height), borderRadius: u(height), backgroundColor: withAlpha(ink, 0.16), overflow: 'hidden'}}>
						<div style={{width: `${(progress * 100).toFixed(3)}%`, height: '100%', backgroundColor: playing ? current : withAlpha(ink, 0.5)}} />
					</div>
				);
			})}
		</div>
	);
};

/** The reel's top bar: the camp pill, then the story bar of the cards. */
export const CampShortChrome: React.FC<{plan: ScenePlan; camp: CampEpisode}> = ({plan, camp}) => {
	const {u} = useVideoLayout();
	const white = '#FFFFFF';
	return (
		<ChromeBar>
			<CampPill camp={camp} compact />
			<div style={{flex: 1, display: 'flex', padding: `${u(14)}px ${u(18)}px`, borderRadius: u(40), backgroundColor: withAlpha('#000000', 0.34)}}>
				<InkProvider ink={{text: white, muted: white, emphasis: white}}>
					<SegmentedProgress plan={plan} sceneIds={plan.scenes.map((scene) => scene.id).filter((id) => id !== OUTRO_SCENE_ID)} height={10} />
				</InkProvider>
			</div>
		</ChromeBar>
	);
};
