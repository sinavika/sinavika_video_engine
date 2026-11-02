import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useSceneSeconds, useStillTextFloor, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {H, usePartLook, W, World} from '../VisualWorld';

type Tree = Extract<CourseVisual, {kind: 'tree'}>;

/** Leaf columns of a tree: each kind is a column, a branch without kinds is one. */
const columnCount = (visual: Tree) => visual.branches.reduce((sum, branch) => sum + Math.max(1, branch.nodes.length), 0);

const MARGIN = 20;

const ITEM_TOP = 334;

/** Letters of the body font are about 0.55 em wide; examples are fitted with this. */
const EM = 0.55;

/** Below this the examples would be hard to read; a longer example wraps onto a second line instead. */
const ITEM_MIN = 20;

/** An example split in two at the space nearest its middle, or whole when it has no space. */
const halves = (item: string): string[] => {
	const spaces = [...item].flatMap((letter, index) => (letter === ' ' ? [index] : []));
	if (spaces.length === 0) return [item];
	const cut = spaces.reduce((best, index) => (Math.abs(index - item.length / 2) < Math.abs(best - item.length / 2) ? index : best));
	return [item.slice(0, cut), item.slice(cut + 1)];
};

/** Words packed into lines no wider than `room` at `size` (`em` a letter), on as many lines as they need. */
export const wrapWords = (text: string, size: number, room: number, em: number): string[] => {
	const lines: string[] = [];
	for (const word of text.split(' ')) {
		const last = lines.at(-1);
		if (last !== undefined && (last.length + 1 + word.length) * size * em <= room) lines[lines.length - 1] = `${last} ${word}`;
		else lines.push(word);
	}
	return lines;
};

/**
 * An example on one line, or, when it does not fit the column, on two split at the space nearest its middle; in an
 * app still on as many lines as its words need (two halves of "Muhtarlık Zorunlu sıbyan" ran into the next column).
 */
const wrapItem = (item: string, size: number, room: number, still: boolean): string[] => (item.length * size * EM <= room ? [item] : still ? wrapWords(item, size, room, EM) : halves(item));

/** Where each example's lines stand when examples are `size` tall from `top`, and how low the longest list reaches. */
const listsAt = (visual: Tree, size: number, room: number, column: number, top = ITEM_TOP, still = false) => {
	const line = size * 1.18;
	const gap = size * (column < 250 ? 0.85 : 0.9);
	const lists = visual.branches.map((branch) =>
		branch.nodes.map((node) => {
			let y = top;
			return node.items.map((item) => {
				const lines = wrapItem(item, size, room, still);
				const baselines = lines.map((_, index) => y + index * line);
				y += lines.length * line + gap;
				return {item, lines, baselines};
			});
		}),
	);
	const bottom = Math.max(top, ...lists.flat(2).map((entry) => entry.baselines[entry.baselines.length - 1]));
	return {lists, bottom};
};

/** Letters of the bold body font are about 0.58 em wide; box labels are fitted with this. */
const BOX_EM = 0.58;

/** A box label's lines at `size`: one line when it fits the box, else two split at the space nearest its middle. */
const boxLines = (label: string, size: number, width: number) => (label.length * size * BOX_EM <= width - 18 ? [label] : halves(label));

/**
 * One size for every label of a level, so the kinds of a tree read as one series (a long kind, "Yol, çeşme, okul
 * yapmak", shrank to half the size of its neighbours, 30 Oct 2026): each label's best size on one line or on two
 * (two lines stop at 24, the box's height), then the smallest of those, never under 18.
 */
const levelSize = (labels: readonly {label: string; width: number}[], tier: number) =>
	Math.max(
		18,
		Math.min(
			tier,
			...labels.map(({label, width}) => {
				const one = (width - 18) / Math.max(1, label.length * BOX_EM);
				const longestHalf = Math.max(...halves(label).map((part) => part.length));
				const two = Math.min(24, (width - 18) / Math.max(1, longestHalf * BOX_EM));
				return Math.max(Math.min(tier, one), two);
			}),
		),
	);

