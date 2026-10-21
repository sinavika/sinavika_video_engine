import React from 'react';
import {AppCanvasProvider, AppLanguageProvider, AppModeProvider, type AppLanguage} from './AppScreenParts';
import {APP_PALETTES, APP_SCREEN, type AppMode} from './AppScreenTokens';

const PHONE_BODY = '#0B0C0F';

/**
 * The proportions of the project's one phone (iOS look), shared by every
 * place that draws a phone: the app-screen PhoneFrame here and the UI/UX
 * DevicePhone used by the promo reels and posts. Fractions of the outer width.
 */
export const PHONE_GEOMETRY = {
	body: PHONE_BODY,
	bezel: 0.034,
	outerRadius: 0.15,
	screenRadius: 0.118,
	island: {top: 0.03, width: 0.3, height: 0.075},
} as const;

/** iOS: Dynamic Island; Android: a centred punch-hole camera (for Google Play listings). */
export type PhoneVariant = 'ios' | 'android';

/**
 * The screen inside the phone. Drawn app screens use the app canvas (390 × 844);
 * a real capture brings its own shape and its own status bar, so the camera
 * cutout is centred in that bar instead of covering the content.
 */
export type PhoneScreenShape = {
	/** Screen height / screen width. */
	aspect: number;
	/** Height of the status bar, as a fraction of the screen width. */
	statusBar: number;
};

export const APP_CANVAS_SCREEN: PhoneScreenShape = {aspect: APP_SCREEN.height / APP_SCREEN.width, statusBar: 0.115};

type PhoneFrameProps = {
	/** Outer width of the phone, in actual pixels. Its height follows from the app's screen shape. */
	width: number;
	/** The screen's shape; defaults to the drawn app canvas. */
	screen?: PhoneScreenShape;
	/** A lit metal rim and side buttons: the showcase finish for promotional films. */
	rim?: boolean;
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
export const phoneHeight = (width: number, screen: PhoneScreenShape = APP_CANVAS_SCREEN, variant: PhoneVariant = 'ios'): number => {
	const bezel = width * (variant === 'android' ? 0.028 : 0.034);
	return screen.aspect * (width - bezel * 2) + bezel * 2;
};

/**
 * The one phone of this project: videos and images both show app screens in
 * it. Whatever is drawn on the 390x844 app canvas is scaled to fit.
 */
export const PhoneFrame: React.FC<PhoneFrameProps> = ({width, screen = APP_CANVAS_SCREEN, rim = false, mode = 'light', lang = 'tr', variant = 'ios', style, children}) => {
	const bezel = width * (variant === 'android' ? 0.028 : 0.034);
	const inner = width - bezel * 2;
	const scale = inner / APP_SCREEN.width;
	const height = phoneHeight(width, screen, variant);
	const outerRadius = width * (variant === 'android' ? 0.11 : 0.15);
	// Cutouts sit in the middle of the status bar: on a capture its bar is its own, on drawn screens the app's.
	const bar = screen.statusBar * inner;
	const hole = width * 0.038;
	// Drawn screens keep the cutout exactly where it always was; captures centre it in their own bar.
	const drawn = screen === APP_CANVAS_SCREEN;
	const island = drawn ? {width: width * 0.3, height: width * 0.075} : {width: width * 0.27, height: Math.min(width * 0.075, bar * 0.72)};
	const holeTop = drawn ? width * 0.035 : Math.max(width * 0.01, (bar - hole) / 2);
	const islandTop = drawn ? width * 0.03 : Math.max(width * 0.012, (bar - island.height) / 2);
	return (
		<div
			style={{
				position: 'relative',
				boxSizing: 'border-box',
				width,
				height,
				padding: bezel,
				borderRadius: outerRadius,
				background: rim ? `linear-gradient(135deg, #5B6070 0%, #1A1C22 18%, #0B0C0F 50%, #23262E 82%, #6B7080 100%)` : PHONE_BODY,
				boxShadow: rim
					? `0 ${width * 0.12}px ${width * 0.3}px rgba(0, 0, 0, 0.45), inset 0 0 0 ${Math.max(1, width * 0.008)}px rgba(255, 255, 255, 0.28), inset 0 0 0 ${Math.max(2, width * 0.016)}px #0B0C0F`
					: `0 ${width * 0.1}px ${width * 0.28}px rgba(0, 0, 0, 0.5), inset 0 0 0 ${Math.max(1, width * 0.006)}px rgba(255, 255, 255, 0.2)`,
				flexShrink: 0,
				...style,
			}}
		>
			{rim ? (
				<>
					<div style={{position: 'absolute', right: -width * 0.012, top: height * 0.2, width: width * 0.014, height: height * 0.1, borderRadius: width, background: 'linear-gradient(90deg, #2A2D35, #6B7080)'}} />
					<div style={{position: 'absolute', left: -width * 0.012, top: height * 0.17, width: width * 0.014, height: height * 0.06, borderRadius: width, background: 'linear-gradient(270deg, #2A2D35, #6B7080)'}} />
					<div style={{position: 'absolute', left: -width * 0.012, top: height * 0.25, width: width * 0.014, height: height * 0.06, borderRadius: width, background: 'linear-gradient(270deg, #2A2D35, #6B7080)'}} />
				</>
			) : null}
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
					<div style={{position: 'absolute', top: holeTop, left: '50%', width: hole, height: hole, marginLeft: -hole / 2, borderRadius: '50%', backgroundColor: PHONE_BODY}} />
				) : (
					<div style={{position: 'absolute', top: islandTop, left: '50%', width: island.width, height: island.height, marginLeft: -island.width / 2, borderRadius: width, backgroundColor: PHONE_BODY}} />
				)}
				{rim ? <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none'}} /> : null}
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
