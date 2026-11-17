import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon, type UIIconName} from '../../UIUX/Icons';
import {DevicePhone} from '../../UIUX/Parts/Web';
import type {UIMode} from '../../UIUX/Tokens';
import {screenSize} from '../../UIUX/UIUXProps';
import {SoundEffect} from '../Sounds/SoundEffect';
import {ScreenSlider, sequenceDevice, type ShownScreen} from './StoryDevice';

/**
 * A phone in the student's hand (sinavika.tr "Telefonunu bırakma!", 15 Nov 2026): its home screen, a thumb that
 * reaches for an app, hesitates over one and taps another, and the tapped app growing from its icon into the real
 * UI/UX screens. The home screen carries no real app: abstract colourful icons with plain names ("Akış", "Video",
 * "Mesaj"), never another brand's logo or look; the one real icon is Sınavika's own (Desktop\Sinavika-Logo).
 */

/** The home screen's apps by key: a plain name, an abstract icon and its colours. `sinavika` is the brand's own. */
export const HOME_APPS = {
	akis: {label: 'Akış', icon: 'sparkles', from: '#F472B6', to: '#8B5CF6'},
	video: {label: 'Video', icon: 'play', from: '#F87171', to: '#DC2626'},
	mesaj: {label: 'Mesaj', icon: 'chat', from: '#4ADE80', to: '#16A34A'},
	kamera: {label: 'Kamera', icon: 'camera', from: '#94A3B8', to: '#475569'},
	galeri: {label: 'Galeri', icon: 'image', from: '#FDE68A', to: '#F59E0B'},
	muzik: {label: 'Müzik', icon: 'headset', from: '#FB7185', to: '#BE123C'},
	takvim: {label: 'Takvim', icon: 'calendar', from: '#F8FAFC', to: '#E2E8F0'},
	hava: {label: 'Hava', icon: 'sun', from: '#7DD3FC', to: '#2563EB'},
	notlar: {label: 'Notlar', icon: 'note', from: '#FEF08A', to: '#EAB308'},
	harita: {label: 'Harita', icon: 'pin', from: '#86EFAC', to: '#0EA5E9'},
	posta: {label: 'Posta', icon: 'mail', from: '#93C5FD', to: '#1D4ED8'},
	ayarlar: {label: 'Ayarlar', icon: 'settings', from: '#CBD5E1', to: '#64748B'},
	tarayici: {label: 'Tarayıcı', icon: 'globe', from: '#A5B4FC', to: '#4F46E5'},
	saat: {label: 'Saat', icon: 'clock', from: '#334155', to: '#0F172A'},
	dosyalar: {label: 'Dosyalar', icon: 'file', from: '#BAE6FD', to: '#0284C7'},
	sinavika: {label: 'Sınavika', icon: 'sinavika', from: '#F97316', to: '#EA580C'},
} as const satisfies Record<string, {label: string; icon: UIIconName | 'sinavika'; from: string; to: string}>;

type HomeApp = keyof typeof HOME_APPS;

/** The grid (4 × 3) and the dock, in phone points (390 × 844). */
const GRID: readonly HomeApp[] = ['akis', 'video', 'galeri', 'takvim', 'hava', 'notlar', 'harita', 'posta', 'tarayici', 'saat', 'dosyalar', 'ayarlar'];
const DOCK: readonly HomeApp[] = ['mesaj', 'sinavika', 'kamera', 'muzik'];
const ICON = 64;

/** Where each app's icon sits on the home screen (its top left corner and size, in points): the grid, then the dock. */
export const homeLayout = (): Record<HomeApp, {x: number; y: number; size: number}> => {
	const layout = {} as Record<HomeApp, {x: number; y: number; size: number}>;
	const column = (390 - 4 * ICON) / 5;
	GRID.forEach((app, index) => {
		layout[app] = {x: column + (index % 4) * (ICON + column), y: 118 + Math.floor(index / 4) * 104, size: ICON};
	});
	DOCK.forEach((app, index) => {
		layout[app] = {x: column + index * (ICON + column), y: 734, size: ICON};
	});
	return layout;
};

/** A touch of the thumb: it reaches `app` at `at` and either hovers there and pulls away, or taps it. */
type HomeTouch = {at: number; app: HomeApp; kind: 'hover' | 'tap'};

/** How long the thumb takes to reach an icon, how long a hover lasts, and how long the tapped app takes to open. */
const REACH = 0.35;
const HOVER = 0.55;
const OPEN = 0.38;

