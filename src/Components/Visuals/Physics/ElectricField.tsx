import React, {useId, useMemo} from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type ElectricField = Extract<CourseVisual, {kind: 'electricField'}>;
type Point = [number, number];

/** The field and the potential of point charges at a point, in units of k = 1: E = Σ q r̂ / r², V = Σ q / r. */
export const fieldAt = (charges: ElectricField['charges'], [x, y]: Point) => {
	let ex = 0;
	let ey = 0;
	let v = 0;
	for (const charge of charges) {
		const dx = x - charge.at[0];
		const dy = y - charge.at[1];
		const r = Math.max(1e-9, Math.hypot(dx, dy));
		ex += (charge.q * dx) / (r * r * r);
		ey += (charge.q * dy) / (r * r * r);
		v += charge.q / r;
	}
	return {ex, ey, v};
};

/**
 * Field lines: from each positive charge (or, with none, into each negative one) lines leave evenly, 8 per unit of
 * charge, and follow the field step by step until they leave the view or reach another charge.
 */
const traceLines = (visual: ElectricField) => {
	const [minX, minY, maxX, maxY] = visual.view;
	const span = Math.max(maxX - minX, maxY - minY);
	const step = span / 300;
	const sources = visual.charges.some((charge) => charge.q > 0) ? visual.charges.filter((charge) => charge.q > 0) : visual.charges.filter((charge) => charge.q < 0);
	const sign = visual.charges.some((charge) => charge.q > 0) ? 1 : -1;
	const lines: Point[][] = [];
	for (const source of sources) {
		const count = Math.max(4, Math.round(8 * Math.abs(source.q)));
		for (let index = 0; index < count; index++) {
			const angle = (2 * Math.PI * (index + 0.5)) / count;
			let point: Point = [source.at[0] + Math.cos(angle) * span * 0.02, source.at[1] + Math.sin(angle) * span * 0.02];
			const line: Point[] = [[source.at[0], source.at[1]], point];
			for (let n = 0; n < 900; n++) {
				const {ex, ey} = fieldAt(visual.charges, point);
				const length = Math.hypot(ex, ey);
				if (length < 1e-12) break;
				point = [point[0] + (sign * ex * step) / length, point[1] + (sign * ey * step) / length];
				line.push(point);
				if (point[0] < minX - span * 0.05 || point[0] > maxX + span * 0.05 || point[1] < minY - span * 0.05 || point[1] > maxY + span * 0.05) break;
				const sink = visual.charges.find((charge) => charge !== source && Math.hypot(point[0] - charge.at[0], point[1] - charge.at[1]) < span * 0.02);
				if (sink) {
					line.push([sink.at[0], sink.at[1]]);
					break;
				}
			}
			lines.push(line);
		}
	}
	return lines;
};

/** Equipotential curves of the given values: marching squares over a grid of the view. */
const contours = (visual: ElectricField, level: number) => {
	const [minX, minY, maxX, maxY] = visual.view;
	const columns = 120;
	const rows = Math.round((columns * (maxY - minY)) / (maxX - minX));
	const dx = (maxX - minX) / columns;
	const dy = (maxY - minY) / rows;
	// The grid is shifted off the round positions: on a symmetric layout a level such as V = 0 can fall exactly on grid
	// points, and a curve through them would find no crossing.
	const value = (i: number, j: number) => fieldAt(visual.charges, [minX + (i + 0.37) * dx, minY + (j + 0.29) * dy]).v;
	const grid = Array.from({length: columns + 1}, (_, i) => Array.from({length: rows + 1}, (_, j) => value(i, j)));
	const segments: [Point, Point][] = [];
	const cross = (a: Point, va: number, b: Point, vb: number): Point => {
		const share = (level - va) / (vb - va);
		return [a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share];
	};
	for (let i = 0; i < columns; i++) {
		for (let j = 0; j < rows; j++) {
			const corners: [Point, number][] = [
				[[minX + (i + 0.37) * dx, minY + (j + 0.29) * dy], grid[i][j]],
				[[minX + (i + 1.37) * dx, minY + (j + 0.29) * dy], grid[i + 1][j]],
				[[minX + (i + 1.37) * dx, minY + (j + 1.29) * dy], grid[i + 1][j + 1]],
				[[minX + (i + 0.37) * dx, minY + (j + 1.29) * dy], grid[i][j + 1]],
			];
			const points: Point[] = [];
			corners.forEach(([point, v], index) => {
				const [next, nextV] = corners[(index + 1) % 4];
				if ((v - level) * (nextV - level) < 0 && Number.isFinite(v) && Number.isFinite(nextV)) points.push(cross(point, v, next, nextV));
			});
			if (points.length === 2) segments.push([points[0], points[1]]);
			if (points.length === 4) segments.push([points[0], points[1]], [points[2], points[3]]);
		}
	}
	return segments;
};

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',').replace(/^-/, '−');

/**
 * Point charges in a plane with their field: field lines leave the positive charges and end on the negative ones,
 * drawing themselves out with arrows along them; dashed equipotential curves at the given potentials; at the marked
 * points the field is an arrow (its direction and, against the other points, its size) and the potential is written
 * in units of kq/d. Beats point at charges c1…, `lines`, `equipotentials` and points p1….
 */
