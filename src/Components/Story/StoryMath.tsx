import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {PHONE_GEOMETRY} from '../AppScreens/PhoneFrame';
import {SoundEffect} from '../Sounds/SoundEffect';
import {MathExpression} from '../Typography/MathExpression';
import {UI_CANVAS} from '../../UIUX/Tokens';
import {DeviceBrowser, DevicePhone} from '../../UIUX/Parts/Web';
import {storyScreen} from './StoryBefore';
import {useStoryLook} from './StoryLook';

/**
 * Mathematics as the hero of a scene ("Dediniz, yaptık" F4, Sosyal Medya, 20 Nov 2026: "Beş buçuk görünen üs"). The
 * glyphs are the engine's own formula drawing (KaTeX, MathExpression), big and plain on the ground; the engine moves
 * the parts as objects:
 *
 * - PowerMishap: 5^(1/2). `dropped` lets the exponent fall to the line beside the base, so it reads "5 ½" (what the
 *   phone showed before the fix); `right` lifts it back small and high, where it belongs.
 * - RootMishap: a root whose bar has come off (`broken`: the bar floats above, the hook alone) and clicks back onto
 *   the hook (`fixed`). The bar is the radicand's own top edge, so as terms come in it grows with them.
 * - MathMatch: the same expression on a phone and in a browser side by side; the two lift out of their screens, meet
 *   in the middle and lie exactly on each other (the accent copy over the ink one), then a tick.
 *
 * The broken states are a story staging of the bug, never a drawing of the app.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSeconds = () => useCurrentFrame() / useVideoConfig().fps;

/** Which state shows `seconds` into the scene and how far the change into it has come (0–1). */
const mathState = <S extends string>(steps: readonly {state: S; at: number}[], seconds: number, change: number): {state: S; from: S; progress: number; at: number} => {
	const index = Math.max(0, steps.reduce((last, step, position) => (step.at <= seconds ? position : last), -1));
	const step = steps[index];
	const from = index > 0 ? steps[index - 1].state : step.state;
	return {state: step.state, from, progress: index > 0 ? interpolate(seconds, [step.at, step.at + change], [0, 1], CLAMP) : 1, at: step.at};
};

const PLACES = {
	/** Small and high, in the exponent's place. */
	right: {x: 0.02, y: -0.62, scale: 0.58, rotate: 0},
	/** Fallen to the line beside the base, nearly full size: "5 ½". */
	dropped: {x: 0.14, y: 0.06, scale: 0.92, rotate: 0},
} as const;

type PowerState = keyof typeof PLACES;
const POWER_CHANGE = 0.5;

/** Where the exponent stands (em of the base's size) `seconds` into the scene: a fall lands and bounces, a lift settles. */
export const exponentPlace = (steps: readonly {state: PowerState; at: number}[], seconds: number) => {
	const {state, from, progress} = mathState(steps, seconds, POWER_CHANGE);
	const a = PLACES[from];
	const b = PLACES[state];
	// A fall speeds up and bounces once on the line; a lift overshoots a little and settles.
	const k = state === 'dropped' ? interpolate(progress, [0, 0.62, 0.8, 1], [0, 1, 0.9, 1], CLAMP) : interpolate(progress, [0, 0.7, 1], [0, 1.08, 1], CLAMP);
	const mix = (p: number, q: number) => p + (q - p) * k;
	const tumble = from !== state ? Math.sin(Math.PI * progress) * (state === 'dropped' ? 14 : -8) : 0;
	return {x: mix(a.x, b.x), y: mix(a.y, b.y), scale: mix(a.scale, b.scale), rotate: tumble};
};

export const PowerMishap: React.FC<{base?: string; exponent?: string; steps: readonly {state: PowerState; at: number}[]; size?: number; color?: string}> = ({base = '5', exponent = '\\frac{1}{2}', steps, size = 260, color}) => {
	const seconds = useSeconds();
	const look = useStoryLook();
	const place = exponentPlace(steps, seconds);
	return (
		<div style={{display: 'inline-flex', alignItems: 'center', fontSize: size, color: color ?? look.ink, lineHeight: 1}}>
			<MathExpression latex={base} />
			<span style={{display: 'inline-block', transform: `translate(${place.x}em, ${place.y}em) scale(${place.scale}) rotate(${place.rotate}deg)`, transformOrigin: 'left center'}}>
				<MathExpression latex={exponent} />
			</span>
			{steps.slice(1).map((step, index) => (
				<SoundEffect key={index} id={step.state === 'dropped' ? 'blockDrop' : 'puzzleSnap'} atSeconds={step.at + (step.state === 'dropped' ? POWER_CHANGE * 0.62 : POWER_CHANGE * 0.7)} volume={0.8} />
			))}
		</div>
	);
};

