import {useVisualPalette} from '../VisualFrame';
import {UNFOCUSED_FADE} from '../VisualTimeline';

/**
 * Beats on the language visuals (sentence, comparison, table). A part a beat
 * `show`s comes in with that beat; a part a beat `focus`es turns to the
 * lesson colour and grows a little while the rest dims. Part names:
 *
 *   sentence     w1, w2, ... one per word tile, left to right (Language/Sentence)
 *   comparison   c1, c2, c3 the columns; c1-1, c1-2, ... the items of a column
 *   table        r1, r2, ... the rows; col1, col2, ... the columns (with their header)
 *
 * Without beats nothing changes: the parts build themselves in their first seconds.
 * These visuals take the width of their box; CourseVisual lets them grow to fill it.
 */
export const partLook = (state: {appear: number; emphasis: number; dim: number}) => ({opacity: state.appear * (1 - UNFOCUSED_FADE * state.dim), emphasis: state.emphasis});

/** Colours of the columns of a comparison and the sets of a Venn diagram: the lesson, the ink, the lesson's deep tone. No brand orange (docs/CourseColors.md). */
export const COMPARISON_ACCENTS = (palette: ReturnType<typeof useVisualPalette>): [string, string, string] => [palette.lesson, palette.ink, palette.lessonDeep];
