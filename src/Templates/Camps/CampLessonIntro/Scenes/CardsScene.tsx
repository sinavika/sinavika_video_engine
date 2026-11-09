import React from 'react';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {C, Kicker, Rise, Stage, Title} from '../../CampIntro/Scenes/IntroKit';

type Card = {title: string; text: string; source?: string};

/**
 * Two to four numbered cards under a title, each landing when the narration reaches it: why the lessons work (each
 * card with the research it rests on in small letters) or the lesson's exam tactics. `dark` sets the cards on navy.
 */
export const CardsScene: React.FC<{kicker: string; color: string; title: string; cards: readonly Card[]; cardAt: readonly number[]; dark?: boolean}> = ({kicker, color, title, cards, cardAt, dark = false}) => {
	const {u} = useVideoLayout();
	return (
		<Stage ground={dark ? C.navy : C.paper}>
			<Kicker text={kicker} color={dark ? C.white : color} />
			<Title text={title} color={dark ? C.white : C.ink} size={84} />
			<div style={{position: 'absolute', left: u(120), top: u(330), width: u(1680), display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: u(26)}}>
				{cards.map((card, index) => (
					<Rise key={card.title} at={cardAt[index] ?? 0.6 + index * 0.8} distance={60}>
						<div style={{height: u(cards.length > 2 ? 300 : 540), boxSizing: 'border-box', padding: u(34), borderRadius: u(32), background: dark ? 'rgba(255,255,255,0.08)' : C.white, border: dark ? `${u(2)}px solid rgba(255,255,255,0.14)` : `${u(2)}px solid ${C.line}`, display: 'flex', gap: u(26)}}>
							<div style={{width: u(72), height: u(72), flexShrink: 0, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Text size={36} weight={TYPE.weights.kinetic} color={C.white}>
									{index + 1}
								</Text>
							</div>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(12), minWidth: 0}}>
								<Text size={40} weight={TYPE.weights.kinetic} color={dark ? C.white : C.ink} style={{lineHeight: 1.12}}>
									{card.title}
								</Text>
								<Text size={30} weight={TYPE.weights.strong} color={dark ? 'rgba(255,255,255,0.82)' : C.muted} style={{lineHeight: 1.35}}>
									{card.text}
								</Text>
								{card.source ? (
									<Text size={22} weight={TYPE.weights.strong} color={dark ? 'rgba(255,255,255,0.55)' : C.muted} style={{marginTop: 'auto', opacity: 0.85}}>
										{card.source}
									</Text>
								) : null}
							</div>
						</div>
					</Rise>
				))}
			</div>
		</Stage>
	);
};
