import React, {useMemo} from 'react';
import * as THREE from 'three';
import {smooth} from '../../../Animations/Motion';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {Face, Frame3D, frame3DBands, polygon, projector, rect, Vec3} from './Frame3D';

type Solid = Extract<CourseVisual, {kind: 'solid'}>;

// ---------------------------------------------------------------- solids

type Net = (open: number, colours: {face: string; alt: string; edge: string}) => React.ReactNode;

/**
 * Nets built as hinged faces: the base stays, each face turns about its
 * hinge from standing (open = 0) to lying flat (open = 1).
 */
const cuboidNet = (a: number, b: number, c: number): Net => (open, {face, alt, edge}) => {
	const fold = (Math.PI / 2) * (1 - open);
	return (
		<group>
			<Face shape={rect(-a / 2, a / 2, -b / 2, b / 2)} colour={face} edge={edge} />
			<group position={[0, 0, b / 2]} rotation={[-fold, 0, 0]}>
				<Face shape={rect(-a / 2, a / 2, 0, c)} colour={alt} edge={edge} />
			</group>
			<group position={[0, 0, -b / 2]} rotation={[fold, 0, 0]}>
				<Face shape={rect(-a / 2, a / 2, -c, 0)} colour={alt} edge={edge} />
				<group position={[0, 0, -c]} rotation={[fold, 0, 0]}>
					<Face shape={rect(-a / 2, a / 2, -b, 0)} colour={face} edge={edge} />
				</group>
			</group>
			<group position={[a / 2, 0, 0]} rotation={[0, 0, fold]}>
				<Face shape={rect(0, c, -b / 2, b / 2)} colour={face} edge={edge} />
			</group>
			<group position={[-a / 2, 0, 0]} rotation={[0, 0, -fold]}>
				<Face shape={rect(-c, 0, -b / 2, b / 2)} colour={face} edge={edge} />
			</group>
		</group>
	);
};

/** Triangular prism of length `l` with an equilateral cross-section of side `s`, lying on a rectangular face. */
const prismNet = (l: number, s: number): Net => (open, {face, alt, edge}) => {
	const sideFold = ((2 * Math.PI) / 3) * (1 - open);
	const endFold = (Math.PI / 2) * (1 - open);
	const h = (Math.sqrt(3) / 2) * s;
	return (
		<group>
			<Face shape={rect(-l / 2, l / 2, -s / 2, s / 2)} colour={face} edge={edge} />
			<group position={[0, 0, s / 2]} rotation={[-sideFold, 0, 0]}>
				<Face shape={rect(-l / 2, l / 2, 0, s)} colour={alt} edge={edge} />
			</group>
			<group position={[0, 0, -s / 2]} rotation={[sideFold, 0, 0]}>
				<Face shape={rect(-l / 2, l / 2, -s, 0)} colour={alt} edge={edge} />
			</group>
			<group position={[l / 2, 0, 0]} rotation={[0, 0, endFold]}>
				<Face shape={polygon([[0, -s / 2], [h, 0], [0, s / 2]])} colour={face} edge={edge} />
			</group>
			<group position={[-l / 2, 0, 0]} rotation={[0, 0, -endFold]}>
				<Face shape={polygon([[0, -s / 2], [-h, 0], [0, s / 2]])} colour={face} edge={edge} />
			</group>
		</group>
	);
};

