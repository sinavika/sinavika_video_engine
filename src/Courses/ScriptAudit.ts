import type {LessonScript} from './LessonScript';

/**
 * Checks across lessons that no single script can make (`npm run curriculum -- audit`). Every lesson is meant to
 * have its own explanation, examples and solutions (owner, 29 Oct 2026); an engine that writes hundreds of videos
 * drifts towards the same sentences and the same questions. The audit lists:
 *   - sentences said in more than one lesson (the short fixed formulas of a question are allowed);
 *   - question stems that are nearly the same in two places;
 *   - each lesson's mix of cards and figures, so thin spots (rules with no figure, no prediction) stand out.
 * It reports; it does not block anything.
 */

export type AuditedScript = {code: string; script: LessonScript};

/** Short fixed formulas a solution may repeat in any lesson. */
const RITUAL = [
	/(parçayı|parçaları|özellikleri|diyaloğu|soruyu).*birlikte okuyalım/iu,
	/^önce .*(parçayı|soruyu).*okuyalım/iu,
	/^cevabımız [A-E]\b/iu,
	/^burada çok yapılan bir hata var/iu,
	/^hadi bunu bir soruda deneyelim/iu,
	/^ösym \d{4}'?\p{L}* bu kalıbı sordu/iu,
	/^(diğer|öteki) (dört|üç|şıklar)/iu,
	/^bu yüzden [A-E]'?\p{L}* ulaşılamaz/iu,
	/şıkları parçada tek tek arayalım/iu,
	/^anahtar ipuçlarını yakalayalım/iu,
	/^[A-E](, [A-E])* ve [A-E] parçadan çıkar/iu,
	/^bu soruyu \p{L}+ adımda çözersin/iu,
	/^sınavda bu söz altı çizili verilir/iu,
	/^ayetin her cümlesini seçeneklerle eşleyelim/iu,
	/^bu dizeler, bir şairin üslubunu göstermek için bu ders için yazıldı/iu,
];
const MIN_SENTENCE = 25;

const sentencesOf = (text: string): string[] =>
	text
		.split(/(?<=[.!?…])\s+/u)
		.map((sentence) => sentence.trim())
		.filter((sentence) => sentence.length >= MIN_SENTENCE);

/** Every narrated sentence of a lesson (cards, beats, hook, summary), as said. */
const narrationOf = (script: LessonScript): string[] => {
	const texts: string[] = [];
	const visit = (value: unknown, key = '') => {
		if (typeof value === 'string') {
			if (/narration$/i.test(key)) texts.push(value);
		} else if (Array.isArray(value)) value.forEach((item) => visit(item, key));
		else if (value && typeof value === 'object') Object.entries(value).forEach(([childKey, child]) => visit(child, childKey));
	};
	visit(script.lesson);
	return texts.flatMap(sentencesOf);
};

/** Sentences said in two or more lessons, with the lessons; the fixed formulas left out. */
export const repeatedSentences = (scripts: readonly AuditedScript[]): {sentence: string; lessons: string[]}[] => {
	const seen = new Map<string, Set<string>>();
	for (const {code, script} of scripts) {
		for (const sentence of narrationOf(script)) {
			if (RITUAL.some((pattern) => pattern.test(sentence))) continue;
			seen.set(sentence, (seen.get(sentence) ?? new Set()).add(code));
		}
	}
	return [...seen.entries()].filter(([, lessons]) => lessons.size > 1).map(([sentence, lessons]) => ({sentence, lessons: [...lessons].sort()}));
};

/** Word triples of a text. A formula counts with its own symbols and numbers, so two different formulas differ. */
const shingles = (text: string): Set<string> => {
	const words = text
		.toLocaleLowerCase('tr')
		.replace(/\\([a-z]+)/g, ' $1 ')
		.replace(/[^\p{L}\p{N}\s=+\-*/^<>]/gu, ' ')
		.replace(/([=+\-*/^<>])/g, ' $1 ')
		.split(/\s+/)
		.filter(Boolean);
	const result = new Set<string>();
	for (let index = 0; index + 2 < words.length; index++) result.add(words.slice(index, index + 3).join(' '));
	return result;
};

const jaccard = (first: Set<string>, second: Set<string>): number => {
	if (first.size === 0 || second.size === 0) return 0;
	let shared = 0;
	for (const shingle of first) if (second.has(shingle)) shared++;
	return shared / (first.size + second.size - shared);
};

/** How alike two texts are: shared word triples over all word triples (Jaccard), 0–1. */
export const textSimilarity = (a: string, b: string): number => jaccard(shingles(a), shingles(b));

/** A stem shorter than this many word triples ("Bu işlemin sonucu kaçtır?") says too little to compare. */
const MIN_SHINGLES = 6;

/** Questions whose stem and context are nearly the same as another question's (in any lesson). */
export const similarQuestions = (scripts: readonly AuditedScript[], threshold = 0.8): {a: string; b: string; similarity: number}[] => {
	const questions = scripts
		.flatMap(({code, script}) =>
			script.lesson.sections.flatMap((section, sectionIndex) =>
				// The figure counts too: the same stem over a different drawing or poem is a different question.
				section.cards.flatMap((card, cardIndex) =>
					card.kind === 'question'
						? [{where: `${code} s${sectionIndex + 1}-c${cardIndex + 1}`, words: shingles(`${card.question.context ?? ''} ${card.question.stem} ${card.question.figure ? JSON.stringify(card.question.figure).replace(/"[a-zA-Z]+":/g, ' ') : ''}`)}]
						: [],
				),
			),
		)
		.filter((question) => question.words.size >= MIN_SHINGLES);
	const pairs: {a: string; b: string; similarity: number}[] = [];
	for (let i = 0; i < questions.length; i++) {
		for (let j = i + 1; j < questions.length; j++) {
			const similarity = jaccard(questions[i].words, questions[j].words);
			if (similarity >= threshold) pairs.push({a: questions[i].where, b: questions[j].where, similarity: Math.round(similarity * 100) / 100});
		}
	}
	return pairs;
};

/** A lesson's mix of cards and figures. */
export const lessonMix = (script: LessonScript) => {
	const cards = script.lesson.sections.flatMap((section) => section.cards);
	const figures = cards.flatMap((card) => ('visual' in card && card.visual ? [card.visual.kind] : []));
	const count = (kind: string) => cards.filter((card) => card.kind === kind).length;
	return {
		cards: cards.length,
		questions: count('question'),
		predicts: count('predict'),
		examples: count('example'),
		mistakes: count('mistake'),
		rulesWithoutFigure: cards.filter((card) => card.kind === 'rule' && !card.visual).length,
		figures: figures.length,
		tableShare: figures.length ? figures.filter((kind) => kind === 'table' || kind === 'comparison').length / figures.length : 0,
	};
};