type RootState = 'broken' | 'fixed';
const ROOT_CHANGE = 0.45;
/** The stroke of the hook and the bar, in em: a little heavier than print, for a phone screen in a reel. */
const STROKE = 0.06;

/** The bar's offset from the hook (em) and tilt `seconds` into the scene: floating loose when broken, on the hook when fixed. */
export const rootBar = (steps: readonly {state: RootState; at: number}[], seconds: number) => {
	const {state, from, progress} = mathState(steps, seconds, ROOT_CHANGE);
	const loose = {x: 0.32, y: -0.58, rotate: -7};
	const bob = Math.sin(seconds * 3.2) * 0.04;
	const k = state === 'fixed' ? interpolate(progress, [0, 0.75, 1], [0, 1.06, 1], CLAMP) : interpolate(progress, [0, 1], [0, 1], CLAMP);
	const brokenness = state === 'fixed' ? (from === 'broken' ? 1 - k : 0) : from === 'fixed' ? k : 1;
	return {x: loose.x * brokenness, y: (loose.y + bob) * brokenness, rotate: loose.rotate * brokenness, loose: brokenness > 0.02};
};

/** How wide a term opens as it comes in (em): from nothing to room for its glyphs. */
const termRoom = (latex: string) => 0.62 * latex.replace(/\\[a-z]+|[{}\s]/gi, '').length + 0.4;

export const RootMishap: React.FC<{terms: readonly {latex: string; at: number}[]; steps: readonly {state: RootState; at: number}[]; size?: number; color?: string}> = ({terms, steps, size = 220, color}) => {
	const seconds = useSeconds();
	const look = useStoryLook();
	const ink = color ?? look.ink;
	const bar = rootBar(steps, seconds);
	return (
		<div style={{display: 'inline-flex', alignItems: 'stretch', fontSize: size, color: ink, lineHeight: 1.2, height: '1.45em'}}>
			<svg viewBox="0 0 64 145" style={{height: '1.45em', width: '0.64em', flexShrink: 0, overflow: 'visible'}}>
				<path d={`M2 86 L15 78 L33 136 L62 ${STROKE * 50}`} fill="none" stroke={ink} strokeWidth={STROKE * 100} strokeLinejoin="round" strokeLinecap="round" />
			</svg>
			<span style={{position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '0.16em 0.12em 0 0.06em'}}>
				<span style={{position: 'absolute', left: '-0.02em', right: 0, top: 0, height: `${STROKE}em`, background: ink, borderRadius: `${STROKE}em`, transform: `translate(${bar.x}em, ${bar.y}em) rotate(${bar.rotate}deg)`, transformOrigin: 'left center'}} />
				{terms.map((term, index) => {
					const open = index === 0 ? 1 : interpolate(seconds, [term.at, term.at + 0.32], [0, 1], CLAMP);
					return (
						<span key={index} style={{display: 'inline-block', maxWidth: `${termRoom(term.latex) * (1 - (1 - open) ** 3)}em`, overflow: 'hidden', whiteSpace: 'nowrap', opacity: Math.min(1, open * 1.5)}}>
							<MathExpression latex={term.latex} />
						</span>
					);
				})}
			</span>
			{steps.slice(1).map((step, index) => (step.state === 'fixed' ? <SoundEffect key={`s${index}`} id="puzzleSnap" atSeconds={step.at + ROOT_CHANGE * 0.75} volume={0.8} /> : null))}
			{terms.slice(1).map((term, index) => (
				<SoundEffect key={`t${index}`} id="uiTap" atSeconds={term.at} volume={0.6} />
			))}
		</div>
	);
};

const MATCH_MOVE = 0.7;
/** How strongly the real formula screens show behind the expression before the two meet (context, never read). */
const CONTEXT = 0.22;

/** Where the phone and the browser stand in a match `width` wide, and the centre of each one's glass (pixels). */
export const matchLayout = (width: number) => {
	const phone = width * 0.33;
	const browser = width * 0.6;
	const gap = width - phone - browser;
	const bezel = phone * PHONE_GEOMETRY.bezel;
	const phoneScale = (phone - bezel * 2) / 390;
	const phoneHeight = 844 * phoneScale + bezel * 2;
	const web = UI_CANVAS.web;
	const browserScale = browser / web.width;
	const browserHeight = 30 + web.height * browserScale;
	const browserTop = (phoneHeight - browserHeight) / 2;
	const phoneCentre = {x: phone / 2, y: phoneHeight / 2};
	const browserCentre = {x: phone + gap + browser / 2, y: browserTop + 30 + (web.height * browserScale) / 2};
	const meet = {x: (phoneCentre.x + browserCentre.x) / 2, y: (phoneCentre.y + browserCentre.y) / 2};
	return {phone, browser, gap, phoneScale, phoneHeight, browserScale, browserHeight, browserTop, phoneCentre, browserCentre, meet};
};

