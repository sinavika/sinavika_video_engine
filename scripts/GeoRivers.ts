/**
 * Turkey's rivers for scripts/FetchGeo.ts, traced on HydroRIVERS.
 *
 * HydroRIVERS (Lehner & Grill 2013, www.hydrosheds.org; free for commercial
 * and non-commercial use with credit) is a network of river reaches derived
 * from elevation data, each with the reach it flows into and its upstream
 * area, but without names. A river is found on it from its source and mouth
 * as Wikidata records them (coordinates copied below, with the item):
 *
 *   source and mouth known   follow the flow from the source; it must pass within 3 km of the mouth
 *   one point known          from it, upstream along the main stem (at each fork the branch with the
 *                            larger upstream area, skipping branches already named), and downstream
 *                            while it is the main inflow (it stops where it joins a larger river)
 *
 * Rivers with both ends are traced first, so a point-traced river does not
 * climb into a tributary that has a name of its own (Yeşilırmak into Kelkit).
 * What does not check out is reported and left out, never guessed.
 */
import {unzipSync} from 'fflate';
import * as shapefile from 'shapefile';

export const RIVER_CREDIT = 'Akarsular: HydroRIVERS (Lehner & Grill 2013, hydrosheds.org)';
export const HYDRORIVERS_URL = 'https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_eu_shp.zip';

type Point = [number, number];
type Spec = {name: string; wikidata: string; source?: Point; mouth?: Point; point?: Point; from?: Point; naturalEarth?: string; note?: string};

