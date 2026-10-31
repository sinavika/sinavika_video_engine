import React from 'react';
import {interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Icon} from '../../../../UIUX/Icons';
import {Box, C, CLAMP, Kicker, lessonColor, Rise, Stage, useSeconds} from './IntroKit';

// ─── 6. The camp's map ──────────────────────────────────────────────────────

type IntroCampLesson = {code: string; name: string; topics: number};

/**
 * One tile per camp, in its lesson colour with its lesson count (the map, all
 * at once); the total counts up until it is said, the first camp lights up
 * when it is named, the pace lands with its words.
 */
export const CampMapScene: React.FC<{kicker: string; lessons: readonly IntroCampLesson[]; first: string; cadence: string; totalAt: number; firstAt: number; cadenceAt: number}> = ({kicker, lessons, first, cadence, totalAt, firstAt, cadenceAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const total = lessons.reduce((sum, lesson) => sum + lesson.topics, 0);
	const counted = Math.round(interpolate(now, [0.6, Math.max(1.2, totalAt)], [0, total], CLAMP));
	const columns = Math.min(5, lessons.length);
	const lit = interpolate(now, [firstAt, firstAt + 0.3], [0, 1], CLAMP);
	const glow = 0.5 + 0.5 * Math.sin(now * 3);
	return (
		<Stage ground={C.white}>
			<Kicker text={kicker} color={C.orange} />
			<Box x={120} y={130}>
				<Rise at={0.1}>
					<div style={{display: 'flex', alignItems: 'baseline', gap: u(24)}}>
						<Text variant="display" size={150} weight={TYPE.weights.kinetic} color={C.orange} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em'}}>
							{counted}
						</Text>
						<Text variant="display" size={64} weight={TYPE.weights.kinetic} color={C.ink}>
							ders · {counted} kısa video
						</Text>
					</div>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(370), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: u(22)}}>
				{lessons.map((lesson, index) => {
					const isFirst = lesson.code === first;
					return (
						<Rise key={lesson.code} at={0.4 + index * 0.08}>
							<div style={{position: 'relative', height: u(230), boxSizing: 'border-box', padding: u(26), borderRadius: u(30), background: lessonColor(lesson.code), color: C.white, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: isFirst && lit > 0 ? `0 0 0 ${u(6)}px ${C.white}, 0 0 0 ${u((12 + glow * 8) * lit)}px ${C.orange}` : `0 ${u(16)}px ${u(36)}px -${u(24)}px rgba(0,0,0,0.5)`}}>
								<Text size={38} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1.08}}>
									{lesson.name}
								</Text>
								<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
									<Text size={58} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1}}>
										{lesson.topics}
									</Text>
									<Text size={26} weight={TYPE.weights.display} color="rgba(255,255,255,0.85)">
										ders
									</Text>
								</div>
								{isFirst ? (
									<div style={{position: 'absolute', top: -u(20), right: u(20), padding: `${u(6)}px ${u(16)}px`, borderRadius: u(999), background: C.orange, opacity: lit, transform: `scale(${0.8 + 0.2 * lit})`}}>
										<Text size={22} weight={TYPE.weights.kinetic} color={C.white}>
											Başlıyoruz
										</Text>
									</div>
								) : null}
							</div>
						</Rise>
					);
				})}
			</div>
			<Box x={120} y={930}>
				<Rise at={cadenceAt}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: u(14), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: C.orangeSoft}}>
						<Icon name="calendar" size={u(34)} color={C.orange} stroke={2.2} />
						<Text size={34} weight={TYPE.weights.display} color={C.orange}>
							{cadence}
						</Text>
					</div>
				</Rise>
			</Box>
		</Stage>
	);
};
