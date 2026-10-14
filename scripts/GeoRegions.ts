/**
 * Turkey's seven geographical regions with their natural borders, for
 * scripts/FetchGeo.ts.
 *
 * The regions of the 1941 Geography Congress follow landforms and climate,
 * so their borders cross provinces. No open dataset draws them (OpenStreetMap
 * and Wikidata have no shapes for them), so they are taken from the regional
 * location maps on Wikimedia Commons by The Emirr (CC BY 3.0), which draw the
 * natural borders. Those maps are drawn, not projected from coordinates, so
 * they are georeferenced here: Turkey's outline in the drawing is matched to
 * Natural Earth's outline (iterative closest points, a scale and an offset per
 * axis, equirectangular or Mercator, whichever fits better), the region
 * shapes are carried over with that fit, and then cut to Natural Earth's
 * coast and borders, so only the inner borders come from the drawing. How far
 * the drawing's outline stays from Natural Earth's after the fit is reported:
 * it is the uncertainty of the inner borders too.
 */
import polygonClipping, {type MultiPolygon as ClipMultiPolygon, type Pair, type Polygon as ClipPolygon} from 'polygon-clipping';

export const REGION_CREDIT = 'Bölge sınırları: The Emirr / Wikimedia Commons, CC BY 3.0';

/** Region names and the Commons file that highlights each. */
export const REGION_MAPS = [
	{name: 'Marmara Bölgesi', file: 'Latrans-Turkey location Marmara Region.svg'},
	{name: 'Ege Bölgesi', file: 'Latrans-Turkey location Aegean Region.svg'},
	{name: 'Akdeniz Bölgesi', file: 'Latrans-Turkey location Mediterranean Region.svg'},
	{name: 'İç Anadolu Bölgesi', file: 'Latrans-Turkey location Central Anatolia Region.svg'},
	{name: 'Karadeniz Bölgesi', file: 'Latrans-Turkey location Black Sea Region.svg'},
	{name: 'Doğu Anadolu Bölgesi', file: 'Latrans-Turkey location Eastern Anatolia Region.svg'},
	{name: 'Güneydoğu Anadolu Bölgesi', file: 'Latrans-Turkey location Southeastern Anatolia Region.svg'},
] as const;

/** The highlighted region's fill in those maps. */
const REGION_FILL = /#bf0c1d/i;

type Ring = Pair[];

// ---------------------------------------------------------------- SVG

/** Points of an SVG path, curves flattened; one ring per subpath. */
export const pathRings = (d: string): Ring[] => {
	const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? [];
	const rings: Ring[] = [];
	let ring: Ring = [];
	let [x, y, startX, startY] = [0, 0, 0, 0];
	let [lastControlX, lastControlY] = [0, 0];
	let command = '';
	let index = 0;
	const number = () => Number(tokens[index++]);
	const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
		for (let step = 1; step <= 6; step++) {
			const t = step / 6;
			const u = 1 - t;
			ring.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
		}
		[lastControlX, lastControlY, x, y] = [x2, y2, x3, y3];
	};
	while (index < tokens.length) {
		if (/[a-zA-Z]/.test(tokens[index])) command = tokens[index++];
		const relative = command === command.toLowerCase();
		const [ox, oy] = relative ? [x, y] : [0, 0];
		switch (command.toUpperCase()) {
			case 'M': {
				if (ring.length > 2) rings.push(ring);
				[x, y] = [ox + number(), oy + number()];
				[startX, startY] = [x, y];
				ring = [[x, y]];
				command = relative ? 'l' : 'L';
				break;
			}
			case 'L':
				[x, y] = [ox + number(), oy + number()];
				ring.push([x, y]);
				break;
			case 'H':
				x = (relative ? x : 0) + number();
				ring.push([x, y]);
				break;
			case 'V':
				y = (relative ? y : 0) + number();
				ring.push([x, y]);
				break;
			case 'C': {
				const [x1, y1, x2, y2, x3, y3] = [ox + number(), oy + number(), ox + number(), oy + number(), ox + number(), oy + number()];
				cubic(x1, y1, x2, y2, x3, y3);
				break;
			}
			case 'S': {
				const [x1, y1] = [2 * x - lastControlX, 2 * y - lastControlY];
				const [x2, y2, x3, y3] = [ox + number(), oy + number(), ox + number(), oy + number()];
				cubic(x1, y1, x2, y2, x3, y3);
				break;
			}
			case 'Q': {
				const [qx, qy, x3, y3] = [ox + number(), oy + number(), ox + number(), oy + number()];
				cubic(x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), x3 + (2 / 3) * (qx - x3), y3 + (2 / 3) * (qy - y3), x3, y3);
				break;
			}
			case 'Z':
				if (ring.length > 2) rings.push(ring);
				ring = [];
				[x, y] = [startX, startY];
				break;
			default:
				throw new Error(`SVG path command "${command}" is not handled.`);
		}
	}
	if (ring.length > 2) rings.push(ring);
	return rings;
};