const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Where the thumb is (icon centre, in points) and how hard it presses (0…1), `seconds` into the scene. */
export const thumbAt = (touches: readonly HomeTouch[], seconds: number): {x: number; y: number; press: number; shown: number} => {
	const layout = homeLayout();
	const centre = (app: HomeApp) => ({x: layout[app].x + ICON / 2, y: layout[app].y + ICON / 2});
	const rest = {x: 330, y: 900};
	if (touches.length === 0) return {...rest, press: 0, shown: 0};
	let from = rest;
	for (let index = 0; index < touches.length; index++) {
		const touch = touches[index];
		const to = centre(touch.app);
		const start = touch.at - REACH;
		if (seconds < start) return {...from, press: 0, shown: index === 0 ? 0 : 1};
		if (seconds < touch.at) {
			const t = ease((seconds - start) / REACH);
			// A thumb moves in an arc, not a straight line.
			return {x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * 30, press: 0, shown: index === 0 ? Math.min(1, t * 2) : 1};
		}
		const next = touches[index + 1];
		if (touch.kind === 'hover') {
			// It hangs over the icon, wavers, and pulls back a little before the next move.
			if (!next || seconds < next.at - REACH) {
				const held = seconds - touch.at;
				const back = Math.min(1, Math.max(0, (held - HOVER) / 0.25));
				return {x: to.x + Math.sin(held * 9) * 3, y: to.y + 40 * back, press: 0, shown: 1};
			}
			from = {x: to.x, y: to.y + 40};
		} else {
			const press = interpolate(seconds, [touch.at, touch.at + 0.08, touch.at + 0.2], [0, 1, 0], CLAMP);
			// After a tap the thumb lifts away as the app opens.
			const gone = interpolate(seconds, [touch.at + 0.1, touch.at + 0.3], [1, 0], CLAMP);
			if (!next || seconds < next.at - REACH) return {...to, press, shown: gone};
			from = to;
		}
	}
	return {...from, press: 0, shown: 0};
};

const AppIcon: React.FC<{app: HomeApp; pressed?: number}> = ({app, pressed = 0}) => {
	const spec = HOME_APPS[app];
	return (
		<div style={{width: ICON, height: ICON, borderRadius: ICON * 0.24, background: `linear-gradient(145deg, ${spec.from}, ${spec.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - 0.08 * pressed})`, filter: pressed ? `brightness(${1 - 0.25 * pressed})` : undefined, boxShadow: '0 4px 10px rgba(0,0,0,0.18)'}}>
			{spec.icon === 'sinavika' ? <Img src={staticFile('Brand/SinavikaIcon.svg')} style={{width: ICON * 0.6, height: ICON * 0.6, objectFit: 'contain'}} /> : <Icon name={spec.icon} size={ICON * 0.5} color={app === 'takvim' ? '#DC2626' : '#FFFFFF'} stroke={2.2} />}
		</div>
	);
};

/** Notification badges on some apps, as a phone left alone collects them. */
const BADGES: Partial<Record<HomeApp, number>> = {akis: 12, mesaj: 5, video: 3, posta: 21};

