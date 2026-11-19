import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {lerp} from '../../Animations/Motion';

/**
 * The drawn student of the story reels (sinavika.tr, 15 Nov 2026): one character for every reel, front on behind a
 * desk, built from numbers so poses blend into each other. A pose is the angles of body, head and arms and the
 * face (eyes, brows, mouth); `keys` say which pose holds from when, and each change eases over a third of a second.
 * The student blinks now and then, so a held pose is never a still picture.
 */

type StudentPose = {
	/** Sideways tilt of the body (degrees) and how far the shoulders sink (px). */
	lean: number;
	sink: number;
	/** Head tilt (degrees) and how far it hangs (px). */
	headTilt: number;
	headDrop: number;
	/** Each arm from the shoulder: upper arm angle from straight down, outwards positive; elbow bend upwards/inwards (degrees). */
	leftArm: readonly [number, number];
	rightArm: readonly [number, number];
	/** 0 closed … 1 open … 1.3 wide; `smile` closes the eyes into happy arcs. */
	eyes: number;
	smileEyes: number;
	/** Where the eyes look: −1…1 sideways, −1…1 up/down. */
	lookX: number;
	lookY: number;
	/** Brows: lift (px) and slant (degrees; positive is worried, inner ends up). */
	browLift: number;
	browSlant: number;
	/** Mouth: −1 frown … 1 smile, and how open (0…1). */
	mouthCurve: number;
	mouthOpen: number;
	/** The phone in the right hand, 0…1. */
	phone: number;
	/** The watch's glass lit, 0…1 (when the student wears one: `watch`). */
	watchLit: number;
};

export const STUDENT_POSES = {
	/** Slumped over the desk: worn out, arms folded on it, eyes half shut. */
	slumped: {lean: -4, sink: 34, headTilt: -14, headDrop: 34, leftArm: [22, 112], rightArm: [22, 112], eyes: 0.32, smileEyes: 0, lookX: 0, lookY: 0.6, browLift: -4, browSlant: 10, mouthCurve: -0.55, mouthOpen: 0, phone: 0, watchLit: 0},
	/** Sitting up, hands on the desk, ready. */
	upright: {lean: 0, sink: 0, headTilt: 0, headDrop: 0, leftArm: [14, 74], rightArm: [14, 74], eyes: 1, smileEyes: 0, lookX: 0, lookY: 0, browLift: 0, browSlant: 0, mouthCurve: 0.25, mouthOpen: 0, phone: 0, watchLit: 0},
	/** Caught by a fact: hands up to the face, eyes wide, mouth open. */
	surprised: {lean: 0, sink: -6, headTilt: 3, headDrop: -6, leftArm: [110, -115], rightArm: [110, -115], eyes: 1.3, smileEyes: 0, lookX: 0, lookY: -0.2, browLift: 16, browSlant: -4, mouthCurve: 0, mouthOpen: 0.9, phone: 0, watchLit: 0},
	/** Pleased: arms up in a V, eyes smiling, mouth open in a laugh. */
	happy: {lean: 2, sink: -10, headTilt: 6, headDrop: -8, leftArm: [148, 18], rightArm: [148, 18], eyes: 1, smileEyes: 1, lookX: 0, lookY: 0, browLift: 8, browSlant: -6, mouthCurve: 1, mouthOpen: 0.55, phone: 0, watchLit: 0},
	/** Looking down at the phone in the right hand, the left hand on the desk. */
	phone: {lean: 3, sink: 6, headTilt: -6, headDrop: 10, leftArm: [14, 74], rightArm: [12, 128], eyes: 0.9, smileEyes: 0, lookX: 0.25, lookY: 0.85, browLift: 2, browSlant: 0, mouthCurve: 0.15, mouthOpen: 0, phone: 1, watchLit: 0},
	/** Wrist raised in front of the chest, looking at the watch on it (Sosyal Medya, 19 Nov 2026). */
	wrist: {lean: 2, sink: 2, headTilt: 6, headDrop: 8, leftArm: [14, 74], rightArm: [30, 161], eyes: 1, smileEyes: 0, lookX: 0.6, lookY: 0.6, browLift: 3, browSlant: 0, mouthCurve: 0.3, mouthOpen: 0, phone: 0, watchLit: 1},
	/** The wrist raised and the other hand's finger on the watch. */
	wristTap: {lean: 2, sink: 2, headTilt: 6, headDrop: 8, leftArm: [-40, 68.6], rightArm: [30, 161], eyes: 1, smileEyes: 0, lookX: 0.6, lookY: 0.75, browLift: 4, browSlant: 0, mouthCurve: 0.35, mouthOpen: 0, phone: 0, watchLit: 1},
} as const satisfies Record<string, StudentPose>;