/**
 * Douglas-Peucker: drops points closer than `tolerance` to the line between their neighbours.
 * The drawings carry tens of thousands of points per region; a tenth of a pixel is far below the drawing's own accuracy.
 */
const simplify = (ring: Ring, tolerance: number): Ring => {
	if (ring.length < 4) return ring;
	const keep = new Uint8Array(ring.length);
	keep[0] = keep[ring.length - 1] = 1;
	const stack: [number, number][] = [[0, ring.length - 1]];
	while (stack.length) {
		const [first, last] = stack.pop()!;
		const [ax, ay] = ring[first];
		const [bx, by] = ring[last];
		const length = Math.hypot(bx - ax, by - ay) || 1e-12;
		let [worst, at] = [0, -1];
		for (let i = first + 1; i < last; i++) {
			const distance = Math.abs((bx - ax) * (ay - ring[i][1]) - (ax - ring[i][0]) * (by - ay)) / length;
			if (distance > worst) [worst, at] = [distance, i];
		}
		if (worst > tolerance) {
			keep[at] = 1;
			stack.push([first, at], [at, last]);
		}
	}
	return ring.filter((_, i) => keep[i]);
};

const ringArea = (ring: Ring) => {
	let area = 0;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
	return Math.abs(area / 2);
};

/** The highlighted region of one map, as rings in the drawing's coordinates (simplified; specks dropped). */
export const regionRings = (svg: string): Ring[] => highlightedRings(svg).map((ring) => simplifyRing(ring, 0.15)).filter((ring) => ring.length > 3 && ringArea(ring) > 4);

/** A closed ring starts and ends at the same point, so it is cut at its farthest point and each half simplified. */
const simplifyRing = (ring: Ring, tolerance: number): Ring => {
	let far = 0;
	ring.forEach((point, index) => {
		if (Math.hypot(point[0] - ring[0][0], point[1] - ring[0][1]) > Math.hypot(ring[far][0] - ring[0][0], ring[far][1] - ring[0][1])) far = index;
	});
	return [...simplify(ring.slice(0, far + 1), tolerance), ...simplify([...ring.slice(far), ring[0]], tolerance).slice(1, -1)];
};

const highlightedRings = (svg: string): Ring[] => {
	const elements = svg.match(/<(path|polygon)\b[^>]*>/g) ?? [];
	const highlighted = elements.filter((element) => REGION_FILL.test(element));
	if (highlighted.length === 0) throw new Error('No highlighted region in the map.');
	return highlighted.flatMap((element) => {
		const d = element.match(/\sd="([^"]+)"/)?.[1];
		if (d) return pathRings(d);
		const points = element.match(/\spoints="([^"]+)"/)?.[1];
		if (!points) return [];
		const values = points.trim().split(/[\s,]+/).map(Number);
		return [Array.from({length: values.length / 2}, (_, i) => [values[2 * i], values[2 * i + 1]] as Pair)];
	});
};

