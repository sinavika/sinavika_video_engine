import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {smooth} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {figureText} from '../FigureLabel';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {COMPACT_HEIGHT, Face, Frame3D, polygon, projector, rect, SolidMaterial, useFrame3DBands, Vec3} from './Frame3D';

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

/** The pyramids drawn, by the number of their base's sides: all right pyramids on a regular base (düzgün piramit). */
const PYRAMID_SIDES = {triangularPyramid: 3, squarePyramid: 4, hexagonalPyramid: 6} as const;

/** The angle (about y) the solid settles at to have its measures written on it: its front and right faces towards the viewer. */
const VIEW_ANGLE = -0.6;

/**
 * A right pyramid on a regular n-gon of side `a` with height `h`, standing on y = 0 with its apex over the base's
 * centre. Angles are taken in the xz plane from +x towards +z (the viewer). `edgeAngles[k]` points to the middle of base
 * edge k, at the apothem; edge 0 is the front one, named with `a`. The square keeps its front edge facing +z; the
 * triangle turns so that, settled, two faces lean to the viewer and a corner points at them. `slantFace` is the face
 * that carries h′ (the visible one nearest the front right once settled) and `edgeCorner` the corner left of edge 0,
 * where the lateral edge is drawn (the left outline of the settled pyramid).
 */
export const regularPyramid = (sides: number, a: number, h: number) => {
	const apothem = a / (2 * Math.tan(Math.PI / sides));
	const radius = a / (2 * Math.sin(Math.PI / sides));
	const first = sides === 3 ? (5 * Math.PI) / 6 + VIEW_ANGLE : Math.PI / 2;
	const edgeAngles = Array.from({length: sides}, (_, k) => first - (2 * Math.PI * k) / sides);
	const corners = edgeAngles.map((angle): Vec3 => [radius * Math.cos(angle + Math.PI / sides), 0, radius * Math.sin(angle + Math.PI / sides)]);
	// Settled, the solid has turned by -VIEW_ANGLE: an angle θ in its own frame faces θ - VIEW_ANGLE.
	const settled = (angle: number) => Math.atan2(Math.sin(angle - VIEW_ANGLE), Math.cos(angle - VIEW_ANGLE));
	const slantFace = edgeAngles
		.map((angle, k) => ({k, off: Math.abs(settled(angle) - Math.PI / 4), seen: Math.sin(settled(angle)) > 0}))
		.filter((face) => face.seen)
		.sort((p, q) => p.off - q.off)[0].k;
	return {apothem, radius, slant: Math.hypot(h, apothem), edgeAngles, corners, slantFace, edgeCorner: corners[0]};
};

/** A pyramid on a regular base: the base, and a triangle hinged on each base edge that folds up to the apex. */
const pyramidNet = (sides: number, a: number, h: number): Net => (open, {face, alt, edge}) => {
	const {apothem, slant, edgeAngles, corners} = regularPyramid(sides, a, h);
	const fold = (Math.PI - Math.atan2(h, apothem)) * (1 - open);
	const triangle = polygon([[-a / 2, 0], [a / 2, 0], [0, slant]]);
	const tone = (k: number) => (sides % 2 === 1 && k === sides - 1 ? mixColors(face, alt, 0.5) : k % 2 === 0 ? alt : face);
	return (
		<group>
			<Face shape={polygon(corners.map(([x, , z]) => [x, z]))} colour={face} edge={edge} />
			{edgeAngles.map((angle, k) => (
				// Each triangle stands on its edge's middle, its own +z turned outwards, and folds up about the edge.
				<group key={k} position={[apothem * Math.cos(angle), 0, apothem * Math.sin(angle)]} rotation={[0, Math.atan2(Math.cos(angle), Math.sin(angle)), 0]}>
					<group rotation={[-fold, 0, 0]}>
						<Face shape={triangle} colour={tone(k)} edge={edge} />
					</group>
				</group>
			))}
		</group>
	);
};

