import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {promisify} from 'node:util';
import {renderStill, selectComposition, type HeadlessBrowser} from '@remotion/renderer';
import {WORK_FIGURE_ROOM, WORK_FIGURE_STILL_WIDTH, collectWorkFigures, isRasterFigure, workFigureBox, type WorkFigureEntry, type WorkFigureMode} from '../Courses/WorkFigure';
import {WORK_FIGURE_COMPOSITION_ID, WORK_FIGURE_FPS, WORK_FIGURE_MARGIN, workFigurePage, workFigureSeconds, type WorkFigureProps} from '../Compositions/WorkFigureProps';
import {bundleProject, isFrameWarning} from './VideoRenderer';

const run = promisify(execFile);

const PAD = WORK_FIGURE_ROOM;

/**
 * Turns each PDF page into an SVG with its text as outlines (PyMuPDF): no fonts to load on any device, no script, no
 * foreignObject. Prints, per file, the page size and the box of what is drawn (in PDF points), found on a small picture
 * of the page, so that what a clip path hides does not count: a map's countries beyond its frame stretched the box of
 * the drawing commands and left the map small in a corner of the still (Soru revizyonu, 1 Nov 2026). Arguments: pairs
 * of input PDF and output SVG.
 */
const PDF_TO_SVG = `
import sys, json, fitz
from PIL import Image
out = []
args = sys.argv[1:]
for pdf, svg in zip(args[0::2], args[1::2]):
    doc = fitz.open(pdf)
    page = doc[0]
    zoom = 0.5
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=True)
    alpha = Image.frombytes('RGBA', (pix.width, pix.height), pix.samples).getchannel('A').point(lambda value: 255 if value > 8 else 0)
    found = alpha.getbbox()
    box = [value / zoom for value in found] if found else [0, 0, 0, 0]
    open(svg, 'w', encoding='utf-8').write(page.get_svg_image(text_as_path=True))
    out.append({'page': [page.rect.width, page.rect.height], 'box': box})
print(json.dumps(out))
`;

/**
 * Crops each PNG to a box (pixels), brings it to the still's width and saves it as WebP; arguments: width, x0 y0 x1 y1,
 * then pairs of input PNG and output WebP.
 */
const PNG_TO_WEBP = `
import sys
from PIL import Image
width = int(sys.argv[1])
x0, y0, x1, y1 = (int(round(float(v))) for v in sys.argv[2:6])
args = sys.argv[6:]
for png, webp in zip(args[0::2], args[1::2]):
    image = Image.open(png).convert('RGBA').crop((x0, y0, x1, y1))
    if image.width != width:
        image = image.resize((width, max(1, round(image.height * width / image.width))), Image.LANCZOS)
    image.save(webp, 'WEBP', quality=92, method=6)
`;

/** The alpha box of each PNG (pixels), for cropping raster figures to what is drawn. */
const PNG_BOXES = `
import sys, json
from PIL import Image
print(json.dumps([Image.open(p).convert('RGBA').getchannel('A').getbbox() for p in sys.argv[1:]]))
`;

type Box = [number, number, number, number];

/**
 * The part of the page a still keeps, in layout units: what is drawn, with some room, never narrower than the figure's
 * box (so most stills share a scale: a layout unit is 1280 / 900 pixels), and at least one eighth of the width tall (the
 * API's longest-to-shortest limit is 8). A label that runs past the box stays whole: the crop took only the box across
 * and cut "Devlet resmen kuruldu" to "evlet resmen kuruldu" (Soru revizyonu, 1 Nov 2026).
 */
export const stillCrop = (drawn: readonly Box[], page: {width: number; height: number}, boxWidth: number) => {
	const found = drawn.filter(([a, b, c, d]) => c > a && d > b);
	const left = Math.max(0, Math.min(WORK_FIGURE_MARGIN, ...found.map((box) => box[0])) - PAD);
	const right = Math.min(page.width, Math.max(WORK_FIGURE_MARGIN + boxWidth, ...found.map((box) => box[2])) + PAD);
	const width = right - left;
	let top = found.length ? Math.max(0, Math.min(...found.map((box) => box[1])) - PAD) : 0;
	let bottom = found.length ? Math.min(page.height, Math.max(...found.map((box) => box[3])) + PAD) : Math.min(page.height, width / 8);
	const least = width / 8;
	if (bottom - top < least) {
		const grow = (least - (bottom - top)) / 2;
		[top, bottom] = [Math.max(0, top - grow), Math.min(page.height, bottom + grow)];
	}
	return {x: left, y: top, width, height: bottom - top};
};

