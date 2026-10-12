import katex from 'katex';
import React, {useMemo} from 'react';
import {KATEX_OPTIONS} from '../../Schemas/RichText';

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
		() => katex.renderToString(latex, {...KATEX_OPTIONS, throwOnError: false, displayMode: display}),
		[latex, display],
	);

	return display ? (
		<div style={{margin: '0.35em 0', ...style}} dangerouslySetInnerHTML={{__html: html}} />
	) : (
		<span style={{whiteSpace: 'nowrap', ...style}} dangerouslySetInnerHTML={{__html: html}} />
	);
};
