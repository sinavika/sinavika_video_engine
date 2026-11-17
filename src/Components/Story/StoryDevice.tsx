import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {SoundEffectId} from '../../Configurations/SoundEffects';
import {UIProvider} from '../../UIUX/Context';
import {DeviceBrowser, DevicePhone} from '../../UIUX/Parts/Web';
import {findScreen, type UIScreen} from '../../UIUX/Registry';
import type {UIMode} from '../../UIUX/Tokens';
import {screenSize} from '../../UIUX/UIUXProps';
import {SoundEffect} from '../Sounds/SoundEffect';

/**
 * A real UI/UX drawing on its device, by the drawing's id: a phone, a tablet (landscape or portrait), an Apple Watch,
 * a round Wear OS watch or a browser window. The story reels show the product only as the app's own screens, from the
 * one design source (Desktop\Sinavika-UIUX3, owner 14 Nov 2026); tablet and watch screens (15 Nov 2026) are shown on
 * their own devices, never stretched onto a phone. One device can step through several screens (`screens`), each
 * sliding in from the right at its moment, as an app moves from page to page, or morphing in place (`transition`).
 */

type StoryDeviceKind = 'phone' | 'tablet' | 'appleWatch' | 'wearWatch' | 'browser';

/** One screen of a sequence: the drawing and when it comes in, in seconds of the scene. */
export type ShownScreen = {id: string; at: number};

/** Which device a drawing belongs on, and the screen's own size in points. Share cards are not shown on a device. */
export const deviceFor = (screen: Pick<UIScreen, 'platform' | 'portrait' | 'round' | 'height'>): {kind: StoryDeviceKind; screen: {width: number; height: number}} => {
	switch (screen.platform) {
		case 'mobile':
			return {kind: 'phone', screen: screenSize('mobile')};
		case 'tablet':
			return {kind: 'tablet', screen: screenSize('tablet', undefined, screen.portrait)};
		case 'watch':
			return {kind: screen.round ? 'wearWatch' : 'appleWatch', screen: screenSize('watch', undefined, undefined, screen.round)};
		case 'web':
		case 'site':
			return {kind: 'browser', screen: screenSize('web')};
		case 'share':
			throw new Error('Paylaşım kartları bir cihazda gösterilmez; kartın kendisi kullanılır.');
	}
};

/**
 * The device a sequence is shown on: the first screen's. Every screen of a sequence must belong on the same device
 * and size (a watch page never slides into a phone).
 */
export const sequenceDevice = (screens: readonly ShownScreen[]) => {
	if (screens.length === 0) throw new Error('Bir cihaz en az bir ekran gösterir.');
	const devices = screens.map((shown) => deviceFor(findScreen(shown.id)));
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

/** How one screen of a sequence gives way to the next: sliding in from the right, or morphing in place on a spring. */
type ScreenTransition = 'slide' | 'morph';

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

/** The screens of a sequence at their own size (points), sliding as `slidesAt` says or morphing as `morphAt` says; each change plays `sound`. */
export const ScreenSlider: React.FC<{screens: readonly ShownScreen[]; size: {width: number; height: number}; mode: UIMode; sound?: SoundEffectId | null; transition?: ScreenTransition}> = ({screens, size, mode, sound = 'transitionWhoosh', transition = 'slide'}) => {
	const {fps} = useVideoConfig();
	const seconds = useCurrentFrame() / fps;
	const layers =
		transition === 'morph'
			? morphAt(screens, seconds, fps).map(({index, scale, opacity}) => ({index, transform: `scale(${scale})`, opacity, shadow: false}))
			: slidesAt(screens, seconds).map(({index, x}) => ({index, transform: `translateX(${x * size.width}px)`, opacity: 1, shadow: x > 0}));
	return (
		<div style={{position: 'relative', width: size.width, height: size.height, overflow: 'hidden'}}>
			{layers.map(({index, transform, opacity, shadow}) => {
				const entry = findScreen(screens[index].id);
				const Drawing = entry.Component;
				return (
					<div key={index} style={{position: 'absolute', inset: 0, transform, opacity, boxShadow: shadow ? '-12px 0 30px rgba(0,0,0,0.25)' : undefined}}>
						<UIProvider mode={mode} lang="tr" module={entry.module} calm={false} web={entry.platform === 'tablet'}>
							<Drawing />
						</UIProvider>
					</div>
				);
			})}
			{sound ? screens.slice(1).map((shown, index) => <SoundEffect key={index} id={sound} atSeconds={shown.at} volume={0.6} />) : null}
		</div>
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

/**
 * The drawing `id`, or the sequence `screens`, on its device, `width` pixels wide (the device's outer width). `rotate`
 * tilts it as a device held in a hand. Light mode unless `mode` says otherwise; watch drawings are dark by design.
 */
export const StoryDevice: React.FC<{id?: string; screens?: readonly ShownScreen[]; width: number; mode?: UIMode; rotate?: number; transition?: ScreenTransition}> = ({id, screens: given, width, mode = 'light', rotate = 0, transition = 'slide'}) => {
	const screens = given ?? (id ? [{id, at: 0}] : []);
	const {kind, screen} = sequenceDevice(screens);
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
	// Watches: the case with its crown on the right and a short run of strap above and below.
	const round = kind === 'wearWatch';
	const bezel = width * (round ? 0.09 : 0.075);
	const inner = width - bezel * 2;
	const innerHeight = (inner * screen.height) / screen.width;
	const caseHeight = innerHeight + bezel * 2;
	const strapWidth = width * (round ? 0.5 : 0.62);
	return (
		<div style={{position: 'relative', width, height: caseHeight + width * 0.7, transform: tilt}}>
			<div style={{position: 'absolute', left: (width - strapWidth) / 2, top: 0, width: strapWidth, height: width * 0.42, borderRadius: `${width * 0.06}px ${width * 0.06}px 0 0`, background: STRAP}} />
			<div style={{position: 'absolute', left: (width - strapWidth) / 2, bottom: 0, width: strapWidth, height: width * 0.42, borderRadius: `0 0 ${width * 0.06}px ${width * 0.06}px`, background: STRAP}} />
			<div style={{position: 'absolute', right: -width * 0.05, top: width * 0.35 + caseHeight * 0.3, width: width * 0.08, height: width * 0.16, borderRadius: width * 0.025, background: '#374151'}} />
			{round ? null : <div style={{position: 'absolute', right: -width * 0.03, top: width * 0.35 + caseHeight * 0.58, width: width * 0.05, height: width * 0.2, borderRadius: width * 0.02, background: '#374151'}} />}
			<div style={{position: 'absolute', left: 0, top: width * 0.35, width, height: caseHeight, padding: bezel, boxSizing: 'border-box', borderRadius: round ? '50%' : width * 0.24, background: BODY, boxShadow: shadow}}>
				<div style={{borderRadius: round ? '50%' : width * 0.17, overflow: 'hidden', background: '#000000'}}>
					<Scaled width={inner} height={innerHeight} size={screen}>
						{slider('dark')}
					</Scaled>
				</div>
			</div>
		</div>
	);
};
