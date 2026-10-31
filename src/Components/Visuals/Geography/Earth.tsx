import React, {useId} from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {useTimeline} from '../VisualTimeline';
import {EARTH_DATES} from './GeographySchema';
import {type CourseVisual} from '../VisualSchema';
import {Chip, deg, pathOf, rad, Tag, usePartLook, W, World} from '../VisualWorld';

/** Colours of the globe: sea, night side, grid lines, the sun and its rays. */
const GLOBE = {sea: '#5B9BD5', seaDeep: '#2F6A9F', night: '#14213D', line: '#FFFFFF', sun: '#F9C74F', ray: '#F2A93B'};

// ---------------------------------------------------------------- the Earth: rays, orbit, rotation

type Earth = Extract<CourseVisual, {kind: 'earth'}>;
type EarthDate = (typeof EARTH_DATES)[number];

const TILT = 23.45;
/** Where the Sun's rays fall at right angles at noon on each date (degrees of latitude, north positive). */
const DECLINATION: Record<EarthDate, number> = {mart: 0, haziran: TILT, eylul: 0, aralik: -TILT};
const DATE_NAMES: Record<EarthDate, {title: string; perpendicular: string}> = {
	mart: {title: '21 Mart', perpendicular: 'Dik ışın: Ekvator'},
	haziran: {title: '21 Haziran', perpendicular: 'Dik ışın: Yengeç Dönencesi'},
	eylul: {title: '23 Eylül', perpendicular: 'Dik ışın: Ekvator'},
	aralik: {title: '21 Aralık', perpendicular: 'Dik ışın: Oğlak Dönencesi'},
};
const SEASON_NORTH: Record<EarthDate, string> = {mart: 'Kuzeyde ilkbahar başlar', haziran: 'Kuzeyde yaz başlar', eylul: 'Kuzeyde sonbahar başlar', aralik: 'Kuzeyde kış başlar'};
/** Day length in hours at a latitude for a declination, geometric (no refraction): 24/π · acos(−tan φ · tan δ). */
export const dayLengthHours = (latitude: number, declination: number) => (24 / Math.PI) * Math.acos(Math.max(-1, Math.min(1, -Math.tan(rad(latitude)) * Math.tan(rad(declination)))));
const hoursText = (hours: number) => {
	const minutes = Math.round((hours * 60) / 10) * 10;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
};
/** A clock time from hours past midnight, "14.20" (to the minute, as the 4-minutes-a-degree rule gives). */
export const clockText = (hours: number) => {
	const minutes = ((Math.round(hours * 60) % 1440) + 1440) % 1440;
	return `${String(Math.floor(minutes / 60)).padStart(2, '0')}.${String(minutes % 60).padStart(2, '0')}`;
};

/**
 * The date the figure shows now: the `date` field, or, when beats name stages, the stage of the beat being said
 * (0 21 Mart, 1 21 Haziran, 2 23 Eylül, 3 21 Aralık). The declination eases to the new date over 1.4 s, so the
 * axis is seen tilting from one date to the next.
 */
const useEarthDate = (date: EarthDate): {date: EarthDate; declination: number} => {
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	if (!timeline || !timeline.beats.some((beat) => beat.stage !== undefined)) return {date, declination: DECLINATION[date]};
	let current = date;
	let declination = DECLINATION[date];
	timeline.beats.forEach((beat, index) => {
		if (beat.stage === undefined || seconds < timeline.starts[index]) return;
		current = EARTH_DATES[Math.min(EARTH_DATES.length - 1, beat.stage)];
		declination += (DECLINATION[current] - declination) * easeFrom(seconds, timeline.starts[index], 1.4);
	});
	return {date: current, declination};
};


/** Latitude belts as Turkish lessons name them: low up to the tropics, middle up to the polar circles, high beyond. */
const BELTS = [
	{name: 'Alçak enlemler', from: 0, to: 23.45, color: 'rgba(249, 199, 79, 0.5)'},
	{name: 'Orta enlemler', from: 23.45, to: 66.55, color: 'rgba(144, 190, 109, 0.45)'},
	{name: 'Yüksek enlemler', from: 66.55, to: 90, color: 'rgba(255, 255, 255, 0.62)'},
];


/** Horizontal sun rays from the left edge to the surface of a globe at (cx, cy, r), flowing towards it. */
const SunRays: React.FC<{cx: number; cy: number; r: number; t: number; opacity: number}> = ({cx, cy, r, t, opacity}) => (
	<g opacity={opacity}>
		{Array.from({length: 13}, (_, index) => {
			const y = 60 + index * 40;
			const dy = y - cy;
			const hits = Math.abs(dy) < r;
			const end = hits ? cx - Math.sqrt(r * r - dy * dy) : W;
			return (
				<g key={index}>
					<line x1={0} y1={y} x2={end - (hits ? 6 : 0)} y2={y} stroke={GLOBE.ray} strokeWidth={3} strokeDasharray="18 12" strokeDashoffset={-t * 50} opacity={hits ? 0.95 : 0.35} />
					{hits ? <path d={`M${end - 4} ${y} l-14 -7 l0 14 z`} fill={GLOBE.ray} /> : null}
				</g>
			);
		})}
	</g>
);

