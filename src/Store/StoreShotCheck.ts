/**
 * Checks a rendered phone or iPad store picture against StoreLayout: the
 * device's black frame is found on all four sides where the layout puts it
 * (so the device stands in the same place on every shot) and nothing of the
 * frame touches the picture's bottom edge (so nothing is cut). Run by
 * scripts/RenderStoreSet.ts after every shot; a failed picture stops the run.
 */
import {readFileSync} from 'node:fs';
import {PNG} from 'pngjs';
import {STORE_SLIDES} from './StoreListing';
import {fitStage, FRAME, MARK, PHONE_STAGE, phoneBox, TABLET_STAGE, tabletStageDevice, toPicture, type Box} from './StoreLayout';
import type {StoreSetProps} from './StoreProps';
import {lookMarkColors} from './StoreLooks';

/** The frame colour (#0B0B0F) and how far a pixel may be from it. */
const FRAME_RGB = [11, 11, 15] as const;
const TOLERANCE = 10;

/** Where the device stands in the picture, or null when the picture has no phone or iPad. */
const deviceBox = (props: StoreSetProps): {box: Box; bezel: number} | null => {
	if (props.kind !== 'shot') return null;
	if (props.device === 'iphone' || props.device === 'android') {
		const android = props.device === 'android';
		const box = toPicture(phoneBox(android), fitStage(PHONE_STAGE, props.width, props.height));
		return {box, bezel: box.width * FRAME[android ? 'android' : 'iphone'].bezel};
	}
	if (props.device === 'ipad') {
		const hasTablet = Boolean(STORE_SLIDES[props.slide].screens.tablet);
		const box = toPicture(tabletStageDevice(hasTablet), fitStage(TABLET_STAGE, props.width, props.height));
		return {box, bezel: box.width * (hasTablet ? FRAME.tablet.bezel : FRAME.iphone.bezel)};
	}
	return null;
};

const rgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];

/**
 * The key-word box against the headline letters (owner, 18 Nov 2026: the box
 * cut into the line above). Finds the box by its colour (the topmost long run),
 * then asks for clean rows between it and any headline letter above or below:
 * at least MARK.minGap em, the em taken from the box height.
 */
const checkMarkGap = (png: PNG, props: StoreSetProps): string[] => {
	if (props.kind === 'watch' || props.textless) return [];
	const colors = lookMarkColors(props.look);
	if (colors.ribbon) return [];
	const mark = rgb(colors.mark);
	const ink = rgb(colors.ink);
	const at = (x: number, y: number) => (y * png.width + x) * 4;
	const near = (x: number, y: number, c: readonly number[], tol: number) => c.every((v, k) => Math.abs(png.data[at(x, y) + k] - v) <= tol);
	const minRun = Math.max(30, Math.round(png.width * 0.03));
	const runIn = (y: number): [number, number] | null => {
		let best: [number, number] | null = null;
		let start = -1;
		for (let x = 0; x <= png.width; x++) {
			const on = x < png.width && near(x, y, mark, 6);
			if (on && start < 0) start = x;
			if (!on && start >= 0) {
				// The headline box sits on the page ground: next to it is the colour of the picture's left edge, not a card or a screen.
				const ground = (xx: number) => xx >= 0 && xx < png.width && near(xx, y, [png.data[at(0, y)], png.data[at(0, y) + 1], png.data[at(0, y) + 2]], 80);
				const onGround = ground(start - 4) || ground(x + 3);
				if (onGround && x - start >= minRun && (!best || x - start > best[1] - best[0])) best = [start, x - 1];
				start = -1;
			}
		}
		return best;
	};
	let top = -1;
	for (let y = 0; y < png.height && top < 0; y++) if (runIn(y)) top = y;
	if (top < 0) return [];
	// The box's width from a row just under its rounded top, then its rows: every row where the box colour fills most of that width (letters cover the rest).
	const span = runIn(Math.min(png.height - 1, top + 4)) ?? runIn(top)!;
	const filled = (y: number) => {
		let count = 0;
		for (let x = span[0]; x <= span[1]; x++) if (near(x, y, mark, 6)) count++;
		return count >= (span[1] - span[0] + 1) * 0.3 || near(span[0] + 3, y, mark, 6) || near(span[1] - 3, y, mark, 6);
	};
	let bottom = top;
	while (bottom + 1 < png.height && filled(bottom + 1)) bottom++;
	const em = (bottom - top + 1) / (MARK.top + MARK.bottom);
	const gap = Math.max(2, Math.floor(MARK.minGap * em * 0.8));
	const inset = Math.round((span[1] - span[0]) * 0.04);
	const touches = (from: number, step: number) => {
		for (let i = 1; i <= gap; i++) {
			const y = from + step * i;
			if (y < 0 || y >= png.height) return false;
			for (let x = span[0] + inset; x <= span[1] - inset; x++) if (near(x, y, ink, 70)) return true;
		}
		return false;
	};
	const problems: string[] = [];
	if (touches(top, -1)) problems.push(`vurgu kutusu üst satırın harflerine değiyor (y ${top}, en az ${gap} px boşluk gerekli)`);
	if (touches(bottom, 1)) problems.push(`vurgu kutusu alt satırın harflerine değiyor (y ${bottom}, en az ${gap} px boşluk gerekli)`);
	return problems;
};

/** Problems found in a rendered picture; empty when it is right. */
export const checkShot = (file: string, props: StoreSetProps): string[] => {
	const png = PNG.sync.read(readFileSync(file));
	const markProblems = checkMarkGap(png, props);
	const isFrame = (x: number, y: number) => {
		const i = (Math.round(y) * png.width + Math.round(x)) * 4;
		return FRAME_RGB.every((value, c) => Math.abs(png.data[i + c] - value) <= TOLERANCE);
	};
	// The picture's last rows: nothing of a device frame may reach the edge.
	// Every shot, the Duo ones too (19 Nov 2026: the closed Duo was cut).
	const edgeCut = (): string[] => {
		for (let y = png.height - 3; y < png.height; y++) {
			for (let x = 0; x < png.width; x += 2) if (isFrame(x, y)) return [`cihaz görselin alt kenarında kesiliyor (x ${x})`];
		}
		return [];
	};
	const at = deviceBox(props);
	if (!at) return props.kind === 'shot' ? [...markProblems, ...edgeCut()] : markProblems;
	if (png.width !== props.width || png.height !== props.height) return [...markProblems, `boyut ${png.width}×${png.height}, beklenen ${props.width}×${props.height}`];
	const {box, bezel} = at;
	const half = bezel / 2;
	const problems: string[] = [...markProblems];
	// Mid-bezel on each side. The left and right probes sit high, above the floating card.
	const probes: [string, number, number][] = [
		['üst', box.x + box.width / 2, box.y + half],
		['alt', box.x + box.width / 2, box.y + box.height - half],
		['sol', box.x + half, box.y + box.height * 0.2],
		['sağ', box.x + box.width - half, box.y + box.height * 0.2],
	];
	for (const [side, x, y] of probes) if (!isFrame(x, y)) problems.push(`çerçevenin ${side} kenarı beklenen yerde değil (${Math.round(x)}, ${Math.round(y)})`);
	// Just outside the device: no frame there (it would mean the device is bigger or moved).
	if (isFrame(box.x + box.width / 2, box.y + box.height + 2)) problems.push('çerçeve beklenen alt kenarın dışına taşıyor');
	return [...problems, ...edgeCut()];
};