/**
 * A cube of side `s` (standing on y = 0, centred on the y axis) as the three equal pyramids it is made of: all three
 * share the bottom back left corner as their apex, and each stands on one of the three faces that do not meet there:
 * the top, the right (+x) and the front (+z), the three faces the settled cube shows. Coming apart, each moves out
 * along its base's outward `normal`: up, to the front right and to the front left on screen, each base square in full
 * view (with the apex at the top back corner the pieces slid over one another and the bottom one was hidden, KPSS
 * Geometri 13, 1 Nov 2026). Each is a square pyramid with base s² and height s, so each holds s³ / 3: why a pyramid
 * is a third of the prism on the same base.
 */
export const cubePyramids = (s: number): {apex: Vec3; base: Vec3[]; normal: Vec3}[] => {
	const half = s / 2;
	const apex: Vec3 = [-half, 0, -half];
	const pieces: {base: Vec3[]; normal: Vec3}[] = [
		{base: [[-half, s, -half], [half, s, -half], [half, s, half], [-half, s, half]], normal: [0, 1, 0]},
		{base: [[half, 0, -half], [half, s, -half], [half, s, half], [half, 0, half]], normal: [1, 0, 0]},
		{base: [[-half, 0, half], [half, 0, half], [half, s, half], [-half, s, half]], normal: [0, 0, 1]},
	];
	return pieces.map((piece) => ({apex, ...piece}));
};

/**
 * A solid given as flat faces (each a convex polygon in 3D), in one colour, with its outline: the edges where two
 * faces meet at more than 20° and the edges of only one face. The panels of a curved surface (a cylinder's side, a
 * sphere's band) meet at a few degrees, so their seams stay hidden and only the rims are drawn.
 */
const MeshSolid: React.FC<{faces: readonly Vec3[][]; colour: string; edge: string; opacity?: number}> = ({faces, colour, edge, opacity}) => {
	const geometry = useMemo(() => {
		const positions: number[] = [];
		for (const face of faces) for (let k = 1; k + 1 < face.length; k++) positions.push(...face[0], ...face[k], ...face[k + 1]);
		const built = new THREE.BufferGeometry();
		built.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		built.computeVertexNormals();
		return built;
	}, [faces]);
	const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 20), [geometry]);
	// A sweeping solid builds new faces every frame; the old buffers are let go.
	useEffect(() => () => {
		geometry.dispose();
		edges.dispose();
	}, [geometry, edges]);
	return (
		<group>
			<mesh geometry={geometry}>
				<SolidMaterial colour={colour} opacity={opacity} />
			</mesh>
			<lineSegments geometry={edges}>
				<lineBasicMaterial color={edge} />
			</lineSegments>
		</group>
	);
};

/** A pyramid's faces: its base, and a triangle to the apex on every base edge. */
const pyramidFaces = (apex: Vec3, base: Vec3[]): Vec3[][] => [base, ...base.map((corner, k) => [corner, base[(k + 1) % base.length], apex])];

/** A point of a profile (distance from the axis, height) turned by `angle` about the y axis (from +x towards +z). */
const turnAbout = ([rho, y]: readonly [number, number], angle: number): Vec3 => [rho * Math.cos(angle), y, rho * Math.sin(angle)];

/**
 * The faces a profile sweeps as it turns about the y axis from `start` through `angle`: every profile segment off the
 * axis leaves a band of narrow panels (a triangle fan where one end is on the axis). A rectangle beside the axis sweeps
 * a cylinder, a right triangle on it a cone, a half disc a sphere: a solid of revolution (dönel cisim).
 */
