import React from 'react';
import {interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {VoiceOrb, type VoiceTrack} from '../../../../Components/Overlays/VoiceOrb';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {C, CLAMP, Stage, useSeconds} from './IntroKit';

// ─── 1. Hook ────────────────────────────────────────────────────────────────

/** Short beats, each slammed in as it is said ("120 soru." "165 dakika." "Tek bir sabah."), on navy; SinoAI's orb listening. */
export const HookScene: React.FC<{beats: readonly string[]; at: readonly number[]; voice: readonly VoiceTrack[]}> = ({beats, at, voice}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	return (
		<Stage ground={`radial-gradient(70% 90% at 80% 10%, #16304F 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`}>
			<div style={{position: 'absolute', left: u(120), top: u(250), display: 'flex', flexDirection: 'column', gap: u(10)}}>
				{beats.map((beat, index) => {
					const shown = now >= at[index];
					const last = index === beats.length - 1;
					const next = at[index + 1] ?? Infinity;
					const scale = interpolate(now, [at[index], at[index] + 0.18], [1.25, 1], CLAMP);
					return (
						<div key={beat} style={{opacity: shown ? (last || now < next ? 1 : 0.38) : 0, transform: `scale(${scale})`, transformOrigin: 'left center'}}>
							<Text variant="display" size={last ? 150 : 128} weight={TYPE.weights.kinetic} color={last ? C.orange : C.white} style={{lineHeight: 1, letterSpacing: '-0.04em'}}>
								{beat}
							</Text>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', right: u(170), bottom: u(150)}}>
				<VoiceOrb size={230} color={C.orange} tracks={voice} delaySeconds={0.3} />
			</div>
		</Stage>
	);
};
