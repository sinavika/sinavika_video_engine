import {BRAND_THEME_TYPOGRAPHY} from '../Configurations/BrandTypography';
import type {Theme} from './Theme';

export const VibrantDynamic: Theme = {
	name: 'Renkli ve Dinamik',
	description: 'Canlı gradyan zemin, yuvarlak hatlar, sert gölgeler ve enerjik hareket.',
	colors: {
		background: '#5B21B6',
		text: '#FFFFFF',
		textMuted: '#E9D5FF',
		canvasAccent: '#FDE047',
		surface: '#FFFFFF',
		surfaceAlt: '#FEF3C7',
		onSurface: '#1E1B4B',
		onSurfaceMuted: '#4C4680',
		border: '#1E1B4B',
		primary: '#FACC15',
		onPrimary: '#1E1B4B',
		primaryText: '#7C3AED',
		accent: '#FB7185',
		onAccent: '#3B0714',
		success: '#16A34A',
		danger: '#EF4444',
		warning: '#F97316',
		onStatus: '#FFFFFF',
		highlight: '#FDE047',
		categorical: [
			{fill: '#FACC15', on: '#1E1B4B'},
			{fill: '#FB7185', on: '#3B0714'},
			{fill: '#34D399', on: '#052E1B'},
			{fill: '#38BDF8', on: '#062A40'},
			{fill: '#FFFFFF', on: '#1E1B4B'},
		],
	},
	typography: BRAND_THEME_TYPOGRAPHY,
	shape: {radius: {sm: 18, md: 30, lg: 44}, borderWidth: 4, elevation: 'hard'},
	background: {kind: 'gradient', stops: ['#4C1D95', '#7C3AED', '#DB2777'], angle: 150},
	motion: {speed: 1.25, enter: {preset: 'scale', easing: 'overshoot'}},
};