export const revolvedFaces = (profile: readonly (readonly [number, number])[], start: number, angle: number, panels = 48): Vec3[][] => {
	const steps = Math.max(1, Math.ceil((panels * Math.abs(angle)) / (2 * Math.PI)));
	const at = (step: number) => start + (angle * step) / steps;
	const faces: Vec3[][] = [];
	for (let index = 0; index + 1 < profile.length; index++) {
		const [p, q] = [profile[index], profile[index + 1]];
		if (p[0] === 0 && q[0] === 0) continue;
		for (let step = 0; step < steps; step++) {
			const [a, b] = [at(step), at(step + 1)];
			if (p[0] === 0) faces.push([turnAbout(p, a), turnAbout(q, a), turnAbout(q, b)]);
			else if (q[0] === 0) faces.push([turnAbout(p, a), turnAbout(q, a), turnAbout(p, b)]);
			else faces.push([turnAbout(p, a), turnAbout(q, a), turnAbout(q, b), turnAbout(p, b)]);
		}
	}
	return faces;
};

/** The profile that sweeps a solid of revolution, beside the axis in the solid's own frame (see `solidHeight` for where each stands). */
export const sweepProfile = (visual: Pick<Solid, 'shape' | 'size'>): [number, number][] | null => {
	const size = solidSize(visual);
	switch (visual.shape) {
		case 'cylinder': {
			// The cylinder is drawn centred on its middle (y from -h/2 to h/2).
			const {r, h} = size as {r: number; h: number};
			return [[0, -h / 2], [r, -h / 2], [r, h / 2], [0, h / 2]];
		}
		case 'cone': {
			const {r, h} = size as {r: number; h: number};
			return [[0, 0], [r, 0], [0, h]];
		}
		case 'sphere':
			return Array.from({length: 25}, (_, k) => [Math.sin((Math.PI * k) / 24), 1 - Math.cos((Math.PI * k) / 24)] as [number, number]).map(([x, y]) => [Math.abs(x) < 1e-9 ? 0 : x, y]);
		default:
			return null;
	}
};

/**
 * A half cylinder of radius r and length l lying on its flat face (a block of butter cut along its axis): its axis
 * runs along x at y = 0, the curved side above. `curved` are the side's panels, `flat` the cut rectangle and the two
 * half discs at the ends.
 */
export const halfCylinderFaces = (r: number, l: number, panels = 24): {curved: Vec3[][]; flat: Vec3[][]} => {
	const arc = Array.from({length: panels + 1}, (_, k) => (Math.PI * k) / panels);
	const rim = (x: number, angle: number): Vec3 => [x, r * Math.sin(angle), r * Math.cos(angle)];
	const curved = arc.slice(0, -1).map((angle, k) => [rim(-l / 2, angle), rim(l / 2, angle), rim(l / 2, arc[k + 1]), rim(-l / 2, arc[k + 1])]);
	const end = (x: number) => arc.map((angle) => rim(x, angle));
	return {curved, flat: [[[-l / 2, 0, r], [l / 2, 0, r], [l / 2, 0, -r], [-l / 2, 0, -r]], end(l / 2), end(-l / 2)]};
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
				<SolidMaterial colour={face} />
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
	triangularPyramid: 'Üçgen dik piramit',
	squarePyramid: 'Kare dik piramit',
	hexagonalPyramid: 'Altıgen dik piramit',
	cylinder: 'Dik silindir',
	cone: 'Dik koni',
	sphere: 'Küre',
	halfCylinder: 'Yarım silindir',
};

/** The solids with edges show "edges and faces"; the round ones show their measures. */
const MEASURE_STAGE: Record<Solid['shape'], string> = {
	cube: 'Ayrıtlar ve yüzler',
	cuboid: 'Ayrıtlar ve yüzler',
	triangularPrism: 'Ayrıtlar ve yüzler',
	triangularPyramid: 'Ayrıtlar ve yüzler',
	squarePyramid: 'Ayrıtlar ve yüzler',
	hexagonalPyramid: 'Ayrıtlar ve yüzler',
	cylinder: 'Ölçüler',
	cone: 'Ölçüler',
	sphere: 'Ölçüler',
	halfCylinder: 'Ölçüler',
};

