import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SoundEffectId} from '../../Configurations/SoundEffects';
import {UIProvider} from '../../UIUX/Context';
import {DeviceBrowser, DevicePhone} from '../../UIUX/Parts/Web';
import type {UIScreen} from '../../UIUX/Registry';
import type {UIMode} from '../../UIUX/Tokens';
import {screenSize} from '../../UIUX/UIUXProps';
import {SoundEffect} from '../Sounds/SoundEffect';
import {storyScreen} from './StoryBefore';
import {GlassScreen, type GlassEffect} from './StoryGlass';
import {useStoryLook} from './StoryLook';

/**
 * A real UI/UX drawing on its device, by the drawing's id: a phone, a tablet (landscape or portrait), an Apple Watch,
 * a round Wear OS watch or a browser window. The story reels show the product only as the app's own screens, from the
 * one design source (Desktop\Sinavika-UIUX3, owner 14 Nov 2026); tablet and watch screens (15 Nov 2026) are shown on
 * their own devices, never stretched onto a phone. One device can step through several screens (`screens`), each
 * coming in at its moment by its transition: sliding in from the right as an app moves from page to page, morphing in
 * place, rising from the bottom as a notification, or turning over as a card (`transition`). A watch also vibrates
 * (`buzzes`) and takes a fingertip's taps (`taps`); StoryWrist shows it on the wrist.
 */

type StoryDeviceKind = 'phone' | 'tablet' | 'appleWatch' | 'wearWatch' | 'browser';

/**
 * How a screen comes onto the glass: sliding in from the right (an app's next page), morphing in place on a spring,
 * rising from the bottom (a notification arriving), flipping over (a card turned to its answer), wiped in from the
 * left behind a line in the look's accent (a before and after of the same screen, "Dediniz, yaptık") or coming down
 * from the top as the page jumps back to its start (`top`: the next question opens at its top, F1).
 */
export type ScreenTransition = 'slide' | 'morph' | 'rise' | 'flip' | 'wipe' | 'top';

/** One screen of a sequence: the drawing, when it comes in (seconds of the scene), how (the device's transition when not set) and the moments the engine plays on it (StoryGlass). */
export type ShownScreen = {id: string; at: number; transition?: ScreenTransition; glass?: readonly GlassEffect[]};

/** Which device a drawing belongs on, and the screen's own size in points. Share cards are not shown on a device. */
export const deviceFor = (screen: Pick<UIScreen, 'platform' | 'portrait' | 'round' | 'height'>): {kind: StoryDeviceKind; screen: {width: number; height: number}} => {
	switch (screen.platform) {
		case 'mobile':
			return {kind: 'phone', screen: screenSize('mobile')};
		case 'tablet':
			return {kind: 'tablet', screen: screenSize('tablet', undefined, screen.portrait)};
		case 'fold':
			throw new Error('iPhone Duo çizimleri henüz bir cihaz çerçevesinde gösterilmez.');
		case 'watch':
			return {kind: screen.round ? 'wearWatch' : 'appleWatch', screen: screenSize('watch', undefined, undefined, screen.round)};
		case 'web':
		case 'site':
			return {kind: 'browser', screen: screenSize('web')};
		case 'share':
			throw new Error('Paylaşım kartları bir cihazda gösterilmez; kartın kendisi kullanılır.');
		case 'print':
			throw new Error('PDF sayfaları bir cihazda gösterilmez.');
	}
};

/**
 * The device a sequence is shown on: the first screen's. Every screen of a sequence must belong on the same device
 * and size (a watch page never slides into a phone).
 */
export const sequenceDevice = (screens: readonly ShownScreen[]) => {
	if (screens.length === 0) throw new Error('Bir cihaz en az bir ekran gösterir.');
	const devices = screens.map((shown) => deviceFor(storyScreen(shown.id)));
	const first = devices[0];
	devices.forEach((device, index) => {
		if (device.kind !== first.kind || device.screen.width !== first.screen.width || device.screen.height !== first.screen.height)
			throw new Error(`${screens[index].id} ${screens[0].id} ile aynı cihazda gösterilemez (${device.kind} / ${first.kind}).`);
	});
	return first;
};