type StudentPoseName = keyof typeof STUDENT_POSES;

/** How long a change of pose takes. */
const BLEND_SECONDS = 0.35;

const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Every number of two poses mixed by `t`. */
export const blendPoses = (from: StudentPose, to: StudentPose, t: number): StudentPose => ({
	lean: lerp(from.lean, to.lean, t),
	sink: lerp(from.sink, to.sink, t),
	headTilt: lerp(from.headTilt, to.headTilt, t),
	headDrop: lerp(from.headDrop, to.headDrop, t),
	leftArm: [lerp(from.leftArm[0], to.leftArm[0], t), lerp(from.leftArm[1], to.leftArm[1], t)],
	rightArm: [lerp(from.rightArm[0], to.rightArm[0], t), lerp(from.rightArm[1], to.rightArm[1], t)],
	eyes: lerp(from.eyes, to.eyes, t),
	smileEyes: lerp(from.smileEyes, to.smileEyes, t),
	lookX: lerp(from.lookX, to.lookX, t),
	lookY: lerp(from.lookY, to.lookY, t),
	browLift: lerp(from.browLift, to.browLift, t),
	browSlant: lerp(from.browSlant, to.browSlant, t),
	mouthCurve: lerp(from.mouthCurve, to.mouthCurve, t),
	mouthOpen: lerp(from.mouthOpen, to.mouthOpen, t),
	phone: lerp(from.phone, to.phone, t),
	watchLit: lerp(from.watchLit, to.watchLit, t),
});

type PoseKey = {at: number; pose: StudentPoseName};

/** The pose `seconds` into the scene: the last key reached, eased in from the one before it. */
export const poseAt = (keys: readonly PoseKey[], seconds: number): StudentPose => {
	const reached = keys.filter((key) => key.at <= seconds);
	if (reached.length === 0) return STUDENT_POSES[keys[0]?.pose ?? 'upright'];
	const current = reached.at(-1)!;
	const before = reached.at(-2);
	if (!before) return STUDENT_POSES[current.pose];
	const t = ease(Math.min(1, (seconds - current.at) / BLEND_SECONDS));
	return blendPoses(STUDENT_POSES[before.pose], STUDENT_POSES[current.pose], t);
};

/** A blink every few seconds: 0 open … 1 shut, for 0.14 s. Deterministic, so every frame agrees. */
export const blinkAt = (seconds: number): number => {
	const period = 3.1;
	const phase = (seconds + 1.3) % period;
	return phase < 0.14 ? Math.sin((phase / 0.14) * Math.PI) : 0;
};

export const STUDENT_COLORS = {skin: '#F2C7A5', skinShade: '#E3AE8A', hair: '#2B1D16', shirt: '#2563EB', shirtShade: '#1D4ED8', collar: '#FFFFFF', ink: '#1E1B18', mouth: '#7F1D1D', tongue: '#F87171', desk: '#9A5B36', deskTop: '#B66E43', deskEdge: '#7C4A2D', phone: '#0F172A', phoneScreen: '#38BDF8', cheek: '#FB7185'};

const UPPER = 98;
const LOWER = 88;

/** Shoulder → elbow → hand for one arm; `side` −1 is the student's right on screen left. */
const armPoints = (shoulder: readonly [number, number], arm: readonly [number, number], side: -1 | 1) => {
	const toRad = (degrees: number) => (degrees * Math.PI) / 180;
	const upper = toRad(arm[0]);
	const fore = toRad(arm[0] - arm[1]);
	const elbow = [shoulder[0] + side * Math.sin(upper) * UPPER, shoulder[1] + Math.cos(upper) * UPPER] as const;
	const hand = [elbow[0] + side * Math.sin(fore) * LOWER, elbow[1] + Math.cos(fore) * LOWER] as const;
	return {elbow, hand};
};

const WATCH_BODY = '#0B0F17';
const WATCH_STRAP = '#1F2937';

/** The watch on the forearm, three quarters of the way to the hand, across the arm; the glass lights by `lit`. */
const WristWatch: React.FC<{elbow: readonly [number, number]; hand: readonly [number, number]; round: boolean; lit: number; color: string}> = ({elbow, hand, round, lit, color}) => {
	const x = lerp(elbow[0], hand[0], 0.72);
	const y = lerp(elbow[1], hand[1], 0.72);
	const angle = (Math.atan2(hand[1] - elbow[1], hand[0] - elbow[0]) * 180) / Math.PI;
	return (
		<g transform={`translate(${x} ${y}) rotate(${angle})`}>
			<rect x={-8} y={-25} width={16} height={50} rx={4} fill={WATCH_STRAP} />
			<g transform={`rotate(${-angle})`}>
				{round ? <circle r={17} fill={WATCH_BODY} /> : <rect x={-15} y={-17} width={30} height={34} rx={8} fill={WATCH_BODY} />}
				{round ? <circle r={13} fill={color} opacity={0.15 + 0.85 * lit} /> : <rect x={-11.5} y={-13.5} width={23} height={27} rx={5} fill={color} opacity={0.15 + 0.85 * lit} />}
			</g>
		</g>
	);
};

