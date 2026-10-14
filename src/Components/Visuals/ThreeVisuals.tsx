import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {Easing} from 'remotion';
import * as THREE from 'three';
import {NATURE_COLORS} from '../../Configurations/NatureColors';
import {withAlpha} from '../../Themes/Theme';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {useStageClock} from './VisualTimeline';
import type {CourseVisual} from './VisualSchemas';

type Solid = Extract<CourseVisual, {kind: 'solid'}>;
type Molecule3D = Extract<CourseVisual, {kind: 'molecule3d'}>;
type Earthquake = Extract<CourseVisual, {kind: 'earthquake'}>;

/**
 * Visuals in 3D, where depth helps to understand: solids and their nets,
 * molecular shapes, fault blocks. Drawn with three.js through
 * @remotion/three, so every frame is computed from the frame number and
 * renders the same every time. Timing (stages, seconds) is worked out
 * outside the canvas and passed in.
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => Easing.bezier(0.33, 0, 0.2, 1)(clamp01(value));

/**
 * A 3D figure with its stage strip above and its caption below (HTML, so the
 * text is crisp). The camera stands still on the z axis; the scene is turned
 * instead (`pitch` tips its top towards the viewer), which renders the same on
 * every frame.
 */
const Frame3D: React.FC<{width: number; height: number; names: readonly string[]; stage: number; caption?: string; distance: number; pitch: number; children: React.ReactNode}> = ({width, height, names, stage, caption, distance, pitch, children}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const strip = u(52);
	const captionHeight = u(48);
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column'}}>
			<div style={{height: strip, display: 'flex', gap: u(10), alignItems: 'flex-start', fontFamily: palette.fontDisplay}}>
				{names.map((name, index) => (
					<div key={name} style={{flex: 1, textAlign: 'center', padding: `${u(8)}px ${u(10)}px`, borderRadius: u(999), fontWeight: 800, fontSize: u(22), backgroundColor: index === stage ? palette.lesson : index < stage ? withAlpha(palette.lesson, 0.22) : withAlpha(palette.ink, 0.07), color: index === stage ? palette.onLesson : palette.ink}}>
						{`${index + 1}. ${name}`}
					</div>
				))}
			</div>
			<ThreeCanvas width={Math.round(width)} height={Math.round(height - strip - captionHeight)} camera={{position: [0, 0, distance], fov: 40, near: 0.1, far: 100}} gl={{antialias: true, preserveDrawingBuffer: true}} style={{background: 'transparent'}}>
				<ambientLight intensity={0.75} />
				<directionalLight position={[5, 8, 6]} intensity={1.2} />
				<directionalLight position={[-6, 3, -4]} intensity={0.35} />
				<group rotation={[pitch, 0, 0]}>{children}</group>
			</ThreeCanvas>
			<div style={{height: captionHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(28), color: palette.ink}}>{caption ?? ''}</div>
		</div>
	);
};

/** A flat face with its outline, in its parent's frame: lying in the XZ plane, centred at `centre`. */
const Face: React.FC<{shape: THREE.Shape; colour: string; edge: string; opacity?: number}> = ({shape, colour, edge, opacity = 0.92}) => {
	const geometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);
	const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
	return (
		<group rotation={[-Math.PI / 2, 0, 0]}>
			<mesh geometry={geometry}>
				<meshStandardMaterial color={colour} side={THREE.DoubleSide} transparent opacity={opacity} roughness={0.6} />
			</mesh>
			<lineSegments geometry={edges}>
				<lineBasicMaterial color={edge} />
			</lineSegments>
		</group>
	);
};

/** A rectangle from x0..x1 and (net) z0..z1, as a shape in the face's own XY plane (y = -z after the rotation). */
const rect = (x0: number, x1: number, z0: number, z1: number) => {
	const shape = new THREE.Shape();
	shape.moveTo(x0, -z0);
	shape.lineTo(x1, -z0);
	shape.lineTo(x1, -z1);
	shape.lineTo(x0, -z1);
	shape.closePath();
	return shape;
};