/** How long a screen takes to slide in. */
const SLIDE_SECONDS = 0.38;

/** Which screens are on the glass `seconds` into the scene, and where: the latest one and, while it slides, the one before. */
export const slidesAt = (screens: readonly ShownScreen[], seconds: number): {index: number; x: number}[] => {
	const reached = screens.map((shown, index) => ({...shown, index})).filter((shown) => shown.at <= seconds || shown.index === 0);
	const current = reached.at(-1)!;
	const progress = current.index === 0 ? 1 : Math.min(1, (seconds - current.at) / SLIDE_SECONDS);
	const eased = 1 - (1 - progress) ** 3;
	if (eased >= 1 || current.index === 0) return [{index: current.index, x: 0}];
	return [
		{index: current.index - 1, x: -0.32 * eased},
		{index: current.index, x: 1 - eased},
	];
};

/** The morph's spring: UI_MOTION.spring.sheet (300 ms, damping ratio 0.8), a small overshoot as a UI state settles. */
const MORPH_STIFFNESS = 260;
const MORPH = {stiffness: MORPH_STIFFNESS, damping: 2 * 0.8 * Math.sqrt(MORPH_STIFFNESS), mass: 1};
const MORPH_SECONDS = 0.6;

/**
 * The morph between screens (Sosyal Medya, 17 Nov 2026, "shape morphing through UI states"): the new screen grows
 * from 92 % on a spring and fades in over the old one, which swells a little and fades out. What is on the glass
 * `seconds` into the scene, bottom first.
 */
export const morphAt = (screens: readonly ShownScreen[], seconds: number, fps: number): {index: number; scale: number; opacity: number}[] => {
	const reached = screens.map((shown, index) => ({...shown, index})).filter((shown) => shown.at <= seconds || shown.index === 0);
	const current = reached.at(-1)!;
	if (current.index === 0 || seconds - current.at >= MORPH_SECONDS) return [{index: current.index, scale: 1, opacity: 1}];
	const grown = spring({frame: (seconds - current.at) * fps, fps, config: MORPH});
	const shown = Math.min(1, grown);
	return [
		{index: current.index - 1, scale: 1 + 0.04 * shown, opacity: 1 - shown},
		{index: current.index, scale: 0.92 + 0.08 * grown, opacity: Math.min(1, shown * 1.5)},
	];
};

/** How long a notification takes to rise into place, and a card to turn over. */
const RISE_SECONDS = 0.42;
const FLIP_SECONDS = 0.5;

const reachedScreen = (screens: readonly ShownScreen[], seconds: number) => screens.map((shown, index) => ({...shown, index})).filter((shown) => shown.at <= seconds || shown.index === 0).at(-1)!;

/**
 * A notification rising onto the glass (Sosyal Medya, 19 Nov 2026: "bildirim kartı yukarı kayarak gelsin"): the new
 * screen comes up from the bottom edge (`y` in screen heights, 1 = below the glass) over the old one, which steps back
 * and dims. What is on the glass `seconds` into the scene, bottom first.
 */
export const riseAt = (screens: readonly ShownScreen[], seconds: number): {index: number; y: number; scale: number; opacity: number}[] => {
	const current = reachedScreen(screens, seconds);
	const progress = current.index === 0 ? 1 : Math.min(1, (seconds - current.at) / RISE_SECONDS);
	if (progress >= 1) return [{index: current.index, y: 0, scale: 1, opacity: 1}];
	const eased = 1 - (1 - progress) ** 3;
	return [
		{index: current.index - 1, y: 0, scale: 1 - 0.06 * eased, opacity: 1 - 0.6 * eased},
		{index: current.index, y: 1 - eased, scale: 1, opacity: 1},
	];
};

/**
 * A card turned over (Sosyal Medya, 19 Nov 2026: k-apple-kart → k-apple-kart-cevap): the old screen turns edge-on in
 * the first half, the new one turns in from the other edge in the second. `angle` is the turn about the vertical axis
 * in degrees; only one face is on the glass at a time.
 */
