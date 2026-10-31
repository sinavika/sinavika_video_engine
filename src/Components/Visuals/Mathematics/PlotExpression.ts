

/**
 * A small, safe evaluator for the expressions a plot or a motion draws:
 * numbers, one variable, + - * / ^, parentheses, implicit multiplication
 * (2x, 3(x+1)) and the common functions. Nothing is passed to `eval`; an
 * expression that does not parse is rejected when the script is validated.
 *
 *   "x^2 - 4x + 3"   "2*sin(x)"   "sqrt(16 - x^2)"   "5 + 2t - 0.5*9.8t^2"
 */

const FUNCTIONS: Record<string, (value: number) => number> = {
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	sqrt: Math.sqrt,
	// The cube root is defined for negative numbers too (AYT Köklü Sayılar: √x stops at 0, ∛x does not).
	cbrt: Math.cbrt,
	abs: Math.abs,
	ln: Math.log,
	log: Math.log10,
	exp: Math.exp,
};

const CONSTANTS: Record<string, number> = {pi: Math.PI, e: Math.E};

type Node = (variables: Record<string, number>) => number;

class ExpressionError extends Error {}

const tokenize = (text: string): string[] => {
	const tokens = text.replace(/\s+/g, '').match(/\d+(?:\.\d+)?|[a-zA-Z]+|[-+*/^(),]/g) ?? [];
	if (tokens.join('') !== text.replace(/\s+/g, '')) throw new ExpressionError(`Unexpected character in "${text}".`);
	// Implicit multiplication: 2x, 3(, )(, x( and )x.
	const out: string[] = [];
	tokens.forEach((token, index) => {
		const previous = tokens[index - 1];
		const endsValue = previous !== undefined && (/^[\d.]+$/.test(previous) || previous === ')' || (/^[a-z]+$/i.test(previous) && !(previous in FUNCTIONS)));
		const startsValue = /^[\d.]+$/.test(token) || token === '(' || /^[a-z]+$/i.test(token);
		if (endsValue && startsValue) out.push('*');
		out.push(token);
	});
	return out;
};

/** Parses an expression of the given variables into a function. */
export const parseExpression = (text: string, variables: readonly string[]): Node => {
	const tokens = tokenize(text);
	let position = 0;
	const peek = () => tokens[position];
	const take = (expected?: string) => {
		const token = tokens[position++];
		if (expected !== undefined && token !== expected) throw new ExpressionError(`Expected "${expected}" in "${text}".`);
		return token;
	};

	const primary = (): Node => {
		const token = take();
		if (token === undefined) throw new ExpressionError(`Unexpected end of "${text}".`);
		if (/^[\d.]+$/.test(token)) {
			const value = Number(token);
			return () => value;
		}
		if (token === '(') {
			const inner = sum();
			take(')');
			return inner;
		}
		if (token === '-') {
			const inner = power();
			return (scope) => -inner(scope);
		}
		const name = token.toLowerCase();
		if (name in FUNCTIONS) {
			take('(');
			const argument = sum();
			take(')');
			const apply = FUNCTIONS[name];
			return (scope) => apply(argument(scope));
		}
		if (name in CONSTANTS) {
			const value = CONSTANTS[name];
			return () => value;
		}
		if (variables.includes(token)) return (scope) => scope[token];
		throw new ExpressionError(`Unknown name "${token}" in "${text}". Variables: ${variables.join(', ')}.`);
	};
	const power = (): Node => {
		const base = primary();
		if (peek() !== '^') return base;
		take('^');
		const exponent = power();
		return (scope) => base(scope) ** exponent(scope);
	};
	const product = (): Node => {
		let left = power();
		while (peek() === '*' || peek() === '/') {
			const operator = take();
			const right = power();
			const previous = left;
			left = operator === '*' ? (scope) => previous(scope) * right(scope) : (scope) => previous(scope) / right(scope);
		}
		return left;
	};
	const sum = (): Node => {
		let left = product();
		while (peek() === '+' || peek() === '-') {
			const operator = take();
			const right = product();
			const previous = left;
			left = operator === '+' ? (scope) => previous(scope) + right(scope) : (scope) => previous(scope) - right(scope);
		}
		return left;
	};

	const root = sum();
	if (position !== tokens.length) throw new ExpressionError(`Unexpected "${tokens[position]}" in "${text}".`);
	return root;
};

/** True when the expression parses with the given variables. For schema refinements. */
export const isExpression = (text: string, variables: readonly string[]): boolean => {
	try {
		parseExpression(text, variables);
		return true;
	} catch {
		return false;
	}
};
