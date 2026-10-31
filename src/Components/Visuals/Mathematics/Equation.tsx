import katex from 'katex';
import React, {useMemo} from 'react';
import {smooth} from '../../../Animations/Motion';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {KATEX_OPTIONS} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {H, W} from '../VisualWorld';

type Equation = Extract<CourseVisual, {kind: 'equation'}>;

// ---------------------------------------------------------------- equations

const tex = (latex: string) => katex.renderToString(latex, {...KATEX_OPTIONS, throwOnError: false});

/**
 * An inequality is written as steps whose right side begins with the relation ("\geq 7"). The relation then
 * stands at the pivot in place of "=" and is not repeated on the pan; before, such a step read "3 - 2x = ≥ 7".
 */
const STEP_RELATION = /^\s*(\\geq|\\ge|\\leq|\\le|\\neq|<|>|≥|≤|≠)\s*/;

const RELATION_GLYPH: Record<string, string> = {'\\geq': '≥', '\\ge': '≥', '\\leq': '≤', '\\le': '≤', '\\neq': '≠'};

/** A step's relation ("=" unless its right side begins with another) and its right side without it. */
export const stepRelation = (right: string): {relation: string; value: string} => {
	const match = right.match(STEP_RELATION);
	return match ? {relation: match[1], value: right.slice(match[0].length)} : {relation: '=', value: right};
};

/**
 * An equation solved on a balance: the two sides sit on the pans; each step
 * drops the same operation on both pans and the sides change while the beam
 * stays level — what is done to one side is done to the other. The steps so
 * far are listed beside it.
 */
export const EquationVisual: React.FC<VisualBoxProps & {visual: Equation}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {stage, seconds} = useStageClock(visual.steps.length, {delaySeconds, secondsPerStage: 2.8});
	const step = visual.steps[stage];
	const previous = stage > 0 ? visual.steps[stage - 1] : undefined;
	const change = stage === 0 ? 1 : smooth(seconds / 0.9);
	// The operation drops onto both pans, the beam dips and comes back level.
	const drop = step.operation && stage > 0 ? smooth(seconds / 0.6) : 0;
	const wobble = stage > 0 ? Math.sin(Math.min(1, seconds / 1.2) * Math.PI * 3) * (1 - Math.min(1, seconds / 1.2)) * 4 : 0;
	const html = useMemo(() => visual.steps.map((item) => ({left: tex(item.left), right: tex(stepRelation(item.right).value)})), [visual.steps]);
	const relation = stepRelation(step.right).relation;
	const [pivotX, pivotY] = [345, 250];
	const beam = 205;
	const pan = (side: -1 | 1) => {
		const angle = (wobble * Math.PI) / 180;
		return [pivotX + side * beam * Math.cos(angle), pivotY + side * beam * Math.sin(angle)] as const;
	};
	const panBox = (side: -1 | 1, content: string, old?: string) => {
		const [cx, cy] = pan(side);
		return (
			<g>
				<line x1={cx} y1={cy} x2={cx - 90} y2={cy + 120} stroke={palette.axis} strokeWidth={3} />
				<line x1={cx} y1={cy} x2={cx + 90} y2={cy + 120} stroke={palette.axis} strokeWidth={3} />
				<path d={`M${cx - 120} ${cy + 120} Q${cx} ${cy + 175} ${cx + 120} ${cy + 120} Z`} fill={withAlpha(palette.lesson, 0.16)} stroke={palette.lesson} strokeWidth={4} />
				<foreignObject x={cx - 160} y={cy + 40} width={320} height={80}>
					<div style={{position: 'relative', width: '100%', height: '100%', fontSize: 40, color: palette.ink, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
						{old ? <div style={{position: 'absolute', bottom: 0, opacity: 1 - change, transform: `translateY(${-change * 20}px)`}} dangerouslySetInnerHTML={{__html: old}} /> : null}
						<div style={{opacity: change, transform: `translateY(${(1 - change) * 20}px)`}} dangerouslySetInnerHTML={{__html: content}} />
					</div>
				</foreignObject>
				{step.operation && drop > 0 && drop < 1 ? (
					<g opacity={1 - drop * 0.8}>
						<rect x={cx - 50} y={cy - 110 + drop * 120} width={100} height={48} rx={24} fill={palette.brand} />
						<text x={cx} y={cy - 77 + drop * 120} textAnchor="middle" fontSize={28} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} fill="#FFFFFF">{step.operation}</text>
					</g>
				) : null}
			</g>
		);
	};

	return (
		<svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<path d={`M${pivotX} ${pivotY} L${pivotX - 50} ${pivotY + 260} L${pivotX + 50} ${pivotY + 260} Z`} fill={withAlpha(palette.ink, 0.12)} stroke={palette.axis} strokeWidth={3} />
			<line x1={pan(-1)[0]} y1={pan(-1)[1]} x2={pan(1)[0]} y2={pan(1)[1]} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
			<circle cx={pivotX} cy={pivotY} r={12} fill={palette.lesson} />
			{panBox(-1, html[stage].left, previous ? html[stage - 1].left : undefined)}
			{panBox(1, html[stage].right, previous ? html[stage - 1].right : undefined)}
			<text x={pivotX} y={pivotY - 30} textAnchor="middle" fontSize={56} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} fill={palette.lesson}>{RELATION_GLYPH[relation] ?? relation}</text>
			<foreignObject x={680} y={40} width={310} height={H - 60}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14, fontSize: 30, color: palette.ink}}>
					{visual.steps.slice(0, stage + 1).map((item, index) => (
						<div key={index} style={{display: 'flex', flexDirection: 'column', gap: 4, opacity: index === stage ? change : 0.75}}>
							{item.operation && index > 0 ? <div style={{fontSize: 20, fontWeight: 800, color: palette.brand}}>{`her iki taraf: ${item.operation}`}</div> : null}
							<div style={{padding: '6px 14px', borderRadius: 14, backgroundColor: index === stage ? withAlpha(palette.lesson, 0.14) : 'transparent'}} dangerouslySetInnerHTML={{__html: tex(`${item.left} ${stepRelation(item.right).relation} ${stepRelation(item.right).value}`)}} />
						</div>
					))}
				</div>
			</foreignObject>
		</svg>
	);
};
