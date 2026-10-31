/**
 * A formula read aloud in Turkish the way a teacher reads it in class (29 Oct 2026, before the AYT Matematik camp):
 * "\lim_{x\to 2}" is "x 2'ye giderken limit", "f'(x)" "f türev x", "\int_0^1 x^2\,dx" "0'dan 1'e x kare dx'in
 * integrali", "\sum_{k=1}^{n}" "k eşittir 1'den n'e toplam", "\frac{x+1}{x-1}" "kesrin payı x artı 1, paydası x
 * eksi 1". The formula is parsed into a small tree first, so nested parts are read whole
 * ("\frac{\sqrt{x}}{x^2+1}"). Numbers stay digits: spokenNumbers says them afterwards, suffix included ("2'ye" is
 * "ikiye"). The readings are approved by the owner in docs/MatematikOkunus.md; change that table first.
 */

type Token = {type: 'cmd' | 'num' | 'letter' | 'char' | 'text'; value: string; space: boolean};

type Scripts = {sub?: MathNode[]; sup?: MathNode[]; primes: number; factorial: number};
type MathBase =
	| {kind: 'num' | 'letter' | 'word' | 'text' | 'op' | 'func' | 'numberSet'; value: string}
	| {kind: 'group'; body: MathNode[]}
	| {kind: 'delim'; open: string; close: string; body: MathNode[]}
	| {kind: 'frac'; num: MathNode[]; den: MathNode[]}
	| {kind: 'sqrt'; index?: MathNode[]; body: MathNode[]}
	| {kind: 'accent'; name: string; body: MathNode[]}
	| {kind: 'binom'; top: MathNode[]; bottom: MathNode[]}
	| {kind: 'pmod'; body: MathNode[]};
type MathNode = MathBase & Scripts & {space: boolean};
type Valued = Extract<MathNode, {value: string}>;
type Delim = Extract<MathNode, {kind: 'delim'}>;

/** A piece of the reading. An atom (a digit run or a letter) written right after another atom stays on it: "4ac", "2x". */
type Piece = {text: string; atom?: boolean; glue?: boolean; number?: boolean; letter?: boolean};

type MathSpeechOptions = {
	/** The text around the formula is about sets: a capital with a prime is a complement ("A tümleyen"), not "A üssü". */
	sets?: boolean;
	/** Says a number as words. Used only where a digit would otherwise be taken for a unit: "2m" is "iki m", not "2 metre". */
	sayNumber?: (digits: string) => string;
};

type Context = {sets: boolean; chem: boolean};

// ─── Words ───────────────────────────────────────────────────────────────────────────────────────────────────────

const OP_WORDS: Record<string, string> = {
	'+': 'artı', '-': 'eksi', '−': 'eksi', '=': 'eşittir', '<': 'küçüktür', '>': 'büyüktür', '/': 'bölü', '*': 'yıldız', '°': 'derece',
	',': ',', ':': ':', ';': '', '.': '.', '!': 'faktöriyel', ')': ',', ']': ',', '?': '?',
	cdot: 'çarpı', times: 'çarpı', div: 'bölü', pm: 'artı eksi', mp: 'eksi artı',
	neq: 'eşit değildir', leq: 'küçük eşit', geq: 'büyük eşit', approx: 'yaklaşık', equiv: 'denktir', notequiv: 'denk değildir',
	sim: 'benzerdir', cong: 'eştir', propto: 'orantılıdır', parallel: 'paraleldir', perp: 'diktir',
	cup: 'birleşim', cap: 'kesişim', setminus: 'fark', in: 'elemanıdır', notin: 'elemanı değildir', subset: 'alt kümesidir', notsubset: 'alt kümesi değildir', supset: 'kapsar', mid: 'öyle ki',
	wedge: 've', vee: 'veya', veebar: 'ya da', implies: 'ise', iff: 'ancak ve ancak', forall: 'her', exists: 'en az bir', neg: 'değil', therefore: 'o halde', because: 'çünkü',
	to: 'ise', triangle: 'üçgen', angle: 'açısı', ast: 'yıldız', diamond: 'karo', circ: 'bileşke', bmod: 'mod', dots: '...', percent: 'yüzde', prime: '',
};

/** LaTeX command → operator key in OP_WORDS. */
const COMMAND_OPS: Record<string, string> = {
	cdot: 'cdot', times: 'times', div: 'div', pm: 'pm', mp: 'mp',
	neq: 'neq', ne: 'neq', leq: 'leq', le: 'leq', leqslant: 'leq', geq: 'geq', ge: 'geq', geqslant: 'geq', approx: 'approx', equiv: 'equiv',
	sim: 'sim', cong: 'cong', propto: 'propto', parallel: 'parallel', perp: 'perp',
	cup: 'cup', cap: 'cap', setminus: 'setminus', in: 'in', notin: 'notin', subset: 'subset', subseteq: 'subset', subsetneq: 'subset', supset: 'supset', supseteq: 'supset', mid: 'mid',
	wedge: 'wedge', land: 'wedge', vee: 'vee', lor: 'vee', veebar: 'veebar', Rightarrow: 'implies', implies: 'implies', Longrightarrow: 'implies',
	Leftrightarrow: 'iff', iff: 'iff', Longleftrightarrow: 'iff', forall: 'forall', exists: 'exists', neg: 'neg', lnot: 'neg', therefore: 'therefore', because: 'because',
	to: 'to', rightarrow: 'to', longrightarrow: 'to', mapsto: 'to', triangle: 'triangle', bigtriangleup: 'triangle', angle: 'angle', ast: 'ast', star: 'ast', diamond: 'diamond',
	circ: 'circ', bmod: 'bmod', mod: 'bmod', ldots: 'dots', cdots: 'dots', dots: 'dots', dotsc: 'dots', dotsb: 'dots', vdots: 'dots', '%': 'percent', prime: 'prime', '\\': ',',
};

const SYMBOL_WORDS: Record<string, string> = {
	alpha: 'alfa', beta: 'beta', gamma: 'gama', Gamma: 'gama', delta: 'delta', Delta: 'delta', epsilon: 'epsilon', varepsilon: 'epsilon',
	zeta: 'zeta', eta: 'eta', theta: 'teta', Theta: 'teta', vartheta: 'teta', kappa: 'kappa', lambda: 'lamda', Lambda: 'lamda',
	mu: 'mü', nu: 'nü', xi: 'ksi', pi: 'pi', Pi: 'pi', rho: 'ro', sigma: 'sigma', Sigma: 'sigma', tau: 'tau',
	phi: 'fi', varphi: 'fi', Phi: 'fi', chi: 'ki', psi: 'psi', Psi: 'psi', omega: 'omega', Omega: 'omega',
	infty: 'sonsuz', emptyset: 'boş küme', varnothing: 'boş küme',
};

const FUNCTION_WORDS: Record<string, string> = {
	sin: 'sinüs', cos: 'kosinüs', tan: 'tanjant', cot: 'kotanjant', sec: 'sekant', csc: 'kosekant',
	arcsin: 'arksinüs', arccos: 'arkkosinüs', arctan: 'arktanjant', arccot: 'arkkotanjant',
	log: 'log', lg: 'log', ln: 'l n', lim: 'limit', int: 'integral', iint: 'integral', oint: 'integral', sum: 'toplam', prod: 'çarpım',
	max: 'en büyüğü', min: 'en küçüğü', exp: 'e üssü', det: 'determinant', gcd: 'OBEB', arg: 'argüman',
};
const TRIGONOMETRY = new Set(['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan', 'arccot']);
const ARC: Record<string, string> = {sin: 'arcsin', cos: 'arccos', tan: 'arctan', cot: 'arccot'};
const INTEGRALS = new Set(['int', 'iint', 'oint']);

