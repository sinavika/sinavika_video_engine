/**
 * The last guard of an app still's smallest text (contract §2: 28 of 1280 pixels). Figures size their own text for a
 * still (useFigureFont); a drawing that does not yet, or a new kind, would print what a phone cannot read. Right before
 * the still is taken, every SVG text drawn smaller than the floor is raised to it around its anchor, halo and all, and
 * the command lists the kinds whose text had to be raised, for their own fix: a raised label is not laid out again.
 */

/** How many frame pixels a text's font size takes: its CSS size times the scale of the transforms above it. */
export const screenFontSize = (fontSize: number, matrix: {a: number; b: number; c: number; d: number}): number => fontSize * Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));

/** The factor a text must grow by to reach the floor (frame pixels); 1 when it is big enough or not drawn at all. */
export const floorFactor = (shownSize: number, floor: number): number => (shownSize > 0.01 && shownSize < floor - 0.01 ? floor / shownSize : 1);

/** A raised text: its words and its size before and after, in frame pixels. */
type RaisedText = {text: string; from: number; to: number};

/**
 * The size a part of a text is drawn at once raised: its own size grown with its text (`factor`), and never under the
 * floor itself. A smaller part (an index, a charge) keeps its share only while that share is readable: the R of XᴿXʳ
 * and the + of Na⁺, at 0.62 of their text, came out at 18 pixels (2 Nov 2026). Sizes in the part's own units.
 */
export const raisedPartSize = (size: number, factor: number, least: number): number => Math.max(size * factor, least);

/**
 * Raises every SVG text under `root` drawn smaller than `floor` frame pixels, with its tspans and its halo (stroke
 * width), and every tspan of its own size under the floor; hidden texts are left alone. Returns what it raised.
 */
const raiseSmallText = (root: Element, floor: number): RaisedText[] => {
	const raised: RaisedText[] = [];
	root.querySelectorAll('text').forEach((element) => {
		if (!(element instanceof SVGTextElement) || !(element.textContent ?? '').trim()) return;
		const matrix = element.getScreenCTM();
		if (!matrix) return;
		const style = getComputedStyle(element);
		if (style.display === 'none' || style.visibility === 'hidden') return;
		const scale = screenFontSize(1, matrix);
		if (scale < 1e-3) return;
		const size = parseFloat(style.fontSize);
		const shown = size * scale;
		const factor = floorFactor(shown, floor);
		// Each part with a size of its own grows with its text and stays over the floor; the rest inherit the raised
		// size. Sizes are read before any is written: a tspan read after its text grew grew twice.
		const own = (part: SVGElement, attribute: string, property: 'fontSize' | 'strokeWidth') => part === element || part.hasAttribute(attribute) || part.style[property] !== '';
		const parts = [element, ...Array.from(element.querySelectorAll('tspan'))].map((part) => {
			const computed = getComputedStyle(part);
			const partSize = own(part, 'font-size', 'fontSize') && (part === element || (part.textContent ?? '').trim()) ? parseFloat(computed.fontSize) : 0;
			return {part, size: partSize, target: partSize ? raisedPartSize(partSize, factor, floor / scale) : 0, stroke: own(part, 'stroke-width', 'strokeWidth') && computed.stroke !== 'none' ? parseFloat(computed.strokeWidth) : 0};
		});
		const changed = parts.filter(({size: partSize, target}) => partSize > 0 && target > partSize * 1.001);
		if (factor === 1 && changed.length === 0) return;
		for (const {part, size: partSize, target, stroke} of parts) {
			if (partSize > 0 && target > partSize * 1.001) part.style.fontSize = `${target}px`;
			// A halo grows with its own part, or with the text when the part has no size of its own.
			const grow = partSize > 0 ? target / partSize : factor;
			if (stroke > 0 && grow > 1.001) part.style.strokeWidth = `${stroke * grow}px`;
		}
		const smallest = Math.min(...changed.map(({size: partSize}) => partSize * scale), shown);
		raised.push({text: (element.textContent ?? '').trim(), from: Math.round(smallest * 10) / 10, to: Math.round(floor * 10) / 10});
	});
	return raised;
};

/** How a still is cut: `minPx` of its `width` pixels the smallest text; the box and what runs past it, with `room` around. */
type StillCut = {minPx: number; width: number; room: number};

/**
 * The smallest text (frame pixels) a drawing `span` pixels across may have: the still is cut that wide plus its room
 * and brought to its width in pixels, so a wider drawing needs bigger text.
 */
export const floorForSpan = (span: number, cut: StillCut): number => (cut.minPx * (span + 2 * cut.room)) / cut.width;

/** Whether an element is seen: not hidden, and neither it nor anything above it faded to nothing (`known` caches it). */
const seen = (element: Element, known: Map<Element, boolean>): boolean => {
	const cached = known.get(element);
	if (cached !== undefined) return cached;
	const style = getComputedStyle(element);
	const own = style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || '1') >= 0.02;
	const value = own && (element.parentElement ? seen(element.parentElement, known) : true);
	known.set(element, value);
	return value;
};

/** What a still is cut round: drawn shapes and texts, not what a clip path holds in or what only defines (defs). */
const DRAWN = 'text, path, rect, circle, ellipse, line, polyline, polygon, image';

/**
 * How far across the frame a figure reaches: its box and every seen shape and text, which may run past the box. Texts
 * alone left out an earth's rays past its box: the still came out wider than reckoned, its text at 27 pixels.
 */
const spanOf = (root: Element, box: Element): number => {
	const frame = box.getBoundingClientRect();
	let [left, right] = [frame.left, frame.right];
	const known = new Map<Element, boolean>();
	root.querySelectorAll(DRAWN).forEach((element) => {
		if (element.closest('defs, clipPath, mask, pattern, marker, [clip-path]')) return;
		const rect = element.getBoundingClientRect();
		if (rect.width <= 0 || !seen(element, known)) return;
		// An SVG that hides what spills out of it cuts its shapes to its own box.
		const holder = element.closest('svg');
		const cut = holder && getComputedStyle(holder).overflow !== 'visible' ? holder.getBoundingClientRect() : undefined;
		const [from, to] = cut ? [Math.max(rect.left, cut.left), Math.min(rect.right, cut.right)] : [rect.left, rect.right];
		if (to <= from) return;
		[left, right] = [Math.min(left, from), Math.max(right, to)];
	});
	return right - left;
};

/**
 * Raises a still's small text until the still holds it: the floor is `floor` for a drawing that stays in its `box`,
 * and is worked out again from the width the still will have when text runs past the box (a climate chart's axis names
 * past its box widened the still and left its text at 27 pixels, 2 Nov 2026), up to three times as raised text
 * reaches further. Returns what was under `floor` itself.
 */
export const raiseForStill = (root: Element, box: Element, floor: number, cut: StillCut): RaisedText[] => {
	// By words. Only what was under the figure's own floor counts as raised: the few hundredths more a wide still asks
	// of text a figure sized right are not a fault of the figure.
	const raised = new Map<string, RaisedText>();
	let least = floor;
	for (let pass = 0; pass < 3; pass++) {
		const now = raiseSmallText(root, least);
		if (pass === 0) for (const item of now) raised.set(item.text, item);
		const needed = floorForSpan(spanOf(root, box), cut);
		if (needed <= least + 0.05) break;
		least = needed;
	}
	return [...raised.values()];
};