const polygon = (points: [number, number][]) => {
	const shape = new THREE.Shape();
	points.forEach(([x, z], index) => (index === 0 ? shape.moveTo(x, -z) : shape.lineTo(x, -z)));
	shape.closePath();
	return shape;
};

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

const SOLID_STAGES_UNFOLD = ['Cisim', 'Ayrıtlar ve yüzler', 'Açınım'] as const;
const SOLID_STAGES = ['Cisim', 'Ayrıtlar ve yüzler'] as const;
const SHAPE_NAMES: Record<Solid['shape'], string> = {
	cube: 'Küp',
	cuboid: 'Dikdörtgenler prizması',
	triangularPrism: 'Üçgen prizma',
	squarePyramid: 'Kare dik piramit',
	cylinder: 'Dik silindir',
	cone: 'Dik koni',
	sphere: 'Küre',
};

/**
 * A solid turning slowly so its depth reads; then its faces and edges are
 * pointed out with their measures; with `unfold` it then opens into its net
 * and turns to lie flat under the camera.
 */
export const SolidVisual: React.FC<VisualBoxProps & {visual: Solid}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const unfolds = visual.unfold && visual.shape !== 'cone' && visual.shape !== 'sphere';
	const names = unfolds ? SOLID_STAGES_UNFOLD : SOLID_STAGES;
	const {stage, progress} = useStageClock(names.length, {delaySeconds, secondsPerStage: 3.5});
	const open = stage === 2 ? smooth(progress * 1.3) : 0;
	// While it opens it stops turning and comes to face the viewer: from above for nets that lie flat, from the front for the cylinder's standing one.
	const standingNet = visual.shape === 'cylinder';
	const turned = (seconds - delaySeconds) * 0.45;
	const spin = turned * (1 - open) + (standingNet ? 0 : Math.round(turned / (Math.PI / 2)) * (Math.PI / 2)) * open;
	const pitch = standingNet ? 0.45 * (1 - open) + 0.05 * open : 0.55 + (Math.PI / 2 - 0.55) * open;
	const colours = {face: palette.lesson, alt: palette.brand, edge: '#1F2937'};
	const net: Net | null = {
		cube: cuboidNet(1.6, 1.6, 1.6),
		cuboid: cuboidNet(2.2, 1.3, 1.1),
		triangularPrism: prismNet(2.2, 1.5),
		squarePyramid: pyramidNet(1.8, 1.6),
		cylinder: cylinderNet(0.75, 1.8),
		cone: null,
		sphere: null,
	}[visual.shape];
	const caption = stage >= 1 && visual.dimensions.length ? `${SHAPE_NAMES[visual.shape]} · ${visual.dimensions.join(' · ')}` : SHAPE_NAMES[visual.shape];
	// Solids stand on their base (y = 0); lift them so they are centred, and centre the flat nets.
	const lift = visual.shape === 'cylinder' ? 0 : -0.8 * (1 - open);

	return (
		<Frame3D width={width} height={height} names={names} stage={stage} caption={caption} distance={standingNet ? 7 : 7 + 2.5 * open} pitch={pitch}>
			<group position={[0, lift, 0]} rotation={[0, spin, 0]}>
				{net ? (
					net(open, colours)
				) : visual.shape === 'cone' ? (
					<mesh position={[0, 0.9, 0]}>
						<coneGeometry args={[0.9, 1.8, 48]} />
						<meshStandardMaterial color={palette.lesson} />
					</mesh>
				) : (
					<mesh position={[0, 0.9, 0]}>
						<sphereGeometry args={[1, 48, 32]} />
						<meshStandardMaterial color={palette.lesson} roughness={0.5} />
					</mesh>
				)}
			</group>
		</Frame3D>
	);
};

// ---------------------------------------------------------------- molecules

