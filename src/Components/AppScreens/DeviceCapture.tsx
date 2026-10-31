import React from 'react';
import {Img, staticFile} from 'remotion';
import {APP_SCREEN} from './AppScreenTokens';
import {PhoneFrame, type PhoneScreenShape, type PhoneVariant} from './PhoneFrame';

/**
 * A real capture of the app inside the project's one phone. Captures come from
 * the Android emulator at 20:9 (1440 × 3200, the same layout as 1080 × 2400)
 * with the status bar 1/37.5 of the height (clock 09:41). Only proportions are
 * used, so any 20:9 capture fits.
 *
 * - Android: the capture is shown whole. The phone takes the capture's shape,
 *   so nothing is cropped, and the punch-hole sits in the middle of the
 *   capture's own status bar.
 * - iOS: Android's status bar is replaced by an iOS one (time left, icons
 *   right, Dynamic Island between), drawn on the colour of the capture's first
 *   row under the bar. App Store pictures never show Android's bar.
 *
 * Every place that shows a capture (store pictures, promo films) uses this,
 * so the fit is fixed in one place.
 */
/** Proportions of a capture, in the 1080-wide reference; a 1440 × 3200 capture scales the same. */
export const CAPTURE = {width: 1080, height: 2400, statusBar: 64} as const;

/** iOS status bar height as a fraction of the screen width (54 pt on a 390 pt screen). */
const IOS_STATUS_BAR = 0.138;
/** The row just under Android's status bar: its colour fills the iOS bar. */
const SAMPLE_ROW = CAPTURE.statusBar + 6;

const captureScreenShape = (variant: PhoneVariant): PhoneScreenShape =>
	variant === 'android'
		? {aspect: CAPTURE.height / CAPTURE.width, statusBar: CAPTURE.statusBar / CAPTURE.width}
		: {aspect: (CAPTURE.height - CAPTURE.statusBar) / CAPTURE.width + IOS_STATUS_BAR, statusBar: IOS_STATUS_BAR};

const resolve = (src: string): string => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

const IosStatusBar: React.FC<{height: number; ink: string}> = ({height, ink}) => {
	const size = height * 0.3;
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${height * 0.62}px`, color: ink}}>
			<div style={{fontSize: size * 1.12, fontWeight: 700, letterSpacing: '-0.01em'}}>9:41</div>
			<div style={{display: 'flex', alignItems: 'center', gap: size * 0.35}}>
				<svg width={size * 1.15} height={size * 0.78} viewBox="0 0 18 12" fill={ink}>
					<rect x="0" y="8" width="3" height="4" rx="1" />
					<rect x="5" y="5.5" width="3" height="6.5" rx="1" />
					<rect x="10" y="3" width="3" height="9" rx="1" />
					<rect x="15" y="0" width="3" height="12" rx="1" />
				</svg>
				<svg width={size * 1.05} height={size * 0.78} viewBox="0 0 16 12" fill={ink}>
					<path d="M8 2.2c2.5 0 4.8 1 6.5 2.6l1.3-1.4A11 11 0 0 0 8 .2 11 11 0 0 0 .2 3.4l1.3 1.4A9.1 9.1 0 0 1 8 2.2Zm0 3.7c1.5 0 2.9.6 3.9 1.5l1.3-1.4A7.4 7.4 0 0 0 8 3.9a7.4 7.4 0 0 0-5.2 2.1l1.3 1.4c1-.9 2.4-1.5 3.9-1.5Zm0 3.6c.6 0 1.2.2 1.6.6L8 11.8 6.4 10.1c.4-.4 1-.6 1.6-.6Z" />
				</svg>
				<svg width={size * 1.7} height={size * 0.8} viewBox="0 0 26 12">
					<rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={ink} strokeOpacity="0.4" />
					<rect x="2" y="2" width="19" height="8" rx="1.8" fill={ink} />
					<rect x="23.5" y="4" width="2" height="4" rx="1" fill={ink} fillOpacity="0.4" />
				</svg>
			</div>
		</div>
	);
};

/** Draws the capture (a still or a recording) with the given placement. */
export type CaptureMedia = (style: React.CSSProperties) => React.ReactNode;

export const captureImage = (src: string): CaptureMedia => (style) => <Img src={resolve(src)} style={style} />;

/** The capture laid out on the phone's screen canvas (390 app points wide). */
const CaptureCanvas: React.FC<{media: CaptureMedia; variant: PhoneVariant; statusInk?: string}> = ({media, variant, statusInk = '#0B1C30'}) => {
	const k = APP_SCREEN.width / CAPTURE.width;
	const imageHeight = CAPTURE.height * k;
	if (variant === 'android') {
		return <>{media({position: 'absolute', top: 0, left: 0, width: '100%', height: imageHeight})}</>;
	}
	const bar = IOS_STATUS_BAR * APP_SCREEN.width;
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			{media({position: 'absolute', left: 0, top: bar - CAPTURE.statusBar * k, width: '100%', height: imageHeight})}
			<div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: bar, overflow: 'hidden'}}>
				{/* One row of the capture, stretched over the whole bar: the bar takes the screen's own colour. */}
				<div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 1, overflow: 'hidden', transform: `scaleY(${bar})`, transformOrigin: 'top'}}>
					{media({position: 'absolute', left: 0, top: -SAMPLE_ROW * k, width: '100%', height: imageHeight})}
				</div>
				<IosStatusBar height={bar} ink={statusInk} />
			</div>
		</div>
	);
};

type DeviceCaptureProps = {
	/** Path under public/ (or a URL) of a 1080 × 2400 capture. */
	src?: string;
	/** A recording or other media in place of `src`, placed by the same rules. */
	media?: CaptureMedia;
	/** Outer width of the phone, in actual pixels. */
	width: number;
	variant?: PhoneVariant;
	/** The showcase finish (metal rim, side buttons) for promotional films. */
	rim?: boolean;
	/** Colour of the iOS status bar's time and icons; captures are light, so dark by default. */
	statusInk?: string;
	style?: React.CSSProperties;
};

export const DeviceCapture: React.FC<DeviceCaptureProps> = ({src, media, width, variant = 'android', rim = false, statusInk = '#0B1C30', style}) => {
	const draw = media ?? (src ? captureImage(src) : undefined);
	return (
		<PhoneFrame width={width} variant={variant} screen={captureScreenShape(variant)} rim={rim} style={style}>
			{draw ? <CaptureCanvas media={draw} variant={variant} statusInk={statusInk} /> : null}
		</PhoneFrame>
	);
};
