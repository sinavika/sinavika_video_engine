import {describe, expect, it} from 'vitest';
import {CourseVisualSchema, numberedPartNames} from '../../../../src/Components/Visuals/VisualSchema';

describe('geography visuals', () => {
	it('draws the four spheres with the human environment and the water moving between them by default', () => {
		const visual = CourseVisualSchema.parse({kind: 'spheres'});
		expect(visual).toEqual({kind: 'spheres', human: true, interactions: true, labels: true});
	});

	it('lets a map draw the Equator, the tropics, the polar circles and the prime meridian', () => {
		const visual = CourseVisualSchema.parse({kind: 'map', lines: ['equator', 'tropics', 'polarCircles', 'primeMeridian']});
		expect(visual.kind === 'map' && visual.lines).toEqual(['equator', 'tropics', 'polarCircles', 'primeMeridian']);
		expect(CourseVisualSchema.safeParse({kind: 'map', lines: ['ekvator']}).success).toBe(false);
	});

	it('draws the Earth from the side by default and names the parts of each view', () => {
		const visual = CourseVisualSchema.parse({kind: 'earth'});
		expect(visual).toMatchObject({kind: 'earth', view: 'rays', date: 'mart', shadows: false, dayLengths: false, speed: true});
		expect(numberedPartNames(visual)).toContain('dikaci');
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'earth', view: 'orbit'}))).toEqual(['gunes', 'yorunge', 'eksen', 'mart', 'haziran', 'eylul', 'aralik', 'gunberi', 'gunote']);
		expect(CourseVisualSchema.safeParse({kind: 'earth', date: 'temmuz'}).success).toBe(false);
	});

	it('lets a map draw any parallels and meridians by degree, and the Earth show belts and a latitude angle', () => {
		const map = CourseVisualSchema.parse({kind: 'map', base: 'provinces', parallels: [36, 42], meridians: [26, 45]});
		expect(map.kind === 'map' && [map.parallels, map.meridians]).toEqual([
			[36, 42],
			[26, 45],
		]);
		expect(CourseVisualSchema.safeParse({kind: 'map', parallels: [95]}).success).toBe(false);
		const earth = CourseVisualSchema.parse({kind: 'earth', zones: true, latitude: 40});
		expect(earth).toMatchObject({zones: true, latitude: 40});
		expect(numberedPartNames(earth)).toEqual(expect.arrayContaining(['kusaklar', 'enlem']));
	});

	it('names a concept map branches n1, n2, … so beats can bring them in one by one', () => {
		const visual = CourseVisualSchema.parse({kind: 'conceptMap', center: 'Fiziki coğrafya', related: [{name: 'Jeomorfoloji'}, {name: 'Klimatoloji'}, {name: 'Hidrografya'}]});
		expect(numberedPartNames(visual)).toEqual(['n1', 'n2', 'n3']);
	});
});

describe('geography in speech', () => {
	it('reads degrees, minutes, compass sides and clock times as words', async () => {
		const {spokenScreenText} = await import('../../../../src/Courses/LessonSpeech');
		expect(spokenScreenText("Kuzey Kutup Dairesi 66°33' K enlemindedir.")).toBe('Kuzey Kutup Dairesi 66 derece 33 dakika kuzey enlemindedir.');
		expect(spokenScreenText('45° D meridyeninde saat 14.20 iken')).toBe('45 derece doğu meridyeninde saat on dört yirmi iken');
		expect(spokenScreenText('Saat 09.00, 08.05 ve 00.30')).toBe('Saat dokuz, sekiz sıfır beş ve sıfır otuz');
		expect(spokenScreenText('Ekvator 0°, deniz 25°C')).toBe('Ekvator 0 derece, deniz 25 derece');
		expect(spokenScreenText('Ekvator: 1.670 km/sa')).toBe('Ekvator: saatte 1.670 kilometre');
		expect(spokenScreenText('8 cm² göl 288 km² eder; 30 km yol, 1/500.000 ölçek')).toBe('8 santimetrekare göl 288 kilometrekare eder; 30 kilometre yol, 1 bölü 500.000 ölçek');
		expect(spokenScreenText('Mutlak nem 12 g/m³, yağış 300 mm, sıcaklık 25 °C')).toBe('Mutlak nem metreküpte 12 gram, yağış 300 milimetre, sıcaklık 25 derece');
		expect(spokenScreenText('Tuzluluk ‰38')).toBe('Tuzluluk binde 38');
	});

	it('works out day lengths and local clock times', async () => {
		const {dayLengthHours, clockText} = await import('../../../../src/Components/Visuals/Geography/Earth');
		expect(dayLengthHours(0, 23.45)).toBeCloseTo(12, 5);
		expect(dayLengthHours(40, 0)).toBeCloseTo(12, 5);
		expect(dayLengthHours(40, 23.45)).toBeGreaterThan(14.5);
		expect(dayLengthHours(-70, 23.45)).toBe(0);
		expect(clockText(12 + 60 / 15)).toBe('16.00');
		expect(clockText(8 + 1 / 3)).toBe('08.20');
		expect(clockText(-1)).toBe('23.00');
	});
});

