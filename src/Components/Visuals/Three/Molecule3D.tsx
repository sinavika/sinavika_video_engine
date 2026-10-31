import React from 'react';
import * as THREE from 'three';
import {smooth} from '../../../Animations/Motion';
import {useSceneSeconds, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {Frame3D} from './Frame3D';

type Molecule3D = Extract<CourseVisual, {kind: 'molecule3d'}>;

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