/**
 * The Earth and the Sun, in three views. `rays`: the globe from the side with the Sun's rays coming from the left;
 * the axis tilts with the date (beats' `stage` 0–3: 21 Mart, 21 Haziran, 23 Eylül, 21 Aralık), the lit half is
 * on the left, the circle of illumination is the vertical line, and the ray that falls at right angles marks
 * Ekvator or a tropic; `shadows` adds sticks with their noon shadows, `dayLengths` a table of day lengths.
 * `orbit`: the year, the elliptical orbit seen from above at a slant, the four dates with the axis always
 * pointing the same way, the perihelion (3 Ocak) and aphelion (4 Temmuz). `rotation`: the day, the northern
 * hemisphere seen from above the North Pole, turning from west to east, the noon meridian facing the Sun, local
 * times round the rim, the linear speed shrinking towards the pole and `places` with their local times.
 */
export const EarthVisual: React.FC<VisualBoxProps & {visual: Earth}> = (props) => {
	if (props.visual.view === 'orbit') return <EarthOrbit {...props} />;
	if (props.visual.view === 'rotation') return <EarthRotation {...props} />;
	if (props.visual.view === 'winds') return <EarthWinds {...props} />;
	return <EarthRays {...props} />;
};

// The side view: rays, tilt, lines of latitude, shadows, day lengths.
const EarthRays: React.FC<VisualBoxProps & {visual: Earth}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const {date, declination} = useEarthDate(visual.date);
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.35, 0.6);
	const rays = usePartLook('isinlar', enter(0));
	const night = usePartLook('gece', enter(1));
	const terminator = usePartLook('aydinlanma', enter(2));
	const axis = usePartLook('eksen', enter(2));
	const equator = usePartLook('ekvator', enter(3));
	const tropics = usePartLook('donenceler', enter(3));
	const polar = usePartLook('kutupdaireleri', enter(4));
	const right = usePartLook('dikaci', enter(5));
	const shadows = usePartLook('golge', visual.shadows ? enter(6) : 0);
	const lengths = usePartLook('sureler', visual.dayLengths ? enter(6) : 0);
	const belts = usePartLook('kusaklar', visual.zones ? enter(3.5) : 0);
	const angle = usePartLook('enlem', visual.latitude !== undefined ? enter(5.5) : 0);

	const cx = 490;
	const cy = 300;
	const R = 205;
	// The Earth's frame turns with the date: north leans towards the Sun (left) by the declination.
	const turn = rad(-declination);
	const toScreen = (x: number, y: number): [number, number] => [cx + x * Math.cos(turn) - y * Math.sin(turn), cy + x * Math.sin(turn) + y * Math.cos(turn)];
	const latitudeLine = (latitude: number): [[number, number], [number, number]] => [toScreen(-R * Math.cos(rad(latitude)), -R * Math.sin(rad(latitude))), toScreen(R * Math.cos(rad(latitude)), -R * Math.sin(rad(latitude)))];
	const lines: {latitude: number; label: string; dashed: boolean; look: ReturnType<typeof usePartLook>}[] = [
		{latitude: 0, label: 'Ekvator 0°', dashed: false, look: equator},
		{latitude: TILT, label: "Yengeç Dönencesi 23°27'", dashed: true, look: tropics},
		{latitude: -TILT, label: "Oğlak Dönencesi 23°27'", dashed: true, look: tropics},
		{latitude: 90 - TILT, label: "K. Kutup Dairesi 66°33'", dashed: true, look: polar},
		{latitude: -(90 - TILT), label: "G. Kutup Dairesi 66°33'", dashed: true, look: polar},
	];
	const north = toScreen(0, -R - 46);
	const south = toScreen(0, R + 46);
	const names = DATE_NAMES[date];
	// Sticks at fixed latitudes on the lit side, each with its noon shadow along the ground, pointing away from
	// where the rays fall at right angles: the further from it, the lower the Sun and the longer the shadow.
	const sticks = [70, 40, 0, -40].map((latitude) => {
		const [px, py] = toScreen(-R * Math.cos(rad(latitude)), -R * Math.sin(rad(latitude)));
		const nx = (px - cx) / R;
		const ny = (py - cy) / R;
		const away = deg(Math.acos(Math.max(-1, Math.min(1, -nx))));
		// The ground's direction at the stick, pointing away from the subsolar point (the leftmost point of the disk).
		const shadowDirection: [number, number] = ny <= 0 ? [-ny, nx] : [ny, -nx];
		const stick = 30;
		const shadow = away >= 89 ? 0 : Math.min(130, stick * Math.tan(rad(away)));
		const name = latitude === 0 ? 'Ekvator' : `${Math.abs(latitude)}° ${latitude > 0 ? 'K' : 'G'}`;
		return {latitude, px, py, nx, ny, shadowDirection, stick, shadow, lit: away < 89, elevation: Math.round(90 - away), name};
	});
	const rows = [90 - TILT, 40, 0, -40, -(90 - TILT)].map((latitude) => ({
		name: latitude === 0 ? 'Ekvator' : Math.abs(latitude) > 60 ? `66°33' ${latitude > 0 ? 'K' : 'G'}` : `${Math.abs(latitude)}° ${latitude > 0 ? 'K' : 'G'}`,
		hours: dayLengthHours(latitude, declination),
	}));
	const subsolar: [number, number] = [cx - R, cy];

	return (
		<World width={width} height={height}>
			<defs>
				<radialGradient id={`globe${id}`} cx="0.35" cy="0.4" r="0.75">
					<stop offset="0" stopColor="#8EC1EA" />
					<stop offset="1" stopColor={GLOBE.seaDeep} />
				</radialGradient>
				<clipPath id={`disk${id}`}>
					<circle cx={cx} cy={cy} r={R} />
				</clipPath>
			</defs>
			<SunRays cx={cx} cy={cy} r={R} t={t} opacity={rays.opacity} />
			<g opacity={rays.opacity}>
				<Tag x={20} y={30} text="Güneş ışınları" size={22} focused={rays.focused} />
			</g>
			{/* The globe; the night half (right of the circle of illumination) darkened. */}
			<circle cx={cx} cy={cy} r={R} fill={`url(#globe${id})`} stroke={GLOBE.seaDeep} strokeWidth={3} />
			<g clipPath={`url(#disk${id})`}>
				{/* Latitude belts, in the Earth's own frame so they lean with the axis. */}
				<g opacity={belts.opacity * (0.75 + 0.25 * belts.focused)} transform={`rotate(${-declination} ${cx} ${cy})`}>
					{BELTS.flatMap((belt) =>
						[1, -1].map((side) => {
							const top = cy - side * R * Math.sin(rad(belt.to));
							const bottom = cy - side * R * Math.sin(rad(belt.from));
							return <rect key={`${belt.name}${side}`} x={cx - R} y={Math.min(top, bottom)} width={2 * R} height={Math.abs(bottom - top)} fill={belt.color} />;
						}),
					)}
				</g>
				<rect x={cx} y={cy - R} width={R} height={2 * R} fill={GLOBE.night} opacity={0.55 * night.opacity} />
				{lines.map((line, index) => {
					const [[x1, y1], [x2, y2]] = latitudeLine(line.latitude);
					return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={line.look.focused > 0.5 ? palette.lesson : GLOBE.line} strokeWidth={line.look.focused > 0.5 ? 6 : line.latitude === 0 ? 4 : 3} strokeDasharray={line.dashed ? '12 9' : undefined} opacity={line.look.opacity} />;
				})}
			</g>
			<g opacity={night.opacity * (visual.zones ? 0 : 1)}>
				<Tag x={cx + R * 0.5} y={cy + R * 0.12} text="Gece" anchor="middle" size={24} fill={GLOBE.night} focused={night.focused} />
				<Tag x={cx - R * 0.5} y={cy + R * 0.12} text="Gündüz" anchor="middle" size={24} focused={night.focused} />
			</g>
			{/* Belt names in the northern half, on the night side, clear of the lit side's angle and sticks;
			    the high latitudes are named just above the pole. */}
			<g opacity={belts.opacity}>
				{BELTS.map((belt) => {
					const [x, y] = belt.to > 70 ? toScreen(R * 0.42, -R * 1.1) : toScreen(R * 0.45, -R * Math.sin(rad((belt.from + belt.to) / 2)));
					return <Tag key={belt.name} x={x} y={y} text={belt.name} anchor="middle" size={20} focused={belts.focused} />;
				})}
			</g>
			{/* Latitude as an angle at the centre: from the Equator's plane to the point. */}
			{visual.latitude !== undefined
				? (() => {
						const latitude = visual.latitude;
						const [ex, ey] = toScreen(-R, 0);
						const [px, py] = toScreen(-R * Math.cos(rad(latitude)), -R * Math.sin(rad(latitude)));
						const [ax, ay] = toScreen(-78, 0);
						const [bx, by] = toScreen(-78 * Math.cos(rad(latitude)), -78 * Math.sin(rad(latitude)));
						const [lx, ly] = toScreen(-118 * Math.cos(rad(latitude / 2)), -118 * Math.sin(rad(latitude / 2)));
						return (
							<g opacity={angle.opacity}>
								<line x1={cx} y1={cy} x2={ex} y2={ey} stroke={palette.ink} strokeWidth={3} strokeDasharray="8 6" />
								<line x1={cx} y1={cy} x2={px} y2={py} stroke={palette.lesson} strokeWidth={5} />
								<path d={`M${ax} ${ay} A 78 78 0 0 ${latitude > 0 ? 1 : 0} ${bx} ${by}`} fill="none" stroke={palette.lesson} strokeWidth={4} />
								<circle cx={px} cy={py} r={10} fill={palette.brand} stroke={palette.surface} strokeWidth={3} />
								<Tag x={lx} y={ly} text={`${Math.abs(latitude)}°`} anchor="middle" size={22} focused={angle.focused} fill={palette.lesson} />
								<Tag x={px - 18} y={py - 18} text={`Enlem ${Math.abs(latitude)}° ${latitude >= 0 ? 'K' : 'G'}`} anchor="end" size={21} focused={angle.focused} />
							</g>
						);
					})()
				: null}
			{/* The circle of illumination, seen edge on: the vertical line through the centre. */}
			<g opacity={terminator.opacity}>
				<line x1={cx} y1={cy - R - 18} x2={cx} y2={cy + R + 18} stroke={terminator.focused > 0.5 ? palette.lesson : GLOBE.sun} strokeWidth={terminator.focused > 0.5 ? 7 : 5} />
				{/* Below the pole's label when the axis leans, clear of the day-length table on the left. */}
				<Tag x={cx + 12} y={cy + R + (Math.abs(declination) > 2 ? 66 : 34)} text="Aydınlanma çemberi" size={20} focused={terminator.focused} />
			</g>
			{lines.map((line, index) => {
				const [, [x2, y2]] = latitudeLine(line.latitude);
				return (
					<g key={`l${index}`} opacity={line.look.opacity}>
						<Tag x={x2 + 14} y={y2} text={line.label} size={20} focused={line.look.focused} />
					</g>
				);
			})}
			{/* The axis and its tilt. */}
			<g opacity={axis.opacity}>
				<line x1={north[0]} y1={north[1]} x2={south[0]} y2={south[1]} stroke={axis.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={axis.focused > 0.5 ? 6 : 4} strokeLinecap="round" />
				<circle cx={toScreen(0, -R)[0]} cy={toScreen(0, -R)[1]} r={7} fill={palette.ink} />
				<circle cx={toScreen(0, R)[0]} cy={toScreen(0, R)[1]} r={7} fill={palette.ink} />
				<Tag x={north[0]} y={north[1] - 18} text="K" anchor="middle" size={24} focused={axis.focused} />
				<Tag x={south[0]} y={south[1] + 20} text="G" anchor="middle" size={24} focused={axis.focused} />
				{Math.abs(declination) > 2 ? (
					<g>
						<line x1={cx} y1={cy - R - 10} x2={cx} y2={cy - R - 64} stroke={palette.muted} strokeWidth={2.5} strokeDasharray="6 6" />
						<path d={`M${cx} ${cy - R - 40} A ${R + 40} ${R + 40} 0 0 ${declination > 0 ? 0 : 1} ${toScreen(0, -R - 40)[0]} ${toScreen(0, -R - 40)[1]}`} fill="none" stroke={palette.lesson} strokeWidth={3} />
						<Tag x={cx + (declination > 0 ? 14 : -14)} y={cy - R - 52} text="23°27'" anchor={declination > 0 ? 'start' : 'end'} size={20} focused={axis.focused} />
					</g>
				) : null}
			</g>
			{/* The ray that falls at right angles at noon. */}
			<g opacity={right.opacity}>
				<line x1={0} y1={cy} x2={subsolar[0] - 8} y2={cy} stroke={palette.lesson} strokeWidth={7} />
				<path d={`M${subsolar[0] - 4} ${cy} l-20 -11 l0 22 z`} fill={palette.lesson} />
				<rect x={subsolar[0] - 22} y={cy - 22} width={18} height={18} fill="none" stroke={palette.lesson} strokeWidth={3} />
				<Tag x={subsolar[0] - 34} y={cy + 26} text="90°" anchor="end" size={24} focused={right.focused} fill={palette.lesson} />
			</g>
			{/* Sticks and their noon shadows. */}
			<g opacity={shadows.opacity}>
				{sticks.map((stick) => {
					const top: [number, number] = [stick.px + stick.nx * stick.stick, stick.py + stick.ny * stick.stick];
					const end: [number, number] = [stick.px + stick.shadowDirection[0] * stick.shadow, stick.py + stick.shadowDirection[1] * stick.shadow];
					// Off the bold perpendicular ray, which runs along the centre line.
					const label: [number, number] = [stick.px + stick.nx * 62, stick.py + stick.ny * 62 + (Math.abs(stick.py + stick.ny * 62 - cy) < 26 ? -30 : 0)];
					return (
						<g key={stick.latitude}>
							{stick.lit ? <line x1={stick.px} y1={stick.py} x2={end[0]} y2={end[1]} stroke="#1B1B1B" strokeWidth={7} strokeLinecap="round" opacity={0.75} /> : null}
							<line x1={stick.px} y1={stick.py} x2={top[0]} y2={top[1]} stroke="#7A5534" strokeWidth={6} strokeLinecap="round" opacity={stick.lit ? 1 : 0.35} />
							{stick.lit ? <Tag x={label[0]} y={label[1]} text={`${stick.name}: ${stick.elevation}°`} anchor="end" size={19} focused={shadows.focused} /> : null}
						</g>
					);
				})}
			</g>
			{/* Day lengths on this date. */}
			<g opacity={lengths.opacity}>
				<rect x={10} y={398} width={292} height={192} rx={18} fill={palette.surface} stroke={lengths.focused > 0.5 ? palette.lesson : palette.border} strokeWidth={lengths.focused > 0.5 ? 4 : 2} />
				<text x={26} y={426} fontSize={20} fontWeight={800} fill={palette.ink} fontFamily={palette.fontDisplay}>
					Gündüz süresi
				</text>
				{rows.map((row, index) => {
					const y = 458 + index * 29;
					return (
						<g key={row.name}>
							<text x={26} y={y + 6} fontSize={17} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
								{row.name}
							</text>
							<rect x={104} y={y - 9} width={84} height={18} rx={5} fill={GLOBE.night} opacity={0.8} />
							<rect x={104} y={y - 9} width={(84 * row.hours) / 24} height={18} rx={5} fill={GLOBE.sun} />
							<text x={196} y={y + 6} fontSize={17} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
								{hoursText(row.hours)}
							</text>
						</g>
					);
				})}
			</g>
			{/* The date, top right. */}
			{visual.labels ? <Chip x={820} y={40} title={names.title} subtitle={names.perpendicular} focused={right.focused} opacity={1} /> : null}
		</World>
	);
};

