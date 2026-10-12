import React from 'react';
import {BRAND} from '../../Configurations/Brand';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

type BrandMarkProps = {
	/** Height in reference pixels. Never drawn smaller than the brand's minimum. */
	height?: number;
	showName?: boolean;
};

/**
 * The Sınavika logo lock-up. Enforces the usage rules from Configurations/Brand:
 * minimum size and clear space. Swap the monogram for the real logo asset here
 * and every template picks it up.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({height = 48, showName = true}) => {
	const {colors, typography} = useTheme();
	const ink = useInk();
	const {u} = useVideoLayout();
	const size = u(Math.max(height, BRAND.logo.minHeight));

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: size * 0.28,
				margin: size * BRAND.logo.clearSpaceRatio * 0.25,
				flexShrink: 0,
			}}
		>
			<div
				style={{
					width: size,
					height: size,
					borderRadius: size * 0.28,
					backgroundColor: colors.primary,
					color: colors.onPrimary,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: typography.display,
					fontWeight: 800,
					fontSize: size * 0.62,
					lineHeight: 1,
				}}
			>
				{BRAND.monogram}
			</div>
			{showName ? (
				<div
					style={{
						fontFamily: typography.display,
						fontWeight: 800,
						fontSize: size * 0.6 * typography.displayScale,
						letterSpacing: typography.displayLetterSpacing,
						lineHeight: 1,
						color: ink.text,
						whiteSpace: 'nowrap',
					}}
				>
					{BRAND.name}
				</div>
			) : null}
		</div>
	);
};
