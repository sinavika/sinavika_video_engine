import {z} from 'zod';
import {CourseVisualSchema, VisualBeatSchema} from '../Components/Visuals/VisualSchema';
import {workFigureBox} from '../Courses/WorkFigure';

/** Props and size of the WorkFigure composition (one lesson figure as the app shows it), shared with its renderer. */
export const WORK_FIGURE_COMPOSITION_ID = 'WorkFigure';

export const WorkFigurePropsSchema = z.object({
	visual: CourseVisualSchema,
	/** The beats of the figure's card, when it has them: the figure is drawn as they leave it. */
	beats: z.array(VisualBeatSchema).optional(),
	mode: z.enum(['light', 'dark']).default('light'),
});

export type WorkFigureProps = z.infer<typeof WorkFigurePropsSchema>;

/** Room around the figure's box on the page, in layout units. */
export const WORK_FIGURE_MARGIN = 40;

/** Seconds per beat on the figure's own timeline, and how long after the last one the still is taken. */
export const WORK_FIGURE_BEAT_SECONDS = 1;
const SETTLE_SECONDS = 40;

export const WORK_FIGURE_FPS = 30;

/** How long the figure's scene lasts: one second per beat and then long enough for every reveal and stage to end. */
export const workFigureSeconds = (beats: readonly unknown[] | undefined) => (beats?.length ?? 0) * WORK_FIGURE_BEAT_SECONDS + SETTLE_SECONDS;

/**
 * The page the figure is drawn on. Its short edge is 1080, so a layout unit is one pixel and text keeps the sizes it
 * has in a lesson: a landscape page when the box fits, else a page 1080 wide and as tall as the box needs.
 */
export const workFigurePage = (props: Pick<WorkFigureProps, 'visual'>) => {
	const box = workFigureBox(props.visual);
	const height = box.height + 2 * WORK_FIGURE_MARGIN;
	return height <= 1080 ? {width: 1920, height: 1080, box} : {width: 1080, height, box};
};
