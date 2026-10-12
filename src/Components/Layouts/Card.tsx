import React from 'react';
import {SPACING} from '../../Themes/DesignTokens';
import {withAlpha, type CategoricalColor, type Theme} from '../../Themes/Theme';
import {InkProvider, useTheme, type Ink} from '../../Themes/ThemeContext';
import {useVideoLayout} from './VideoLayout';

export type Tone = 'surface' | 'alt' | 'primary' | 'accent' | CategoricalColor;

export const resolveTone = (theme: Theme, tone: Tone): {fill: string; ink: Ink; outlined: boolean} => {
	const {colors} = theme;
	const filled = (fill: string, on: string) => ({
		fill,
		ink: {text: on, muted: withAlpha(on, 0.76), emphasis: on},
		outlined: theme.shape.borderWidth >= 3,
	});
	if (typeof tone === 'object') return filled(tone.fill, tone.on);
	switch (tone) {
		case 'primary':
			return filled(colors.primary, colors.onPrimary);
		case 'accent':
			return filled(colors.accent, colors.onAccent);
		case 'surface':
		case 'alt':
			return {
				fill: tone === 'surface' ? colors.surface : colors.surfaceAlt,
				ink: {text: colors.onSurface, muted: colors.onSurfaceMuted, emphasis: colors.primaryText},
				outlined: true,
			};
	}
};

type CardProps = {
	tone?: Tone;
	/** Inner padding in reference pixels. */
	padding?: number;
	radius?: 'sm' | 'md' | 'lg';
	elevated?: boolean;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** A themed panel. Shape, border and shadow come from the theme; text inside picks up matching ink. */
export const Card: React.FC<CardProps> = ({
	tone = 'surface',
	padding = SPACING.xl,
	radius = 'md',
	elevated = true,
	style,
	children,
}) => {
	const theme = useTheme();
	const {u} = useVideoLayout();
	const {colors, shape} = theme;
	const {fill, ink, outlined} = resolveTone(theme, tone);

	const shadows = {
		none: 'none',
		soft: `0 ${u(14)}px ${u(44)}px ${withAlpha(colors.onSurface, 0.1)}`,
		hard: `${u(9)}px ${u(9)}px 0 ${colors.border}`,
		glow: `0 0 ${u(52)}px ${withAlpha(colors.primary, 0.13)}`,
	};

	return (
		<InkProvider ink={ink}>
			<div
				style={{
					boxSizing: 'border-box',
					backgroundColor: fill,
					color: ink.text,
					padding: u(padding),
					borderRadius: u(shape.radius[radius]),
					border: `${u(shape.borderWidth)}px solid ${outlined ? colors.border : 'transparent'}`,
					boxShadow: elevated ? shadows[shape.elevation] : 'none',
					...style,
				}}
			>
				{children}
			</div>
		</InkProvider>
	);
};