export const flipAt = (screens: readonly ShownScreen[], seconds: number): {index: number; angle: number}[] => {
	const current = reachedScreen(screens, seconds);
	const progress = current.index === 0 ? 1 : Math.min(1, (seconds - current.at) / FLIP_SECONDS);
	if (progress >= 1) return [{index: current.index, angle: 0}];
	const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
	return eased < 0.5 ? [{index: current.index - 1, angle: 180 * eased}] : [{index: current.index, angle: -180 * (1 - eased)}];
};

const WIPE_SECONDS = 0.7;
const TOP_SECONDS = 0.38;

/**
 * The page jumping back to its top (Sosyal Medya, 20 Nov 2026, F1: "her yeni soru en baştan açılıyor"): the new screen
 * comes down from above the glass, the old one is pushed down and out, fast, with blur along the move. `y` in screen
 * heights.
 */
export const topAt = (screens: readonly ShownScreen[], seconds: number): {index: number; y: number; blur: number}[] => {
	const current = reachedScreen(screens, seconds);
	const progress = current.index === 0 ? 1 : Math.min(1, (seconds - current.at) / TOP_SECONDS);
	if (progress >= 1) return [{index: current.index, y: 0, blur: 0}];
	const eased = 1 - (1 - progress) ** 3;
	const blur = 5 * Math.sin(Math.PI * progress);
	return [
		{index: current.index - 1, y: eased, blur},
		{index: current.index, y: eased - 1, blur},
	];
};

/**
 * A before and after (Sosyal Medya, 20 Nov 2026): the new screen is uncovered from the left edge to the right behind a
 * moving line, the old one stays where it is. `edge` is where the line stands (0–1 of the width), null when no wipe runs.
 */
export const wipeAt = (screens: readonly ShownScreen[], seconds: number): {layers: {index: number; edge: number | null}[]; edge: number | null} => {
	const current = reachedScreen(screens, seconds);
	const progress = current.index === 0 ? 1 : Math.min(1, (seconds - current.at) / WIPE_SECONDS);
	if (progress >= 1) return {layers: [{index: current.index, edge: null}], edge: null};
	const edge = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
	return {layers: [{index: current.index - 1, edge: null}, {index: current.index, edge}], edge};
};

/** Each transition's sound: the page's whoosh, the morph's swoosh, the notification's pop, the card's flip, the wipe's swoosh. */
const TRANSITION_SOUND: Record<ScreenTransition, SoundEffectId> = {slide: 'transitionWhoosh', morph: 'morph', rise: 'pop', flip: 'cardFlip', wipe: 'morph', top: 'transitionWhoosh'};

type GlassLayer = {index: number; transform: string; opacity: number; shadow?: string; clip?: string; blur?: number};

/** What is on the glass `seconds` into the scene, drawn by the transition of the screen coming in. */
const glassLayers = (screens: readonly ShownScreen[], seconds: number, fps: number, size: {width: number; height: number}, fallback: ScreenTransition): GlassLayer[] => {
	switch (reachedScreen(screens, seconds).transition ?? fallback) {
		case 'morph':
			return morphAt(screens, seconds, fps).map(({index, scale, opacity}) => ({index, transform: `scale(${scale})`, opacity}));
		case 'rise':
			return riseAt(screens, seconds).map(({index, y, scale, opacity}) => ({index, transform: `translateY(${y * size.height}px) scale(${scale})`, opacity, shadow: y > 0 ? '0 -12px 30px rgba(0,0,0,0.35)' : undefined}));
		case 'flip':
			return flipAt(screens, seconds).map(({index, angle}) => ({index, transform: `perspective(${size.width * 3}px) rotateY(${angle}deg)`, opacity: 1}));
		case 'top':
			return topAt(screens, seconds).map(({index, y, blur}) => ({index, transform: `translateY(${y * size.height}px)`, opacity: 1, blur}));
		case 'wipe':
			return wipeAt(screens, seconds).layers.map(({index, edge}) => ({index, transform: 'none', opacity: 1, clip: edge === null ? undefined : `inset(0 ${(1 - edge) * size.width}px 0 0)`}));
		case 'slide':
			return slidesAt(screens, seconds).map(({index, x}) => ({index, transform: `translateX(${x * size.width}px)`, opacity: 1, shadow: x > 0 ? '-12px 0 30px rgba(0,0,0,0.25)' : undefined}));
	}
};

