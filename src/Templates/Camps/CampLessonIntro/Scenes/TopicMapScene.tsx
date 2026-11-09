import React from 'react';
import {interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {withAlpha} from '../../../../Themes/Theme';
import {Box, C, CLAMP, Kicker, Rise, Stage, useSeconds} from '../../CampIntro/Scenes/IntroKit';

type Topic = {title: string; subtopics: number};

/**
 * The lesson's camp as a map: every konu as a numbered tile in the lesson colour, in teaching order, with its count of
 * alt konular; the number of konular and the average count of alt konular count up while they are said. Tiles named
 * in `focus` (the topics the narration singles out) light up when they are heard.
 */
export const TopicMapScene: React.FC<{kicker: string; color: string; topics: readonly Topic[]; average: number; countAt: number; focus: readonly {index: number; at: number}[]}> = ({kicker, color, topics, average, countAt, focus}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const counted = Math.round(interpolate(now, [0.5, Math.max(1, countAt)], [0, topics.length], CLAMP));
	const averaged = Math.round(interpolate(now, [Math.max(1, countAt), Math.max(1.6, countAt + 0.8)], [0, average], CLAMP));
	const columns = topics.length > 24 ? 5 : topics.length > 12 ? 4 : 3;
	const rows = Math.ceil(topics.length / columns);
	const gap = 14;
	const height = Math.min(118, (700 - gap * (rows - 1)) / rows);
	const title = Math.min(28, height * 0.26);
	return (
		<Stage ground={C.white}>
			<Kicker text={kicker} color={color} />
			<Box x={120} y={128}>
				<Rise at={0.1}>
					<div style={{display: 'flex', alignItems: 'baseline', gap: u(22)}}>
						<Text variant="display" size={132} weight={TYPE.weights.kinetic} color={color} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em'}}>
							{counted}
						</Text>
						<Text variant="display" size={58} weight={TYPE.weights.kinetic} color={C.ink}>
							konu
						</Text>
						<Text variant="display" size={58} weight={TYPE.weights.kinetic} color={C.muted} style={{marginLeft: u(26)}}>
							· konu başına ortalama {averaged} alt konu
						</Text>
					</div>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(320), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: u(gap)}}>
				{topics.map((topic, index) => {
					const lit = focus.find((entry) => entry.index === index);
					const glow = lit ? interpolate(now, [lit.at, lit.at + 0.35], [0, 1], CLAMP) : 0;
					return (
						<Rise key={topic.title} at={0.5 + (index * Math.max(0.5, countAt - 0.5)) / topics.length} distance={30}>
							<div style={{height: u(height), boxSizing: 'border-box', padding: `0 ${u(18)}px`, borderRadius: u(20), display: 'flex', alignItems: 'center', gap: u(14), background: glow > 0 ? withAlpha(color, 0.12 + 0.88 * glow) : withAlpha(color, 0.1), border: `${u(2)}px solid ${withAlpha(color, 0.35)}`, transform: `scale(${1 + 0.04 * glow})`}}>
								<div style={{width: u(height * 0.5), height: u(height * 0.5), flexShrink: 0, borderRadius: '50%', background: glow > 0.5 ? C.white : color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Text size={height * 0.24} weight={TYPE.weights.kinetic} color={glow > 0.5 ? color : C.white}>
										{index + 1}
									</Text>
								</div>
								<div style={{flex: 1, minWidth: 0}}>
									<Text size={title} weight={TYPE.weights.kinetic} color={glow > 0.5 ? C.white : C.ink} style={{lineHeight: 1.05, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
										{topic.title}
									</Text>
									<Text size={title * 0.72} weight={TYPE.weights.strong} color={glow > 0.5 ? 'rgba(255,255,255,0.85)' : C.muted}>
										{topic.subtopics} alt konu
									</Text>
								</div>
							</div>
						</Rise>
					);
				})}
			</div>
		</Stage>
	);
};
