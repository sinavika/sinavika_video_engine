import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND, type BrandLogoSize} from '../../Configurations/Brand';
import {useInk} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

type BrandMarkProps = {
	/** Where the logo sits. Sizes are defined once, in Configurations/Brand. */
	size?: BrandLogoSize;
	/** CSS colour. Defaults to the text colour of the backdrop, so the logo is readable on any theme. */
	color?: string;
};

/**
 * The Sınavika logo. Every video draws its logo through this component, so
 * the asset, its sizes and its usage rules (minimum size, clear space) are
 * changed in one place: Configurations/Brand.
 *
 * The logo file is white with transparency. It is used as a mask and filled
 * with `color`, which is how the same file appears dark on light themes and
 * light on dark ones.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({size = 'chrome', color}) => {
	const ink = useInk();
	const {u} = useVideoLayout();
	const {logo} = BRAND;
	const height = u(Math.max(logo.sizes[size], logo.minHeight));
	const source = staticFile(logo.src);
	const mask = `url("${source}")`;

	return (
		<div
			role="img"
			aria-label={BRAND.name}
			style={{
				position: 'relative',
				height,
				width: height * logo.aspectRatio,
				margin: height * logo.clearSpaceRatio,
				flexShrink: 0,
			}}
		>
			{/* Invisible, but makes Remotion wait until the logo file is loaded before a frame is captured. */}
			<Img src={source} alt="" style={{position: 'absolute', width: '100%', height: '100%', opacity: 0}} />
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: color ?? ink.text,
					maskImage: mask,
					WebkitMaskImage: mask,
					maskSize: '100% 100%',
					WebkitMaskSize: '100% 100%',
					maskRepeat: 'no-repeat',
					WebkitMaskRepeat: 'no-repeat',
				}}
			/>
		</div>
	);
};