// ---------------------------------------------------------------- fit

type Fit = {a: number; b: number; c: number; d: number; mercator: boolean};
const latitudeAxis = (lat: number, mercator: boolean) => (mercator ? Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * (180 / Math.PI) : lat);
const latitudeFrom = (value: number, mercator: boolean) => (mercator ? (360 / Math.PI) * Math.atan(Math.exp((value * Math.PI) / 180)) - 90 : value);
/** Drawing → longitude, latitude. */
const toLonLat = (fit: Fit, [x, y]: Pair): Pair => [(x - fit.b) / fit.a, latitudeFrom((fit.d - y) / fit.c, fit.mercator)];
const toDrawing = (fit: Fit, [lon, lat]: Pair): Pair => [fit.a * lon + fit.b, fit.d - fit.c * latitudeAxis(lat, fit.mercator)];
const kilometres = ([lon1, lat1]: Pair, [lon2, lat2]: Pair) => Math.hypot((lon1 - lon2) * 111.32 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180), (lat1 - lat2) * 110.57);

/** Points along rings every `step` units, so a long straight edge is matched along its length. */
const densify = (rings: Ring[], step: number): Pair[] =>
	rings.flatMap((ring) =>
		ring.flatMap((point, index) => {
			const next = ring[(index + 1) % ring.length];
			const pieces = Math.max(1, Math.ceil(Math.hypot(next[0] - point[0], next[1] - point[1]) / step));
			return Array.from({length: pieces}, (_, piece) => [point[0] + ((next[0] - point[0]) * piece) / pieces, point[1] + ((next[1] - point[1]) * piece) / pieces] as Pair);
		}),
	);

/** Nearest-point lookup on a grid. */
const nearestFinder = (points: Pair[], cell: number) => {
	const grid = new Map<string, Pair[]>();
	for (const point of points) {
		const key = `${Math.floor(point[0] / cell)},${Math.floor(point[1] / cell)}`;
		grid.set(key, [...(grid.get(key) ?? []), point]);
	}
	return (target: Pair): Pair => {
		const [cx, cy] = [Math.floor(target[0] / cell), Math.floor(target[1] / cell)];
		for (let radius = 1; radius < 60; radius++) {
			let best: Pair | null = null;
			let bestDistance = Infinity;
			for (let gx = cx - radius; gx <= cx + radius; gx++) {
				for (let gy = cy - radius; gy <= cy + radius; gy++) {
					for (const point of grid.get(`${gx},${gy}`) ?? []) {
						const distance = Math.hypot(point[0] - target[0], point[1] - target[1]);
						if (distance < bestDistance) [best, bestDistance] = [point, distance];
					}
				}
			}
			if (best && bestDistance <= radius * cell) return best;
		}
		return points[0];
	};
};

/** Least squares for value ≈ scale * input + offset. */
const line = (inputs: number[], values: number[]) => {
	const n = inputs.length;
	const [mx, my] = [inputs.reduce((s, v) => s + v, 0) / n, values.reduce((s, v) => s + v, 0) / n];
	let [sxy, sxx] = [0, 0];
	inputs.forEach((input, i) => {
		sxy += (input - mx) * (values[i] - my);
		sxx += (input - mx) ** 2;
	});
	const scale = sxy / sxx;
	return {scale, offset: my - scale * mx};
};