/**
 * The student, drawn in a 440 × 560 box (scaled to `size` wide). `keys` set the poses over time; `desk` draws the
 * desk in front (the arms rest on it). The desk and the phone are part of the drawing so a pose's hands land on them.
 * `watch` puts a watch on the left wrist (screen right): square (Apple Watch) or round (Wear OS), no brand mark; its
 * glass lights when the student looks at it (`wrist`, `wristTap`).
 */
export const StoryStudent: React.FC<{keys: readonly PoseKey[]; size?: number; desk?: boolean; watch?: 'apple' | 'wear'; watchColor?: string}> = ({keys, size = 440, desk = true, watch, watchColor = '#38BDF8'}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const pose = poseAt(keys, seconds);
	const blink = blinkAt(seconds);
	// A slow breath, so a held pose still moves.
	const breath = Math.sin(seconds * 2.2) * 3;
	const hip = [220, 470] as const;
	const neck = [220 + pose.lean * 1.2, 300 + pose.sink + breath] as const;
	const shoulders = {left: [neck[0] - 74, neck[1] + 18] as const, right: [neck[0] + 74, neck[1] + 18] as const};
	const head = [neck[0] + pose.headTilt * 0.8, neck[1] - 92 + pose.headDrop] as const;
	const left = armPoints(shoulders.left, pose.leftArm, -1);
	const right = armPoints(shoulders.right, pose.rightArm, 1);
	const eyeOpen = Math.max(0.05, pose.eyes * (1 - blink));
	const eyeY = head[1] + 4;
	const look = {x: pose.lookX * 6, y: pose.lookY * 5};
	const mouthY = head[1] + 46;
	const mouthW = 30 + pose.mouthOpen * 6;
	const curve = pose.mouthCurve * 14;
	const arm = (points: ReturnType<typeof armPoints>, shoulder: readonly [number, number]) => (
		<>
			<path d={`M${shoulder[0]} ${shoulder[1]} L${points.elbow[0]} ${points.elbow[1]} L${points.hand[0]} ${points.hand[1]}`} fill="none" stroke={STUDENT_COLORS.shirt} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={points.hand[0]} cy={points.hand[1]} r={21} fill={STUDENT_COLORS.skin} />
		</>
	);
	return (
		<svg width={size} height={(size * 560) / 440} viewBox="0 0 440 560" style={{overflow: 'visible'}}>
			{/* The body: shirt with a collar, tilted with the lean. */}
			<g transform={`rotate(${pose.lean} ${hip[0]} ${hip[1]})`}>
				<path d={`M${hip[0] - 100} ${hip[1] + 40} C ${hip[0] - 104} ${neck[1] + 60}, ${neck[0] - 96} ${neck[1] + 10}, ${neck[0] - 40} ${neck[1]} L ${neck[0] + 40} ${neck[1]} C ${neck[0] + 96} ${neck[1] + 10}, ${hip[0] + 104} ${neck[1] + 60}, ${hip[0] + 100} ${hip[1] + 40} Z`} fill={STUDENT_COLORS.shirt} />
				<path d={`M${neck[0] - 30} ${neck[1] + 2} L ${neck[0]} ${neck[1] + 34} L ${neck[0] + 30} ${neck[1] + 2}`} fill={STUDENT_COLORS.collar} />
				<rect x={neck[0] - 18} y={neck[1] - 24} width={36} height={30} rx={10} fill={STUDENT_COLORS.skinShade} />
			</g>
			{/* The head: face, ears, hair, then the features. */}
			<g transform={`rotate(${pose.headTilt} ${head[0]} ${head[1] + 40})`}>
				<circle cx={head[0] - 66} cy={head[1] + 8} r={15} fill={STUDENT_COLORS.skinShade} />
				<circle cx={head[0] + 66} cy={head[1] + 8} r={15} fill={STUDENT_COLORS.skinShade} />
				<ellipse cx={head[0]} cy={head[1]} rx={68} ry={76} fill={STUDENT_COLORS.skin} />
				<path d={`M${head[0] - 70} ${head[1] - 6} C ${head[0] - 78} ${head[1] - 84}, ${head[0] + 70} ${head[1] - 104}, ${head[0] + 72} ${head[1] - 12} C ${head[0] + 48} ${head[1] - 46}, ${head[0] - 6} ${head[1] - 56}, ${head[0] - 34} ${head[1] - 34} C ${head[0] - 44} ${head[1] - 22}, ${head[0] - 58} ${head[1] - 18}, ${head[0] - 70} ${head[1] - 6} Z`} fill={STUDENT_COLORS.hair} />
				{/* Brows. */}
				{[-1, 1].map((side) => (
					<line
						key={`b${side}`}
						x1={head[0] + side * 14}
						y1={eyeY - 26 - pose.browLift - pose.browSlant * 0.6}
						x2={head[0] + side * 40}
						y2={eyeY - 26 - pose.browLift + pose.browSlant * 0.6}
						stroke={STUDENT_COLORS.hair}
						strokeWidth={6}
						strokeLinecap="round"
					/>
				))}
				{/* Eyes: open ovals with pupils that look, or happy arcs. */}
				{[-1, 1].map((side) =>
					pose.smileEyes > 0.5 ? (
						<path key={`e${side}`} d={`M${head[0] + side * 27 - 12} ${eyeY + 4} Q ${head[0] + side * 27} ${eyeY - 10}, ${head[0] + side * 27 + 12} ${eyeY + 4}`} fill="none" stroke={STUDENT_COLORS.ink} strokeWidth={5} strokeLinecap="round" />
					) : (
						<g key={`e${side}`}>
							<ellipse cx={head[0] + side * 27} cy={eyeY} rx={11} ry={13 * eyeOpen} fill="#FFFFFF" />
							<ellipse cx={head[0] + side * 27 + look.x} cy={eyeY + look.y * eyeOpen} rx={6.5} ry={Math.min(7.5, 13 * eyeOpen)} fill={STUDENT_COLORS.ink} />
						</g>
					),
				)}
				{pose.smileEyes > 0.5 || pose.mouthCurve > 0.6 ? (
					<>
						<ellipse cx={head[0] - 44} cy={eyeY + 26} rx={11} ry={6} fill={STUDENT_COLORS.cheek} opacity={0.45} />
						<ellipse cx={head[0] + 44} cy={eyeY + 26} rx={11} ry={6} fill={STUDENT_COLORS.cheek} opacity={0.45} />
					</>
				) : null}
				{/* Mouth: a line that curves, or an open mouth. */}
				{pose.mouthOpen > 0.15 ? (
					<path
						d={`M${head[0] - mouthW / 2} ${mouthY - curve * 0.3} Q ${head[0]} ${mouthY + curve + pose.mouthOpen * 26}, ${head[0] + mouthW / 2} ${mouthY - curve * 0.3} Q ${head[0]} ${mouthY - curve * 0.3 - pose.mouthOpen * 6}, ${head[0] - mouthW / 2} ${mouthY - curve * 0.3} Z`}
						fill={STUDENT_COLORS.mouth}
					/>
				) : (
					<path d={`M${head[0] - mouthW / 2} ${mouthY} Q ${head[0]} ${mouthY + curve}, ${head[0] + mouthW / 2} ${mouthY}`} fill="none" stroke={STUDENT_COLORS.mouth} strokeWidth={5} strokeLinecap="round" />
				)}
			</g>
			{/* The desk, in front of the body and under the arms. */}
			{desk ? (
				<g>
					<rect x={-40} y={456} width={520} height={30} rx={8} fill={STUDENT_COLORS.deskTop} />
					<rect x={-40} y={482} width={520} height={90} fill={STUDENT_COLORS.desk} />
					<rect x={-40} y={482} width={520} height={8} fill={STUDENT_COLORS.deskEdge} />
				</g>
			) : null}
			{/* Arms over the desk: the watch arm first, so the other hand can reach over it; the phone in the right hand. */}
			{arm(right, shoulders.right)}
			{watch ? <WristWatch elbow={right.elbow} hand={right.hand} round={watch === 'wear'} lit={pose.watchLit} color={watchColor} /> : null}
			{arm(left, shoulders.left)}
			{pose.phone > 0.02 ? (
				<g opacity={pose.phone} transform={`translate(${right.hand[0] - 30} ${right.hand[1] - 92}) rotate(-8 30 46)`}>
					<rect x={0} y={0} width={60} height={104} rx={11} fill={STUDENT_COLORS.phone} />
					<rect x={6} y={10} width={48} height={82} rx={6} fill={STUDENT_COLORS.phoneScreen} />
				</g>
			) : null}
		</svg>
	);
};
