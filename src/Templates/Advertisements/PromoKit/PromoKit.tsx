import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {UIProvider} from '../../../UIUX/Context';
import {DeviceBrowser, DevicePhone} from '../../../UIUX/Parts/Web';
import {VOICE_LEAD_SECONDS} from '../../../Scenes/Voiceover';

/**
 * Shared pieces of the promotion reels (Ekim 2026 kampanyası). They hold only
 * mechanics (timing, the design canvas, typing, a word landing, the product
 * on a device); every template keeps its own look, colours and ending, so no
 * two reels read as the same video.
 */

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** The canvas every promo scene is designed on (reference pixels): the safe area of vertical video. */
export const PROMO_CANVAS = {width: 952, height: 1530} as const;

export const useSeconds = (): number => useCurrentFrame() / useVideoConfig().fps;

/** 0 → 1 with a spring, starting `delay` seconds into the scene. */
export const useLand = (delay = 0, stiffness = 160, damping = 20): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay * fps, fps, config: {damping, mass: 0.7, stiffness}});
};

/** 0 → 1, linear between two moments of the scene (seconds). */
export const useBetween = (from: number, to: number): number => interpolate(useSeconds(), [from, to], [0, 1], CLAMP);

/** Eased 0 → 1 (cubic in-out) between two moments. */
export const ease = (value: number): number => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);

/**
 * A full-bleed ground with the design canvas centred in the safe area.
 * `ground` paints the whole frame (it may bleed under the platform's UI);
 * everything readable goes into `children`, which stays inside the safe area.
 */
export const PromoStage: React.FC<{ground: React.ReactNode; children?: React.ReactNode; overlay?: React.ReactNode}> = ({ground, children, overlay}) => {
	const {u, contentWidth, contentHeight, safeArea} = useVideoLayout();
	const scale = Math.min(contentWidth / u(PROMO_CANVAS.width), contentHeight / u(PROMO_CANVAS.height));
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			{ground}
			<div style={{position: 'absolute', left: safeArea.left, top: safeArea.top, width: contentWidth, height: contentHeight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'relative', width: u(PROMO_CANVAS.width), height: u(PROMO_CANVAS.height), flexShrink: 0, transform: `scale(${scale})`}}>{children}</div>
			</div>
			{overlay}
		</AbsoluteFill>
	);
};

/** Absolute placement on the design canvas, in reference pixels. */
export const At: React.FC<{x?: number; y?: number; w?: number; h?: number; center?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({x = 0, y = 0, w, h, center, style, children}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: center ? '50%' : u(x), top: u(y), width: w === undefined ? undefined : u(w), height: h === undefined ? undefined : u(h), transform: center ? 'translateX(-50%)' : undefined, ...style}}>
			{children}
		</div>
	);
};

/**
 * A word or line that lands: it comes in large and blurred, settles sharp,
 * and leaves (optionally) the same way. Kinetic type for hooks.
 */
export const Slam: React.FC<{text: string; at: number; out?: number; size?: number; color: string; weight?: number; align?: 'left' | 'center' | 'right'; from?: number; style?: React.CSSProperties}> = ({text, at, out, size = TYPE.adScale.hook, color, weight = TYPE.weights.kinetic, align = 'center', from = 1.35, style}) => {
	const seconds = useSeconds();
	const land = useLand(at, 260, 22);
	const leave = out === undefined ? 0 : interpolate(seconds, [out, out + 0.18], [0, 1], CLAMP);
	if (seconds < at || (out !== undefined && seconds > out + 0.2)) return null;
	const scale = interpolate(land, [0, 1], [from, 1]) * interpolate(leave, [0, 1], [1, 0.9]);
	const blur = (1 - land) * 18 + leave * 14;
	return (
		<div style={{transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: Math.min(land * 1.6, 1) * (1 - leave), textAlign: align, ...style}}>
			<Text variant="display" size={size} weight={weight} color={color} align={align} style={{lineHeight: 1.02, letterSpacing: '-0.035em'}}>
				{text}
			</Text>
		</div>
	);
};