// The year: the orbit, the four dates, perihelion and aphelion.
const EarthOrbit: React.FC<VisualBoxProps & {visual: Earth}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.35, 0.6);
	const sun = usePartLook('gunes', enter(0));
	const orbit = usePartLook('yorunge', enter(1));
	const axis = usePartLook('eksen', enter(3));
	const near = usePartLook('gunberi', enter(4));
	const far = usePartLook('gunote', enter(4));
	const looks: Record<EarthDate, ReturnType<typeof usePartLook>> = {
		haziran: usePartLook('haziran', enter(2)),
		eylul: usePartLook('eylul', enter(2.3)),
		aralik: usePartLook('aralik', enter(2.6)),
		mart: usePartLook('mart', enter(2.9)),
	};
	const ox = 500;
	const oy = 300;
	const rx = 380;
	const ry = 175;
	// The Sun is a little off centre, towards the perihelion side (exaggerated so it shows).
	const sx = 548;
	const sy = 300;
	const at = (angle: number): [number, number] => [ox + rx * Math.cos(rad(angle)), oy - ry * Math.sin(rad(angle))];
	const orbitPath = pathOf(Array.from({length: 121}, (_, index) => at(index * 3)), true);
	// Going round anticlockwise as seen from above the north: 21 Aralık on the right, then 21 Mart at the back,
	// 21 Haziran on the left, 23 Eylül in front.
	const places: {date: EarthDate; angle: number; r: number; chip: [number, number]}[] = [
		{date: 'aralik', angle: 0, r: 40, chip: [868, 402]},
		{date: 'mart', angle: 90, r: 34, chip: [700, 70]},
		{date: 'haziran', angle: 180, r: 40, chip: [132, 178]},
		{date: 'eylul', angle: 270, r: 50, chip: [740, 540]},
	];
	const axisDirection: [number, number] = [Math.sin(rad(TILT)), -Math.cos(rad(TILT))];
	const perihelion = at(20);
	const aphelion = at(200);

	return (
		<World width={width} height={height}>
			{/* The orbit, flowing the way the Earth goes. */}
			<g opacity={orbit.opacity}>
				<path d={orbitPath} fill={withAlpha(palette.lesson, 0.06)} stroke={orbit.focused > 0.5 ? palette.lesson : palette.axis} strokeWidth={orbit.focused > 0.5 ? 5 : 3} strokeDasharray="16 12" strokeDashoffset={-t * 30} />
				{[45, 135, 225, 315].map((angle) => {
					const [x, y] = at(angle);
					const direction = deg(Math.atan2(-ry * Math.cos(rad(angle)), -rx * Math.sin(rad(angle))));
					return <path key={angle} d="M10 0 L-8 -9 L-8 9 Z" fill={palette.lesson} transform={`translate(${x} ${y}) rotate(${direction})`} />;
				})}
				<Tag x={ox - 250} y={oy - 20} text="Yörünge: elips" size={20} focused={orbit.focused} fill={palette.muted} />
				<Tag x={ox - 250} y={oy + 12} text="1 tur: 365 gün 6 saat" size={18} focused={orbit.focused} fill={palette.muted} />
			</g>
			{/* The Sun. */}
			<g opacity={sun.opacity} transform={`translate(${sx} ${sy})`}>
				<circle r={78} fill={GLOBE.sun} opacity={0.25 + 0.05 * Math.sin(t * 2)} />
				<circle r={54} fill={GLOBE.sun} stroke={GLOBE.ray} strokeWidth={4} />
				<Tag x={0} y={0} text="Güneş" anchor="middle" size={22} focused={sun.focused} />
			</g>
			{/* Perihelion and aphelion. */}
			<g opacity={near.opacity}>
				<circle cx={perihelion[0]} cy={perihelion[1]} r={8} fill={palette.lesson} />
				<Tag x={perihelion[0] - 10} y={perihelion[1] - 30} text="Günberi · 3 Ocak · en yakın" anchor="middle" size={19} focused={near.focused} />
			</g>
			<g opacity={far.opacity}>
				<circle cx={aphelion[0]} cy={aphelion[1]} r={8} fill={palette.lesson} />
				<Tag x={aphelion[0] + 10} y={aphelion[1] + 32} text="Günöte · 4 Temmuz · en uzak" anchor="start" size={19} focused={far.focused} />
			</g>
			{/* The Earth on the four dates: lit towards the Sun, the axis always leaning the same way. */}
			{places.map((place) => {
				const look = looks[place.date];
				const [x, y] = at(place.angle);
				const toSun = deg(Math.atan2(sy - y, sx - x));
				const r = place.r * (1 + 0.15 * look.focused);
				return (
					<g key={place.date} opacity={look.opacity}>
						<circle cx={x} cy={y} r={r} fill={GLOBE.sea} stroke={GLOBE.seaDeep} strokeWidth={3} />
						<path d={`M0 ${-r} A ${r} ${r} 0 0 1 0 ${r} Z`} fill={GLOBE.night} opacity={0.6} transform={`translate(${x} ${y}) rotate(${toSun + 180})`} />
						<line x1={x + axisDirection[1] * r} y1={y - axisDirection[0] * r} x2={x - axisDirection[1] * r} y2={y + axisDirection[0] * r} stroke={GLOBE.line} strokeWidth={2.5} />
						{visual.labels ? <Chip x={place.chip[0]} y={place.chip[1]} title={DATE_NAMES[place.date].title} subtitle={SEASON_NORTH[place.date]} focused={look.focused} opacity={1} /> : null}
					</g>
				);
			})}
			{/* The axes, drawn over the globes so a beat can point at them together. */}
			<g opacity={axis.opacity}>
				{places.map((place) => {
					const [x, y] = at(place.angle);
					const length = place.r + 22;
					return (
						<g key={place.date}>
							<line x1={x - axisDirection[0] * length} y1={y - axisDirection[1] * length} x2={x + axisDirection[0] * length} y2={y + axisDirection[1] * length} stroke={axis.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={axis.focused > 0.5 ? 5 : 3.5} strokeLinecap="round" />
							<Tag x={x + axisDirection[0] * (length + 14)} y={y + axisDirection[1] * (length + 14)} text="K" anchor="middle" size={18} focused={axis.focused} />
						</g>
					);
				})}
			</g>
		</World>
	);
};

