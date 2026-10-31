import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

/** Dates the earth visual shows; beats' `stage` 0–3 picks them in this order. */
export const EARTH_DATES = ['mart', 'haziran', 'eylul', 'aralik'] as const;

/** The named parts of each view of the earth visual, for beats to show and point at. */
export const EARTH_PARTS = {
	rays: ['isinlar', 'gece', 'aydinlanma', 'eksen', 'ekvator', 'donenceler', 'kutupdaireleri', 'dikaci', 'golge', 'sureler', 'kusaklar', 'enlem'],
	orbit: ['gunes', 'yorunge', 'eksen', 'mart', 'haziran', 'eylul', 'aralik', 'gunberi', 'gunote'],
	rotation: ['gece', 'yon', 'saatler', 'hiz', 'yerler'],
	winds: ['basinc', 'alize', 'bati', 'kutup', 'cephe'],
} as const;

/** The named parts of the contour map and its profile. */
export const CONTOUR_PARTS = ['izohips', 'renk', 'kiyi', 'zirve', 'dik', 'yatik', 'vadi', 'boyun', 'ab', 'izdusum', 'profil'] as const;

/** The named parts of the climate graph. */
export const CLIMATE_PARTS = ['yagis', 'sicaklik', 'sifir', 'kis', 'ilkbahar', 'yaz', 'sonbahar', 'ozet'] as const;

/** The named parts of the Earth's interior and of a plate boundary. */
export const INTERIOR_PARTS = ['kabuk', 'manto', 'astenosfer', 'discekirdek', 'iccekirdek', 'sialsima'] as const;

export const PLATE_PARTS = ['levhalar', 'manto', 'magma', 'sekil', 'oklar'] as const;

/** The named parts of the geological time column. */
export const GEOTIME_PARTS = ['prekambriyen', 'paleozoyik', 'mezozoyik', 'senozoyik', 'tersiyer', 'kuvaterner'] as const;

/** The named parts of each landform scene. */
export const LANDFORM_PARTS = {
	fold: ['basinc', 'antiklinal', 'senklinal'],
	fault: ['fay', 'horst', 'graben'],
	karst: ['lapya', 'dolin', 'uvala', 'polye', 'obruk', 'duden', 'magara', 'sarkit', 'traverten'],
	coast: ['falez', 'asinim', 'kiyioku', 'lagun', 'tombolo', 'kumsal'],
	glacier: ['karsiniri', 'sirk', 'buzulvadisi', 'moren', 'horguc'],
	desert: ['ruzgar', 'mantar', 'barkan', 'sahit', 'tafoni'],
	volcano: ['batolit', 'lakolit', 'sill', 'dayk', 'koni', 'krater', 'lav'],
	coasttypes: ['boyuna', 'enine', 'dalmacya', 'ria'],
	soil: ['ahorizon', 'bhorizon', 'chorizon', 'dhorizon'],
	vegetation: ['maki', 'kizilcam', 'karacam', 'agacsiniri', 'alpin'],
	landslide: ['egim', 'tabaka', 'su', 'kayma', 'kutle', 'set'],
} as const;

/** Population pyramid types of the MEB textbook (see the pyramid visual) and the pyramid's named parts. */
export const PYRAMID_SHAPES = ['wide', 'triangle', 'asymmetric', 'beehive', 'bell'] as const;

export const PYRAMID_PARTS = ['erkek', 'kadin', 'cocuk', 'calisma', 'yasli'] as const;

/** The named parts of the four-spheres landscape. */
export const SPHERE_PARTS = ['atmosfer', 'hidrosfer', 'litosfer', 'biyosfer', 'insan', 'etkileşim'] as const;

