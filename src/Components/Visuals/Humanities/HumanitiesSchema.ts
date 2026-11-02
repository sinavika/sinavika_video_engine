import {z} from 'zod';
import {GEO_AREA_LAYERS, GEO_LAYER_NAMES} from '../../../Configurations/GeoData';
import {plainText, richText} from '../../../Schemas/RichText';
import {Point2} from '../VisualSchemaPart';

/** Reference lines a map can draw (see the map visual). */
export const MAP_LINES = ['equator', 'tropics', 'polarCircles', 'primeMeridian', 'graticule'] as const;

/** History: the battle field's grid, north up. */
export const BATTLE_GRID = {width: 100, height: 60} as const;

/**
 * Ground a battle field can show. A `hill` is a tepe (Kocatepe, Duatepe, Conkbayırı), a `mountain` a dağ (Kösedağ,
 * Mangal Dağı): one round rise drew both and read as a tent (owner, 2 Nov 2026: "dağ olduğu belli değil").
 */
const BATTLE_GROUND = ['river', 'sea', 'hill', 'mountain', 'forest', 'marsh', 'fortress', 'city', 'camp', 'wall', 'road', 'mines'] as const;

/** A name that calls a place a mountain (Kösedağ, Çal Dağı, Toros Dağları), not a hill. */
export const namesMountain = (name: string): boolean => /da[gğ](?:ı|lar|ları)?(?![\p{L}])/iu.test(name);

/** The kinds of unit, drawn as textbooks mark them. */
const BATTLE_UNITS = ['cavalry', 'infantry', 'archer', 'artillery', 'ship', 'command'] as const;

const BATTLE_POINT = z.tuple([z.number().min(0).max(BATTLE_GRID.width), z.number().min(0).max(BATTLE_GRID.height)]);

const BattleSchema = z
	.object({
		kind: z.literal('battle'),
		/** The two sides: the first in the lesson colour, the second in ink. */
		sides: z.tuple([plainText(24), plainText(24)]),
		ground: z
			.array(
				z.object({
					type: z.enum(BATTLE_GROUND),
					points: z.array(BATTLE_POINT).min(1).max(12),
					name: plainText(24).optional(),
					/** Where the name goes, when its usual place (a sea's middle) is taken by ships. */ nameAt: BATTLE_POINT.optional(),
				}),
			)
			.max(10)
			.default([]),
		/** `strength` 1–3 is how many soldiers the unit is drawn with: a small guard, a wing, a great army. */
		units: z
			.array(
				z.object({side: z.union([z.literal(0), z.literal(1)]), type: z.enum(BATTLE_UNITS), at: BATTLE_POINT, label: plainText(22).optional(), strength: z.number().int().min(1).max(3).default(2)}),
			)
			.min(2)
			.max(16),
		/** Stage 0 is the opening order (its moves, if any, are where units stand at the start). */
		stages: z
			.array(
				z.object({
					title: plainText(20),
					/** Units by number (1 = the first unit) and where they go; `via` bends the arrow. */
					moves: z
						.array(
							z.object({
								unit: z.number().int().min(1),
								to: BATTLE_POINT,
								via: z.array(BATTLE_POINT).max(3).default([]),
								/** A ship hauled over land on greased planks (Haliç, 1453): its way is laid with wooden ties. */
								overland: z.boolean().default(false),
							}),
						)
						.max(16)
						.default([]),
					/** Units that break and flee in this stage: they fade and are struck through. */
					routed: z.array(z.number().int().min(1)).max(16).default([]),
					/** Units that change sides in this stage (the Uz and Pecheneg horsemen at Malazgirt). */
					defect: z.array(z.number().int().min(1)).max(8).default([]),
					/** Ships set on fire in this stage (Çeşme 1770, Navarin 1827): they break as routed units do, burning as they go down. */
					burned: z.array(z.number().int().min(1)).max(16).default([]),
					/** Units that shoot in this stage at the nearest enemy: guns fire balls, archers loose volleys, ships fire broadsides. */
					fire: z.array(z.number().int().min(1)).max(8).default([]),
					/** What happens, in a line under the field. */
					note: plainText(90).optional(),
				}),
			)
			.min(1)
			.max(6),
		/** The outcome, written in the winner's colour on the last stage. */
		outcome: z.object({winner: z.union([z.literal(0), z.literal(1)]), text: plainText(60)}).optional(),
		/** `night` for a night raid (Sırpsındığı 1364): a dark sky with the moon and stars, the ground in shadow, the armies lit. */
		time: z.enum(['day', 'night']).default('day'),
	})
	.superRefine((battle, context) => {
		battle.ground.forEach((ground, index) => {
			if (ground.type === 'hill' && ground.name && namesMountain(ground.name)) context.addIssue({code: 'custom', path: ['ground', index, 'type'], message: `${ground.name} is a mountain: type "mountain", not "hill".`});
		});
		const count = battle.units.length;
		battle.stages.forEach((stage, index) => {
			const units = [...stage.moves.map((move) => move.unit), ...stage.routed, ...stage.burned, ...stage.defect, ...stage.fire];
			units.filter((unit) => unit > count).forEach((unit) => context.addIssue({code: 'custom', path: ['stages', index], message: `Stage ${index + 1} names unit ${unit}; the battle has ${count}.`}));
			stage.burned
				.filter((unit) => unit <= count && battle.units[unit - 1].type !== 'ship')
				.forEach((unit) => context.addIssue({code: 'custom', path: ['stages', index, 'burned'], message: `Only ships burn; unit ${unit} is ${battle.units[unit - 1].type}.`}));
		});
	});

