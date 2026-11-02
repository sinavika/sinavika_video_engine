import {describe, expect, it} from 'vitest';
import {SHADE_CONTRAST, drawsNeighbours, insideLabelSpot, lakeBox, lakeRing, mainlandOf, pinMargin, pointAlong, polygonCentroid, ridgePeaks, routeCurve, shadeAreaReveal, spreadRadius} from '../../../../src/Components/Visuals/Humanities/Map';
import {ROUTE_TRAVELLERS, SHADE_COLORS, degreeLabel, mapPartNames} from '../../../../src/Components/Visuals/Humanities/HumanitiesSchema';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';
import {LessonScriptSchema} from '../../../../src/Courses/LessonScript';
import {LESSON_SCRIPT_SAMPLE} from '../../../../src/Courses/LessonScriptSample';

describe('map routes', () => {
	it('draws a route as a smooth curve through every one of its points', () => {
		const points = [[0, 0], [100, 50], [200, 0], [300, 60]] as const;
		const curve = routeCurve(points, 10);
		// The curve passes through each point: every tenth sample is one of them, and it ends on the last.
		points.forEach((at, index) => {
			expect(curve[index * 10][0]).toBeCloseTo(at[0], 9);
			expect(curve[index * 10][1]).toBeCloseTo(at[1], 9);
		});
		// Two points close together between far ones (İstanbul, İznik): the curve does not loop out past them.
		const crusade = routeCurve([[0, 0], [300, 0], [310, 12], [600, 20]], 20);
		expect(Math.max(...crusade.map(([x]) => x))).toBeLessThanOrEqual(600.001);
		expect(Math.min(...crusade.map(([, y]) => y))).toBeGreaterThan(-10);
		expect(Math.max(...crusade.map(([, y]) => y))).toBeLessThan(26);
		expect(curve).toHaveLength(31);
		// A two-point route stays a straight line.
		expect(routeCurve([[0, 0], [10, 10]])).toEqual([[0, 0], [10, 10]]);
	});

	it('finds the point a share of the way along a line, by length', () => {
		const line = [[0, 0], [30, 0], [30, 10]] as const;
		expect(pointAlong(line, 0)).toEqual([0, 0]);
		expect(pointAlong(line, 0.5)).toEqual([20, 0]);
		expect(pointAlong(line, 0.875)).toEqual([30, 5]);
		expect(pointAlong(line, 1)).toEqual([30, 10]);
		expect(pointAlong(line, 2)).toEqual([30, 10]);
	});

	it('frames a country on its mainland and nearby islands, not its overseas territories', () => {
		const square = (lon: number, lat: number, size: number) => [[[lon, lat], [lon + size, lat], [lon + size, lat + size], [lon, lat + size], [lon, lat]]];
		const france = {type: 'Feature', properties: {name: 'Fransa'}, geometry: {type: 'MultiPolygon', coordinates: [square(-1, 44, 7), square(8.6, 41.5, 1), square(-53, 3, 2)]}} as const;
		const framed = mainlandOf(france as unknown as Parameters<typeof mainlandOf>[0]);
		if (framed.geometry.type !== 'MultiPolygon') throw new Error('expected a MultiPolygon');
		// The mainland and Corsica stay; French Guiana goes.
		expect(framed.geometry.coordinates).toHaveLength(2);
		expect(framed.geometry.coordinates.flat(2).every(([lon]) => lon > -10)).toBe(true);
		// A country of one piece is left as it is.
		const hungary = {type: 'Feature', properties: {name: 'Macaristan'}, geometry: {type: 'Polygon', coordinates: square(16, 46, 6)}} as const;
		expect(mainlandOf(hungary as unknown as Parameters<typeof mainlandOf>[0])).toBe(hungary);
	});

	it('spreads a territory from its capital until it covers the farthest corner, its name in its middle', () => {
		const square = [[0, 0], [100, 0], [100, 100], [0, 100]] as const;
		expect(polygonCentroid(square)).toEqual([50, 50]);
		// An L-shaped land: its middle leans towards the larger arm.
		const [lx, ly] = polygonCentroid([[0, 0], [300, 0], [300, 100], [100, 100], [100, 300], [0, 300]]);
		expect(lx).toBeLessThan(150);
		expect(ly).toBeLessThan(150);
		// From a capital in the corner the circle must reach the opposite corner.
		expect(spreadRadius([0, 0], square)).toBeCloseTo(Math.SQRT2 * 100, 9);
		const map = CourseVisualSchema.safeParse({kind: 'map', territories: [{name: 'Büyük Selçuklu', points: [[30, 37], [60, 42], [52, 28]], from: [51.7, 32.7]}]});
		expect(map.success).toBe(true);
		expect(CourseVisualSchema.safeParse({kind: 'map', territories: [{name: 'Kısa', points: [[30, 37], [60, 42]]}]}).success).toBe(false);
	});

	it('spreads a shaded class from its first area outwards', () => {
		// At the start only the first area shows; halfway the near areas are in and the far ones still coming.
		expect(shadeAreaReveal(0.1, 0, 100)).toBeGreaterThan(0);
		expect(shadeAreaReveal(0.1, 100, 100)).toBe(0);
		expect(shadeAreaReveal(0.5, 20, 100)).toBe(1);
		expect(shadeAreaReveal(0.5, 100, 100)).toBe(0);
		// At the end every area is in.
		for (const distance of [0, 40, 100]) expect(shadeAreaReveal(1, distance, 100)).toBe(1);
	});

	it('keeps room past every marker and route point, so nothing the lesson names sits on the edge', () => {
		const around = pinMargin([[44.5, 48.7]], 50);
		// 6% of a 50° frame: three degrees on each side, the point itself kept.
		expect(around).toContainEqual([44.5, 48.7]);
		expect(Math.max(...around.map(([, lat]) => lat))).toBeCloseTo(51.7, 9);
		expect(Math.min(...around.map(([lon]) => lon))).toBeCloseTo(41.5, 9);
		// A small frame still gets a little room; the poles are never passed.
		expect(Math.max(...pinMargin([[30, 40]], 1).map(([lon]) => lon))).toBeCloseTo(30.3, 9);
		expect(Math.max(...pinMargin([[0, 88]], 100).map(([, lat]) => lat))).toBe(89);
	});

	it('sends sail ships along a voyage and dots along any other route', () => {
		const map = CourseVisualSchema.parse({kind: 'map', routes: [{points: [[-9, 38], [18, -34]], label: 'Dias', traveller: 'ship'}, {points: [[30, 40], [40, 40]]}]});
		if (map.kind !== 'map') throw new Error('map');
		expect(map.routes.map((route) => route.traveller)).toEqual(['ship', 'dot']);
		expect(CourseVisualSchema.safeParse({kind: 'map', routes: [{points: [[0, 0], [1, 1]], traveller: 'horse'}]}).success).toBe(false);
	});

	it('sends a camel caravan along the Silk Road, lorries along a road and trains along a railway', () => {
		const map = CourseVisualSchema.parse({
			kind: 'map',
			routes: [
				{points: [[108.9, 34.3], [29.06, 40.18]], label: 'İpek Yolu', traveller: 'caravan'},
				{points: [[40.5, 41.0], [29.0, 41.0]], label: 'Fındık', traveller: 'truck'},
				{points: [[32.85, 39.93], [29.0, 41.0]], label: 'YHT', traveller: 'train'},
			],
		});
		if (map.kind !== 'map') throw new Error('map');
		expect(map.routes.map((route) => route.traveller)).toEqual(['caravan', 'truck', 'train']);
		expect([...ROUTE_TRAVELLERS]).toEqual(['dot', 'ship', 'caravan', 'truck', 'train']);
	});
});


