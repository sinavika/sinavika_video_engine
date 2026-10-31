import React from 'react';
import {Easing, interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Box, C, CLAMP, Kicker, Rise, Stage, Title, useSeconds} from './IntroKit';

// ─── 8. Method ──────────────────────────────────────────────────────────────

const STEP_CIRCLE = 240;

/**
 * Steps as numbered circles, each landing when its number is said. The line
 * between them is drawn at the pace of the narration: it leaves a circle when
 * that step is said and reaches the next one exactly when the next is said,
 * rather than shooting across at once (owner, 26 Oct 2026). Each step's words
 * sit centred under its circle.
 */
export const MethodScene: React.FC<{kicker: string; title: string; steps: readonly string[]; stepAt: readonly number[]}> = ({kicker, title, steps, stepAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const width = 1680;
	const column = width / steps.length;
	const centre = (index: number) => 120 + column * index + column / 2;
	// How far along the line is, in steps: 0 at the first circle, steps.length - 1 at the last.
	let along = 0;
	for (let index = 0; index < steps.length - 1; index++) {
		along += interpolate(now, [stepAt[index] + 0.2, Math.max(stepAt[index] + 0.4, stepAt[index + 1])], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.quad)});
	}
	const lineTop = 400 + STEP_CIRCLE / 2 - 3;
	return (
		<Stage ground={`radial-gradient(80% 90% at 85% 100%, #16304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={title} color={C.white} />
			<div style={{position: 'absolute', left: u(centre(0)), top: u(lineTop), width: u(column * along), height: u(6), background: C.orange, borderRadius: u(3)}} />
			{steps.map((text, index) => (
				<Box key={text} x={120 + column * index} y={400} w={column}>
					<Rise at={stepAt[index]}>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<div style={{width: u(STEP_CIRCLE), height: u(STEP_CIRCLE), borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${u(14)}px rgba(234,88,12,0.18)`}}>
								<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={C.white} align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
									{index + 1}
								</Text>
							</div>
							<Text size={48} weight={TYPE.weights.kinetic} color={C.white} align="center" style={{marginTop: u(44), lineHeight: 1.15, maxWidth: u(column - 60)}}>
								{text}
							</Text>
						</div>
					</Rise>
				</Box>
			))}
		</Stage>
	);
};
