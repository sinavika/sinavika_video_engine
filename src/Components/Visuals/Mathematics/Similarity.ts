/**
 * Similar shapes, corner by corner: whether two shapes are similar, the motion that lays one on the other, and the
 * shape partway through that motion. The geometry figure uses it for a copied shape (`copyOf`): one triangle slides,
 * turns and grows onto a congruent or similar one, as a textbook lays one on the other.
 */
type Point = [number, number];

/**
 * The centre of a shape's area (not of its corners: in a long thin quadrilateral the two differ), where its label
 * stands. A degenerate shape falls back to the average of its corners.
 */
export const areaCentre = (points: readonly Point[]): Point => {
	let area = 0;
	let x = 0;
	let y = 0;
	points.forEach(([x1, y1], index) => {
		const [x2, y2] = points[(index + 1) % points.length];
		const cross = x1 * y2 - x2 * y1;
		area += cross;
		x += (x1 + x2) * cross;
		y += (y1 + y2) * cross;
	});
	return Math.abs(area) < 1e-9 ? centroid(points) : [x / (3 * area), y / (3 * area)];
};

const centroid = (points: readonly Point[]): Point => [points.reduce((sum, [x]) => sum + x, 0) / points.length, points.reduce((sum, [, y]) => sum + y, 0) / points.length];

/** Whether every distance between two corners of `b` is the same multiple of the matching distance in `a`. */
export const shapesSimilar = (a: readonly Point[], b: readonly Point[], tolerance = 0.01): boolean => {
	if (a.length !== b.length || a.length < 2) return false;
	let ratio: number | undefined;
	for (let i = 0; i < a.length; i++)
		for (let j = i + 1; j < a.length; j++) {
			const one = Math.hypot(a[j][0] - a[i][0], a[j][1] - a[i][1]);
			const two = Math.hypot(b[j][0] - b[i][0], b[j][1] - b[i][1]);
			if (one === 0 || two === 0) return false;
			ratio ??= two / one;
			if (Math.abs(two / one - ratio) > tolerance * ratio) return false;
		}
	return true;
};

/**
 * The similarity that takes `source` onto `target` without turning it over: target = centre + scale · rotate(angle) ·
 * (source − its centre), fitted by least squares (complex numbers). Undefined when the shapes match only as mirror
 * images (a flip), so the motion falls back to moving each corner straight.
 */
const directSimilarity = (source: readonly Point[], target: readonly Point[]): {scale: number; angle: number} | undefined => {
	const [sx, sy] = centroid(source);
	const [tx, ty] = centroid(target);
	let re = 0;
	let im = 0;
	let norm = 0;
	source.forEach(([x, y], index) => {
		const [u, v] = [x - sx, y - sy];
		const [p, q] = [target[index][0] - tx, target[index][1] - ty];
		// (p + qi)(u − vi)
		re += p * u + q * v;
		im += q * u - p * v;
		norm += u * u + v * v;
	});
	if (norm === 0) return undefined;
	const [a, b] = [re / norm, im / norm];
	const size = Math.max(...target.map(([x, y]) => Math.hypot(x - tx, y - ty)), 1e-9);
	const fits = source.every(([x, y], index) => {
		const [u, v] = [x - sx, y - sy];
		return Math.hypot(tx + a * u - b * v - target[index][0], ty + a * v + b * u - target[index][1]) < size * 0.01;
	});
	return fits ? {scale: Math.hypot(a, b), angle: Math.atan2(b, a)} : undefined;
};

/**
 * The shape partway (`t` 0→1) from `source` to `target`. Without a flip it stays similar all the way: its centre slides
 * straight, it turns the short way and grows steadily (a congruent copy only slides and turns). A flip has no such
 * path in the plane; each corner then moves straight to its place, and the shape narrows and widens like a card
 * turned over.
 */
export const blendShape = (source: readonly Point[], target: readonly Point[], t: number): Point[] => {
	const motion = directSimilarity(source, target);
	if (!motion) return source.map(([x, y], index) => [x + (target[index][0] - x) * t, y + (target[index][1] - y) * t]);
	const [sx, sy] = centroid(source);
	const [tx, ty] = centroid(target);
	const [cx, cy] = [sx + (tx - sx) * t, sy + (ty - sy) * t];
	const scale = motion.scale ** t;
	const angle = motion.angle * t;
	const [cos, sin] = [Math.cos(angle) * scale, Math.sin(angle) * scale];
	return source.map(([x, y]) => [cx + cos * (x - sx) - sin * (y - sy), cy + sin * (x - sx) + cos * (y - sy)]);
};