const NUMBER_SETS: Record<string, string> = {N: 'doğal sayılar', Z: 'tam sayılar', Q: 'rasyonel sayılar', R: 'reel sayılar', C: 'karmaşık sayılar'};
/** Signed sets as a teacher names them: ℤ⁺ "pozitif tam sayılar", ℝ⁻ "negatif reel sayılar". */
const signedSet = (letter: string, sign: string): string => `${sign === '+' ? 'pozitif' : 'negatif'} ${NUMBER_SETS[letter]}`;

const STATES: Record<string, string> = {g: 'gaz', k: 'katı', s: 'sıvı', l: 'sıvı', suda: 'suda', aq: 'suda'};

const FRACTIONS = new Set(['frac', 'dfrac', 'tfrac', 'cfrac']);
const BINOMS = new Set(['binom', 'dbinom', 'tbinom']);
const ACCENTS = new Set(['overline', 'bar', 'widehat', 'hat', 'vec', 'overrightarrow', 'overleftrightarrow', 'underline', 'widetilde', 'tilde', 'dot', 'ddot', 'underbrace', 'overbrace']);
const TEXT_COMMANDS = new Set(['text', 'textrm', 'textit', 'textbf', 'textnormal', 'textsf', 'mathrm', 'mathit', 'mathbf', 'mathsf', 'operatorname', 'mbox']);
/** Font commands whose content is still mathematics: with scripts inside they are read as a formula. */
const MATH_FONTS = new Set(['mathrm', 'mathit', 'mathbf', 'mathsf']);
/** Each run of letters in an upright formula becomes a word (an element symbol, a unit); commands such as \to stay. */
const uprightMath = (content: string): string => content.replace(/(\\[a-zA-Z]+)|([A-Za-z]+)/g, (match, command: string | undefined, letters: string) => (command ? match : `\\text{${letters}}`));

const RELATIONS = new Set(['=', '<', '>', 'neq', 'leq', 'geq', 'approx', 'equiv', 'notequiv', 'sim', 'cong', 'propto', 'parallel', 'perp', 'in', 'notin', 'subset', 'notsubset', 'supset', 'implies', 'iff', 'to']);
const ADDITIVE = new Set(['+', '-', '−', 'pm', 'mp']);
const PRODUCTS = new Set(['cdot', 'times', '/', 'div']);
const SET_OPS = new Set(['cup', 'cap', 'setminus', 'in', 'notin', 'subset', 'notsubset', 'supset']);

/** Function letters read with their argument and no "parantez içinde": f(2) is "f 2", P(x + 1) "P x artı 1", F(b) "F b". */
const FUNCTION_LETTERS = /^[fghFPQR]$/;
/** Proposition letters: p' is "p değil". */
const PROPOSITIONS = /^[pqrst]$/;
/** Letters whose prime is a derivative even without an argument: f', g', y'. */
const DERIVED = /^[fgy]$/;
const DERIVATIVE = ['türev', 'ikinci türev', 'üçüncü türev'];

// ─── Turkish suffixes ────────────────────────────────────────────────────────────────────────────────────────────

