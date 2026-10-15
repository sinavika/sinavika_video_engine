import {BRAND_THEME_TYPOGRAPHY} from '../Configurations/BrandTypography';
import type {Theme} from './Theme';

export const TechDark: Theme = {
	name: 'Koyu Teknoloji',
	description: 'Koyu lacivert zemin, ızgara dokusu, neon turkuaz ve mor vurgular.',
	colors: {
		background: '#0A0F1F',
		text: '#E9EDFF',
		textMuted: '#95A1CF',
		canvasAccent: '#5EEAD4',
		surface: '#131A31',
		surfaceAlt: '#1B2444',
		onSurface: '#E9EDFF',
		onSurfaceMuted: '#95A1CF',
		border: '#2A3663',
		primary: '#5EEAD4',
		onPrimary: '#042F2A',
		primaryText: '#5EEAD4',
		accent: '#A78BFA',
		onAccent: '#1A0F3D',
		success: '#4ADE80',
		danger: '#FB7185',
		warning: '#FBBF24',
		onStatus: '#0A0F1F',
		highlight: '#2DD4BF',
		categorical: [
			{fill: '#5EEAD4', on: '#042F2A'},
			{fill: '#A78BFA', on: '#1A0F3D'},
			{fill: '#60A5FA', on: '#06203F'},
			{fill: '#F472B6', on: '#3D0A24'},
			{fill: '#FBBF24', on: '#3A2600'},
		],
	},
	typography: BRAND_THEME_TYPOGRAPHY,
	shape: {radius: {sm: 10, md: 16, lg: 22}, borderWidth: 1.5, elevation: 'glow'},
	background: {kind: 'grid', lineColor: '#182040', size: 72},
	motion: {speed: 1.1, enter: {preset: 'slide', direction: 'up'}},
};
