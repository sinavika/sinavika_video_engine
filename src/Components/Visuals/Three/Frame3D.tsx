import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useVisualPalette} from '../VisualFrame';

/**
 * Visuals in 3D, where depth helps to understand: solids and their nets,
 * molecular shapes, fault blocks. Drawn with three.js through
 * @remotion/three, so every frame is computed from the frame number and
 * renders the same every time. Timing (stages, seconds) is worked out
 * outside the canvas and passed in.
 */


/**
 * A 3D figure with its stage strip above and its caption below (HTML, so the
 * text is crisp). The camera stands still on the z axis; the scene is turned
 * instead (`pitch` tips its top towards the viewer), which renders the same on
 * every frame.
 */
/** Heights of the stage strip above a 3D figure and of its caption below. */
export const frame3DBands = (u: (value: number) => number) => ({strip: u(52), captionHeight: u(48)});

export type Vec3 = [number, number, number];

/**
 * Where a point of a figure lands on the canvas: the same camera as Frame3D (on the z axis, fov 40), the scene
 * tipped by `pitch`, and the figure's group moved by `lift` and turned by `spin` about y.
 */
export const projector = (width: number, height: number, distance: number, pitch: number, lift: number, spin: number) => {
	const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
	camera.position.set(0, 0, distance);
	camera.updateMatrixWorld();
	camera.updateProjectionMatrix();
	const matrix = new THREE.Matrix4().makeRotationX(pitch).multiply(new THREE.Matrix4().makeTranslation(0, lift, 0)).multiply(new THREE.Matrix4().makeRotationY(spin));
	return ([x, y, z]: Vec3): [number, number] => {
		const point = new THREE.Vector3(x, y, z).applyMatrix4(matrix).project(camera);
		return [((point.x + 1) / 2) * width, ((1 - point.y) / 2) * height];
	};
};

export const Frame3D: React.FC<{width: number; height: number; names: readonly string[]; stage: number; caption?: string; distance: number; pitch: number; overlay?: React.ReactNode; children: React.ReactNode}> = ({width, height, names, stage, caption, distance, pitch, overlay, children}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const {strip, captionHeight} = frame3DBands(u);
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column'}}>
			<div style={{height: strip, display: 'flex', gap: u(10), alignItems: 'flex-start', fontFamily: palette.fontDisplay}}>
				{names.map((name, index) => (
					<div key={name} style={{flex: 1, textAlign: 'center', padding: `${u(8)}px ${u(10)}px`, borderRadius: u(999), fontWeight: 800, fontSize: u(22), backgroundColor: index === stage ? palette.lesson : index < stage ? withAlpha(palette.lesson, 0.22) : withAlpha(palette.ink, 0.07), color: index === stage ? palette.onLesson : palette.ink}}>
						{`${index + 1}. ${name}`}
					</div>
				))}
			</div>
			<div style={{position: 'relative', width: Math.round(width), height: Math.round(height - strip - captionHeight)}}>
			<ThreeCanvas width={Math.round(width)} height={Math.round(height - strip - captionHeight)} camera={{position: [0, 0, distance], fov: 40, near: 0.1, far: 100}} gl={{antialias: true, preserveDrawingBuffer: true}} style={{background: 'transparent'}}>
				<ambientLight intensity={0.75} />
				<directionalLight position={[5, 8, 6]} intensity={1.2} />
				<directionalLight position={[-6, 3, -4]} intensity={0.35} />
				<group rotation={[pitch, 0, 0]}>{children}</group>
			</ThreeCanvas>
			{/* Labels and measuring lines drawn over the figure, at points projected with the same camera (see projector). */}
			{overlay ? <svg width={Math.round(width)} height={Math.round(height - strip - captionHeight)} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{overlay}</svg> : null}
			</div>
			<div style={{height: captionHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(28), color: palette.ink}}>{caption ?? ''}</div>
		</div>
	);
};

/** A flat face with its outline, in its parent's frame: lying in the XZ plane, centred at `centre`. */
export const Face: React.FC<{shape: THREE.Shape; colour: string; edge: string; opacity?: number}> = ({shape, colour, edge, opacity = 0.92}) => {
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
export const rect = (x0: number, x1: number, z0: number, z1: number) => {
	const shape = new THREE.Shape();
	shape.moveTo(x0, -z0);
	shape.lineTo(x1, -z0);
	shape.lineTo(x1, -z1);
	shape.lineTo(x0, -z1);
	shape.closePath();
	return shape;
};

export const polygon = (points: [number, number][]) => {
	const shape = new THREE.Shape();
	points.forEach(([x, z], index) => (index === 0 ? shape.moveTo(x, -z) : shape.lineTo(x, -z)));
	shape.closePath();
	return shape;
};
