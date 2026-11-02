import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';

/**
 * Layout guard: finds text a viewer cannot read cleanly on the rendered frame and reports it as a render warning
 * (console.warn, collected into the render result). It was written after a sweep by eye found text running over a
 * badge and the progress bar, formulas cut off by their box, set names cut at the edge of a Venn diagram and two
 * arrow labels on top of each other; none of these raised a warning.
 *
 * It checks every line of visible text (KaTeX formulas as one box each):
 *   outside  the line leaves the frame;
 *   clipped  the line leaves an ancestor that clips its content (overflow hidden, an <svg> box);
 *   overlap  two lines of different texts cover each other;
 *   chrome   a line covers a fixed part of the frame (the progress bar: `data-layout-zone="chrome"`);
 *   struck   a drawn line runs through a text (`data-layout-stroke` on the path: a graph's curves). A demand curve
 *            crossed the y axis's name "fiyat" and the legend's "Arz" with no warning (KPSS VAT 8): text over text
 *            was checked, a line over text was not.
 *
 * A figure the camera has zoomed into (`data-layout-camera="zoomed"`, VisualTimeline's BeatCamera) cuts off its edges
 * on purpose: text the zoom leaves outside its window is not on screen and is not checked.
 *
 * It measures once the frame has settled (late content such as maps and molecules included) and only when a render
 * asks for it (`layoutGuard` in the props: stills and sweeps), so videos render as fast as before.
 */

type GuardBox = {left: number; top: number; right: number; bottom: number};
type LayoutIssue = {kind: 'outside' | 'clipped' | 'overlap' | 'chrome' | 'struck'; text: string; other?: string};

/** How long the guard waits for late content (geo files, molecules, fonts) before it measures. */
const SETTLE_MS = 400;
/** Slack for anti-aliasing and rounding, in pixels. */
const TOLERANCE = 2;
/** Two lines overlap when the shared area is at least this share of the smaller line. */
const OVERLAP_SHARE = 0.2;
/** Two lines are on one row when they share this much of the lower one's height… */
const SAME_ROW = 0.6;
/** …and run into each other when they share this many line heights of width (about two letters). */
const RUN_IN = 1.5;
/** Text fainter than this is a dimmed or fading part, not something to read. */
const MIN_OPACITY = 0.15;
const MAX_ISSUES = 8;
/** Distance between two looked-at points of a marked line, in screen pixels. */
const STROKE_STEP = 4;
/** A line strikes a text when it runs inside the text's inked box for this share of the box's smaller side. */
const STRUCK_SHARE = 0.5;

const area = (box: GuardBox) => Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top);

/** The part two boxes share (empty when they do not touch). */
export const intersection = (a: GuardBox, b: GuardBox): GuardBox => ({left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom)});

/** Whether two text lines cover each other enough to hurt reading. */
export const linesOverlap = (a: GuardBox, b: GuardBox): boolean => {
	const shared = intersection(a, b);
	const width = shared.right - shared.left;
	const height = shared.bottom - shared.top;
	if (width <= TOLERANCE || height <= TOLERANCE) return false;
	// Two lines on one row running into each other print letters over letters even when the share of a long line is
	// small: a graph's title and its yearly summary met over "ortalamalar" (KPSS Coğrafya 9).
	const lineHeight = Math.min(a.bottom - a.top, b.bottom - b.top);
	if (height >= SAME_ROW * lineHeight && width >= RUN_IN * lineHeight) return true;
	return area(shared) >= OVERLAP_SHARE * Math.min(area(a), area(b));
};

/**
 * Whether a text box leaves another one. A letter's side bearing and a measured box are not ink, so the slack grows
 * with the text: a third of its thickness (a vertical label sat 4 px over its box with every letter whole).
 */
export const leaves = (inner: GuardBox, outer: GuardBox): boolean => {
	const slack = Math.max(TOLERANCE, 0.35 * Math.min(inner.right - inner.left, inner.bottom - inner.top));
	return inner.left < outer.left - slack || inner.top < outer.top - slack || inner.right > outer.right + slack || inner.bottom > outer.bottom + slack;
};

/**
 * A text box is the font's box: the room above the capitals and below the baseline is part of it, though nothing is
 * drawn there. The guard measures the inked part, about the middle two thirds of the height (the first sweep with
 * full boxes flagged a Punnett title, a timeline's years and a rotated label that were all whole on screen).
 */