describe('mountain chains', () => {
	it('lines peaks up along the chain, evenly, first to last, the same in every frame', () => {
		const curve: [number, number][] = [[0, 100], [200, 100], [400, 100]];
		const peaks = ridgePeaks(curve, 24);
		expect(peaks.length).toBeGreaterThan(15);
		expect(peaks[0].x).toBeCloseTo(0, 5);
		expect(peaks.at(-1)!.x).toBeCloseTo(400, 5);
		expect(peaks[0].share).toBe(0);
		expect(peaks.at(-1)!.share).toBe(1);
		// Even steps along the chain, small sideways steps, sizes near one.
		for (let index = 1; index < peaks.length; index++) expect(peaks[index].x - peaks[index - 1].x).toBeCloseTo(400 / (peaks.length - 1), 5);
		peaks.forEach((peak) => {
			expect(Math.abs(peak.y - 100)).toBeLessThanOrEqual(24 * 0.18 + 1e-9);
			expect(peak.size).toBeGreaterThanOrEqual(0.85);
			expect(peak.size).toBeLessThanOrEqual(1.15);
		});
		expect(ridgePeaks(curve, 24)).toEqual(peaks);
	});

	it('accepts named chains on a map and refuses a chain of one point', () => {
		const map = (ridges: unknown) => CourseVisualSchema.safeParse({kind: 'map', base: 'provinces', ridges});
		expect(map([{name: 'Toroslar', points: [[30, 37], [34, 37.2], [38, 38]]}]).success).toBe(true);
		expect(map([{name: 'Toroslar', points: [[30, 37]]}]).success).toBe(false);
	});
});

