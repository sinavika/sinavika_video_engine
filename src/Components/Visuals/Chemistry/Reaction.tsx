// Registers \ce with KaTeX; without it a reaction is printed as raw "\ce{…}" source.
import 'katex/contrib/mhchem';
import katex from 'katex';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {KATEX_OPTIONS} from '../../../Schemas/RichText';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';

type Reaction = Extract<CourseVisual, {kind: 'reaction'}>;

/**
 * A reaction equation, set by KaTeX's mhchem: subscripts, arrows and states come out right without LaTeX.
 * A long equation (an esterification with four species) is scaled down to the box instead of being cut at its
 * edges. The card is measured at its own width (layout sizes ignore transforms, so the scale never feeds back
 * into the measure) and shrunk with a transform; FitBox's zoom is not used because KaTeX misreports widths under it.
 */
export const ReactionVisual: React.FC<VisualBoxProps & {visual: Reaction}> = ({visual, width, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.5);
	const html = useMemo(() => katex.renderToString(`\\ce{${visual.equation}}`, {...KATEX_OPTIONS, throwOnError: false, displayMode: true}), [visual.equation]);
	const cardRef = useRef<HTMLDivElement>(null);
	const [fit, setFit] = useState({scale: 1, height: 0});
	useLayoutEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const scale = Math.min(1, width / card.offsetWidth);
		if (scale !== fit.scale || card.offsetHeight !== fit.height) setFit({scale, height: card.offsetHeight});
	}, [html, width, fit]);
	// The transform leaves the card's layout box at full size; the negative margin closes the gap it leaves.
	const gap = ((1 - fit.scale) * fit.height) / 2;
	return (
		<div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(24), opacity: show, transform: `translateY(${(1 - show) * u(30)}px)`}}>
			<div
				ref={cardRef}
				style={{width: 'max-content', flexShrink: 0, fontSize: u(70), color: palette.ink, padding: `${u(28)}px ${u(40)}px`, borderRadius: u(28), backgroundColor: palette.fill, transform: `scale(${fit.scale})`, margin: `${-gap}px 0`}}
				dangerouslySetInnerHTML={{__html: html}}
			/>
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontSize: u(32), color: palette.muted, textAlign: 'center'}}>{visual.caption}</div> : null}
		</div>
	);
};