/** Turkish rivers of the curriculum. Coordinates: Wikidata (P625 with "applies to part": source / mouth), 2026-10-15. */
export const RIVERS: Spec[] = [
	{name: 'Kızılırmak', wikidata: 'Q257785', source: [38.407, 39.853], mouth: [35.956, 41.734]},
	{name: 'Sakarya', wikidata: 'Q217466', source: [31.059, 39.353], mouth: [30.649, 41.127]},
	{name: 'Kelkit Çayı', wikidata: 'Q3045328', source: [39.479, 40.132], mouth: [36.51, 40.766]},
	{name: 'Karasu', wikidata: 'Q1728989', source: [41.491, 40.216], mouth: [40.257, 39.729], note: 'Fırat’ın kuzey kolu'},
	{name: 'Murat', wikidata: 'Q913193', source: [43.314, 39.382], mouth: [38.794, 38.875]},
	{name: 'Dicle', wikidata: 'Q35591', source: [39.506, 38.503]},
	{name: 'Aras', wikidata: 'Q179751', source: [41.328, 39.338]},
	{name: 'Kura', wikidata: 'Q156557', source: [42.82, 40.834]},
	{name: 'Çoruh', wikidata: 'Q70970', source: [41.0, 40.307], mouth: [41.573, 41.603]},
	{name: 'Meriç', wikidata: 'Q204347', source: [23.596, 42.165], mouth: [26.031, 40.738]},
	{name: 'Ergene', wikidata: 'Q396585', source: [27.913, 41.497], mouth: [26.36, 41.026]},
	{name: 'Gediz', wikidata: 'Q1351474', source: [29.391, 38.963], mouth: [26.816, 38.588]},
	{name: 'Büyük Menderes', wikidata: 'Q211089', source: [29.828, 38.215], mouth: [27.169, 37.54]},
	{name: 'Seyhan', wikidata: 'Q910975', source: [35.585, 37.606], mouth: [34.908, 36.725]},
	{name: 'Ceyhan', wikidata: 'Q1057961', source: [37.214, 38.186], mouth: [35.56, 36.565]},
	{name: 'Asi', wikidata: 'Q188871', source: [36.352, 34.197], mouth: [35.964, 36.045]},
	{name: 'Susurluk', wikidata: 'Q3181444', source: [28.851, 39.164], mouth: [28.511, 40.394], note: 'yukarı çığırı Simav Çayı'},
	{name: 'Mustafakemalpaşa Çayı', wikidata: 'Q2148345', source: [28.535, 39.944], mouth: [28.398, 40.213]},
	{name: 'Bakırçay', wikidata: 'Q1436746', source: [27.903, 39.262], mouth: [26.966, 38.933]},
	{name: 'Biga Çayı', wikidata: 'Q1268444', source: [26.995, 39.83], mouth: [27.318, 40.377]},
	{name: 'Gönen Çayı', wikidata: 'Q252710', source: [27.029, 39.808], mouth: [27.634, 40.326]},
	{name: 'Tohma Çayı', wikidata: 'Q3530391', source: [36.876, 38.791], mouth: [38.223, 38.505]},
	{name: 'Munzur Çayı', wikidata: 'Q3327955', source: [39.055, 39.331], mouth: [39.56, 38.956]},
	{name: 'Botan Çayı', wikidata: 'Q894622', source: [43.56, 38.09], mouth: [41.779, 37.73]},
	{name: 'Arpaçay', wikidata: 'Q1996981', source: [43.653, 41.068], mouth: [43.648, 40.131]},
	{name: 'Melet Irmağı', wikidata: 'Q19296191', source: [38.098, 40.416], mouth: [37.933, 40.985]},
	{name: 'Harşit Çayı', wikidata: 'Q12809886', source: [39.692, 40.387], mouth: [38.844, 41.01]},
	{name: 'Gökırmak', wikidata: 'Q4896971', source: [33.282, 41.41], mouth: [35.119, 41.408]},
	{name: 'Berdan Çayı', wikidata: 'Q3515829', source: [34.49, 37.189], mouth: [34.895, 36.751]},
	{name: 'Delice Irmağı', wikidata: 'Q3021654', source: [34.75, 39.501]},
	// One point only.
	{name: 'Yeşilırmak', wikidata: 'Q1145293', mouth: [36.66, 41.382]},
	{name: 'Göksu', wikidata: 'Q732201', mouth: [34.047, 36.297]},
	{name: 'Küçük Menderes', wikidata: 'Q922382', mouth: [27.263, 37.958]},
	{name: 'Filyos Çayı', wikidata: 'Q3572165', point: [32.087, 41.425]},
	{name: 'Zap Suyu', wikidata: 'Q756018', mouth: [43.344, 35.991]},
	{name: 'Manavgat Çayı', wikidata: 'Q153675', mouth: [31.494, 36.737]},
	{name: 'Köprüçay', wikidata: 'Q385473', mouth: [31.173, 36.83]},
	{name: 'Aksu Çayı', wikidata: 'Q421630', mouth: [30.92, 36.854]},
	{name: 'Dalaman Çayı', wikidata: 'Q18676664', point: [28.726, 36.708]},
	{name: 'Eşen Çayı', wikidata: 'Q1547533', mouth: [29.262, 36.293]},
	{name: 'Bartın Çayı', wikidata: 'Q2886191', point: [32.236, 41.679]},
	{name: 'Devrekâni Çayı', wikidata: 'Q19278150', mouth: [32.937, 41.881]},
	{name: 'Porsuk Çayı', wikidata: 'Q2720896', point: [31.983, 39.7]},
	{name: 'Ankara Çayı', wikidata: 'Q2850284', point: [31.887, 39.841]},
	{name: 'Çekerek Irmağı', wikidata: 'Q4896922', point: [35.755, 40.562]},
	{name: 'Peri Çayı', wikidata: 'Q3375358', point: [39.781, 38.86]},
	{name: 'Batman Çayı', wikidata: 'Q2004311', point: [41.017, 37.783]},
	{name: 'Habur Çayı', wikidata: 'Q607977', point: [42.353, 37.101]},
	{name: 'Nilüfer Çayı', wikidata: 'Q2413236', point: [28.457, 40.299]},
	// A canalised river of the closed Konya basin, too weak in the elevation-derived network: Natural Earth's line.
	{name: 'Çarşamba Çayı', wikidata: 'Q3577255', naturalEarth: 'Carsamba'},
	// Fırat is drawn from where Karasu and Murat meet; its two branches are the rivers above.
	{name: 'Fırat', wikidata: 'Q34589', from: [38.79, 38.87], note: 'Karasu ile Murat’ın birleştiği yerden'},
];

