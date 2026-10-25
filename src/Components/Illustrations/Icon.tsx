import React from 'react';
import {useVideoLayout} from '../Layouts/VideoLayout';

const CIRCLE = 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z';

/** Stroke icons on a 24x24 grid. */
export const ICON_PATHS = {
	check: ['M5 12.5l4.5 4.5L19 7.5'],
	cross: ['M6 6l12 12', 'M18 6L6 18'],
	clock: [CIRCLE, 'M12 7v5l3.5 2'],
	lightbulb: [
		'M9 18h6',
		'M10 21h4',
		'M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2.2h5c.1-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z',
	],
	target: [CIRCLE, 'M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10z', 'M12 11.5v1'],
	alert: ['M12 4l9 16H3l9-16z', 'M12 10v4', 'M12 17.2v.1'],
	book: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z', 'M5 17a3 3 0 0 1 3-3h11'],
	bolt: ['M13 2L4 14h7l-1 8 9-12h-7l1-8z'],
	star: ['M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8L12 3z'],
	arrowRight: ['M4 12h15', 'M13 6l6 6-6 6'],
	flag: ['M5 21V4', 'M5 4h12l-2.5 4 2.5 4H5'],
	quote: ['M9 7H5v6h4v-1c0 2-1 3-3 3', 'M19 7h-4v6h4v-1c0 2-1 3-3 3'],
	question: ['M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4', 'M12 17.5v.1'],
	pencil: ['M4 20l1-4L16 5l3 3L8 19l-4 1z'],
	/** SinoAI's mark, as in the app. */
	sparkles: ['M11 4l1.8 4.7L17.5 10.5l-4.7 1.8L11 17l-1.8-4.7L4.5 10.5l4.7-1.8L11 4z', 'M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z'],
} as const;

export type IconName = keyof typeof ICON_PATHS;

type IconProps = {
	name: IconName;
	/** Size in reference pixels. */
	size?: number;
	color?: string;
	strokeWidth?: number;
	style?: React.CSSProperties;
};

export const Icon: React.FC<IconProps> = ({name, size = 40, color = 'currentColor', strokeWidth = 2.2, style}) => {
	const {u} = useVideoLayout();
	return (
		<svg
			width={u(size)}
			height={u(size)}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{flexShrink: 0, ...style}}
		>
			{ICON_PATHS[name].map((d) => (
				<path key={d} d={d} />
			))}
		</svg>
	);
};