/** The geography visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const GEOGRAPHY_VISUALS = [
	/**
	 * Geography: how a river shapes the land, as a process in stages.
	 *   profile  side view from source to sea: flow, erosion upstream (the V valley deepens), transport, deposition at the mouth
	 *   meander  from above: the bends grow (outer bank eroded, inner bank built up) until a neck is cut off as an oxbow lake
	 *   delta    from above: the sediment the river carries builds a fan into the sea, split by distributaries
	 */
	z.object({kind: z.literal('river'), view: z.enum(['profile', 'meander', 'delta']), labels: z.boolean().default(true)}),
	/**
	 * Geography: the four spheres of the natural environment in one landscape (sky, sea and river, mountain and
	 * rock layers, forest and animals), with the human environment (`human`: a village, fields, a road) and the
	 * water moving between them (`interactions`: evaporation, rain, the river). Beats point at the parts by
	 * name: atmosfer, hidrosfer, litosfer, biyosfer, insan, etkileşim.
	 */
	z.object({kind: z.literal('spheres'), human: z.boolean().default(true), interactions: z.boolean().default(true), labels: z.boolean().default(true)}),
	/**
	 * Geography: the Earth and the Sun. `rays` (the default): the globe from the side, the Sun's rays from the left,
	 * the axis tilted for the date (beats' `stage` 0–3: 21 Mart, 21 Haziran, 23 Eylül, 21 Aralık; the axis is
	 * seen tilting between them), Ekvator, the tropics, the polar circles, the circle of illumination, the ray at
	 * right angles; `zones` shades the low, middle and high latitudes, `latitude` draws a point's latitude as the
	 * angle at the centre; `shadows` adds sticks at 70° K, 40° K, Ekvator, 40° G with their noon shadows and Sun
	 * heights, `dayLengths` the day lengths on the date. `orbit`: the elliptical orbit with the four dates, the
	 * axis always leaning the same way, perihelion and aphelion. `rotation`: the northern hemisphere from above
	 * the North Pole, turning west to east, local time round the rim (12.00 facing the Sun, at longitude
	 * `noon`), linear speed by latitude, and `places` (name, longitude) with their local times; `spin` turns it.
	 * `winds`: the pressure belts (TAB 0°, DYB 30°, DAB 60°, TYB 90°) with the trade winds, westerlies and polar
	 * winds blowing from high to low pressure, bent right in the north and left in the south, and the fronts at 60°.
	 * Parts per view in EARTH_PARTS.
	 */
	z.object({
		kind: z.literal('earth'),
		view: z.enum(['rays', 'orbit', 'rotation', 'winds']).default('rays'),
		date: z.enum(EARTH_DATES).default('mart'),
		shadows: z.boolean().default(false),
		dayLengths: z.boolean().default(false),
		/** Rays view: the low, middle and high latitude belts shaded and named. */
		zones: z.boolean().default(false),
		/** Rays view: latitude shown as the angle at the Earth's centre, for a point at this latitude (north positive). */
		latitude: z.number().min(-89).max(89).optional(),
		noon: z.number().min(-180).max(180).default(0),
		places: z
			.array(z.object({name: plainText(14), longitude: z.number().min(-180).max(180)}))
			.max(4)
			.default([]),
		spin: z.boolean().default(false),
		/** Rotation view: the linear-speed arrows and table (off on a local-time card, where they only distract). */
		speed: z.boolean().default(true),
		labels: z.boolean().default(true),
	}),
	/**
	 * Geography: a contour (izohips) map of a made-up landscape (coast, a low hill, a high mountain with a steep
	 * and a gentle side, a saddle, a river valley) with, under it, the profile along A–B. `interval` is the contour
	 * interval in metres; `tint` colours heights as atlases do; `notes` names what the lines tell (steep, gentle,
	 * valley, saddle); `profile` draws the A–B line, the dropped lines and the profile. Parts in CONTOUR_PARTS.
	 */
	z.object({
		kind: z.literal('contour'),
		interval: z.number().int().min(100).max(400).default(200),
		tint: z.boolean().default(false),
		notes: z.boolean().default(true),
		profile: z.boolean().default(true),
	}),
	/**
	 * Geography: a climate graph (sıcaklık-yağış grafiği) as atlases and ÖSYM draw it: monthly precipitation bars
	 * (mm, left axis) and monthly mean temperature line (°C, right axis), January first. `summary` writes the annual
	 * total and the annual temperature range. Beats point at yagis, sicaklik, sifir (0 °C), the seasons kis,
	 * ilkbahar, yaz, sonbahar (their months light up) and ozet.
	 */
	z.object({
		kind: z.literal('climate'),
		title: plainText(40).optional(),
		temperature: z.array(z.number().min(-40).max(45)).length(12),
		precipitation: z.array(z.number().min(0).max(1000)).length(12),
		summary: z.boolean().default(false),
	}),
	/**
	 * Geography: the Earth cut open: crust, mantle with convection currents in the asthenosphere, liquid outer core,
	 * solid inner core, each named with its depth; `crustInset` shows sial and sima under land and sea.
	 * Parts: kabuk, manto, astenosfer, discekirdek, iccekirdek, sialsima.
	 */
	z.object({kind: z.literal('interior'), crustInset: z.boolean().default(true)}),
	/**
	 * Geography: a plate boundary in cross-section, moving on the mantle's convection currents, its landform growing:
	 * `divergent` (mid-ocean ridge), `rift` (rift valley), `subduction` (trench and volcanoes), `collision` (fold
	 * mountains). Parts: levhalar, manto, magma, sekil, oklar.
	 */
	z.object({kind: z.literal('plates'), boundary: z.enum(['divergent', 'rift', 'subduction', 'collision'])}),
	/**
	 * Geography: the geological time column, eras as rock layers (oldest at the bottom, not to scale) with their ages
	 * and events, in the world or with `turkey` in Turkey. Parts: prekambriyen, paleozoyik, mezozoyik, senozoyik,
	 * tersiyer, kuvaterner.
	 */
	z.object({kind: z.literal('geotime'), turkey: z.boolean().default(false)}),
	/**
	 * Geography: a landform scene, drawn and labelled as textbooks show it; beats bring in each named form.
	 * `fold` anticline and syncline, `fault` horst and graben, `karst` limestone forms above and below ground,
	 * `coast` cliff, platform, spit, lagoon, tombolo, beach, `glacier` snow line, cirque, U-valley, moraine,
	 * `desert` wind forms, `volcano` batholith, laccolith, sill, dike, cone, crater, lava, `coasttypes` four coast types from above (longitudinal,
	 * transverse, Dalmatian, ria), `soil` a mature soil profile (A, B, C horizons over the parent rock), `vegetation`
	 * plant belts up a southern Taurus slope (maquis, Turkish pine, black pine and fir, tree line, alpine meadows), `landslide` a slope with layers
	 * parallel to it soaked by rain, the clay slip surface, a block sliding down and the lake it dams. Parts per scene in LANDFORM_PARTS.
	 */
	z.object({
		kind: z.literal('landform'),
		scene: z.enum(['fold', 'fault', 'karst', 'coast', 'glacier', 'desert', 'volcano', 'coasttypes', 'soil', 'vegetation', 'landslide']),
		/** Label the forms I, II, III… (in LANDFORM_PARTS order) instead of naming them: a figure for a question. */
		numbered: z.boolean().default(false),
	}),
	/**
	 * Geography: one to four population pyramids side by side on one scale (men left, women right, 17 five-year age
	 * groups). Each is a MEB type by `shape` (`wide` high births and deaths, `triangle` fast growth, `asymmetric`
	 * births fallen sharply, `beehive` developed and ageing, `bell` births rising again) or given as `male` and
	 * `female` percents of the whole population, youngest group first. `shares` writes the share of a band or sex
	 * when a beat points at it. Parts: erkek, kadin, cocuk (0–14), calisma (15–64), yasli (65+), p1…p4.
	 */
	z.object({
		kind: z.literal('pyramid'),
		pyramids: z
			.array(
				z
					.object({
						label: plainText(28),
						note: plainText(40).optional(),
						shape: z.enum(PYRAMID_SHAPES).optional(),
						male: z.array(z.number().min(0).max(15)).length(17).optional(),
						female: z.array(z.number().min(0).max(15)).length(17).optional(),
					})
					.refine((pyramid) => Boolean(pyramid.shape) !== Boolean(pyramid.male && pyramid.female), {message: 'Bir piramit ya shape ya da male+female verisiyle tanımlanır.'}),
			)
			.min(1)
			.max(4),
		/** `row` side by side; `grid` two rows of two (three or four pyramids), taller, for a question's narrow figure. */
		layout: z.enum(['row', 'grid']).default('row'),
		shares: z.boolean().default(false),
	}),
] as const;