describe('degrees in narration', () => {
	it('says a degree sign written in a narration', async () => {
		const {pronounceAbbreviations} = await import('../../../../src/Schemas/SpokenText');
		expect(pronounceAbbreviations("Eksen 23°27' eğik; Türkiye 45° D saatini kullanır.")).toBe('Eksen yirmi üç derece yirmi yedi dakika eğik; Türkiye kırk beş derece doğu saatini kullanır.');
	});
});

describe('contour map', () => {
	it('draws a landscape with sea on the west, a summit near 1250 m and no inland pits below sea level', async () => {
		const {terrainHeight} = await import('../../../../src/Components/Visuals/Geography/Contour');
		expect(terrainHeight(10, 180)).toBeLessThan(0);
		let summit = 0;
		for (let x = 0; x <= 1000; x += 5) for (let y = 0; y <= 360; y += 5) summit = Math.max(summit, terrainHeight(x, y));
		expect(summit).toBeGreaterThan(1200);
		expect(summit).toBeLessThan(1300);
		for (let y = 0; y <= 360; y += 10) expect(terrainHeight(400, y)).toBeGreaterThan(0);
		// The western face is steeper than the eastern slope.
		expect(terrainHeight(650, 170) - terrainHeight(550, 170)).toBeGreaterThan(terrainHeight(650, 170) - terrainHeight(750, 170));
	});

	it('names its parts and keeps the contour interval in range', () => {
		const visual = CourseVisualSchema.parse({kind: 'contour'});
		expect(visual).toEqual({kind: 'contour', interval: 200, tint: false, notes: true, profile: true});
		expect(numberedPartNames(visual)).toContain('profil');
		expect(CourseVisualSchema.safeParse({kind: 'contour', interval: 25}).success).toBe(false);
	});
});

describe('climate graph, winds and question figures', () => {
	it('takes twelve months of temperature and precipitation and names its parts', () => {
		const visual = CourseVisualSchema.parse({kind: 'climate', temperature: Array(12).fill(10), precipitation: Array(12).fill(50)});
		expect(visual).toMatchObject({kind: 'climate', summary: false});
		expect(numberedPartNames(visual)).toEqual(['yagis', 'sicaklik', 'sifir', 'kis', 'ilkbahar', 'yaz', 'sonbahar', 'ozet']);
		expect(CourseVisualSchema.safeParse({kind: 'climate', temperature: [1, 2], precipitation: Array(12).fill(0)}).success).toBe(false);
	});

	it('draws the pressure belts and prevailing winds as a view of the Earth', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'earth', view: 'winds'}))).toEqual(['basinc', 'alize', 'bati', 'kutup', 'cephe']);
	});

	it('lets a question carry the figure it is about', async () => {
		const {QuestionSchema} = await import('../../../../src/Courses/LessonScript');
		const question = QuestionSchema.parse({
			stem: 'Grafikteki il hangisidir?',
			figure: {kind: 'climate', temperature: Array(12).fill(5), precipitation: Array(12).fill(40)},
			options: ['Rize', 'Konya'],
			answer: 1,
			narration: 'Grafiğe bakalım.',
			steps: [{text: 'Yağış az: **Konya**.', narration: 'Yağış az, cevap Konya.'}],
		});
		expect(question.figure?.kind).toBe('climate');
	});
});

describe('earth history visuals', () => {
	it('names the layers of the interior, the parts of a plate boundary and the eras of the time column', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'interior'}))).toEqual(['kabuk', 'manto', 'astenosfer', 'discekirdek', 'iccekirdek', 'sialsima']);
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'plates', boundary: 'subduction'}))).toContain('magma');
		expect(CourseVisualSchema.safeParse({kind: 'plates', boundary: 'transform'}).success).toBe(false);
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'geotime', turkey: true}))).toEqual(['prekambriyen', 'paleozoyik', 'mezozoyik', 'senozoyik', 'tersiyer', 'kuvaterner']);
	});
});

