import React from 'react';
import {AbsoluteFill, Composition, Folder} from 'remotion';
import {AppModeProvider} from '../Components/AppScreens/AppScreenParts';
import {APP_SCREENS} from '../Components/AppScreens/AppScreenRegistry';
import {APP_SCREEN} from '../Components/AppScreens/AppScreenTokens';
import {PhoneFrame} from '../Components/AppScreens/PhoneFrame';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {APP_SCREEN_COMPOSITION_ID, APP_SCREEN_DEVICE_WIDTH, APP_SCREENSHOT_SCALE, AppScreenPropsSchema, appScreenSize, type AppScreenProps} from './AppScreenProps';

/**
 * An app screen on its own, as a picture: either the bare screen at phone
 * screenshot resolution, or the screen inside the phone on the brand
 * background. One composition serves every screen; which one is drawn comes
 * from the props (see AppScreenProps.ts).
 */
const AppScreenPicture: React.FC<AppScreenProps> = ({screen, mode, device}) => {
	const Screen = APP_SCREENS[screen].Component;
	return (
		<VideoFrame themeId={mode === 'dark' ? 'SinavikaDark' : 'SinavikaLight'}>
			{device ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<PhoneFrame width={APP_SCREEN_DEVICE_WIDTH} mode={mode}>
						<Screen />
					</PhoneFrame>
				</AbsoluteFill>
			) : (
				<AbsoluteFill>
					<AppModeProvider mode={mode}>
						<div style={{width: APP_SCREEN.width, height: APP_SCREEN.height, transform: `scale(${APP_SCREENSHOT_SCALE})`, transformOrigin: 'top left'}}>
							<Screen />
						</div>
					</AppModeProvider>
				</AbsoluteFill>
			)}
		</VideoFrame>
	);
};

const DEFAULT_PROPS: AppScreenProps = {screen: 'Home', mode: 'light', device: false};

export const AppScreenComposition: React.FC = () => (
	<Folder name="AppScreens">
		<Composition
			id={APP_SCREEN_COMPOSITION_ID}
			component={AppScreenPicture}
			schema={AppScreenPropsSchema}
			defaultProps={DEFAULT_PROPS}
			durationInFrames={1}
			fps={30}
			{...appScreenSize(DEFAULT_PROPS)}
			calculateMetadata={({props}) => {
				const parsed = AppScreenPropsSchema.parse(props);
				return {props: parsed, ...appScreenSize(parsed)};
			}}
		/>
	</Folder>
);
