import React from 'react';
import {interpolate} from 'remotion';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {RichText} from '../../Typography/RichText';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {UNFOCUSED_FADE, useBeatStartFor, useElementState} from '../VisualTimeline';

type Verses = Extract<CourseVisual, {kind: 'verses'}>;

/**
 * Sources read with their lesson: one to three passages (a verse or a hadith in Din Kültürü, a line of poetry, a
 * philosopher's or a document's words), each with where it comes from and, under it, the message the lesson takes
 * from it. The passage comes first; its message slides in when a beat points at that passage (or a moment after the
 * passage when the card has no beats), so the student reads the source before hearing what it means.
 * Parts: q1, q2, q3, one per passage.
 */
export const VersesVisual: React.FC<VisualBoxProps & {visual: Verses}> = ({visual, delaySeconds = 0}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: u(28)}}>
			{visual.items.map((item, index) => (
				<Passage key={index} id={`q${index + 1}`} item={item} delaySeconds={delaySeconds + index * 0.5} />
			))}
		</div>
	);
};

const Passage: React.FC<{id: string; item: Verses['items'][number]; delaySeconds: number}> = ({id, item, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const state = useElementState(id);
	const shown = useReveal(delaySeconds, 0.5) * state.appear;
	const focusAt = useBeatStartFor(id, 'focus');
	const messageAt = focusAt ?? delaySeconds + 1.2;
	const message = interpolate(seconds, [messageAt + 0.3, messageAt + 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const lit = state.emphasis;
	return (
		<div
			style={{
				opacity: shown * (1 - UNFOCUSED_FADE * state.dim),
				transform: `translateY(${(1 - shown) * u(24)}px)`,
				display: 'flex',
				flexDirection: 'column',
				gap: u(14),
				padding: `${u(26)}px ${u(34)}px`,
				borderRadius: u(22),
				backgroundColor: withAlpha(palette.lesson, 0.05 + 0.07 * lit),
				borderLeft: `${u(10)}px solid ${palette.lesson}`,
				fontFamily: palette.fontBody,
			}}
		>
			<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start'}}>
				<div style={{fontFamily: palette.fontDisplay, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(104), lineHeight: 0.8, color: withAlpha(palette.lesson, 0.55 + 0.45 * lit)}}>“</div>
				<RichText text={item.text} size={44} weight={500} />
			</div>
			<div style={{alignSelf: 'flex-end', fontSize: u(26), fontWeight: 700, letterSpacing: u(1.5), color: palette.lesson, textTransform: 'uppercase'}}>{item.source}</div>
			{item.message ? (
				<div style={{opacity: message, transform: `translateX(${(1 - message) * u(-20)}px)`, display: 'flex', gap: u(14), alignItems: 'baseline', paddingTop: u(12), borderTop: `${u(2)}px solid ${withAlpha(palette.lesson, 0.25)}`}}>
					<span style={{fontSize: u(38), fontWeight: 800, color: palette.lesson}}>→</span>
					<RichText text={item.message} size={40} weight={700} />
				</div>
			) : null}
		</div>
	);
};
