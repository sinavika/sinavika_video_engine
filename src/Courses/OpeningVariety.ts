/**
 * Camp lessons must not open alike: the same sentence in every video reads as automation and costs trust (owner,
 * 8 Nov 2026, docs/Courses/Courses.md "YouTube dersinin akışı"). These checks compare one lesson's cold open with the others
 * of its camp; `curriculum check` reports them and tests/Courses/CampOpenings.test.ts holds every camp to them.
 */

/** Words that would make a cold open sound like a channel intro rather than the lesson. */
const INTRO_WORDS = /\b(merhaba|selam|ben sinoai|bugün sizlerle|bu videoda)\b/iu;

/** A sentence this short ("Gel, görelim.") may recur; longer ones are the lesson's own words. */
const REPEATABLE_WORDS = 3;

const sentences = (text: string): string[] =>
	text
		.split(/(?<=[.?!…])\s+/u)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence.split(/\s+/u).length > REPEATABLE_WORDS);

const normalise = (sentence: string): string => sentence.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

type Opening = {narration: string};

/**
 * What is wrong with `opening` next to the other cold opens of its camp: a sentence another lesson also says, or
 * a greeting. `others` are the camp's other lessons, named for the message.
 */
export const openingVarietyIssues = (opening: Opening, others: readonly {name: string; opening: Opening}[]): string[] => {
	const issues: string[] = [];
	if (INTRO_WORDS.test(opening.narration)) issues.push(`The cold open greets or introduces ("${INTRO_WORDS.exec(opening.narration)?.[0]}"); open on the lesson's problem instead.`);
	for (const sentence of sentences(opening.narration)) {
		const twin = others.find((other) => sentences(other.opening.narration).some((said) => normalise(said) === normalise(sentence)));
		if (twin) issues.push(`The cold open says "${sentence}", as ${twin.name} does; every lesson opens in its own words.`);
	}
	return issues;
};
