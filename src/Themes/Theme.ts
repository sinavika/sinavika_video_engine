import type {AnimationSpec} from '../Animations/AnimationSpec';

export type CategoricalColor = {fill: string; on: string};

/** All colours are 6-digit hex so they can be tinted with `withAlpha`. */
type ThemeColors = {
	/** Canvas colour and the text drawn directly on it. */
	background: string;
	text: string;
	textMuted: string;
	canvasAccent: string;
	/** Cards and the text drawn on them. */
	surface: string;
	surfaceAlt: string;
	onSurface: string;
	onSurfaceMuted: string;
	border: string;
	/** Filled emphasis blocks. `primaryText` is the readable-on-surface variant. */
	primary: string;
	onPrimary: string;
	primaryText: string;
	accent: string;
	onAccent: string;
	success: string;
	danger: string;
	warning: string;
	onStatus: string;
	highlight: string;
	categorical: CategoricalColor[];
	/** The colour of the lesson being shown, when it has one. Subject labels use it instead of their usual tone. */
	lesson?: CategoricalColor;
};

type ThemeBackground =
	| {kind: 'solid'}
	| {kind: 'gradient'; stops: string[]; angle: number}
	| {kind: 'glow'; colors: string[]}
	| {kind: 'grid'; lineColor: string; size: number}
	| {kind: 'dots'; dotColor: string; size: number};

export type ThemeTypography = {
	display: string;
	body: string;
	mono: string;
	displayWeight: number;
	bodyWeight: number;
	strongWeight: number;
	/** Optical correction for display faces that run small or large. */
	displayScale: number;
	displayLetterSpacing: string;
	labelTransform: 'uppercase' | 'none';
};

type ThemeShape = {
	radius: {sm: number; md: number; lg: number};
	borderWidth: number;
	elevation: 'none' | 'soft' | 'hard' | 'glow';
};

type ThemeMotion = {
	/** Multiplier on animation speed. Scene durations are not affected. */
	speed: number;
	/** Default entrance used by `Animated` when no animation is given. */
	enter: AnimationSpec;
};

export type Theme = {
	name: string;
	description: string;
	colors: ThemeColors;
	typography: ThemeTypography;
	shape: ThemeShape;
	background: ThemeBackground;
	motion: ThemeMotion;
	/** Stops for gradient fills. Themes without one fall back to primary and accent. */
	gradient?: readonly string[];
};

export const withAlpha = (hex: string, alpha: number): string => {
	const value = hex.replace('#', '');
	const r = parseInt(value.slice(0, 2), 16);
	const g = parseInt(value.slice(2, 4), 16);
	const b = parseInt(value.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