describe('map parts a beat may name', () => {
	const map = CourseVisualSchema.parse({
		kind: 'map',
		base: 'provinces',
		highlights: [{name: 'Libya', label: 'Trablusgarp'}],
		markers: [{at: [35.9, 41.55], label: 'Bafra'}],
		routes: [{points: [[29, 41], [32, 39]], label: 'Göç yolu'}, {points: [[30, 40], [31, 39]]}],
		ridges: [{name: 'Toroslar', points: [[30, 37], [34, 37]]}],
		shades: [{label: 'Enine kıyı', names: ['İzmir']}],
		lines: ['equator'],
		parallels: [36, 42.5],
		meridians: [-26],
		overlays: [{layer: 'rivers', names: ['Kızılırmak', 'Sakarya']}, {layer: 'lakes', names: ['Van Gölü']}],
	});

	it('lists every named thing on the map by the name its part has', () => {
		const names = mapPartNames(map as Parameters<typeof mapPartNames>[0]);
		expect(names).toEqual(['Libya', 'Bafra', 'Göç yolu', 'r2', 'Toroslar', 'Enine kıyı', 'equator', '36° K', "42°30' K", '26° B', 'Kızılırmak', 'Sakarya', 'Van Gölü']);
		// A highlight is a part by its area's name; its label is only what is written on it.
		expect(names).not.toContain('Trablusgarp');
	});

	it('writes parallels and meridians as their labels say', () => {
		expect(degreeLabel(0, 'K', 'G')).toBe('0°');
		expect(degreeLabel(-23.45, 'K', 'G')).toBe("23°27' G");
		expect(degreeLabel(44.8, 'D', 'B')).toBe("44°48' D");
	});

	it('cannot list the names when an overlay draws a whole layer, so it does not check them', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'map', overlays: [{layer: 'rivers'}]}))).toBeNull();
	});

	it('refuses a beat that points at a name the map does not have (the highlight label, a typo)', () => {
		const withBeat = (focus: string) => ({
			...LESSON_SCRIPT_SAMPLE,
			lesson: {...LESSON_SCRIPT_SAMPLE.lesson, sections: [...LESSON_SCRIPT_SAMPLE.lesson.sections, {...LESSON_SCRIPT_SAMPLE.lesson.sections[0], cards: [{kind: 'visual', title: 'Harita', visual: map, narration: 'Haritaya bakalım.', beats: [{narration: 'İşte burası.', focus: [focus]}]}]}]},
		});
		expect(LessonScriptSchema.safeParse(withBeat('Libya')).success).toBe(true);
		expect(LessonScriptSchema.safeParse(withBeat('Kızılırmak')).success).toBe(true);
		const wrong = LessonScriptSchema.safeParse(withBeat('Trablusgarp'));
		expect(wrong.success).toBe(false);
		expect(wrong.error?.issues[0].message).toMatch(/No part Trablusgarp on this map/);
		expect(LessonScriptSchema.safeParse(withBeat('Kizilirmak')).success).toBe(false);
	});
});

