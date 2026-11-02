import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useStillFigure, useVisualPalette} from '../VisualFrame';

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
/**
 * Heights of the stage strip above a 3D figure and of its caption below. A small box (a question's figure in the
 * solution panel, about 330 units tall) has neither: the two bands took 100 of its units and the pyramid was drawn
 * a third of its size, under a strip of stage names that meant nothing in a question (KPSS Geometri 13, 1 Nov 2026).
 */
export const frame3DBands = (u: (value: number) => number, height: number) => (height < u(COMPACT_HEIGHT) ? {strip: 0, captionHeight: 0} : {strip: u(52), captionHeight: u(48)});

/**
 * The bands of a 3D figure as it is drawn: none in an app still (the figure alone), else by its height. The figure and
 * the measures drawn over it must agree: a cone's measures were placed for a canvas shortened by the bands while the
 * still drew it full height, and its radius sat half way up, its height line over the apex (Soru revizyonu, 2 Nov 2026).
 */
export const useFrame3DBands = (height: number) => {
	const {u} = useVideoLayout();
	return useStillFigure() ? {strip: 0, captionHeight: 0} : frame3DBands(u, height);
};

/** Below this height (in layout units) a 3D figure drops its stage strip and caption. */
export const COMPACT_HEIGHT = 420;

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
	// An app still shows the figure alone: no stage strip, and no name under it that could answer a question.
	const {strip, captionHeight} = useFrame3DBands(height);
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column'}}>
			<div style={{height: strip, display: strip ? 'flex' : 'none', gap: u(10), alignItems: 'flex-start', fontFamily: palette.fontDisplay}}>
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
			<div style={{height: captionHeight, display: captionHeight ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', fontFamily: palette.fontBody, fontWeight: 800, fontSize: u(28), color: palette.ink}}>{caption ?? ''}</div>
		</div>
	);
};

/**
 * How much a solid's face glows in its own colour, on top of the lights. The lights alone left the light lesson-colour
 * tints a dark slate (three.js lights are physical now, and the scene's are dim); the glow keeps the shading but shows
 * the colour the lesson uses, like the flat figures' light fills (KPSS Geometri 12, 1 Nov 2026). No tone mapping either:
 * it greyed the colours further.
 */
const SOLID_GLOW = 0.55;

/** The material of every solid's faces: the colour, its glow, seen from both sides, slightly see-through. */
export const SolidMaterial: React.FC<{colour: string; opacity?: number}> = ({colour, opacity = 0.92}) => (
	<meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={SOLID_GLOW} side={THREE.DoubleSide} transparent opacity={opacity} roughness={0.6} toneMapped={false} />
);

/** A flat face with its outline, in its parent's frame: lying in the XZ plane. */
export const Face: React.FC<{shape: THREE.Shape; colour: string; edge: string; opacity?: number}> = ({shape, colour, edge, opacity = 0.92}) => {
	const geometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);
	const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
	return (
		<group rotation={[-Math.PI / 2, 0, 0]}>
			<mesh geometry={geometry}>
				<SolidMaterial colour={colour} opacity={opacity} />
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