/** Fits the drawing's outline to the real one; returns the fit and its error along the outline, in km. */
export const georeference = (drawingOutline: Ring[], realOutline: Ring[]) => {
	const real = densify(realOutline, 0.02);
	const drawn = densify(drawingOutline, 0.5);
	const nearest = nearestFinder(drawn, 4);
	const box = (points: Pair[]) =>
		points.reduce(([w, s, e, n], [x, y]) => [Math.min(w, x), Math.min(s, y), Math.max(e, x), Math.max(n, y)], [Infinity, Infinity, -Infinity, -Infinity]);
	const [rw, rs, re, rn] = box(real);
	const [dw, dt, de, db] = box(drawn);
	const attempts = [false, true].map((mercator) => {
		// Start from the bounding boxes, then refine on matched outline points.
		const [ys, yn] = [latitudeAxis(rs, mercator), latitudeAxis(rn, mercator)];
		let fit: Fit = {a: (de - dw) / (re - rw), b: dw - ((de - dw) / (re - rw)) * rw, c: (db - dt) / (yn - ys), d: dt + ((db - dt) / (yn - ys)) * yn, mercator};
		for (let round = 0; round < 40; round++) {
			const pairs = real.filter((_, i) => i % 3 === 0).map((point) => ({point, match: nearest(toDrawing(fit, point))}));
			const x = line(pairs.map((p) => p.point[0]), pairs.map((p) => p.match[0]));
			const y = line(pairs.map((p) => latitudeAxis(p.point[1], mercator)), pairs.map((p) => p.match[1]));
			fit = {a: x.scale, b: x.offset, c: -y.scale, d: y.offset, mercator};
		}
		const errors = real.map((point) => kilometres(point, toLonLat(fit, nearest(toDrawing(fit, point))))).sort((p, q) => p - q);
		return {fit, medianKm: errors[Math.floor(errors.length / 2)], p90Km: errors[Math.floor(errors.length * 0.9)], rmsKm: Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length)};
	});
	return attempts.sort((p, q) => p.rmsKm - q.rmsKm)[0];
};

// ---------------------------------------------------------------- regions

const centroid = (polygon: ClipPolygon): Pair => {
	const ring = polygon[0];
	let [area, cx, cy] = [0, 0, 0];
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
		area += cross;
		cx += (ring[j][0] + ring[i][0]) * cross;
		cy += (ring[j][1] + ring[i][1]) * cross;
	}
	return area === 0 ? ring[0] : [cx / (3 * area), cy / (3 * area)];
};

const nearestDistance = (point: Pair, shape: ClipMultiPolygon) => {
	let best = Infinity;
	for (const polygon of shape) for (const ring of polygon) for (const vertex of ring) best = Math.min(best, kilometres(point, vertex));
	return best;
};

/**
 * The regions in longitude and latitude, cut to the real country so they tile it exactly:
 * an overlap goes to the region listed first, a gap to the nearest region.
 */
export const buildRegions = (maps: {name: string; svg: string}[], country: ClipMultiPolygon) => {
	const drawn = maps.map((map) => ({name: map.name, rings: regionRings(map.svg)}));
	const allRegions: ClipMultiPolygon[] = drawn.map((region) => region.rings.map((ring) => [ring] as ClipPolygon));
	const outline = polygonClipping.union(allRegions[0], ...allRegions.slice(1));
	const fitted = georeference(outline.flatMap((polygon) => polygon), country.flatMap((polygon) => polygon));
	const taken: ClipMultiPolygon[] = [];
	const regions = drawn.map((region) => {
		const pieces: ClipMultiPolygon = region.rings.map((ring) => [ring.map((point) => toLonLat(fitted.fit, point))] as ClipPolygon);
		const shape = polygonClipping.union(pieces);
		let inside = polygonClipping.intersection(shape, country);
		if (taken.length) inside = polygonClipping.difference(inside, ...taken);
		taken.push(inside);
		return {name: region.name, shape: inside};
	});
	// Land the drawing left out (coast and border details) goes to the nearest region.
	const gaps = polygonClipping.difference(country, ...regions.map((region) => region.shape));
	for (const gap of gaps) {
		const centre = centroid(gap);
		const owner = regions.reduce((best, region) => (nearestDistance(centre, region.shape) < nearestDistance(centre, best.shape) ? region : best));
		owner.shape = polygonClipping.union(owner.shape, [gap]);
	}
	return {regions, fit: fitted};
};
