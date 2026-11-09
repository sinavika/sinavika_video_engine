import React from 'react';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Box, C, Kicker, Rise, Stage} from '../../CampIntro/Scenes/IntroKit';

type Step = {badge: string; title: string};

/**
 * The bridge into the lesson moments (owner, 9 Nov 2026): a question that wakes the viewer ("Peki dersler nasıl
 * ilerleyecek?"), then the moments to come as a numbered list, each landing in turn, and the promise of the box that
 * sits beside every one of them. On navy, like the moments it leads into.
 */
export const LessonFlowScene: React.FC<{kicker: string; color: string; title: string; steps: readonly Step[]; stepAt: readonly number[]; promise: string; promiseAt: number}> = ({kicker, color, title, steps, stepAt, promise, promiseAt}) => {
	const {u} = useVideoLayout();
	return (
		<Stage ground={C.navy}>
			<Kicker text={kicker} color={C.white} />
			<Box x={120} y={150} w={1680}>
				<Rise at={0.1}>
					<Text variant="display" size={104} weight={TYPE.weights.kinetic} color={C.white} style={{letterSpacing: '-0.03em', lineHeight: 1.04}}>
						{title}
					</Text>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(360), width: u(1680), display: 'flex', flexDirection: 'column', gap: u(18)}}>
				{steps.map((step, index) => (
					<Rise key={step.badge + step.title} at={stepAt[index] ?? 0.8 + index * 0.5} distance={40}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(28)}}>
							<div style={{width: u(64), height: u(64), flexShrink: 0, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Text size={32} weight={TYPE.weights.kinetic} color={C.white}>
									{index + 1}
								</Text>
							</div>
							<Text size={44} weight={TYPE.weights.kinetic} color={C.white} style={{whiteSpace: 'nowrap'}}>
								{step.badge}
							</Text>
							<Text size={36} weight={TYPE.weights.strong} color="rgba(255,255,255,0.68)" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0}}>
								{step.title}
							</Text>
						</div>
					</Rise>
				))}
			</div>
			<Box x={120} y={930} w={1680}>
				<Rise at={promiseAt}>
					<div style={{display: 'inline-block', padding: `${u(16)}px ${u(30)}px`, borderRadius: u(20), background: 'rgba(255,255,255,0.1)', border: `${u(2)}px solid rgba(255,255,255,0.2)`}}>
						<Text size={34} weight={TYPE.weights.kinetic} color={C.white}>
							{promise}
						</Text>
					</div>
				</Rise>
			</Box>
		</Stage>
	);
};
