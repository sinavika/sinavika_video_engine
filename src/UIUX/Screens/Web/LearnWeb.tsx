import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {Bar, Button, Card, Chip, Levels, List, TEST_LEVELS, ListRow, OptionRow, Ring, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {Grid, Immersive, ModuleBanner, ModuleHead, Panel, WCard} from '../../Parts/Web';

/** Web Dersler (Works) and Testler (Quizzes). */

const SUBJECTS: [string, string, number][] = [
	['Türkçe', 'Turkish', 0.62],
	['Matematik', 'Maths', 0.38],
	['Geometri', 'Geometry', 0.2],
	['Fizik', 'Physics', 0.24],
	['Kimya', 'Chemistry', 0.51],
	['Biyoloji', 'Biology', 0.44],
	['Tarih', 'History', 0.3],
];

export const WebLessonsHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={0} tabs={[t('Dersler', 'Lessons'), t('Konu ağacı', 'Topic tree'), t('Öğrenme rotası', 'Learning path'), t('Geçmiş', 'History')]} title={t('Dersler', 'Lessons')} sub={t('Mikro dersler, konu ağacı ve günlük öğrenme rotası', 'Micro-lessons, topic tree and daily learning path')} />
			<Grid columns="1.5fr 1fr">
				<ModuleBanner module="lessons" over={t('Kaldığın yerden devam et', 'Continue where you left off')} title={t('Sözcükte Anlam', 'Word meaning')} text={t('Türkçe · Ders 4/9 · 11 dakika kaldı', 'Turkish · Lesson 4/9 · 11 minutes left')} action={t('Devam et', 'Continue')}>
					<Ring value={0.5} size={110} stroke={10} color="#FFFFFF" track="rgba(255,255,255,0.3)">
						<Text role="section" color="#FFFFFF">
							%50
						</Text>
					</Ring>
				</ModuleBanner>
				<Card padding={20} tone="module" module="lessons">
					<Stack gap={10}>
						<Stack row gap={12}>
							<Tile module="lessons" icon="trend" size={44} />
							<Stack gap={1}>
								<Text role="section">{t('Öğrenme rotası', 'Learning path')}</Text>
								<Text role="small">{t('30 günlük TYT kampı · 12. gün', '30-day TYT camp · day 12')}</Text>
							</Stack>
						</Stack>
						<Bar value={0.4} color={mod.color} track={mod.track} />
						<Button tone="module" module="lessons">
							{t('Programı keşfet', 'Explore the programme')}
						</Button>
					</Stack>
				</Card>
			</Grid>
			<Stack row justify="space-between">
				<Text role="section">{t('Derslerin', 'Your subjects')}</Text>
				<Text role="small" weight={700} color={mod.color}>
					{t('TYT · 9 ders', 'TYT · 9 subjects')}
				</Text>
			</Stack>
			<Grid columns="repeat(4, 1fr)" gap={14}>
				{SUBJECTS.slice(0, 8).map(([tr, en, value]) => (
					<Card key={tr} padding={16}>
						<Stack row gap={12}>
							<Ring value={value} size={52} stroke={6} color={mod.color} track={mod.track}>
								<Text role="meta" weight={800}>
									%{Math.round(value * 100)}
								</Text>
							</Ring>
							<Stack gap={1}>
								<Text role="headline">{t(tr, en)}</Text>
								<Text role="meta">
									{Math.round(value * 25)} / 25 {t('konu', 'topics')}
								</Text>
							</Stack>
						</Stack>
					</Card>
				))}
				<Card padding={16} tone="soft">
					<Stack row gap={12}>
						<Tile icon="plus" size={52} />
						<Text role="headline">{t('Ders ekle', 'Add subject')}</Text>
					</Stack>
				</Card>
			</Grid>
		</Panel>
	);
};