/** Where the lines are kept: Turkey and its neighbours' border reaches. */
const KEEP = [25.0, 34.0, 46.0, 43.0] as const;

type Reach = {id: number; next: number; upland: number; line: Point[]};

const kilometres = ([lon1, lat1]: Point, [lon2, lat2]: Point) => Math.hypot((lon1 - lon2) * 111.32 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180), (lat1 - lat2) * 110.57);

/** The reaches around Turkey from the HydroRIVERS zip. */
export const readReaches = async (zip: Uint8Array): Promise<Reach[]> => {
	const files = unzipSync(zip, {filter: (file) => /\.(shp|dbf)$/.test(file.name)});
	const shp = Object.entries(files).find(([name]) => name.endsWith('.shp'))![1];
	const dbf = Object.entries(files).find(([name]) => name.endsWith('.dbf'))![1];
	const source = await shapefile.open(shp.buffer as ArrayBuffer, dbf.buffer as ArrayBuffer);
	const reaches: Reach[] = [];
	for (;;) {
		const result = await source.read();
		if (result.done) break;
		const geometry = result.value.geometry as {type: string; coordinates: Point[]};
		const line = geometry.coordinates;
		if (!line.some(([lon, lat]) => lon >= KEEP[0] - 3 && lon <= KEEP[2] + 3 && lat >= KEEP[1] - 3 && lat <= KEEP[3] + 1)) continue;
		const props = result.value.properties as {HYRIV_ID: number; NEXT_DOWN: number; UPLAND_SKM: number};
		reaches.push({id: props.HYRIV_ID, next: props.NEXT_DOWN, upland: props.UPLAND_SKM, line});
	}
	return reaches;
};

/** Douglas-Peucker on a line (degrees). */
const simplify = (line: Point[], tolerance: number): Point[] => {
	if (line.length < 3) return line;
	const keep = new Uint8Array(line.length);
	keep[0] = keep[line.length - 1] = 1;
	const stack: [number, number][] = [[0, line.length - 1]];
	while (stack.length) {
		const [first, last] = stack.pop()!;
		const [[ax, ay], [bx, by]] = [line[first], line[last]];
		const length = Math.hypot(bx - ax, by - ay) || 1e-12;
		let [worst, at] = [0, -1];
		for (let i = first + 1; i < last; i++) {
			const d = Math.abs((bx - ax) * (ay - line[i][1]) - (ax - line[i][0]) * (by - ay)) / length;
			if (d > worst) [worst, at] = [d, i];
		}
		if (worst > tolerance) {
			keep[at] = 1;
			stack.push([first, at], [at, last]);
		}
	}
	return line.filter((_, i) => keep[i]);
};

/** The parts of a line inside KEEP. */
const keepInside = (line: Point[]): Point[][] => {
	const parts: Point[][] = [];
	let part: Point[] = [];
	for (const point of line) {
		const inside = point[0] >= KEEP[0] && point[0] <= KEEP[2] && point[1] >= KEEP[1] && point[1] <= KEEP[3];
		if (inside) part.push(point);
		else if (part.length) {
			parts.push(part);
			part = [];
		}
	}
	if (part.length > 1) parts.push(part);
	return parts.filter((p) => p.length > 1);
};