const INK_SHARE = 0.68;
export const inkBox = (box: GuardBox): GuardBox => {
	const trim = ((box.bottom - box.top) * (1 - INK_SHARE)) / 2;
	return {left: box.left, top: box.top + trim, right: box.right, bottom: box.bottom - trim};
};

type TextLine = {text: string; box: GuardBox; owner: Element};

const boxOf = (rect: DOMRect | DOMRectReadOnly): GuardBox => ({left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom});
/** A text's inked box. A text turned on its side (a vertical label) is trimmed across its width instead. */
const textBoxOf = (rect: DOMRect | DOMRectReadOnly, owner: Element): GuardBox => {
	const box = boxOf(rect);
	const sideways = owner.closest('[transform*="rotate"]') !== null && rect.height > rect.width * 1.5;
	if (!sideways) return inkBox(box);
	const trim = ((box.right - box.left) * (1 - INK_SHARE)) / 2;
	return {left: box.left + trim, top: box.top, right: box.right - trim, bottom: box.bottom};
};

/** The opacity a viewer sees: the product of the element's and its ancestors' opacity; 0 when hidden. */
const shownOpacity = (element: Element, cache: Map<Element, number>): number => {
	const known = cache.get(element);
	if (known !== undefined) return known;
	const style = getComputedStyle(element);
	const own = style.visibility === 'hidden' || style.display === 'none' ? 0 : Number(style.opacity || '1');
	const value = own * (element.parentElement ? shownOpacity(element.parentElement, cache) : 1);
	cache.set(element, value);
	return value;
};

/** The nearest ancestor that cuts off what spills out of it. */
const clippingAncestor = (element: Element, root: Element): Element | undefined => {
	for (let current = element.parentElement; current && current !== root; current = current.parentElement) {
		const style = getComputedStyle(current);
		const clips = (value: string) => value === 'hidden' || value === 'clip';
		if (clips(style.overflowX) || clips(style.overflowY)) return current;
		if (current instanceof SVGSVGElement && clips(style.overflow)) return current;
	}
	return undefined;
};

const textLines = (root: Element): TextLine[] => {
	const opacity = new Map<Element, number>();
	const lines: TextLine[] = [];
	// A formula is one box: its glyphs sit on top of each other by design.
	root.querySelectorAll('.katex-html').forEach((formula) => {
		if (shownOpacity(formula, opacity) < MIN_OPACITY) return;
		const rect = formula.getBoundingClientRect();
		if (rect.width && rect.height) lines.push({text: (formula.textContent ?? '').trim(), box: boxOf(rect), owner: formula});
	});
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = (node.textContent ?? '').trim();
		const owner = node.parentElement;
		if (!text || !owner || owner.closest('.katex') || owner.closest('[aria-hidden="true"]') || owner.closest('style,script')) continue;
		if (shownOpacity(owner, opacity) < MIN_OPACITY) continue;
		if (owner instanceof SVGElement) {
			const rect = owner.getBoundingClientRect();
			if (rect.width && rect.height) lines.push({text, box: textBoxOf(rect, owner), owner});
			continue;
		}
		const range = document.createRange();
		range.selectNodeContents(node);
		// A line its element shortens on purpose ("…") is measured as shown: the hidden rest is not text on the frame.
		const shortened = getComputedStyle(owner).textOverflow === 'ellipsis' ? boxOf(owner.getBoundingClientRect()) : undefined;
		for (const rect of Array.from(range.getClientRects())) {
			if (rect.width <= 1 || rect.height <= 1) continue;
			const box = textBoxOf(rect, owner);
			const shown = shortened ? intersection(box, shortened) : box;
			if (shown.right - shown.left > 1 && shown.bottom - shown.top > 1) lines.push({text, box: shown, owner});
		}
	}
	return lines;
};

/**
 * Whether a drawn line runs through a text: enough of its points, `step` pixels apart, fall inside the text's inked
 * box to cover half the box's smaller side. A line grazing a corner of the box is not a strike; one crossing a word
 * is, whichever way it crosses.
 */
export const strokeThrough = (points: readonly (readonly [number, number])[], box: GuardBox, step: number): boolean => {
	const inside = points.filter(([px, py]) => px > box.left && px < box.right && py > box.top && py < box.bottom).length;
	return inside * step >= STRUCK_SHARE * Math.min(box.right - box.left, box.bottom - box.top);
};

