import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Image} from '../../Schemas/Visual';
import {withAlpha} from '../../Themes/Theme';
import {useTheme} from '../../Themes/ThemeContext';
import {useImageLayout} from './ImageFrame';
import {APP_SCREENS, type AppScreenName} from '../../Components/AppScreens/AppScreenRegistry';
import type {AppMode} from '../../Components/AppScreens/AppScreenTokens';
import {PhoneFrame} from '../../Components/AppScreens/PhoneFrame';

const resolveSource = (src: string): string => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

/** A skeleton stand-in for a web page. Shown only until a screenshot is supplied; phones show the drawn app screens instead. */
const PlaceholderScreen: React.FC = () => {
	const {colors} = useTheme();
	const bar = (width: string, tone = withAlpha(colors.onSurface, 0.14), height = '2.4%') => (
		<div style={{width, height, minHeight: 6, borderRadius: 999, backgroundColor: tone}} />
	);

	return (
			<div style={{width: '100%', height: '100%', display: 'flex', backgroundColor: colors.surface}}>
				<div style={{width: '19%', backgroundColor: colors.surfaceAlt, padding: '2.5%', display: 'flex', flexDirection: 'column', gap: '4%'}}>
					{bar('70%', colors.primary, '3%')}
					{bar('90%')}
					{bar('75%')}
					{bar('85%')}
					{bar('60%')}
				</div>
				<div style={{flex: 1, padding: '3%', display: 'flex', flexDirection: 'column', gap: '4%'}}>
					{bar('38%', withAlpha(colors.onSurface, 0.3), '4%')}
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3%', height: '24%'}}>
						{[colors.primary, colors.accent, colors.success].map((fill) => (
							<div key={fill} style={{borderRadius: 14, backgroundColor: withAlpha(fill, 0.16), border: `2px solid ${withAlpha(fill, 0.5)}`}} />
						))}
					</div>
					<div style={{flex: 1, borderRadius: 14, backgroundColor: colors.surfaceAlt, display: 'flex', alignItems: 'flex-end', gap: '3%', padding: '3%'}}>
						{[38, 62, 48, 80, 66, 92, 74].map((height, index) => (
							<div key={index} style={{flex: 1, height: `${height}%`, borderRadius: 8, backgroundColor: index === 5 ? colors.primary : withAlpha(colors.primary, 0.35)}} />
						))}
					</div>
				</div>
			</div>
	);
};

type PhoneMockupProps = {
	/** A real app screenshot. It is shown exactly as supplied and takes precedence over `screen`. */
	screenshot?: Image;
	/** Which drawn app screen to show when there is no screenshot. Defaults to the app's home. */
	screen?: AppScreenName;
	/** The app theme the drawn screen uses. */
	mode?: AppMode;
	/** Device width in reference pixels. */
	width: number;
	/** Degrees of rotation, for layered compositions. */
	tilt?: number;
	style?: React.CSSProperties;
};

/** A phone showing an app screen: the project's shared phone, sized for images. */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({screenshot, screen = 'Home', mode = 'light', width, tilt = 0, style}) => {
	const {u} = useImageLayout();
	const Screen = APP_SCREENS[screen].Component;
	return (
		<PhoneFrame width={u(width)} mode={mode} style={{transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style}}>
			{screenshot ? <Img src={resolveSource(screenshot.src)} alt={screenshot.alt ?? ''} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} /> : <Screen />}
		</PhoneFrame>
	);
};

type BrowserMockupProps = {
	/** A real web screenshot. It is shown exactly as supplied. */
	screenshot?: Image;
	url?: string;
	/** Window width and height in reference pixels. Leave both out to fill the parent. */
	width?: number;
	height?: number;
	style?: React.CSSProperties;
};

/** A browser window showing a web page. */
export const BrowserMockup: React.FC<BrowserMockupProps> = ({screenshot, url, width, height, style}) => {
	const {colors, typography} = useTheme();
	const {u} = useImageLayout();
	const bar = u(Math.max(40, (width ?? 900) * 0.055));
	return (
		<div
			style={{
				boxSizing: 'border-box',
				width: width === undefined ? '100%' : u(width),
				height: height === undefined ? '100%' : u(height),
				borderRadius: u(22),
				overflow: 'hidden',
				backgroundColor: colors.surface,
				border: `${u(2)}px solid ${withAlpha(colors.onSurface, 0.16)}`,
				boxShadow: `0 ${u(36)}px ${u(90)}px rgba(0, 0, 0, 0.28)`,
				display: 'flex',
				flexDirection: 'column',
				flexShrink: 0,
				...style,
			}}
		>
			<div style={{height: bar, flexShrink: 0, display: 'flex', alignItems: 'center', gap: bar * 0.2, padding: `0 ${bar * 0.4}px`, backgroundColor: colors.surfaceAlt}}>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((fill) => (
					<div key={fill} style={{width: bar * 0.26, height: bar * 0.26, borderRadius: '50%', backgroundColor: fill}} />
				))}
				<div
					style={{
						flex: 1,
						marginLeft: bar * 0.3,
						height: bar * 0.56,
						borderRadius: 999,
						backgroundColor: colors.surface,
						color: colors.onSurfaceMuted,
						fontFamily: typography.body,
						fontSize: bar * 0.3,
						display: 'flex',
						alignItems: 'center',
						padding: `0 ${bar * 0.35}px`,
						whiteSpace: 'nowrap',
						overflow: 'hidden',
					}}
				>
					{url}
				</div>
			</div>
			<div style={{flex: 1, minHeight: 0}}>
				{screenshot ? (
					<Img src={resolveSource(screenshot.src)} alt={screenshot.alt ?? ''} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
				) : (
					<PlaceholderScreen />
				)}
			</div>
		</div>
	);
};
