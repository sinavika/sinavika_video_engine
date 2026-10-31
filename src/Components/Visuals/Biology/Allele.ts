

// ---------------------------------------------------------------- alleles, gametes and genotypes, as textbooks write them

/** One allele as written: a letter (A, a, O), or a sex chromosome with its allele as a superscript (X^R, X^r, Y). */
export type Allele = {base: string; sup?: string};

/** The alleles of a gamete or genotype written as text: "SD", "Ao", "X^RY" → S, D / A, o / X^R, Y. */
export const alleles = (text: string): Allele[] => [...text.matchAll(/([A-Za-z])(?:\^([A-Za-z0-9]))?/g)].map((match) => ({base: match[1], sup: match[2]}));

export const alleleText = (allele: Allele) => allele.base + (allele.sup ? `^${allele.sup}` : '');

const isSex = (allele: Allele) => allele.base === 'X' || allele.base === 'Y';

const isLower = (letter: string) => letter !== letter.toUpperCase();

/** Dominant: an upper-case allele other than O (the blood groups' recessive one), or an X carrying an upper-case allele. */
const dominant = (allele: Allele) => (isSex(allele) ? allele.sup !== undefined && !isLower(allele.sup) : !isLower(allele.base) && allele.base !== 'O');

/** Writing order inside a gene: dominant first (Aa, AO), X before Y, X^R before X^r; equals alphabetically (AB, MN). */
const rank = (allele: Allele) => (isSex(allele) ? (allele.base === 'Y' ? 2 : 0) + (allele.sup && isLower(allele.sup) ? 1 : 0) : isLower(allele.base) ? 2 : allele.base === 'O' ? 1 : 0);

const order = (a: Allele, b: Allele) => rank(a) - rank(b) || alleleText(a).localeCompare(alleleText(b));

/** The zygote of an egg and a sperm: gene by gene, the i-th allele of each, written in textbook order. */
export const zygote = (egg: string, sperm: string): Allele[][] => {
	const fromSperm = alleles(sperm);
	return alleles(egg).map((allele, index) => [allele, fromSperm[index]].sort(order));
};

export const genotypeText = (genes: Allele[][]) => genes.flat().map(alleleText).join('');

/**
 * The phenotype class of a genotype, gene by gene: the dominant allele (AA and Aa → A), both of two different dominant
 * ones (codominance: AB, MN), else the recessive one (aa → a, OO → O). An X-linked gene keeps its whole genotype,
 * because sex and carrying matter there (X^RX^r, X^rY).
 */
export const phenotypeKey = (genes: Allele[][]) =>
	genes
		.map(([a, b]) => {
			if (isSex(a) || isSex(b)) return alleleText(a) + alleleText(b);
			if (dominant(a) && dominant(b) && a.base !== b.base) return a.base + b.base;
			return alleleText(dominant(a) ? a : dominant(b) ? b : a);
		})
		.join('');

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** A share in lowest terms: 2 of 4 → "1/2", 9 of 16 → "9/16", all → "1". */
export const fraction = (part: number, whole: number) => {
	const d = gcd(part, whole) || 1;
	return part === whole ? '1' : `${part / d}/${whole / d}`;
};

/** Counts as the simplest ratio: 9, 3, 3, 1 → "9 : 3 : 3 : 1"; 2, 2 → "1 : 1". */
export const ratio = (counts: number[]) => {
	const d = counts.reduce((g, count) => gcd(g, count), 0) || 1;
	return counts.map((count) => count / d).join(' : ');
};
