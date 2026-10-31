import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {Bar, Button, Card, Chip, Levels, OptionRow, Stack, TEST_LEVELS, Text, Tile} from '../../Parts/Shared';
import {Grid, Immersive, ModuleBanner, ModuleHead, Panel} from '../../Parts/Web';

/** Testler (Quizzes) on the web panel. */

export const WebTestsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={0} title={t('Testler', 'Quizzes')} sub={t('Kolay, Orta, Zor · her seviye 20 soru', 'Easy, Medium, Hard · 20 questions each')} actions={<Button tone="ghost" icon="search">{t('Konu ara', 'Find topic')}</Button>} />
			<Grid columns="1fr 2fr">
				<ModuleBanner module="tests" over={t('Senin için hazır', 'Ready for you')} title={t('Problemler · Orta', 'Problems · Medium')} text={t('Denemede en çok net kaybettiğin konu. 20 soru, anında açıklama.', 'Where you lost most. 20 questions, instant feedback.')} action={t('Teste başla', 'Start quiz')} />
				<Grid columns="1fr 1fr" gap={14}>
					{[['Türkçe', 'Turkish', 12, 30], ['Matematik', 'Maths', 9, 35], ['Geometri', 'Geometry', 3, 20], ['Fizik', 'Physics', 5, 18], ['Kimya', 'Chemistry', 4, 16], ['Biyoloji', 'Biology', 2, 14]].map(([tr, en, done, total]) => (
						<Card key={tr as string} padding={16}>
							<Stack row gap={12}>
								<Tile module="tests" icon="book" size={40} />
								<Stack grow gap={6}>
									<Stack row justify="space-between">
										<Text role="headline">{t(tr as string, en as string)}</Text>
										<Text role="meta">
											{done} / {total}
										</Text>
									</Stack>
									<Bar value={(done as number) / (total as number)} color={mod.color} track={mod.track} height={6} />
								</Stack>
								<Icon name="right" size={18} color={colors.subtle} />
							</Stack>
						</Card>
					))}
				</Grid>
			</Grid>
		</Panel>
	);
};

export const WebTestTopicsScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests" crumb={t('Testler ›', 'Quizzes ›')}>
			<ModuleHead module="tests" tab={1} title={t('Matematik', 'Maths')} sub={t('25 konu · 9 tamamlandı', '25 topics · 9 complete')} />
			<Grid columns="repeat(3, 1fr)" gap={14}>
				{[
					['Temel kavramlar', 'Basics', 3],
					['Sayı basamakları', 'Digits', 3],
					['Bölünebilme', 'Divisibility', 2],
					['Rasyonel sayılar', 'Rationals', 1],
					['Problemler', 'Problems', 1],
					['Oran ve orantı', 'Ratio', 0],
					['Fonksiyonlar', 'Functions', 0],
					['Kümeler', 'Sets', 0],
					['Mantık', 'Logic', 0],
				].map(([tr, en, level]) => (
					<Card key={tr as string} padding={16} tone={tr === 'Rasyonel sayılar' ? 'moduleLine' : 'card'} module="tests">
						<Stack gap={10}>
							<Stack row justify="space-between">
								<Text role="headline">{t(tr as string, en as string)}</Text>
								<Levels done={level as number} color={mod.color} />
							</Stack>
							<Text role="small">
								{level}/{TEST_LEVELS} {t('seviye', 'levels')} · {(level as number) >= TEST_LEVELS ? t('Tamamlandı', 'Complete') : t('Sıradaki', 'Next') + ': ' + [t('Kolay', 'Easy'), t('Orta', 'Medium'), t('Zor', 'Hard')][level as number]}
							</Text>
						</Stack>
					</Card>
				))}
			</Grid>
		</Panel>
	);
};