describe('population pyramid', () => {
	it('draws up to four pyramids, each by a textbook shape or by data, and names its parts', async () => {
		const visual = CourseVisualSchema.parse({
			kind: 'pyramid',
			pyramids: [
				{label: 'K', shape: 'wide'},
				{label: 'L', shape: 'beehive'},
			],
		});
		expect(numberedPartNames(visual)).toEqual(['erkek', 'kadin', 'cocuk', 'calisma', 'yasli', 'p1', 'p2']);
		expect(CourseVisualSchema.safeParse({kind: 'pyramid', pyramids: [{label: 'K'}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'pyramid', pyramids: [{label: 'K', male: Array(16).fill(3), female: Array(16).fill(3)}]}).success).toBe(false);
		expect(CourseVisualSchema.safeParse({kind: 'pyramid', pyramids: Array(5).fill({label: 'K', shape: 'bell'})}).success).toBe(false);
		expect(CourseVisualSchema.parse({kind: 'pyramid', pyramids: [{label: 'K', shape: 'wide'}]})).toMatchObject({layout: 'row', shares: false});
	});

	it('gives each shape the age structure the textbook describes', async () => {
		const {pyramidSummary} = await import('../../../../src/Components/Visuals/Geography/Pyramid');
		const of = (shape: 'wide' | 'triangle' | 'asymmetric' | 'beehive' | 'bell') => pyramidSummary({label: 'x', shape});
		// Broad base, few elderly → many children; developed and ageing → few children, many elderly.
		expect(of('wide').cocuk).toBeGreaterThan(40);
		expect(of('wide').yasli).toBeLessThan(6);
		expect(of('triangle').cocuk).toBeGreaterThan(of('asymmetric').cocuk);
		expect(of('beehive').yasli).toBeGreaterThan(of('bell').yasli);
		expect(of('bell').cocuk).toBeGreaterThan(of('beehive').cocuk);
		for (const shape of ['wide', 'triangle', 'asymmetric', 'beehive', 'bell'] as const) {
			const summary = of(shape);
			expect(summary.cocuk + summary.calisma + summary.yasli).toBeGreaterThanOrEqual(99);
			expect(summary.erkek + summary.kadin).toBeCloseTo(100, 0);
		}
	});
});

describe('data maps and charts', () => {
	it('shades map areas by class and writes values on bars', () => {
		const map = CourseVisualSchema.parse({
			kind: 'map',
			base: 'provinces',
			shades: [
				{label: 'Yoğun', names: ['İstanbul']},
				{label: 'Seyrek', names: ['Tunceli']},
			],
		});
		expect(map.kind === 'map' && map.shades.map((shade) => shade.label)).toEqual(['Yoğun', 'Seyrek']);
		expect(CourseVisualSchema.parse({kind: 'map'})).toMatchObject({shades: []});
		expect(CourseVisualSchema.safeParse({kind: 'map', shades: Array(6).fill({label: 'x', names: ['Van']})}).success).toBe(false);
		const plot = CourseVisualSchema.parse({
			kind: 'plot',
			x: [0, 3],
			y: [0, 10],
			series: {
				kind: 'bars',
				values: [
					{x: 1, y: 3},
					{x: 2, y: 5},
				],
				showValues: true,
			},
		});
		expect(plot.kind === 'plot' && plot.series?.showValues).toBe(true);
		expect(
			CourseVisualSchema.parse({
				kind: 'plot',
				x: [0, 3],
				y: [0, 10],
				series: {
					kind: 'bars',
					values: [
						{x: 1, y: 3},
						{x: 2, y: 5},
					],
				},
			}),
		).toMatchObject({series: {showValues: false}});
	});
});

describe('stacked shares', () => {
	it('takes rows of equal series and names rows and series as parts', () => {
		const visual = CourseVisualSchema.parse({
			kind: 'stack',
			series: ['Tarım', 'Sanayi', 'Hizmet'],
			rows: [
				{label: 'Dünya', values: [26.5, 23.1, 50.4]},
				{label: 'Türkiye', values: [15.8, 27.7, 56.5]},
			],
		});
		expect(numberedPartNames(visual)).toEqual(['r1', 'r2', 's1', 's2', 's3']);
		expect(CourseVisualSchema.safeParse({kind: 'stack', series: ['Tarım', 'Sanayi'], rows: [{label: 'K', values: [1, 2, 3]}]}).success).toBe(false);
	});
});

describe('classification tree', () => {
	it('names the root, branches and kinds as parts', () => {
		const visual = CourseVisualSchema.parse({kind: 'tree', root: 'Bölge', branches: [{label: 'Şekilsel', nodes: [{label: 'Doğal', items: ['İklim']}, {label: 'Beşerî'}]}, {label: 'İşlevsel'}]});
		expect(numberedPartNames(visual)).toEqual(['root', 'b1', 'b1-1', 'b1-2', 'b2']);
		expect(CourseVisualSchema.safeParse({kind: 'tree', root: 'X', branches: [{label: 'A'}]}).success).toBe(false);
	});
});

describe('disaster visuals', () => {
	it('names the parts of the landslide scene and takes a quadrant of up to six items a quarter', () => {
		expect(numberedPartNames(CourseVisualSchema.parse({kind: 'landform', scene: 'landslide'}))).toEqual(['egim', 'tabaka', 'su', 'kayma', 'kutle', 'set']);
		const axes = {x: {label: 'Oluşum hızı', low: 'Yavaş', high: 'Hızlı'}, y: {label: 'Etki alanı', low: 'Dar', high: 'Geniş'}};
		const quadrant = CourseVisualSchema.parse({
			kind: 'quadrant',
			...axes,
			items: [
				{label: 'Deprem', x: 'high', y: 'high'},
				{label: 'Kuraklık', x: 'low', y: 'high'},
			],
		});
		expect(numberedPartNames(quadrant)).toEqual(['i1', 'i2', 'q1', 'q2', 'q3', 'q4']);
		const crowded = Array.from({length: 7}, (_, index) => ({label: `A${index}`, x: 'high', y: 'high'}));
		expect(CourseVisualSchema.safeParse({kind: 'quadrant', ...axes, items: crowded}).success).toBe(false);
	});
});

describe('wide trees', () => {
	it('widen their world with the number of kinds', async () => {
		const {treeLayout} = await import('../../../../src/Components/Visuals/Structure/Tree');
		const narrow = CourseVisualSchema.parse({kind: 'tree', root: 'A', branches: [{label: 'B'}, {label: 'C'}]});
		const wide = CourseVisualSchema.parse({
			kind: 'tree',
			root: 'A',
			branches: [
				{label: 'B', nodes: [{label: '1'}, {label: '2'}, {label: '3'}]},
				{label: 'C', nodes: [{label: '4'}, {label: '5'}, {label: '6'}]},
				{label: 'D', nodes: [{label: '7'}, {label: '8'}]},
			],
		});
		expect(narrow.kind === 'tree' && treeLayout(narrow).worldWidth).toBe(1000);
		expect(wide.kind === 'tree' && treeLayout(wide).worldWidth).toBe(8 * 230);
	});

	it('are as tall as their longest example list and wrap an example that does not fit', async () => {
		const {treeLayout} = await import('../../../../src/Components/Visuals/Structure/Tree');
		const short = CourseVisualSchema.parse({
			kind: 'tree',
			root: 'A',
			branches: [
				{label: 'B', nodes: [{label: 'b', items: ['x', 'y']}]},
				{label: 'C', nodes: [{label: 'c', items: ['z']}]},
			],
		});
		const long = CourseVisualSchema.parse({
			kind: 'tree',
			root: 'A',
			branches: [1, 2, 3, 4].map((n) => ({
				label: `B${n}`,
				nodes: [
					{label: `b${n}a`, items: ['Evren kendiyle açıklanır']},
					{label: `b${n}b`, items: ['Kısa']},
				],
			})),
		});
		if (short.kind !== 'tree' || long.kind !== 'tree') throw new Error('not a tree');
		expect(treeLayout(short).worldHeight).toBeLessThan(600);
		const layout = treeLayout(long);
		expect(layout.itemSize).toBeGreaterThanOrEqual(20);
		expect(layout.lists[0][0][0].lines).toEqual(['Evren kendiyle', 'açıklanır']);
		expect(layout.lists[0][1][0].lines).toEqual(['Kısa']);
	});

	it('widen to fill a landscape box and keep their shape in a tall one', async () => {
		const {treeLayout, treeRatio} = await import('../../../../src/Components/Visuals/Structure/Tree');
		const land = CourseVisualSchema.parse({
			kind: 'tree',
			root: 'Osmanlı toprakları',
			branches: [
				{
					label: 'Mirî',
					nodes: [
						{label: 'Dirlik', items: ['Has: 100.000 akçe üstü', 'Zeamet: 20.000–100.000', 'Tımar: 3.000–20.000']},
						{label: 'Özel amaçlı', items: ['Arpalık: ek gelir', 'Paşmaklık: saray kadınları']},
					],
				},
				{label: 'Mülk', nodes: [{label: 'Tam mülkiyet', items: ['Satılabilir']}]},
				{label: 'Vakıf', nodes: [{label: 'Hayır kurumuna', items: ['Satılamaz']}]},
			],
		});
		if (land.kind !== 'tree') throw new Error('not a tree');
		const own = treeLayout(land);
		const wide = treeLayout(land, 2.6);
		expect(wide.worldWidth).toBeGreaterThan(own.worldWidth);
		expect(wide.itemSize).toBeGreaterThan(own.itemSize);
		expect(wide.column).toBeLessThanOrEqual(420);
		expect(treeRatio(land, 2.6)).toBeGreaterThan(treeRatio(land));
		// A portrait box (CampShort) keeps the tree's own shape.
		expect(treeLayout(land, 0.6)).toEqual(own);
		// The box CourseVisual gives the tree leads the drawing to the same layout.
		expect(treeLayout(land, treeRatio(land, 2.6)).worldWidth).toBe(wide.worldWidth);
	});
});
