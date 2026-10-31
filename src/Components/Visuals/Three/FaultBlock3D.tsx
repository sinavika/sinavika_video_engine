import React from 'react';
import * as THREE from 'three';
import {smooth} from '../../../Animations/Motion';
import {NATURE_COLORS} from '../../../Configurations/NatureColors';
import {useSceneSeconds, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {Frame3D} from './Frame3D';

type Earthquake = Extract<CourseVisual, {kind: 'earthquake'}>;

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
