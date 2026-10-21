import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {HubScreen} from '../../../UIUX/Screens/Mobile/Hub';
import {At, CLAMP, PhoneShot, PromoStage, useLand, useSeconds} from './PromoKit';

/**
 * The one closing card of every promotion reel: the logo, the app on a phone,
 * "download free" and where to get it. Every reel ends on exactly this frame,
 * so the ending is recognisable and is changed in one place. The reels keep
 * their own looks up to here.
 */

export const PROMO_END_CARD = {
	cta: 'Ücretsiz indir',
	channels: 'App Store · Google Play · sinavika.com',
	/** What the voice says over the card. */
	narration: 'Sınavika’yı ücretsiz indir.',
} as const;

const INK = '#0B1C30';
const ORANGE = '#EA580C';
const MUTED = '#475569';

/** Light, cool ground in the brand's navy family: no warm or brown tones. */
const Ground: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, #FFFFFF 0%, #F3F6FB 55%, #E6ECF5 100%)'}} />;

export const PromoEndCard: React.FC<{cta?: string; channels?: string}> = ({cta = PROMO_END_CARD.cta, channels = PROMO_END_CARD.channels}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const logo = useLand(0.05, 200);
	const phone = useLand(0.15, 140, 18);
	const button = useLand(0.55, 220, 16);
	const store = interpolate(seconds, [0.8, 1.1], [0, 1], CLAMP);
	const float = Math.sin(seconds * 2.2) * 6;
	return (
		<PromoStage ground={<Ground />}>
			<At y={40} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
					<BrandMark size="card" color={INK} />
				</div>
			</At>
			<At y={interpolate(phone, [0, 1], [400, 230]) + float} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: Math.min(1, phone * 1.4)}}>
					<PhoneShot width={400}>
						<HubScreen />
					</PhoneShot>
				</div>
			</At>
			<At y={1170} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(28)}}>
					<div style={{opacity: button, transform: `scale(${interpolate(button, [0, 1], [0.8, 1])})`, padding: `${u(26)}px ${u(64)}px`, borderRadius: u(999), background: ORANGE, boxShadow: `0 ${u(18)}px ${u(36)}px -${u(16)}px ${ORANGE}`}}>
						<Text size={TYPE.adScale.action * 1.4} weight={TYPE.weights.kinetic} color="#FFFFFF">
							{cta}
						</Text>
					</div>
					<div style={{opacity: store}}>
						<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={MUTED} align="center">
							{channels}
						</Text>
					</div>
				</div>
			</At>
		</PromoStage>
	);
};