/**
 * A solid's colours, all from the lesson colour: light faces, a stronger tint for the bases (or the faces a net pairs
 * up), and edges in the lesson colour's dark shade, as the flat figures draw a light fill with lesson-colour sides.
 * The bases were brand orange and the edges near-black: under the lights an AYT pyramid came out rust and navy, two
 * colours the lesson did not use anywhere else (KPSS Geometri 12, 1 Nov 2026).
 */
export const solidColours = (lesson: string) => ({face: mixColors(lesson, '#FFFFFF', 0.7), alt: mixColors(lesson, '#FFFFFF', 0.48), edge: mixColors(lesson, '#000000', 0.3)});

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
		case 'halfCylinder': {
			const [radius, length] = p !== undefined && q !== undefined ? [p, q] : [0.8, 2.4];
			const k = p !== undefined && q !== undefined ? fit(2.4, 2 * radius, length) : 1;
			return {r: radius * k, h: length * k};
		}
		case 'cylinder':
		case 'cone': {
			const [radius, height] = p !== undefined && q !== undefined ? [p, q] : visual.shape === 'cylinder' ? [0.75, 1.8] : [0.9, 1.8];
			const k = p !== undefined && q !== undefined ? fit(1.8, 2 * radius, height) : 1;
			return {r: radius * k, h: height * k};
		}
		case 'triangularPyramid':
		case 'squarePyramid':
		case 'hexagonalPyramid': {
			const [side, height] = p !== undefined && q !== undefined ? [p, q] : [visual.shape === 'hexagonalPyramid' ? 1.1 : 1.8, 1.6];
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
export const solidMarks = (visual: Pick<Solid, 'shape' | 'size' | 'dimensions' | 'diagonal'> & Partial<Pick<Solid, 'lateralEdge'>>): MeasureMark[] => {
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
		case 'triangularPyramid':
		case 'squarePyramid':
		case 'hexagonalPyramid': {
			const {a, h} = size as {a: number; h: number};
			const {apothem, edgeAngles, slantFace, edgeCorner} = regularPyramid(PYRAMID_SIDES[visual.shape], a, h);
			const atEdge = (k: number): Vec3 => [apothem * Math.cos(edgeAngles[k]), 0, apothem * Math.sin(edgeAngles[k])];
			const foot = atEdge(slantFace);
			marks.push(
				first && {at: atEdge(0), label: first, side: 'out'},
				// h, the apothem and the side faces' height h′ (on the front right face) make the right triangle the lesson is about.
				second && {from: [0, h, 0], to: [0, 0, 0], at: [0, h * 0.45, 0], label: second, dashed: true, side: 'left'},
				third && {from: [0, 0, 0], to: foot, at: [foot[0] / 2, 0, foot[2] / 2], dashed: true, side: 'below'},
				third && {from: [0, h, 0], to: foot, at: [foot[0] / 2, h / 2, foot[2] / 2], label: third, side: 'out'},
				// The lateral edge on the left outline, and the base's centre joined to its corner: h, that line and the edge make the other right triangle.
				visual.lateralEdge && {from: [0, 0, 0], to: edgeCorner, at: [edgeCorner[0] / 2, 0, edgeCorner[2] / 2], dashed: true, side: 'below'},
				visual.lateralEdge && {from: [0, h, 0], to: edgeCorner, at: [edgeCorner[0] / 2, h / 2, edgeCorner[2] / 2], label: visual.lateralEdge, side: 'normal'},
			);
			break;
		}
		case 'halfCylinder': {
			const {r, h} = size as {r: number; h: number};
			// The radius up the end the viewer sees (+x), the length along the front edge.
			marks.push(
				first && {from: [h / 2, 0, 0], to: [h / 2, r, 0], at: [h / 2, r / 2, 0], label: first, dashed: true, side: 'right'},
				second && {at: [0, 0, r], label: second, side: 'out'},
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
		case 'triangularPyramid':
		case 'squarePyramid':
		case 'hexagonalPyramid':
		case 'cone':
			return (size as {h: number}).h;
		case 'sphere':
			return 2;
		case 'halfCylinder':
			return (size as {r: number}).r;
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
		case 'triangularPyramid':
		case 'squarePyramid':
		case 'hexagonalPyramid': {
			const {a, h} = size as {a: number; h: number};
			const {apothem, radius, slant} = regularPyramid(PYRAMID_SIDES[visual.shape], a, h);
			// Centred at half its height, the pyramid reaches its base corners (radius out, h / 2 down) and its apex.
			return {radius: Math.hypot(radius, h / 2), net: [apothem + slant, apothem + slant]};
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
		case 'halfCylinder': {
			const {r, h} = size as {r: number; h: number};
			return {radius: box(h, r, 2 * r), net: [1, 1]};
		}
		default:
			return {radius: 1, net: [1, 1]};
	}
};

/** Where a profile starts sweeping: in the plane of the screen once the solid has settled (an angle θ faces θ - VIEW_ANGLE). */
const PROFILE_START = VIEW_ANGLE;

/**
 * The marks while a profile sweeps: the axis it turns about (dashed, past both ends) and the profile's measures on the
 * profile itself, where it is now: the cylinder's r along its bottom and h up its outer side; the cone's r along its
 * bottom and h up the axis; the sphere's r from the centre.
 */
export const sweepMarks = (visual: Pick<Solid, 'shape' | 'dimensions'>, profile: readonly (readonly [number, number])[], angle: number): MeasureMark[] => {
	const [first, second] = visual.dimensions;
	const ys = profile.map(([, y]) => y);
	const [low, high] = [Math.min(...ys), Math.max(...ys)];
	const reach = Math.max(...profile.map(([rho]) => rho));
	const over = (high - low) * 0.18;
	const marks: (MeasureMark | false | undefined | '')[] = [{from: [0, low - over, 0], to: [0, high + over, 0], at: [0, high + over, 0], label: 'eksen', dashed: true, side: 'above'}];
	const at = (rho: number, y: number) => turnAbout([rho, y], angle);
	if (visual.shape === 'cylinder') marks.push(first && {at: at(reach / 2, low), label: first, side: 'below'}, second && {at: at(reach, (low + high) / 2), label: second, side: 'out'});
	if (visual.shape === 'cone') marks.push(first && {at: at(reach / 2, low), label: first, side: 'below'}, second && {at: [0, (low + high) / 2, 0], label: second, side: 'left'});
	if (visual.shape === 'sphere') marks.push(first && {from: [0, 1, 0], to: at(1, 1), at: at(0.5, 1), label: first, side: 'above'});
	return marks.filter((mark): mark is MeasureMark => Boolean(mark));
};

/** A solid of revolution as far as its profile has swept, with the profile standing where it has got to. */
const SweptSolid: React.FC<{profile: [number, number][]; angle: number; colours: {face: string; alt: string; edge: string}; profileOpacity: number}> = ({profile, angle, colours, profileOpacity}) => {
	const faces = useMemo(() => (angle > 1e-3 ? revolvedFaces(profile, PROFILE_START, angle) : []), [profile, angle]);
	const section = useMemo(() => [profile.map((point) => turnAbout(point, PROFILE_START + angle))], [profile, angle]);
	return (
		<group>
			{faces.length ? <MeshSolid faces={faces} colour={colours.face} edge={colours.edge} /> : null}
			{profileOpacity > 0 ? <MeshSolid faces={section} colour={mixColors(colours.alt, colours.edge, 0.25)} edge={colours.edge} opacity={0.95 * profileOpacity} /> : null}
		</group>
	);
};

/** The half cylinder: its curved side in the face colour, the cut and the two half discs in the stronger tint. */
const HalfCylinder: React.FC<{r: number; l: number; colours: {face: string; alt: string; edge: string}}> = ({r, l, colours}) => {
	const {curved, flat} = useMemo(() => halfCylinderFaces(r, l), [r, l]);
	return (
		<group>
			<MeshSolid faces={curved} colour={colours.face} edge={colours.edge} />
			<MeshSolid faces={flat} colour={colours.alt} edge={colours.edge} />
		</group>
	);
};

/** How far each of a split cube's pyramids moves out from its place, in scene units (the cube's side is 1.6). */
const PIECE_SHIFT = 0.75;

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
	const unfolds = visual.unfold && visual.shape !== 'sphere' && visual.shape !== 'halfCylinder';
	const splits = visual.split && visual.shape === 'cube';
	const profile = visual.sweep ? sweepProfile(visual) : null;
	const names = [profile ? 'Döndürme' : 'Cisim', MEASURE_STAGE[visual.shape], ...(unfolds ? ['Açınım'] : splits ? ['Üç piramit'] : [])];
	const clock = useStageClock(names.length, {delaySeconds, secondsPerStage: 3.5});
	const {stage, progress} = clock;
	const open = unfolds && stage === 2 ? smooth(progress * 1.3) : 0;
	const apart = splits && stage === 2 ? smooth(progress * 1.3) : 0;
	const pieces = useMemo(() => cubePyramids(1.6).map((piece) => ({...piece, faces: pyramidFaces(piece.apex, piece.base)})), []);
	// While it opens it comes to face the viewer: from above for nets that lie flat, from the front for the cylinder's standing one.
	const standingNet = visual.shape === 'cylinder';
	const turned = (at: number) => (at - delaySeconds) * 0.45;
	const settle = stage === 0 ? 0 : stage === 1 ? smooth(clock.seconds / 1.2) : 1;
	const settleFrom = turned(seconds - clock.seconds);
	// A solid of revolution does not turn: its profile turns about the axis instead, from where it lies flat to the viewer.
	const spin = profile ? VIEW_ANGLE * (1 - open) : stage === 0 ? turned(seconds) : stage === 1 ? settleFrom + wrapAngle(VIEW_ANGLE - settleFrom) * settle : VIEW_ANGLE * (1 - open);
	const swept = profile ? (stage === 0 ? smooth(progress) : 1) * 2 * Math.PI : 0;
	const pitch = standingNet ? 0.45 * (1 - open) + 0.05 * open : 0.55 + (Math.PI / 2 - 0.55) * open;
	const colours = solidColours(palette.lesson);
	const size = solidSize(visual);
	const net: Net | null = {
		cube: cuboidNet(1.6, 1.6, 1.6),
		cuboid: cuboidNet((size as {a: number}).a, (size as {b: number}).b, (size as {c: number}).c),
		triangularPrism: prismNet(2.2, 1.5),
		triangularPyramid: pyramidNet(3, (size as {a: number}).a, (size as {h: number}).h),
		squarePyramid: pyramidNet(4, (size as {a: number}).a, (size as {h: number}).h),
		hexagonalPyramid: pyramidNet(6, (size as {a: number}).a, (size as {h: number}).h),
		cylinder: cylinderNet((size as {r: number}).r, (size as {h: number}).h),
		cone: coneNet((size as {r: number}).r, (size as {h: number}).h),
		sphere: null,
		halfCylinder: null,
	}[visual.shape];
	const marks = solidMarks(visual);
	// The measures are on the figure; the caption only names the solid (the prism keeps them in the caption).
	const caption = apart > 0 ? 'Üç eş piramit: her biri küpün üçte biri' : stage >= 1 && visual.dimensions.some(Boolean) && marks.length === 0 ? [SHAPE_NAMES[visual.shape], ...visual.dimensions.filter(Boolean)].join(' · ') : SHAPE_NAMES[visual.shape];
	// Solids stand on their base (y = 0); lift them so they are centred, and centre the flat nets.
	const lift = (-solidHeight(visual) / 2) * (1 - open);
	const {strip, captionHeight} = useFrame3DBands(height);
	const canvas = {width: Math.round(width), height: Math.round(height - strip - captionHeight)};
	// The camera stands as close as the solid allows (it filled a third of its box at a fixed distance), and steps back for the net.
	const extents = solidExtents(visual);
	const aspect = canvas.width / canvas.height;
	// In a small box (a question's figure) there is no strip or caption to keep clear of: the solid takes more of it.
	const closedDistance = cameraDistance(extents.radius, extents.radius, aspect, height < u(COMPACT_HEIGHT) ? 0.9 : 0.72);
	const openDistance = cameraDistance(extents.net[0], extents.net[1], aspect, 0.9);
	// Coming apart, the pieces move out by up to `PIECE_SHIFT`; the camera steps back to keep them all.
	const distance = (closedDistance + (Math.max(closedDistance, openDistance) - closedDistance) * open) * (1 + 0.45 * apart);
	// The cuboid's net hangs off its base towards -z by half the base's depth; centre it while it opens.
	const netShift = visual.shape === 'cube' ? 0.8 : visual.shape === 'cuboid' ? (size as {b: number}).b / 2 : 0;
	const project = projector(canvas.width, canvas.height, distance, pitch, lift, spin);
	const centre = project([0, standingNet ? 0 : solidHeight(visual) / 2, 0]);
	// The measures come once the solid has stopped turning, so they do not slide over it.
	const shown = (stage === 1 ? smooth((clock.seconds - (profile ? 0.3 : 1.1)) / 0.5) : stage > 1 ? 1 : 0) * (1 - Math.min(1, (open + apart) * 4));
	// While the profile sweeps: the axis, and the profile's own measures riding on it.
	const sweeping = profile && stage === 0 ? sweepMarks(visual, profile, PROFILE_START + swept) : [];
	const drawn = sweeping.length ? sweeping : marks;
	// The axis and the profile's measures show from the start, while the profile waits for its beat, and go as it closes the turn.
	const drawnOpacity = sweeping.length ? smooth((seconds - delaySeconds) / 0.5) * (1 - smooth((progress - 0.92) / 0.08)) : shown;
	const fontSize = u(32);
	const gap = u(22);
	const ink = palette.ink;

	const overlay =
		drawnOpacity > 0 && drawn.length ? (
			<g opacity={drawnOpacity} fontFamily={palette.fontBody} fontWeight={800} fontSize={fontSize}>
				{drawn.map((mark, index) => {
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
									{figureText(mark.label)}
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
				{apart > 0 ? (
					pieces.map((piece, index) => (
						<group key={index} position={[piece.normal[0] * PIECE_SHIFT * apart, piece.normal[1] * PIECE_SHIFT * apart, piece.normal[2] * PIECE_SHIFT * apart]}>
							<MeshSolid faces={piece.faces} colour={[colours.face, colours.alt, mixColors(colours.alt, palette.lesson, 0.35)][index]} edge={colours.edge} />
						</group>
					))
				) : profile && open === 0 ? (
					<SweptSolid profile={profile} angle={swept} colours={colours} profileOpacity={stage === 0 ? 1 : 1 - smooth(clock.seconds / 0.6)} />
				) : visual.shape === 'halfCylinder' ? (
					<HalfCylinder r={(size as {r: number}).r} l={(size as {h: number}).h} colours={colours} />
				) : net ? (
					net(open, colours)
				) : (
					<mesh position={[0, 1, 0]}>
						<sphereGeometry args={[1, 48, 32]} />
						<SolidMaterial colour={colours.face} opacity={0.9} />
					</mesh>
				)}
			</group>
		</Frame3D>
	);
};
