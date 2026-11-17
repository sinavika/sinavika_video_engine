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
import {fitStage, FRAME, PHONE_STAGE, phoneBox, TABLET_STAGE, tabletStageDevice, toPicture, type Box} from './StoreLayout';
import type {StoreSetProps} from './StoreProps';

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

/** Problems found in a rendered picture; empty when it is right. */
export const checkShot = (file: string, props: StoreSetProps): string[] => {
	const at = deviceBox(props);
	if (!at) return [];
	const png = PNG.sync.read(readFileSync(file));
	if (png.width !== props.width || png.height !== props.height) return [`boyut ${png.width}×${png.height}, beklenen ${props.width}×${props.height}`];
	const isFrame = (x: number, y: number) => {
		const i = (Math.round(y) * png.width + Math.round(x)) * 4;
		return FRAME_RGB.every((value, c) => Math.abs(png.data[i + c] - value) <= TOLERANCE);
	};
	const {box, bezel} = at;
	const half = bezel / 2;
	const problems: string[] = [];
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
	// The picture's last rows: nothing of the frame may reach the edge.
	for (let y = png.height - 3; y < png.height; y++) {
		for (let x = 0; x < png.width; x += 2) {
			if (isFrame(x, y)) {
				problems.push(`cihaz görselin alt kenarında kesiliyor (x ${x})`);
				return problems;
			}
		}
	}
	return problems;
};
