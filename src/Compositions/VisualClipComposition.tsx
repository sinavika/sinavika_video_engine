import React from 'react';
import {Composition, Folder, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {smoothStep} from '../Animations/Motion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {CourseVisual} from '../Components/Visuals/CourseVisual';
import {CourseVisualSchema, VisualBeatSchema} from '../Components/Visuals/VisualSchema';
import {VisualTimelineProvider} from '../Components/Visuals/VisualTimeline';
import {courseLessonTheme} from '../Themes/LessonAccent';

/**
 * One lesson figure alone as a moving clip, for promos that show the camps' animations: the visual on the camp
 * lessons' dark ground in its lesson colour, with no title, band, logo or progress bar. The owner asked for the camps'
 * geography and history scenes "telefon ekranına uygun" in the YouTube camp reel (1 Nov 2026); cut from a rendered
 * lesson, a scene filled only a band of the phone. With `window` the clip is drawn for the phone itself: the scene's
 * band fills a 9:16 frame and a slow documentary camera moves along it, the figure scaled as vectors, so it stays sharp
 * (cutting the same window out of an 8K clip took 28 s a frame to decode and failed the render, 5 Nov 2026).
 */
const VisualClipPropsSchema = z.object({
	visual: CourseVisualSchema,
	/** The beats of the figure's card. */
	beats: z.array(VisualBeatSchema).optional(),
	/** When each beat starts, in seconds from the clip's start; a beat before 0 has already played when the clip opens. */
	starts: z.array(z.number()).optional(),
	/** The lesson code whose colour the figure takes (TAR, COG…). */
	lesson: z.string().optional(),
	seconds: z.number().min(1).max(30).default(4),
	/**
	 * A phone clip: the band of the 16:9 scene between `top` and `bottom` (fractions of its height) fills a 9:16 frame,
	 * and the camera moves from `from` to `to` (fractions of the width left over) during the clip.
	 */
	window: z.object({top: z.number().min(0).max(0.5), bottom: z.number().min(0.5).max(1), from: z.number().min(0).max(1), to: z.number().min(0).max(1)}).optional(),
});

type VisualClipProps = z.infer<typeof VisualClipPropsSchema>;

const FPS = 60;
/** The scene's page: 4K, landscape, as a lesson draws it. */
const PAGE = {width: 3840, height: 2160};
/** The phone frame of a `window` clip. */
const PHONE = {width: 2160, height: 3840};
/** Room around the figure on its page, in pixels. */
const MARGIN = 80;

const Scene: React.FC<Pick<VisualClipProps, 'visual' | 'beats' | 'starts' | 'seconds'>> = ({visual, beats, starts, seconds}) => (
	<div style={{position: 'absolute', left: MARGIN, top: MARGIN, width: PAGE.width - 2 * MARGIN, height: PAGE.height - 2 * MARGIN}}>
		<VisualTimelineProvider beats={beats} starts={starts ?? beats?.map((_, index) => 0.3 + index * 0.8)} sceneSeconds={seconds}>
			<CourseVisual visual={visual} width={PAGE.width - 2 * MARGIN} height={PAGE.height - 2 * MARGIN} />
		</VisualTimelineProvider>
	</div>
);

/** The scene's page scaled so its band fills the phone's height, moved along as the clip plays. */
const PhoneWindow: React.FC<{window: NonNullable<VisualClipProps['window']>; seconds: number; children: React.ReactNode}> = ({window, seconds, children}) => {
	const frame = useCurrentFrame();
	const scale = PHONE.height / ((window.bottom - window.top) * PAGE.height);
	const along = window.from + (window.to - window.from) * smoothStep(Math.min(1, frame / FPS / seconds));
	const x = -(PAGE.width * scale - PHONE.width) * along;
	const y = -window.top * PAGE.height * scale;
	return <div style={{position: 'absolute', left: 0, top: 0, width: PAGE.width, height: PAGE.height, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${scale})`}}>{children}</div>;
};

const VisualClip: React.FC<VisualClipProps> = ({visual, beats, starts, lesson, seconds, window}) => {
	const scene = <Scene visual={visual} beats={beats} starts={starts} seconds={seconds} />;
	return (
		<VideoFrame themeId="SinavikaDark" theme={courseLessonTheme('SinavikaDark', lesson)}>
			{window ? (
				<PhoneWindow window={window} seconds={seconds}>
					{scene}
				</PhoneWindow>
			) : (
				scene
			)}
		</VideoFrame>
	);
};

const DEFAULT_PROPS: VisualClipProps = {visual: {kind: 'timeline', events: [{year: 1071, label: 'Malazgirt'}, {year: 1176, label: 'Miryokefalon'}], era: 'ce'}, seconds: 4};

export const VisualClipComposition: React.FC = () => (
	<Folder name="Promos">
		<Composition
			id="VisualClip"
			component={VisualClip}
			schema={VisualClipPropsSchema}
			defaultProps={DEFAULT_PROPS}
			fps={FPS}
			durationInFrames={4 * FPS}
			width={PAGE.width}
			height={PAGE.height}
			calculateMetadata={({props}) => {
				const parsed = VisualClipPropsSchema.parse(props);
				const size = parsed.window ? PHONE : PAGE;
				return {props: parsed, width: size.width, height: size.height, durationInFrames: Math.round(parsed.seconds * FPS)};
			}}
		/>
	</Folder>
);