// The day: the northern hemisphere from above the North Pole.
const EarthRotation: React.FC<VisualBoxProps & {visual: Earth}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.35, 0.6);
	const night = usePartLook('gece', enter(1));
	const turning = usePartLook('yon', enter(2));
	const hours = usePartLook('saatler', enter(3));
	const speed = usePartLook('hiz', visual.speed ? enter(4) : 0);
	const where = usePartLook('yerler', visual.places.length > 0 ? enter(5) : 0);
	const cx = 330;
	const cy = 300;
	const R = 222;
	// Noon is where the meridian faces the Sun (left); the noon meridian moves west as the Earth turns east.
	const noon = visual.noon - (visual.spin ? t * 4 : 0);
	/** Screen angle (degrees, y down) of a longitude: noon on the left, east is anticlockwise. */
	const angleOf = (longitude: number) => 180 - (longitude - noon);
	const rim = (angle: number, radius: number): [number, number] => [cx + radius * Math.cos(rad(angle)), cy + radius * Math.sin(rad(angle))];
	const timeOf = (longitude: number) => 12 + (longitude - noon) / 15;
	const speedRows = [0, 30, 60].map((latitude) => ({latitude, radius: R * Math.cos(rad(latitude)), kmh: Math.round((1670 * Math.cos(rad(latitude))) / 5) * 5}));

	return (
		<World width={width} height={height}>
			<defs>
				<clipPath id={`polar${id}`}>
					<circle cx={cx} cy={cy} r={R} />
				</clipPath>
			</defs>
			<SunRays cx={cx} cy={cy} r={R} t={t} opacity={enter(0)} />
			<circle cx={cx} cy={cy} r={R} fill={GLOBE.sea} stroke={GLOBE.seaDeep} strokeWidth={3} />
			<g clipPath={`url(#polar${id})`}>
				{/* Meridians every 15°: one hour apart. */}
				{Array.from({length: 24}, (_, index) => {
					const longitude = -180 + index * 15;
					const [x, y] = rim(angleOf(longitude), R);
					return <line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke={GLOBE.line} strokeWidth={longitude === 0 ? 4 : 1.6} opacity={longitude === 0 ? 0.95 : 0.55} />;
				})}
				{speedRows.slice(1).map((row) => (
					<circle key={row.latitude} cx={cx} cy={cy} r={row.radius} fill="none" stroke={GLOBE.line} strokeWidth={1.6} opacity={0.6} />
				))}
				<rect x={cx} y={cy - R} width={R} height={2 * R} fill={GLOBE.night} opacity={0.55 * night.opacity} />
			</g>
			<circle cx={cx} cy={cy} r={6} fill={palette.ink} />
			<g opacity={night.opacity}>
				<Tag x={cx + R * 0.32} y={cy + R * 0.84} text="Gece" anchor="middle" size={22} fill={GLOBE.night} focused={night.focused} />
				<Tag x={cx - R * 0.32} y={cy + R * 0.84} text="Gündüz" anchor="middle" size={22} focused={night.focused} />
			</g>
			<Tag x={cx + 10} y={cy + 22} text="Kuzey Kutbu" size={17} />
			{/* Local time round the rim: 12.00 faces the Sun. */}
			<g opacity={hours.opacity}>
				{Array.from({length: 24}, (_, index) => {
					const angle = 180 - index * 15;
					const [x1, y1] = rim(angle, R + 6);
					const [x2, y2] = rim(angle, R + (index % 6 === 0 ? 22 : 14));
					return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={palette.ink} strokeWidth={index % 6 === 0 ? 3.5 : 2} />;
				})}
				{[0, 6, 12, 18].map((step) => {
					const [x, y] = rim(180 - step * 15, R + 48);
					return <Tag key={step} x={x} y={y} text={clockText(12 + step)} anchor="middle" size={21} focused={hours.focused} />;
				})}
			</g>
			{/* West to east: anticlockwise seen from above the North Pole. */}
			<g opacity={turning.opacity}>
				<path d={`M${rim(-20, R + 30).join(' ')} A ${R + 30} ${R + 30} 0 0 0 ${rim(-70, R + 30).join(' ')}`} fill="none" stroke={palette.lesson} strokeWidth={6} strokeLinecap="round" />
				<path d="M12 0 L-8 -11 L-8 11 Z" fill={palette.lesson} transform={`translate(${rim(-72, R + 30).join(' ')}) rotate(${-72 - 90})`} />
				<Tag x={rim(-45, R + 62)[0]} y={rim(-45, R + 62)[1]} text="Batıdan doğuya" size={21} focused={turning.focused} />
			</g>
			{/* Linear speed: the same turn, a shorter circle towards the pole. */}
			<g opacity={speed.opacity}>
				{speedRows.map((row) => {
					// On the night side, where the yellow reads best; each arrow as long as the speed on its circle.
					const [x, y] = rim(-40, row.radius - 6);
					const length = 110 * (row.radius / R);
					return (
						<g key={row.latitude} transform={`translate(${x} ${y}) rotate(${-40 - 90})`}>
							<line x1={0} y1={0} x2={length - 12} y2={0} stroke={GLOBE.sun} strokeWidth={7} strokeLinecap="round" />
							<path d={`M${length} 0 l-16 -10 l0 20 z`} fill={GLOBE.sun} />
						</g>
					);
				})}
			</g>
			{/* Places with their local time. */}
			<g opacity={where.opacity}>
				{visual.places.map((place) => {
					const angle = angleOf(place.longitude);
					const [x, y] = rim(angle, R * 0.62);
					const [lx, ly] = rim(angle, R * 0.62 - 44);
					return (
						<g key={place.name}>
							<circle cx={x} cy={y} r={10} fill={palette.brand} stroke={palette.surface} strokeWidth={3} />
							<Tag x={lx} y={ly} text={`${place.name} ${clockText(timeOf(place.longitude))}`} anchor="middle" size={20} focused={where.focused} />
						</g>
					);
				})}
			</g>
			{/* The rules, on the right. */}
			<g opacity={hours.opacity}>
				<Chip x={856} y={86} title="15° = 1 saat" subtitle="360° = 24 saat" focused={hours.focused} opacity={1} />
				<Chip x={848} y={178} title="1° = 4 dakika" subtitle="doğu ileri, batı geri" focused={hours.focused} opacity={1} />
			</g>
			<g opacity={speed.opacity}>
				<rect x={640} y={262} width={340} height={168} rx={18} fill={palette.surface} stroke={speed.focused > 0.5 ? palette.lesson : palette.border} strokeWidth={speed.focused > 0.5 ? 4 : 2} />
				<text x={658} y={292} fontSize={20} fontWeight={800} fill={palette.ink} fontFamily={palette.fontDisplay}>
					Çizgisel hız
				</text>
				{speedRows.map((row, index) => (
					<text key={row.latitude} x={658} y={326 + index * 30} fontSize={18} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
						{`${row.latitude === 0 ? 'Ekvator' : `${row.latitude}° K`}: ≈ ${row.kmh.toLocaleString('tr-TR')} km/sa`}
					</text>
				))}
				<text x={658} y={414} fontSize={17} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody}>
					Açısal hız her yerde 15°/saat
				</text>
			</g>
		</World>
	);
};

