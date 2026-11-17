import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {Bar, Button, Card, Chip, FlagButton, Levels, OptionRow, PendingSyncNote, Stack, TEST_LEVELS, Text, Tile} from '../../Parts/Shared';
import {ModuleWeekCard} from '../../Parts/Study';
import {Grid, Immersive, ModuleBanner, ModuleHead, Panel} from '../../Parts/Web';

/** Testler (Quizzes) on the web panel. */

export const WebTestsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests">
			<ModuleHead
				module="tests"
				tab={0}
				title={t('Testler', 'Quizzes')}
				sub={t('Kolay, Orta, Zor · her seviye 20 soru', 'Easy, Medium, Hard · 20 questions each')}
				actions={
					<Button tone="ghost" icon="search">
						{t('Konu ara', 'Find topic')}
					</Button>
				}
			/>
			<Grid columns="1fr 2fr">
				<Stack gap={14}>
					<ModuleBanner module="tests" over={t('Senin için hazır', 'Ready for you')} title={t('Problemler · Orta', 'Problems · Medium')} text={t('Denemede en çok net kaybettiğin konu. 20 soru, anında açıklama.', 'Where you lost most. 20 questions, instant feedback.')} action={t('Teste başla', 'Start quiz')} />
					<ModuleWeekCard
						module="tests"
						time={t('1 sa 50 dk', '1 h 50 m')}
						change={9}
						bars={[15, 25, 0, 20, 30, 10, 10]}
						stats={[
							[t('Çözülen soru', 'Questions solved'), '140'],
							[t('Başarı', 'Success'), t('%72', '72%')],
							[t('Seri', 'Streak'), t('5 gün', '5 days')],
						]}
					/>
				</Stack>
				<Grid columns="1fr 1fr" gap={14}>
					{[
						['Türkçe', 'Turkish', 12, 30],
						['Matematik', 'Maths', 9, 35],
						['Geometri', 'Geometry', 3, 20],
						['Fizik', 'Physics', 5, 18],
						['Kimya', 'Chemistry', 4, 16],
						['Biyoloji', 'Biology', 2, 14],
					].map(([tr, en, done, total]) => (
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
			{/* No lesson chips here (owner, 17 Nov 2026): the lesson is picked from the Testler home list; "Tüm dersler" goes back there. */}
			<ModuleHead
				module="tests"
				tab={1}
				title={t('Matematik', 'Maths')}
				sub={t('25 konu · 9 tamamlandı', '25 topics · 9 complete')}
				actions={
					<Button tone="ghost" icon="left">
						{t('Tüm dersler', 'All lessons')}
					</Button>
				}
			/>
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
		<Immersive
			module="tests"
			title={t('Problemler · Orta', 'Problems · Medium')}
			sub={t('Soru 4 / 20', 'Question 4 / 20')}
			progress={0.4}
			right={
				<Stack row gap={10}>
					<FlagButton />
					<Chip tone="success" icon="check">
						{t('3 doğru', '3 right')}
					</Chip>
				</Stack>
			}
		>
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

/** A wrong answer: the right option, why, and where to go next (the topic's lesson, SinoAI). */
export const WebTestSolveWrongScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Immersive
			module="tests"
			title={t('Problemler · Orta', 'Problems · Medium')}
			sub={t('Soru 5 / 20', 'Question 5 / 20')}
			progress={0.45}
			right={
				<Chip tone="success" icon="check">
					{t('3 doğru', '3 right')}
				</Chip>
			}
		>
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
								{t('Bu konunun anlatımı', 'This topic’s lesson')}
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

/**
 * Testler offline on the web (owner, 17 Nov 2026): the last answer waits in
 * the central queue, right and wrong show after it is sent, and "Testi bitir"
 * does not end the quiz while an answer waits: the warning shows above it.
 */
export const WebTestOfflineScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Immersive
			module="tests"
			title={t('Problemler · Orta', 'Problems · Medium')}
			sub={t('Soru 20 / 20', 'Question 20 / 20')}
			progress={1}
			right={
				<Stack row gap={10}>
					<FlagButton />
					<Chip tone="success" icon="check">
						{t('15 doğru', '15 right')}
					</Chip>
				</Stack>
			}
		>
			<Stack gap={16} style={{flex: 1, padding: '40px 160px'}}>
				<Stack row gap={5}>
					{[1, 1, 3, 1, 1, 1, 1, 3, 1, 2].map((state, index) => (
						<div key={index} style={{flex: 1, height: 7, borderRadius: 4, background: state === 1 ? colors.success : state === 3 ? colors.error : state === 2 ? mod.color : colors.line2}} />
					))}
				</Stack>
				<Text role="body" size={20} weight={600} color={colors.ink} style={{lineHeight: '30px', marginTop: 10}}>
					{t('Bir işçi günde 8 saat çalışarak bir işi 6 günde bitiriyor. Günde 12 saat çalışırsa kaç günde bitirir?', 'Working 8 hours a day a worker ends a job in 6 days. How many days at 12 hours a day?')}
				</Text>
				<Grid columns="1fr 1fr" gap={12} style={{maxWidth: 760}}>
					<OptionRow letter="A" text="3" />
					<OptionRow letter="B" text="4" state="selected" module="tests" />
					<OptionRow letter="C" text="5" />
					<OptionRow letter="D" text="9" />
				</Grid>
				<PendingSyncNote module="tests" reveal />
				<Card padding={16} style={{maxWidth: 760}}>
					<Stack row gap={14}>
						<Icon name="info" size={20} color={colors.ink2} />
						<Text role="small" color={colors.ink} style={{flex: 1}}>
							{t('Bekleyen cevapların henüz gönderilmedi. Bağlantı gelince testi bitirebilirsin.', 'Your waiting answers have not been sent yet. You can end the quiz once you are back online.')}
						</Text>
						<Button tone="module" module="tests" size="lg">
							{t('Testi bitir', 'End quiz')}
						</Button>
					</Stack>
				</Card>
			</Stack>
		</Immersive>
	);
};
