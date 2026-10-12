import {z} from 'zod';
import type {Theme} from './Theme';

/**
 * A brand colour palette as plain data, and the rule that turns it into a
 * theme. Palettes are how new brand colours enter the system: nothing that
 * exists is edited, a palette is applied on top of a theme's typography and
 * shape to get a new, separately selectable look.
 */
const HexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Colours must be 6-digit hex, e.g. "#5B3DF5".');

export const ColorPaletteSchema = z.object({
	primary: HexColor,
	accent: HexColor,
	background: HexColor,
	surface: HexColor,
	text: HexColor,
	/** Everything below is optional and derived from the colours above when left out. */
	secondary: HexColor.optional(),
	muted: HexColor.optional(),
	border: HexColor.optional(),
	success: HexColor.optional(),
	warning: HexColor.optional(),
	error: HexColor.optional(),
	/** Two or three stops for gradient backgrounds. */
	gradient: z.array(HexColor).min(2).max(3).optional(),
});

export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

const channels = (hex: string): [number, number, number] => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)) as [number, number, number];

const toHex = (rgb: number[]): string =>
	`#${rgb.map((value) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

export const relativeLuminance = (hex: string): number => {
	const [r, g, b] = channels(hex).map((value) => {
		const share = value / 255;
		return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio, 1 to 21. */
export const contrastRatio = (a: string, b: string): number => {
	const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
};

/** `amount` 0 gives `from`, 1 gives `to`. */
export const mixColors = (from: string, to: string, amount: number): string => {
	const [a, b] = [channels(from), channels(to)];
	return toHex(a.map((value, index) => value + (b[index] - value) * amount));
};

const LIGHT_INK = '#FFFFFF';
const DARK_INK = '#111827';

/** White or near-black, whichever reads better on `backdrop`. */
export const readableOn = (backdrop: string): string =>
	contrastRatio(LIGHT_INK, backdrop) >= contrastRatio(DARK_INK, backdrop) ? LIGHT_INK : DARK_INK;

const firstReadable = (candidates: (string | undefined)[], backdrop: string, minimum: number, fallback: string): string =>
	candidates.find((color): color is string => Boolean(color) && contrastRatio(color as string, backdrop) >= minimum) ?? fallback;

/**
 * Builds a theme from a palette. Typography, shape and motion come from
 * `base`; every colour comes from the palette. Text-on-colour pairs are
 * derived so they stay readable whatever colours are supplied.
 */
export const applyPalette = (base: Theme, palette: ColorPalette, name = `${base.name} · özel palet`): Theme => {
	const {primary, accent, background, surface, text} = palette;
	const onSurface = contrastRatio(text, surface) >= 4.5 ? text : readableOn(surface);
	const muted = palette.muted ?? mixColors(text, background, 0.38);
	const fills = [primary, accent, palette.secondary, palette.success ?? base.colors.success, palette.warning ?? base.colors.warning];
	const success = palette.success ?? base.colors.success;

	return {
		...base,
		name,
		description: `${base.name} tipografisi ve biçimi, özel renk paleti.`,
		colors: {
			background,
			text,
			textMuted: contrastRatio(muted, background) >= 3 ? muted : mixColors(text, background, 0.3),
			canvasAccent: firstReadable([primary, accent, palette.secondary], background, 3, text),
			surface,
			surfaceAlt: mixColors(surface, onSurface, 0.07),
			onSurface,
			onSurfaceMuted: contrastRatio(muted, surface) >= 3 ? muted : mixColors(onSurface, surface, 0.35),
			border: palette.border ?? mixColors(surface, onSurface, 0.16),
			primary,
			onPrimary: readableOn(primary),
			primaryText: firstReadable([primary, palette.secondary, accent], surface, 4.5, onSurface),
			accent,
			onAccent: readableOn(accent),
			success,
			danger: palette.error ?? base.colors.danger,
			warning: palette.warning ?? base.colors.warning,
			onStatus: readableOn(success),
			highlight: accent,
			categorical: fills
				.filter((fill): fill is string => Boolean(fill))
				.map((fill) => ({fill, on: readableOn(fill)})),
		},
		gradient: palette.gradient ?? [primary, palette.secondary ?? accent],
		// The base theme's background texture is drawn in its own colours, so a palette starts from a plain canvas.
		background: {kind: 'solid'},
	};
};
