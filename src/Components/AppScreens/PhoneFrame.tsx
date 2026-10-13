import React from 'react';
import {AppModeProvider} from './AppScreenParts';
import {APP_PALETTES, APP_SCREEN, type AppMode} from './AppScreenTokens';

const PHONE_BODY = '#0B0C0F';

type PhoneFrameProps = {
	/** Outer width of the phone, in actual pixels. Its height follows from the app's screen shape. */
	width: number;
	/** The app theme the screens inside are drawn in. */
	mode?: AppMode;
	style?: React.CSSProperties;
	/** One or more app screens. Several are stacked; the caller decides which shows (how a video moves between screens). */
	children: React.ReactNode;
};

/** Height of a phone of the given width, for layouts that need to reserve the space. */
export const phoneHeight = (width: number): number => {
	const bezel = width * 0.034;
	return (APP_SCREEN.height * (width - bezel * 2)) / APP_SCREEN.width + bezel * 2;
};

/**
 * The one phone of this project: videos and images both show app screens in
 * it. Whatever is drawn on the 390x844 app canvas is scaled to fit.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({width, mode = 'light', style, children}) => {
	const bezel = width * 0.034;
	const scale = (width - bezel * 2) / APP_SCREEN.width;
	return (
		<div
			style={{
				boxSizing: 'border-box',
				width,
				height: phoneHeight(width),
				padding: bezel,
				borderRadius: width * 0.15,
				backgroundColor: PHONE_BODY,
				boxShadow: `0 ${width * 0.1}px ${width * 0.28}px rgba(0, 0, 0, 0.5), inset 0 0 0 ${Math.max(1, width * 0.006)}px rgba(255, 255, 255, 0.2)`,
				flexShrink: 0,
				...style,
			}}
		>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * 0.118, overflow: 'hidden', backgroundColor: APP_PALETTES[mode].background}}>
				<AppModeProvider mode={mode}>
					{React.Children.map(children, (child) => (
						<div style={{position: 'absolute', top: 0, left: 0, width: APP_SCREEN.width, height: APP_SCREEN.height, transform: `scale(${scale})`, transformOrigin: 'top left'}}>{child}</div>
					))}
				</AppModeProvider>
				<div style={{position: 'absolute', top: width * 0.03, left: '50%', width: width * 0.3, height: width * 0.075, marginLeft: -width * 0.15, borderRadius: width, backgroundColor: PHONE_BODY}} />
			</div>
		</div>
	);
};
