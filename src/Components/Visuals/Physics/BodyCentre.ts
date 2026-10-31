type Point = readonly [number, number];

/** A body of a centre-of-mass figure: a point mass, a uniform rod, or a uniform plate (a cut-out when `removed`). */
type MassBody =
	| {kind: 'point'; at: Point; mass: number}
	| {kind: 'rod'; from: Point; to: Point; mass: number}
	| {kind: 'plate'; corners: readonly Point[]; mass?: number; removed?: boolean};

/** A polygon's area and centroid (the shoelace formula); corners in either order. */
export const polygonCentre = (corners: readonly Point[]): {area: number; at: [number, number]} => {
	let twice = 0;
	let cx = 0;
	let cy = 0;
	corners.forEach(([x0, y0], index) => {
		const [x1, y1] = corners[(index + 1) % corners.length];
		const cross = x0 * y1 - x1 * y0;
		twice += cross;
		cx += (x0 + x1) * cross;
		cy += (y0 + y1) * cross;
	});
	if (twice === 0) return {area: 0, at: [corners[0][0], corners[0][1]]};
	return {area: Math.abs(twice) / 2, at: [cx / (3 * twice), cy / (3 * twice)]};
};

/**
 * A body's own centre and its mass in the sum: a rod's middle, a plate's centroid. A plate without a mass weighs its
 * area (all plates one density); a removed plate counts with negative mass.
 */
export const bodyCentre = (body: MassBody): {at: [number, number]; mass: number} => {
	switch (body.kind) {
		case 'point':
			return {at: [body.at[0], body.at[1]], mass: body.mass};
		case 'rod':
			return {at: [(body.from[0] + body.to[0]) / 2, (body.from[1] + body.to[1]) / 2], mass: body.mass};
		case 'plate': {
			const {area, at} = polygonCentre(body.corners);
			return {at, mass: (body.removed ? -1 : 1) * (body.mass ?? area)};
		}
	}
};

/**
 * The system's centre after each body is counted: x = Σ m·x / Σ m (and y alike). The last entry is the whole
 * system's; the steps show the centre pulled towards each body as it joins (away from a removed piece). `mass` is the
 * total so far, which must stay positive.
 */
export const systemCentres = (bodies: readonly MassBody[]): {at: [number, number]; mass: number}[] => {
	let mass = 0;
	let mx = 0;
	let my = 0;
	return bodies.map((body) => {
		const centre = bodyCentre(body);
		mass += centre.mass;
		mx += centre.mass * centre.at[0];
		my += centre.mass * centre.at[1];
		return {at: [mass === 0 ? 0 : mx / mass, mass === 0 ? 0 : my / mass], mass};
	});
};
