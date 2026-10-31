import React from 'react';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {C, Kicker, Rise, Stage, Title, useProgress} from './IntroKit';

// ─── 5. Score ───────────────────────────────────────────────────────────────

/** YKS puanı as one bar, split TYT 40 / AYT 60 with the part this camp covers lit; each fact card lands as it is said. */
export const ScoreScene: React.FC<{kicker: string; focus: 'TYT' | 'AYT'; cards: readonly {title: string; text: string}[]; cardAt: readonly number[]}> = ({kicker, focus, cards, cardAt}) => {
	const {u} = useVideoLayout();
	const grow = useProgress(0.5, 1.6);
	const part = (label: string, share: number, lit: boolean) => (
		<div style={{width: `${share * 100}%`, height: '100%', background: lit ? C.orange : C.navy, opacity: lit ? 1 : 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Text size={44} weight={TYPE.weights.kinetic} color={C.white} align="center">
				{label} %{Math.round(share * 100)}
			</Text>
		</div>
	);
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text="YKS puanı nereden gelir?" />
			<div style={{position: 'absolute', left: u(120), top: u(330), width: u(1680) * grow, height: u(120), borderRadius: u(28), overflow: 'hidden', display: 'flex'}}>
				{part('TYT', 0.4, focus === 'TYT')}
				{part('AYT', 0.6, focus === 'AYT')}
			</div>
			<div style={{position: 'absolute', left: u(120), top: u(540), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: u(28)}}>
				{cards.map((card, index) => (
					<Rise key={card.title} at={cardAt[index]}>
						<div style={{minHeight: u(300), boxSizing: 'border-box', padding: u(36), borderRadius: u(32), background: C.white, border: `${u(2)}px solid ${C.line}`, boxShadow: `0 ${u(20)}px ${u(50)}px -${u(30)}px rgba(11,28,48,0.35)`}}>
							<Text size={44} weight={TYPE.weights.kinetic} color={C.ink}>
								{card.title}
							</Text>
							<Text size={32} weight={TYPE.weights.strong} color={C.muted} style={{marginTop: u(14), lineHeight: 1.35}}>
								{card.text}
							</Text>
						</div>
					</Rise>
				))}
			</div>
		</Stage>
	);
};