/**
 * How far each frame has moved `seconds` into the scene (pixels): from `meet` the phone and the browser slide towards
 * each other until the centres of their glasses lie on one point, the middle between them, and stay there.
 */
export const matchShift = (width: number, meet: number, seconds: number) => {
	const layout = matchLayout(width);
	const moved = interpolate(seconds, [meet, meet + MATCH_MOVE], [0, 1], CLAMP);
	const eased = moved < 0.5 ? 2 * moved * moved : 1 - (-2 * moved + 2) ** 2 / 2;
	return {
		phone: {x: (layout.meet.x - layout.phoneCentre.x) * eased, y: (layout.meet.y - layout.phoneCentre.y) * eased},
		browser: {x: (layout.meet.x - layout.browserCentre.x) * eased, y: (layout.meet.y - layout.browserCentre.y) * eased},
		eased,
	};
};

/**
 * The same expression on a phone and in a browser (F4: "Her ifadeyi webdeki çizimle tek tek karşılaştırdık"). Each
 * shows it in the middle of its glass over its own formula screen, faint (m-ders-formul, w-ders-formul), so it reads
 * as the app. From `meet` the two frames slide onto each other: the phone in front grows see-through, its expression
 * in the look's accent lies exactly on the browser's in ink, inside both glasses; then a tick and the success chime.
 * Sosyal Medya, 20 Nov 2026: the meeting point stays inside both frames, no edge cuts the expression.
 */
export const MathMatch: React.FC<{latex: string; meet: number; width?: number; size?: number}> = ({latex, meet, width = 1000, size}) => {
	const seconds = useSeconds();
	const look = useStoryLook();
	const layout = matchLayout(width);
	const px = size ?? width * 0.04;
	const shift = matchShift(width, meet, seconds);
	const context = CONTEXT * (1 - shift.eased);
	const done = seconds >= meet + MATCH_MOVE;
	const tick = interpolate(seconds, [meet + MATCH_MOVE, meet + MATCH_MOVE + 0.2], [0, 1], CLAMP);
	const screen = (id: string, scale: number, w: number, h: number, ink: string) => {
		const Drawing = storyScreen(id).Component;
		return (
			<div style={{position: 'relative', width: w, height: h, background: '#FFFFFF', overflow: 'hidden'}}>
				<div style={{position: 'absolute', inset: 0, opacity: context}}>
					<Drawing />
				</div>
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px / scale, color: ink}}>
					<div style={{padding: `${0.3 / scale}em ${0.5 / scale}em`, background: `rgba(255,255,255,${0.85 * (1 - shift.eased)})`, borderRadius: 16 / scale}}>
						<MathExpression latex={latex} />
					</div>
				</div>
			</div>
		);
	};
	return (
		<div style={{position: 'relative', width, height: layout.phoneHeight}}>
			<div style={{position: 'absolute', left: layout.phone + layout.gap, top: layout.browserTop, transform: `translate(${shift.browser.x}px, ${shift.browser.y}px)`}}>
				<DeviceBrowser width={layout.browser}>{screen('w-ders-formul', layout.browserScale, UI_CANVAS.web.width, UI_CANVAS.web.height, '#0F172A')}</DeviceBrowser>
			</div>
			<div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${shift.phone.x}px, ${shift.phone.y}px)`, opacity: 1 - 0.42 * shift.eased}}>
				<DevicePhone width={layout.phone}>{screen('m-ders-formul', layout.phoneScale, 390, 844, look.accent)}</DevicePhone>
			</div>
			{done ? (
				<svg width={px * 1.4} height={px * 1.4} viewBox="0 0 100 100" style={{position: 'absolute', left: layout.meet.x - px * 0.7, top: layout.meet.y + px * 1.2, transform: `scale(${0.6 + 0.4 * tick})`, opacity: tick}}>
					<circle cx={50} cy={50} r={46} fill="#16A34A" />
					<path d="M28 52 L44 67 L73 36" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			) : null}
			<SoundEffect id="transitionWhoosh" atSeconds={meet} volume={0.5} />
			<SoundEffect id="success" atSeconds={meet + MATCH_MOVE} volume={0.7} />
		</div>
	);
};
