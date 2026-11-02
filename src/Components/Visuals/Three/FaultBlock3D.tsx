import React from 'react';
import * as THREE from 'three';
import {smooth} from '../../../Animations/Motion';
import {NATURE_COLORS} from '../../../Configurations/NatureColors';
import {useSceneSeconds, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {earthquakeStages} from './ThreeSchema';
import {useStageClock} from '../VisualTimeline';
import {Frame3D} from './Frame3D';

type Earthquake = Extract<CourseVisual, {kind: 'earthquake'}>;
type Vector = [number, number, number];

// ---------------------------------------------------------------- fault blocks

/** The rock is 4.8 wide (x), 2.4 deep (z) and 2 high; the top is y = 0. */
const HALF_WIDTH = 2.4;
const HALF_DEPTH = 1.2;
const HEIGHT = 2;
const DIP = (60 * Math.PI) / 180;
/** A stress arrow: its shaft and its head, in scene units. */
const ARROW = {shaft: 0.6, head: 0.4, shaftRadius: 0.06, headRadius: 0.17};
/** How far the moving block slips at the rupture. */
const SLIP = 0.45;

// A cone points up (+y); these turns point it along x or z.
const TOWARD = {plusX: [0, 0, -Math.PI / 2], minusX: [0, 0, Math.PI / 2], plusZ: [Math.PI / 2, 0, 0], minusZ: [-Math.PI / 2, 0, 0]} satisfies Record<string, Vector>;

/**
 * Where the rock breaks and which way it is pushed, by fault type.
 *
 * A normal or reverse fault runs into the picture (along z) and dips at 60°, down to the right, so the right block is
 * the hanging wall; at full `slip` it has moved up the dip (reverse) or down it (normal). The stress arrows stand off
 * the end faces: squeezing (reverse, tip at the face) or pulling apart (normal, tail at the face).
 *
 * A strike-slip fault is vertical and runs across the picture (along x), between a back block and a front one, as in a
 * textbook block diagram: the camera looks across the fault, so the sideways slip and the road it breaks read
 * at a glance. The front block slips along the fault (+x); the stress arrows lie on top of the two blocks, pointing
 * opposite ways along the fault.
 *
 * `split` says which axis the fault divides: x (left and right blocks) or z (back and front).
 */
export const faultGeometry = (fault: Earthquake['fault'], slip: number) => {
	const amount = SLIP * slip;
	if (fault === 'strikeSlip') {
		return {
			split: 'z' as const,
			shift: [amount, 0, 0] as Vector,
			arrows: [
				{position: [0.25, 0.22, -HALF_DEPTH / 2] as Vector, rotation: TOWARD.minusX, direction: [-1, 0, 0] as Vector},
				{position: [-0.25, 0.22, HALF_DEPTH / 2] as Vector, rotation: TOWARD.plusX, direction: [1, 0, 0] as Vector},
			],
			/** A vertical plane along x at z = 0. */
			plane: {rotation: [0, 0, 0] as Vector, size: [HALF_WIDTH * 2 + 0.04, HEIGHT + 0.04] as [number, number]},
			faultX: (_y: number) => 0,
		};
	}
	// The fault's horizontal run over the rock's height.
	const run = HEIGHT / Math.tan(DIP);
	const sense = fault === 'reverse' ? 1 : -1;
	const push = fault === 'reverse';
	const offset = HALF_WIDTH + (push ? ARROW.head : ARROW.shaft) + 0.05;
	return {
		split: 'x' as const,
		shift: [-sense * amount * Math.cos(DIP), sense * amount * Math.sin(DIP), 0] as Vector,
		arrows: [
			{position: [-offset, -HEIGHT / 2, 0] as Vector, rotation: push ? TOWARD.plusX : TOWARD.minusX, direction: [push ? 1 : -1, 0, 0] as Vector},
			{position: [offset, -HEIGHT / 2, 0] as Vector, rotation: push ? TOWARD.minusX : TOWARD.plusX, direction: [push ? -1 : 1, 0, 0] as Vector},
		],
		/** The plane tilted down to the right by the dip (a plane in x–z, turned about z). */
		plane: {rotation: [0, 0, Math.atan2(-HEIGHT, run)] as Vector, size: [Math.hypot(run, HEIGHT), HALF_DEPTH * 2 + 0.04] as [number, number]},
		/** Where the fault meets the depth y (y = 0 at the top, −HEIGHT at the bottom). */
		faultX: (y: number) => -run / 2 + (-y / HEIGHT) * run,
	};
};

/** The sizes the visual draws with, for tests. */
export const FAULT_BLOCK = {halfWidth: HALF_WIDTH, halfDepth: HALF_DEPTH, height: HEIGHT, arrow: ARROW, slip: SLIP};

/** What the rupture leaves at the surface, said under the figure at the last stage. */
const LAST_CAPTION: Record<Earthquake['fault'], string> = {
	normal: 'Kırılmanın yüzeyde bıraktığı basamak: fay dikliği',
	reverse: 'Kırılmanın yüzeyde bıraktığı basamak: fay dikliği',
	strikeSlip: 'Bloklar yana kaydı; yol fay boyunca ötelendi: yatay atım',
};

const layerHeight = HEIGHT / NATURE_COLORS.rock.length;

/** One block's rock layers between two x bounds that may follow the fault (dip-slip), drawn from z0 for `depth`. */
const Layers: React.FC<{left: (y: number) => number; right: (y: number) => number; z0: number; depth: number}> = ({left, right, z0, depth}) => (
	<>
		{NATURE_COLORS.rock.map((colour, index) => {
			const top = -index * layerHeight;
			const bottom = top - layerHeight;
			const shape = new THREE.Shape();
			shape.moveTo(left(top), top);
			shape.lineTo(right(top), top);
			shape.lineTo(right(bottom), bottom);
			shape.lineTo(left(bottom), bottom);
			shape.closePath();
			return (
				<mesh key={index} position={[0, 0, z0]}>
					<extrudeGeometry args={[shape, {depth, bevelEnabled: false}]} />
					<meshStandardMaterial color={colour} roughness={0.85} />
				</mesh>
			);
		})}
	</>
);

/** A stretch of road on top of the rock, from `from` to `to` (x, z), with its centre line. */
const Road: React.FC<{from: [number, number]; to: [number, number]}> = ({from, to}) => {
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
	const centre: Vector = [(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2];
	const angle = -Math.atan2(to[1] - from[1], to[0] - from[0]);
	return (
		<group position={centre} rotation={[0, angle, 0]}>
			<mesh position={[0, 0.012, 0]}>
				<boxGeometry args={[length, 0.024, 0.32]} />
				<meshStandardMaterial color="#4B5563" roughness={0.9} />
			</mesh>
			<mesh position={[0, 0.026, 0]}>
				<boxGeometry args={[length, 0.006, 0.04]} />
				<meshStandardMaterial color="#F4F1EA" roughness={0.6} />
			</mesh>
		</group>
	);
};

/**
 * Two blocks of layered rock in 3D on either side of a fault, with a road across the top. Stress makes them tremble
 * (the arrows show the push); at the rupture one block slips along the fault, and the road, broken where it crosses
 * the fault, shows what is left at the surface: a step (fault scarp) or, for strike-slip, a sideways shift.
 */
export const FaultBlock3DVisual: React.FC<VisualBoxProps & {visual: Earthquake}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const names = earthquakeStages(visual.fault, 'block3d');
	const {stage, progress} = useStageClock(names.length, {delaySeconds});
	const slip = stage >= 2 ? (stage === 2 ? smooth(progress * 3) : 1) : 0;
	const tremble = stage === 1 ? Math.sin(seconds * 40) * 0.015 * progress : 0;
	const geometry = faultGeometry(visual.fault, slip);
	const edge = (x: number) => () => x;
	const [fixed, moving] =
		geometry.split === 'x'
			? [
					<>
						<Layers left={edge(-HALF_WIDTH)} right={geometry.faultX} z0={-HALF_DEPTH} depth={HALF_DEPTH * 2} />
						<Road from={[-HALF_WIDTH, 0]} to={[geometry.faultX(0), 0]} />
					</>,
					<>
						<Layers left={geometry.faultX} right={edge(HALF_WIDTH)} z0={-HALF_DEPTH} depth={HALF_DEPTH * 2} />
						<Road from={[geometry.faultX(0), 0]} to={[HALF_WIDTH, 0]} />
					</>,
				]
			: [
					<>
						<Layers left={edge(-HALF_WIDTH)} right={edge(HALF_WIDTH)} z0={-HALF_DEPTH} depth={HALF_DEPTH} />
						<Road from={[0, -HALF_DEPTH]} to={[0, 0]} />
					</>,
					<>
						<Layers left={edge(-HALF_WIDTH)} right={edge(HALF_WIDTH)} z0={0} depth={HALF_DEPTH} />
						<Road from={[0, 0]} to={[0, HALF_DEPTH]} />
					</>,
				];

	return (
		<Frame3D width={width} height={height} names={names} stage={stage} caption={stage >= 3 ? LAST_CAPTION[visual.fault] : undefined} distance={8.2} pitch={0.42}>
			<group rotation={[0, -0.45 + (seconds - delaySeconds) * 0.04, 0]} position={[tremble, 0.9, 0]}>
				<group>{fixed}</group>
				<group position={geometry.shift}>{moving}</group>
				{/* the fault plane, so the break shows before anything has moved */}
				<group position={[0, -HEIGHT / 2, 0]} rotation={geometry.plane.rotation}>
					<mesh rotation={geometry.split === 'x' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
						<planeGeometry args={geometry.plane.size} />
						<meshBasicMaterial color="#1F2937" transparent opacity={0.55} side={THREE.DoubleSide} />
					</mesh>
				</group>
				{stage >= 1 && stage < 2
					? geometry.arrows.map((arrow, index) => (
							<group key={index} position={arrow.position} rotation={arrow.rotation}>
								<mesh position={[0, -ARROW.shaft / 2, 0]}>
									<cylinderGeometry args={[ARROW.shaftRadius, ARROW.shaftRadius, ARROW.shaft, 16]} />
									<meshStandardMaterial color={NATURE_COLORS.stress} />
								</mesh>
								<mesh position={[0, ARROW.head / 2, 0]}>
									<coneGeometry args={[ARROW.headRadius, ARROW.head, 20]} />
									<meshStandardMaterial color={NATURE_COLORS.stress} />
								</mesh>
							</group>
						))
					: null}
			</group>
		</Frame3D>
	);
};
