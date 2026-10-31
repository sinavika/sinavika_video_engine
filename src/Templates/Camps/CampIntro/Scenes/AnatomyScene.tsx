import React from 'react';
import {interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Box, C, CLAMP, Kicker, lessonColor, Rise, Stage, Title, useProgress, useSeconds} from './IntroKit';

// ─── 3. The exam's anatomy ──────────────────────────────────────────────────

type IntroTest = {name: string; questions: number; lesson?: string; parts?: readonly {name: string; questions: number}[]};

const TEST_FALLBACK = ['#BE185D', '#1E40AF', '#8A4B16', '#0F766E', '#475569'];

/**
 * Every question of the exam as a cell, twenty a row. A test's cells fill in
 * its lesson colour and its name lands while the narrator names it; the
 * clock ring runs when the minutes are said.
 */
export const AnatomyScene: React.FC<{kicker: string; exam: string; name: string; questions: number; minutes: number; tests: readonly IntroTest[]; testAt: readonly number[]; clockAt: number}> = ({kicker, exam, name, questions, minutes, tests, testAt, clockAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const perRow = 20;
	const cell = 34;
	const gap = 8;
	const colorOf = (test: IntroTest, index: number) => (test.lesson ? lessonColor(test.lesson) : TEST_FALLBACK[index % TEST_FALLBACK.length]);
	const cells: string[] = tests.flatMap((test, index) => Array.from({length: test.questions}, () => colorOf(test, index)));
	// A test's cells fill from the moment it is named, within about a second, never past the next test's moment.
	const filled = tests.reduce((count, test, index) => {
		const start = testAt[index];
		const end = Math.min(start + 1.1, testAt[index + 1] ?? Infinity);
		const share = interpolate(now, [start, Math.max(start + 0.2, end)], [0, 1], CLAMP);
		const result = count + Math.round(test.questions * share);
		return result;
	}, 0);
	const clock = useProgress(clockAt, clockAt + 1.6);
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={`${exam} · ${name}`} />
			<div style={{position: 'absolute', left: u(120), top: u(330), display: 'grid', gridTemplateColumns: `repeat(${perRow}, ${u(cell)}px)`, gap: u(gap)}}>
				{cells.map((color, index) => (
					<div key={index} style={{width: u(cell), height: u(cell), borderRadius: u(8), background: index < filled ? color : C.line, transform: `scale(${index < filled ? 1 : 0.86})`}} />
				))}
			</div>
			<div style={{position: 'absolute', left: u(1000), top: u(330), width: u(560), display: 'flex', flexDirection: 'column', gap: u(22)}}>
				{tests.map((test, index) => (
					<Rise key={test.name} at={testAt[index]}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
							<div style={{width: u(22), height: u(22), borderRadius: u(6), background: colorOf(test, index)}} />
							<Text size={40} weight={TYPE.weights.display} color={C.ink} style={{flex: 1}}>
								{test.name}
							</Text>
							<Text size={40} weight={TYPE.weights.kinetic} color={C.ink} style={{fontVariantNumeric: 'tabular-nums'}}>
								{test.questions}
							</Text>
						</div>
						{test.parts?.length ? (
							<Text size={24} weight={TYPE.weights.strong} color={C.muted} style={{marginLeft: u(40), marginTop: u(4)}}>
								{test.parts.map((part) => `${part.name} ${part.questions}`).join(' · ')}
							</Text>
						) : null}
					</Rise>
				))}
			</div>
			{/* The clock: the exam's minutes as a ring. */}
			<div style={{position: 'absolute', right: u(110), top: u(110), width: u(220), height: u(220), opacity: Math.min(1, clock * 4)}}>
				<svg width={u(220)} height={u(220)} viewBox="0 0 220 220">
					<circle cx={110} cy={110} r={94} fill="none" stroke={C.line} strokeWidth={16} />
					<circle cx={110} cy={110} r={94} fill="none" stroke={C.orange} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${590 * clock} 600`} transform="rotate(-90 110 110)" />
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<Text size={64} weight={TYPE.weights.kinetic} color={C.ink} align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
						{Math.round(minutes * clock)}
					</Text>
					<Text size={24} weight={TYPE.weights.display} color={C.muted} align="center">
						dakika
					</Text>
				</div>
			</div>
			<Box x={120} y={940}>
				<Text size={34} weight={TYPE.weights.display} color={C.muted}>
					<span style={{color: C.ink, fontWeight: TYPE.weights.kinetic, fontVariantNumeric: 'tabular-nums'}}>{filled}</span> / {questions} soru
				</Text>
			</Box>
		</Stage>
	);
};
