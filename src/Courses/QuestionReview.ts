import {lineCount} from '../Components/Typography/TextMeasure';
import {parseRichText} from '../Schemas/RichText';
import {arithmeticExpression} from './ArithmeticCheck';
import {parseExpression} from '../Components/Visuals/Mathematics/PlotExpression';
import type {LessonCard, LessonScript, Question} from './LessonScript';

/**
 * Checks of a lesson's questions and worked examples that the schema cannot make (TYT Matematik rewrite, 9 Nov 2026):
 * numeric options in order, no "yukarıdaki" for a figure that may move, a long stem that still fits its column in a
 * readable size, and examples whose solution is squeezed into a table instead of written step by step.
 */

const questionsOf = (script: LessonScript): {where: string; question: Question}[] =>
	script.lesson.sections.flatMap((section, sectionIndex) => section.cards.flatMap((card, cardIndex) => (card.kind === 'question' ? [{where: `s${sectionIndex + 1}-c${cardIndex + 1}`, question: card.question}] : [])));

/** An option's value when it is a number ("2,5", "$\frac{3}{4}$", "−3"), otherwise undefined. */
export const optionValue = (option: string): number | undefined => {
	const plain = option.replace(/\*\*/g, '').replace(/^\$|\$$/g, '').trim();
	const expression = arithmeticExpression(plain);
	if (expression === undefined || !/^[\d\s().+\-*/^sqrt]+$/.test(expression)) return undefined;
	try {
		const value = parseExpression(expression, [])({});
		return Number.isFinite(value) ? value : undefined;
	} catch {
		return undefined;
	}
};

/**
 * Options that are all numbers stand from the smallest to the largest, as ÖSYM sets them; in any other order the
 * place of the right answer gives it away or makes the viewer hunt for it.
 */
export const optionOrderIssues = (script: LessonScript): string[] =>
	questionsOf(script).flatMap(({where, question}) => {
		const values = question.options.map(optionValue);
		if (values.length < 3 || values.some((value) => value === undefined)) return [];
		const numbers = values as number[];
		const ascending = numbers.every((value, index) => index === 0 || value > numbers[index - 1] - 1e-12);
		return ascending ? [] : [`${where}: the options are numbers but not from the smallest to the largest (${question.options.join(', ')}); ÖSYM writes them in increasing order.`];
	});

/**
 * "Yukarıdaki şekil", "aşağıdaki grafik": where a figure stands differs on screen (beside the stem in the video, above
 * it in the app); "şekildeki", "verilen" do not. Only a question with a figure, and only the word in front of the
 * figure's name: "aşağıdakilerden hangisi" and "aşağıdaki ifadeler" point at the options or the passage, which keep
 * their place.
 */
const PLACE_WORDS = /(?<!\p{L})(yukarıdaki|aşağıdaki|yandaki|soldaki|sağdaki)\s+(?:\p{L}+\s+){0,2}?(şekil|grafi|tablo|diyagram|çizim|sayı doğrusu|şema|daire|pasta)\p{L}*/iu;

export const figureWordIssues = (script: LessonScript): string[] =>
	questionsOf(script).flatMap(({where, question}) => {
		if (!question.figure) return [];
		const match = PLACE_WORDS.exec(`${question.context ?? ''} ${question.stem}`);
		return match ? [`${where}: the question says "${match[0]}"; the figure's place changes with the screen (beside the stem in the video, above it in the app). Write "şekildeki" or "verilen".`] : [];
	});

// ---------------------------------------------------------------- does a long question fit its column?

/** The camp lesson's 16:9 question layout in reference pixels (QuestionScene, studio): the question's column and its type. */
const LAYOUT = {
	content: {width: 1920 - 2 * 96, height: 1080 - 2 * 64},
	heading: 56 + 32,
	columnGap: 48,
	lineHeight: 1.42,
	context: 34,
	stem: 40,
	option: 34,
	optionChrome: 52 + 18 + 36 + 6,
	optionPadding: 24 + 6,
	optionGap: 12,
	blockGap: 20,
};

/** Text as it is set on screen: emphasis marks dropped, a formula about as wide as its reading. */
const screenText = (text: string): string =>
	parseRichText(text)
		.map((segment) => (segment.kind === 'text' || segment.kind === 'strong' ? segment.value : segment.value.replace(/\\[a-z]+|[{}^_]/gi, '').replace(/\s+/g, ' ')))
		.join('');