/** The screen box a clip path cuts the element to: its first rectangle in the clipped group's user space. */
const clipBoxOf = (element: Element): GuardBox | undefined => {
	const holder = element.closest('[clip-path]');
	if (!(holder instanceof SVGGraphicsElement)) return undefined;
	const id = /url\(["']?#([^"')]+)["']?\)/.exec(holder.getAttribute('clip-path') ?? '')?.[1];
	const rect = id ? document.getElementById(id)?.querySelector('rect') : null;
	const ctm = holder.getScreenCTM();
	if (!(rect instanceof SVGRectElement) || !ctm) return undefined;
	const {x, y, width, height} = {x: rect.x.baseVal.value, y: rect.y.baseVal.value, width: rect.width.baseVal.value, height: rect.height.baseVal.value};
	const [a, b] = [new DOMPoint(x, y).matrixTransform(ctm), new DOMPoint(x + width, y + height).matrixTransform(ctm)];
	return {left: Math.min(a.x, b.x), top: Math.min(a.y, b.y), right: Math.max(a.x, b.x), bottom: Math.max(a.y, b.y)};
};

type StrokeLine = {points: [number, number][]; owner: Element};

/** Whether a text is painted after the line and carries a halo thick enough to clear the line from its letters. */
const haloedOver = (text: Element, stroke: Element): boolean => {
	const element = text.closest('text');
	if (!element || !(stroke.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
	const style = getComputedStyle(element);
	return haloClears(style.paintOrder, style.stroke, parseFloat(style.strokeWidth), parseFloat(style.fontSize));
};

/** A halo clears a line from a text's letters when it is painted first, in a colour, at least 15 % of the text's size. */
export const haloClears = (paintOrder: string, stroke: string, strokeWidth: number, fontSize: number): boolean =>
	paintOrder.trim().startsWith('stroke') && stroke !== 'none' && stroke !== '' && strokeWidth >= 0.15 * fontSize;

/**
 * The marked lines on the frame as screen points: as far as drawn (`data-layout-drawn`, 0 to 1, for a line that
 * grows) and only where a clip path lets them show.
 */
const strokeLines = (root: Element, opacity: Map<Element, number>): StrokeLine[] => {
	const lines: StrokeLine[] = [];
	root.querySelectorAll('[data-layout-stroke]').forEach((element) => {
		if (!(element instanceof SVGGeometryElement) || shownOpacity(element, opacity) < MIN_OPACITY) return;
		const ctm = element.getScreenCTM();
		const total = element.getTotalLength();
		if (!ctm || !(total > 0)) return;
		const drawn = Math.min(1, Math.max(0, Number(element.getAttribute('data-layout-drawn') ?? '1')));
		const step = STROKE_STEP / (Math.hypot(ctm.a, ctm.b) || 1);
		const clip = clipBoxOf(element);
		const points: [number, number][] = [];
		for (let at = 0; at <= total * drawn; at += step) {
			const local = element.getPointAtLength(at);
			const screen = new DOMPoint(local.x, local.y).matrixTransform(ctm);
			if (clip && (screen.x < clip.left || screen.x > clip.right || screen.y < clip.top || screen.y > clip.bottom)) continue;
			points.push([screen.x, screen.y]);
		}
		if (points.length > 0) lines.push({points, owner: element});
	});
	return lines;
};

/** Whether a line lies (partly) outside a zoomed camera's window: cut off by the zoom on purpose, not a fault. */
export const croppedByCamera = (line: GuardBox, camera: GuardBox | undefined): boolean => camera !== undefined && leaves(line, camera);

const short = (text: string) => (text.length > 40 ? `${text.slice(0, 40)}…` : text);

/** Everything the guard finds on the frame under `root`. */
/**
 * Whether a scene is on its way in or out: a transition slides or fades it (a transform or opacity on a container
 * above it). Its text is not checked then: it legitimately leaves the frame and lies over the other scene's text.
 */
const inTransition = (scene: Element, root: Element, cache: Map<Element, boolean>): boolean => {
	const known = cache.get(scene);
	if (known !== undefined) return known;
	let moving = false;
	for (let current = scene.parentElement; current && current !== root; current = current.parentElement) {
		const style = getComputedStyle(current);
		if (Number(style.opacity || '1') < 0.99 || (style.transform !== 'none' && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(style.transform))) {
			moving = true;
			break;
		}
	}
	cache.set(scene, moving);
	return moving;
};

const findLayoutIssues = (root: Element): LayoutIssue[] => {
	const frame = boxOf(root.getBoundingClientRect());
	const transitions = new Map<Element, boolean>();
	const sceneOf = (line: TextLine) => line.owner.closest('[data-layout-scene]');
	// Only text of scenes standing still: a scene sliding or fading in or out is half a frame of a cut.
	const lines = textLines(root).filter((line) => {
		const scene = sceneOf(line);
		if (scene && inTransition(scene, root, transitions)) return false;
		const camera = line.owner.closest('[data-layout-camera="zoomed"]');
		return !croppedByCamera(line.box, camera ? boxOf(camera.getBoundingClientRect()) : undefined);
	});
	const zones = Array.from(root.querySelectorAll('[data-layout-zone="chrome"]')).map((zone) => ({zone, box: boxOf(zone.getBoundingClientRect())}));
	const issues: LayoutIssue[] = [];
	const add = (issue: LayoutIssue) => {
		if (!issues.some((known) => known.kind === issue.kind && known.text === issue.text && known.other === issue.other)) issues.push(issue);
	};
	for (const line of lines) {
		if (leaves(line.box, frame)) add({kind: 'outside', text: short(line.text)});
		const clip = clippingAncestor(line.owner, root);
		if (clip && leaves(line.box, boxOf(clip.getBoundingClientRect()))) add({kind: 'clipped', text: short(line.text)});
		for (const {zone, box} of zones) if (!zone.contains(line.owner) && linesOverlap(line.box, box)) add({kind: 'chrome', text: short(line.text)});
	}
	// A marked line through a text of its own scene; a scene in transition is skipped like its text, and so is a text
	// written over the line with a halo in the paper's colour, which hides the line round its letters.
	for (const stroke of strokeLines(root, new Map())) {
		const scene = stroke.owner.closest('[data-layout-scene]');
		if (scene && inTransition(scene, root, transitions)) continue;
		for (const line of lines) if (sceneOf(line) === scene && !haloedOver(line.owner, stroke.owner) && strokeThrough(stroke.points, line.box, STROKE_STEP)) add({kind: 'struck', text: short(line.text)});
	}
	for (let i = 0; i < lines.length; i++) {
		for (let j = i + 1; j < lines.length; j++) {
			const [a, b] = [lines[i], lines[j]];
			if (a.owner === b.owner || a.owner.contains(b.owner) || b.owner.contains(a.owner) || sceneOf(a) !== sceneOf(b)) continue;
			if (linesOverlap(a.box, b.box)) add({kind: 'overlap', text: short(a.text), other: short(b.text)});
		}
	}
	return issues;
};

const describe = (issue: LayoutIssue) =>
	issue.kind === 'overlap' ? `"${issue.text}" ile "${issue.other}" üst üste` : issue.kind === 'struck' ? `"${issue.text}" üstünden çizgi geçiyor` : issue.kind === 'outside' ? `"${issue.text}" kareden taşıyor` : issue.kind === 'clipped' ? `"${issue.text}" kutusundan taşıp kesiliyor` : `"${issue.text}" ilerleme çubuğunun üstünde`;

/**
 * Mount it last inside the frame; it reports through console.warn and draws nothing. `prepare` runs on the settled
 * frame first (an app still raises its small text there), and `report` false keeps the findings to itself.
 */
export const LayoutGuard: React.FC<{prepare?: (root: Element) => void; report?: boolean}> = ({prepare, report = true}) => {
	const ref = useRef<HTMLDivElement>(null);
	const frame = useCurrentFrame();
	useLayoutEffect(() => {
		const handle = delayRender('Layout guard');
		const timer = setTimeout(() => {
			const root = ref.current?.parentElement;
			if (root) prepare?.(root);
			if (root && report) {
				const issues = findLayoutIssues(root);
				issues.slice(0, MAX_ISSUES).forEach((issue) => console.warn(`[LayoutGuard] kare ${frame}: ${describe(issue)}`));
				if (issues.length > MAX_ISSUES) console.warn(`[LayoutGuard] kare ${frame}: ve ${issues.length - MAX_ISSUES} sorun daha`);
			}
			continueRender(handle);
		}, SETTLE_MS);
		return () => {
			clearTimeout(timer);
			continueRender(handle);
		};
	}, [frame, prepare, report]);
	return <AbsoluteFill ref={ref} style={{pointerEvents: 'none', visibility: 'hidden'}} aria-hidden />;
};
