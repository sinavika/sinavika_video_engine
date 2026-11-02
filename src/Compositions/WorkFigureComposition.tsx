import React from 'react';
import {Composition, Folder} from 'remotion';
import {LayoutGuard} from '../Components/Layouts/LayoutGuard';
import {raiseForStill} from '../Components/Layouts/TextFloor';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {CourseVisual} from '../Components/Visuals/CourseVisual';
import {StillFigure} from '../Components/Visuals/VisualFrame';
import {VisualTimelineProvider} from '../Components/Visuals/VisualTimeline';
import {WORK_FIGURE_MIN_TEXT_PX, WORK_FIGURE_ROOM, WORK_FIGURE_STILL_WIDTH, WORK_FIGURE_TEXT_FLOOR, finalBeats, workFigureTheme} from '../Courses/WorkFigure';
import {WORK_FIGURE_BEAT_SECONDS, WORK_FIGURE_COMPOSITION_ID, WORK_FIGURE_FPS, WORK_FIGURE_MARGIN, WorkFigurePropsSchema, workFigurePage, workFigureSeconds, type WorkFigureProps} from './WorkFigureProps';

/**
 * Raises what is still under the still's smallest text on the settled page and tells the renderer what it raised
 * ("[TextFloor] 2: Magma 14→20 | Tortul 14→20"), once, from the light still.
 */
const raiseText = (report: boolean) => (root: Element) => {
	const box = root.querySelector('[data-work-figure]');
	if (!box) return;
	// A little over 28 pixels: the still's measure rounds to a tenth, and a stroke reaches past its shape's box.
	const raised = raiseForStill(root, box, WORK_FIGURE_TEXT_FLOOR, {minPx: WORK_FIGURE_MIN_TEXT_PX * 1.02, width: WORK_FIGURE_STILL_WIDTH, room: WORK_FIGURE_ROOM});
	if (report && raised.length) console.warn(`[TextFloor] ${raised.length}: ${raised.slice(0, 6).map((item) => `${item.text.slice(0, 30)} ${item.from}→${item.to}`).join(' | ')}`);
};
const RAISE = {light: raiseText(true), dark: raiseText(false)};

/**
 * One lesson figure as the app shows it (Works): the visual alone, no card, title, brand or progress bar, on a
 * transparent page in the app's "Dersler" colours, as its beats leave it. Rendered at its last frame. Before it is
 * taken, text still under the floor is raised (TextFloor), and the light one is checked by the layout guard: raised
 * text may run into other text.
 */
const WorkFigurePicture: React.FC<WorkFigureProps> = ({visual, beats, mode}) => {
	const {box} = workFigurePage({visual});
	const final = finalBeats(beats);
	return (
		<VideoFrame themeId={mode === 'dark' ? 'SinavikaDark' : 'SinavikaLight'} theme={workFigureTheme(mode)} transparent>
			{/* No CSS shadows on a figure: printed to a vector page they became blurred picture tiles (a timeline's text halos came out as 81 images in boxes). */}
			<style>{'* { text-shadow: none !important; box-shadow: none !important; }'}</style>
			<div data-work-figure style={{position: 'absolute', left: WORK_FIGURE_MARGIN, top: WORK_FIGURE_MARGIN, width: box.width, height: box.height}}>
				<VisualTimelineProvider beats={final} starts={final?.map((_, index) => index * WORK_FIGURE_BEAT_SECONDS)} sceneSeconds={workFigureSeconds(beats)}>
					<StillFigure textFloor={WORK_FIGURE_TEXT_FLOOR}>
						<CourseVisual visual={visual} width={box.width} height={box.height} />
					</StillFigure>
				</VisualTimelineProvider>
			</div>
			<LayoutGuard prepare={RAISE[mode]} report={mode === 'light'} />
		</VideoFrame>
	);
};

const DEFAULT_PROPS: WorkFigureProps = {visual: {kind: 'timeline', events: [{year: 1071, label: 'Malazgirt'}, {year: 1176, label: 'Miryokefalon'}], era: 'ce'}, mode: 'light'};

export const WorkFigureComposition: React.FC = () => (
	<Folder name="Works">
		<Composition
			id={WORK_FIGURE_COMPOSITION_ID}
			component={WorkFigurePicture}
			schema={WorkFigurePropsSchema}
			defaultProps={DEFAULT_PROPS}
			fps={WORK_FIGURE_FPS}
			durationInFrames={workFigureSeconds(undefined) * WORK_FIGURE_FPS}
			width={1920}
			height={1080}
			calculateMetadata={({props}) => {
				const parsed = WorkFigurePropsSchema.parse(props);
				const page = workFigurePage(parsed);
				return {props: parsed, width: page.width, height: page.height, durationInFrames: Math.round(workFigureSeconds(parsed.beats) * WORK_FIGURE_FPS)};
			}}
		/>
	</Folder>
);
