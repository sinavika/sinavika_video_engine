import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../Components/Overlays/BrandMark';
import {Text} from '../../Components/Typography/Text';
import {readableOn} from '../../Themes/ColorPalette';
import {withAlpha} from '../../Themes/Theme';
import {InkProvider, useTheme, type Ink} from '../../Themes/ThemeContext';
import type {Branding} from '../Schemas/ImageFields';
import {gridInsets} from '../Templates/ProfileGrids/ProfileGridLayout';

/** How the canvas of an image is painted. All of it comes from the active theme or palette. */
export type ImageBackdrop = 'canvas' | 'spotlight' | 'gradient' | 'primary' | 'surface';

/**
 * Size-aware helpers for image layouts. Images share `u()` with video: 1080px
 * short edge = 1. `insets` keeps content inside what the Instagram profile
 * grid shows of the image (see gridInsets); `padding` is the plain margin.
 */
export const useImageLayout = () => {
	const {width, height} = useVideoConfig();
	const {u, unit} = useVideoLayout();
	const ratio = width / height;
	return {width, height, u, wide: ratio > 1.25, tall: ratio < 0.65, padding: u(72), insets: gridInsets(width, height, unit, 72)};
};

const solidInk = (color: string): Ink => ({text: color, muted: withAlpha(color, 0.78), emphasis: color});

type ImageFrameProps = {
	backdrop?: ImageBackdrop;
	branding?: Branding;
	/** Replaces the default padding, in reference pixels. */
	padding?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/**
 * Root of every image design: paints the backdrop, sets readable ink for it,
 * keeps content inside the margins and signs the image with the logo.
 */
export const ImageFrame: React.FC<ImageFrameProps> = ({backdrop = 'canvas', branding, padding, style, children}) => {
	const theme = useTheme();
	const {colors} = theme;
	const {u, insets} = useImageLayout();
	const gradient = theme.gradient ?? [colors.primary, colors.accent];
	const dot = `radial-gradient(${withAlpha(colors.text, 0.09)} ${u(2.5)}px, transparent ${u(3)}px)`;

	const backdrops: Record<ImageBackdrop, {style: React.CSSProperties; ink: Ink | null}> = {
		canvas: {
			ink: null,
			style: {
				backgroundColor: colors.background,
				backgroundImage: `radial-gradient(circle at 88% -5%, ${withAlpha(colors.primary, 0.2)} 0%, transparent 46%), radial-gradient(circle at -5% 105%, ${withAlpha(colors.accent, 0.18)} 0%, transparent 42%)`,
			},
		},
		spotlight: {
			ink: null,
			style: {
				backgroundColor: colors.background,
				backgroundImage: `radial-gradient(circle at 72% 38%, ${withAlpha(colors.primary, 0.3)} 0%, transparent 52%), ${dot}`,
				backgroundSize: `100% 100%, ${u(38)}px ${u(38)}px`,
			},
		},
		gradient: {
			ink: solidInk(readableOn(gradient[0])),
			style: {
				backgroundImage: `radial-gradient(circle at 90% 0%, ${withAlpha('#FFFFFF', 0.16)} 0%, transparent 40%), linear-gradient(150deg, ${gradient.join(', ')})`,
			},
		},
		primary: {
			ink: solidInk(colors.onPrimary),
			style: {
				backgroundColor: colors.primary,
				backgroundImage: `linear-gradient(125deg, transparent 55%, ${withAlpha(colors.onPrimary, 0.08)} 55%, ${withAlpha(colors.onPrimary, 0.08)} 78%, transparent 78%)`,
			},
		},
		surface: {
			ink: {text: colors.onSurface, muted: colors.onSurfaceMuted, emphasis: colors.primaryText},
			style: {backgroundColor: colors.surface},
		},
	};
	const {style: backdropStyle, ink} = backdrops[backdrop];
	// By default the content stays inside what the profile grid shows of the image.
	const inset = padding === undefined ? `${insets.top}px ${insets.right}px ${insets.bottom}px ${insets.left}px` : u(padding);

	const content = (
		<AbsoluteFill style={{...backdropStyle, boxSizing: 'border-box', padding: inset, gap: u(36), ...style}}>
			<div style={{flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column'}}>{children}</div>
			{branding?.logo ? (
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: u(24), flexShrink: 0}}>
					<BrandMark />
					{branding.handle ? (
						<Text size={28} tone="muted" weight={600} style={{whiteSpace: 'nowrap'}}>
							{branding.handle}
						</Text>
					) : null}
				</div>
			) : null}
		</AbsoluteFill>
	);

	return ink ? <InkProvider ink={ink}>{content}</InkProvider> : content;
};
