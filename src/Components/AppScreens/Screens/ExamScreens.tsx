import React from 'react';
import {AppButton, AppCard, AppChip, AppIcon, AppOverline, AppProgressBar, AppPromoCard, AppScreenFrame, AppText, useAppColors} from '../AppScreenParts';

/** Sample data for the exam screens: a product demo, not a claim about results. */
const NET_TREND = [52, 58, 55, 63, 67, 66, 72, 78];
const LESSON_NETS: readonly {lesson: string; share: number}[] = [
	{lesson: 'Türkçe', share: 0.82},
	{lesson: 'Matematik', share: 0.64},
	{lesson: 'Fen', share: 0.55},
	{lesson: 'Sosyal', share: 0.74},
];

const NetChart: React.FC<{width: number; height: number}> = ({width, height}) => {
	const colors = useAppColors();
	const points = NET_TREND.map((net, index) => [(index / (NET_TREND.length - 1)) * width, height - ((net - 45) / 40) * height] as const);
	const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
	const [lastX, lastY] = points[points.length - 1];
	return (
		<svg width={width} height={height + 8} viewBox={`0 -4 ${width} ${height + 8}`} style={{overflow: 'visible'}}>
			<path d={`${line} L${width} ${height} L0 ${height} Z`} fill={colors.primarySoft} />
			<path d={line} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={lastX} cy={lastY} r={6} fill={colors.primary} stroke={colors.card} strokeWidth={3} />
		</svg>
	);
};

const LessonBars: React.FC = () => (
	<>
		{LESSON_NETS.map((row) => (
			<div key={row.lesson} style={{display: 'flex', alignItems: 'center', gap: 10}}>
				<AppText size="label" weight={600} style={{width: 78}}>
					{row.lesson}
				</AppText>
				<AppProgressBar share={row.share} height={8} />
			</div>
		))}
	</>
);

/** Denemeler › Ana sayfa: the exam module's home. */
export const ExamHomeScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Exam" title="Denemeler" activeTab={0}>
			<AppPromoCard label="Denemelerim" title="Deneme listesi" description="Yayındaki denemeleri görüntüle ve çözmeye başla." action="Denemelere git" />
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<AppOverline>Ders ve konu gelişimi</AppOverline>
					<AppText size="caption" weight={700} color={colors.primary}>
						Tüm istatistikler
					</AppText>
				</div>
				<LessonBars />
			</AppCard>
			<div style={{display: 'flex', gap: 10}}>
				{[
					{label: 'Net', value: '78,5'},
					{label: 'Doğru', value: '86'},
					{label: 'Yanlış', value: '30'},
				].map((stat) => (
					<AppCard key={stat.label} padding={14} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>
						<AppText size="caption" weight={700} color={colors.muted}>
							{stat.label}
						</AppText>
						<AppText size={22} weight={800}>
							{stat.value}
						</AppText>
					</AppCard>
				))}
			</div>
		</AppScreenFrame>
	);
};

export type ExamQuestion = {lesson: string; number: number; total: number; text: string; options: string[]; selected?: number; remaining: string};

const SAMPLE_QUESTION: ExamQuestion = {
	lesson: 'Temel Matematik',
	number: 12,
	total: 40,
	text: '3(x − 2) + 4 = 2x + 7 denklemini sağlayan x değeri kaçtır?',
	options: ['7', '8', '9', '10', '11'],
	selected: 2,
	remaining: '118:42',
};

/** Denemeler › a question being solved. Pass `question` to show a real one. */
export const ExamSolveScreen: React.FC<{question?: ExamQuestion}> = ({question = SAMPLE_QUESTION}) => {
	const colors = useAppColors();
	return (
		<AppScreenFrame
			module="Exam"
			title="TYT Denemesi"
			activeTab={1}
			trailing={
				<div style={{display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, backgroundColor: colors.primarySoft}}>
					<AppIcon name="clock" size={15} color={colors.onPrimarySoft} />
					<AppText size="label" weight={700} color={colors.onPrimarySoft}>
						{question.remaining}
					</AppText>
				</div>
			}
		>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				<AppText size="label" weight={700}>
					{question.lesson} · Soru {question.number}
				</AppText>
				<AppText size={12} color={colors.muted}>
					{question.number} / {question.total}
				</AppText>
			</div>
			<div style={{display: 'flex'}}>
				<AppProgressBar share={question.number / question.total} />
			</div>
			<AppCard padding={18}>
				<AppText size="headline" weight={600} style={{lineHeight: 1.45}}>
					{question.text}
				</AppText>
			</AppCard>
			<div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
				{question.options.map((option, index) => {
					const selected = index === question.selected;
					return (
						<div key={option} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, backgroundColor: selected ? colors.primarySoft : colors.card, border: `1.5px solid ${selected ? colors.primary : colors.outline}`}}>
							<div style={{width: 30, height: 30, borderRadius: 15, backgroundColor: selected ? colors.primary : colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<AppText size="label" weight={800} color={selected ? colors.onPrimary : colors.text}>
									{'ABCDE'[index]}
								</AppText>
							</div>
							<AppText size={16} weight={600}>
								{option}
							</AppText>
						</div>
					);
				})}
			</div>
			<div style={{display: 'flex', gap: 10, marginTop: 'auto', paddingBottom: 14}}>
				<AppButton tone="neutral" grow>
					Önceki
				</AppButton>
				<AppButton grow>Sonraki</AppButton>
			</div>
		</AppScreenFrame>
	);
};

/** Denemeler › İstatistikler: what a finished exam tells you. */
export const ExamStatsScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Exam" title="İstatistikler" activeTab={3}>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<AppOverline>Net trendi</AppOverline>
					<AppChip tone="success">Net değişimi +6,5</AppChip>
				</div>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
					<AppText size={34} weight={800}>
						78,5
					</AppText>
					<AppText size={15} weight={600} color={colors.muted}>
						Son net
					</AppText>
				</div>
				<NetChart width={314} height={110} />
			</AppCard>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<AppOverline>Genel gelişim</AppOverline>
				<LessonBars />
			</AppCard>
			<div style={{display: 'flex', gap: 10}}>
				<AppCard padding={14} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
					<AppText size={12} weight={700} color={colors.muted}>
						Başarı oranı
					</AppText>
					<AppText size={20} weight={800}>
						%72
					</AppText>
				</AppCard>
				<AppCard padding={14} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
					<AppText size={12} weight={700} color={colors.muted}>
						Sınav neti
					</AppText>
					<AppText size={20} weight={800}>
						86 D · 30 Y
					</AppText>
				</AppCard>
			</div>
		</AppScreenFrame>
	);
};
