/**
 * Finds exports nobody imports: exported names in src/ that no other module
 * (src, scripts, tests) imports. Each is either dead (not used at all) or
 * only used inside its own file (the `export` is not needed).
 *
 *   npm run dead-code            the report
 *   npm run dead-code -- --fix   also drops the needless `export` keywords
 *   npm run dead-code -- --fix --skip src/UIUX,src/Schemas/SpokenText.ts   leaves those paths alone
 *
 * It reads the syntax tree, not text: a local `ease` in one file does not
 * count as a use of another file's `ease`, and comments and strings are
 * ignored. `tests/Architecture.test.ts` keeps the report empty.
 */
import {existsSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export type DeadExport = {file: string; name: string; usedInOwnFile: boolean};

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = /\.tsx?$/;

const listFiles = (directory: string): string[] =>
	existsSync(directory)
		? readdirSync(directory).flatMap((name) => {
				const full = path.join(directory, name);
				return statSync(full).isDirectory() ? listFiles(full) : SOURCE.test(name) ? [full] : [];
			})
		: [];

const resolveModule = (from: string, specifier: string): string | undefined => {
	if (!specifier.startsWith('.')) return undefined;
	const base = path.resolve(path.dirname(from), specifier);
	return [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
};

const hasExport = (node: ts.Node): boolean => ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
const isDefault = (node: ts.Node): boolean => ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

/** The names a file exports by declaration (`export const a`, `export type B` …), with the node that carries `export`. */
const exportedDeclarations = (source: ts.SourceFile): {name: string; node: ts.Node}[] =>
	source.statements.flatMap((statement): {name: string; node: ts.Node}[] => {
		if (!hasExport(statement) || isDefault(statement)) return [];
		if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.filter((d) => ts.isIdentifier(d.name)).map((d) => ({name: (d.name as ts.Identifier).text, node: statement}));
		if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isEnumDeclaration(statement)) && statement.name) {
			return [{name: statement.name.text, node: statement}];
		}
		return [];
	});

/** Every name one file takes from another: named imports, `import('…').Name` types, and a whole module for `import *` / `export *`. */
const importsOf = (file: string, source: ts.SourceFile): {module: string; names: Set<string> | 'all'}[] => {
	const found: {module: string; names: Set<string> | 'all'}[] = [];
	const visit = (node: ts.Node) => {
		if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
			const module = resolveModule(file, node.moduleSpecifier.text);
			if (module) {
				if (ts.isImportDeclaration(node)) {
					const bindings = node.importClause?.namedBindings;
					if (bindings && ts.isNamespaceImport(bindings)) found.push({module, names: 'all'});
					else if (bindings && ts.isNamedImports(bindings)) found.push({module, names: new Set(bindings.elements.map((element) => (element.propertyName ?? element.name).text))});
				} else {
					const clause = node.exportClause;
					if (!clause) found.push({module, names: 'all'});
					else if (ts.isNamedExports(clause)) found.push({module, names: new Set(clause.elements.map((element) => (element.propertyName ?? element.name).text))});
				}
			}
		}
		if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
			const module = resolveModule(file, node.argument.literal.text);
			const qualifier = node.qualifier && ts.isIdentifier(node.qualifier) ? node.qualifier.text : undefined;
			if (module && qualifier) found.push({module, names: new Set([qualifier])});
		}
		if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
			const module = resolveModule(file, node.arguments[0].text);
			if (module) found.push({module, names: 'all'});
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
	return found;
};

/** How often a name appears as an identifier in a file, its own declarations left out. */
const identifierUses = (source: ts.SourceFile, name: string, declaration: ts.Node): number => {
	let count = 0;
	const declared = new Set<ts.Node>();
	if (ts.isVariableStatement(declaration)) declaration.declarationList.declarations.forEach((d) => declared.add(d.name));
	else if ('name' in declaration && declaration.name) declared.add(declaration.name as ts.Node);
	const visit = (node: ts.Node) => {
		if (ts.isIdentifier(node) && node.text === name && !declared.has(node)) count++;
		ts.forEachChild(node, visit);
	};
	visit(source);
	return count;
};

const parse = (file: string) => ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

/** Exports in src/ that no other module imports. */
export const findDeadExports = (root = ROOT): DeadExport[] => {
	const sources = listFiles(path.join(root, 'src'));
	const consumers = [...sources, ...listFiles(path.join(root, 'scripts')), ...listFiles(path.join(root, 'tests')), path.join(root, 'remotion.config.ts')].filter((file) => existsSync(file));
	const parsed = new Map(consumers.map((file) => [file, parse(file)]));
	const imported = new Map<string, Set<string> | 'all'>();
	for (const [file, source] of parsed) {
		for (const {module, names} of importsOf(file, source)) {
			if (module === file) continue;
			const known = imported.get(module);
			if (known === 'all' || names === 'all') imported.set(module, 'all');
			else imported.set(module, new Set([...(known ?? []), ...names]));
		}
	}
	return sources.flatMap((file) => {
		const source = parsed.get(file)!;
		const names = imported.get(file);
		if (names === 'all') return [];
		return exportedDeclarations(source)
			.filter(({name}) => !names?.has(name))
			.map(({name, node}) => ({file: path.relative(root, file).replaceAll('\\', '/'), name, usedInOwnFile: identifierUses(source, name, node) > 0}));
	});
};

/** Drops `export` from declarations only their own file uses. */
const dropNeedlessExports = (dead: DeadExport[], root = ROOT): number => {
	const byFile = new Map<string, DeadExport[]>();
	for (const entry of dead.filter((item) => item.usedInOwnFile)) byFile.set(entry.file, [...(byFile.get(entry.file) ?? []), entry]);
	let changed = 0;
	for (const [file, entries] of byFile) {
		const full = path.join(root, file);
		const source = parse(full);
		const names = new Set(entries.map((entry) => entry.name));
		// Edit from the end so earlier positions stay valid.
		const cuts = exportedDeclarations(source)
			.filter(({name}) => names.has(name))
			.map(({node}) => (ts.getModifiers(node as ts.HasModifiers) ?? []).find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)!)
			.filter((modifier, index, all) => all.indexOf(modifier) === index)
			.sort((a, b) => b.getStart(source) - a.getStart(source));
		let text = source.getFullText();
		for (const modifier of cuts) {
			const start = modifier.getStart(source);
			text = text.slice(0, start) + text.slice(modifier.getEnd()).replace(/^\s+/, '');
			changed++;
		}
		writeFileSync(full, text);
	}
	return changed;
};

if (import.meta.main) {
	const dead = findDeadExports();
	const unused = dead.filter((entry) => !entry.usedInOwnFile);
	const internal = dead.filter((entry) => entry.usedInOwnFile);
	console.log(`Kullanılmayan dışa aktarım: ${unused.length}`);
	unused.forEach((entry) => console.log(`  ${entry.file}: ${entry.name}`));
	console.log(`Yalnız kendi dosyasında kullanılan (export gereksiz): ${internal.length}`);
	// --skip src/UIUX,src/Services/Social… leaves files another piece of work owns.
	const skipIndex = process.argv.indexOf('--skip');
	const skip = skipIndex > 0 ? (process.argv[skipIndex + 1] ?? '').split(',').filter(Boolean) : [];
	const fixable = internal.filter((entry) => !skip.some((prefix) => entry.file.startsWith(prefix)));
	if (process.argv.includes('--fix')) console.log(`export kaldırıldı: ${dropNeedlessExports(fixable)}`);
	else internal.forEach((entry) => console.log(`  ${entry.file}: ${entry.name}`));
}
