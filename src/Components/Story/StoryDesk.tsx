import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../Themes/ThemeContext';
import {SoundEffect} from '../Sounds/SoundEffect';
import {landing} from './StoryCard';
import {STORY_COLORS} from './StoryLook';
import {Paper} from './StoryMaterial';

/**
 * Small objects of a study scene ("Dediniz, yaptık" D1, Sosyal Medya, 20 Nov 2026: "Kendi denemen de sayılır"): a
 * library desk with its green lamp, a test booklet in another publisher's colour (no real name or logo), and the slip
 * on which the student writes the net in a corner before it slides off the desk and falls out of the picture.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSeconds = () => useCurrentFrame() / useVideoConfig().fps;

const WOOD = {top: '#B98552', grain: '#A8743F', edge: '#7C4F26', leg: '#5E3A1A'};
const LAMP = {shade: '#166534', shadeLight: '#22C55E', brass: '#B08D57', glow: '#FDE68A'};

/**
 * A library desk seen a little from above, `width` wide: the top with its grain, the front edge and two legs; with
 * `lamp` the green library lamp on its left, its light breathing on the wood. It stands behind the student and the
 * cards; place the student so their arms rest on its top (about a third down).
 */
export const LibraryDesk: React.FC<{width?: number; lamp?: boolean; at?: number}> = ({width = 1000, lamp = true, at = 0}) => {
	const seconds = useSeconds();
	const top = width * 0.3;
	const edge = width * 0.05;
	const leg = width * 0.36;
	const breathe = 0.85 + 0.15 * Math.sin(seconds * 2);
	return (
		<div style={{position: 'relative', width, height: top + edge + leg, opacity: seconds < at ? 0 : 1}}>
			{lamp ? (
				<div style={{position: 'absolute', left: width * 0.07, top: -width * 0.25, width: width * 0.3, height: width * 0.3}}>
					<div style={{position: 'absolute', left: -width * 0.1, top: width * 0.12, width: width * 0.5, height: width * 0.3, borderRadius: '50%', background: `radial-gradient(ellipse at 50% 40%, ${LAMP.glow}${Math.round(0.55 * breathe * 255).toString(16).padStart(2, '0')} 0%, ${LAMP.glow}00 65%)`}} />
					<div style={{position: 'absolute', left: width * 0.135, top: width * 0.09, width: width * 0.02, height: width * 0.17, background: LAMP.brass, borderRadius: 4}} />
					<div style={{position: 'absolute', left: width * 0.075, top: width * 0.245, width: width * 0.14, height: width * 0.03, background: LAMP.brass, borderRadius: width * 0.015}} />
					<div style={{position: 'absolute', left: 0, top: width * 0.04, width: width * 0.29, height: width * 0.07, borderRadius: `${width * 0.08}px ${width * 0.08}px ${width * 0.01}px ${width * 0.01}px`, background: `linear-gradient(180deg, ${LAMP.shadeLight} 0%, ${LAMP.shade} 70%)`, boxShadow: `0 ${width * 0.012}px 0 ${LAMP.brass}`}} />
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width,
					height: top,
					clipPath: `polygon(${width * 0.06}px 0, ${width * 0.94}px 0, ${width}px ${top}px, 0 ${top}px)`,
					background: `repeating-linear-gradient(178deg, ${WOOD.top} 0 ${width * 0.03}px, ${WOOD.grain} ${width * 0.03}px ${width * 0.034}px), ${WOOD.top}`,
				}}
			/>
			<div style={{position: 'absolute', left: 0, top, width, height: edge, background: WOOD.edge, borderRadius: `0 0 ${edge * 0.3}px ${edge * 0.3}px`, boxShadow: '0 18px 30px -18px rgba(0,0,0,0.6)'}} />
			{[0.06, 0.88].map((x) => (
				<div key={x} style={{position: 'absolute', left: width * x, top: top + edge, width: width * 0.06, height: leg, background: WOOD.leg}} />
			))}
		</div>
	);
};

/**
 * A test booklet of another publisher: a cover in its own colour (never the brand orange), a white band with the
 * test's name, a made-up round mark and a line of fine print. Lands like a card.
 */