/** The pixel size of a still cut from a crop: 1280 wide, as tall as the crop's shape. */
export const stillSize = (crop: {width: number; height: number}) => ({width: WORK_FIGURE_STILL_WIDTH, height: Math.round((WORK_FIGURE_STILL_WIDTH * crop.height) / crop.width)});

/**
 * Sets an SVG's frame: the crop as its viewBox (in the SVG's own units: PDF points, `unitsPerPixel` of them per layout
 * unit) and its pixel size as width and height.
 */
export const frameSvg = (svg: string, crop: {x: number; y: number; width: number; height: number}, unitsPerPixel: number): string => {
	const size = stillSize(crop);
	const viewBox = [crop.x, crop.y, crop.width, crop.height].map((value) => +(value * unitsPerPixel).toFixed(3)).join(' ');
	return svg.replace(/<svg\b[^>]*>/, (open) =>
		open.replace(/\s(width|height|viewBox)="[^"]*"/g, '').replace(/<svg\b/, `<svg width="${size.width}" height="${size.height}" viewBox="${viewBox}"`),
	);
};

/** A number written with `decimals` places at most, without trailing zeros or a leading zero ("0.50" → ".5"). */
const shortNumber = (value: number, decimals: number): string => {
	const text = String(Number(value.toFixed(Math.max(0, decimals))));
	return text === '-0' ? '0' : text.replace(/^(-?)0\./, '$1.');
};

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/** The scale of a `matrix(a,b,c,d,e,f)` transform: how much it stretches lengths. */
const matrixScale = (transform: string | undefined): number => {
	const values = transform?.match(/matrix\(([^)]*)\)/)?.[1].split(/[ ,]+/).map(Number);
	return values && values.length === 6 ? Math.sqrt(Math.abs(values[0] * values[3] - values[1] * values[2])) || 1 : 1;
};

/**
 * Path data with every number rounded to `decimals`, each number set apart by a space or its own minus sign. A minus
 * sign or a second decimal point is also a separator, so "629.17-.33" rounded naively ran together into "6290" and
 * filled the inside of a bold D (Soru revizyonu, 1 Nov 2026).
 */
