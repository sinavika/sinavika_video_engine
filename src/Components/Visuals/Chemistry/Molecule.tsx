import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import SmilesDrawer from 'smiles-drawer';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';

type Molecule = Extract<CourseVisual, {kind: 'molecule'}>;

/**
 * A molecule from SMILES, drawn by SmilesDrawer into an SVG. The drawing is
 * done once, before the frame is captured; Remotion waits for it.
 */
export const MoleculeVisual: React.FC<VisualBoxProps & {visual: Molecule}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const target = useRef<SVGSVGElement>(null);
	const [handle] = useState(() => delayRender(`Drawing molecule ${visual.smiles}`));
	const [failed, setFailed] = useState(false);
	const show = useReveal(delaySeconds, 0.5);
	// Small molecules are drawn at a size that suits them, not blown up to fill the card.
	const heavyAtoms = (visual.smiles.match(/Cl|Br|[BCNOPSFI]|[cnops]/g) ?? []).length;
	const drawingHeight = Math.min(height - (visual.caption ? u(70) : 0), u(170 + heavyAtoms * 55));
	const drawingWidth = Math.min(width, drawingHeight * 1.6);

	useLayoutEffect(() => {
		const svg = target.current;
		if (!svg) return;
		const drawer = new SmilesDrawer.SvgDrawer({width: drawingWidth, height: drawingHeight, bondThickness: u(5), fontSizeLarge: u(30), fontSizeSmall: u(20), padding: u(20), themes: {sinavika: {C: palette.ink, O: palette.brand, N: palette.lesson, F: palette.ink, CL: palette.ink, BR: palette.ink, I: palette.ink, P: palette.ink, S: palette.ink, B: palette.ink, SI: palette.ink, H: palette.ink, BACKGROUND: 'transparent'}}});
		SmilesDrawer.parse(
			visual.smiles,
			(tree) => {
				drawer.draw(tree, svg, 'sinavika');
				continueRender(handle);
			},
			() => {
				setFailed(true);
				continueRender(handle);
			},
		);
	}, [visual.smiles, drawingWidth, drawingHeight, handle, palette.ink, palette.brand, palette.lesson, u]);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(20), opacity: show}}>
			{failed ? <div style={{fontFamily: palette.fontBody, color: palette.brand, fontSize: u(30)}}>{visual.smiles}</div> : <svg ref={target} width={drawingWidth} height={drawingHeight} />}
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontSize: u(32), color: palette.muted}}>{visual.caption}</div> : null}
		</div>
	);
};
