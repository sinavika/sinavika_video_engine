import React from 'react';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Icon, type UIIconName} from '../../../../UIUX/Icons';
import {C, Kicker, Rise, Stage, Title} from './IntroKit';

// ─── 7. A camp episode ──────────────────────────────────────────────────────

type IntroPart = {icon: UIIconName; title: string; text: string};

/** What every camp lesson brings: each card lands when the narrator gets to it. */
export const EpisodeScene: React.FC<{kicker: string; title: string; parts: readonly IntroPart[]; partAt: readonly number[]}> = ({kicker, title, parts, partAt}) => {
	const {u} = useVideoLayout();
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={title} />
			<div style={{position: 'absolute', left: u(120), top: u(360), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${parts.length}, 1fr)`, gap: u(26)}}>
				{parts.map((part, index) => (
					<Rise key={part.title} at={partAt[index]} distance={70}>
						<div style={{height: u(520), boxSizing: 'border-box', padding: u(40), borderRadius: u(36), background: index === 0 ? C.navy : C.white, border: index === 0 ? undefined : `${u(2)}px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: u(24), boxShadow: `0 ${u(24)}px ${u(60)}px -${u(36)}px rgba(11,28,48,0.45)`}}>
							<div style={{width: u(96), height: u(96), borderRadius: u(28), background: index === 0 ? C.orange : C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name={part.icon} size={u(52)} color={index === 0 ? C.white : C.orange} stroke={2.2} />
							</div>
							<Text size={48} weight={TYPE.weights.kinetic} color={index === 0 ? C.white : C.ink} style={{lineHeight: 1.1}}>
								{part.title}
							</Text>
							<Text size={32} weight={TYPE.weights.strong} color={index === 0 ? 'rgba(255,255,255,0.82)' : C.muted} style={{lineHeight: 1.35}}>
								{part.text}
							</Text>
						</div>
					</Rise>
				))}
			</div>
		</Stage>
	);
};