// ---------------------------------------------------------------- pressure belts and prevailing winds

/** One prevailing wind as a curved arrow between two latitudes, bent by the Earth's turning (right in the north). */
const WIND_BELTS: {id: 'alize' | 'bati' | 'kutup'; name: string; from: number; to: number; towardsEast: boolean}[] = [
	{id: 'alize', name: 'Alize', from: 28, to: 4, towardsEast: false},
	{id: 'bati', name: 'Batı rüzgârları', from: 33, to: 57, towardsEast: true},
	{id: 'kutup', name: 'Kutup rüzgârları', from: 80, to: 64, towardsEast: false},
];
const PRESSURE_BELTS: {latitude: number; name: string; high: boolean}[] = [
	{latitude: 0, name: 'Termik alçak (TAB)', high: false},
	{latitude: 30, name: 'Dinamik yüksek (DYB)', high: true},
	{latitude: 60, name: 'Dinamik alçak (DAB)', high: false},
	{latitude: 90, name: 'Termik yüksek (TYB)', high: true},
];

/**
 * The Earth's pressure belts and prevailing winds on a globe seen from the side: TAB at the Equator, DYB at 30°,
 * DAB at 60°, TYB at the poles, with the trade winds, the westerlies and the polar easterlies blowing from high to
 * low pressure and bent to the right in the north, to the left in the south. Parts: basinc, alize, bati, kutup, cephe.
 */
