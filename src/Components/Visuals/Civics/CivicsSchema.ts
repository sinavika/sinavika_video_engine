import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

/**
 * The people of the kinship tree, by role. One line of the family is drawn: the father's side up to the grandfather,
 * the spouse's side up to the spouse's parent, and down to the grandchild.
 */
export const KINSHIP_ROLES = ['dede', 'baba', 'amca', 'kayinpeder', 'esinKardesi', 'es', 'ego', 'kardes', 'kuzen', 'cocuk', 'yegen', 'torun'] as const;
export type KinshipRole = (typeof KINSHIP_ROLES)[number];

/** Each person's parent on the tree (one parent is enough to count births); the spouse's line hangs from her parent. */
export const KINSHIP_PARENT: Readonly<Record<KinshipRole, KinshipRole | null>> = {
	dede: null,
	baba: 'dede',
	amca: 'dede',
	kayinpeder: null,
	esinKardesi: 'kayinpeder',
	es: 'kayinpeder',
	ego: 'baba',
	kardes: 'baba',
	kuzen: 'amca',
	cocuk: 'ego',
	yegen: 'kardes',
	torun: 'cocuk',
};

/** The roles a role's place on the tree hangs on: its parents up the line, and the spouse for her own family. */
const kinshipSupports = (role: KinshipRole): KinshipRole[] => {
	const chain: KinshipRole[] = [];
	for (let parent = KINSHIP_PARENT[role]; parent; parent = KINSHIP_PARENT[parent]) chain.push(parent);
	return role === 'kayinpeder' || role === 'esinKardesi' ? [...chain, 'es'] : chain;
};

/** Civics: the visuals of the law and the state (Vatandaşlık), joined in ../VisualSchema.ts. */
export const CIVICS_VISUALS = [
	/**
	 * Civics: kinship and its degree (hısımlık derecesi), as Türk Medeni Kanunu counts it: from one person up to the
	 * common ancestor and down to the other, one degree for every birth. The spouse's blood relatives are relatives by
	 * marriage (kayın hısımı) in the same line and degree; the spouse is no relative at all. A beat that points at a role
	 * draws the path from "ego" and numbers its steps, then names the degree, the line and the kind. `names` writes a
	 * person's name under the role; `half` makes the sibling a half sibling (only one parent in common: yarım kan), and
	 * the sibling's child with them. `hide` leaves roles off the tree. Parts: the roles.
	 */
	z
		.object({
			kind: z.literal('kinship'),
			names: z.partialRecord(z.enum(KINSHIP_ROLES), plainText(16)).default({}),
			half: z.boolean().default(false),
			hide: z.array(z.enum(KINSHIP_ROLES).exclude(['ego'])).max(10).default([]),
		})
		.superRefine((visual, context) => {
			const hidden = new Set<KinshipRole>(visual.hide);
			KINSHIP_ROLES.filter((role) => !hidden.has(role)).forEach((role) => {
				const missing = kinshipSupports(role).filter((support) => hidden.has(support));
				if (missing.length > 0) context.addIssue({code: 'custom', path: ['hide'], message: `"${role}" is shown but hangs on hidden ${missing.map((item) => `"${item}"`).join(', ')}.`});
			});
		}),
] as const;
