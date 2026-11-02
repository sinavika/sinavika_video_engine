import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import SmilesDrawer from 'smiles-drawer';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';

type Molecule = Extract<CourseVisual, {kind: 'molecule'}>;

/**
 * SmilesDrawer's sizes in its own units, against a bond 30 long: thin bonds well apart, letters a third of a bond.
 * Structures are drawn whole: compacted, acetic acid became the single word "COOHCH₃".
 */
export const MOLECULE_DRAWING = {bondLength: 30, bondThickness: 1.7, bondSpacing: 6.6, fontSizeLarge: 11, fontSizeSmall: 7, padding: 8, compactDrawing: false} as const;

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
		// SmilesDrawer measures in its own units, a bond 30 long, and fits the drawing to the box afterwards. Sizes given as
		// pixels there (thickness 5, letters 30) made a letter as large as a bond: a chloroalkane's C–Cl bond vanished
		// under "Cl", and double bonds 5 thick 5.1 apart ran together (Soru revizyonu, 2 Nov 2026).
		const drawer = new SmilesDrawer.SvgDrawer({width: drawingWidth, height: drawingHeight, ...MOLECULE_DRAWING, fontFamily: palette.fontBody, themes: {sinavika: {C: palette.ink, O: palette.brand, N: palette.lesson, F: palette.ink, CL: palette.ink, BR: palette.ink, I: palette.ink, P: palette.ink, S: palette.ink, B: palette.ink, SI: palette.ink, H: palette.ink, BACKGROUND: 'transparent'}}});
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
	}, [visual.smiles, drawingWidth, drawingHeight, handle, palette.ink, palette.brand, palette.lesson, palette.fontBody]);

	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(20), opacity: show}}>
			{failed ? <div style={{fontFamily: palette.fontBody, color: palette.brand, fontSize: u(30)}}>{visual.smiles}</div> : <svg ref={target} width={drawingWidth} height={drawingHeight} />}
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontSize: u(32), color: palette.muted}}>{visual.caption}</div> : null}
		</div>
	);
};
