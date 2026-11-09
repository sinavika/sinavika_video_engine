import {z} from 'zod';
import {UI_CANVAS, UI_LANGS, UI_MODES} from './Tokens';

/** Props of the UI/UX compositions, shared by the compositions and the export script. */
export const UIUX_SCREEN_ID = 'UIUXScreen';
export const UIUX_BOARD_ID = 'UIUXBoard';

export const UIUXScreenPropsSchema = z.object({
	id: z.string().default('m-hub-moduller'),
	lang: z.enum(UI_LANGS).default('tr'),
	mode: z.enum(UI_MODES).default('light'),
});
export type UIUXScreenProps = z.infer<typeof UIUXScreenPropsSchema>;

export const UIUXBoardPropsSchema = z.object({
	/** Screen ids on the board, in order. */
	ids: z.array(z.string()).default(['m-hub-moduller']),
	title: z.string().default(''),
	lang: z.enum(UI_LANGS).default('tr'),
	mode: z.enum(UI_MODES).default('light'),
	columns: z.number().int().positive().default(4),
});
export type UIUXBoardProps = z.infer<typeof UIUXBoardPropsSchema>;

/** Board layout: each screen drawn at this width, with its title above. Tablet portrait cells keep the landscape cells' height. */
export const BOARD = {mobileWidth: 390, webWidth: 720, tabletWidth: 900, tabletPortraitWidth: 449, gap: 48, padding: 72, header: 150, caption: 64} as const;

export const screenSize = (platform: 'mobile' | 'web' | 'site' | 'tablet', height?: number, portrait?: boolean): {width: number; height: number} => {
	if (platform === 'mobile') return {width: UI_CANVAS.mobile.width, height: UI_CANVAS.mobile.height};
	if (platform === 'tablet') return portrait ? {width: UI_CANVAS.tablet.height, height: UI_CANVAS.tablet.width} : {width: UI_CANVAS.tablet.width, height: UI_CANVAS.tablet.height};
	return {width: UI_CANVAS.web.width, height: height ?? UI_CANVAS.web.height};
};
