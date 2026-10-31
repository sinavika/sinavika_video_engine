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
	/**
	 * Course lessons: the lesson colour for the hub and the lines (instead of the brand colour and a different
	 * colour per line), and each related concept's state from the card's beats (n1, n2, …): it appears when a
	 * beat shows it and stands out when a beat points at it, the others dimming.
	 */
	accent?: {fill: string; on: string};
	states?: {appear: number; emphasis: number; dim: number}[];
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
export const ConceptMap: React.FC<ConceptMapProps> = ({center, related, width, height, delaySeconds = 0, accent, states = []}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const count = related.length;
	const step = 360 / count;
	// Even counts are rotated half a step so nodes sit left/right or in the corners, not above the hub.
	const start = count % 2 === 0 ? -90 + step / 2 : -90;
	const nodeWidth = Math.min(width * 0.34, u(340));
	// Room for a focused node to grow without reaching the edge of the box.
	const radiusX = (width - nodeWidth * (states.length > 0 ? 1.14 : 1)) / 2;
	const radiusY = height * 0.37;
	const positions = related.map((_, index) => {
		const angle = ((start + index * step) * Math.PI) / 180;
		return [width / 2 + radiusX * Math.cos(angle), height / 2 + radiusY * Math.sin(angle)] as const;
	});

	return (
		<div style={{position: 'relative', width, height, flexShrink: 0}}>
			<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0}}>
				{positions.map(([x, y], index) => {
					const state = states[index];
					return (
						<g key={index} opacity={state ? state.appear * (1 - 0.65 * state.dim) : 1}>
							<DrawPath
								d={`M${width / 2} ${height / 2}L${x.toFixed(2)} ${y.toFixed(2)}`}
								stroke={accent ? accent.fill : colors.categorical[index % colors.categorical.length].fill}
								strokeWidth={u(5) * (state ? 1 + state.emphasis * 0.6 : 1)}
								delaySeconds={delaySeconds + 0.3 + index * NODE_INTERVAL_SECONDS}
								durationSeconds={0.4}
							/>
						</g>
					);
				})}
			</svg>
			<div style={{...ANCHOR, left: width / 2, top: height / 2}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={delaySeconds} style={{flexShrink: 0}}>
					{accent ? (
						<div style={{maxWidth: width * 0.4, padding: u(32), borderRadius: u(32), backgroundColor: accent.fill, color: accent.on, textAlign: 'center'}}>
							<Text variant="subtitle" align="center" size={42} style={{color: accent.on}}>
								{center}
							</Text>
						</div>
					) : (
						<Card tone="primary" padding={36} radius="lg" style={{maxWidth: width * 0.4}}>
							<Text variant="subtitle" align="center" size={42}>
								{center}
							</Text>
						</Card>
					)}
				</Animated>
			</div>
			{related.map((item, index) => {
				const state = states[index];
				return (
				<div key={index} style={{...ANCHOR, left: positions[index][0], top: positions[index][1], opacity: state ? state.appear : 1}}>
					<Animated
						animation={{preset: 'scale', easing: 'overshoot'}}
						delaySeconds={delaySeconds + 0.55 + index * NODE_INTERVAL_SECONDS}
						style={{width: nodeWidth, flexShrink: 0, transform: state ? `scale(${1 + 0.1 * state.emphasis})` : undefined}}
					>
						{/* A dimmed node fades its words, not its card: an opaque card keeps the line behind it hidden. */}
						<Card padding={24} radius="md" style={{...(accent && state && state.emphasis > 0 ? {outline: `${u(4) * state.emphasis}px solid ${accent.fill}`} : {}), ...(state ? {opacity: 1} : {})}}>
							<div style={{opacity: state ? 1 - 0.65 * state.dim : 1}}>
							<Text variant="subtitle" align="center" size={32}>
								{item.name}
							</Text>
							{item.relation ? (
								<Text tone="muted" align="center" size={24} style={{marginTop: u(6)}}>
									{item.relation}
								</Text>
							) : null}
							</div>
						</Card>
					</Animated>
				</div>
				);
			})}
		</div>
	);
};