/** The history and humanities visuals: one schema per kind, joined in ../VisualSchema.ts. */
/**
 * Natural colours a map's class may take when its colour is the lesson (a soil map: terra rossa red, çernozyem near
 * black; vegetation: forest green, steppe tan). Muted, so names and borders stay readable on them.
 */
/** What can move along an arrowed map route; the map draws each facing the way it goes. */
export const ROUTE_TRAVELLERS = ['dot', 'ship', 'caravan', 'truck', 'train'] as const;

/**
 * Colours a class of land areas may take. None is a water blue: a blue province reads as a lake or a sea (owner,
 * 2 Nov 2026: "Ege Denizi göl gibi"; the KPSS kış koridoru was painted blue). Cold or snowy classes take grey.
 */
export const SHADE_COLORS = {
	red: '#B5523B',
	brown: '#8B6B4A',
	tan: '#D8B98A',
	black: '#3E3A36',
	grey: '#9AA0A6',
	green: '#5E8C4A',
	lightGreen: '#A9C98A',
	yellow: '#E2C35A',
} as const;

/** A parallel's or meridian's label, which is also its part name: "36° K", "26°30' D", "0°". */
export const degreeLabel = (value: number, positive: string, negative: string) => {
	const whole = Math.abs(value);
	const degrees = Math.floor(whole + 1e-9);
	const minutes = Math.round((whole - degrees) * 60);
	const text = minutes > 0 ? `${degrees}°${String(minutes).padStart(2, '0')}'` : `${degrees}°`;
	return value === 0 ? text : `${text} ${value > 0 ? positive : negative}`;
};

/**
 * The names a map's beats may show or point at: its highlighted areas, markers, routes (unlabelled ones r1, r2…),
 * territories, ridges, shade classes, reference lines, parallels and meridians by their labels, and the rivers and
 * lakes its overlays name. Null when an overlay draws a whole layer: any river or lake of the data may then be named.
 */
export const mapPartNames = (map: {
	highlights: readonly {name: string}[];
	markers: readonly {label: string}[];
	routes: readonly {label?: string}[];
	territories: readonly {name: string}[];
	ridges: readonly {name: string}[];
	shades: readonly {label: string}[];
	lines: readonly string[];
	parallels: readonly number[];
	meridians: readonly number[];
	overlays: readonly {layer: string; names: readonly string[]}[];
}): string[] | null => {
	if (map.overlays.some((overlay) => (overlay.layer === 'rivers' || overlay.layer === 'lakes') && overlay.names.length === 0)) return null;
	return [
		...map.highlights.map((item) => item.name),
		...map.markers.map((item) => item.label),
		...map.routes.map((route, index) => route.label ?? `r${index + 1}`),
		...map.territories.map((item) => item.name),
		...map.ridges.map((item) => item.name),
		...map.shades.map((item) => item.label),
		...map.lines,
		...map.parallels.map((value) => degreeLabel(value, 'K', 'G')),
		...map.meridians.map((value) => degreeLabel(value, 'D', 'B')),
		...map.overlays.filter((overlay) => overlay.layer === 'rivers' || overlay.layer === 'lakes').flatMap((overlay) => overlay.names),
	];
};