export const WebLessonsTreeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const topics: [string, string, 'done' | 'now' | 'weak' | 'next', string, string][] = [
		['Temel kavramlar', 'Basics', 'done', '4 ders · 20 soru', '4 lessons · 20 questions'],
		['Sayı basamakları', 'Digits', 'done', '3 ders · 15 soru', '3 lessons · 15 questions'],
		['Bölünebilme', 'Divisibility', 'done', '4 ders · 20 soru', '4 lessons · 20 questions'],
		['Rasyonel sayılar', 'Rationals', 'now', 'Devam ediyor · %40 · Ders 2/5', 'In progress · 40% · 2/5'],
		['Problemler', 'Problems', 'weak', 'Son denemede −3,25 net · öncelikli', '−3.25 last exam · priority'],
		['Oran ve orantı', 'Ratio', 'next', '4 ders · 20 soru', '4 lessons · 20 questions'],
		['Fonksiyonlar', 'Functions', 'next', '5 ders · 25 soru', '5 lessons · 25 questions'],
	];
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={1} tabs={[t('Dersler', 'Lessons'), t('Konu ağacı', 'Topic tree'), t('Öğrenme rotası', 'Learning path'), t('Geçmiş', 'History')]} title={t('Matematik', 'Maths')} sub={t('TYT · 25 konu · %38 tamamlandı', 'TYT · 25 topics · 38% done')} actions={<div style={{width: 200}}><Segmented items={['TYT', 'AYT']} module="lessons" /></div>} />
			<Grid columns="300px 1fr">
				<Card padding={8}>
					{SUBJECTS.map(([tr, en, value], index) => (
						<Stack key={tr} row gap={12} style={{padding: '9px 12px', borderRadius: 14, background: index === 1 ? mod.wash : undefined}}>
							<Ring value={value} size={38} stroke={4} color={mod.color} track={mod.track}>
								<Text role="meta" size={10} weight={800}>
									{Math.round(value * 100)}
								</Text>
							</Ring>
							<Text role="headline" style={{flex: 1}}>
								{t(tr, en)}
							</Text>
							{index === 1 ? <Icon name="right" size={16} color={mod.color} /> : null}
						</Stack>
					))}
				</Card>
				<Card padding={12}>
					{topics.map(([tr, en, state, subTr, subEn], index) => (
						<Stack key={tr} row gap={16} style={{position: 'relative', padding: '11px 12px', borderRadius: 16, background: state === 'now' ? mod.wash : undefined}}>
							{index < topics.length - 1 ? <div style={{position: 'absolute', left: 29, top: 50, bottom: -12, width: 2, background: state === 'done' ? mod.color : colors.line}} /> : null}
							<div style={{position: 'relative', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: state === 'done' ? mod.color : state === 'weak' ? colors.errorSoft : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `3px solid ${mod.color}` : undefined}}>
								{state === 'done' ? <Icon name="check" size={17} color="#FFFFFF" /> : state === 'weak' ? <Icon name="alert" size={17} color={colors.error} /> : state === 'now' ? <Icon name="play" size={14} color={mod.color} /> : <Text role="meta" weight={800}>{index + 1}</Text>}
							</div>
							<Stack grow gap={1}>
								<Text role="headline">{t(tr, en)}</Text>
								<Text role="small" color={state === 'weak' ? colors.error : colors.muted}>
									{t(subTr, subEn)}
								</Text>
							</Stack>
							{state === 'now' ? <Button tone="module" module="lessons" size="sm">{t('Devam et', 'Resume')}</Button> : state === 'weak' ? <Button tone="soft" size="sm">{t('Önce bunu çalış', 'Do this first')}</Button> : state === 'done' ? <Text role="meta">{t('Tekrar et', 'Review')}</Text> : null}
						</Stack>
					))}
				</Card>
			</Grid>
		</Panel>
	);
};

export const WebLessonDetailScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons" crumb={t('Dersler › Matematik ›', 'Lessons › Maths ›')}>
			<ModuleBanner module="lessons" over={t('Matematik · TYT', 'Maths · TYT')} title={t('Rasyonel sayılar', 'Rational numbers')} text={t('5 mikro ders · 25 soru · yaklaşık 70 dakika. Son denemede bu konuda 1 net kaybettin.', '5 lessons · 25 questions · ~70 min. You lost 1 point here last exam.')} action={t('Ders 2’den devam et', 'Continue lesson 2')} />
			<Grid columns="1.4fr 1fr">
				<WCard title={t('Mikro dersler', 'Micro-lessons')}>
					<List>
						{[
							[t('Rasyonel sayı nedir?', 'What is a rational?'), '12 dk', 'done'],
							[t('Kesirlerde sıralama', 'Ordering fractions'), '14 dk', 'now'],
							[t('Ondalık gösterim', 'Decimals'), '10 dk', 'next'],
							[t('Devirli ondalık', 'Repeating decimals'), '15 dk', 'next'],
							[t('Karma problemler', 'Mixed problems'), '18 dk', 'next'],
						].map(([title, time, state], index) => (
							<Stack key={title} row gap={12} style={{padding: '13px 16px', background: state === 'now' ? mod.wash : undefined}}>
								<Stack align="center" justify="center" style={{width: 32, height: 32, borderRadius: 16, background: state === 'done' ? mod.color : mod.soft}}>
									{state === 'done' ? <Icon name="check" size={15} color="#FFFFFF" /> : <Text role="meta" weight={800} color={mod.color}>{index + 1}</Text>}
								</Stack>
								<Text role="headline" style={{flex: 1}}>
									{title}
								</Text>
								<Text role="small">{time}</Text>
								{state === 'now' ? <Button tone="module" module="lessons" size="sm" icon="play">{t('Başla', 'Start')}</Button> : null}
							</Stack>
						))}
					</List>
				</WCard>
				<Stack gap={18}>
					<WCard title={t('Konu testi', 'Topic quiz')}>
						<Stack row gap={12}>
							<Tile module="tests" size={44} />
							<Stack grow gap={1}>
								<Text role="headline">{t('Rasyonel sayılar · Orta', 'Rationals · Medium')}</Text>
								<Text role="small">{t('Derslerden sonra açılır', 'Opens after the lessons')}</Text>
							</Stack>
							<Levels done={1} color={MODULES.tests.color.light} />
						</Stack>
					</WCard>
					<WCard title={t('Kartlar', 'Cards')}>
						<Stack row gap={12}>
							<Tile module="flashcards" size={44} />
							<Stack grow gap={1}>
								<Text role="headline">{t('Rasyonel sayılar destesi', 'Rationals deck')}</Text>
								<Text role="small">{t('18 kart · Bilgi Kartları', '18 cards · Flashcards')}</Text>
							</Stack>
						</Stack>
					</WCard>
				</Stack>
			</Grid>
		</Panel>
	);
};

