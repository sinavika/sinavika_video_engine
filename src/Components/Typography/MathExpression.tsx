import katex from 'katex';
import React, {useMemo} from 'react';
import {KATEX_OPTIONS, normalizeLatex} from '../../Schemas/RichText';

type MathExpressionProps = {
	latex: string;
	/** Display mode: centred on its own line with full-size operators. */
	display?: boolean;
	style?: React.CSSProperties;
};

/**
 * Renders LaTeX with KaTeX. Formulas are validated by the schemas before a
 * render starts, so `throwOnError: false` here is only a last line of defence.
 */
export const MathExpression: React.FC<MathExpressionProps> = ({latex, display = false, style}) => {
	const html = useMemo(
		() => katex.renderToString(normalizeLatex(latex), {...KATEX_OPTIONS, throwOnError: false, displayMode: display}),
		[latex, display],
	);

	// KaTeX reports a root's box about 0.1em narrower than the radical it draws. In a box that hugs its text (an
	// option, 3√2) the overflow read as text cut off, and the fitting box shrank the whole question to half size
	// (GEO 5, 3.2). Sub- and superscripts overhang the same way ($d_K > d_L > d_M$ as an option, FIZ 2, 2.3). A
	// little room after the formula keeps them inside its own box.
	const tail = /\\sqrt|[_^]/.test(latex) ? {paddingRight: '0.15em'} : undefined;
	return display ? (
		<div style={{margin: '0.35em 0', ...tail, ...style}} dangerouslySetInnerHTML={{__html: html}} />
	) : (
		<span style={{whiteSpace: 'nowrap', ...tail, ...style}} dangerouslySetInnerHTML={{__html: html}} />
	);
};