/** Square pyramid with base side `a` and height `h`: four triangles hinged on the base. */
const pyramidNet = (a: number, h: number): Net => (open, {face, alt, edge}) => {
	const slant = Math.hypot(h, a / 2);
	const dihedral = Math.atan2(h, a / 2);
	const fold = (Math.PI - dihedral) * (1 - open);
	const triangle = (sign: number) => polygon([[-a / 2, 0], [a / 2, 0], [0, sign * slant]]);
	return (
		<group>
			<Face shape={rect(-a / 2, a / 2, -a / 2, a / 2)} colour={face} edge={edge} />
			<group position={[0, 0, a / 2]} rotation={[-fold, 0, 0]}>
				<Face shape={triangle(1)} colour={alt} edge={edge} />
			</group>
			<group position={[0, 0, -a / 2]} rotation={[fold, 0, 0]}>
				<Face shape={triangle(-1)} colour={alt} edge={edge} />
			</group>
			<group position={[a / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
				<group rotation={[-fold, 0, 0]}>
					<Face shape={triangle(1)} colour={face} edge={edge} />
				</group>
			</group>
			<group position={[-a / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
				<group rotation={[-fold, 0, 0]}>
					<Face shape={triangle(1)} colour={face} edge={edge} />
				</group>
			</group>
		</group>
	);
};

/**
 * Cylinder of radius r and height h as a ring of narrow panels: closed they
 * stand round; opening, each panel turns flat after the previous one, so the
 * side unrolls into a standing rectangle 2πr × h, with a lid hinged on its
 * lower and its upper edge.
 */
const cylinderNet = (r: number, h: number): Net => (open, {face, alt, edge}) => {
	const panels = 28;
	const width = (2 * Math.PI * r) / panels;
	const turn = ((2 * Math.PI) / panels) * (1 - open);
	const disc = new THREE.Shape();
	disc.absarc(0, 0, r, 0, Math.PI * 2, false);
	// Panels stand in the XY plane along +x, each hinged on the previous one's far edge; turning about y bends the strip into a ring.
	const chain = (index: number): React.ReactNode => {
		if (index >= panels) return null;
		return (
			<group position={[index === 0 ? 0 : width, 0, 0]} rotation={[0, index === 0 ? 0 : turn, 0]}>
				<group rotation={[Math.PI / 2, 0, 0]}>
					<Face shape={rect(0, width, -h, 0)} colour={face} edge={face} opacity={0.95} />
				</group>
				{chain(index + 1)}
			</group>
		);
	};
	// Lids: closed they lie flat across the ring (towards -z); open they hang below and above the rectangle.
	const lids = (
		<>
			<group position={[width / 2, 0, 0]} rotation={[-(Math.PI / 2) * open, 0, 0]}>
				<group position={[0, 0, -r]}>
					<Face shape={disc} colour={alt} edge={edge} />
				</group>
			</group>
			<group position={[width / 2, h, 0]} rotation={[(Math.PI / 2) * open, 0, 0]}>
				<group position={[0, 0, -r]}>
					<Face shape={disc} colour={alt} edge={edge} />
				</group>
			</group>
		</>
	);
	// Centred: the ring's axis while closed, the rectangle's middle once open.
	const centreX = width / 2 + (Math.PI * r - width / 2) * open;
	return (
		<group position={[-centreX, -h / 2, r * (1 - open)]}>
			{chain(0)}
			{lids}
		</group>
	);
};

/**
 * Where the cone's side is while it unrolls: `base` are the points of the base circle (closed) moving to the arc of
 * the flat sector (open), `apex` the tip moving to the sector's centre, `disc` the base disc's centre. The sector has
 * radius ℓ = √(r² + h²) and angle 2πr/ℓ; the disc touches the middle of its arc. Everything lies in y = 0 once open,
 * centred on the origin.
 */
export const coneNetPoints = (r: number, h: number, open: number, panels = 48) => {
	const slant = Math.hypot(r, h);
	const sector = (2 * Math.PI * r) / slant;
	// The sector's middle points towards +z (the viewer once the net lies flat); the seam stays at the back.
	const middle = Math.PI / 2;
	const length = slant + 2 * r;
	const centre: Vec3 = [0, 0, -length / 2 + Math.max(0, -Math.cos(sector / 2)) * slant / 2];
	const lerp = (a: Vec3, b: Vec3): Vec3 => [a[0] + (b[0] - a[0]) * open, a[1] + (b[1] - a[1]) * open, a[2] + (b[2] - a[2]) * open];
	const base = Array.from({length: panels + 1}, (_, index): Vec3 => {
		const closedAngle = middle + Math.PI + (2 * Math.PI * index) / panels;
		const openAngle = middle - sector / 2 + (sector * index) / panels;
		return lerp([r * Math.cos(closedAngle), 0, -r * Math.sin(closedAngle)], [centre[0] + slant * Math.cos(openAngle), 0, centre[2] + slant * Math.sin(openAngle)]);
	});
	return {
		base,
		apex: lerp([0, h, 0], centre),
		disc: lerp([0, 0, 0], [centre[0], 0, centre[2] + slant + r]),
		slant,
		sector,
	};
};

/** The cone's side as a fan of thin triangles that unrolls into its sector, with the base disc beside the arc. */
const ConeNet: React.FC<{r: number; h: number; open: number; face: string; alt: string; edge: string}> = ({r, h, open, face, alt, edge}) => {
	const points = coneNetPoints(r, h, open);
	const geometry = useMemo(() => {
		const positions: number[] = [];
		for (let index = 0; index + 1 < points.base.length; index++) positions.push(...points.apex, ...points.base[index], ...points.base[index + 1]);
		const built = new THREE.BufferGeometry();
		built.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		built.computeVertexNormals();
		return built;
	}, [points.apex, points.base]);
	const disc = useMemo(() => {
		const shape = new THREE.Shape();
		shape.absarc(0, 0, r, 0, Math.PI * 2, false);
		return shape;
	}, [r]);
	return (
		<group>
			<mesh geometry={geometry}>
				<meshStandardMaterial color={face} side={THREE.DoubleSide} transparent opacity={0.92} roughness={0.6} />
			</mesh>
			<group position={points.disc}>
				<Face shape={disc} colour={alt} edge={edge} />
			</group>
		</group>
	);
};

const coneNet = (r: number, h: number): Net => (open, colours) => <ConeNet r={r} h={h} open={open} {...colours} />;

const SHAPE_NAMES: Record<Solid['shape'], string> = {
	cube: 'Küp',
	cuboid: 'Dikdörtgenler prizması',
	triangularPrism: 'Üçgen prizma',
	squarePyramid: 'Kare dik piramit',
	cylinder: 'Dik silindir',
	cone: 'Dik koni',
	sphere: 'Küre',
};

/** The solids with edges show "edges and faces"; the round ones show their measures. */
const MEASURE_STAGE: Record<Solid['shape'], string> = {
	cube: 'Ayrıtlar ve yüzler',
	cuboid: 'Ayrıtlar ve yüzler',
	triangularPrism: 'Ayrıtlar ve yüzler',
	squarePyramid: 'Ayrıtlar ve yüzler',
	cylinder: 'Ölçüler',
	cone: 'Ölçüler',
	sphere: 'Ölçüler',
};

/** The angle (about y) the solid settles at to have its measures written on it: its front and right faces towards the viewer. */
const VIEW_ANGLE = -0.6;

/** Sizes in scene units: the solid's proportions from `size`, scaled so its largest extent is what the defaults use. */
export const solidSize = (visual: Pick<Solid, 'shape' | 'size'>) => {
	const [p, q, r] = visual.size ?? [];
	const fit = (largest: number, ...extents: number[]) => largest / Math.max(...extents);
	switch (visual.shape) {
		case 'cuboid': {
			if (p === undefined || q === undefined || r === undefined) return {a: 2.2, b: 1.3, c: 1.1};
			const k = fit(2.2, p, q, r);
			return {a: p * k, b: q * k, c: r * k};
		}
		case 'cylinder':
		case 'cone': {
			const [radius, height] = p !== undefined && q !== undefined ? [p, q] : visual.shape === 'cylinder' ? [0.75, 1.8] : [0.9, 1.8];
			const k = p !== undefined && q !== undefined ? fit(1.8, 2 * radius, height) : 1;
			return {r: radius * k, h: height * k};
		}
		case 'squarePyramid': {
			const [side, height] = p !== undefined && q !== undefined ? [p, q] : [1.8, 1.6];
			const k = p !== undefined && q !== undefined ? fit(1.8, side, height) : 1;
			return {a: side * k, h: height * k};
		}
		default:
			return {};
	}
};

type MeasureMark = {from?: Vec3; to?: Vec3; at: Vec3; label?: string; dashed?: boolean; side: 'out' | 'left' | 'right' | 'above' | 'below' | 'normal'};

/** A direction in the solid's own frame that points `degrees` from the viewer's right towards the viewer once it has settled. */
const facing = (degrees: number, length: number, y: number): Vec3 => {
	const [wx, wz] = [Math.cos((degrees * Math.PI) / 180), Math.sin((degrees * Math.PI) / 180)];
	return [length * (wx * Math.cos(VIEW_ANGLE) - wz * Math.sin(VIEW_ANGLE)), y, length * (wx * Math.sin(VIEW_ANGLE) + wz * Math.cos(VIEW_ANGLE))];
};

/**
 * The measures written on a solid, in its own frame (standing on y = 0; the cylinder centred on its axis):
 * edges are named at their middle; radii, heights, slant heights and the body diagonal are drawn as lines,
 * dashed where they run inside.
 */
export const solidMarks = (visual: Pick<Solid, 'shape' | 'size' | 'dimensions' | 'diagonal'>): MeasureMark[] => {
	const [first, second, third] = visual.dimensions;
	const size = solidSize(visual);
	const marks: (MeasureMark | false | undefined | '')[] = [];
	switch (visual.shape) {
		case 'cube':
		case 'cuboid': {
			const {a, b, c} = visual.shape === 'cube' ? {a: 1.6, b: 1.6, c: 1.6} : (size as {a: number; b: number; c: number});
			const [la, lb, lc] = visual.shape === 'cube' ? [first, first, first] : [first, second, third];
			marks.push(
				la && {at: [0, 0, b / 2], label: la, side: 'out'},
				lb && {at: [a / 2, 0, 0], label: lb, side: 'out'},
				lc && {at: [-a / 2, c / 2, b / 2], label: lc, side: 'left'},
				visual.diagonal && {from: [-a / 2, 0, b / 2], to: [a / 2, c, -b / 2], at: [a * 0.2, c * 0.7, -b * 0.2], label: visual.diagonal, dashed: true, side: 'normal'},
			);
			break;
		}
		case 'cylinder': {
			const {r, h} = size as {r: number; h: number};
			const rim = facing(-30, r, h / 2);
			marks.push(
				first && {from: [0, h / 2, 0], to: rim, at: [rim[0] / 2, h / 2, rim[2] / 2], label: first, side: 'normal'},
				second && {at: facing(0, r, 0), label: second, side: 'right'},
			);
			break;
		}
		case 'cone': {
			const {r, h} = size as {r: number; h: number};
			const rim = facing(0, r, 0);
			marks.push(
				first && {from: [0, 0, 0], to: rim, at: [rim[0] / 2, 0, rim[2] / 2], label: first, dashed: true, side: 'below'},
				second && {from: [0, h, 0], to: [0, 0, 0], at: [0, h / 2, 0], label: second, dashed: true, side: 'left'},
				third && {from: [0, h, 0], to: rim, at: [rim[0] / 2, h / 2, rim[2] / 2], label: third, side: 'out'},
			);
			break;
		}
		case 'squarePyramid': {
			const {a, h} = size as {a: number; h: number};
			marks.push(
				first && {at: [0, 0, a / 2], label: first, side: 'out'},
				// h, half the base and the side faces' height h′ (on the right face) make the right triangle the lesson is about.
				second && {from: [0, h, 0], to: [0, 0, 0], at: [0, h * 0.45, 0], label: second, dashed: true, side: 'left'},
				third && {from: [0, 0, 0], to: [a / 2, 0, 0], at: [a / 4, 0, 0], dashed: true, side: 'below'},
				third && {from: [0, h, 0], to: [a / 2, 0, 0], at: [a / 4, h / 2, 0], label: third, side: 'out'},
			);
			break;
		}
		case 'sphere': {
			const end = facing(0, 1, 1);
			marks.push(first && {from: [0, 1, 0], to: end, at: [end[0] / 2, 1, end[2] / 2], label: first, dashed: true, side: 'above'});
			break;
		}
		default:
			break;
	}
	return marks.filter((mark): mark is MeasureMark => Boolean(mark));
};

/** How tall the closed solid stands, so it can be centred. */
const solidHeight = (visual: Solid) => {
	const size = solidSize(visual);
	switch (visual.shape) {
		case 'cube':
			return 1.6;
		case 'cuboid':
			return (size as {c: number}).c;
		case 'squarePyramid':
		case 'cone':
			return (size as {h: number}).h;
		case 'sphere':
			return 2;
		case 'triangularPrism':
			return (Math.sqrt(3) / 2) * 1.5;
		default:
			return 0;
	}
};

/** Half the diagonal of the closed solid's box, and the half width and half height of its open net as the camera sees it. */
const solidExtents = (visual: Solid) => {
	const size = solidSize(visual);
	const box = (x: number, y: number, z: number) => Math.hypot(x, y, z) / 2;
	switch (visual.shape) {
		case 'cube':
			return {radius: box(1.6, 1.6, 1.6), net: [1.6 / 2 + 1.6, 1.6 + 1.6]};
		case 'cuboid': {
			const {a, b, c} = size as {a: number; b: number; c: number};
			return {radius: box(a, b, c), net: [a / 2 + c, b + c]};
		}
		case 'triangularPrism':
			return {radius: box(2.2, 1.3, 1.5), net: [1.1 + 1.3, 2.25]};
		case 'squarePyramid': {
			const {a, h} = size as {a: number; h: number};
			const slant = Math.hypot(h, a / 2);
			return {radius: box(a, h, a), net: [a / 2 + slant, a / 2 + slant]};
		}
		case 'cylinder': {
			const {r, h} = size as {r: number; h: number};
			return {radius: box(2 * r, h, 2 * r), net: [Math.PI * r, h / 2 + 2 * r]};
		}
		case 'cone': {
			const {r, h} = size as {r: number; h: number};
			const slant = Math.hypot(r, h);
			return {radius: box(2 * r, h, 2 * r), net: [slant, slant / 2 + r + slant / 2]};
		}
		default:
			return {radius: 1, net: [1, 1]};
	}
};

/** How far the camera stands so a half extent fills `share` of the canvas's half height (fov 40). */
const cameraDistance = (halfWidth: number, halfHeight: number, aspect: number, share: number) => Math.max(halfHeight, halfWidth / aspect) / (share * Math.tan((20 * Math.PI) / 180));

const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

/**
 * A solid turning slowly so its depth reads; then it settles with its front and right faces to the viewer and
 * its measures are written on it; with `unfold` it then opens into its net and turns to lie flat under the
 * camera.
 */
export const SolidVisual: React.FC<VisualBoxProps & {visual: Solid}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const unfolds = visual.unfold && visual.shape !== 'sphere';
	const names = unfolds ? ['Cisim', MEASURE_STAGE[visual.shape], 'Açınım'] : ['Cisim', MEASURE_STAGE[visual.shape]];
	const clock = useStageClock(names.length, {delaySeconds, secondsPerStage: 3.5});
	const {stage, progress} = clock;
	const open = stage === 2 ? smooth(progress * 1.3) : 0;
	// While it opens it comes to face the viewer: from above for nets that lie flat, from the front for the cylinder's standing one.
	const standingNet = visual.shape === 'cylinder';
	const turned = (at: number) => (at - delaySeconds) * 0.45;
	const settle = stage === 0 ? 0 : stage === 1 ? smooth(clock.seconds / 1.2) : 1;
	const settleFrom = turned(seconds - clock.seconds);
	const spin = stage === 0 ? turned(seconds) : stage === 1 ? settleFrom + wrapAngle(VIEW_ANGLE - settleFrom) * settle : VIEW_ANGLE * (1 - open);
	const pitch = standingNet ? 0.45 * (1 - open) + 0.05 * open : 0.55 + (Math.PI / 2 - 0.55) * open;
	const colours = {face: palette.lesson, alt: palette.brand, edge: '#1F2937'};
	const size = solidSize(visual);
	const net: Net | null = {
		cube: cuboidNet(1.6, 1.6, 1.6),
		cuboid: cuboidNet((size as {a: number}).a, (size as {b: number}).b, (size as {c: number}).c),
		triangularPrism: prismNet(2.2, 1.5),
		squarePyramid: pyramidNet((size as {a: number}).a, (size as {h: number}).h),
		cylinder: cylinderNet((size as {r: number}).r, (size as {h: number}).h),
		cone: coneNet((size as {r: number}).r, (size as {h: number}).h),
		sphere: null,
	}[visual.shape];
	const marks = solidMarks(visual);
	// The measures are on the figure; the caption only names the solid (the prism keeps them in the caption).
	const caption = stage >= 1 && visual.dimensions.length && marks.length === 0 ? `${SHAPE_NAMES[visual.shape]} · ${visual.dimensions.join(' · ')}` : SHAPE_NAMES[visual.shape];
	// Solids stand on their base (y = 0); lift them so they are centred, and centre the flat nets.
	const lift = (-solidHeight(visual) / 2) * (1 - open);
	const {strip, captionHeight} = frame3DBands(u);
	const canvas = {width: Math.round(width), height: Math.round(height - strip - captionHeight)};
	// The camera stands as close as the solid allows (it filled a third of its box at a fixed distance), and steps back for the net.
	const extents = solidExtents(visual);
	const aspect = canvas.width / canvas.height;
	const closedDistance = cameraDistance(extents.radius, extents.radius, aspect, 0.72);
	const openDistance = cameraDistance(extents.net[0], extents.net[1], aspect, 0.9);
	const distance = closedDistance + (Math.max(closedDistance, openDistance) - closedDistance) * open;
	// The cuboid's net hangs off its base towards -z by half the base's depth; centre it while it opens.
	const netShift = visual.shape === 'cube' ? 0.8 : visual.shape === 'cuboid' ? (size as {b: number}).b / 2 : 0;
	const project = projector(canvas.width, canvas.height, distance, pitch, lift, spin);
	const centre = project([0, standingNet ? 0 : solidHeight(visual) / 2, 0]);
	// The measures come once the solid has stopped turning, so they do not slide over it.
	const shown = (stage === 1 ? smooth((clock.seconds - 1.1) / 0.5) : stage > 1 ? 1 : 0) * (1 - Math.min(1, open * 4));
	const fontSize = u(32);
	const gap = u(22);
	const ink = palette.ink;

	const overlay =
		shown > 0 && marks.length ? (
			<g opacity={shown} fontFamily={palette.fontBody} fontWeight={800} fontSize={fontSize}>
				{marks.map((mark, index) => {
					const line = mark.from && mark.to ? [project(mark.from), project(mark.to)] : undefined;
					const [ax, ay] = project(mark.at);
					let [dx, dy] = [0, 0];
					if (mark.side === 'out') {
						const length = Math.hypot(ax - centre[0], ay - centre[1]) || 1;
						[dx, dy] = [(ax - centre[0]) / length, (ay - centre[1]) / length];
					} else if (mark.side === 'normal' && line) {
						const [[x1, y1], [x2, y2]] = line;
						const length = Math.hypot(x2 - x1, y2 - y1) || 1;
						[dx, dy] = [-(y2 - y1) / length, (x2 - x1) / length];
						if (dy > 0) [dx, dy] = [-dx, -dy];
					} else {
						[dx, dy] = {left: [-1, 0], right: [1, 0], above: [0, -1], below: [0, 1], out: [0, 0], normal: [0, -1]}[mark.side] as [number, number];
					}
					const anchor = dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle';
					const [tx, ty] = [ax + dx * gap, ay + dy * gap + fontSize * (dy > 0.35 ? 0.8 : dy < -0.35 ? 0 : 0.35)];
					return (
						<g key={index}>
							{/* White with a dark rim: it reads on the blue and the orange faces and over the dark edges. */}
							{line
								? [
										<line key="rim" x1={line[0][0]} y1={line[0][1]} x2={line[1][0]} y2={line[1][1]} stroke={ink} strokeOpacity={0.7} strokeWidth={u(9)} strokeDasharray={mark.dashed ? `${u(14)} ${u(10)}` : undefined} strokeLinecap="butt" />,
										<line key="core" x1={line[0][0]} y1={line[0][1]} x2={line[1][0]} y2={line[1][1]} stroke="#FFFFFF" strokeWidth={u(4.5)} strokeDasharray={mark.dashed ? `${u(14)} ${u(10)}` : undefined} strokeLinecap="butt" />,
									]
								: null}
							{mark.label ? (
								<text x={tx} y={ty} textAnchor={anchor} fill={ink} stroke={palette.surface} strokeWidth={u(7)} paintOrder="stroke">
									{mark.label}
								</text>
							) : null}
						</g>
					);
				})}
			</g>
		) : null;

	return (
		<Frame3D width={width} height={height} names={names} stage={stage} caption={caption} distance={distance} pitch={pitch} overlay={overlay}>
			<group position={[0, lift, netShift * open]} rotation={[0, spin, 0]}>
				{net ? (
					net(open, colours)
				) : (
					<mesh position={[0, 1, 0]}>
						<sphereGeometry args={[1, 48, 32]} />
						<meshStandardMaterial color={palette.lesson} roughness={0.5} transparent opacity={0.9} />
					</mesh>
				)}
			</group>
		</Frame3D>
	);
};
