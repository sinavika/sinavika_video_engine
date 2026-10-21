import React from 'react';
import {EXAM_TAG, type AdExam} from './GoogleAdsPlan';

/**
 * The exam tag above the hook ("KPSS · Lisans · Önlisans · Ortaöğretim"):
 * a quiet white pill on the module ground. It answers "which exam?" before
 * the hook is read, without competing with it. `size` is the font size in
 * frame pixels; the exam name is bold, its parts regular.
 */
export const ExamTag: React.FC<{exam: AdExam; size: number; maxWidth?: number}> = ({exam, size, maxWidth}) => {
	const [name, ...parts] = EXAM_TAG[exam].split(' · ');
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: size * 0.45,
				maxWidth,
				padding: `${size * 0.42}px ${size * 0.8}px`,
				borderRadius: 999,
				background: 'rgba(255, 255, 255, 0.18)',
				border: '1px solid rgba(255, 255, 255, 0.35)',
				color: '#FFFFFF',
				fontSize: size,
				lineHeight: 1.15,
				whiteSpace: 'nowrap',
				overflow: 'hidden',
			}}
		>
			<span style={{fontWeight: 800, letterSpacing: '0.02em'}}>{name}</span>
			{parts.length ? <span style={{fontWeight: 600, opacity: 0.92}}>{parts.join(' · ')}</span> : null}
		</div>
	);
};
