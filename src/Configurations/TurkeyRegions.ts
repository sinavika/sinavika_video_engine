/**
 * Turkey's seven geographical regions, by province plate code (TR-01 ...).
 *
 * The regions of the 1941 Geography Congress follow landforms and climate,
 * not provincial borders, and many provinces lie across two regions. Their
 * natural borders are the `regions` layer of public/Geo/Turkey.json
 * (scripts/GeoRegions.ts). Lessons that need each province in one region
 * ("which province is in which region", statistics by province) use this
 * table: the assignment of the school textbooks (MEB), where a province
 * belongs to the region its centre lies in. It makes the `provinceRegions`
 * layer and each province's `region`.
 *
 * To be checked by a geography teacher before it is relied on in a lesson.
 */
export const TURKEY_REGIONS = {
	Marmara: {name: 'Marmara Bölgesi', provinces: ['TR-22', 'TR-39', 'TR-59', 'TR-34', 'TR-41', 'TR-77', 'TR-54', 'TR-11', 'TR-16', 'TR-10', 'TR-17']},
	Aegean: {name: 'Ege Bölgesi', provinces: ['TR-35', 'TR-45', 'TR-09', 'TR-20', 'TR-48', 'TR-03', 'TR-43', 'TR-64']},
	Mediterranean: {name: 'Akdeniz Bölgesi', provinces: ['TR-07', 'TR-32', 'TR-15', 'TR-33', 'TR-01', 'TR-31', 'TR-80', 'TR-46']},
	CentralAnatolia: {name: 'İç Anadolu Bölgesi', provinces: ['TR-06', 'TR-42', 'TR-38', 'TR-26', 'TR-58', 'TR-71', 'TR-68', 'TR-70', 'TR-40', 'TR-51', 'TR-50', 'TR-66', 'TR-18']},
	BlackSea: {name: 'Karadeniz Bölgesi', provinces: ['TR-53', 'TR-61', 'TR-08', 'TR-57', 'TR-60', 'TR-19', 'TR-05', 'TR-55', 'TR-67', 'TR-14', 'TR-81', 'TR-78', 'TR-74', 'TR-37', 'TR-69', 'TR-28', 'TR-29', 'TR-52']},
	EasternAnatolia: {name: 'Doğu Anadolu Bölgesi', provinces: ['TR-25', 'TR-24', 'TR-36', 'TR-04', 'TR-76', 'TR-75', 'TR-44', 'TR-23', 'TR-62', 'TR-12', 'TR-49', 'TR-13', 'TR-65', 'TR-30']},
	SoutheasternAnatolia: {name: 'Güneydoğu Anadolu Bölgesi', provinces: ['TR-27', 'TR-02', 'TR-79', 'TR-63', 'TR-21', 'TR-47', 'TR-72', 'TR-56', 'TR-73']},
} as const satisfies Record<string, {name: string; provinces: readonly string[]}>;

export type TurkeyRegion = keyof typeof TURKEY_REGIONS;

/** The region of a province by its plate code, e.g. "TR-34" → Marmara. */
export const regionOfProvince = (code: string): TurkeyRegion | undefined =>
	(Object.keys(TURKEY_REGIONS) as TurkeyRegion[]).find((region) => (TURKEY_REGIONS[region].provinces as readonly string[]).includes(code));