/** A box label's lines: one line or two halves in a lesson; in an app still as many as its words need. */
const labelLines = (label: string, size: number, width: number, still: boolean) => (still ? wrapWords(label, size, width - 18, BOX_EM) : boxLines(label, size, width));

/**
 * The boxes of the three levels and the rows they stand in. In a lesson: fixed rows (root at 8, branches at 116,
 * kinds at 232, examples from 334) and labels on one or two lines. In an app still (`least`, its smallest text in
 * world units, above 0) no label is under `least`; a label takes as many lines as its words need, its box grows to
 * hold them and the rows below move down: an eight-column tree's "Anayasa Mahkemesi" ran out of its box (2 Nov 2026).
 */
const levelsAt = (visual: Tree, worldWidth: number, column: number, least: number, anyItems: boolean) => {
	const still = least > 0;
	const nodeTier = column < 170 ? 23 : column < 250 ? 27 : 31;
	const branchWidths = visual.branches.map((branch) => Math.min(Math.max(1, branch.nodes.length) * column - 16, 360));
	const branchSize = Math.max(least, levelSize(visual.branches.map((branch, b) => ({label: branch.label, width: branchWidths[b]})), 30));
	const kindSize = Math.max(least, levelSize(visual.branches.flatMap((branch) => branch.nodes.map((node) => ({label: node.label, width: column - 14}))), nodeTier));
	const usualRoot = Math.min(440, visual.root.length * 22 + 90);
	const rootWidth = still ? Math.min(worldWidth - 2 * MARGIN, Math.max(usualRoot, visual.root.length * Math.max(least, 30) * BOX_EM + 40)) : usualRoot;
	const rootSize = Math.max(least, Math.min(34, (rootWidth - 18) / Math.max(1, visual.root.length * BOX_EM)));
	const heightOf = (base: number, label: string, size: number, width: number) => (still ? Math.max(base, labelLines(label, size, width, still).length * size * 1.08 + 22) : base);
	const rootHeight = heightOf(64, visual.root, rootSize, rootWidth);
	const branchHeight = Math.max(60, ...visual.branches.map((branch, b) => heightOf(60, branch.label, branchSize, branchWidths[b])));
	const kindHeight = Math.max(58, ...visual.branches.flatMap((branch) => branch.nodes.map((node) => heightOf(58, node.label, kindSize, column - 14))));
	const rootY = 8;
	const branchY = Math.max(anyItems ? 116 : 200, rootY + rootHeight + 44);
	const nodeY = Math.max(anyItems ? 232 : 400, branchY + branchHeight + 56);
	const itemTop = Math.max(ITEM_TOP, nodeY + kindHeight + 44);
	return {still, rootWidth, rootSize, rootHeight, rootY, branchWidths, branchSize, branchHeight, branchY, kindSize, kindHeight, nodeY, itemTop};
};

/**
 * Where everything in a tree goes, worked out once for the drawing and for CourseVisual's box. The world is 1000
 * wide up to four columns and 230 more for each further one (a wide tree of eight kinds of ethics gets a wide box
 * instead of tiny labels). Examples share one size: the column's size tier, shrunk until the longest example fits,
 * but never under 20; an example that still does not fit wraps onto two lines. When one long example ("Divanü
 * Lugati't-Türk") would shrink every example by more than a tenth, long examples wrap onto two lines at the larger
 * size instead, as long as the lists stay within the world's height. The world is only as tall as its longest example
 * list, so short lists do not leave an empty bottom third.
 */