export const WebTestSolveScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Immersive module="tests" title={t('Problemler · Orta', 'Problems · Medium')} sub={t('Soru 4 / 20', 'Question 4 / 20')} progress={0.4} right={<Chip tone="success" icon="check">{t('3 doğru', '3 right')}</Chip>}>
			<Stack gap={16} style={{flex: 1, padding: '40px 160px'}}>
				<Stack row gap={5}>
					{[1, 1, 1, 2, 0, 0, 0, 0, 0, 0].map((state, index) => (
						<div key={index} style={{flex: 1, height: 7, borderRadius: 4, background: state === 1 ? colors.success : state === 2 ? mod.color : colors.line2}} />
					))}
				</Stack>
				<Text role="body" size={20} weight={600} color={colors.ink} style={{lineHeight: '30px', marginTop: 10}}>
					{t('Bir mal %20 indirimle 240 TL’ye satılıyor. İndirimsiz fiyatı kaç TL’dir?', 'An item costs 240 after a 20% discount. What was the full price?')}
				</Text>
				<Grid columns="1fr 1fr" gap={12} style={{maxWidth: 760}}>
					<OptionRow letter="A" text="260" />
					<OptionRow letter="B" text="288" />
					<OptionRow letter="C" text="300" state="correct" />
					<OptionRow letter="D" text="320" />
				</Grid>
				<Card padding={18} style={{background: colors.successSoft, border: 0, maxWidth: 760}}>
					<Stack row gap={14}>
						<Tile icon="check" size={42} color="#FFFFFF" style={{background: colors.success}} />
						<Stack grow gap={2}>
							<Text role="section" color={colors.successInk}>
								{t('Doğru! Seriyi sürdürdün.', 'Correct! Streak kept.')}
							</Text>
							<Text role="small" color={colors.ink2}>
								{t('Fiyatın %80’i 240 → tamamı 240 ÷ 0,8 = 300 TL.', '80% is 240 → full price 300.')}
							</Text>
						</Stack>
						<Button size="lg" style={{background: '#047857', boxShadow: 'none'}}>
							{t('Devam', 'Continue')}
						</Button>
					</Stack>
				</Card>
			</Stack>
		</Immersive>
	);
};

/** A wrong answer: the right option, why, and where to go next (the topic's micro-lesson, SinoAI). */
export const WebTestSolveWrongScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Immersive module="tests" title={t('Problemler · Orta', 'Problems · Medium')} sub={t('Soru 5 / 20', 'Question 5 / 20')} progress={0.45} right={<Chip tone="success" icon="check">{t('3 doğru', '3 right')}</Chip>}>
			<Stack gap={16} style={{flex: 1, padding: '40px 160px'}}>
				<Stack row gap={5}>
					{[1, 1, 1, 1, 3, 0, 0, 0, 0, 0].map((state, index) => (
						<div key={index} style={{flex: 1, height: 7, borderRadius: 4, background: state === 1 ? colors.success : state === 3 ? colors.error : colors.line2}} />
					))}
				</Stack>
				<Text role="body" size={20} weight={600} color={colors.ink} style={{lineHeight: '30px', marginTop: 10}}>
					{t('Bir işi Ali 6 günde, Ayşe 12 günde bitiriyor. İkisi birlikte bu işi kaç günde bitirir?', 'Ali finishes a job in 6 days, Ayşe in 12. How many days do they need together?')}
				</Text>
				<Grid columns="1fr 1fr" gap={12} style={{maxWidth: 760}}>
					<OptionRow letter="A" text="3" />
					<OptionRow letter="B" text="4" state="correct" />
					<OptionRow letter="C" text="9" state="wrong" />
					<OptionRow letter="D" text="18" />
				</Grid>
				<Card padding={18} style={{background: colors.errorSoft, border: 0, maxWidth: 760}}>
					<Stack gap={14}>
						<Stack row gap={14}>
							<Tile icon="x" size={42} color="#FFFFFF" style={{background: colors.error}} />
							<Stack grow gap={2}>
								<Text role="section" color={colors.errorInk}>
									{t('Doğrusu B: 4 gün', 'The answer is B: 4 days')}
								</Text>
								<Text role="small" color={colors.ink2}>
									{t('Süreler toplanmaz, günlük işler toplanır: 1/6 + 1/12 = 1/4, yani 4 gün.', 'Add the daily shares, not the days: 1/6 + 1/12 = 1/4, so 4 days.')}
								</Text>
							</Stack>
						</Stack>
						<Stack row gap={10}>
							<Button module="lessons" tone="moduleSoft" icon="book">
								{t('Bu konunun mikro dersi · 4 dk', 'This topic’s micro-lesson · 4 min')}
							</Button>
							<Button tone="ghost" icon="sparkles">
								{t('SinoAI’ye sor', 'Ask SinoAI')}
							</Button>
							<div style={{flex: 1}} />
							<Button size="lg">{t('Devam', 'Continue')}</Button>
						</Stack>
					</Stack>
				</Card>
			</Stack>
		</Immersive>
	);
};
