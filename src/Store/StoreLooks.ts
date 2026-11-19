/** The colours of each store look (kept apart from StoreSet.tsx so node scripts can read them without the fonts). */
import type {StoreSetProps} from './StoreProps';

export type Look = {
	bg: string;
	ink: string;
	sub: string;
	/** The mark behind the key words: a solid box (review, 14 Nov 2026: navy on orange, never a brown highlighter). */
	markBg: string;
	markInk: string;
	glow: string;
	shadow: string;
	dots?: string;
	/** Seritli: one ribbon running through all eight shots, so the gallery reads as one strip. */
	ribbon?: {color: string; line: string};
};

const TURUNCU: Look = {
	bg: 'linear-gradient(160deg, #F97316 0%, #EA580C 45%, #C2410C 100%)',
	ink: '#FFFFFF',
	sub: 'rgba(255,255,255,0.92)',
	markBg: '#0B1C30',
	markInk: '#FFFFFF',
	glow: 'rgba(255, 255, 255, 0.18)',
	shadow: '0 40px 90px -30px rgba(67, 20, 7, 0.55)',
};

export const LOOKS: Record<StoreSetProps['look'], Look> = {
	turuncu: TURUNCU,
	krem: {
		bg: '#FFF7ED',
		ink: '#0B1C30',
		sub: '#475569',
		markBg: '#C2410C',
		markInk: '#FFFFFF',
		glow: 'rgba(234, 88, 12, 0.14)',
		shadow: '0 40px 90px -30px rgba(120, 53, 15, 0.35)',
		dots: 'rgba(11, 28, 48, 0.08)',
	},
	lacivert: {
		bg: 'radial-gradient(120% 80% at 70% 85%, #1E2A4A 0%, #0F172A 60%)',
		ink: '#FFFFFF',
		sub: '#CBD5E1',
		markBg: '#F97316',
		markInk: '#0B1C30',
		glow: 'rgba(249, 115, 22, 0.28)',
		shadow: '0 40px 90px -30px rgba(0, 0, 0, 0.7)',
	},
	seritli: {
		...TURUNCU,
		ribbon: {color: '#0B1C30', line: 'rgba(255,255,255,0.75)'},
	},
};

/** The headline ink and the key-word box colour of a look (read by the pixel check, StoreShotCheck). */
export const lookMarkColors = (look: StoreSetProps['look']): {ink: string; mark: string; ribbon: boolean} => ({ink: LOOKS[look].ink, mark: LOOKS[look].markBg, ribbon: Boolean(LOOKS[look].ribbon)});

export {TURUNCU};
