import React from 'react';
import {AppCanvasProvider, AppLanguageProvider, AppModeProvider, type AppLanguage} from './AppScreenParts';
import {APP_PALETTES, APP_SCREEN, type AppMode} from './AppScreenTokens';

const PHONE_BODY = '#0B0C0F';

/** iOS: Dynamic Island; Android: a centred punch-hole camera (for Google Play listings). */
export type PhoneVariant = 'ios' | 'android';

type PhoneFrameProps = {
	/** Outer width of the phone, in actual pixels. Its height follows from the app's screen shape. */
	width: number;
	/** The app theme the screens inside are drawn in. */
	mode?: AppMode;
	/** The app language the screens inside are drawn in. */
	lang?: AppLanguage;
	variant?: PhoneVariant;
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
export const PhoneFrame: React.FC<PhoneFrameProps> = ({width, mode = 'light', lang = 'tr', variant = 'ios', style, children}) => {
	const bezel = width * (variant === 'android' ? 0.028 : 0.034);
	const scale = (width - bezel * 2) / APP_SCREEN.width;
	const height = phoneHeight(width);
	return (
		<div
			style={{
				boxSizing: 'border-box',
				width,
				height,
				padding: bezel,
				borderRadius: width * (variant === 'android' ? 0.11 : 0.15),
				backgroundColor: PHONE_BODY,
				boxShadow: `0 ${width * 0.1}px ${width * 0.28}px rgba(0, 0, 0, 0.5), inset 0 0 0 ${Math.max(1, width * 0.006)}px rgba(255, 255, 255, 0.2)`,
				flexShrink: 0,
				...style,
			}}
		>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: width * (variant === 'android' ? 0.085 : 0.118), overflow: 'hidden', backgroundColor: APP_PALETTES[mode].background}}>
				<AppModeProvider mode={mode}>
					<AppLanguageProvider lang={lang}>
						<AppCanvasProvider width={APP_SCREEN.width} height={(height - bezel * 2) / scale}>
							{React.Children.map(children, (child) => (
								<div style={{position: 'absolute', top: 0, left: 0, width: APP_SCREEN.width, height: (height - bezel * 2) / scale, transform: `scale(${scale})`, transformOrigin: 'top left'}}>{child}</div>
							))}
						</AppCanvasProvider>
					</AppLanguageProvider>
				</AppModeProvider>
				{variant === 'android' ? (
					<div style={{position: 'absolute', top: width * 0.035, left: '50%', width: width * 0.038, height: width * 0.038, marginLeft: -width * 0.019, borderRadius: '50%', backgroundColor: PHONE_BODY}} />
				) : (
					<div style={{position: 'absolute', top: width * 0.03, left: '50%', width: width * 0.3, height: width * 0.075, marginLeft: -width * 0.15, borderRadius: width, backgroundColor: PHONE_BODY}} />
				)}
			</div>
		</div>
	);
};

type TabletFrameProps = {
	/** Outer size of the tablet, in actual pixels. */
	width: number;
	height: number;
	/** Width of the app canvas on the tablet, in app points; the height follows from the tablet's shape. Wider shows more of the layout at a smaller size. */
	canvasWidth?: number;
	mode?: AppMode;
	lang?: AppLanguage;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/**
 * A tablet (iPad / Android tablet) showing the app's screens spread to the
 * tablet's width: the same screens as the phone, laid out on a wider canvas.
 */
export const TabletFrame: React.FC<TabletFrameProps> = ({width, height, canvasWidth = 640, mode = 'light', lang = 'tr', style, children}) => {
	const bezel = Math.min(width, height) * 0.035;
	const innerWidth = width - bezel * 2;
	const innerHeight = height - bezel * 2;
	const scale = innerWidth / canvasWidth;
	const canvasHeight = innerHeight / scale;
	return (
		<div
			style={{
				boxSizing: 'border-box',
				width,
				height,
				padding: bezel,
				borderRadius: Math.min(width, height) * 0.075,
				backgroundColor: PHONE_BODY,
				boxShadow: `0 ${width * 0.06}px ${width * 0.18}px rgba(0, 0, 0, 0.42), inset 0 0 0 ${Math.max(1, width * 0.004)}px rgba(255, 255, 255, 0.2)`,
				flexShrink: 0,
				...style,
			}}
		>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: Math.min(width, height) * 0.045, overflow: 'hidden', backgroundColor: APP_PALETTES[mode].background}}>
				<AppModeProvider mode={mode}>
					<AppLanguageProvider lang={lang}>
						<AppCanvasProvider width={canvasWidth} height={canvasHeight}>
							{React.Children.map(children, (child) => (
								<div style={{position: 'absolute', top: 0, left: 0, width: canvasWidth, height: canvasHeight, transform: `scale(${scale})`, transformOrigin: 'top left'}}>{child}</div>
							))}
						</AppCanvasProvider>
					</AppLanguageProvider>
				</AppModeProvider>
			</div>
		</div>
	);
};
