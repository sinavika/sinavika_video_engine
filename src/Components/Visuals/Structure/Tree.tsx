import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
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

/** An example on one line, or on two split at the space nearest its middle when it does not fit the column. */
const wrapItem = (item: string, size: number, room: number): string[] => (item.length * size * EM <= room ? [item] : halves(item));

/** Where each example's lines stand when examples are `size` tall, and how low the longest list reaches. */
const listsAt = (visual: Tree, size: number, room: number, column: number) => {
	const line = size * 1.18;
	const gap = size * (column < 250 ? 0.85 : 0.9);
	const lists = visual.branches.map((branch) =>
		branch.nodes.map((node) => {
			let y = ITEM_TOP;
			return node.items.map((item) => {
				const lines = wrapItem(item, size, room);
				const baselines = lines.map((_, index) => y + index * line);
				y += lines.length * line + gap;
				return {item, lines, baselines};
			});
		}),
	);
	const bottom = Math.max(ITEM_TOP, ...lists.flat(2).map((entry) => entry.baselines[entry.baselines.length - 1]));
	return {lists, bottom};
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
const layoutAt = (visual: Tree, worldWidth: number) => {
	const columns = columnCount(visual);
	const column = (worldWidth - MARGIN * 2) / columns;
	const room = column - 16;
	const items = visual.branches.flatMap((branch) => branch.nodes.flatMap((node) => node.items));
	const longest = Math.max(1, ...items.map((item) => item.length));
	const longestHalf = Math.max(1, ...items.flatMap((item) => halves(item).map((part) => part.length)));
	const tier = column < 170 ? 22 : column < 250 ? 25 : 31;
	const flat = Math.max(ITEM_MIN, Math.min(tier, room / (longest * EM)));
	const wrapped = Math.max(ITEM_MIN, Math.min(tier, room / (longestHalf * EM)));
	const wrappedFits = listsAt(visual, wrapped, room, column).bottom + wrapped * 0.5 + 12 <= 680;
	const itemSize = wrapped > flat * 1.1 && wrappedFits ? wrapped : flat;
	// Each kind's examples as lines, with the baseline of each line.
	const {lists, bottom} = listsAt(visual, itemSize, room, column);
	const anyItems = items.length > 0;
	const worldHeight = anyItems ? Math.min(680, bottom + itemSize * 0.5 + 12) : H;
	return {columns, worldWidth, worldHeight, column, itemSize, anyItems, lists};
};

/** The widest a column grows when the tree widens to fill a landscape box. */
const COLUMN_MAX = 420;

/**
 * The tree's layout. Given its box's width over height (`aspect`), a tree narrower than its box widens its world
 * (40 at a time, columns up to 420 wide) until it fills the box: examples stop wrapping and get the larger size, and
 * the tree is drawn larger instead of sitting small in the middle of a landscape card (29 Oct 2026: a four-column
 * tree of Ottoman land types was unreadable). Without `aspect` it keeps its own shape.
 */
export const treeLayout = (visual: Tree, aspect?: number) => {
	const columns = columnCount(visual);
	const base = layoutAt(visual, Math.max(W, columns * 230));
	if (!aspect || base.worldWidth / base.worldHeight >= aspect) return base;
	const widest = Math.max(base.worldWidth, columns * COLUMN_MAX + MARGIN * 2);
	let layout = base;
	for (let worldWidth = base.worldWidth + 40; worldWidth <= widest; worldWidth += 40) {
		layout = layoutAt(visual, worldWidth);
		if (layout.worldWidth / layout.worldHeight >= aspect) break;
	}
	return layout;
};

/** The tree's width over height in a box of the given width over height, for CourseVisual's box. */
export const treeRatio = (visual: Tree, aspect?: number) => {
	const {worldWidth, worldHeight} = treeLayout(visual, aspect);
	return worldWidth / worldHeight;
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

/** A rounded box with a centred label on one or two lines; filled with the lesson colour while its part is pointed at. */
const Box: React.FC<{x: number; y: number; width: number; height: number; label: string; size: number; level: 0 | 1 | 2; focused: number}> = ({x, y, width, height, label, size, level, focused}) => {
	const palette = useVisualPalette();
	const solid = level === 0 || focused > 0.5;
	const fill = solid ? palette.lesson : palette.surface;
	const ink = solid ? palette.onLesson : palette.ink;
	const lines = boxLines(label, size, width);
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

	const {worldWidth, worldHeight, column, itemSize, anyItems, lists} = treeLayout(visual, width / Math.max(1, height));
	const margin = MARGIN;
	// Without example lists the three levels spread over the whole height; with them the lists get the lower part.
	const rootY = 8;
	const branchY = anyItems ? 116 : 200;
	const nodeY = anyItems ? 232 : 400;
	// Few columns leave wide columns: the kinds grow with them, so a three-column tree reads as well as a table.
	const nodeSize = column < 170 ? 23 : column < 250 ? 27 : 31;
	const rootWidth = Math.min(440, visual.root.length * 22 + 90);

	let cursor = margin;
	const placed = visual.branches.map((branch) => {
		const span = Math.max(1, branch.nodes.length) * column;
		const left = cursor;
		cursor += span;
		return {branch, left, span, centre: left + span / 2};
	});
	const branchSize = levelSize(placed.map(({branch, span}) => ({label: branch.label, width: Math.min(span - 16, 360)})), 30);
	const kindSize = levelSize(visual.branches.flatMap((branch) => branch.nodes.map((node) => ({label: node.label, width: column - 14}))), nodeSize);
	const elbow = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} V${(y1 + y2) / 2} H${x2} V${y2}`;

	return (
		<World width={width} height={height} viewWidth={worldWidth} viewHeight={worldHeight}>
			<g opacity={rootLook.opacity}>
				<Box x={worldWidth / 2 - rootWidth / 2} y={rootY} width={rootWidth} height={64} label={visual.root} size={Math.min(34, (rootWidth - 18) / Math.max(1, visual.root.length * BOX_EM))} level={0} focused={rootLook.focused} />
			</g>
			{placed.map(({branch, left, span, centre}, b) => {
				const look = branchLooks[b];
				const branchWidth = Math.min(span - 16, 360);
				return (
					<g key={branch.label}>
						<path d={elbow(worldWidth / 2, rootY + 64, centre, branchY)} fill="none" stroke={palette.lesson} strokeWidth={3} opacity={look.opacity} />
						<g opacity={look.opacity}>
							<Box x={centre - branchWidth / 2} y={branchY} width={branchWidth} height={60} label={branch.label} size={branchSize} level={1} focused={look.focused} />
						</g>
						{branch.nodes.map((node, n) => {
							const nodeLook = nodeLooks[b][n];
							const nodeCentre = left + column * (n + 0.5);
							const nodeWidth = column - 14;
							return (
								<g key={node.label} opacity={nodeLook.opacity * (look.opacity > 0 ? 1 : 0)}>
									<path d={elbow(centre, branchY + 60, nodeCentre, nodeY)} fill="none" stroke={palette.lesson} strokeWidth={2.5} />
									<Box x={nodeCentre - nodeWidth / 2} y={nodeY} width={nodeWidth} height={58} label={node.label} size={kindSize} level={2} focused={nodeLook.focused} />
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