/**
 * The scale at which a question's stem, passage and options fit their column in a camp lesson (FitBox shrinks them by
 * CSS zoom, so lines rewrap at the smaller size). 1 when the question fits at its full size.
 */
export const questionFitScale = (question: Question): number => {
	const length = (question.context?.length ?? 0) + question.stem.length + question.options.join('').length;
	const panelFlex = !question.figure && length > 480 ? 0.72 : 0.95;
	const column = (LAYOUT.content.width - LAYOUT.columnGap) / (1 + panelFlex);
	const room = LAYOUT.content.height - LAYOUT.heading;
	const heightAt = (scale: number) => {
		const width = column / scale;
		const lines = (text: string, size: number, weight: number, box: number) => text.split('\n').reduce((total, line) => total + Math.max(1, lineCount(screenText(line), box, {size, weight})), 0);
		const context = question.context ? lines(question.context, LAYOUT.context, 500, width) * LAYOUT.context * LAYOUT.lineHeight + LAYOUT.blockGap : 0;
		const stem = lines(question.stem, LAYOUT.stem, 700, width) * LAYOUT.stem * LAYOUT.lineHeight;
		const options = question.options.reduce((total, option) => total + Math.max(52, lines(option, LAYOUT.option, 500, width - LAYOUT.optionChrome) * LAYOUT.option * LAYOUT.lineHeight) + LAYOUT.optionPadding, 0);
		return (context + stem + LAYOUT.blockGap + 8 + options + LAYOUT.optionGap * (question.options.length - 1)) * scale;
	};
	if (heightAt(1) <= room) return 1;
	let low = 0.3;
	let high = 1;
	for (let step = 0; step < 20; step++) {
		const middle = (low + high) / 2;
		if (heightAt(middle) <= room) low = middle;
		else high = middle;
	}
	return low;
};

/** Below this the stem's 40 px type is under 30 px on a 1080p screen: hard to read on a phone watching YouTube. */
export const MIN_QUESTION_SCALE = 0.75;

export const questionFitIssues = (script: LessonScript): string[] =>
	questionsOf(script).flatMap(({where, question}) => {
		const scale = questionFitScale(question);
		return scale < MIN_QUESTION_SCALE
			? [`${where}: the question fits its column only at ${Math.round(scale * 100)}% of its type (the stem at about ${Math.round(40 * scale)} px); shorten the stem, move a list into \`context\` or cut the options' words.`]
			: [];
	});

// ---------------------------------------------------------------- worked examples

/** A table or flow that holds a solution's lines: an "Adım"/"İşlem" column, or arithmetic in its cells. */
const holdsSteps = (card: Extract<LessonCard, {kind: 'example'}>): boolean => {
	const visual = card.visual;
	if (!visual) return false;
	if (visual.kind === 'table') return visual.header.some((cell) => /adım|işlem/iu.test(cell)) || visual.rows.filter((row) => row.some((cell) => /=/.test(cell))).length >= 2;
	if (visual.kind === 'flow') return visual.nodes.filter((node) => /=/.test(node.label)).length >= 2;
	return false;
};

/**
 * Examples to write as a worked example (`steps`): a solution squeezed into a table or a flow as "2 · 4 = 8" in its
 * cells, or an explanation that carries two or more formulas. Line by line, each with its sentence, the viewer
 * follows the solution as it is written instead of reading a finished block.
 */
export const workedExampleSuggestions = (script: LessonScript): string[] =>
	script.lesson.sections.flatMap((section, sectionIndex) =>
		section.cards.flatMap((card, cardIndex) => {
			if (card.kind !== 'example' || card.steps.length > 0) return [];
			const where = `s${sectionIndex + 1}-c${cardIndex + 1}`;
			if (holdsSteps(card)) return [`${where}: the solution is written into a ${card.visual?.kind}; write it as \`steps\` (one line of math and one sentence each).`];
			const formulas = card.explanation ? parseRichText(card.explanation).filter((segment) => segment.kind === 'math' && /=/.test(segment.value)).length : 0;
			return formulas >= 2 ? [`${where}: the explanation carries ${formulas} formulas in one block; write the solution as \`steps\`.`] : [];
		}),
	);

