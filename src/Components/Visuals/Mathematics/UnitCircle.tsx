import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type UnitCircle = Extract<CourseVisual, {kind: 'unitCircle'}>;

const SLOTS = 4;
const QUADRANT_SIGNS = ['Hepsi +', 'sin +', 'tan, cot +', 'cos +'];
const RADIANS = Math.PI / 180;

/** Seconds an angle takes to turn: quick for a small one, longer for a full turn or more. */
const turnSeconds = (degrees: number) => 0.7 + Math.min(2, Math.abs(degrees) / 360) * 1.5;

/** "−0,87": the minus sign and the decimal comma as a Turkish textbook writes them. */
const written = (value: number): string => `${value < 0 ? '−' : ''}${String(Math.abs(Number(value.toFixed(2)))).replace('.', ',')}`;

/**
 * The unit circle for trigonometry (owner, 30 Oct 2026: "iyi animasyon istiyorum"). The axes and the circle come
 * first; each angle (parts a1…) then turns in from 0° when the narration reaches it, its arc growing and its point
 * running along the circle. While it turns, the cosine is drawn along the x axis and the sine up to the point, so the
 * student sees both change sign from quadrant to quadrant; `tan` adds the tangent line x = 1 and the height the ray
 * (or its extension back through O) meets it at. `signs` writes which functions are positive in each quadrant
 * (q1…q4). With `wave`, the sine or cosine graph is traced beside the circle while the angle turns, at the same
 * height scale, so the curve is seen coming out of the circle.
 */
