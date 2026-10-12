import React from 'react';
import {useTheme} from '../../Themes/ThemeContext';
import {Animated} from '../Animations/Animated';
import {DrawPath} from '../Animations/DrawPath';
import {Card} from '../Layouts/Card';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';

type ConceptMapProps = {
	center: string;
	related: {name: string; relation?: string}[];
	/** Box the map is drawn in, in actual pixels. */
	width: number;
	height: number;
	delaySeconds?: number;
};

const NODE_INTERVAL_SECONDS = 0.3;

/** Zero-size box that centres its child on a point, without using a transform. */
const ANCHOR: React.CSSProperties = {
	position: 'absolute',
	width: 0,
	height: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

/** A hub concept with its related concepts around it, each joined by a drawn line. */
export const ConceptMap: React.FC<ConceptMapProps> = ({center, related, width, height, delaySeconds = 0}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const count = related.length;
	const step = 360 / count;
	// Even counts are rotated half a step so nodes sit left/right or in the corners, not above the hub.
	const start = count % 2 === 0 ? -90 + step / 2 : -90;
	const nodeWidth = Math.min(width * 0.34, u(340));
	const radiusX = (width - nodeWidth) / 2;
	const radiusY = height * 0.37;
	const positions = related.map((_, index) => {
		const angle = ((start + index * step) * Math.PI) / 180;
		return [width / 2 + radiusX * Math.cos(angle), height / 2 + radiusY * Math.sin(angle)] as const;
	});

	return (
		<div style={{position: 'relative', width, height, flexShrink: 0}}>
			<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0}}>
				{positions.map(([x, y], index) => (
					<DrawPath
						key={index}
						d={`M${width / 2} ${height / 2}L${x.toFixed(2)} ${y.toFixed(2)}`}
						stroke={colors.categorical[index % colors.categorical.length].fill}
						strokeWidth={u(5)}
						delaySeconds={delaySeconds + 0.3 + index * NODE_INTERVAL_SECONDS}
						durationSeconds={0.4}
					/>
				))}
			</svg>
			<div style={{...ANCHOR, left: width / 2, top: height / 2}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={delaySeconds} style={{flexShrink: 0}}>
					<Card tone="primary" padding={36} radius="lg" style={{maxWidth: width * 0.4}}>
						<Text variant="subtitle" align="center" size={42}>
							{center}
						</Text>
					</Card>
				</Animated>
			</div>
			{related.map((item, index) => (
				<div key={index} style={{...ANCHOR, left: positions[index][0], top: positions[index][1]}}>
					<Animated
						animation={{preset: 'scale', easing: 'overshoot'}}
						delaySeconds={delaySeconds + 0.55 + index * NODE_INTERVAL_SECONDS}
						style={{width: nodeWidth, flexShrink: 0}}
					>
						<Card padding={24} radius="md">
							<Text variant="subtitle" align="center" size={32}>
								{item.name}
							</Text>
							{item.relation ? (
								<Text tone="muted" align="center" size={24} style={{marginTop: u(6)}}>
									{item.relation}
								</Text>
							) : null}
						</Card>
					</Animated>
				</div>
			))}
		</div>
	);
};