describe('a lake a beat points at', () => {
	it('is ringed round its middle, never by less than the least ring, so a small lake can be found', () => {
		// A lake two pixels wide still gets a ring the size of the least one.
		expect(lakeRing([100, 100], [102, 101], 16)).toEqual({cx: 101, cy: 100.5, r: 16});
		// A large lake (Van) gets a ring outside its own box.
		const van = lakeRing([700, 300], [760, 340], 16);
		expect(van.r).toBeGreaterThan(Math.hypot(60, 40) / 2);
		expect([van.cx, van.cy]).toEqual([730, 320]);
	});

	it('keeps its own box, padded, free of names', () => {
		expect(lakeBox([[700, 300], [760, 340]], 4)).toEqual({left: 696, right: 764, top: 296, bottom: 344});
	});
});

describe('natural class colours', () => {
	it('lets a class take a colour that says something, and refuses one outside the set', () => {
		const soil = CourseVisualSchema.parse({kind: 'map', base: 'provinces', shades: [{label: 'Terra rossa', names: ['Antalya'], color: 'red'}, {label: 'Çernozyem', names: ['Kars'], color: 'black'}]});
		expect(soil.kind === 'map' && soil.shades.map((shade) => shade.color)).toEqual(['red', 'black']);
		expect(CourseVisualSchema.safeParse({kind: 'map', shades: [{label: 'X', names: ['Kars'], color: 'pink'}]}).success).toBe(false);
	});

	it('keeps the colours muted enough to carry dark names, and apart from one another', () => {
		const luminance = (hex: string) => {
			const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const values = Object.values(SHADE_COLORS);
		expect(new Set(values).size).toBe(values.length);
		// None is so light that the map's white land swallows it.
		values.forEach((hex) => expect(luminance(hex)).toBeLessThan(0.6));
	});

	it('never paints land in a water blue, so a province never looks like a lake or a sea', async () => {
		const {MAP_COLORS, MAP_COLORS_DARK} = await import('../../../../src/Configurations/GeoData');
		const hueOf = (hex: string) => {
			const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			const saturation = max === 0 ? 0 : (max - min) / max;
			if (max === min) return {hue: 0, saturation};
			const hue = max === r ? ((g - b) / (max - min)) % 6 : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
			return {hue: (hue * 60 + 360) % 360, saturation};
		};
		const waters = [MAP_COLORS.water, MAP_COLORS.waterFill, MAP_COLORS_DARK.water].map((hex) => hueOf(hex).hue);
		const landColours = [...Object.values(SHADE_COLORS), ...SHADE_CONTRAST];
		for (const hex of landColours) {
			const {hue, saturation} = hueOf(hex);
			// A grey has a hue but shows none.
			if (saturation < 0.15) continue;
			for (const water of waters) expect(Math.min(Math.abs(hue - water), 360 - Math.abs(hue - water)), `${hex} is too close to water`).toBeGreaterThan(40);
		}
		expect(CourseVisualSchema.safeParse({kind: 'map', shades: [{label: 'Kış koridoru', color: 'blue', names: ['Erzurum']}]}).success).toBe(false);
		// A lesson whose kit draws maps shades its classes in its own colour: that colour is never a water blue either.
		const {COURSE_LESSON_COLORS} = await import('../../../../src/Configurations/LessonColors');
		const {LESSON_VISUAL_KITS} = await import('../../../../src/Courses/CourseDesign');
		const mapLessons = Object.entries(LESSON_VISUAL_KITS).filter(([, kit]) => kit.includes('map')).map(([lesson]) => lesson);
		expect(mapLessons.length).toBeGreaterThan(0);
		for (const lesson of mapLessons) {
			const colour = (COURSE_LESSON_COLORS as Record<string, string>)[lesson];
			if (!colour) continue;
			const {hue, saturation} = hueOf(colour);
			if (saturation < 0.15) continue;
			for (const water of waters) expect(Math.min(Math.abs(hue - water), 360 - Math.abs(hue - water)), `${lesson} ${colour} is too close to water`).toBeGreaterThan(40);
		}
	});
});

describe('land around Turkey', () => {
	it('draws the neighbouring countries under every map of Turkey’s own areas, so their land never takes the sea’s colour', () => {
		for (const base of ['country', 'regions', 'provinceRegions', 'provinces', 'districts'] as const) expect(drawsNeighbours(base)).toBe(true);
		// A world map draws them already; a data file of the lesson's own is left as it is.
		expect(drawsNeighbours('countries')).toBe(false);
		expect(drawsNeighbours({src: 'Geo/Turkey.json', object: 'provinces'})).toBe(false);
	});

	it('gives the neighbours a land colour apart from both Turkey and the sea, in both themes', async () => {
		const {MAP_COLORS, MAP_COLORS_DARK} = await import('../../../../src/Configurations/GeoData');
		for (const colours of [MAP_COLORS, MAP_COLORS_DARK]) {
			expect(colours.neighbour).not.toBe(colours.land);
			expect(colours.neighbour).not.toBe(colours.waterFill);
		}
	});

	it('keeps land and sea apart on a dark figure (the app’s dark theme)', async () => {
		const {MAP_COLORS_DARK} = await import('../../../../src/Configurations/GeoData');
		const {contrastRatio} = await import('../../../../src/Themes/ColorPalette');
		// They ran together at 1.1 : 1 in the dark history maps (Soru revizyonu, 2 Nov 2026).
		expect(contrastRatio(MAP_COLORS_DARK.land, MAP_COLORS_DARK.waterFill)).toBeGreaterThan(1.7);
		expect(contrastRatio(MAP_COLORS_DARK.neighbour, MAP_COLORS_DARK.waterFill)).toBeGreaterThan(1.4);
		// Rivers stay seen on land.
		expect(contrastRatio(MAP_COLORS_DARK.water, MAP_COLORS_DARK.land)).toBeGreaterThan(2);
	});
});

describe('an area’s name', () => {
	const inside = ([x, y]: readonly [number, number], rings: readonly (readonly (readonly [number, number])[])[]) => {
		let result = false;
		for (const ring of rings)
			for (let i = 0, j = ring.length - 1; i < ring.length; j = i++)
				if (ring[i][1] > y !== ring[j][1] > y && x < ((ring[j][0] - ring[i][0]) * (y - ring[i][1])) / (ring[j][1] - ring[i][1]) + ring[i][0]) result = !result;
		return result;
	};

	it('goes inside an area that wraps round a sea, never on the water (the Marmara region)', () => {
		// A C shape round a bay: its middle by area lies in the bay.
		const marmara = [[[0, 0], [300, 0], [300, 60], [80, 60], [80, 140], [300, 140], [300, 200], [0, 200]]] as const;
		const spot = insideLabelSpot(marmara);
		expect(spot).toBeDefined();
		expect(inside(spot!, marmara)).toBe(true);
		// Not squeezed against an edge: the thick back of the C carries it.
		expect(spot![0]).toBeLessThan(80);
	});

	it('goes near the middle of a plain area and stays out of a hole', () => {
		const square = [[[0, 0], [200, 0], [200, 200], [0, 200]]] as const;
		const middle = insideLabelSpot(square)!;
		expect(Math.hypot(middle[0] - 100, middle[1] - 100)).toBeLessThan(15);
		const ring = [[[0, 0], [200, 0], [200, 200], [0, 200]], [[60, 60], [140, 60], [140, 140], [60, 140]]] as const;
		expect(inside(insideLabelSpot(ring)!, ring)).toBe(true);
	});

	it('stays on the map when the area runs off it', () => {
		const wide = [[[-500, 0], [500, 0], [500, 100], [-500, 100]]] as const;
		const spot = insideLabelSpot(wide, {left: 0, top: 0, right: 300, bottom: 300})!;
		expect(spot[0]).toBeGreaterThanOrEqual(0);
		expect(spot[0]).toBeLessThanOrEqual(300);
	});
});