const layoutAt = (visual: Tree, worldWidth: number, least = 0) => {
	const columns = columnCount(visual);
	const column = (worldWidth - MARGIN * 2) / columns;
	const room = column - 16;
	const items = visual.branches.flatMap((branch) => branch.nodes.flatMap((node) => node.items));
	const anyItems = items.length > 0;
	const levels = levelsAt(visual, worldWidth, column, least, anyItems);
	const longest = Math.max(1, ...items.map((item) => item.length));
	const longestHalf = Math.max(1, ...items.flatMap((item) => halves(item).map((part) => part.length)));
	const tier = column < 170 ? 22 : column < 250 ? 25 : 31;
	const itemMin = Math.max(ITEM_MIN, least);
	const flat = Math.max(itemMin, Math.min(tier, room / (longest * EM)));
	const wrapped = Math.max(itemMin, Math.min(tier, room / (longestHalf * EM)));
	// A still is cut to what is drawn: it may be as tall as its lists need.
	const wrappedFits = levels.still || listsAt(visual, wrapped, room, column).bottom + wrapped * 0.5 + 12 <= 680;
	const itemSize = wrapped > flat * 1.1 && wrappedFits ? wrapped : flat;
	// Each kind's examples as lines, with the baseline of each line.
	const {lists, bottom} = listsAt(visual, itemSize, room, column, levels.itemTop, levels.still);
	const worldHeight = anyItems ? (levels.still ? bottom + itemSize * 0.5 + 12 : Math.min(680, bottom + itemSize * 0.5 + 12)) : levels.still ? Math.max(H, levels.nodeY + levels.kindHeight + 40) : H;
	return {columns, worldWidth, worldHeight, column, itemSize, anyItems, lists, levels};
};

/** The widest a column grows when the tree widens to fill a landscape box. */
const COLUMN_MAX = 420;

/**
 * The tree's layout. Given its box's width over height (`aspect`), a tree narrower than its box widens its world
 * (40 at a time, columns up to 420 wide) until it fills the box: examples stop wrapping and get the larger size, and
 * the tree is drawn larger instead of sitting small in the middle of a landscape card (29 Oct 2026: a four-column
 * tree of Ottoman land types was unreadable). Without `aspect` it keeps its own shape.
 */
export const treeLayout = (visual: Tree, aspect?: number, floorShare = 0) => {
	const columns = columnCount(visual);
	// In an app still the smallest text is a share of the world's width (the world is fitted to the still's width).
	const at = (worldWidth: number) => layoutAt(visual, worldWidth, floorShare * worldWidth);
	const base = at(Math.max(W, columns * 230));
	if (!aspect || base.worldWidth / base.worldHeight >= aspect) return base;
	const widest = Math.max(base.worldWidth, columns * COLUMN_MAX + MARGIN * 2);
	let layout = base;
	for (let worldWidth = base.worldWidth + 40; worldWidth <= widest; worldWidth += 40) {
		layout = at(worldWidth);
		if (layout.worldWidth / layout.worldHeight >= aspect) break;
	}
	return layout;
};

/**
 * The tree's width over height in a box of the given width over height, for CourseVisual's box; `floorShare` is an
 * app still's smallest text over the box's width.
 */
export const treeRatio = (visual: Tree, aspect?: number, floorShare = 0) => {
	const {worldWidth, worldHeight} = treeLayout(visual, aspect, floorShare);
	return worldWidth / worldHeight;
};

/** A rounded box with its label's lines centred; filled with the lesson colour while its part is pointed at. */
const Box: React.FC<{x: number; y: number; width: number; height: number; lines: readonly string[]; size: number; level: 0 | 1 | 2; focused: number}> = ({x, y, width, height, lines, size, level, focused}) => {
	const palette = useVisualPalette();
	const solid = level === 0 || focused > 0.5;
	const fill = solid ? palette.lesson : palette.surface;
	const ink = solid ? palette.onLesson : palette.ink;
	const line = size * 1.08;
	const top = y + height / 2 - ((lines.length - 1) * line) / 2 + size * 0.35;
	return (
		<g>
			<rect x={x} y={y} width={width} height={height} rx={14} fill={fill} stroke={palette.lesson} strokeWidth={level === 2 ? 2.5 : 4} />
			{lines.map((text, index) => (
				<text key={index} x={x + width / 2} y={top + index * line} textAnchor="middle" fontSize={size} fontWeight={800} fill={ink} fontFamily={palette.fontBody}>
					{text}
				</text>
			))}
		</g>
	);
};

/**
 * A classification tree, as textbooks draw it: the root on top, its branches below, each branch's kinds below that
 * and under each kind a short list of examples. Leaves get equal columns, so a branch with more kinds is wider.
 * Levels come in one after another. Parts: root, b1… (a branch), b1-1… (a kind), lit in the lesson colour.
 */