export const HUMANITIES_VISUALS = [
	/**
	 * History: a battle in its order of battle, told stage by stage (owner, 29 Oct 2026: "savaşları savaş düzeninde
	 * anlat"). A schematic field, north up, on a 100 × 60 grid: ground (river, hills, sea, forest, marsh, a fortress
	 * or a city, a wall), the two sides' units as blocks marked as textbooks mark them, and stages in which units move
	 * along arrows, rout, or meet. Stage 0 is the opening order; each next stage moves units from where they stand.
	 * Beats' `stage` picks the stage; without beats the stages follow one another. Parts: u1… the units, s1… the
	 * stages (a beat that focuses a stage lights its note). Only what the sources say is drawn: a schema, not a map.
	 */
	BattleSchema,
	/**
	 * History: states, eras or reigns as bars on one year line, so it shows which stood side by side and which
	 * followed which (Asya Hun, Göktürk, Uygur, Karahanlı). `marks` are single years drawn across all bars (Talas
	 * 751); a beat that focuses a mark lights every period it falls in. Parts: p1… the periods, m1… the marks.
	 */
	z
		.object({
			kind: z.literal('periods'),
			periods: z
				.array(z.object({from: z.number().int(), to: z.number().int(), label: plainText(32), /** A short note after the years: a capital, a founder. */ detail: plainText(30).optional()}))
				.min(2)
				.max(8),
			marks: z
				.array(z.object({year: z.number().int(), label: plainText(24)}))
				.max(4)
				.default([]),
		})
		.superRefine((chart, context) => {
			chart.periods.forEach((period, index) => {
				if (period.from >= period.to) context.addIssue({code: 'custom', path: ['periods', index], message: `${period.label} must end after it begins (${period.from}–${period.to}).`});
			});
			const years = chart.periods.flatMap((period) => [period.from, period.to]);
			chart.marks.forEach((mark, index) => {
				if (mark.year < Math.min(...years) || mark.year > Math.max(...years)) context.addIssue({code: 'custom', path: ['marks', index], message: `Mark ${mark.year} lies outside the periods.`});
			});
		}),
	/**
	 * History, literature, civics: dated events on a line. An event may carry a month (and a day) when events of one
	 * or two years are told month by month (Samsun 19 Mayıs 1919, Sivas Eylül 1919): the line then spaces them by
	 * date and writes "19 Mayıs 1919".
	 */
	z.object({
		kind: z.literal('timeline'),
		events: z
			.array(
				z
					.object({year: z.number().int(), month: z.number().int().min(1).max(12).optional(), day: z.number().int().min(1).max(31).optional(), label: plainText(40), detail: plainText(70).optional()})
					.refine((event) => event.day === undefined || event.month !== undefined, {message: 'A day needs its month.', path: ['day']}),
			)
			.min(2)
			.max(8),
		/** How the years are written; "ö." for years before Christ is added automatically. */
		era: z.enum(['ce', 'hijri']).default('ce'),
	}),
	/**
	 * Geography, history: a map from the project's map data (public/Geo, see
	 * Configurations/GeoData): the world's countries, or Turkey's country
	 * outline, regions, provinces or districts, with rivers and lakes on top.
	 * Names are Turkish: "Türkiye", "Konya", "Karadeniz Bölgesi", "Kızılırmak".
	 */
	z.object({
		kind: z.literal('map'),
		/** The areas the map is made of. A data file of your own: {"src": "Geo/...json", "object": "..."}. */
		base: z
			.union([
				z.enum(GEO_AREA_LAYERS),
				z.object({
					src: z
						.string()
						.trim()
						.regex(/^Geo\/[\w./-]+$/),
					object: z.string().max(60).optional(),
				}),
			])
			.default('countries'),
		/** Drawn on top of the base: rivers, lakes, region or province borders. `names` keeps only those; `labels` writes their names. */
		overlays: z
			.array(z.object({layer: z.enum(GEO_LAYER_NAMES), names: z.array(z.string().min(1).max(60)).max(20).default([]), labels: z.boolean().default(false)}))
			.max(4)
			.default([]),
		/**
		 * Areas shaded by class, as atlases show density or rates: the first class darkest, each next one lighter,
		 * with a legend. Beats point at a class by its label.
		 */
		shades: z
			.array(
				z.object({
					label: plainText(30),
					names: z.array(z.string().min(1).max(60)).min(1).max(40),
					/** A natural colour that says something (SHADE_COLORS): a soil's own colour. Without it, `shadeStyle` colours the class. */
					color: z.enum(Object.keys(SHADE_COLORS) as [keyof typeof SHADE_COLORS, ...(keyof typeof SHADE_COLORS)[]]).optional(),
				}),
			)
			.max(5)
			.default([]),
		/** `scale`: tones of one colour, for ordered classes (dense → sparse); `contrast`: a different colour per class, for kinds (göç alan, göç veren; pamuk, fındık). */
		shadeStyle: z.enum(['scale', 'contrast']).default('scale'),
		/** Areas drawn in the lesson colour, by name. */
		highlights: z
			.array(z.object({name: z.string().min(1).max(60), label: plainText(30).optional()}))
			.max(12)
			.default([]),
		/** The map is framed on these areas. Without them a world map frames its highlights, other maps show their whole base. */
		focus: z.array(z.string().min(1).max(60)).max(12).default([]),
		markers: z
			.array(z.object({at: Point2, label: plainText(30)}))
			.max(10)
			.default([]),
		/** Lines such as routes or campaigns, as [longitude, latitude] points. */
		routes: z
			.array(
				z.object({
					points: z.array(Point2).min(2).max(30),
					label: plainText(30).optional(),
					/** An arrowhead at the end: the way a migration or campaign went. */
					arrow: z.boolean().default(true),
					/**
					 * What moves along an arrowed route once it is drawn: dots, sail ships for a voyage (the explorers' routes),
					 * a camel caravan for the Silk and Spice roads, lorries for trade by road, trains for trade by rail.
					 */
					traveller: z.enum(ROUTE_TRAVELLERS).default('dot'),
				}),
			)
			.max(4)
			.default([]),
		/**
		 * History: a state's land as it was, drawn from [longitude, latitude] corners, approximate as atlases draw it
		 * (owner 1 Nov 2026: lively history maps). When it comes in it spreads out from `from`, its capital or where it
		 * began, in its own colour, with its name on it; a beat shows or points at it by its name. The map notes that
		 * the borders are approximate.
		 */
		territories: z
			.array(z.object({name: plainText(30), points: z.array(Point2).min(3).max(60), from: Point2.optional()}))
			.max(6)
			.default([]),
		/**
		 * Geography: mountain chains as a schematic atlas draws them, a row of peaks along [longitude, latitude] points
		 * with the chain's name (Kuzey Anadolu Dağları, Toroslar); the peaks rise along the chain when it comes in, and a
		 * beat shows or points at a chain by its name. Approximate: the map notes it.
		 */
		ridges: z
			.array(z.object({name: plainText(30), points: z.array(Point2).min(2).max(20)}))
			.max(8)
			.default([]),
		/**
		 * Reference lines of the globe, labelled: the Equator, the two tropics, the polar circles, the prime
		 * meridian, or a `graticule` of parallels and meridians every 15°. Beats point at them by these names.
		 */
		lines: z.array(z.enum(MAP_LINES)).max(5).default([]),
		/**
		 * Any other parallels and meridians, in degrees (north and east positive), drawn dashed and labelled
		 * "36° K", "26° D": a country's extreme parallels and meridians. Beats point at them by their labels.
		 */
		parallels: z.array(z.number().min(-89).max(89)).max(6).default([]),
		meridians: z.array(z.number().min(-180).max(180)).max(6).default([]),
	}),
	/**
	 * Din Kültürü, literature, philosophy, history: one to three passages read from their source (a verse with its
	 * sura and number, a hadith, a line of poetry, a document), each with the message the lesson takes from it.
	 * The message comes in when a beat points at its passage (q1, q2, q3).
	 */
	z.object({
		kind: z.literal('verses'),
		items: z
			.array(z.object({text: richText(280), source: plainText(48), message: richText(110).optional()}))
			.min(1)
			.max(3),
	}),
	/**
	 * History, biology, literature: a picture from the media library. `src`
	 * is its file inside public/Media; the library (public/Media/Credits.json)
	 * records its source and licence, and `credit` is shown on the card.
	 * `aspect` is the file's width over height; `regions` are named parts of
	 * the picture as shares of it ([left, top, right, bottom]): a beat that
	 * focuses one moves the camera there, frames it and writes its label.
	 */
	z.object({
		kind: z.literal('picture'),
		src: z
			.string()
			.trim()
			.regex(/^Media\/[\w./-]+$/, 'Pictures come from public/Media.'),
		credit: plainText(120),
		caption: plainText(120).optional(),
		aspect: z.number().min(0.2).max(5).optional(),
		regions: z
			.array(
				z.object({
					name: z.string().regex(/^[a-z0-9-]{1,24}$/),
					box: z
						.tuple([z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1), z.number().min(0).max(1)])
						.refine(([left, top, right, bottom]) => right > left && bottom > top, 'A region box is [left, top, right, bottom].'),
					label: plainText(60),
				}),
			)
			.max(6)
			.default([]),
	}),
] as const;
