import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Image} from '../../Schemas/Visual';
import {useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

const resolveSource = (src: string): string => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

type PictureProps = {
	image: Image;
	/** Box height in reference pixels. Fixed so the layout is known before the image loads. */
	height: number;
	style?: React.CSSProperties;
};

/** An image from a URL or from `public/`. Remotion waits for it to load before rendering a frame. */
export const Picture: React.FC<PictureProps> = ({image, height, style}) => {
	const {shape} = useTheme();
	const {u} = useVideoLayout();
	return (
		<Img
			src={resolveSource(image.src)}
			alt={image.alt ?? ''}
			style={{
				display: 'block',
				width: '100%',
				height: u(height),
				objectFit: 'contain',
				borderRadius: u(shape.radius.sm),
				...style,
			}}
		/>
	);
};