export const TreeVisual: React.FC<VisualBoxProps & {visual: Tree}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const rootLook = usePartLook('root', easeFrom(seconds, delaySeconds, 0.5));
	// Hooks are called for every possible part (4 branches, 3 kinds each) so their order never changes.
	const branchLooks = [1, 2, 3, 4].map((b) => usePartLook(`b${b}`, easeFrom(seconds, delaySeconds + 0.4 + b * 0.25, 0.5)));
	const nodeLooks = [1, 2, 3, 4].map((b) => [1, 2, 3].map((n) => usePartLook(`b${b}-${n}`, easeFrom(seconds, delaySeconds + 1.2 + b * 0.25 + n * 0.15, 0.5))));

	const floor = useStillTextFloor();
	const {worldWidth, worldHeight, column, itemSize, anyItems, lists, levels} = treeLayout(visual, width / Math.max(1, height), floor ? floor / width : 0);
	const margin = MARGIN;
	// Without example lists the three levels spread over the whole height; with them the lists get the lower part.
	// Few columns leave wide columns: the kinds grow with them, so a three-column tree reads as well as a table.
	const {still, rootY, branchY, nodeY, rootWidth, rootSize, rootHeight, branchSize, branchHeight, kindSize, kindHeight} = levels;
	const linesOf = (label: string, size: number, boxWidth: number) => labelLines(label, size, boxWidth, still);

	let cursor = margin;
	const placed = visual.branches.map((branch) => {
		const span = Math.max(1, branch.nodes.length) * column;
		const left = cursor;
		cursor += span;
		return {branch, left, span, centre: left + span / 2};
	});
	const elbow = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} V${(y1 + y2) / 2} H${x2} V${y2}`;

	return (
		<World width={width} height={height} viewWidth={worldWidth} viewHeight={worldHeight}>
			<g opacity={rootLook.opacity}>
				<Box x={worldWidth / 2 - rootWidth / 2} y={rootY} width={rootWidth} height={rootHeight} lines={linesOf(visual.root, rootSize, rootWidth)} size={rootSize} level={0} focused={rootLook.focused} />
			</g>
			{placed.map(({branch, left, span, centre}, b) => {
				const look = branchLooks[b];
				const branchWidth = Math.min(span - 16, 360);
				return (
					<g key={branch.label}>
						<path d={elbow(worldWidth / 2, rootY + rootHeight, centre, branchY)} fill="none" stroke={palette.lesson} strokeWidth={3} opacity={look.opacity} />
						<g opacity={look.opacity}>
							<Box x={centre - branchWidth / 2} y={branchY} width={branchWidth} height={branchHeight} lines={linesOf(branch.label, branchSize, branchWidth)} size={branchSize} level={1} focused={look.focused} />
						</g>
						{branch.nodes.map((node, n) => {
							const nodeLook = nodeLooks[b][n];
							const nodeCentre = left + column * (n + 0.5);
							const nodeWidth = column - 14;
							return (
								<g key={node.label} opacity={nodeLook.opacity * (look.opacity > 0 ? 1 : 0)}>
									<path d={elbow(centre, branchY + branchHeight, nodeCentre, nodeY)} fill="none" stroke={palette.lesson} strokeWidth={2.5} />
									<Box x={nodeCentre - nodeWidth / 2} y={nodeY} width={nodeWidth} height={kindHeight} lines={linesOf(node.label, kindSize, nodeWidth)} size={kindSize} level={2} focused={nodeLook.focused} />
									{anyItems
										? lists[b][n].map(({item, lines, baselines}, i) => (
												<text
													key={item}
													textAnchor="middle"
													fontSize={itemSize}
													fontWeight={600}
													fill={nodeLook.focused > 0.5 ? palette.lesson : palette.ink}
													fontFamily={palette.fontBody}
													opacity={easeFrom(seconds, delaySeconds + 1.6 + b * 0.25 + n * 0.15 + i * 0.08, 0.4)}
												>
													{lines.map((text, index) => (
														<tspan key={index} x={nodeCentre} y={baselines[index]}>
															{text}
														</tspan>
													))}
												</text>
											))
										: null}
								</g>
							);
						})}
					</g>
				);
			})}
		</World>
	);
};