export const ExamBooklet: React.FC<{title?: string; subtitle?: string; color?: string; width?: number; tilt?: number; at?: number}> = ({title = 'TYT Deneme 3', subtitle = 'Yayın denemesi', color = '#0F766E', width = 420, tilt = -6, at = 0}) => {
	const seconds = useSeconds();
	const {typography} = useTheme();
	const height = width * 1.38;
	return (
		<div style={{display: 'inline-block', ...landing(seconds, at, tilt)}}>
			<div style={{position: 'relative', width, height, borderRadius: `${width * 0.02}px ${width * 0.04}px ${width * 0.04}px ${width * 0.02}px`, background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`, boxShadow: '0 2px 4px rgba(15,23,42,0.18), 0 24px 40px -18px rgba(15,23,42,0.5)', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.05, background: 'rgba(0,0,0,0.18)'}} />
				<div style={{position: 'absolute', left: width * 0.16, top: width * 0.14, width: width * 0.2, height: width * 0.2, borderRadius: '50%', border: `${width * 0.018}px solid rgba(255,255,255,0.85)`}} />
				<div style={{position: 'absolute', left: width * 0.05, right: 0, top: height * 0.38, padding: `${width * 0.05}px ${width * 0.1}px`, background: '#FFFFFF'}}>
					<div style={{fontFamily: typography.display, fontWeight: 800, fontSize: width * 0.1, color: STORY_COLORS.ink, lineHeight: 1.1}}>{title}</div>
					<div style={{fontFamily: typography.body, fontWeight: 700, fontSize: width * 0.055, color: STORY_COLORS.pencil, marginTop: width * 0.02}}>{subtitle}</div>
				</div>
				{[0.78, 0.83].map((y) => (
					<div key={y} style={{position: 'absolute', left: width * 0.16, width: width * 0.6, top: height * y, height: width * 0.018, borderRadius: 4, background: 'rgba(255,255,255,0.5)'}} />
				))}
			</div>
			<SoundEffect id="flip" atSeconds={at} volume={0.7} />
		</div>
	);
};

const SLIDE_SECONDS = 0.4;
const FALL_SECONDS = 0.9;

/**
 * Where the slip is `seconds` into the scene after it starts to go at `fall` (pixels and degrees): it slides to the
 * desk's edge, tips over it and falls out of the picture, turning. `side` 1 goes right, -1 left.
 */
export const slipFall = (seconds: number, fall: number | undefined, side: 1 | -1 = 1): {x: number; y: number; rotate: number} => {
	if (fall === undefined || seconds < fall) return {x: 0, y: 0, rotate: 0};
	const slide = interpolate(seconds, [fall, fall + SLIDE_SECONDS], [0, 1], CLAMP);
	const drop = interpolate(seconds, [fall + SLIDE_SECONDS, fall + SLIDE_SECONDS + FALL_SECONDS], [0, 1], CLAMP);
	return {x: side * (260 * slide ** 2 + 220 * drop), y: 1900 * drop ** 2, rotate: side * (6 * slide + 70 * drop)};
};

/**
 * The slip of paper with the net: a ruled sheet with a few pencil lines; at `write` the net is written in red pen in
 * its upper right corner, stroke by stroke; at `fall` it slides off the desk and falls away (slipFall).
 */
export const NetSlip: React.FC<{net: string; write?: number; fall?: number; side?: 1 | -1; width?: number; tilt?: number; at?: number}> = ({net, write, fall, side = 1, width = 440, tilt = 4, at = 0}) => {
	const seconds = useSeconds();
	const {typography} = useTheme();
	const written = write === undefined ? 0 : interpolate(seconds, [write, write + 0.45], [0, 1], CLAMP);
	const away = slipFall(seconds, fall, side);
	return (
		<div style={{display: 'inline-block', ...landing(seconds, at, 0)}}>
			<div style={{transform: `translate(${away.x}px, ${away.y}px) rotate(${tilt + away.rotate}deg)`, transformOrigin: '50% 100%'}}>
				<Paper width={width} height={width * 0.78} ruled padding={0} style={{overflow: 'hidden'}}>
					{[0.3, 0.44, 0.58].map((y, index) => (
						<div key={y} style={{position: 'absolute', left: width * 0.22, top: width * 0.78 * y, width: width * (0.55 - index * 0.12), height: 5, borderRadius: 3, background: STORY_COLORS.pencil, opacity: 0.45}} />
					))}
					<div style={{position: 'absolute', right: width * 0.07, top: width * 0.05, fontFamily: typography.display, fontWeight: 800, fontSize: width * 0.15, color: STORY_COLORS.redPen, transform: 'rotate(-6deg)', clipPath: `inset(0 ${(1 - written) * 100}% 0 0)`}}>{net}</div>
				</Paper>
			</div>
			{write !== undefined ? <SoundEffect id="chalk" atSeconds={write} volume={0.35} /> : null}
			{fall !== undefined ? <SoundEffect id="transitionWhoosh" atSeconds={fall + SLIDE_SECONDS} volume={0.6} /> : null}
		</div>
	);
};
