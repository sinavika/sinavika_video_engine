import React, {useLayoutEffect, useRef} from 'react';
import type {Orientation} from '../../Configurations/VideoFormats';
import {useVideoLayout} from './VideoLayout';

type FitBoxProps = {
	align?: 'start' | 'center' | 'end';
	/** Smallest allowed scale. Below this the content is considered too long for the video. */
	minScale?: number;
	/** Let short content grow to use spare room, most of all on vertical video. */
	fill?: boolean;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

const ALIGNMENT = {start: 'flex-start', center: 'center', end: 'flex-end'} as const;
const SEARCH_STEPS = 7;
/** How far `fill` may enlarge content, per orientation. */
const FILL_SCALE: Record<Orientation, number> = {portrait: 1.32, square: 1.1, landscape: 1.12};
/** Enlarged content stops short of the edges so it keeps some air. */
const FILL_HEIGHT_SHARE = 0.94;

const MEASURING_ATTRIBUTE = 'data-fit-measuring';
const MEASURING_STYLE_ID = 'fit-box-measuring';

/**
 * While measuring, every transform inside the box is switched off. Transforms
 * here are animation (slide, scale, overshoot); an element caught mid-flight
 * would otherwise count as overflow, and the fit would depend on which frame
 * happened to mount the box.
 */
const ensureMeasuringStyle = (): void => {
	if (document.getElementById(MEASURING_STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = MEASURING_STYLE_ID;
	style.textContent = `[${MEASURING_ATTRIBUTE}] * { transform: none !important; }`;
	document.head.appendChild(style);
};

/**
 * Overflow guard. Lays its children out at full size and, only if they do not
 * fit, scales them down (text reflows, nothing is cropped) until they do.
 * With `fill`, content that is shorter than the box is scaled up instead.
 *
 * The result depends on content and box size alone, never on the frame, so
 * every frame of a render agrees on it. For that to hold, children must not
 * change their layout over time: animate with opacity/transform/clip-path
 * (as `Animated` does) instead of mounting and unmounting elements, and do
 * not position elements with transforms (they are ignored while measuring).
 */
export const FitBox: React.FC<FitBoxProps> = ({align = 'center', minScale = 0.5, fill = false, style, children}) => {
	const {orientation} = useVideoLayout();
	const maxScale = fill ? FILL_SCALE[orientation] : 1;
	const outerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const fitted = useRef('');

	useLayoutEffect(() => {
		const outer = outerRef.current;
		const inner = innerRef.current;
		if (!outer || !inner) return;

		const signature = `${outer.clientWidth}x${outer.clientHeight}:${maxScale}:${inner.textContent ?? ''}`;
		if (signature === fitted.current) return;
		fitted.current = signature;

		const fitsAt = (scale: number): boolean => {
			inner.style.zoom = String(scale);
			const available = outer.getBoundingClientRect();
			const used = inner.getBoundingClientRect();
			const limit = available.height * (scale > 1 ? FILL_HEIGHT_SHARE : 1);
			return used.height <= limit + 0.5 && inner.scrollWidth <= inner.clientWidth + 1;
		};

		const fit = (): void => {
			if (fitsAt(maxScale)) return;
			if (!fitsAt(minScale)) {
				console.warn(
					`[FitBox] Content overflows even at ${minScale}x: "${(inner.textContent ?? '').slice(0, 80)}"`,
				);
				return;
			}
			let low = minScale;
			let high = maxScale;
			for (let step = 0; step < SEARCH_STEPS; step++) {
				const middle = (low + high) / 2;
				if (fitsAt(middle)) low = middle;
				else high = middle;
			}
			fitsAt(low);
		};

		ensureMeasuringStyle();
		inner.setAttribute(MEASURING_ATTRIBUTE, '');
		try {
			fit();
		} finally {
			inner.removeAttribute(MEASURING_ATTRIBUTE);
		}
	});

	return (
		<div
			ref={outerRef}
			style={{
				flex: 1,
				minHeight: 0,
				minWidth: 0,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: ALIGNMENT[align],
				...style,
			}}
		>
			<div ref={innerRef} style={{width: '100%', flexShrink: 0}}>
				{children}
			</div>
		</div>
	);
};