export const ElectricFieldVisual: React.FC<VisualBoxProps & {visual: ElectricField}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const [minX, minY, maxX, maxY] = visual.view;
	const margin = u(30);
	const unit = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const left = (width - unit * (maxX - minX)) / 2;
	const top = (height - unit * (maxY - minY)) / 2;
	const at = ([x, y]: Point): Point => [left + (x - minX) * unit, top + (maxY - y) * unit];
	const lines = useMemo(() => (visual.lines ? traceLines(visual) : []), [visual]);
	const curves = useMemo(() => visual.equipotentials.map((level) => contours(visual, level)), [visual]);
	const linesAt = useShownAt('lines') ?? delaySeconds + 0.6;
	const drawn = easeFrom(seconds, linesAt, 2.4);
	const levelsAt = useBeatStartFor('equipotentials', 'show') ?? delaySeconds + 1.2;
	const levelsIn = easeFrom(seconds, levelsAt, 0.8);
	const chargeIn = visual.charges.map((_, index) => easeFrom(seconds, useShownAt(`c${index + 1}`) ?? delaySeconds + index * 0.2, 0.4));
	const pointIn = visual.points.map((_, index) => easeFrom(seconds, useShownAt(`p${index + 1}`) ?? delaySeconds + 1.6 + index * 0.4, 0.5));
	const fontSize = u(34);
	const fields = visual.points.map((point) => fieldAt(visual.charges, point.at));
	const strongest = Math.max(1e-12, ...fields.map((field) => Math.hypot(field.ex, field.ey)));
	const clip = `field-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<clipPath id={clip}>
					<rect x={left} y={top} width={(maxX - minX) * unit} height={(maxY - minY) * unit} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${clip})`}>
				{curves.map((segments, index) => (
					<Part key={`e${index}`} id="equipotentials">
						{(look) => (
							<g opacity={levelsIn * look.opacity} stroke={palette.brand} strokeWidth={u(3)} strokeDasharray={`${u(10)} ${u(8)}`}>
								{segments.map(([a, b], segment) => {
									const [pa, pb] = [at(a), at(b)];
									return <line key={segment} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} />;
								})}
							</g>
						)}
					</Part>
				))}
				<Part id="lines">
					{(look) => (
						<g opacity={look.opacity}>
							{lines.map((line, index) => {
								const shown = line.slice(0, Math.max(2, Math.round(line.length * drawn)));
								const middle = shown[Math.floor(shown.length / 2)];
								const next = shown[Math.min(shown.length - 1, Math.floor(shown.length / 2) + 3)];
								const [mx, my] = at(middle);
								const [nx, ny] = at(next);
								const forward = visual.charges.some((charge) => charge.q > 0);
								const angle = Math.atan2(ny - my, nx - mx) + (forward ? 0 : Math.PI);
								return (
									<g key={index}>
										<polyline points={shown.map((point) => at(point).join(',')).join(' ')} fill="none" stroke={palette.lesson} strokeWidth={u(3.5)} strokeOpacity={0.85} />
										{shown.length > 12 ? <path d={arrowHead(mx, my, angle, u(16))} fill={palette.lesson} /> : null}
									</g>
								);
							})}
						</g>
					)}
				</Part>
			</g>
			{visual.charges.map((charge, index) => {
				const [cx, cy] = at(charge.at);
				const radius = u(22) + u(6) * Math.min(3, Math.abs(charge.q));
				return (
					<Part key={`c${index}`} id={`c${index + 1}`}>
						{(look) => (
							<g opacity={chargeIn[index] * look.opacity}>
								<circle cx={cx} cy={cy} r={radius * look.scale} fill={charge.q > 0 ? palette.brand : palette.lessonDeep} stroke={palette.ink} strokeWidth={u(3)} />
								<text x={cx} y={cy + fontSize * 0.36} fill={palette.surface} fontSize={fontSize} fontWeight={800} textAnchor="middle">
									{charge.q > 0 ? '+' : '−'}
								</text>
								{charge.label ? (
									<text x={cx} y={cy - radius - u(12)} fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
										{charge.label}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			{visual.points.map((point, index) => {
				const [px, py] = at(point.at);
				const field = fields[index];
				const size = Math.hypot(field.ex, field.ey);
				const length = u(40) + u(110) * (size / strongest);
				const angle = Math.atan2(-field.ey, field.ex);
				return (
					<Part key={`p${index}`} id={`p${index + 1}`}>
						{(look) => (
							<g opacity={pointIn[index] * look.opacity}>
								{point.field && size > 1e-12 ? (
									<g>
										<line x1={px} y1={py} x2={px + Math.cos(angle) * (length - u(14))} y2={py + Math.sin(angle) * (length - u(14))} stroke={palette.ink} strokeWidth={u(6)} strokeLinecap="round" />
										<path d={arrowHead(px + Math.cos(angle) * length, py + Math.sin(angle) * length, angle, u(20))} fill={palette.ink} />
									</g>
								) : null}
								<circle cx={px} cy={py} r={u(9)} fill={palette.ink} />
								<text x={px + u(14)} y={py + fontSize + u(4)} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
									{point.potential ? `${point.label}: V = ${format(field.v)} kq/d` : point.label}
								</text>
							</g>
						)}
					</Part>
				);
			})}
		</svg>
	);
};