export const WebLessonsPathScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={2} tabs={[t('Dersler', 'Lessons'), t('Konu ağacı', 'Topic tree'), t('Öğrenme rotası', 'Learning path'), t('Geçmiş', 'History')]} title={t('Öğrenme rotası', 'Learning path')} sub={t('30 günlük TYT kampı · her gün 45 dakika', '30-day TYT camp · 45 minutes a day')} />
			<Card padding={20}>
				<Grid columns="repeat(10, 1fr)" gap={10}>
					{Array.from({length: 30}, (_, index) => {
						const day = index + 1;
						const done = day < 12;
						const now = day === 12;
						return (
							<Stack key={day} align="center" justify="center" gap={2} style={{height: 64, borderRadius: 16, background: done ? mod.color : now ? colors.card : mod.wash, border: now ? `2.5px solid ${mod.color}` : undefined}}>
								<Text role="meta" size={10} color={done ? 'rgba(255,255,255,0.85)' : mod.color}>
									{t('Gün', 'Day')}
								</Text>
								<Text role="headline" size={16} color={done ? '#FFFFFF' : colors.ink}>
									{day}
								</Text>
							</Stack>
						);
					})}
				</Grid>
			</Card>
			<Grid columns="1fr 1fr">
				<WCard title={t('Bugün · 12. gün', 'Today · day 12')}>
					<List>
						<ListRow module="lessons" title={t('Rasyonel sayılar · Ders 2', 'Rationals · lesson 2')} subtitle="14 dk" />
						<ListRow module="tests" title={t('Rasyonel sayılar · Orta', 'Rationals · Medium')} subtitle={t('20 soru', '20 questions')} />
						<ListRow module="flashcards" title={t('Dünün kartları', 'Yesterday’s cards')} subtitle="12 kart" />
					</List>
				</WCard>
				<WCard title={t('İlerleme', 'Progress')}>
					<Stack row gap={18}>
						<Ring value={0.37} size={100} stroke={10} color={mod.color} track={mod.track}>
							<Text role="section">11/30</Text>
						</Ring>
						<Stack gap={6}>
							<Text role="headline">{t('Rotada 1 gün öndesin', 'You are 1 day ahead')}</Text>
							<Text role="small">{t('Bu tempoyla kamp 7 Kasım’da biter.', 'At this pace the camp ends 7 Nov.')}</Text>
						</Stack>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebLessonsHistoryScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={3} tabs={[t('Dersler', 'Lessons'), t('Konu ağacı', 'Topic tree'), t('Öğrenme rotası', 'Learning path'), t('Geçmiş', 'History')]} title={t('Geçmiş', 'History')} sub={t('Bu hafta 3 sa 40 dk ders çalıştın', '3 h 40 min this week')} />
			<List>
				{[
					['Paragraf · Ana fikir', 'Reading · Main idea', 'Bugün · 25 dk', 'Today · 25 min', 'done'],
					['Rasyonel sayılar · Ders 1', 'Rationals · lesson 1', 'Bugün · 12 dk', 'Today · 12 min', 'done'],
					['Sözcükte anlam', 'Word meaning', 'Pazartesi · 30 dk', 'Monday · 30 min', 'done'],
					['Hücre yapısı', 'Cell structure', 'Pazar · 20 dk', 'Sunday · 20 min', 'half'],
					['Sayı basamakları', 'Digits', 'Cumartesi · 35 dk', 'Saturday · 35 min', 'done'],
				].map(([tr, en, subTr, subEn, state]) => (
					<ListRow key={tr} module="lessons" icon={state === 'done' ? 'checkCircle' : 'playCircle'} title={t(tr, en)} subtitle={t(subTr, subEn)} trailing={<Chip tone={state === 'done' ? 'success' : 'module'} module="lessons" size="sm">{state === 'done' ? t('Tamamlandı', 'Done') : t('Yarım kaldı', 'Unfinished')}</Chip>} />
				))}
			</List>
		</Panel>
	);
};