/** Electron-domain directions for 2 to 6 domains (VSEPR). Lone pairs take the first places listed for them. */
const DOMAIN_DIRECTIONS: Record<number, [number, number, number][]> = {
	2: [[1, 0, 0], [-1, 0, 0]],
	3: [[1, 0, 0], [-0.5, 0.866, 0], [-0.5, -0.866, 0]],
	4: [[0, 1, 0], [0.943, -0.333, 0], [-0.471, -0.333, 0.816], [-0.471, -0.333, -0.816]],
	5: [[1, 0, 0], [-0.5, 0, 0.866], [-0.5, 0, -0.866], [0, 1, 0], [0, -1, 0]],
	6: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]],
};
const CPK: Record<string, string> = {H: '#F5F5F5', C: '#3A3A3A', N: '#3050F8', O: '#E53935', F: '#7CB342', Cl: '#43A047', Br: '#8D3B1E', I: '#6A1B9A', S: '#F9C80E', P: '#FF8F00', B: '#F48FB1', Be: '#9CCC65', Xe: '#26A69A', Si: '#B0A090'};

/**
 * A molecule's shape by VSEPR: the central atom, the bonded atoms and the
 * lone pairs (as clouds) spread as far apart as they can, turning slowly.
 * Stages: bonds, then lone pairs, then the shape's name and angle.
 */
export const Molecule3DVisual: React.FC<VisualBoxProps & {visual: Molecule3D}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const names = visual.lonePairs > 0 ? (['Bağlar', 'Ortaklanmamış çiftler', 'Molekül şekli'] as const) : (['Bağlar', 'Molekül şekli'] as const);
	const {stage, progress} = useStageClock(names.length, {delaySeconds});
	const domains = visual.ligands.length + visual.lonePairs;
	const directions = DOMAIN_DIRECTIONS[domains];
	// Lone pairs go where they are most stable: equatorial for 5 domains, opposite each other for 6.
	const loneSlots = domains === 5 ? [0, 1, 2] : domains === 6 ? [0, 1] : [0, 1, 2];
	const lone = loneSlots.slice(0, visual.lonePairs);
	const bonded = directions.map((_, index) => index).filter((index) => !lone.includes(index));
	const lonesShow = visual.lonePairs > 0 ? (stage >= 1 ? (stage === 1 ? smooth(progress * 2) : 1) : 0) : 0;
	const bondsShow = stage === 0 ? smooth(progress * 2) : 1;
	const spin = (seconds - delaySeconds) * 0.5;
	const length = 1.55;
	const caption = stage === names.length - 1 ? [visual.formula, visual.shapeName, visual.bondAngle].filter(Boolean).join(' · ') : visual.formula;

	return (
		<Frame3D width={width} height={height} names={names} stage={stage} caption={caption} distance={6.2} pitch={0.35}>
				<group rotation={[0, spin, 0]}>
					<mesh>
						<sphereGeometry args={[0.55, 40, 28]} />
						<meshStandardMaterial color={CPK[visual.center] ?? '#8E8E8E'} roughness={0.35} />
					</mesh>
					{bonded.map((slot, index) => {
						const direction = new THREE.Vector3(...directions[slot]).normalize();
						const end = direction.clone().multiplyScalar(length * bondsShow);
						const middle = direction.clone().multiplyScalar((length * bondsShow) / 2);
						const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
						const atom = visual.ligands[index];
						return (
							<group key={slot}>
								<mesh position={middle} quaternion={quaternion}>
									<cylinderGeometry args={[0.09, 0.09, length * bondsShow, 16]} />
									<meshStandardMaterial color="#9E9E9E" />
								</mesh>
								<mesh position={end} scale={bondsShow}>
									<sphereGeometry args={[atom === 'H' ? 0.3 : 0.42, 32, 24]} />
									<meshStandardMaterial color={CPK[atom] ?? '#BDBDBD'} roughness={0.35} />
								</mesh>
							</group>
						);
					})}
					{lone.map((slot) => {
						const direction = new THREE.Vector3(...directions[slot]).normalize();
						const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
						return (
							<mesh key={slot} position={direction.clone().multiplyScalar(0.95)} quaternion={quaternion} scale={[0.42, 0.7, 0.42].map((v) => v * lonesShow) as [number, number, number]}>
								<sphereGeometry args={[1, 28, 20]} />
								<meshStandardMaterial color="#B39DDB" transparent opacity={0.45} />
							</mesh>
						);
					})}
				</group>
		</Frame3D>
	);
};

// ---------------------------------------------------------------- fault blocks

const QUAKE_STAGES = ['Fay', 'Gerilme birikir', 'Kırılma', 'Fay dikliği'] as const;

