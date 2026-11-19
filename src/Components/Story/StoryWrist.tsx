import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ScreenSlider, sequenceDevice, WatchCase, watchMeasures, type ShownScreen} from './StoryDevice';
import {useStoryLook} from './StoryLook';
import {STUDENT_COLORS} from './StoryStudent';

/**
 * The watch on the wrist, close up (Sosyal Medya, 19 Nov 2026, the December watch reels): the student's forearm runs
 * across the frame from the shirt sleeve to the hand, the strap round the wrist and the watch on top, showing real
 * UI/UX watch screens (k-…) in sequence, each by its own transition. The square Apple Watch and the round Wear OS
 * watch are drawn by the same API, chosen by the screens. The arm rises into place at `at` (looking at the watch);
 * `buzzes` vibrate the watch, `taps` bring the other hand's fingertip to the glass. No brand mark on the watch or the
 * strap. The box is the watch case's own (`width` wide), so an item is placed by its watch; the arm reaches out of it.
 */

type ScreenTransition = NonNullable<ShownScreen['transition']>;

const STRAP = '#1F2937';
const STRAP_EDGE = '#111827';

/** How long the arm takes to rise into place. */
const RAISE_SECONDS = 0.45;

export const StoryWrist: React.FC<{
	id?: string;
	screens?: readonly ShownScreen[];
	width: number;
	at?: number;
	rotate?: number;
	transition?: ScreenTransition;
	buzzes?: readonly {at: number}[];
	taps?: readonly {at: number; x: number; y: number}[];
}> = ({id, screens: given, width, at = 0, rotate = -8, transition = 'slide', buzzes = [], taps = []}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const look = useStoryLook();
	const screens = given ?? (id ? [{id, at: 0}] : []);
	const {kind, screen} = sequenceDevice(screens);
	if (kind !== 'appleWatch' && kind !== 'wearWatch') throw new Error(`StoryWrist yalnız saat ekranı gösterir (${screens[0].id}).`);
	const round = kind === 'wearWatch';
	const {caseHeight, strapWidth} = watchMeasures(round, screen, width);
	const cx = width / 2;
	const cy = caseHeight / 2;
	// The wrist is a little wider than the case is tall; the forearm widens towards the elbow.
	const wrist = caseHeight * 0.6;
	const elbow = wrist * 1.22;
	const raised = interpolate(seconds, [at, at + RAISE_SECONDS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const lift = 1 - (1 - raised) ** 3;
	const left = cx - width * 5;
	const right = cx + width * 2.3;
	const box = {x: left, y: cy - elbow * 1.6, width: right - left, height: elbow * 3.2};
	const p = (x: number, y: number) => `${x - box.x} ${y - box.y}`;
	const handStart = cx + width * 0.8;
	return (
		<div style={{position: 'relative', width, height: caseHeight, transform: `translateY(${(1 - lift) * caseHeight * 1.8}px) rotate(${rotate + (1 - lift) * 14}deg)`, transformOrigin: `${-width * 2}px ${cy}px`}}>
			<svg width={box.width} height={box.height} viewBox={`0 0 ${box.width} ${box.height}`} style={{position: 'absolute', left: box.x, top: box.y, overflow: 'visible'}}>
				<defs>
					<linearGradient id="story-wrist-skin" gradientUnits="userSpaceOnUse" x1="0" y1={cy - wrist * 1.15 - box.y} x2="0" y2={cy + wrist * 1.15 - box.y}>
						<stop offset="0" stopColor={STUDENT_COLORS.skinShade} />
						<stop offset="0.35" stopColor={STUDENT_COLORS.skin} />
						<stop offset="0.7" stopColor={STUDENT_COLORS.skin} />
						<stop offset="1" stopColor={STUDENT_COLORS.skinShade} />
					</linearGradient>
					<linearGradient id="story-wrist-strap" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={STRAP_EDGE} />
						<stop offset="0.25" stopColor={STRAP} />
						<stop offset="0.75" stopColor={STRAP} />
						<stop offset="1" stopColor={STRAP_EDGE} />
					</linearGradient>
				</defs>
				{/* The hand: the back of a loose fist beyond the wrist, its four knuckles along the far edge, the thumb tucked along its lower side. */}
				<path
					d={`M${p(handStart - width * 0.1, cy - wrist)} C ${p(handStart + width * 0.3, cy - wrist * 1.08)}, ${p(handStart + width * 0.62, cy - wrist * 1.02)}, ${p(handStart + width * 0.74, cy - wrist * 0.78)} ${[-0.78, -0.39, 0, 0.39].map((y) => `Q ${p(handStart + width * 0.86, cy + wrist * (y + 0.195))}, ${p(handStart + width * 0.74, cy + wrist * (y + 0.39))}`).join(' ')} C ${p(handStart + width * 0.6, cy + wrist * 0.98)}, ${p(handStart + width * 0.3, cy + wrist * 1.04)}, ${p(handStart - width * 0.1, cy + wrist)} Z`}
					fill="url(#story-wrist-skin)"
				/>
				<path d={`M${p(handStart + width * 0.12, cy + wrist * 0.92)} C ${p(handStart + width * 0.3, cy + wrist * 1.22)}, ${p(handStart + width * 0.56, cy + wrist * 1.2)}, ${p(handStart + width * 0.64, cy + wrist * 0.9)}`} fill={STUDENT_COLORS.skinShade} />
				{/* The forearm from under the sleeve to the wrist. */}
				<path d={`M${p(cx - width * 3.6, cy - elbow)} L ${p(handStart, cy - wrist)} L ${p(handStart, cy + wrist)} L ${p(cx - width * 3.6, cy + elbow)} Z`} fill="url(#story-wrist-skin)" />
				{/* The sleeve: the student's blue shirt, its cuff a shade darker. */}
				<rect x={left - box.x} y={cy - elbow * 1.3 - box.y} width={cx - width * 2.9 - left} height={elbow * 2.6} rx={elbow * 0.35} fill={STUDENT_COLORS.shirt} />
				<rect x={cx - width * 3.25 - box.x} y={cy - elbow * 1.3 - box.y} width={width * 0.35} height={elbow * 2.6} rx={elbow * 0.2} fill={STUDENT_COLORS.shirtShade} />
				{/* The strap round the wrist, darker where it turns under. */}
				<rect x={cx - strapWidth / 2 - box.x} y={cy - wrist * 1.06 - box.y} width={strapWidth} height={wrist * 2.12} rx={strapWidth * 0.12} fill="url(#story-wrist-strap)" />
			</svg>
			<WatchCase round={round} screen={screen} width={width} buzzes={buzzes} taps={taps} ringColor={look.accent}>
				<ScreenSlider screens={screens} size={screen} mode="dark" transition={transition} />
			</WatchCase>
		</div>
	);
};
