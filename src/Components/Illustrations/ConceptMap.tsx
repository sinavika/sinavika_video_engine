import React from 'react';
import {useTheme} from '../../Themes/ThemeContext';
import {Animated} from '../Animations/Animated';
import {DrawPath} from '../Animations/DrawPath';
import {Card} from '../Layouts/Card';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';
import {wrappedLines} from '../Typography/TextMeasure';

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
/**
 * Node centres for an even number of nodes: half in a right column, top to bottom, half in a left column, bottom to
 * top (clockwise, as the ring went), each node `nodeWidth` wide against its edge, spread evenly down the height.
 */
export const conceptColumns = (count: number, width: number, height: number, nodeWidth: number): (readonly [number, number])[] => {
	const perSide = count / 2;
	const rowY = (row: number) => (height * (row + 0.5)) / perSide;
	return Array.from({length: count}, (_, index) =>
		index < perSide ? ([width - nodeWidth / 2, rowY(index)] as const) : ([nodeWidth / 2, rowY(count - 1 - index)] as const),
	);
};

/** About how tall a node's card is: padding, its name's lines and its relation's. */
const conceptNodeHeight = (item: {name: string; relation?: string}, nodeWidth: number, u: (value: number) => number): number => {
	const lines = (text: string, size: number) => wrappedLines(text, nodeWidth - u(48), {size: u(size), weight: 700});
	return u(48) + lines(item.name, 32) * u(32) * 1.25 + (item.relation ? u(6) + lines(item.relation, 24) * u(24) * 1.3 : 0);
};

export const ConceptMap: React.FC<ConceptMapProps> = ({center, related, width, height, delaySeconds = 0, accent, states = []}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const count = related.length;
	// The hub's longest word should fit at 34 or more; the nodes give up width for it, down to a quarter each.
	const longestWord = Math.max(...center.split(/\s+/).map((word) => word.length));
	const growth = states.length > 0 ? 1.14 : 1;
	const nodeWidth = Math.max(width * 0.24, Math.min(width * 0.31, u(340), (width - u(72) - (longestWord * 0.62 * u(34) + u(72))) / (2 * growth)));
	// Room for a focused node to grow without reaching the edge of the box.
	const grown = nodeWidth * growth;
	// Nodes stand in a right and a left column and the hub keeps to the free middle, so a hub or a node that wraps onto
	// more lines never covers the other; an odd first node stands on top, over the hub. On a ring, four nodes in the
	// corners covered "Tüm dokular hücreseldir" in the hub, and five covered "Anlam olayları" (Soru revizyonu, 1 Nov 2026).
	const odd = count % 2 === 1;
	const top = odd ? Math.min(height * 0.34, conceptNodeHeight(related[0], nodeWidth, u) + u(24)) : 0;
	const positions: (readonly [number, number])[] = [
		...(odd ? [[width / 2, top / 2] as const] : []),
		...conceptColumns(odd ? count - 1 : count, width, height - top, grown).map(([x, y]) => [x, y + top] as const),
	];
	const hub = [width / 2, top + (height - top) / 2] as const;
	const hubWidth = Math.max(width * 0.22, width - 2 * grown - u(72));
	// The hub's words never break inside: its type shrinks until the longest word fits the hub ("Anla m olayla rı").
	const hubSize = Math.max(24, Math.min(42, (hubWidth - u(72)) / u(1) / (longestWord * 0.62)));

	return (
		<div style={{position: 'relative', width, height, flexShrink: 0}}>
			<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0}}>
				{positions.map(([x, y], index) => {
					const state = states[index];
					return (
						<g key={index} opacity={state ? state.appear * (1 - 0.65 * state.dim) : 1}>
							<DrawPath
								d={`M${hub[0]} ${hub[1]}L${x.toFixed(2)} ${y.toFixed(2)}`}
								stroke={accent ? accent.fill : colors.categorical[index % colors.categorical.length].fill}
								strokeWidth={u(5) * (state ? 1 + state.emphasis * 0.6 : 1)}
								delaySeconds={delaySeconds + 0.3 + index * NODE_INTERVAL_SECONDS}
								durationSeconds={0.4}
							/>
						</g>
					);
				})}
			</svg>
			<div style={{...ANCHOR, left: hub[0], top: hub[1]}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={delaySeconds} style={{flexShrink: 0}}>
					{accent ? (
						<div style={{maxWidth: hubWidth, padding: u(32), borderRadius: u(32), backgroundColor: accent.fill, color: accent.on, textAlign: 'center'}}>
							<Text variant="subtitle" align="center" size={hubSize} style={{color: accent.on}}>
								{center}
							</Text>
						</div>
					) : (
						<Card tone="primary" padding={36} radius="lg" style={{maxWidth: hubWidth}}>
							<Text variant="subtitle" align="center" size={hubSize}>
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
