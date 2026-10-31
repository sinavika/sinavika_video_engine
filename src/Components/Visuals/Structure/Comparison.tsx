import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichInline, RichText} from '../../Typography/RichText';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useElementState} from '../VisualTimeline';
import {COMPARISON_ACCENTS, partLook} from './StructureLook';

type Comparison = Extract<CourseVisual, {kind: 'comparison'}>;

/** Two or three columns side by side, filled in one after another: the usual shape of "what is the difference". */
export const ComparisonVisual: React.FC<VisualBoxProps & {visual: Comparison}> = ({visual, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	return (
		<div style={{width: '100%', display: 'flex', gap: u(24), alignItems: 'stretch'}}>
			{visual.columns.map((column, index) => (
				<ComparisonColumn key={index} id={`c${index + 1}`} column={column} accent={COMPARISON_ACCENTS(palette)[index]} delaySeconds={delaySeconds + index * 0.5} />
			))}
		</div>
	);
};

const ComparisonColumn: React.FC<{id: string; column: Comparison['columns'][number]; accent: string; delaySeconds: number}> = ({id, column, accent, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.4);
	const state = useElementState(id);
	const look = partLook(state);
	return (
		<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRadius: u(28), overflow: 'hidden', backgroundColor: palette.surface, border: `${u(3)}px solid ${palette.border}`, boxShadow: look.emphasis > 0.02 ? `inset 0 0 0 ${u(5 * look.emphasis)}px ${accent}` : 'none', opacity: show * look.opacity, transform: `translateY(${(1 - show) * u(30)}px)`}}>
			<div style={{backgroundColor: accent, color: '#FFFFFF', padding: `${u(18)}px ${u(24)}px`, fontFamily: palette.fontDisplay, fontWeight: 800, fontSize: u(36)}}>
				{/* Rich like the items, so a title may hold a formula ("Doğru: a/b = k" written in math); plain text and math take the header's white. */}
				<RichInline text={column.title} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(16), padding: u(24)}}>
				{column.items.map((item, index) => (
					<ComparisonItem key={index} id={`${id}-${index + 1}`} text={item} accent={accent} columnDim={state.dim} columnFocus={state.emphasis} delaySeconds={delaySeconds + 0.25 + index * 0.18} />
				))}
			</div>
		</div>
	);
};

/**
 * An item of a column. It fades only by what its column does not already (two fades multiplied left the text at a
 * tenth of its strength), and never while its own column is in focus (focusing a column used to fade its items).
 */
const ComparisonItem: React.FC<{id: string; text: string; accent: string; columnDim: number; columnFocus: number; delaySeconds: number}> = ({id, text, accent, columnDim, columnFocus, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.3);
	const state = useElementState(id);
	const look = partLook({...state, dim: Math.max(0, state.dim - columnDim - columnFocus)});
	return (
		<div style={{display: 'flex', gap: u(14), alignItems: 'baseline', opacity: show * look.opacity, color: palette.onSurface, margin: `-${u(8)}px -${u(12)}px`, padding: `${u(8)}px ${u(12)}px`, borderRadius: u(14), backgroundColor: withAlpha(accent, 0.14 * look.emphasis)}}>
			<div style={{width: u(12), height: u(12), borderRadius: '50%', backgroundColor: accent, flexShrink: 0, transform: `translateY(-${u(4)}px) scale(${1 + 0.6 * look.emphasis})`}} />
			<RichText text={text} size={34} />
		</div>
	);
};
