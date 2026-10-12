import {useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {resolveVideoLayout, type VideoLayout} from '../../Configurations/VideoFormats';

export type ScaledVideoLayout = VideoLayout & {
	/** Converts reference pixels (1080px short edge) to actual pixels. */
	u: (referencePixels: number) => number;
	isPortrait: boolean;
	isLandscape: boolean;
	isSquare: boolean;
};

export const useVideoLayout = (): ScaledVideoLayout => {
	const {width, height} = useVideoConfig();
	return useMemo(() => {
		const layout = resolveVideoLayout(width, height);
		return {
			...layout,
			u: (referencePixels: number) => referencePixels * layout.unit,
			isPortrait: layout.orientation === 'portrait',
			isLandscape: layout.orientation === 'landscape',
			isSquare: layout.orientation === 'square',
		};
	}, [width, height]);
};
