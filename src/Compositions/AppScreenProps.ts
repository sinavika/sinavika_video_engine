import {z} from 'zod';
import {APP_SCREEN_NAMES} from '../Components/AppScreens/AppScreenRegistry';
import {APP_MODES, APP_SCREEN} from '../Components/AppScreens/AppScreenTokens';
import {phoneHeight} from '../Components/AppScreens/PhoneFrame';

/** Props and size of the AppScreen composition, shared by the composition and its renderer. */
export const APP_SCREEN_COMPOSITION_ID = 'AppScreen';

/** 3x the app's 390x844 canvas: the resolution of a real phone screenshot. */
export const APP_SCREENSHOT_SCALE = 3;
export const APP_SCREEN_DEVICE_WIDTH = 900;
const DEVICE_MARGIN = 110;

export const AppScreenPropsSchema = z.object({
	screen: z.enum(APP_SCREEN_NAMES),
	mode: z.enum(APP_MODES).default('light'),
	/** Draw the phone around the screen, on the brand background. */
	device: z.boolean().default(false),
});
export type AppScreenProps = z.infer<typeof AppScreenPropsSchema>;

/** Pixel size of the picture for the given props. */
export const appScreenSize = ({device}: Pick<AppScreenProps, 'device'>): {width: number; height: number} =>
	device
		? {width: APP_SCREEN_DEVICE_WIDTH + DEVICE_MARGIN * 2, height: Math.round(phoneHeight(APP_SCREEN_DEVICE_WIDTH)) + DEVICE_MARGIN * 2}
		: {width: APP_SCREEN.width * APP_SCREENSHOT_SCALE, height: APP_SCREEN.height * APP_SCREENSHOT_SCALE};