/** The home screen in points (390 × 844): wallpaper, clock, the grid with names and badges, the dock. */
const HomeScreen: React.FC<{wallpaper: 'light' | 'dark'; time: string; pressed?: {app: HomeApp; amount: number}}> = ({wallpaper, time, pressed}) => {
	const layout = homeLayout();
	const label = wallpaper === 'dark' ? '#FFFFFF' : '#0F172A';
	return (
		<div style={{position: 'absolute', inset: 0, background: wallpaper === 'dark' ? 'linear-gradient(160deg, #1E1B4B 0%, #0F172A 55%, #134E4A 100%)' : 'linear-gradient(160deg, #E0E7FF 0%, #FCE7F3 55%, #FEF3C7 100%)', fontFamily: 'Manrope, sans-serif'}}>
			<div style={{position: 'absolute', top: 16, left: 32, fontSize: 16, fontWeight: 700, color: label}}>{time}</div>
			<div style={{position: 'absolute', top: 18, right: 28, display: 'flex', gap: 6}}>
				<Icon name="signal" size={16} color={label} />
				<Icon name="wifi" size={16} color={label} />
				<Icon name="battery" size={18} color={label} />
			</div>
			<div style={{position: 'absolute', top: 712, left: 14, right: 14, height: 100, borderRadius: 30, background: wallpaper === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)'}} />
			{(Object.keys(layout) as HomeApp[]).map((app) => {
				const place = layout[app];
				const inDock = place.y > 700;
				return (
					<div key={app} style={{position: 'absolute', left: place.x, top: place.y, width: ICON, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<AppIcon app={app} pressed={pressed?.app === app ? pressed.amount : 0} />
						{BADGES[app] ? <div style={{position: 'absolute', top: -6, right: -6, minWidth: 22, height: 22, padding: '0 6px', borderRadius: 11, background: '#EF4444', color: '#FFFFFF', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>{BADGES[app]}</div> : null}
						{inDock ? null : <div style={{marginTop: 6, fontSize: 12, fontWeight: 600, color: label, textShadow: wallpaper === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'}}>{HOME_APPS[app].label}</div>}
					</div>
				);
			})}
		</div>
	);
};

/**
 * The phone, `width` pixels wide: the home screen, the thumb's `touches`, and the app the last tap opens growing out
 * of its icon into `screens` (real UI/UX drawings; the first comes in as the app opens, the rest slide in at their
 * moments). Without a tap it stays on the home screen. Every touch and the opening are heard.
 */
export const StoryPhone: React.FC<{width: number; touches: readonly HomeTouch[]; screens?: readonly ShownScreen[]; wallpaper?: 'light' | 'dark'; mode?: UIMode; time?: string; rotate?: number}> = ({width, touches, screens = [], wallpaper = 'dark', mode = 'light', time = '9:41', rotate = 0}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const size = screenSize('mobile');
	if (screens.length > 0 && sequenceDevice(screens).kind !== 'phone') throw new Error('StoryPhone yalnız telefon ekranı açar.');
	const tap = [...touches].reverse().find((touch) => touch.kind === 'tap');
	const layout = homeLayout();
	const thumb = thumbAt(touches, seconds);
	const opening = tap && screens.length > 0 ? ease(interpolate(seconds, [tap.at + 0.05, tap.at + 0.05 + OPEN], [0, 1], CLAMP)) : 0;
	const pressed = touches.filter((touch) => touch.kind === 'tap').map((touch) => ({app: touch.app, amount: interpolate(seconds, [touch.at, touch.at + 0.08, touch.at + 0.22], [0, 1, 0], CLAMP)})).find((entry) => entry.amount > 0);
	const icon = tap ? layout[tap.app] : null;
	// The opening app: a rounded rectangle in the icon's colours that grows from the icon to the whole glass.
	const box = icon ? {x: icon.x * (1 - opening), y: icon.y * (1 - opening), w: icon.size + (size.width - icon.size) * opening, h: icon.size + (size.height - icon.size) * opening, r: icon.size * 0.24 * (1 - opening) + 0} : null;
	const firstAt = tap ? tap.at + 0.05 : 0;
	const shown = screens.map((screen, index) => (index === 0 ? {...screen, at: Math.min(screen.at, firstAt)} : screen));
	return (
		<DevicePhone width={width} rotate={rotate}>
			<div style={{position: 'relative', width: size.width, height: size.height, overflow: 'hidden'}}>
				<HomeScreen wallpaper={wallpaper} time={time} pressed={pressed} />
				{box && opening > 0 ? (
					<div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r, overflow: 'hidden', background: `linear-gradient(145deg, ${HOME_APPS[tap!.app].from}, ${HOME_APPS[tap!.app].to})`}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: size.width, height: size.height, transform: `scale(${box.w / size.width})`, transformOrigin: 'top left', opacity: interpolate(opening, [0.35, 0.9], [0, 1], CLAMP)}}>
							<ScreenSlider screens={shown} size={size} mode={mode} />
						</div>
					</div>
				) : null}
				{thumb.shown > 0 ? (
					<div style={{position: 'absolute', left: thumb.x - 26, top: thumb.y - 26, width: 52, height: 52, borderRadius: 26, background: 'rgba(15,23,42,0.28)', border: '4px solid #FFFFFF', boxShadow: '0 0 0 3px rgba(15,23,42,0.35), 0 8px 18px rgba(0,0,0,0.45)', opacity: thumb.shown, transform: `scale(${1 - 0.18 * thumb.press})`}} />
				) : null}
			</div>
			{touches.filter((touch) => touch.kind === 'tap').map((touch, index) => <SoundEffect key={`t${index}`} id="uiTap" atSeconds={touch.at} volume={0.8} />)}
			{tap && screens.length > 0 ? <SoundEffect id="transitionWhoosh" atSeconds={tap.at + 0.05} volume={0.6} /> : null}
		</DevicePhone>
	);
};