/**
 * The screens of a sequence at their own size (points), each coming in by its own transition (`transition` when it
 * names none). Each change plays its transition's sound, or `sound` for all of them (null: none).
 */
export const ScreenSlider: React.FC<{screens: readonly ShownScreen[]; size: {width: number; height: number}; mode: UIMode; sound?: SoundEffectId | null; transition?: ScreenTransition}> = ({screens, size, mode, sound, transition = 'slide'}) => {
	const {fps} = useVideoConfig();
	const seconds = useCurrentFrame() / fps;
	const look = useStoryLook();
	const wiping = (reachedScreen(screens, seconds).transition ?? transition) === 'wipe' ? wipeAt(screens, seconds).edge : null;
	return (
		<div style={{position: 'relative', width: size.width, height: size.height, overflow: 'hidden'}}>
			{glassLayers(screens, seconds, fps, size, transition).map(({index, transform, opacity, shadow, clip, blur}) => {
				const entry = storyScreen(screens[index].id);
				const Drawing = entry.Component;
				const draw = () => (
					<UIProvider mode={mode} lang="tr" module={entry.module} calm={false} web={entry.platform === 'tablet'}>
						<Drawing />
					</UIProvider>
				);
				return (
					<div key={index} style={{position: 'absolute', inset: 0, transform, opacity, boxShadow: shadow, clipPath: clip, filter: blur && blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined, backfaceVisibility: 'hidden'}}>
						{screens[index].glass?.length ? <GlassScreen size={size} effects={screens[index].glass!} render={draw} /> : draw()}
					</div>
				);
			})}
			{wiping === null ? null : <div style={{position: 'absolute', top: 0, bottom: 0, left: wiping * size.width - size.width * 0.008, width: size.width * 0.016, background: look.accent, boxShadow: `0 0 ${size.width * 0.05}px ${look.accent}`}} />}
			{sound === null ? null : screens.slice(1).map((shown, index) => <SoundEffect key={index} id={sound ?? TRANSITION_SOUND[shown.transition ?? transition]} atSeconds={shown.at} volume={0.6} />)}
		</div>
	);
};

/** A watch's buzz: when it vibrates, in seconds of the scene. */
type WatchBuzz = {at: number};
/** A fingertip's tap on a watch's glass: where (0–1 of the screen's width and height) and when. */
type WatchTap = {at: number; x: number; y: number};

const BUZZ_SECONDS = 0.42;
const RING_SECONDS = 0.6;

/**
 * A watch vibrating (Sosyal Medya, 19 Nov 2026): `shake` is the case's sideways jitter (−1…1, fading over the buzz)
 * and `ring` how far the wave from the case's edge has spread (0–1, null when there is none), for the last buzz.
 */
export const buzzAt = (buzzes: readonly WatchBuzz[], seconds: number): {shake: number; ring: number | null} => {
	const last = [...buzzes].reverse().find((buzz) => buzz.at <= seconds);
	if (!last) return {shake: 0, ring: null};
	const since = seconds - last.at;
	return {
		shake: since < BUZZ_SECONDS ? Math.sin(2 * Math.PI * 26 * since) * (1 - since / BUZZ_SECONDS) : 0,
		ring: since < RING_SECONDS ? since / RING_SECONDS : null,
	};
};

const TAP_COME = 0.25;
const TAP_PRESS = 0.12;
const TAP_LEAVE = 0.3;

/**
 * The fingertip over a watch's glass: it comes in a quarter second before its tap, presses (`press` 0–1), and lifts
 * away; `ripple` is the glass's ring after the tap (0–1, null when there is none). Null when no finger is near.
 */
