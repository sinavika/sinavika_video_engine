// ---------------------------------------------------------------- food-web sizes, shared by the figure and its schema

/** The width a food web's row gives its organisms, and the gap between two of them. */
export const FOOD_WEB_ROW = 1100;
export const FOOD_WEB_GAP = 30;
/** An organism's pill: wide enough for its name at 30 px, never narrower than 170. */
export const foodWebNodeWidth = (label: string) => Math.max(170, label.length * 16 + 48);
/** The rows' names, producers at the bottom. */
export const TROPHIC_NAMES = ['Üreticiler', 'Birincil tüketiciler', 'İkincil tüketiciler', 'Üçüncül tüketiciler', 'Dördüncül tüketiciler'];
