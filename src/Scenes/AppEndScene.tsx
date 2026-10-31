import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StoreBadges} from '../Components/Brand/StoreBadge';
import {useVideoLayout} from '../Components/Layouts/VideoLayout';
import {BrandMark} from '../Components/Overlays/BrandMark';
import {Text} from '../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../Configurations/BrandTypography';
import {APP_END_CARD} from '../Configurations/SocialIdentity';
import {At, CLAMP, PhoneShot, PromoStage, useLand, useSeconds} from '../Templates/Advertisements/PromoKit/PromoKit';
import {HubScreen} from '../UIUX/Screens/Mobile/Hub';
import type {TemplateScene} from './ScenePlan';
import type {Outro} from '../Schemas/VideoProps';
import type {Narrator} from './Voiceover';

/** The id of a video's closing scene, whatever closes it. */
export const OUTRO_SCENE_ID = 'outro';

/**
 * The one closing card of every reel (Configurations/SocialIdentity,
 * APP_END_CARD): the logo, the app on a phone, "Ücretsiz indir" and the two
 * store badges. It takes no settings: every reel ends on exactly this frame,
 * with the same words, voice line and length, so the ending is recognised and
 * changed in one place. A reel keeps its own look up to here.
 */
const AppEndCard: React.FC = () => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const logo = useLand(0.05, 200);
	const phone = useLand(0.15, 140, 18);
	const button = useLand(0.55, 220, 16);
	const stores = interpolate(seconds, [0.8, 1.1], [0, 1], CLAMP);
	const float = Math.sin(seconds * 2.2) * 6;
	return (
		<PromoStage ground={<AbsoluteFill style={{background: APP_END_CARD.ground}} />}>
			<At y={40} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
					<BrandMark size="card" color={APP_END_CARD.ink} />
				</div>
			</At>
			<At y={interpolate(phone, [0, 1], [380, 210]) + float} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: Math.min(1, phone * 1.4)}}>
					<PhoneShot width={380}>
						<HubScreen />
					</PhoneShot>
				</div>
			</At>
			<At y={1110} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30)}}>
					<div style={{opacity: button, transform: `scale(${interpolate(button, [0, 1], [0.8, 1])})`, padding: `${u(26)}px ${u(64)}px`, borderRadius: u(999), background: APP_END_CARD.button, boxShadow: `0 ${u(18)}px ${u(36)}px -${u(16)}px ${APP_END_CARD.button}`}}>
						<Text size={TYPE.adScale.action * 1.4} weight={TYPE.weights.kinetic} color={APP_END_CARD.buttonText}>
							{APP_END_CARD.cta}
						</Text>
					</div>
					<div style={{opacity: stores, transform: `translateY(${u((1 - stores) * 16)}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(18)}}>
						<StoreBadges height={96} />
						<Text size={TYPE.adScale.action * 0.9} weight={TYPE.weights.strong} color={APP_END_CARD.muted} align="center">
							{APP_END_CARD.site}
						</Text>
					</div>
				</div>
			</At>
		</PromoStage>
	);
};

/**
 * The app card as a reel's last scene. Narrated reels say the card's one line
 * (`narrate`); silent videos (`narrate` omitted) show it without a voice. The
 * card always lasts APP_END_CARD.seconds, longer only if the voice needs it.
 * `enabled: false` (the content's `outro.enabled`) drops it, as for national
 * and religious holidays, which end on the logo alone.
 */
export const appEndScenes = (enabled: boolean, narrate?: Narrator): TemplateScene[] => {
	if (!enabled) return [];
	const element = <AppEndCard />;
	if (!narrate) return [{id: OUTRO_SCENE_ID, seconds: APP_END_CARD.seconds, label: 'Kapanış', silent: true, element}];
	const said = narrate(APP_END_CARD.voiceId, APP_END_CARD.narration, APP_END_CARD.seconds, APP_END_CARD.seconds);
	// The card's words are fixed: a job's script cannot change them.
	const voice = {...said, text: APP_END_CARD.narration, seconds: Math.max(APP_END_CARD.seconds, said.seconds)};
	return [{id: OUTRO_SCENE_ID, seconds: voice.seconds, label: 'Kapanış', voice: [voice], element}];
};

/** The closing of the narrated lesson and education templates: the same app card, unless the content turns it off. */
export const outroScenes = (outro: Outro, narrate: Narrator): TemplateScene[] => appEndScenes(outro.enabled, narrate);
