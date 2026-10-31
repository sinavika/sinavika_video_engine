import React, {useMemo} from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {parseExpression} from '../Mathematics/PlotExpression';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {arrowHead} from './ArrowHead';

type Motion = Extract<CourseVisual, {kind: 'motion'}>;

/**
 * A body moving along x(t), y(t): the path it has travelled stays as a trail
 * and, if asked, its velocity is an arrow on it. The motion plays over
 * `duration` seconds of the video, then the body rests at the end.
 */
export const MotionVisual: React.FC<VisualBoxProps & {visual: Motion}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const xOf = useMemo(() => parseExpression(visual.x, ['t']), [visual.x]);
	const yOf = useMemo(() => parseExpression(visual.y, ['t']), [visual.y]);
	const [minX, minY, maxX, maxY] = visual.view;
	const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
	const offsetX = (width - (maxX - minX) * scale) / 2;
	const offsetY = (height - (maxY - minY) * scale) / 2;
	const toScreen = (px: number, py: number) => [offsetX + (px - minX) * scale, offsetY + (maxY - py) * scale];
	const progress = Math.min(1, Math.max(0, (seconds - delaySeconds) / visual.duration));
	const [t0, t1] = visual.t;
	const now = t0 + (t1 - t0) * progress;
	const steps = 120;
	const trail = Array.from({length: Math.max(2, Math.round(steps * progress) + 1)}, (_, index) => {
		const t = t0 + ((now - t0) * index) / Math.max(1, Math.round(steps * progress));
		return toScreen(xOf({t}), yOf({t}));
	});
	const [bx, by] = toScreen(xOf({t: now}), yOf({t: now}));
	const dt = (t1 - t0) / 200;
	const [vx, vy] = [xOf({t: now + dt}) - xOf({t: now}), yOf({t: now + dt}) - yOf({t: now})];
	// The arrow's length is the speed: the fastest moment of the motion gets the longest arrow.
	const fastest = useMemo(() => {
		let top = 0;
		for (let index = 0; index <= 200; index++) {
			const t = t0 + ((t1 - t0) * index) / 200;
			top = Math.max(top, Math.hypot(xOf({t: t + dt}) - xOf({t}), yOf({t: t + dt}) - yOf({t})));
		}
		return top || 1;
	}, [t0, t1, dt, xOf, yOf]);
	const arrowLength = u(170) * Math.hypot(vx, vy) / fastest;
	const angle = Math.atan2(-vy, vx);
	const ground = toScreen(minX, 0)[1];

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{ground >= 0 && ground <= height ? <line x1={0} x2={width} y1={ground} y2={ground} stroke={palette.axis} strokeWidth={u(5)} /> : null}
			<path d={trail.map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${px} ${py}`).join(' ')} fill="none" stroke={palette.lesson} strokeWidth={u(6)} strokeDasharray={`${u(4)} ${u(14)}`} strokeLinecap="round" />
			<circle cx={bx} cy={by} r={u(26)} fill={palette.brand} stroke={palette.surface} strokeWidth={u(5)} />
			{visual.velocity && progress < 1 && arrowLength > u(8) ? (
				<g>
					<line x1={bx} y1={by} x2={bx + Math.cos(angle) * arrowLength} y2={by + Math.sin(angle) * arrowLength} stroke={palette.ink} strokeWidth={u(7)} />
					<path d={arrowHead(bx + Math.cos(angle) * arrowLength, by + Math.sin(angle) * arrowLength, angle, u(24))} fill={palette.ink} />
					<text x={bx + Math.cos(angle) * (arrowLength + u(34))} y={by + Math.sin(angle) * (arrowLength + u(34)) + u(12)} fill={palette.ink} fontSize={u(34)} fontWeight={800} textAnchor="middle">
						v
					</text>
				</g>
			) : null}
			{visual.label ? <text x={bx} y={by - u(44)} fill={palette.ink} fontSize={u(32)} fontWeight={800} textAnchor="middle">{visual.label}</text> : null}
		</svg>
	);
};