export const tapAt = (taps: readonly WatchTap[], seconds: number): {tap: WatchTap; near: number; press: number; ripple: number | null} | null => {
	const tap = taps.find((candidate) => seconds >= candidate.at - TAP_COME && seconds <= candidate.at + TAP_PRESS + TAP_LEAVE);
	if (!tap) return null;
	const since = seconds - tap.at;
	const near = since < 0 ? 1 + since / TAP_COME : since <= TAP_PRESS ? 1 : 1 - (since - TAP_PRESS) / TAP_LEAVE;
	return {tap, near, press: since >= 0 && since <= TAP_PRESS ? Math.sin((Math.PI * since) / TAP_PRESS) : 0, ripple: since >= 0 ? Math.min(1, since / (TAP_PRESS + TAP_LEAVE)) : null};
};

const FINGER = '#E9B993';
const NAIL = '#F6DCCB';

/** The glass's ring after each tap, in the screen's own points (under the glass, so it stays on it). */
const GlassRipple: React.FC<{taps: readonly WatchTap[]; size: {width: number; height: number}}> = ({taps, size}) => {
	const now = tapAt(taps, useCurrentFrame() / useVideoConfig().fps);
	if (!now || now.ripple === null) return null;
	const ring = size.width * 0.3;
	return <div style={{position: 'absolute', left: now.tap.x * size.width, top: now.tap.y * size.height, width: ring, height: ring, marginLeft: -ring / 2, marginTop: -ring / 2, borderRadius: '50%', border: `${size.width * 0.012}px solid rgba(255,255,255,0.85)`, opacity: 1 - now.ripple, transform: `scale(${0.4 + 1.1 * now.ripple})`, pointerEvents: 'none'}} />;
};

/** The other hand's index finger over the case (its pad on the tap's point, reaching in from the lower right), `glass` the glass's place and size in pixels. */
const Fingertip: React.FC<{taps: readonly WatchTap[]; glass: {x: number; y: number; width: number; height: number}}> = ({taps, glass}) => {
	const now = tapAt(taps, useCurrentFrame() / useVideoConfig().fps);
	const pad = glass.width * 0.26;
	return (
		<>
			{now ? (
				<div
					style={{
						position: 'absolute',
						left: glass.x + now.tap.x * glass.width - pad / 2,
						top: glass.y + now.tap.y * glass.height - pad * 0.45,
						width: pad,
						height: pad * 2.6,
						borderRadius: `${pad / 2}px ${pad / 2}px ${pad * 0.3}px ${pad * 0.3}px`,
						background: FINGER,
						opacity: Math.min(1, now.near * 2),
						transformOrigin: `${pad / 2}px ${pad * 0.45}px`,
						transform: `translate(${(1 - now.near) * pad * 1.2}px, ${(1 - now.near) * pad * 1.8}px) rotate(-24deg) scale(${1 - 0.06 * now.press})`,
						boxShadow: `0 ${pad * (0.22 - 0.14 * now.press)}px ${pad * 0.35}px rgba(0,0,0,0.4)`,
					}}
				>
					<div style={{position: 'absolute', left: pad * 0.2, top: pad * 0.12, width: pad * 0.6, height: pad * 0.62, borderRadius: `${pad * 0.3}px ${pad * 0.3}px ${pad * 0.12}px ${pad * 0.12}px`, background: NAIL}} />
				</div>
			) : null}
			{taps.map((tap, index) => (
				<SoundEffect key={index} id="uiTap" atSeconds={tap.at} volume={0.5} />
			))}
		</>
	);
};

const BODY = '#0B0F17';
const RIM = 'rgba(255,255,255,0.18)';
const STRAP = '#1F2937';

/** Content at its own size, scaled into `width` × `height`. */
const Scaled: React.FC<{width: number; height: number; size: {width: number; height: number}; children: React.ReactNode}> = ({width, height, size, children}) => (
	<div style={{width, height, overflow: 'hidden', position: 'relative'}}>
		<div style={{width: size.width, height: size.height, transform: `scale(${width / size.width})`, transformOrigin: 'top left'}}>{children}</div>
	</div>
);