export const UnitCircleVisual: React.FC<VisualBoxProps & {visual: UnitCircle}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	// Every hook is called for every slot, in the same order on every frame; the first beat that names a part starts it.
	const firstStart = (id: string) => {
		const shown = useBeatStartFor(id, 'show');
		const focused = useBeatStartFor(id, 'focus');
		return shown === undefined ? focused : focused === undefined ? shown : Math.min(shown, focused);
	};
	const angleLooks = Array.from({length: SLOTS}, (_, index) => useElementState(index < visual.angles.length ? `a${index + 1}` : undefined));
	const angleStarts = Array.from({length: SLOTS}, (_, index) => firstStart(`a${index + 1}`));
	const quadrantLooks = Array.from({length: 4}, (_, index) => useElementState(visual.signs ? `q${index + 1}` : undefined));
	const quadrantStarts = Array.from({length: 4}, (_, index) => firstStart(`q${index + 1}`));
	const lineLooks = {
		sin: useElementState(visual.lines.includes('sin') ? 'sin' : undefined),
		cos: useElementState(visual.lines.includes('cos') ? 'cos' : undefined),
		tan: useElementState(visual.lines.includes('tan') ? 'tan' : undefined),
	};
	const waveLook = useElementState(visual.wave ? 'wave' : undefined);
	const circle = useReveal(delaySeconds, 0.9);

	// The circle takes a square on the left when a graph runs beside it, otherwise the middle of the box.
	const side = Math.min(height, visual.wave ? width * 0.42 : width);
	const R = side * 0.34;
	const cx = visual.wave ? side / 2 : width / 2;
	const cy = height / 2;
	const px = (value: number) => cx + value * R;
	const py = (value: number) => cy - value * R;
	const font = u(32);
	const small = u(27);
	const colours = {cos: palette.brand, sin: palette.lesson, tan: palette.lessonDeep};

	// Each angle: when it starts and how far it has turned.
	const angles = visual.angles.map((angle, index) => {
		const start = angleStarts[index] ?? delaySeconds + 1 + index * 2.2;
		const turn = easeFrom(seconds, start, turnSeconds(angle.degrees));
		return {...angle, index, start, turn, now: angle.degrees * turn, look: angleLooks[index]};
	});
	const visible = angles.filter((angle) => angle.turn > 0.001);
	const arcRadiusOf = (index: number) => R * (0.22 + 0.07 * index);
	// An angle names itself in the middle of its arc; 390° and −330° both end at 30° and would write their names in
	// the same place, so a name that lands on an earlier one moves along the arc until it is clear.
	const labelSpots: Array<[number, number] | undefined> = [];
	visible.forEach((angle) => {
		if (!angle.label) return;
		const radius = arcRadiusOf(angle.index) * (1 + (0.18 * Math.abs(angle.now / 2)) / 360) + u(40);
		const spotAt = (degrees: number): [number, number] => [cx + radius * Math.cos(degrees * RADIANS), cy - radius * Math.sin(degrees * RADIANS)];
		const clear = (spot: [number, number]) => labelSpots.every((other) => !other || Math.hypot(other[0] - spot[0], other[1] - spot[1]) > u(95));
		const tries = [0, 30, -30, 60, -60, 90, -90].map((shift) => spotAt(angle.now / 2 + shift));
		labelSpots[angle.index] = tries.find(clear) ?? tries[0];
	});
	// The lines and the graph follow the angle that started last.
	const active = visible.reduce<(typeof angles)[number] | undefined>((latest, angle) => (!latest || angle.start >= latest.start ? angle : latest), undefined);

	/** The arc of an angle from 0° to `degrees`, a little wider each full turn so several turns stay apart. */
	const arcPath = (degrees: number, radius: number) => {
		const steps = Math.max(2, Math.ceil(Math.abs(degrees) / 4));
		const points = Array.from({length: steps + 1}, (_, step) => {
			const at = (degrees * step) / steps;
			const r = radius * (1 + (0.18 * Math.abs(at)) / 360);
			return `${cx + r * Math.cos(at * RADIANS)} ${cy - r * Math.sin(at * RADIANS)}`;
		});
		return `M${points.join(' L')}`;
	};
	const arrowAt = (degrees: number, radius: number, colour: string) => {
		const r = radius * (1 + (0.18 * Math.abs(degrees)) / 360);
		const tipX = cx + r * Math.cos(degrees * RADIANS);
		const tipY = cy - r * Math.sin(degrees * RADIANS);
		// The tangent of the arc, in the direction it turns.
		const direction = Math.sign(degrees) || 1;
		const tx = -Math.sin(degrees * RADIANS) * direction;
		const ty = -Math.cos(degrees * RADIANS) * direction;
		const size = u(13);
		const nx = -ty;
		const ny = tx;
		return (
			<path
				d={`M${tipX} ${tipY} L${tipX - tx * size * 1.5 + nx * size} ${tipY - ty * size * 1.5 + ny * size} L${tipX - tx * size * 1.5 - nx * size} ${tipY - ty * size * 1.5 - ny * size} Z`}
				fill={colour}
			/>
		);
	};

	// The graph beside the circle: 0° to 360° (or 720° for an angle past a full turn) at the circle's height scale.
	const span = Math.max(360, ...visual.angles.map((angle) => (Math.abs(angle.degrees) > 360 ? 720 : 360)));
	const waveLeft = side + u(40);
	const waveRight = width - u(30);
	const wx = (degrees: number) => waveLeft + (degrees / span) * (waveRight - waveLeft);
	const waveOf = (degrees: number) => (visual.wave === 'cos' ? Math.cos(degrees * RADIANS) : Math.sin(degrees * RADIANS));
	const traced = active && visual.wave && active.now > 0 ? Math.min(span, active.now) : 0;
	const wavePath =
		traced > 0
			? `M${Array.from({length: Math.ceil(traced / 3) + 1}, (_, step) => Math.min(traced, step * 3))
					.map((at) => `${wx(at)} ${py(waveOf(at))}`)
					.join(' L')}`
			: '';

	const axisArrow = (tipX: number, tipY: number, dx: number, dy: number) => {
		const size = u(11);
		return (
			<path
				d={`M${tipX} ${tipY} L${tipX - dx * size * 1.5 - dy * size} ${tipY - dy * size * 1.5 + dx * size} L${tipX - dx * size * 1.5 + dy * size} ${tipY - dy * size * 1.5 - dx * size} Z`}
				fill={palette.ink}
			/>
		);
	};
	const text = (x: number, y: number, content: string, options: {anchor?: 'start' | 'middle' | 'end'; colour?: string; size?: number; weight?: number; opacity?: number} = {}) => (
		<text
			x={x}
			y={y}
			textAnchor={options.anchor ?? 'middle'}
			dominantBaseline="middle"
			fill={options.colour ?? palette.ink}
			opacity={options.opacity ?? 1}
			style={{fontFamily: palette.fontBody, fontWeight: options.weight ?? 700, fontSize: options.size ?? font}}
		>
			{content}
		</text>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			{/* Axes, the circle and the ±1 marks. */}
			<g opacity={circle}>
				<line x1={cx - 1.3 * R} x2={cx + 1.3 * R} y1={cy} y2={cy} stroke={palette.ink} strokeWidth={u(3)} />
				<line x1={cx} x2={cx} y1={cy + 1.3 * R} y2={cy - 1.3 * R} stroke={palette.ink} strokeWidth={u(3)} />
				{axisArrow(cx + 1.3 * R + u(4), cy, 1, 0)}
				{axisArrow(cx, cy - 1.3 * R - u(4), 0, -1)}
				{text(cx + 1.3 * R + u(10), cy + u(30), 'x', {size: small, colour: palette.muted, anchor: 'start'})}
				{text(cx + u(26), cy - 1.3 * R, 'y', {size: small, colour: palette.muted, anchor: 'start'})}
				{text(cx + R + u(22), cy + u(30), '1', {size: small, colour: palette.muted})}
				{text(cx - R - u(26), cy + u(30), '−1', {size: small, colour: palette.muted})}
				{text(cx - u(28), cy - R - u(22), '1', {size: small, colour: palette.muted})}
				{text(cx - u(34), cy + R + u(24), '−1', {size: small, colour: palette.muted})}
			</g>
			<circle cx={cx} cy={cy} r={R} fill="none" stroke={palette.ink} strokeWidth={u(4)} strokeDasharray={`${2 * Math.PI * R * circle} ${2 * Math.PI * R}`} transform={`rotate(0 ${cx} ${cy})`} />

			{/* Which functions are positive where. */}
			{visual.signs
				? QUADRANT_SIGNS.map((sign, index) => {
						const look = quadrantLooks[index];
						const appear = easeFrom(seconds, quadrantStarts[index] ?? delaySeconds + 0.9 + index * 0.25, 0.5);
						// In the corner of the quadrant, outside the circle, where no ray or arc runs.
						const at = (45 + 90 * index) * RADIANS;
						return (
							<g key={sign} opacity={appear * (1 - UNFOCUSED_FADE * look.dim)}>
								{text(cx + Math.sign(Math.cos(at)) * R * 1.08, cy - Math.sign(Math.sin(at)) * R * 1.08, sign, {colour: palette.lessonDeep, size: font * (1 + 0.15 * look.emphasis), weight: 800})}
							</g>
						);
					})
				: null}

			{/* The tangent line x = 1 the tangent is read on. */}
			{visual.lines.includes('tan') && active ? (
				<line x1={px(1)} x2={px(1)} y1={py(1.6)} y2={py(-1.6)} stroke={withAlpha(colours.tan, 0.45)} strokeWidth={u(3)} strokeDasharray={`${u(10)} ${u(8)}`} opacity={active.turn} />
			) : null}

			{/* Earlier angles stay as a ray and a point; the active one carries the lines. */}
			{visible.map((angle) => {
				const isActive = angle === active;
				const opacity = (isActive ? 1 : 0.55) * (1 - UNFOCUSED_FADE * angle.look.dim);
				const cos = Math.cos(angle.now * RADIANS);
				const sin = Math.sin(angle.now * RADIANS);
				const pointX = px(cos);
				const pointY = py(sin);
				const arcRadius = arcRadiusOf(angle.index);
				const labelSpot = labelSpots[angle.index];
				const done = angle.turn > 0.98;
				const emphasis = 1 + 0.3 * angle.look.emphasis;
				return (
					<g key={angle.index} opacity={opacity}>
						<path d={arcPath(angle.now, arcRadius)} fill="none" stroke={palette.lessonDeep} strokeWidth={u(4)} />
						{Math.abs(angle.now) > 8 ? arrowAt(angle.now, arcRadius, palette.lessonDeep) : null}
						<line x1={cx} y1={cy} x2={pointX} y2={pointY} stroke={palette.ink} strokeWidth={u(4) * emphasis} />
						{angle.label && done && labelSpot ? text(labelSpot[0], labelSpot[1], angle.label, {colour: palette.lessonDeep, size: small, weight: 800}) : null}
						<circle cx={pointX} cy={pointY} r={u(12) * emphasis} fill={palette.lesson} stroke={palette.surface} strokeWidth={u(3)} />
						{angle.point && done
							? text(
									visual.lines.includes('tan') && cos > 0.25 ? Math.max(px(1) + u(16), cx + 1.12 * R * cos + u(8)) : cx + 1.12 * R * cos + (cos >= 0 ? u(8) : -u(8)),
									cy - 1.12 * R * sin + (sin >= 0 ? -u(18) : u(22)),
									angle.point,
									{anchor: cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle', size: small, weight: 800},
								)
							: null}
					</g>
				);
			})}

			{active
				? (() => {
						const cos = Math.cos(active.now * RADIANS);
						const sin = Math.sin(active.now * RADIANS);
						const tan = Math.abs(cos) > 0.15 ? sin / cos : undefined;
						const showCos = visual.lines.includes('cos');
						const showSin = visual.lines.includes('sin');
						const showTan = visual.lines.includes('tan') && tan !== undefined && Math.abs(tan) <= 1.6;
						const fade = (look: {dim: number}) => 1 - UNFOCUSED_FADE * look.dim;
						const thick = (look: {emphasis: number}) => u(9) * (1 + 0.4 * look.emphasis);
						const done = active.turn > 0.98;
						// The sine is named on the outer side of its line, unless the tangent's name takes that side.
						const sinOutside = cos >= 0 && !visual.lines.includes('tan');
						return (
							<g>
								{/* Dashed drops from the point to both axes. */}
								<line x1={px(cos)} y1={py(sin)} x2={px(cos)} y2={cy} stroke={withAlpha(palette.ink, 0.45)} strokeWidth={u(2)} strokeDasharray={`${u(8)} ${u(7)}`} />
								<line x1={px(cos)} y1={py(sin)} x2={cx} y2={py(sin)} stroke={withAlpha(palette.ink, 0.45)} strokeWidth={u(2)} strokeDasharray={`${u(8)} ${u(7)}`} />
								{showCos ? (
									<g opacity={fade(lineLooks.cos)}>
										<line x1={cx} y1={cy} x2={px(cos)} y2={cy} stroke={colours.cos} strokeWidth={thick(lineLooks.cos)} strokeLinecap="round" />
										{Math.abs(cos) > 0.12 ? text(px(cos / 2), cy + (sin >= 0 ? u(36) : -u(36)), done ? `cos ${written(cos)}` : 'cos', {colour: colours.cos, size: small, weight: 800}) : null}
									</g>
								) : null}
								{showSin ? (
									<g opacity={fade(lineLooks.sin)}>
										<line x1={px(cos)} y1={cy} x2={px(cos)} y2={py(sin)} stroke={colours.sin} strokeWidth={thick(lineLooks.sin)} strokeLinecap="round" />
										{Math.abs(sin) > 0.12
											? text(px(cos) + (sinOutside ? u(18) : -u(18)), py(sin / 2), done ? `sin ${written(sin)}` : 'sin', {
													colour: colours.sin,
													size: small,
													weight: 800,
													anchor: sinOutside ? 'start' : 'end',
												})
											: null}
									</g>
								) : null}
								{showTan ? (
									<g opacity={fade(lineLooks.tan)}>
										{/* The ray, or its extension back through O, runs on to the line x = 1. */}
										<line
											x1={cos >= 0 ? px(cos) : cx}
											y1={cos >= 0 ? py(sin) : cy}
											x2={px(1)}
											y2={py(tan)}
											stroke={withAlpha(colours.tan, 0.6)}
											strokeWidth={u(3)}
											strokeDasharray={`${u(10)} ${u(8)}`}
										/>
										<line x1={px(1)} y1={cy} x2={px(1)} y2={py(tan)} stroke={colours.tan} strokeWidth={thick(lineLooks.tan)} strokeLinecap="round" />
										{Math.abs(tan) > 0.12 ? text(px(1) + u(18), py(tan / 2), done ? `tan ${written(tan)}` : 'tan', {colour: colours.tan, size: small, weight: 800, anchor: 'start'}) : null}
									</g>
								) : null}
							</g>
						);
					})()
				: null}

			{/* The graph beside the circle, traced by the active angle. */}
			{visual.wave ? (
				<g opacity={circle * (1 - UNFOCUSED_FADE * waveLook.dim)}>
					<line x1={waveLeft} x2={waveRight + u(6)} y1={cy} y2={cy} stroke={palette.ink} strokeWidth={u(3)} />
					<line x1={waveLeft} x2={waveLeft} y1={py(1.25)} y2={py(-1.25)} stroke={palette.ink} strokeWidth={u(3)} />
					{axisArrow(waveRight + u(10), cy, 1, 0)}
					{[1, -1].map((value) => (
						<g key={value}>
							<line x1={waveLeft} x2={waveRight} y1={py(value)} y2={py(value)} stroke={withAlpha(palette.ink, 0.15)} strokeWidth={u(2)} strokeDasharray={`${u(6)} ${u(8)}`} />
							{text(waveLeft - u(14), py(value), value > 0 ? '1' : '−1', {anchor: 'end', size: small, colour: palette.muted})}
						</g>
					))}
					{Array.from({length: span / 90}, (_, index) => (index + 1) * 90).map((degrees) => (
						<g key={degrees}>
							<line x1={wx(degrees)} x2={wx(degrees)} y1={cy - u(10)} y2={cy + u(10)} stroke={palette.ink} strokeWidth={u(3)} />
							{text(wx(degrees), cy + u(40), `${degrees}°`, {size: small, colour: palette.muted})}
						</g>
					))}
					{text(waveRight, py(1.25), visual.wave === 'sin' ? 'y = sin x' : 'y = cos x', {anchor: 'end', colour: colours[visual.wave], size: font, weight: 800})}
					{wavePath ? <path d={wavePath} fill="none" stroke={colours[visual.wave]} strokeWidth={u(6) * (1 + 0.3 * waveLook.emphasis)} strokeLinecap="round" strokeLinejoin="round" /> : null}
					{active && traced > 0 ? (
						<g>
							{/* For the sine the point's height runs straight across to the graph. */}
							{visual.wave === 'sin' ? (
								<line
									x1={px(Math.cos(active.now * RADIANS))}
									y1={py(Math.sin(active.now * RADIANS))}
									x2={wx(traced)}
									y2={py(waveOf(traced))}
									stroke={withAlpha(colours.sin, 0.5)}
									strokeWidth={u(2)}
									strokeDasharray={`${u(8)} ${u(7)}`}
								/>
							) : null}
							<circle cx={wx(traced)} cy={py(waveOf(traced))} r={u(11)} fill={colours[visual.wave]} stroke={palette.surface} strokeWidth={u(3)} />
						</g>
					) : null}
				</g>
			) : null}
		</svg>
	);
};
