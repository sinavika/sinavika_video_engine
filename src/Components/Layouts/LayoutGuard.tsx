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
 *   chrome   a line covers a fixed part of the frame (the progress bar: `data-layout-zone="chrome"`).
 *
 * It measures once the frame has settled (late content such as maps and molecules included) and only when a render
 * asks for it (`layoutGuard` in the props: stills and sweeps), so videos render as fast as before.
 */

type GuardBox = {left: number; top: number; right: number; bottom: number};
type LayoutIssue = {kind: 'outside' | 'clipped' | 'overlap' | 'chrome'; text: string; other?: string};

/** How long the guard waits for late content (geo files, molecules, fonts) before it measures. */
const SETTLE_MS = 400;
/** Slack for anti-aliasing and rounding, in pixels. */
const TOLERANCE = 2;
/** Two lines overlap when the shared area is at least this share of the smaller line. */
const OVERLAP_SHARE = 0.2;
/** Text fainter than this is a dimmed or fading part, not something to read. */
const MIN_OPACITY = 0.15;
const MAX_ISSUES = 8;

const area = (box: GuardBox) => Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top);

/** The part two boxes share (empty when they do not touch). */
export const intersection = (a: GuardBox, b: GuardBox): GuardBox => ({left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom)});

/** Whether two text lines cover each other enough to hurt reading. */
export const linesOverlap = (a: GuardBox, b: GuardBox): boolean => {
	const shared = intersection(a, b);
	if (shared.right - shared.left <= TOLERANCE || shared.bottom - shared.top <= TOLERANCE) return false;
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
		return !scene || !inTransition(scene, root, transitions);
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
	issue.kind === 'overlap' ? `"${issue.text}" ile "${issue.other}" üst üste` : issue.kind === 'outside' ? `"${issue.text}" kareden taşıyor` : issue.kind === 'clipped' ? `"${issue.text}" kutusundan taşıp kesiliyor` : `"${issue.text}" ilerleme çubuğunun üstünde`;

/** Mount it last inside the frame; it reports through console.warn and draws nothing. */
export const LayoutGuard: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);
	const frame = useCurrentFrame();
	useLayoutEffect(() => {
		const handle = delayRender('Layout guard');
		const timer = setTimeout(() => {
			const root = ref.current?.parentElement;
			if (root) {
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
	}, [frame]);
	return <AbsoluteFill ref={ref} style={{pointerEvents: 'none', visibility: 'hidden'}} aria-hidden />;
};