/** How a letter is said, for the suffix it takes: "n'e", "b'ye", "x'in". n is "en", as in "1'den n'e kadar". */
const LETTER_SOUNDS: Record<string, string> = {
	a: 'a', b: 'be', c: 'ce', ç: 'çe', d: 'de', e: 'e', f: 'fe', g: 'ge', ğ: 'ğe', h: 'he', ı: 'ı', i: 'i', j: 'je', k: 'ke', l: 'le', m: 'me', n: 'en',
	o: 'o', ö: 'ö', p: 'pe', q: 'ku', r: 're', s: 'se', ş: 'şe', t: 'te', u: 'u', ü: 'ü', v: 've', w: 've', x: 'iks', y: 'ye', z: 'ze',
};
const ONES = ['sıfır', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const TENS = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
const SCALE_WORDS = ['bin', 'milyon', 'milyar', 'trilyon'];

/** The last word of a number as spokenNumbers says it: 12 → "iki", 40 → "kırk", 2000 → "bin", 2,5 → "beş". */
const lastNumberWord = (digits: string): string => {
	const part = digits.includes(',') ? digits.split(',')[1].replace(/^0+(?=\d)/, '') : digits;
	const value = Number(part);
	if (!Number.isSafeInteger(value) || value === 0) return 'sıfır';
	if (value % 10) return ONES[value % 10];
	if (value % 100) return TENS[Math.floor(value / 10) % 10];
	if (value % 1000) return 'yüz';
	let scale = 0;
	for (let rest = value / 1000; rest % 1000 === 0 && scale < SCALE_WORDS.length - 1; rest /= 1000) scale++;
	return SCALE_WORDS[scale];
};

type Suffix = 'dative' | 'ablative' | 'genitive' | 'ordinal';
const VOWELS = 'aeıioöuüâîû';

/** The suffix a spoken word takes, by vowel harmony: "iki" → "ye", "üç" → "ten", "kare" → "nin". */
const suffixFor = (spoken: string, suffix: Suffix): string => {
	const word = spoken.toLocaleLowerCase('tr');
	const vowel = [...word].reverse().find((letter) => VOWELS.includes(letter)) ?? 'e';
	const endsInVowel = VOWELS.includes(word.at(-1) ?? '');
	const back = 'aıouâû'.includes(vowel);
	const round = 'oöuüû'.includes(vowel);
	const narrow = back ? (round ? 'u' : 'ı') : round ? 'ü' : 'i';
	switch (suffix) {
		case 'dative':
			return `${endsInVowel ? 'y' : ''}${back ? 'a' : 'e'}`;
		case 'ablative':
			return `${/[çfhkpsşt]$/.test(word) ? 't' : 'd'}${back ? 'an' : 'en'}`;
		case 'genitive':
			return `${endsInVowel ? 'n' : ''}${narrow}n`;
		case 'ordinal':
			return `${endsInVowel ? '' : narrow}nc${narrow}`;
	}
};

/**
 * A suffix on one written word. Numbers and symbols keep the apostrophe and take the suffix of how they are said:
 * "2'ye", "n'e", "dx'in", "ATP'den". Turkish words take it plainly: "sonsuza", "kareye", "gazdan".
 */
const suffixed = (text: string, suffix: Suffix): string => {
	if (/^\d+(?:,\d+)?$/.test(text)) return `${text}'${suffixFor(lastNumberWord(text), suffix)}`;
	if (/^[A-Za-z0-9]+$/.test(text) && (/[A-Z0-9]/.test(text) || text.length <= 2)) {
		const letter = text.at(-1) ?? '';
		const sound = /\d/.test(letter) ? lastNumberWord(letter) : LETTER_SOUNDS[letter.toLowerCase()] ?? 'e';
		return `${text}'${suffixFor(sound, suffix)}`;
	}
	return `${text}${suffixFor(text, suffix)}`;
};

/** The suffix goes on the last word of a reading; a pause before it is dropped. */
const withSuffix = (pieces: Piece[], suffix: Suffix): Piece[] => {
	const out = [...pieces];
	while (out.length > 1 && (out.at(-1)?.text === ',' || !out.at(-1)?.text)) out.pop();
	const last = out.at(-1);
	if (!last) return out;
	// A glued run ("2x", "dx") takes the suffix as one word: the pieces are merged first.
	let start = out.length - 1;
	while (start > 0 && out[start].glue && out[start - 1].atom) start--;
	const word = out.slice(start).map((piece) => piece.text).join('');
	const words = word.split(' ');
	words[words.length - 1] = suffixed(words.at(-1) ?? '', suffix);
	return [...out.slice(0, start), {text: words.join(' '), glue: out[start].glue, atom: false}];
};

// ─── Tokens ──────────────────────────────────────────────────────────────────────────────────────────────────────

const tokenize = (latex: string): Token[] => {
	const tokens: Token[] = [];
	let space = false;
	const push = (type: Token['type'], value: string) => {
		tokens.push({type, value, space});
		space = false;
	};
	for (let i = 0; i < latex.length; ) {
		const char = latex[i];
		if (/\s/.test(char)) {
			space = true;
			i++;
			continue;
		}
		if (char === '\\') {
			const command = /^\\([a-zA-Z]+|[^a-zA-Z])/.exec(latex.slice(i));
			if (!command) break;
			i += command[0].length;
			const name = command[1];
			if (TEXT_COMMANDS.has(name)) {
				let start = i;
				while (/\s/.test(latex[start] ?? '')) start++;
				if (latex[start] === '{') {
					let end = start;
					for (let depth = 0; end < latex.length; end++) {
						if (latex[end] === '\\') end++;
						else if (latex[end] === '{') depth++;
						else if (latex[end] === '}' && --depth === 0) break;
					}
					const content = latex.slice(start + 1, end);
					if (MATH_FONTS.has(name) && /[_^]/.test(content)) {
						// An upright formula with scripts, "\mathrm{H_2SO_4}": read as the formula it is, not as one word.
						const inner = tokenize(uprightMath(content));
						if (inner.length) inner[0] = {...inner[0], space: inner[0].space || space};
						tokens.push(...inner);
						space = false;
					} else push('text', content);
					i = end + 1;
					continue;
				}
			}
			push('cmd', name);
			continue;
		}
		// A decimal comma, "0,25", belongs to the number; "2,8,1" (an electron arrangement) is a list.
		const run = /^\d+(?:,\d+)*/.exec(latex.slice(i));
		if (run) {
			const numbers = run[0].split(',');
			if (numbers.length === 2) push('num', run[0]);
			else
				numbers.forEach((number, index) => {
					if (index > 0) push('char', ',');
					push('num', number);
				});
			i += run[0].length;
			continue;
		}
		push(/\p{L}/u.test(char) ? 'letter' : 'char', char);
		i++;
	}
	return tokens;
};

/** Words inside \text{…}: commands and braces dropped, a slash said "bölü" ("kg/m"), brackets as in a formula ("Ca(OH)"). */
const cleanText = (text: string): string =>
	text
		.replace(/\\([a-zA-Z]+)\s*/g, ' ')
		.replace(/\\(.)/g, '$1')
		.replace(/[{}]/g, '')
		.replace(/\s*\/\s*/g, ' bölü ')
		.replace(/\s*\(\s*/g, ' parantez içinde ')
		.replace(/\s*\)/g, ', ');

// ─── Parser ──────────────────────────────────────────────────────────────────────────────────────────────────────

const isChar = (token: Token | undefined, ...values: string[]): boolean => token?.type === 'char' && values.includes(token.value);
const isCmd = (token: Token | undefined, ...values: string[]): boolean => token?.type === 'cmd' && values.includes(token.value);
/** Closers that end any bracket left open inside them. */
const hardStop = (token: Token): boolean => isChar(token, '}') || isCmd(token, 'right', '}');

class Parser {
	private pos = 0;

	constructor(private readonly tokens: Token[]) {}

	parse(): MathNode[] {
		return this.row(() => false);
	}

	private peek(): Token | undefined {
		return this.tokens[this.pos];
	}

	private row(stop: (token: Token) => boolean): MathNode[] {
		const nodes: MathNode[] = [];
		while (this.pos < this.tokens.length && !stop(this.tokens[this.pos])) {
			const node = this.atom();
			if (node) nodes.push(node);
		}
		return nodes;
	}

	private atom(): MathNode | undefined {
		const token = this.tokens[this.pos];
		// A script with nothing before it ("{}^{\circ}" after a typed degree sign) hangs on an empty group.
		const base: MathBase | undefined = isChar(token, '^', '_', "'") ? {kind: 'group', body: []} : this.base();
		if (!base) return undefined;
		return this.scripts({...base, space: token.space, primes: 0, factorial: 0});
	}

	private scripts(node: MathNode): MathNode {
		for (;;) {
			const token = this.peek();
			if (isChar(token, '^')) {
				this.pos++;
				const sup = this.arg();
				if (sup.length > 0 && sup.every((part) => part.kind === 'op' && part.value === 'prime')) node.primes += sup.length;
				else node.sup = [...(node.sup ?? []), ...sup];
			} else if (isChar(token, '_')) {
				this.pos++;
				node.sub = [...(node.sub ?? []), ...this.arg()];
			} else if (isChar(token, "'")) {
				this.pos++;
				node.primes++;
			} else if (isChar(token, '!')) {
				this.pos++;
				node.factorial++;
			} else if (isCmd(token, 'limits', 'nolimits')) this.pos++;
			else return node;
		}
	}

	/** A command's argument or a script: a braced group, or one token ("x^23" is x² then 3, as KaTeX sets it). */
	private arg(): MathNode[] {
		const token = this.peek();
		if (!token) return [];
		if (isChar(token, '{')) {
			this.pos++;
			const body = this.row((next) => isChar(next, '}'));
			this.pos++;
			return body;
		}
		if (token.type === 'num' && /^\d{2,}$/.test(token.value)) {
			this.tokens[this.pos] = {...token, value: token.value.slice(1), space: false};
			return [{kind: 'num', value: token.value[0], space: token.space, primes: 0, factorial: 0}];
		}
		const base = this.base();
		return base ? [{...base, space: token.space, primes: 0, factorial: 0}] : [];
	}

	private base(): MathBase | undefined {
		const token = this.tokens[this.pos++];
		switch (token.type) {
			case 'num':
			case 'letter':
				return {kind: token.type, value: token.value};
			case 'text':
				return {kind: 'text', value: cleanText(token.value)};
			case 'char':
				return this.charBase(token.value);
			case 'cmd':
				return this.commandBase(token.value);
		}
	}

	private charBase(value: string): MathBase | undefined {
		if (value === '{') {
			const body = this.row((token) => isChar(token, '}'));
			this.pos++;
			return {kind: 'group', body};
		}
		if (value === '(' || value === '[') return this.delimited(value, (token) => isChar(token, ')', ']'));
		if (value === '|') return this.closingBarAhead() ? this.delimited('|', (token) => isChar(token, '|')) : {kind: 'op', value: 'mid'};
		if (value === '}' || value === '&' || value === '~') return undefined;
		if (value === '%') return {kind: 'op', value: 'percent'};
		return {kind: 'op', value};
	}

	private delimited(open: string, closes: (token: Token) => boolean): MathBase {
		const body = this.row((token) => closes(token) || hardStop(token));
		const end = this.peek();
		let close = '';
		if (end && closes(end)) {
			this.pos++;
			close = end.type === 'cmd' ? (end.value === '}' ? '}' : '|') : end.value;
		}
		return {kind: 'delim', open, close, body};
	}

	/** "|AB|" or "|x - 3|": only when a matching bar follows at the same depth; a lone bar is "öyle ki". */
	private closingBarAhead(): boolean {
		let depth = 0;
		for (let i = this.pos; i < this.tokens.length; i++) {
			const token = this.tokens[i];
			if (isCmd(token, 'left')) {
				depth++;
				i++;
			} else if (isCmd(token, 'right')) {
				if (depth === 0) return false;
				depth--;
				i++;
			} else if (isChar(token, '{', '(', '[') || isCmd(token, '{')) depth++;
			else if (isChar(token, '}', ')', ']') || isCmd(token, '}')) {
				if (depth === 0) return false;
				depth--;
			} else if (depth === 0 && isChar(token, '|')) return true;
		}
		return false;
	}

	private delimiterAfterLeftRight(): string {
		const token = this.tokens[this.pos++];
		if (!token) return '';
		if (token.type === 'cmd') return {'{': '{', '}': '}', '|': '|', lvert: '|', rvert: '|', vert: '|', langle: '(', rangle: ')', lbrace: '{', rbrace: '}'}[token.value] ?? '';
		return token.value === '.' ? '' : token.value;
	}

	private commandBase(name: string): MathBase | undefined {
		if (FRACTIONS.has(name)) return {kind: 'frac', num: this.arg(), den: this.arg()};
		if (BINOMS.has(name)) return {kind: 'binom', top: this.arg(), bottom: this.arg()};
		if (name === 'sqrt') {
			let index: MathNode[] | undefined;
			if (isChar(this.peek(), '[')) {
				this.pos++;
				index = this.row((token) => isChar(token, ']'));
				this.pos++;
			}
			return {kind: 'sqrt', index, body: this.arg()};
		}
		if (ACCENTS.has(name)) return {kind: 'accent', name, body: this.arg()};
		if (name === 'pmod') return {kind: 'pmod', body: this.arg()};
		if (name === 'mathbb' || name === 'mathcal') {
			const [letter] = this.arg();
			if (letter?.kind === 'letter' && NUMBER_SETS[letter.value]) return {kind: 'numberSet', value: letter.value};
			return letter && letter.kind === 'letter' ? {kind: 'letter', value: letter.value} : undefined;
		}
		if (name === 'left') {
			const open = this.delimiterAfterLeftRight();
			const body = this.row((token) => isCmd(token, 'right'));
			let close = '';
			if (isCmd(this.peek(), 'right')) {
				this.pos++;
				close = this.delimiterAfterLeftRight();
			}
			return {kind: 'delim', open: open === '{' ? '{' : open, close, body};
		}
		if (name === 'right') {
			this.delimiterAfterLeftRight();
			return undefined;
		}
		if (name === 'not') {
			const next = this.peek();
			if (isCmd(next, 'in', 'subset', 'subseteq', 'equiv') || isChar(next, '=')) {
				this.pos++;
				return {kind: 'op', value: next?.value === '=' ? 'neq' : next?.value === 'equiv' ? 'notequiv' : next?.value === 'in' ? 'notin' : 'notsubset'};
			}
			return {kind: 'op', value: 'neg'};
		}
		if (name === '{' || name === 'lbrace') return this.delimited('{', (token) => isCmd(token, '}', 'rbrace'));
		if (name === '|') return this.delimited('|', (token) => isCmd(token, '|'));
		if (name === 'phantom' || name === 'hphantom' || name === 'vphantom') {
			this.arg();
			return undefined;
		}
		if (name === 'ell') return {kind: 'letter', value: 'l'};
		if (FUNCTION_WORDS[name]) return {kind: 'func', value: name};
		if (SYMBOL_WORDS[name]) return {kind: 'word', value: SYMBOL_WORDS[name]};
		if (COMMAND_OPS[name]) return {kind: 'op', value: COMMAND_OPS[name]};
		// Spacing (\, \quad), sizing (\big, \displaystyle) and anything unknown are not said.
		return undefined;
	}
}

// ─── Node helpers ────────────────────────────────────────────────────────────────────────────────────────────────

const plain = (node: MathNode | undefined): boolean => Boolean(node) && !node?.sub && !node?.sup && !node?.primes && !node?.factorial;
const isOp = (node: MathNode | undefined, ...values: string[]): node is Valued => node?.kind === 'op' && values.includes(node.value);
const isLetter = (node: MathNode | undefined, pattern: RegExp = /./): node is Valued => node?.kind === 'letter' && pattern.test(node.value);
const isParen = (node: MathNode | undefined): node is Delim => node?.kind === 'delim' && node.open === '(' && node.close === ')';
const isNumber = (nodes: MathNode[] | undefined, value: string): boolean => nodes?.length === 1 && nodes[0].kind === 'num' && nodes[0].value === value && plain(nodes[0]);
const isRelation = (node: MathNode | undefined): boolean => isOp(node, ...RELATIONS) || isOp(node, ',');

/** A sign alone in a script, "2^+", "0^{-}", "\mathbb{R}^+": the sign it carries, else undefined. */
const signOf = (nodes: MathNode[] | undefined): string | undefined =>
	nodes?.length === 1 && isOp(nodes[0], '+', '-', '−') ? (nodes[0].value === '+' ? '+' : '-') : undefined;

/**
 * A part read as more than one term: a sum, a relation, a fraction. For denominators, roots and powers a product
 * too, written ("6 · 8") or of brackets ("(x - 3)(x + 3)", "2(x + 1)").
 */
const compound = (nodes: MathNode[] | undefined, strict = false): boolean =>
	(nodes ?? []).some(
		(node, index, all) =>
			node.kind === 'frac' ||
			(strict && node.kind === 'delim' && node.open !== '|' && all.length > 1) ||
			(node.kind === 'op' && ((ADDITIVE.has(node.value) && index > 0) || RELATIONS.has(node.value) || node.value === '/' || node.value === 'div' || (strict && PRODUCTS.has(node.value)))),
	);

const LOGIC_OPS = ['wedge', 'vee', 'veebar', 'implies', 'iff', 'neg', 'forall', 'exists'];
/** A proposition: p, or anything joined by ∧, ∨, ⇒. */
const logical = (nodes: MathNode[]): boolean => deepSome(nodes, (node) => isOp(node, ...LOGIC_OPS)) || (nodes.length === 1 && isLetter(nodes[0], PROPOSITIONS));

/** Capital letters only ("ABC", "AB'"): points, said one by one. */
const pointLetters = (nodes: MathNode[]): boolean => nodes.length > 0 && nodes.every((node) => isLetter(node, /^[A-ZÇĞİÖŞÜ]$/) && !node.sub && !node.sup);

/** Whether any row of the tree, the formula itself or a part inside it, passes the test. */
const someRow = (nodes: MathNode[], test: (row: MathNode[]) => boolean): boolean =>
	test(nodes) ||
	nodes.some((node) => {
		const children = [node.sub, node.sup, 'body' in node ? node.body : undefined, 'num' in node ? node.num : undefined, 'den' in node ? node.den : undefined, 'index' in node ? node.index : undefined, 'top' in node ? node.top : undefined, 'bottom' in node ? node.bottom : undefined];
		return children.some((child) => child && someRow(child, test));
	});

const deepSome = (nodes: MathNode[], test: (node: MathNode) => boolean): boolean => someRow(nodes, (row) => row.some(test));

/** Sets, logic of events: ∪, ∈, ∅, or a probability P(A'), where A' is "A tümleyen". */
const aboutSets = (nodes: MathNode[]): boolean =>
	deepSome(nodes, (node) => (node.kind === 'word' && node.value === 'boş küme') || isOp(node, ...SET_OPS)) ||
	someRow(nodes, (row) => row.some((node, index) => isLetter(node, /^P$/) && isParen(row[index + 1]) && pointLetters((row[index + 1] as Delim).body.slice(0, 1))));

// ─── Reader ──────────────────────────────────────────────────────────────────────────────────────────────────────

const word = (text: string): Piece => ({text});
const PAUSE: Piece = {text: ','};

const spelled = (nodes: MathNode[], context: Context): Piece[] =>
	nodes.flatMap((node) => [{text: (node as Valued).value, letter: true}, ...(node.primes ? primeWords(node, context) : [])]);

const primeWords = (node: MathNode, context: Context): Piece[] => {
	const count = node.primes;
	if (node.kind === 'num') return [word(count === 1 ? 'dakika' : 'saniye')];
	if (node.kind === 'letter') {
		if (PROPOSITIONS.test(node.value)) return [word('değil')];
		if (DERIVED.test(node.value)) return [word(DERIVATIVE[count - 1] ?? 'türev')];
		if (/^\p{Lu}$/u.test(node.value) && context.sets) return [word('tümleyen')];
	}
	// (p ∧ q)' is "değili"; (x^n)' and (sin x)' are derivatives.
	if (node.kind === 'delim') return [word(logical(node.body) ? 'değili' : DERIVATIVE[count - 1] ?? 'türev')];
	return [word(count === 2 ? 'iki üssü' : 'üssü')];
};

const supWords = (node: MathNode, context: Context): Piece[] => {
	const sup = node.sup ?? [];
	if (sup.length === 1 && isOp(sup[0], 'circ')) return [word('derece')];
	if (isNumber(sup, '2')) return [word('kare')];
	if (isNumber(sup, '3')) return [word('küp')];
	if (node.kind === 'letter' && /^[fgh]$/.test(node.value) && sup.length === 2 && isOp(sup[0], '-', '−') && isNumber(sup.slice(1), '1')) return [word('tersi')];
	// An ion's charge: "Ca^{2+}" is "Ca 2 artı", "Cl^-" "Cl eksi".
	const charge = sup.at(-1);
	if (node.kind === 'text' && isOp(charge, '+', '-', '−') && sup.slice(0, -1).every((part) => part.kind === 'num')) return [...sup.slice(0, -1).map((part) => word((part as Valued).value)), word(charge.value === '+' ? 'artı' : 'eksi')];
	return [word('üssü'), ...read(sup, context), ...(compound(sup, true) ? [PAUSE] : [])];
};

/** A subscript; "x_{1,2}" names two roots, "x bir, iki", not a decimal. */
const subWords = (sub: MathNode[], context: Context): Piece[] => {
	const [only] = sub;
	if (sub.length === 1 && only.kind === 'num' && only.value.includes(',') && plain(only)) return only.value.split(',').flatMap((part, index) => [...(index ? [PAUSE] : []), word(part)]);
	return [...read(sub, context), ...(compound(sub) ? [PAUSE] : [])];
};

const scriptWords = (node: MathNode, context: Context): Piece[] => [
	...(node.primes ? primeWords(node, context) : []),
	...(node.sub ? subWords(node.sub, context) : []),
	...(node.sup ? supWords(node, context) : []),
	...Array.from({length: node.factorial}, () => word('faktöriyel')),
];

/** "\frac{d}{dx}" is "x'e göre türev", "\frac{dy}{dx}" "y'nin x'e göre türevi". */
const derivativeOperator = (num: MathNode[], den: MathNode[]): Piece[] | undefined => {
	const isD = (node: MathNode | undefined) => (node?.kind === 'letter' || node?.kind === 'text') && node.value.trim() === 'd' && plain(node);
	if (den.length !== 2 || !isD(den[0]) || !isLetter(den[1])) return undefined;
	const by = suffixed(den[1].value, 'dative');
	if (num.length === 1 && isD(num[0])) return [word(`${by} göre türev`)];
	if (num.length === 2 && isD(num[0]) && isLetter(num[1])) return [word(`${suffixed(num[1].value, 'genitive')} ${by} göre türevi`)];
	return undefined;
};

const readNode = (node: MathNode, context: Context): Piece[] => {
	const own = ((): Piece[] => {
		switch (node.kind) {
			case 'num':
				return [{text: node.value, atom: true, glue: !node.space, number: true}];
			case 'letter':
				return [{text: node.value, atom: true, glue: !node.space, letter: true}];
			case 'word':
				return [word(node.value)];
			case 'text':
				return [word(node.value.trim())];
			case 'numberSet': {
				const sign = signOf(node.sup);
				if (node.primes && node.value === 'Q') return [word('irrasyonel sayılar')];
				return [word(sign ? signedSet(node.value, sign) : NUMBER_SETS[node.value])];
			}
			case 'op':
				return [word(OP_WORDS[node.value] ?? node.value)];
			case 'func':
				return [word(FUNCTION_WORDS[node.value])];
			case 'group':
				return read(node.body, context);
			case 'delim':
				return delimWords(node, context);
			case 'frac': {
				const operator = derivativeOperator(node.num, node.den);
				if (operator) return operator;
				const [num, den] = [read(node.num, context), read(node.den, context)];
				if (compound(node.num) || compound(node.den, true)) return [word('kesrin payı'), ...num, PAUSE, word('paydası'), ...den, PAUSE];
				return [...num, word('bölü'), ...den];
			}
			case 'sqrt':
				return sqrtWords(node, context);
			case 'accent':
				return accentWords(node, context);
			case 'binom':
				return [word('C'), ...read(node.top, context), ...read(node.bottom, context)];
			case 'pmod':
				return [word('mod'), ...read(node.body, context)];
		}
	})();
	if (node.kind === 'numberSet') return [...own, ...(node.sub ? read(node.sub, context) : [])];
	// What follows a script starts a new word: X^aY is "X üssü a Y" (inside it, "F_{net}" stays "F net").
	const scripts = scriptWords(node, context);
	if (scripts.length > 0) scripts[scripts.length - 1] = {...scripts[scripts.length - 1], atom: false};
	return [...own, ...scripts];
};

const sqrtWords = (node: Extract<MathNode, {kind: 'sqrt'}>, context: Context): Piece[] => {
	const index = node.index ?? [];
	let name: Piece[];
	if (index.length === 0 || isNumber(index, '2')) name = [word('karekök')];
	else if (isNumber(index, '3')) name = [word('küpkök')];
	else if (index.length === 1 && index[0].kind === 'num') name = [word(`${index[0].value}.`), word('dereceden kök')];
	else if (index.length === 1 && isLetter(index[0])) name = [word(suffixed(index[0].value, 'ordinal')), word('dereceden kök')];
	else name = [...read(index, context), word('dereceden kök')];
	// "\sqrt{x + 1}" is "karekök içinde x artı 1": "karekök x artı 1" would be √x + 1.
	return compound(node.body, true) ? [...name, word('içinde'), ...read(node.body, context), PAUSE] : [...name, ...read(node.body, context)];
};

const accentWords = (node: Extract<MathNode, {kind: 'accent'}>, context: Context): Piece[] => {
	const body = node.body;
	switch (node.name) {
		case 'overline':
		case 'bar':
			// A repeating decimal, 0,\overline{36}: "36 devirli"; a number written in letters, \overline{AB}: "A B"; a conjugate, \overline{z}: "z eşleniği".
			if (body.length > 0 && body.every((part) => part.kind === 'num')) return [word(body.map((part) => (part as Valued).value).join('')), word('devirli')];
			if (body.length > 1 && body.every((part) => isLetter(part) && plain(part))) return spelled(body, context);
			// Digits and letters together, \overline{4a73b}: each one on its own, "4 a 7 3 b", not "4a73b".
			if (body.length > 1 && body.some((part) => isLetter(part)) && body.every((part) => plain(part) && (part.kind === 'num' ? /^\d+$/.test((part as Valued).value) : isLetter(part))))
				return body.flatMap((part): Piece[] => (part.kind === 'num' ? [...part.value].map((digit) => word(digit)) : [{text: (part as Valued).value, letter: true}]));
			if (body.length === 1 && isLetter(body[0], /^[a-z]$/)) return [word(body[0].value), word('eşleniği')];
			return read(body, context);
		case 'widehat':
		case 'hat':
			return [...(body.every((part) => isLetter(part)) ? spelled(body, context) : read(body, context)), word('açısı')];
		case 'vec':
		case 'overrightarrow':
			return [...(pointLetters(body) ? spelled(body, context) : read(body, context)), word('vektörü')];
		case 'underbrace':
		case 'overbrace':
			return [...read(body, context), PAUSE];
		default:
			return read(body, context);
	}
};

const splitAtComma = (nodes: MathNode[]): MathNode[][] => {
	const parts: MathNode[][] = [[]];
	for (const node of nodes) {
		if (isOp(node, ',')) parts.push([]);
		else parts[parts.length - 1].push(node);
	}
	return parts;
};

const delimWords = (node: Delim, context: Context): Piece[] => {
	const {open, close, body} = node;
	if (open === '|') {
		// |AB| is a length, "A B uzunluğu"; anything else an absolute value.
		if (body.length === 2 && pointLetters(body)) return [...spelled(body, context), word('uzunluğu')];
		// |\vec{u}|: "u vektörünün uzunluğu".
		if (body.length === 1 && body[0].kind === 'accent' && ['vec', 'overrightarrow'].includes(body[0].name)) return [...withSuffix(readNode(body[0], context), 'genitive'), word('uzunluğu')];
		return [word('mutlak değer'), ...read(body, context), PAUSE];
	}
	if (open === '{' || open === '') return read(body, context);
	if (open === '[' && pointLetters(body) && body.length >= 2) {
		// [AB] is a segment, "A B"; [AB with no closing bracket a ray, "A B ışını".
		return close === ']' ? spelled(body, context) : [...spelled(body, context), word('ışını')];
	}
	const interval = intervalWords(node, context);
	if (interval) return interval;
	return [word('parantez içinde'), ...read(body, context), ...(close ? [PAUSE] : [])];
};

/** [a, b) is "a kapalı b açık aralığı", [a, b] "a, b kapalı aralığı", (2, ∞) "2, sonsuz açık aralığı". */
const intervalWords = (node: Delim, context: Context, before?: MathNode): Piece[] | undefined => {
	const {open, close, body} = node;
	if (!'(['.includes(open) || !')]'.includes(close) || !close || !open) return undefined;
	const parts = splitAtComma(body);
	if (parts.length !== 2 || parts.some((part) => part.length === 0)) return undefined;
	const infinite = deepSome(body, (part) => part.kind === 'word' && part.value === 'sonsuz');
	if (!(open === '[' || close === ']' || infinite || isOp(before, 'in', 'notin', 'subset'))) return undefined;
	const [left, right] = parts.map((part) => read(part, context));
	const leftClosed = open === '[';
	const rightClosed = close === ']';
	if (leftClosed === rightClosed) return [...left, PAUSE, ...right, word(leftClosed ? 'kapalı aralığı' : 'açık aralığı'), PAUSE];
	return [...left, word(leftClosed ? 'kapalı' : 'açık'), ...right, word(rightClosed ? 'kapalı' : 'açık'), word('aralığı'), PAUSE];
};

/** A function's argument, said without "parantez içinde": f(2) is "f 2"; a compound one ends with a pause, "f x artı 1,". */
const argumentWords = (paren: Delim, context: Context): Piece[] => [
	...read(paren.body, context),
	...(compound(paren.body) ? [PAUSE] : []),
	...scriptWords(paren, context),
];

/** Readings that take more than one node. Each returns the words and how many nodes it used. */
type Special = (nodes: MathNode[], i: number, context: Context) => {pieces: Piece[]; used: number} | undefined;

const SPECIALS: Special[] = [
	// m(\widehat{ABC}): "A B C açısı".
	(nodes, i, context) => {
		const [m, paren] = [nodes[i], nodes[i + 1]];
		if (!isLetter(m, /^m$/) || !plain(m) || !isParen(paren) || paren.body.length !== 1) return undefined;
		const accent = paren.body[0];
		if (accent.kind !== 'accent' || !['widehat', 'hat'].includes(accent.name)) return undefined;
		return {pieces: readNode(accent, context), used: 2};
	},
	// f(x), f'(x), f^{-1}(7): "f x", "f türev x", "f tersi 7".
	(nodes, i, context) => {
		const [name, paren] = [nodes[i], nodes[i + 1]];
		if (!isLetter(name, FUNCTION_LETTERS) || !isParen(paren)) return undefined;
		// "af(x)" is a product, not a function.
		if (!name.space && nodes[i - 1]?.kind === 'letter') return undefined;
		const derivative = name.primes ? [word(DERIVATIVE[name.primes - 1] ?? 'türev')] : [];
		const head = [word(name.value), ...derivative, ...scriptWords({...name, primes: 0}, context)];
		// A conditional probability, P(A | B): "P A, B verilmişken".
		const given = name.value === 'P' ? paren.body.findIndex((part) => isOp(part, 'mid')) : -1;
		if (given > 0) return {pieces: [...head, ...read(paren.body.slice(0, given), context), PAUSE, ...read(paren.body.slice(given + 1), context), word('verilmişken'), PAUSE], used: 2};
		return {pieces: [...head, ...argumentWords(paren, context)], used: 2};
	},
	// (f ∘ g)(2), (f · g)'(x): the second bracket is the argument.
	(nodes, i, context) => {
		const [group, paren] = [nodes[i], nodes[i + 1]];
		if (!isParen(group) || !deepSome(group.body, (part) => isLetter(part, /^[fgh]$/))) return undefined;
		if (!isParen(paren) && !group.primes) return undefined;
		const head = [word('parantez içinde'), ...read(group.body, context), PAUSE, ...(group.primes ? [word(DERIVATIVE[group.primes - 1] ?? 'türev')] : []), ...scriptWords({...group, primes: 0}, context)];
		return isParen(paren) ? {pieces: [...head, ...argumentWords(paren, context)], used: 2} : {pieces: head, used: 1};
	},
	// \lim_{x \to 2}: "x 2'ye giderken limit".
	(nodes, i, context) => {
		const lim = nodes[i];
		if (lim.kind !== 'func' || lim.value !== 'lim') return undefined;
		const arrow = (lim.sub ?? []).findIndex((part) => isOp(part, 'to'));
		const approach = lim.sub && arrow > 0 ? approachWords(lim.sub.slice(0, arrow), lim.sub.slice(arrow + 1), context) : lim.sub ? read(lim.sub, context) : [];
		return {pieces: [...approach, word('limit')], used: 1};
	},
	// \int_0^1 x^2\,dx: "0'dan 1'e x kare dx'in integrali".
	(nodes, i, context) => {
		const integral = nodes[i];
		if (integral.kind !== 'func' || !INTEGRALS.has(integral.value)) return undefined;
		const bounds = [...(integral.sub ? withSuffix(read(integral.sub, context), 'ablative') : []), ...(integral.sup ? withSuffix(read(integral.sup, context), 'dative') : [])];
		for (let j = i + 1; j < nodes.length - 1; j++) {
			const [d, variable] = [nodes[j], nodes[j + 1]];
			const isD = (d.kind === 'letter' || d.kind === 'text') && d.value.trim() === 'd' && plain(d);
			if (isD && (variable.kind === 'letter' || variable.kind === 'word') && !variable.space) {
				const differential = variable.kind === 'letter' ? suffixed(`d${variable.value}`, 'genitive') : `d ${suffixed(variable.value, 'genitive')}`;
				return {pieces: [...bounds, ...read(nodes.slice(i + 1, j), context), word(differential), word('integrali')], used: j + 2 - i};
			}
			if (isRelation(nodes[j])) break;
		}
		return {pieces: [...bounds, word('integral')], used: 1};
	},
	// \sum_{k=1}^{n}: "k eşittir 1'den n'e toplam".
	(nodes, i, context) => {
		const sum = nodes[i];
		if (sum.kind !== 'func' || (sum.value !== 'sum' && sum.value !== 'prod')) return undefined;
		const from = sum.sub ? withSuffix(read(sum.sub, context), 'ablative') : [];
		const to = sum.sup ? withSuffix(read(sum.sup, context), 'dative') : [];
		return {pieces: [...from, ...to, word(FUNCTION_WORDS[sum.value])], used: 1};
	},
	// \log_2 8, \ln x, \sin^2 x, \sin(2x): "log 2 tabanında 8", "l n x", "sinüs kare x", "sinüs 2x".
	(nodes, i, context) => {
		const func = nodes[i];
		if (func.kind !== 'func' || !(TRIGONOMETRY.has(func.value) || ['log', 'lg', 'ln', 'exp'].includes(func.value))) return undefined;
		const inverse = func.sup?.length === 2 && isOp(func.sup[0], '-', '−') && isNumber(func.sup.slice(1), '1') && ARC[func.value];
		const name = inverse ? [word(FUNCTION_WORDS[ARC[func.value]])] : [word(FUNCTION_WORDS[func.value])];
		const base = func.sub ? [...read(func.sub, context), word('tabanında')] : [];
		const power = func.sup && !inverse ? supWords({...func, kind: 'func'}, context) : [];
		const paren = nodes[i + 1];
		const argument = isParen(paren) ? argumentWords(paren, context) : [];
		return {pieces: [...name, ...power, ...base, ...argument, ...Array.from({length: func.factorial}, () => word('faktöriyel'))], used: isParen(paren) ? 2 : 1};
	},
	// 0,1\overline{6} and 2,\overline{3}: "0,16 devirli", "2,3 devirli".
	(nodes, i) => {
		const [number, comma, bar] = [nodes[i], nodes[i + 1], nodes[i + 2]];
		const repeating = (node: MathNode | undefined) => node?.kind === 'accent' && ['overline', 'bar'].includes(node.name) && !node.space && node.body.length > 0 && node.body.every((part) => part.kind === 'num');
		if (number?.kind !== 'num' || !plain(number)) return undefined;
		const digits = (node: MathNode) => (node as Extract<MathNode, {kind: 'accent'}>).body.map((part) => (part as Valued).value).join('');
		if (repeating(comma)) return {pieces: [{text: `${number.value}${digits(comma)}`, atom: true, glue: !number.space, number: true}, word('devirli')], used: 2};
		if (isOp(comma, ',') && !comma.space && repeating(bar)) return {pieces: [{text: `${number.value},${digits(bar)}`, atom: true, glue: !number.space, number: true}, word('devirli')], used: 3};
		return undefined;
	},
	// 20\%, \%20: "yüzde 20".
	(nodes, i, context) => {
		const [first, second] = [nodes[i], nodes[i + 1]];
		if (isOp(second, 'percent') && first.kind !== 'op') return {pieces: [word('yüzde'), ...readNode({...first, space: true}, context)], used: 2};
		if (isOp(first, 'percent') && second?.kind === 'num') return {pieces: [word('yüzde'), ...readNode({...second, space: true}, context)], used: 2};
		return undefined;
	},
	// f: A → B: "f, A'dan B'ye".
	(nodes, i, context) => {
		if (!isOp(nodes[i], ':')) return undefined;
		const arrow = nodes.findIndex((node, index) => index > i && isOp(node, 'to'));
		if (arrow < i + 2 || nodes.slice(i + 1, arrow).some(isRelation)) return undefined;
		let end = arrow + 1;
		while (end < nodes.length && !isRelation(nodes[end])) end++;
		if (end === arrow + 1) return undefined;
		const [from, to] = [read(nodes.slice(i + 1, arrow), context), read(nodes.slice(arrow + 1, end), context)];
		return {pieces: [PAUSE, ...withSuffix(from, 'ablative'), ...withSuffix(to, 'dative')], used: end - i};
	},
	// x → 2 outside a limit: "x 2'ye giderken". Otherwise an arrow is "ise" ("a = 7 → b = 8").
	(nodes, i, context) => {
		if (!isOp(nodes[i], 'to')) return undefined;
		let end = i + 1;
		while (end < nodes.length && !isRelation(nodes[end])) end++;
		const [variable, right] = [nodes[i - 1], nodes.slice(i + 1, end)];
		const alone = i === 1 || isRelation(nodes[i - 2]);
		if (alone && isLetter(variable, /^[a-z]$/) && plain(variable) && right.length > 0) return {pieces: approachWords([], right, context), used: end - i};
		return undefined;
	},
	// F ∝ q₁q₂/d²: "F, q 1 q 2 bölü d kare ile orantılıdır"; "∝ 1/a" alone, "1 bölü a ile orantılıdır".
	(nodes, i, context) => {
		if (!isOp(nodes[i], 'propto')) return undefined;
		let end = i + 1;
		while (end < nodes.length && !isRelation(nodes[end])) end++;
		if (end === i + 1) return undefined;
		return {pieces: [...(i > 0 ? [PAUSE] : []), ...read(nodes.slice(i + 1, end), context), word('ile orantılıdır')], used: end - i};
	},
	// \triangle ABC, \angle ABC: "A B C üçgeni", "A B C açısı". Between two numbers \triangle is an operation, "üçgen".
	(nodes, i, context) => {
		const symbol = nodes[i];
		if (!isOp(symbol, 'triangle', 'angle')) return undefined;
		if (symbol.value === 'triangle' && i > 0 && nodes[i - 1].kind !== 'op') return undefined;
		let end = i + 1;
		while (end < nodes.length && isLetter(nodes[end], /^\p{Lu}$/u) && (end === i + 1 || !nodes[end].space)) end++;
		if (end === i + 1) return undefined;
		return {pieces: [...spelled(nodes.slice(i + 1, end), context), word(symbol.value === 'triangle' ? 'üçgeni' : 'açısı')], used: end - i};
	},
	// \neg p: "p değil".
	(nodes, i, context) => (isOp(nodes[i], 'neg') && nodes[i + 1] ? {pieces: [...readNode(nodes[i + 1], context), word('değil')], used: 2} : undefined),
	// \text{der}[P(x)]: "P x'in derecesi"; \text{Re}(z): "z'nin reel kısmı".
	(nodes, i, context) => {
		const [name, bracket] = [nodes[i], nodes[i + 1]];
		if (name.kind !== 'text' || bracket?.kind !== 'delim' || !bracket.close) return undefined;
		const label = {der: 'derecesi', Re: 'reel kısmı', Im: 'sanal kısmı'}[name.value.trim()];
		if (!label) return undefined;
		return {pieces: [...withSuffix(read(bracket.body, context), 'genitive'), word(label)], used: 2};
	},
	// A nuclide, numbers written before the symbol: {}^{14}C is "14 C", {}_{12}Mg "12 Mg", {}^{23}_{11}Na
	// "kütle numarası 23, atom numarası 11 olan Na".
	(nodes, i, context) => {
		const [numbers, element] = [nodes[i], nodes[i + 1]];
		if (numbers.kind !== 'group' || numbers.body.length > 0 || element?.kind !== 'text' || (!numbers.sub && !numbers.sup)) return undefined;
		if (numbers.sup?.some((part) => isOp(part, 'circ'))) return undefined;
		const named = numbers.sub && numbers.sup ? [word('kütle numarası'), ...read(numbers.sup, context), PAUSE, word('atom numarası'), ...read(numbers.sub, context), word('olan')] : read(numbers.sup ?? numbers.sub ?? [], context);
		return {pieces: [...named, ...readNode(element, context)], used: 2};
	},
	// Chemistry: a state after a species, (g) "gaz", (suda) "suda".
	(nodes, i, context) => {
		const state = nodes[i];
		if (!context.chem || !isParen(state) || state.body.length < 1) return undefined;
		const label = state.body.map((part) => ('value' in part ? part.value : '')).join('').trim();
		return STATES[label] ? {pieces: [word(STATES[label])], used: 1} : undefined;
	},
	// Chemistry: "+" between species is "ve".
	(nodes, i, context) => (context.chem && isOp(nodes[i], '+') && i > 0 ? {pieces: [word('ve')], used: 1} : undefined),
	// A bracket after "∈" may be an interval: x ∈ (2, 5).
	(nodes, i, context) => {
		const node = nodes[i];
		if (node.kind !== 'delim' || !isOp(nodes[i - 1], 'in', 'notin', 'subset')) return undefined;
		const interval = intervalWords(node, context, nodes[i - 1]);
		return interval ? {pieces: interval, used: 1} : undefined;
	},
];

/**
 * The imaginary unit is said on its own: "3 + 4i" is "3 artı 4 i", "a + bi" "a artı b i". Only an i that ends a
 * short run: in a word ("d_{erime}") it is a letter.
 */
const imaginaryUnit = (nodes: MathNode[], i: number): boolean => {
	const node = nodes[i];
	if (!isLetter(node, /^i$/) || node.space || (isLetter(nodes[i + 1]) && !nodes[i + 1].space)) return false;
	let run = 0;
	for (let j = i - 1; j >= 0 && (nodes[j].kind === 'letter' || nodes[j].kind === 'num') && plain(nodes[j]); j--) {
		run++;
		if (nodes[j].space) break;
	}
	return run > 0 && run <= 2;
};

/** x → 2⁺: "x 2'ye sağdan giderken". */
const approachWords = (variable: MathNode[], target: MathNode[], context: Context): Piece[] => {
	const last = target.at(-1);
	const sign = signOf(last?.sup);
	const side = sign ? [word(sign === '+' ? 'sağdan' : 'soldan')] : [];
	const goal = sign && last ? [...target.slice(0, -1), {...last, sup: undefined}] : target;
	return [...read(variable, context), ...withSuffix(read(goal, context), 'dative'), ...side, word('giderken')];
};

const read = (nodes: MathNode[], context: Context): Piece[] => {
	const out: Piece[] = [];
	for (let i = 0; i < nodes.length; ) {
		const special = specialAt(nodes, i, context);
		if (special) {
			out.push(...special.pieces);
			i += special.used;
			continue;
		}
		const pieces = readNode(nodes[i], context);
		if (imaginaryUnit(nodes, i)) pieces[0] = {...pieces[0], glue: false};
		out.push(...pieces);
		i++;
	}
	// A part read on its own (a subscript, the second number of a combination) never runs into what came before:
	// L_K is "L K", \binom{3}{2} "C 3 2".
	if (out[0]?.glue) out[0] = {...out[0], glue: false};
	return out;
};

const specialAt = (nodes: MathNode[], i: number, context: Context): {pieces: Piece[]; used: number} | undefined => {
	for (const special of SPECIALS) {
		const found = special(nodes, i, context);
		if (found) return found;
	}
	return undefined;
};

// ─── Joining ─────────────────────────────────────────────────────────────────────────────────────────────────────

/** Letters right after a number that the unit rules would take for a unit: "2m" is "iki m", not "2 metre". */
const UNIT_LETTERS = /^(?:mm|km|cm|kg|dk|sn|m)$/;

const join = (pieces: Piece[], sayNumber?: (digits: string) => string): string => {
	const said = pieces.filter((piece) => piece.text);
	let text = '';
	let lastAtom = false;
	said.forEach((piece, index) => {
		let value = piece.text;
		let atom = Boolean(piece.atom);
		if (piece.number && sayNumber) {
			let letters = '';
			for (let next = index + 1; next < said.length && said[next].letter && (next === index + 1 || said[next].glue); next++) letters += said[next].text;
			if (UNIT_LETTERS.test(letters)) {
				value = sayNumber(value);
				atom = false;
			}
		}
		text += (text && !(piece.glue && lastAtom) ? ' ' : '') + value;
		lastAtom = atom;
	});
	return text
		.replace(/\s+/g, ' ')
		.replace(/\s+([,.:;!?])/g, '$1')
		.replace(/,\s*(?=[,.:;!?])/g, '')
		.replace(/^[,\s]+/, '')
		.trim();
};

/**
 * The formula as a teacher reads it. A pause (",") closes a bracket, a compound fraction, root or power, and is
 * kept at the end too: in "$(a + b)$ ifadesi" it marks where the formula stops.
 */
export const readMath = (latex: string, options: MathSpeechOptions = {}): string => {
	// "0{,}25" and "0{,}\overline{3}": the braces only keep KaTeX from spacing the decimal comma.
	const nodes = new Parser(tokenize(latex.replace(/\{\s*,\s*\}/g, ','))).parse();
	const sets = Boolean(options.sets) || aboutSets(nodes);
	// A reaction, "CaCO_3 → CaO + CO_2": "CaCO 3'ten CaO ve CO 2 oluşur".
	const arrow = nodes.findIndex((node) => isOp(node, 'to'));
	const chem = arrow > 0 && nodes.filter((node) => isOp(node, 'to')).length === 1 && nodes.some((node) => node.kind === 'text');
	const context: Context = {sets, chem};
	if (chem) return join([...withSuffix(read(nodes.slice(0, arrow), context), 'ablative'), ...read(nodes.slice(arrow + 1), context), word('oluşur')], options.sayNumber);
	return join(read(nodes, context), options.sayNumber);
};