/** The watch's own measures for an outer `width`: the bezel, the glass and the case. */
export const watchMeasures = (round: boolean, screen: {width: number; height: number}, width: number) => {
	const bezel = width * (round ? 0.09 : 0.075);
	const inner = width - bezel * 2;
	const innerHeight = (inner * screen.height) / screen.width;
	return {bezel, inner, innerHeight, caseHeight: innerHeight + bezel * 2, strapWidth: width * (round ? 0.5 : 0.62)};
};

/**
 * A watch's case without its strap, `width` wide: square with a crown and a side button (Apple Watch) or round with a
 * crown (Wear OS), no brand mark on either. Its glass shows `children` (the screen at its own size); `buzzes` shake
 * it with a wave spreading from its edge and the motor's buzz, `taps` bring a fingertip onto the glass.
 */
export const WatchCase: React.FC<{round: boolean; screen: {width: number; height: number}; width: number; buzzes?: readonly WatchBuzz[]; taps?: readonly WatchTap[]; ringColor?: string; children: React.ReactNode}> = ({round, screen, width, buzzes = [], taps = [], ringColor = '#FFFFFF', children}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const {bezel, inner, innerHeight, caseHeight} = watchMeasures(round, screen, width);
	const {shake, ring} = buzzAt(buzzes, seconds);
	const radius = round ? '50%' : width * 0.24;
	const shadow = `0 ${width * 0.06}px ${width * 0.16}px -${width * 0.05}px rgba(0,0,0,0.6), inset 0 0 0 ${Math.max(1, width * 0.006)}px ${RIM}`;
	return (
		<div style={{position: 'relative', width, height: caseHeight, transform: `translateX(${shake * width * 0.022}px) rotate(${shake * 1.2}deg)`}}>
			{ring !== null
				? [0, 0.18].map((delay) => {
						const spread = Math.max(0, (ring - delay) / (1 - delay));
						return <div key={delay} style={{position: 'absolute', inset: 0, borderRadius: radius, border: `${width * 0.02}px solid ${ringColor}`, opacity: spread > 0 ? 0.7 * (1 - spread) : 0, transform: `scale(${1 + 0.32 * spread})`}} />;
					})
				: null}
			{ring !== null
				? [-1, 1].map((side) => (
						<svg key={side} width={width * 0.16} height={caseHeight * 0.5} viewBox="0 0 16 50" style={{position: 'absolute', top: caseHeight * 0.25, [side < 0 ? 'left' : 'right']: -width * 0.24, opacity: 1 - ring, transform: side < 0 ? 'scaleX(-1)' : undefined}}>
							<path d="M3 12 Q8 25 3 38 M10 5 Q17 25 10 45" fill="none" stroke={ringColor} strokeWidth={3} strokeLinecap="round" />
						</svg>
					))
				: null}
			<div style={{position: 'absolute', right: -width * 0.05, top: caseHeight * 0.3, width: width * 0.08, height: width * 0.16, borderRadius: width * 0.025, background: '#374151'}} />
			{round ? null : <div style={{position: 'absolute', right: -width * 0.03, top: caseHeight * 0.58, width: width * 0.05, height: width * 0.2, borderRadius: width * 0.02, background: '#374151'}} />}
			<div style={{position: 'absolute', inset: 0, padding: bezel, boxSizing: 'border-box', borderRadius: radius, background: BODY, boxShadow: shadow}}>
				<div style={{borderRadius: round ? '50%' : width * 0.17, overflow: 'hidden', background: '#000000'}}>
					<Scaled width={inner} height={innerHeight} size={screen}>
						<div style={{position: 'relative', width: screen.width, height: screen.height}}>
							{children}
							<GlassRipple taps={taps} size={screen} />
						</div>
					</Scaled>
				</div>
			</div>
			<Fingertip taps={taps} glass={{x: bezel, y: bezel, width: inner, height: innerHeight}} />
			{buzzes.map((buzz, index) => (
				<SoundEffect key={index} id="hapticBuzz" atSeconds={buzz.at} volume={0.9} />
			))}
		</div>
	);
};

