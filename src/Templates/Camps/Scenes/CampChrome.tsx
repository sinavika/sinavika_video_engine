import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ChromeBar} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SegmentedProgress} from '../../../Components/Overlays/SegmentedProgress';
import {VoiceOrb, type VoiceTrack} from '../../../Components/Overlays/VoiceOrb';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import type {CampEpisode} from '../../../Courses/Camp';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import {OUTRO_SCENE_ID} from '../../../Scenes/AppEndScene';
import {activeSceneIndex, type ScenePlan} from '../../../Scenes/ScenePlan';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';

/** Scene ids the camp layer adds to the lesson. Section openings are `s1`, `s2`, ... (CourseLesson). */
export const CAMP_SCENE_IDS = {card: 'camp', task: 'camp-task'} as const;

const SECTION_OPENING = /^s\d+$/;

/** "Ders 3 / 15" */
export const lessonNumberText = (camp: CampEpisode): string => `Ders ${camp.number} / ${camp.total}`;

/** The camp pill: the camp's name and the lesson number, in the lesson colour. The same on the lesson and the reel. */
const CampPill: React.FC<{camp: CampEpisode; compact?: boolean}> = ({camp, compact = false}) => {
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
export const CampProgress: React.FC<{camp: CampEpisode; ink: string; delaySeconds: number}> = ({camp, ink, delaySeconds}) => {
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
 * The bottom band of a camp lesson (studio layout, 31 Oct 2026): where the viewer is, in one line. The lesson and
 * the lesson number in the camp, the chapter being played, then the chapter bar: one segment per chapter, as long
 * as the chapter, filling as it plays (the YouTube chapter list on screen). It replaced the bare chapter bar and the
 * lesson and topic row the classic layout put at the top of every card.
 */
export const StudioBand: React.FC<{plan: ScenePlan; chapters: readonly {id: string; title: string}[]; lessonName: string; camp: CampEpisode}> = ({plan, chapters, lessonName, camp}) => {
	const frame = useCurrentFrame();
	const {colors, typography} = useTheme();
	const {u, safeArea} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	const activeId = plan.scenes[activeSceneIndex(plan, frame)]?.id ?? '';
	const onColour = SECTION_OPENING.test(activeId) || activeId === CAMP_SCENE_IDS.card;
	const ink = onColour ? tone.on : colors.text;
	const current = onColour ? ink : tone.fill;
	const end = plan.scenes.find((scene) => scene.id === OUTRO_SCENE_ID)?.from ?? plan.durationInFrames;
	const spans = chapters.flatMap((chapter) => {
		const scene = plan.scenes.find((entry) => entry.id === chapter.id);
		return scene ? [{title: chapter.title, from: scene.from}] : [];
	});
	const parts = spans.map((span, index) => ({...span, to: spans[index + 1]?.from ?? end}));
	const playing = parts.filter((part) => frame >= part.from).at(-1) ?? parts[0];
	const height = COURSE_DESIGN.camp.chapterBarHeight;
	return (
		<div style={{position: 'absolute', left: safeArea.left, right: safeArea.right, bottom: safeArea.bottom * 0.2, height: u(44), display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
			<div style={{flexShrink: 0, padding: `${u(7)}px ${u(16)}px`, borderRadius: u(999), backgroundColor: onColour ? withAlpha(ink, 0.16) : tone.fill, color: onColour ? ink : tone.on, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(22), lineHeight: 1, whiteSpace: 'nowrap'}}>
				{lessonName} · {camp.number}/{camp.total}
			</div>
			<div style={{flexShrink: 1, minWidth: 0, maxWidth: u(560), color: withAlpha(ink, 0.8), fontFamily: typography.display, fontWeight: 700, fontSize: u(24), lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{playing?.title ?? ''}</div>
			<div style={{flex: 1, display: 'flex', gap: u(6)}}>
				{parts.map((part) => {
					const progress = Math.min(1, Math.max(0, (frame - part.from) / Math.max(1, part.to - part.from)));
					const now = frame >= part.from && frame < part.to;
					return (
						<div key={part.from} style={{flex: part.to - part.from, height: u(height), borderRadius: u(height), backgroundColor: withAlpha(ink, 0.16), overflow: 'hidden'}}>
							<div style={{width: `${(progress * 100).toFixed(3)}%`, height: '100%', backgroundColor: now ? current : withAlpha(ink, 0.5)}} />
						</div>
					);
				})}
			</div>
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