export const compactPathData = (d: string, decimals: number): string =>
	d
		.replace(/,/g, ' ')
		.replace(NUMBER, (number) => ` ${shortNumber(Number(number), decimals)}`)
		.replace(/\s+-/g, '-')
		.replace(/\s*([A-DF-Za-df-z])\s*/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();

type Point = [number, number];

/** Keeps the points of a line that matter at `tolerance`: no dropped point lies farther than that from what is drawn (Ramer-Douglas-Peucker). */
const simplifyLine = (points: readonly Point[], tolerance: number): Point[] => {
	if (points.length < 3) return [...points];
	const keep = new Uint8Array(points.length);
	keep[0] = keep[points.length - 1] = 1;
	const stack: [number, number][] = [[0, points.length - 1]];
	while (stack.length) {
		const [first, last] = stack.pop() as [number, number];
		const [ax, ay] = points[first];
		const [bx, by] = points[last];
		const length = Math.hypot(bx - ax, by - ay);
		let farthest = -1;
		let distance = tolerance;
		for (let index = first + 1; index < last; index++) {
			const [px, py] = points[index];
			const away = length === 0 ? Math.hypot(px - ax, py - ay) : Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
			if (away > distance) [farthest, distance] = [index, away];
		}
		if (farthest > 0) {
			keep[farthest] = 1;
			stack.push([first, farthest], [farthest, last]);
		}
	}
	return points.filter((_, index) => keep[index]);
};

/**
 * Path data made only of straight lines (M, L, H, V, Z: country borders, coastlines) with the points that change
 * nothing at `tolerance` left out; other path data comes back as it is. A ring keeps at least three points.
 */
export const simplifyPolylines = (d: string, tolerance: number): string => {
	if (/[^MLHVZ\d\s.,eE+-]/.test(d)) return d;
	const tokens = d.match(/[MLHVZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
	const rings: {points: Point[]; closed: boolean}[] = [];
	let command = '';
	let current: Point = [0, 0];
	for (let index = 0; index < tokens.length; ) {
		const token = tokens[index];
		if (/^[MLHVZ]$/i.test(token)) {
			command = token.toUpperCase();
			index++;
			if (command === 'Z' && rings.length) {
				rings[rings.length - 1].closed = true;
				current = rings[rings.length - 1].points[0];
			}
			continue;
		}
		if (command === 'M') {
			current = [Number(tokens[index]), Number(tokens[index + 1])];
			rings.push({points: [current], closed: false});
			index += 2;
			command = 'L';
		} else if (command === 'L') {
			current = [Number(tokens[index]), Number(tokens[index + 1])];
			index += 2;
			rings[rings.length - 1]?.points.push(current);
		} else if (command === 'H' || command === 'V') {
			current = command === 'H' ? [Number(token), current[1]] : [current[0], Number(token)];
			index++;
			rings[rings.length - 1]?.points.push(current);
		} else return d;
	}
	return rings
		.map(({points, closed}) => {
			let kept = simplifyLine(points, tolerance);
			if (closed && kept.length < 3) kept = points.length <= 3 ? [...points] : [points[0], points[Math.floor(points.length / 3)], points[Math.floor((2 * points.length) / 3)]];
			return `M${kept.map(([x, y]) => `${x} ${y}`).join(' ')}${closed ? 'Z' : ''}`;
		})
		.join('');
};

const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:[^>"]|"[^"]*")*?)(\/?)>/g;

const attributeOf = (attributes: string, name: string) => attributes.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/**
 * Makes an SVG from MuPDF smaller without a visible change: every number in a path is written with only as many
 * decimals as keep it within a tenth of a still pixel, given how far the transforms around it stretch it (a glyph in em
 * units needs three, a page path in quarter points one), and translations likewise. Glyph shapes kept in <defs> take
 * the largest stretch any <use> of them has. `pixelsPerUnit`: still pixels per SVG unit at the root. A map came out at
 * 1.4 MB and a climate chart at 700 KB where the API's own drawings take 4-36 KB (Soru revizyonu, 1 Nov 2026).
 */
export const compactSvg = (svg: string, pixelsPerUnit: number): string => {
	// First pass: how far each referenced shape is stretched where it is used.
	const useScale = new Map<string, number>();
	const stack: number[] = [1];
	for (const match of svg.matchAll(TAG)) {
		const [, closing, name, attributes, selfClosing] = match;
		if (closing) {
			stack.pop();
			continue;
		}
		const scale = stack[stack.length - 1] * matrixScale(attributeOf(attributes, 'transform'));
		if (name === 'use') {
			const target = attributeOf(attributes, 'xlink:href') ?? attributeOf(attributes, 'href');
			if (target?.startsWith('#')) useScale.set(target.slice(1), Math.max(useScale.get(target.slice(1)) ?? 0, scale));
		}
		if (!selfClosing) stack.push(scale);
	}
	// Second pass: rewrite the numbers.
	const scales: number[] = [1];
	const decimalsFor = (scale: number) => Math.min(4, Math.max(0, Math.ceil(Math.log10(scale * pixelsPerUnit * 10))));
	return svg.replace(TAG, (tag: string, closing: string, name: string, attributes: string, selfClosing: string) => {
		if (closing) {
			scales.pop();
			return tag;
		}
		const parent = scales[scales.length - 1];
		const id = attributeOf(attributes, 'id');
		const base = id && useScale.has(id) ? parent * (useScale.get(id) ?? 1) : parent;
		const transform = attributeOf(attributes, 'transform');
		const scale = base * matrixScale(transform);
		let rewritten = attributes;
		if (transform?.startsWith('matrix(')) {
			const values = transform.slice(7, -1).split(/[ ,]+/).map(Number);
			const linear = values.slice(0, 4).map((value) => shortNumber(value, 6));
			const shift = values.slice(4).map((value) => shortNumber(value, decimalsFor(base)));
			rewritten = rewritten.replace(`transform="${transform}"`, `transform="matrix(${[...linear, ...shift].join(',')})"`);
		}
		const d = attributeOf(rewritten, 'd');
		if (d) {
			const decimals = decimalsFor(scale);
			// A quarter of a still pixel: lines lose no visible bend.
			const short = compactPathData(simplifyPolylines(d, 0.25 / (scale * pixelsPerUnit)), decimals);
			rewritten = rewritten.replace(`d="${d}"`, `d="${short}"`);
		}
		if (!selfClosing) scales.push(scale);
		return `<${name}${rewritten}${selfClosing}>`;
	});
};

/**
 * The size of the text in a still, in still pixels: the em of each drawn glyph (MuPDF writes text as <use> of glyph
 * shapes, scaled to the font size), spaces left out, smallest first. The contract asks for 28 at least (1/45 of 1280).
 */
export const stillTextSizes = (svg: string, pixelsPerUnit: number): number[] =>
	[...svg.matchAll(/<use\b([^>]*)>/g)]
		.filter((match) => /href="#font_/.test(match[1]) && !/data-text="(?:\s|&#x20;|&#xa0;)?"/i.test(match[1]))
		.map((match) => matrixScale(match[1].match(/transform="([^"]*)"/)?.[1]) * pixelsPerUnit)
		.sort((a, b) => a - b);

/** The text size most of a still's text is at least: the tenth smallest glyph in a hundred (a stray tiny mark aside). */
export const smallTextSize = (sizes: readonly number[]): number | undefined => (sizes.length ? Math.round(sizes[Math.floor(sizes.length / 10)] * 10) / 10 : undefined);

/** Refuses an SVG the app must not load: scripts, foreignObject, or anything fetched from elsewhere (only data: images). */
export const checkSvg = (svg: string): string[] => {
	const problems: string[] = [];
	if (/<script\b/i.test(svg)) problems.push('script');
	if (/<foreignObject\b/i.test(svg)) problems.push('foreignObject');
	// The rest of what the API refuses (contract §2): embedded documents, media, canvas, animation and DTDs.
	for (const name of ['iframe', 'object', 'embed', 'audio', 'video', 'canvas', 'animate', 'set', 'animateMotion', 'animateTransform']) if (new RegExp(`<${name}\\b`, 'i').test(svg)) problems.push(name);
	if (/<!DOCTYPE/i.test(svg)) problems.push('DTD');
	if (/\son[a-z]+\s*=/i.test(svg)) problems.push('event handler');
	for (const match of svg.matchAll(/(?:xlink:)?href\s*=\s*"([^"]*)"/gi)) {
		const target = match[1];
		if (!target.startsWith('#') && !target.startsWith('data:image/')) problems.push(`external link ${target.slice(0, 40)}`);
	}
	if (/@import|url\(\s*['"]?https?:/i.test(svg)) problems.push('external style');
	return problems;
};

export type WorkFigureStill = {
	name: string;
	pointer: string;
	kind: string;
	format: 'svg' | 'webp';
	light: string;
	dark: string;
	sha256: {light: string; dark: string};
	width: number;
	height: number;
	/** Most of the text is at least this big, in still pixels (SVG only). */
	textPx?: number;
	/** What the layout guard found on the light still: text over text, text cut off. */
	layout?: string[];
	/** Texts the figure drew under the floor, raised before the still was taken (how many, and the first few). */
	raised?: {count: number; text: string};
};

const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');

/**
 * Browser messages that spoil a still: a font or picture the page could not load is drawn with a fallback, and an
 * outline SVG keeps that wrong shape for good (a font load was reset under a busy bundle server, 1 Nov 2026).
 */
export const spoilsStill = (text: string): boolean => /Failed to load resource|Browser failed to load/i.test(text);

/** What the layout guard found on a still ("[LayoutGuard] kare 1199: "X" ile "Y" üst üste" → the finding), or undefined. */
export const layoutFinding = (text: string): string | undefined => /^\[LayoutGuard\] kare \d+: (.+)$/s.exec(text.trim())?.[1];

/** How many texts the still's last guard had to raise to the floor ("[TextFloor] 3: …" → 3), or undefined. */
export const raisedCount = (text: string): number | undefined => {
	const count = /^\[TextFloor\] (\d+):/.exec(text.trim())?.[1];
	return count === undefined ? undefined : Number(count);
};

/**
 * Draws one figure in the app's light and dark colours and writes `<name>-light.svg` and `<name>-dark.svg` (WebP for
 * solids and pictures) into `directory`. Both have the same size: the crop is the union of what each draws.
 */
export const renderWorkFigure = async (entry: WorkFigureEntry, directory: string, browser: HeadlessBrowser): Promise<WorkFigureStill> => {
	const serveUrl = await bundleProject();
	const raster = isRasterFigure(entry.visual);
	const work = await mkdtemp(path.join(os.tmpdir(), 'work-figure-'));
	try {
		const page = workFigurePage({visual: entry.visual});
		const base = await selectComposition({serveUrl, id: WORK_FIGURE_COMPOSITION_ID, inputProps: {visual: entry.visual, beats: entry.beats, mode: 'light'}, puppeteerInstance: browser});
		const frames = Math.round(workFigureSeconds(entry.beats) * WORK_FIGURE_FPS);
		const modes: WorkFigureMode[] = ['light', 'dark'];
		const scale = raster ? WORK_FIGURE_STILL_WIDTH / (workFigureBox(entry.visual).width + 2 * PAD) : 1;
		const spoiled: string[] = [];
		const layout: string[] = [];
		let raised: {count: number; text: string} | undefined;
		const rendered = await Promise.all(
			modes.map(async (mode) => {
				const props: WorkFigureProps = {visual: entry.visual, beats: entry.beats as WorkFigureProps['beats'], mode};
				const file = path.join(work, `${mode}.${raster ? 'png' : 'pdf'}`);
				await renderStill({
					composition: {...base, width: page.width, height: page.height, durationInFrames: frames, props},
					serveUrl,
					output: file,
					frame: frames - 1,
					inputProps: props,
					imageFormat: raster ? 'png' : 'pdf',
					scale,
					puppeteerInstance: browser,
					chromiumOptions: {gl: 'angle'},
					// Library notices (THREE.Clock) are left out; a resource that did not load fails the figure.
					onBrowserLog: (log) => {
						if (!isFrameWarning(log)) return;
						if (spoilsStill(log.text)) spoiled.push(log.text);
						const finding = layoutFinding(log.text);
						if (finding && !layout.includes(finding)) layout.push(finding);
						const count = raisedCount(log.text);
						if (count !== undefined) raised = {count, text: log.text.trim().replace(/^\[TextFloor\] \d+: /, '')};
					},
				});
				return file;
			}),
		);
		if (spoiled.length) throw new Error(`${entry.name}: ${spoiled[0].slice(0, 120)}`);
		await mkdir(directory, {recursive: true});
		const target = (mode: WorkFigureMode) => path.join(directory, `${entry.name}-${mode}.${raster ? 'webp' : 'svg'}`);
		let size: {width: number; height: number};
		let textPx: number | undefined;
		if (raster) {
			const {stdout} = await run('python', ['-c', PNG_BOXES, ...rendered]);
			const boxes = (JSON.parse(stdout) as (Box | null)[]).filter((box): box is Box => Boolean(box)).map((box) => box.map((value) => value / scale) as Box);
			const crop = stillCrop(boxes, page, page.box.width);
			size = stillSize(crop);
			const pixels = [crop.x, crop.y, crop.x + crop.width, crop.y + crop.height].map((value) => value * scale);
			await run('python', ['-c', PNG_TO_WEBP, String(size.width), ...pixels.map(String), rendered[0], target('light'), rendered[1], target('dark')]);
		} else {
			const svgs = rendered.map((file) => file.replace(/\.pdf$/, '.svg'));
			const {stdout} = await run('python', ['-c', PDF_TO_SVG, rendered[0], svgs[0], rendered[1], svgs[1]], {maxBuffer: 1 << 26});
			const pages = JSON.parse(stdout) as {page: [number, number]; box: Box}[];
			// PDF points per layout unit (Chrome prints 96 px to 72 pt).
			const unitsPerPixel = pages[0].page[0] / page.width;
			const crop = stillCrop(pages.map((item) => item.box.map((value) => value / unitsPerPixel) as Box), page, page.box.width);
			size = stillSize(crop);
			// Still pixels per SVG unit (PDF point).
			const pixelsPerUnit = size.width / (crop.width * unitsPerPixel);
			for (const [index, mode] of modes.entries()) {
				const svg = compactSvg(frameSvg(await readFile(svgs[index], 'utf-8'), crop, unitsPerPixel), pixelsPerUnit);
				const problems = checkSvg(svg);
				if (problems.length) throw new Error(`${entry.name} ${mode}: ${problems.join(', ')}`);
				if (mode === 'light') textPx = smallTextSize(stillTextSizes(svg, pixelsPerUnit));
				await writeFile(target(mode), svg, 'utf-8');
			}
		}
		const [light, dark] = await Promise.all(modes.map((mode) => readFile(target(mode))));
		return {name: entry.name, pointer: entry.pointer, kind: entry.visual.kind, format: raster ? 'webp' : 'svg', light: target('light'), dark: target('dark'), sha256: {light: sha256(light), dark: sha256(dark)}, ...size, ...(textPx === undefined ? {} : {textPx}), ...(layout.length ? {layout} : {}), ...(raised ? {raised} : {})};
	} finally {
		await rm(work, {recursive: true, force: true});
	}
};

// ---------------------------------------------------------------- linking stills to the Works files (Node only: kept out of the composition)

/** A drawn figure as the command records it: where it came from and its two files with their SHA-256. */
type DrawnStill = {source: string; pointer: string; format: 'svg' | 'webp'; sha256: {light: string; dark: string}; width: number; height: number};

/** The `still` of a drawn figure (contract §5): the two addresses, named by content as the API stores them, and the size. */
export const stillOf = (row: DrawnStill, baseUrl: string) => ({
	light: `${baseUrl}${row.sha256.light}.${row.format}`,
	dark: `${baseUrl}${row.sha256.dark}.${row.format}`,
	width: row.width,
	height: row.height,
});

/** Sets the value at a JSON pointer (/lesson/sections/0/cards/1/visual) to the object returned by `change`. */
const updateAt = (root: unknown, pointer: string, change: (value: Record<string, unknown>) => Record<string, unknown>): boolean => {
	const parts = pointer.split('/').slice(1);
	let node = root as Record<string, unknown>;
	for (const part of parts.slice(0, -1)) {
		node = node?.[part] as Record<string, unknown>;
		if (!node) return false;
	}
	const last = parts[parts.length - 1];
	if (!node?.[last] || typeof node[last] !== 'object') return false;
	node[last] = change(node[last] as Record<string, unknown>);
	return true;
};

/**
 * Writes a copy of every Works file under `worksRoot` to `outRoot` with the `still` of each drawn figure set on its
 * visual (the visual's own data unchanged). Counts the files, the stills set and the figures that have no still yet.
 */
export const attachStills = (worksRoot: string, outRoot: string, rows: readonly DrawnStill[], baseUrl: string) => {
	const files = (folder: string): string[] => readdirSync(folder).flatMap((name) => {
		const full = path.join(folder, name);
		return statSync(full).isDirectory() ? files(full) : full.endsWith('.json') ? [full] : [];
	});
	const bySource = new Map<string, DrawnStill[]>();
	for (const row of rows) bySource.set(row.source, [...(bySource.get(row.source) ?? []), row]);
	let [count, stills, missing] = [0, 0, 0];
	for (const file of files(worksRoot)) {
		const script = JSON.parse(readFileSync(file, 'utf-8'));
		const source = path.relative(process.cwd(), file).replaceAll('\\', '/');
		const drawn = new Map((bySource.get(source) ?? []).map((row) => [row.pointer, row]));
		for (const entry of collectWorkFigures(script)) {
			const row = drawn.get(entry.pointer);
			if (row && updateAt(script, entry.pointer, (visual) => ({...visual, still: stillOf(row, baseUrl)}))) stills++;
			else missing++;
		}
		const target = path.join(outRoot, path.relative(worksRoot, file));
		mkdirSync(path.dirname(target), {recursive: true});
		writeFileSync(target, JSON.stringify(script, null, 1) + '\n');
		count++;
	}
	return {files: count, stills, missing};
};
