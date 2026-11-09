import React from 'react';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';

/** YouTube's red: the player bar, the logo and the subscribe button say "this is YouTube". */
export const YOUTUBE_RED = '#FF0000';

/** The YouTube mark: a red rounded play button and the word, in `color` (white on dark grounds). */
export const YouTubeMark: React.FC<{size: number; color?: string}> = ({size, color = '#FFFFFF'}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: u(size * 0.22)}}>
			<div style={{width: u(size * 1.42), height: u(size), borderRadius: u(size * 0.28), background: YOUTUBE_RED, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 0, height: 0, borderTop: `${u(size * 0.22)}px solid transparent`, borderBottom: `${u(size * 0.22)}px solid transparent`, borderLeft: `${u(size * 0.36)}px solid #FFFFFF`, marginLeft: u(size * 0.06)}} />
			</div>
			<Text size={size * 0.92} weight={BRAND_TYPOGRAPHY.weights.kinetic} color={color} style={{letterSpacing: '-0.03em', lineHeight: 1}}>
				YouTube
			</Text>
		</div>
	);
};