/** Text typed in character by character from `at`, with a blinking caret while it types. */
export const TypeOn: React.FC<{text: string; at: number; charsPerSecond?: number; size?: number; color: string; weight?: number; caret?: string; style?: React.CSSProperties}> = ({text, at, charsPerSecond = 26, size = 40, color, weight = TYPE.weights.strong, caret, style}) => {
	const seconds = useSeconds();
	const shown = Math.max(0, Math.min(text.length, Math.floor((seconds - at) * charsPerSecond)));
	const typing = shown < text.length && seconds >= at;
	const blink = Math.floor(seconds * 2.2) % 2 === 0;
	return (
		<Text size={size} weight={weight} color={color} style={{lineHeight: 1.35, ...style}}>
			{text.slice(0, shown)}
			<span style={{opacity: typing || blink ? 1 : 0, color: caret ?? color}}>{seconds >= at ? '▍' : ''}</span>
		</Text>
	);
};

/** How long `text` takes to type at `charsPerSecond`. */
export const typingSeconds = (text: string, charsPerSecond = 26): number => text.length / charsPerSecond;

/** The narration as a subtitle, for viewers without sound; skipped when the screen already says the same words. */
export const PromoSubtitle: React.FC<{text: string; shown?: string; enabled: boolean; ink: string; fill: string; bottom?: number}> = ({text, shown = '', enabled, ink, fill, bottom = 0}) => {
	const {u} = useVideoLayout();
	const land = useLand(0.25);
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '');
	if (!enabled || !text || plain(text) === plain(shown)) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: u(bottom), display: 'flex', justifyContent: 'center', opacity: land}}>
			<div style={{maxWidth: u(860), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(18), backgroundColor: fill}}>
				<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.strong} align="center" color={ink}>
					{text}
				</Text>
			</div>
		</div>
	);
};

/** A UI/UX drawing (390 × 844 phone screen) inside a phone, in reference pixels. */
export const PhoneShot: React.FC<{width: number; rotate?: number; children: React.ReactNode}> = ({width, rotate, children}) => {
	const {u} = useVideoLayout();
	return (
		<UIProvider lang="tr" mode="light">
			<DevicePhone width={u(width)} rotate={rotate}>
				{children}
			</DevicePhone>
		</UIProvider>
	);
};

/** A UI/UX web drawing (1440 × 900) inside a browser window, in reference pixels. */
export const BrowserShot: React.FC<{width: number; title?: string; children: React.ReactNode}> = ({width, title, children}) => {
	const {u} = useVideoLayout();
	return (
		<UIProvider lang="tr" mode="light">
			<DeviceBrowser width={u(width)} title={title}>
				{children}
			</DeviceBrowser>
		</UIProvider>
	);
};

/** Count from 0 to `to` between two moments, formatted the Turkish way (78,5). */
export const useCount = (to: number, from: number, until: number, decimals = 1): string => {
	const value = to * ease(interpolate(useSeconds(), [from, until], [0, 1], CLAMP));
	return value.toFixed(decimals).replace('.', ',');
};

/**
 * When each of `words` is heard in a narrated line, in seconds from the start
 * of its scene, so a word lands on screen as it is said. The line's clip gives
 * only its total length, so a word's moment is placed by where it sits in the
 * spoken text. Without a clip (no narration) the `fallback` times are used.
 */
export const wordCues = (spoken: string, words: readonly string[], voiceSeconds: number | undefined, fallback: readonly number[]): number[] => {
	if (!voiceSeconds) return [...fallback];
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N} ]+/gu, ' ');
	const text = plain(spoken);
	let from = 0;
	return words.map((word, index) => {
		const target = plain(word).trim();
		const at = target ? text.indexOf(target, from) : -1;
		if (at < 0) return fallback[index] ?? 0;
		from = at + target.length;
		// A word lands a moment before it is heard, as an editor cuts on the beat.
		return Math.max(0, VOICE_LEAD_SECONDS + (voiceSeconds * at) / Math.max(1, text.length) - 0.08);
	});
};