const EarthWinds: React.FC<VisualBoxProps & {visual: Earth}> = ({width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.7);
	const belts = usePartLook('basinc', enter(0));
	const looks = {alize: usePartLook('alize', enter(1)), bati: usePartLook('bati', enter(1.5)), kutup: usePartLook('kutup', enter(2))};
	const front = usePartLook('cephe', enter(2.5));
	const cx = 370;
	const cy = 300;
	const R = 232;
	const yAt = (latitude: number) => cy - R * Math.sin(rad(latitude));
	const halfWidth = (latitude: number) => R * Math.cos(rad(latitude));
	return (
		<World width={width} height={height}>
			<defs>
				<clipPath id={`winds${id}`}>
					<circle cx={cx} cy={cy} r={R} />
				</clipPath>
			</defs>
			<circle cx={cx} cy={cy} r={R} fill={GLOBE.sea} stroke={GLOBE.seaDeep} strokeWidth={3} />
			{/* Pressure belts: high pressure warm-shaded, low pressure cool-shaded, along their latitude. */}
			<g clipPath={`url(#winds${id})`} opacity={belts.opacity}>
				{PRESSURE_BELTS.flatMap((belt) =>
					(belt.latitude === 0 ? [0] : [belt.latitude, -belt.latitude]).map((latitude) => (
						<rect key={`${belt.name}${latitude}`} x={cx - R} y={yAt(latitude) - 14} width={2 * R} height={28} fill={belt.high ? 'rgba(244, 162, 97, 0.8)' : 'rgba(255, 255, 255, 0.4)'} />
					)),
				)}
			</g>
			{/* Winds: arrows from high to low pressure, bent by the turning Earth, flowing. */}
			{WIND_BELTS.flatMap((wind) =>
				[1, -1].map((side) => {
					const look = looks[wind.id];
					const latitudeA = side * wind.from;
					const latitudeB = side * wind.to;
					// Lanes inside the narrower end of the belt, so every arrow stays on the globe.
					const room = Math.min(halfWidth(latitudeA), halfWidth(latitudeB)) - 24;
					const lanes = wind.id === 'kutup' ? [0] : [-0.45, 0.4];
					return lanes.map((lane) => {
						const xCenter = cx + lane * room;
						// In the north the trades and polar winds blow from the north-east (towards the west), the
						// westerlies from the south-west; in the south they mirror across the Equator.
						const drift = (wind.towardsEast ? 1 : -1) * Math.min(64, room * 0.5);
						const x1 = xCenter - drift / 2;
						const x2 = xCenter + drift / 2;
						const y1 = yAt(latitudeA);
						const y2 = yAt(latitudeB);
						const d = `M${x1} ${y1} Q${xCenter + (wind.towardsEast ? -25 : 25)} ${(y1 + y2) / 2} ${x2} ${y2}`;
						const angle = deg(Math.atan2(y2 - (y1 + y2) / 2, x2 - (xCenter + (wind.towardsEast ? -25 : 25))));
						return (
							<g key={`${wind.id}${side}${lane}`} opacity={look.opacity}>
								<path d={d} fill="none" stroke={look.focused > 0.5 ? palette.lesson : '#FFFFFF'} strokeWidth={look.focused > 0.5 ? 7 : 5} strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset={-t * 30} />
								<path d="M12 0 L-8 -10 L-8 10 Z" fill={look.focused > 0.5 ? palette.lesson : '#FFFFFF'} transform={`translate(${x2} ${y2}) rotate(${angle})`} />
							</g>
						);
					});
				}),
			)}
			{/* Fronts at 60°: warm westerlies meet cold polar air and rise. */}
			<g opacity={front.opacity}>
				{[60, -60].map((latitude) => (
					<g key={latitude}>
						{Array.from({length: 5}, (_, index) => {
							const x = cx - halfWidth(latitude) * 0.7 + index * halfWidth(latitude) * 0.35;
							return <path key={index} d={`M${x - 10} ${yAt(latitude) + 8} L${x} ${yAt(latitude) - 10} L${x + 10} ${yAt(latitude) + 8} Z`} fill={front.focused > 0.5 ? palette.lesson : '#2C3E50'} />;
						})}
					</g>
				))}
			</g>
			{/* Belt names on the right, at their latitudes. */}
			<g opacity={belts.opacity}>
				{PRESSURE_BELTS.map((belt) => {
					const y = belt.latitude === 90 ? cy - R - 6 : yAt(belt.latitude);
					return (
						<g key={belt.name}>
							<line x1={cx + halfWidth(belt.latitude) + 6} y1={y} x2={cx + R + 30} y2={y} stroke={palette.muted} strokeWidth={1.5} strokeDasharray="4 4" />
							<Tag x={cx + R + 38} y={y} text={`${belt.latitude}° · ${belt.name}`} size={19} focused={belts.focused} />
						</g>
					);
				})}
			</g>
			{/* Wind names on the left. */}
			{WIND_BELTS.map((wind) => {
				const look = looks[wind.id];
				const y = yAt((wind.from + wind.to) / 2);
				return (
					<g key={wind.id} opacity={look.opacity}>
						<Tag x={10} y={y} text={wind.name} size={20} focused={look.focused} />
					</g>
				);
			})}
			<g opacity={front.opacity}>
				<Tag x={cx + R + 38} y={yAt(60) + 30} text="60°'de cephe yağışları" size={18} focused={front.focused} />
			</g>
		</World>
	);
};
