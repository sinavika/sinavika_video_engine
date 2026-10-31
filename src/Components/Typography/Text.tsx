import React from 'react';
import {FONT_SIZES, LINE_HEIGHTS, type FontSizeName} from '../../Themes/DesignTokens';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

type TextTone = 'default' | 'muted' | 'emphasis';

export type TextProps = {
	variant?: FontSizeName;
	tone?: TextTone;
	/** Explicit CSS colour. Overrides `tone`. */
	color?: string;
	/** Font size in reference pixels. Overrides the variant's size. */
	size?: number;
	weight?: number;
	align?: 'left' | 'center' | 'right';
	style?: React.CSSProperties;
	children: React.ReactNode;
};

const DISPLAY_VARIANTS: ReadonlySet<FontSizeName> = new Set(['display', 'headline', 'title', 'subtitle']);

const VARIANT_LINE_HEIGHT: Record<FontSizeName, number> = {
	display: LINE_HEIGHTS.tight,
	headline: LINE_HEIGHTS.tight,
	title: LINE_HEIGHTS.snug,
	subtitle: LINE_HEIGHTS.snug,
	bodyLarge: LINE_HEIGHTS.normal,
	body: LINE_HEIGHTS.normal,
	caption: LINE_HEIGHTS.normal,
	label: LINE_HEIGHTS.snug,
};

/** The only place font family, size, weight and colour are decided. */
export const Text: React.FC<TextProps> = ({
	variant = 'body',
	tone = 'default',
	color,
	size,
	weight,
	align = 'left',
	style,
	children,
}) => {
	const {typography} = useTheme();
	const ink = useInk();
	const {u} = useVideoLayout();
	const isDisplay = DISPLAY_VARIANTS.has(variant);
	const isLabel = variant === 'label';
	const baseSize = size ?? FONT_SIZES[variant];
	const inkColor = tone === 'muted' ? ink.muted : tone === 'emphasis' ? ink.emphasis : ink.text;

	return (
		<div
			style={{
				margin: 0,
				fontFamily: isDisplay ? typography.display : typography.body,
				fontSize: u(baseSize * (isDisplay ? typography.displayScale : 1)),
				fontWeight:
					weight ??
					(isDisplay
						? typography.displayWeight
						: isLabel
							? typography.strongWeight
							: typography.bodyWeight),
				lineHeight: VARIANT_LINE_HEIGHT[variant],
				letterSpacing: isDisplay ? typography.displayLetterSpacing : isLabel ? '0.07em' : 'normal',
				textTransform: isLabel ? typography.labelTransform : 'none',
				textAlign: align,
				textWrap: isDisplay ? 'balance' : 'pretty',
				overflowWrap: 'break-word',
				whiteSpace: 'pre-wrap',
				color: color ?? inkColor,
				...style,
			}}
		>
			{children}
		</div>
	);
};