export const WebLessonStudyScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Immersive module="lessons" title={t('Kesirlerde sıralama', 'Ordering fractions')} sub={t('Rasyonel sayılar · Ders 2/5', 'Rationals · lesson 2/5')} progress={0.4} right={<Button tone="dark" icon="sparkles">{t('SinoAI’ye sor', 'Ask SinoAI')}</Button>}>
			<Stack gap={20} style={{flex: 1, padding: '34px 64px'}}>
				<div style={{height: 380, borderRadius: 24, background: 'linear-gradient(160deg, #0B1220, #10243A)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Card padding={24} style={{width: 560}}>
						<Text role="over" color={mod.color}>
							{t('Kural', 'Rule')}
						</Text>
						<Text role="title" style={{marginTop: 8}}>
							{t('Paydaları eşitle, sonra payları karşılaştır.', 'Equalise denominators, then compare numerators.')}
						</Text>
						<Stack row gap={10} style={{marginTop: 14}}>
							{['3/4', '5/6', '7/12'].map((value) => (
								<div key={value} style={{padding: '10px 16px', borderRadius: 12, background: mod.soft}}>
									<Text role="section" color={mod.color}>
										{value}
									</Text>
								</div>
							))}
						</Stack>
					</Card>
					<Stack row gap={12} style={{position: 'absolute', left: 24, right: 24, bottom: 18}}>
						<Icon name="pause" size={20} color="#FFFFFF" />
						<Bar value={0.4} color="#38BDF8" track="rgba(255,255,255,0.2)" height={5} />
						<Text role="meta" color="#CBD5E1">
							5:36 / 14:00
						</Text>
					</Stack>
				</div>
				<Stack row gap={10}>
					<Button tone="ghost" icon="left">
						{t('Önceki bölüm', 'Previous')}
					</Button>
					<div style={{flex: 1}} />
					<Button size="lg" iconRight="right">
						{t('Sonraki bölüm', 'Next part')}
					</Button>
				</Stack>
			</Stack>
			<div style={{width: 340, borderLeft: `1px solid ${colors.line}`, padding: 24, background: colors.bg, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10}}>
				<Text role="section">{t('Bu derste', 'In this lesson')}</Text>
				{[[t('Kesir nedir?', 'What is a fraction?'), 'done'], [t('Payda eşitleme', 'Common denominators'), 'done'], [t('Sıralama', 'Ordering'), 'now'], [t('3 örnek soru', '3 examples'), 'next']].map(([title, state], index) => (
					<Stack key={title} row gap={12} style={{padding: '10px 12px', borderRadius: 14, background: state === 'now' ? mod.soft : undefined}}>
						<Stack align="center" justify="center" style={{width: 26, height: 26, borderRadius: 13, background: state === 'done' ? mod.color : colors.card, border: state === 'done' ? undefined : `2px solid ${state === 'now' ? mod.color : colors.line}`, boxSizing: 'border-box'}}>
							{state === 'done' ? <Icon name="check" size={13} color="#FFFFFF" /> : <Text role="meta" weight={800}>{index + 1}</Text>}
						</Stack>
						<Text role="headline" size={14}>
							{title}
						</Text>
					</Stack>
				))}
				<div style={{flex: 1}} />
				<Card padding={14}>
					<Text role="small">{t('Not al: buraya yazdıkların Kütüphanen’e kaydedilir.', 'Notes here are saved to your library.')}</Text>
				</Card>
			</div>
		</Immersive>
	);
};

/* ------------------------------------------------------------------ Testler */

export const WebTestsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={0} title={t('Testler', 'Quizzes')} sub={t('Adım adım, 5 seviyeli konu testleri', 'Step-by-step topic quizzes with 5 levels')} actions={<Button tone="ghost" icon="search">{t('Konu ara', 'Find topic')}</Button>} />
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
							<Text role="section" color="#065F46">
								{t('Doğru! Seriyi sürdürdün.', 'Correct! Streak kept.')}
							</Text>
							<Text role="small" color="#047857">
								{t('Fiyatın %80’i 240 → tamamı 240 ÷ 0,8 = 300 TL.', '80% is 240 → full price 300.')}
							</Text>
						</Stack>
						<Button size="lg" style={{background: colors.success, boxShadow: 'none'}}>
							{t('Devam', 'Continue')}
						</Button>
					</Stack>
				</Card>
			</Stack>
		</Immersive>
	);
};
