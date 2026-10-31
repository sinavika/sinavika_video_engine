import React from 'react';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../../Components/Overlays/BrandMark';
import {VoiceOrb, type VoiceTrack} from '../../../../Components/Overlays/VoiceOrb';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Box, C, lessonColor, Rise, Stage, usePop, useProgress} from './IntroKit';

// ─── 2. Welcome: the episode card ───────────────────────────────────────────

/** A giant "0", the series and the title, the camp's lesson colours as one stripe, SinoAI greeting. */
export const WelcomeScene: React.FC<{series: string; label: string; title: string; lessons: readonly string[]; voice: readonly VoiceTrack[]}> = ({series, label, title, lessons, voice}) => {
	const {u} = useVideoLayout();
	const zero = usePop(0.1);
	const stripe = useProgress(0.6, 1.8);
	return (
		<Stage ground={C.paper}>
			<Box x={110} y={120}>
				<div style={{transform: `scale(${0.6 + zero * 0.4})`, opacity: zero, transformOrigin: 'left top'}}>
					<Text variant="display" size={760} weight={TYPE.weights.kinetic} color={C.orange} style={{lineHeight: 0.82, letterSpacing: '-0.08em'}}>
						0
					</Text>
				</div>
			</Box>
			<Box x={760} y={300} w={1000}>
				<Rise at={0.35}>
					<Text variant="label" size={34} weight={TYPE.weights.display} color={C.orange} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
						{series}
					</Text>
				</Rise>
				<Rise at={0.55}>
					<Text variant="display" size={118} weight={TYPE.weights.kinetic} color={C.ink} style={{lineHeight: 1.02, letterSpacing: '-0.035em', marginTop: u(14)}}>
						{title}
					</Text>
				</Rise>
				<Rise at={0.8}>
					<Text size={40} weight={TYPE.weights.strong} color={C.muted} style={{marginTop: u(18)}}>
						{label}
					</Text>
				</Rise>
			</Box>
			{/* The camp's lessons as one stripe of their colours, drawn left to right. */}
			<div style={{position: 'absolute', left: u(760), top: u(700), width: u(1000) * stripe, height: u(16), display: 'flex', borderRadius: u(8), overflow: 'hidden'}}>
				{lessons.map((code) => (
					<div key={code} style={{flex: 1, background: lessonColor(code)}} />
				))}
			</div>
			<Box x={760} y={790}>
				<Rise at={1.2}>
					<BrandMark size="card" color={C.ink} />
				</Rise>
			</Box>
			<div style={{position: 'absolute', right: u(130), bottom: u(110)}}>
				<VoiceOrb size={190} color={C.orange} tracks={voice} delaySeconds={0.4} />
			</div>
		</Stage>
	);
};
