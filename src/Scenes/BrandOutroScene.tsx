import React from 'react';
import {Animated} from '../Components/Animations/Animated';
import {SafeArea} from '../Components/Layouts/SafeArea';
import {BrandMark} from '../Components/Overlays/BrandMark';
import {Badge} from '../Components/Typography/Badge';
import {Text} from '../Components/Typography/Text';
import {BRAND} from '../Configurations/Brand';
import type {Outro} from '../Schemas/VideoProps';
import {SPACING} from '../Themes/DesignTokens';
import type {TemplateScene} from './ScenePlan';
import type {Narrator} from './Voiceover';

export const OUTRO_SCENE_ID = 'outro';
const OUTRO_SECONDS = 2.6;

const BrandOutroScene: React.FC<{callToAction: string}> = ({callToAction}) => (
	<SafeArea gap={SPACING.xl} style={{alignItems: 'center', justifyContent: 'center'}}>
		<Animated animation={{preset: 'scale', easing: 'overshoot'}}>
			<BrandMark size="hero" />
		</Animated>
		<Animated animation="fade" delaySeconds={0.35}>
			<Text variant="subtitle" tone="muted" align="center">
				{BRAND.tagline}
			</Text>
		</Animated>
		<Animated animation={{preset: 'slide', direction: 'up'}} delaySeconds={0.7}>
			<Badge tone="primary" icon="arrowRight" size={32}>
				{callToAction}
			</Badge>
		</Animated>
	</SafeArea>
);

/** The closing brand card every template ends with, unless the content disables it. */
export const outroScenes = (outro: Outro, narrate: Narrator): TemplateScene[] => {
	if (!outro.enabled) return [];
	const voice = narrate(OUTRO_SCENE_ID, `Daha fazlası için: ${outro.callToAction}!`, OUTRO_SECONDS, OUTRO_SECONDS);
	return [
		{
			id: OUTRO_SCENE_ID,
			seconds: voice.seconds,
			label: 'Kapanış',
			voice: [voice],
			element: <BrandOutroScene callToAction={outro.callToAction} />,
		},
	];
};