/**
 * Two blocks of layered rock in 3D on either side of a fault plane (dip 60°).
 * Stress makes them tremble; at the rupture the hanging wall slips along the
 * fault (up for a reverse fault, down for a normal one; sideways for
 * strike-slip) and the step it leaves at the surface — the fault scarp —
 * stays.
 */
export const FaultBlock3DVisual: React.FC<VisualBoxProps & {visual: Earthquake}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const {stage, progress} = useStageClock(QUAKE_STAGES.length, {delaySeconds});
	const slip = stage >= 2 ? (stage === 2 ? smooth(progress * 3) : 1) : 0;
	const tremble = stage === 1 ? Math.sin(seconds * 40) * 0.015 * progress : 0;
	const dip = (60 * Math.PI) / 180;
	const run = 2 / Math.tan(dip); // horizontal run of the fault over the blocks' 2 units of depth
	const strikeSlip = visual.fault === 'strikeSlip';
	const sense = visual.fault === 'reverse' ? 1 : -1;
	const amount = 0.45 * slip;
	// The fault plane goes down to the right, so the hanging wall is the right block; up the dip is up and to the left.
	const shift: [number, number, number] = strikeSlip ? [0, 0, amount] : [-sense * amount * Math.cos(dip), sense * amount * Math.sin(dip), 0];
	const layers = NATURE_COLORS.rock;
	const block = (side: 'foot' | 'hanging') =>
		layers.map((colour, index) => {
			const top = -index * 0.5;
			const bottom = top - 0.5;
			const xAt = (y: number) => (strikeSlip ? 0 : -run / 2 + ((0 - y) / 2) * run);
			const shape = new THREE.Shape();
			if (side === 'foot') {
				shape.moveTo(-2.4, top);
				shape.lineTo(xAt(top), top);
				shape.lineTo(xAt(bottom), bottom);
				shape.lineTo(-2.4, bottom);
			} else {
				shape.moveTo(xAt(top), top);
				shape.lineTo(2.4, top);
				shape.lineTo(2.4, bottom);
				shape.lineTo(xAt(bottom), bottom);
			}
			shape.closePath();
			return (
				<mesh key={`${side}${index}`} position={[0, 0, -1.2]}>
					<extrudeGeometry args={[shape, {depth: 2.4, bevelEnabled: false}]} />
					<meshStandardMaterial color={colour} roughness={0.85} />
				</mesh>
			);
		});

	return (
		<Frame3D width={width} height={height} names={QUAKE_STAGES} stage={stage} caption={stage >= 3 ? 'Kırılmanın yüzeyde bıraktığı basamak: fay dikliği' : undefined} distance={8.2} pitch={0.42}>
				<group rotation={[0, -0.45 + (seconds - delaySeconds) * 0.04, 0]} position={[tremble, 0.9, 0]}>
					<group>{block('foot')}</group>
					<group position={shift}>{block('hanging')}</group>
					{/* the fault plane, so the break shows before anything has moved */}
					<group position={[0, -1, 0]} rotation={[0, strikeSlip ? Math.PI / 2 : 0, strikeSlip ? 0 : Math.atan2(-2, run)]}>
						<mesh rotation={[Math.PI / 2, 0, 0]}>
							<planeGeometry args={[strikeSlip ? 4.8 : Math.hypot(run, 2), 2.44]} />
							<meshBasicMaterial color="#1F2937" transparent opacity={0.55} side={THREE.DoubleSide} />
						</mesh>
					</group>
					{stage >= 1 && stage < 2 ? (
						<>
							<mesh position={[-2.9, -1, 0]} rotation={[0, 0, -Math.PI / 2]}>
								<coneGeometry args={[0.18, 0.5, 20]} />
								<meshStandardMaterial color={NATURE_COLORS.stress} />
							</mesh>
							<mesh position={[2.9, -1, 0]} rotation={[0, 0, Math.PI / 2]}>
								<coneGeometry args={[0.18, 0.5, 20]} />
								<meshStandardMaterial color={NATURE_COLORS.stress} />
							</mesh>
						</>
					) : null}
				</group>
		</Frame3D>
	);
};