/**
 * The drawing `id`, or the sequence `screens`, on its device, `width` pixels wide (the device's outer width). `rotate`
 * tilts it as a device held in a hand. Light mode unless `mode` says otherwise; watch drawings are dark by design.
 * A watch also takes `buzzes` and `taps` (WatchCase).
 */
export const StoryDevice: React.FC<{id?: string; screens?: readonly ShownScreen[]; width: number; mode?: UIMode; rotate?: number; transition?: ScreenTransition; buzzes?: readonly WatchBuzz[]; taps?: readonly WatchTap[]; glass?: readonly GlassEffect[]}> = ({id, screens: given, width, mode = 'light', rotate = 0, transition = 'slide', buzzes = [], taps = [], glass}) => {
	const look = useStoryLook();
	const screens = given ?? (id ? [{id, at: 0, glass}] : []);
	const {kind, screen} = sequenceDevice(screens);
	if ((buzzes.length || taps.length) && kind !== 'appleWatch' && kind !== 'wearWatch') throw new Error('Titreşim ve parmak dokunuşu yalnız saatte gösterilir.');
	const shadow = `0 ${width * 0.06}px ${width * 0.16}px -${width * 0.05}px rgba(0,0,0,0.6), inset 0 0 0 ${Math.max(1, width * 0.006)}px ${RIM}`;
	const tilt = rotate ? `rotate(${rotate}deg)` : undefined;
	const slider = (glassMode: UIMode) => <ScreenSlider screens={screens} size={screen} mode={glassMode} transition={transition} />;
	if (kind === 'phone')
		return (
			<DevicePhone width={width} rotate={rotate}>
				{slider(mode)}
			</DevicePhone>
		);
	if (kind === 'browser')
		return (
			<div style={{transform: tilt}}>
				<DeviceBrowser width={width}>{slider(mode)}</DeviceBrowser>
			</div>
		);
	if (kind === 'tablet') {
		// An iPad-like slab: an even bezel, round corners, the front camera on the long top edge.
		const bezel = width * 0.035;
		const inner = width - bezel * 2;
		const innerHeight = (inner * screen.height) / screen.width;
		return (
			<div style={{position: 'relative', width, height: innerHeight + bezel * 2, padding: bezel, boxSizing: 'border-box', borderRadius: width * 0.045, background: BODY, boxShadow: shadow, transform: tilt}}>
				<div style={{borderRadius: width * 0.022, overflow: 'hidden'}}>
					<Scaled width={inner} height={innerHeight} size={screen}>
						{slider(mode)}
					</Scaled>
				</div>
				<div style={{position: 'absolute', top: bezel * 0.38, left: '50%', width: bezel * 0.26, height: bezel * 0.26, marginLeft: -bezel * 0.13, borderRadius: bezel, background: '#1F2937'}} />
			</div>
		);
	}
	// Watches: the case with a short run of strap above and below.
	const round = kind === 'wearWatch';
	const {caseHeight, strapWidth} = watchMeasures(round, screen, width);
	return (
		<div style={{position: 'relative', width, height: caseHeight + width * 0.7, transform: tilt}}>
			<div style={{position: 'absolute', left: (width - strapWidth) / 2, top: 0, width: strapWidth, height: width * 0.42, borderRadius: `${width * 0.06}px ${width * 0.06}px 0 0`, background: STRAP}} />
			<div style={{position: 'absolute', left: (width - strapWidth) / 2, bottom: 0, width: strapWidth, height: width * 0.42, borderRadius: `0 0 ${width * 0.06}px ${width * 0.06}px`, background: STRAP}} />
			<div style={{position: 'absolute', left: 0, top: width * 0.35}}>
				<WatchCase round={round} screen={screen} width={width} buzzes={buzzes} taps={taps} ringColor={look.accent}>
					{slider('dark')}
				</WatchCase>
			</div>
		</div>
	);
};
