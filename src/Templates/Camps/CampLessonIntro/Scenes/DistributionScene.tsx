import React from 'react';
import {interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {withAlpha} from '../../../../Themes/Theme';
import {Box, C, CLAMP, Kicker, Rise, Stage, useSeconds} from '../../CampIntro/Scenes/IntroKit';

type Row = {title: string; questions: number};

/**
 * Where the lesson's questions come from: on the left the lesson's share of its test ("40 soru" of Temel Matematik,
 * and the test it sits in, on screen from the start); on the right the topics ÖSYM asked most in the period, one bar
 * each, in order of questions. A bar grows when the narration names its topic; the bars it never names follow after
 * the last named one (owner, 9 Nov 2026: Problemler first, then the named ones top down, then the rest). With `counts` off (a lesson whose questions are only partly mapped) the bars keep their order
 * and proportions but show no numbers. The source line under them says the mapping is approximate.
 */
export const DistributionScene: React.FC<{
	kicker: string;
	color: string;
	test: {name: string; questions: string; note?: string};
	period: string;
	rows: readonly Row[];
	counts: boolean;
	source: string;
	testAt: number;
	rowAt: readonly number[];
}> = ({kicker, color, test, period, rows, counts, source, testAt, rowAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const most = Math.max(1, ...rows.map((row) => row.questions));
	const barRoom = 1000;
	const rowHeight = Math.min(84, 600 / Math.max(1, rows.length));
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={color} />
			<Box x={120} y={170} w={560}>
				<Rise at={Math.min(testAt, 0.3)}>
					<Text variant="label" size={30} weight={TYPE.weights.display} color={C.muted} style={{letterSpacing: '0.06em', textTransform: 'uppercase'}}>
						{test.name}
					</Text>
					<Text variant="display" size={190} weight={TYPE.weights.kinetic} color={color} style={{lineHeight: 0.95, letterSpacing: '-0.05em', marginTop: u(10)}}>
						{test.questions}
					</Text>
					<Text variant="display" size={56} weight={TYPE.weights.kinetic} color={C.ink} style={{marginTop: u(4)}}>
						soru
					</Text>
					{test.note ? (
						<Text size={32} weight={TYPE.weights.strong} color={C.muted} style={{marginTop: u(28), lineHeight: 1.35}}>
							{test.note}
						</Text>
					) : null}
				</Rise>
			</Box>
			<Box x={740} y={150} w={1060}>
				<Rise at={0.1}>
					<Text size={34} weight={TYPE.weights.kinetic} color={C.ink}>
						{counts ? `En çok soru gelen konular · ${period}` : `En çok soru gelen konular (sıralama) · ${period}`}
					</Text>
				</Rise>
				<div style={{marginTop: u(30), display: 'flex', flexDirection: 'column', gap: u(Math.max(8, rowHeight * 0.18))}}>
					{rows.map((row, index) => {
						const at = rowAt[index] ?? 0.6 + index * 0.4;
						const grow = interpolate(now, [at, at + 0.6], [0, 1], CLAMP);
						const width = Math.max(18, (row.questions / most) * barRoom) * grow;
						return (
							<div key={row.title} style={{opacity: Math.min(1, grow * 3)}}>
								<Text size={Math.min(30, rowHeight * 0.38)} weight={TYPE.weights.display} color={C.ink} style={{lineHeight: 1.15}}>
									{row.title}
								</Text>
								<div style={{display: 'flex', alignItems: 'center', gap: u(14), marginTop: u(4)}}>
									<div style={{width: u(width), height: u(Math.min(30, rowHeight * 0.36)), borderRadius: u(10), background: index === 0 ? color : withAlpha(color, 0.55)}} />
									{counts ? (
										<Text size={Math.min(30, rowHeight * 0.38)} weight={TYPE.weights.kinetic} color={index === 0 ? color : C.ink} style={{fontVariantNumeric: 'tabular-nums'}}>
											{Math.round(row.questions * grow)}
										</Text>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</Box>
			<Box x={740} y={985} w={1060}>
				<Text size={22} weight={TYPE.weights.strong} color={C.muted}>
					{source}
				</Text>
			</Box>
		</Stage>
	);
};

/**
 * When each bar grows, from when its topic is heard (undefined: never named). Named bars keep their order even when a
 * cue comes early; the unnamed ones follow the last named bar one by one, before the scene ends.
 */
export const barTimes = (heard: readonly (number | undefined)[], seconds: number): number[] => {
	let last = 0.6;
	const named = heard.map((at) => (at === undefined ? undefined : (last = Math.max(last, at))));
	const unnamed = named.filter((at) => at === undefined).length;
	const room = Math.max(0, seconds - 0.4 - last);
	const step = Math.min(0.3, room / (unnamed + 1));
	const first = last + Math.min(1, Math.max(step, room - step * unnamed));
	let rest = 0;
	return named.map((at) => at ?? first + step * rest++);
};
