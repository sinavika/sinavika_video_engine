import React from 'react';
import {StoreBadge} from '../../../../Components/Brand/StoreBadge';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../../Components/Overlays/BrandMark';
import {VoiceOrb, type VoiceTrack} from '../../../../Components/Overlays/VoiceOrb';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {STORE_BADGES} from '../../../../Configurations/SocialIdentity';
import {Icon} from '../../../../UIUX/Icons';
import {Box, C, lessonColor, Rise, Stage, usePop} from './IntroKit';

// ─── 10. Closing ────────────────────────────────────────────────────────────

/** The next step: the first lesson as a card in its colour, then "abone ol" and the stores as they are said; SinoAI's orb says goodbye. */
export const ClosingScene: React.FC<{next: {lesson: string; title: string; code: string}; subscribeAt: number; storesAt: number; voice: readonly VoiceTrack[]}> = ({next, subscribeAt, storesAt, voice}) => {
	const {u} = useVideoLayout();
	const color = lessonColor(next.code);
	const card = usePop(0.2);
	return (
		<Stage ground={`radial-gradient(70% 90% at 20% 0%, #16304F 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`}>
			<Box x={120} y={150}>
				<Rise at={0.05}>
					<Text variant="label" size={30} weight={TYPE.weights.display} color={C.orange} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
						Sıradaki video
					</Text>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(230), width: u(900), height: u(500), borderRadius: u(44), background: color, padding: u(56), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transform: `scale(${0.85 + card * 0.15}) rotate(${(1 - card) * -4}deg)`, opacity: card, boxShadow: `0 ${u(40)}px ${u(100)}px rgba(0,0,0,0.45)`}}>
				<Text size={40} weight={TYPE.weights.display} color="rgba(255,255,255,0.86)">
					{next.lesson}
				</Text>
				<Text variant="display" size={104} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1.02, letterSpacing: '-0.03em'}}>
					{next.title}
				</Text>
				<div style={{display: 'flex', alignItems: 'center', gap: u(16)}}>
					<div style={{width: u(76), height: u(76), borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="play" size={u(38)} color={color} stroke={2.4} />
					</div>
					<Text size={34} weight={TYPE.weights.display} color={C.white}>
						Kampın ilk dersi
					</Text>
				</div>
			</div>
			<Box x={1110} y={250} w={690}>
				<Rise at={subscribeAt}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: u(16), padding: `${u(22)}px ${u(36)}px`, borderRadius: u(999), background: C.white}}>
						<Icon name="bell" size={u(40)} color={C.orange} stroke={2.4} />
						<Text size={42} weight={TYPE.weights.kinetic} color={C.ink}>
							Kanala abone ol
						</Text>
					</div>
				</Rise>
				<Rise at={storesAt - 0.2}>
					<Text size={36} weight={TYPE.weights.strong} color="rgba(255,255,255,0.82)" style={{marginTop: u(40), lineHeight: 1.35}}>
						Kampın devamı ve testler Sınavika'da:
					</Text>
				</Rise>
				<div style={{display: 'flex', gap: u(18), marginTop: u(22)}}>
					{STORE_BADGES.stores.map((store, index) => (
						<Rise key={store.id} at={storesAt + index * 0.15}>
							<StoreBadge store={store} height={84} onDark />
						</Rise>
					))}
				</div>
				<Rise at={storesAt + 0.5}>
					<div style={{marginTop: u(70)}}>
						<BrandMark size="card" color={C.white} />
					</div>
				</Rise>
			</Box>
			<div style={{position: 'absolute', right: u(120), bottom: u(90)}}>
				<VoiceOrb size={150} color={C.orange} tracks={voice} delaySeconds={0.4} />
			</div>
		</Stage>
	);
};
