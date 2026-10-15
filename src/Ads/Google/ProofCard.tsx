import React from 'react';
import {useT} from '../../UIUX/Context';
import {Icon} from '../../UIUX/Icons';
import {MODULES} from '../../UIUX/ModuleIdentity';
import type {AdProof} from './GoogleAdsPlan';

/**
 * The proof card: one moment of the product, drawn large and white so it reads
 * even in a small ad slot (the phone screen behind it does not). Sizes are in
 * card pixels; `scale` fits it to the picture.
 */

const INK = '#0B1C30';
const MUTED = '#64748B';
const LINE = '#E9EDF2';
const ERROR = '#DC2626';
const SUCCESS = '#059669';

const Label: React.FC<{icon: Parameters<typeof Icon>[0]['name']; color: string; children: React.ReactNode; right?: React.ReactNode}> = ({icon, color, children, right}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18}}>
		<div style={{width: 36, height: 36, borderRadius: 11, background: `${color}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<Icon name={icon} size={20} color={color} stroke={2.2} />
		</div>
		<div style={{flex: 1, fontSize: 19, fontWeight: 700, color: MUTED, letterSpacing: '-0.01em'}}>{children}</div>
		{right}
	</div>
);

const Body: React.FC<{proof: AdProof}> = ({proof}) => {
	const t = useT();
	switch (proof.kind) {
		case 'loss':
			return (
				<>
					<Label icon="target" color={ERROR}>
						{t(proof.title)}
					</Label>
					{proof.rows.map((row, index) => (
						<div key={row.topic.tr} style={{display: 'flex', alignItems: 'center', gap: 14, padding: index ? '14px 0 0' : '0 0 14px', borderTop: index ? `1px solid ${LINE}` : undefined, marginTop: index ? 0 : 0}}>
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{fontSize: index ? 22 : 30, fontWeight: 800, color: INK, letterSpacing: '-0.02em', lineHeight: 1.15}}>{t(row.topic)}</div>
								<div style={{fontSize: index ? 15 : 17, fontWeight: 600, color: MUTED, marginTop: 3}}>{t(row.lesson)}</div>
							</div>
							<div style={{fontSize: index ? 22 : 34, fontWeight: 800, color: ERROR, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>{t(row.loss)}</div>
						</div>
					))}
				</>
			);
		case 'tasks':
			return (
				<>
					<Label icon="calendar" color={MODULES.studyPlan.color.light} right={<div style={{fontSize: 17, fontWeight: 700, color: MODULES.studyPlan.color.light}}>{t(proof.meta)}</div>}>
						{t(proof.title)}
					</Label>
					{proof.tasks.map((task) => {
						const color = MODULES[task.module].color.light;
						return (
							<div key={task.text.tr} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', marginTop: 10, borderRadius: 16, border: `1.5px solid ${LINE}`, borderLeft: `6px solid ${color}`}}>
								<div style={{width: 28, height: 28, borderRadius: 9, background: task.done ? color : 'transparent', border: task.done ? undefined : `2.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
									{task.done ? <Icon name="check" size={17} color="#FFFFFF" stroke={2.8} /> : null}
								</div>
								<div style={{flex: 1, minWidth: 0}}>
									<div style={{fontSize: 22, fontWeight: 800, color: task.done ? MUTED : INK, textDecoration: task.done ? 'line-through' : undefined, letterSpacing: '-0.015em'}}>{t(task.text)}</div>
									<div style={{fontSize: 15, fontWeight: 600, color: MUTED, marginTop: 2}}>{t(task.sub)}</div>
								</div>
							</div>
						);
					})}
				</>
			);
		case 'steps':
			return (
				<>
					<Label icon="scan" color={MODULES.smartSummary.color.light}>
						{t(proof.title)}
					</Label>
					{proof.steps.map((step, index) => (
						<div key={step.tr} style={{display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: index ? 12 : 0}}>
							<div style={{width: 30, height: 30, borderRadius: 15, background: `${MODULES.smartSummary.color.light}1F`, color: MODULES.smartSummary.color.light, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{index + 1}</div>
							<div style={{fontSize: 21, fontWeight: 650, color: INK, lineHeight: 1.35, paddingTop: 2}}>{t(step)}</div>
						</div>
					))}
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, padding: '12px 16px', borderRadius: 14, background: '#ECFDF5'}}>
						<div style={{fontSize: 26, fontWeight: 800, color: SUCCESS}}>{t(proof.answer)}</div>
						<div style={{fontSize: 14, fontWeight: 700, color: MUTED, textAlign: 'right'}}>{t(proof.topic)}</div>
					</div>
				</>
			);
		case 'score':
			return (
				<>
					<Label icon="exam" color={MODULES.exam.color.light}>
						{t(proof.title)}
					</Label>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
						<div style={{fontSize: 76, fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1}}>{t(proof.net)}</div>
						<div style={{fontSize: 26, fontWeight: 700, color: MUTED}}>net</div>
						<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: '#ECFDF5', color: SUCCESS, fontSize: 21, fontWeight: 800}}>
							<Icon name="trend" size={18} color={SUCCESS} stroke={2.4} />
							{t(proof.delta)}
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${LINE}`}}>
						<Icon name="trophy" size={26} color={MODULES.exam.color.light} />
						<div style={{flex: 1, fontSize: 19, fontWeight: 700, color: MUTED}}>{t(proof.rankLabel)}</div>
						<div style={{fontSize: 30, fontWeight: 800, color: INK, letterSpacing: '-0.02em'}}>{t(proof.rank)}</div>
						<div style={{fontSize: 18, fontWeight: 700, color: MUTED}}>{t(proof.rankOf)}</div>
					</div>
				</>
			);
		case 'card':
			return (
				<>
					<Label icon="cards" color={MODULES.flashcards.color.light} right={<div style={{fontSize: 17, fontWeight: 700, color: MODULES.flashcards.color.light}}>{t(proof.meta)}</div>}>
						{t(proof.title)}
					</Label>
					<div style={{fontSize: 15, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em'}}>{t(proof.deck)}</div>
					<div style={{fontSize: 30, fontWeight: 800, color: INK, letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: 8}}>{t(proof.front)}</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, padding: '12px 16px', borderRadius: 14, background: `${MODULES.flashcards.color.light}14`}}>
						<Icon name="refresh" size={20} color={MODULES.flashcards.color.light} />
						<div style={{fontSize: 28, fontWeight: 800, color: MODULES.flashcards.color.light, letterSpacing: '-0.01em'}}>{t(proof.back)}</div>
					</div>
				</>
			);
		case 'chat':
			return (
				<>
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>
						<div style={{maxWidth: '86%', padding: '13px 18px', borderRadius: 22, background: '#F1F5F9', fontSize: 21, fontWeight: 650, color: INK, lineHeight: 1.35}}>{t(proof.question)}</div>
					</div>
					<div style={{display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 18}}>
						<Icon name="sparkles" size={26} color={INK} stroke={1.8} />
						<div style={{flex: 1}}>
							<div style={{fontSize: 22, fontWeight: 650, color: INK, lineHeight: 1.4}}>{t(proof.answer)}</div>
							<div style={{fontSize: 16, fontWeight: 600, color: MUTED, marginTop: 10}}>{t(proof.note)}</div>
						</div>
					</div>
				</>
			);
	}
};

export const ProofCard: React.FC<{proof: AdProof; width: number; scale?: number; style?: React.CSSProperties}> = ({proof, width, scale = 1, style}) => (
	<div style={{position: 'absolute', width, transform: `scale(${scale})`, transformOrigin: 'top left', padding: 26, borderRadius: 30, background: '#FFFFFF', boxShadow: '0 40px 80px -30px rgba(2, 8, 23, 0.55), 0 8px 24px -8px rgba(2, 8, 23, 0.18)', boxSizing: 'border-box', ...style}}>
		<Body proof={proof} />
	</div>
);