export const traceRivers = (reaches: Reach[]) => {
	const byId = new Map(reaches.map((reach) => [reach.id, reach]));
	const inflows = new Map<number, Reach[]>();
	for (const reach of reaches) inflows.set(reach.next, [...(inflows.get(reach.next) ?? []), reach]);
	const owned = new Set<number>();
	const distanceTo = (reach: Reach, point: Point) => Math.min(...reach.line.map((vertex) => kilometres(vertex, point)));
	/** Reaches near a point, nearest first; reaches of rivers already traced are not candidates. */
	const candidates = (point: Point, minimumUpland: number, withinKm: number) =>
		reaches
			.filter((reach) => reach.upland >= minimumUpland && !owned.has(reach.id) && Math.abs(reach.line[0][0] - point[0]) < 0.6 && Math.abs(reach.line[0][1] - point[1]) < 0.6)
			.map((reach) => ({reach, distance: distanceTo(reach, point)}))
			.filter((candidate) => candidate.distance <= withinKm)
			.sort((a, b) => a.distance - b.distance)
			.map((candidate) => candidate.reach);
	/** Near a river's end the nearest reach can be a side stream: among those within 1 km of the nearest, the largest. */
	const snap = (point: Point, minimumUpland: number, withinKm: number) => {
		const near = candidates(point, minimumUpland, withinKm);
		if (!near.length) return null;
		const closest = distanceTo(near[0], point);
		return near.filter((reach) => distanceTo(reach, point) <= closest + 1).sort((a, b) => b.upland - a.upland)[0];
	};
	/** Is this reach the largest inflow of the reach it flows into? */
	const isMainInflow = (reach: Reach) => (inflows.get(reach.next) ?? []).every((other) => other.upland <= reach.upland);
	const downstream = (start: Reach, until?: Point) => {
		const path = [start];
		let current = start;
		while (current.next && byId.has(current.next)) {
			if (until && distanceTo(current, until) < 3) return {path, reached: true};
			if (!until && !isMainInflow(current)) break;
			current = byId.get(current.next)!;
			path.push(current);
		}
		return {path, reached: until ? distanceTo(current, until) < 3 : true};
	};
	const upstream = (start: Reach) => {
		const path: Reach[] = [];
		let current: Reach | undefined = start;
		while (current) {
			path.unshift(current);
			const branches: Reach[] = (inflows.get(current.id) ?? []).filter((branch) => !owned.has(branch.id));
			current = branches.sort((a, b) => b.upland - a.upland)[0];
		}
		return path;
	};

	const traced: {name: string; wikidata: string; lines: Point[][]; km: number; method: string}[] = [];
	const problems: string[] = [];
	const ordered = RIVERS.filter((spec) => !spec.naturalEarth).sort((a, b) => Number(!(a.source && a.mouth)) - Number(!(b.source && b.mouth)));
	for (const spec of ordered) {
		let path: Reach[] = [];
		let method = '';
		if (spec.source) {
			// A source sits on a watershed: the nearest stream may drain the other way, so the nearby streams are
			// tried in turn and the first that reaches the mouth is the river.
			const tries = candidates(spec.source, 0, 8).slice(0, 25);
			const found = tries.map((start) => downstream(start, spec.mouth)).find((result) => result.reached);
			if (!found) {
				problems.push(`${spec.name}: kaynağın 8 km çevresindeki ${tries.length} dereden hiçbiri ağza (3 km) varmadı`);
				continue;
			}
			[path, method] = [found.path, spec.mouth ? 'kaynak → ağız' : 'kaynak → (denize / ana ırmağa)'];
		} else if (spec.from) {
			const start = snap(spec.from, 5000, 8);
			if (!start) {
				problems.push(`${spec.name}: başlangıç noktası bulunamadı`);
				continue;
			}
			[path, method] = [downstream(start).path, 'birleşimden aşağı'];
		} else {
			// At a river's end the river is the largest stream around; coastal creeks beside it are smaller.
			const at = spec.mouth ?? spec.point!;
			const start = candidates(at, 30, 4).sort((a, b) => b.upland - a.upland)[0] ?? snap(at, 30, 8);
			if (!start) {
				problems.push(`${spec.name}: noktanın 8 km yakınında adı konmamış bir akarsu yok`);
				continue;
			}
			const up = upstream(start);
			const down = spec.mouth ? [] : downstream(start).path.slice(1);
			[path, method] = [[...up, ...down], spec.mouth ? 'ağızdan ana kol boyunca yukarı' : 'noktadan yukarı ve aşağı'];
		}
		path.forEach((reach) => owned.add(reach.id));
		const line = path.flatMap((reach, index) => (index === 0 ? reach.line : reach.line.slice(1)));
		const km = line.reduce((sum, point, index) => (index ? sum + kilometres(line[index - 1], point) : 0), 0);
		traced.push({name: spec.name, wikidata: spec.wikidata, lines: keepInside(simplify(line, 0.004)), km: Math.round(km), method});
	}
	return {traced, problems};
};
