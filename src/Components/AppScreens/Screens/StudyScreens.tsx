import React from 'react';
import {AppButton, AppCard, AppChip, AppIcon, AppListRow, AppOverline, AppProgressBar, AppPromoCard, AppScreenFrame, AppText, useAppColors, useAppLanguage, useAppText, type AppLanguage} from '../AppScreenParts';

export type Flashcard = {kind: string; lesson: string; front: string; position: number; total: number};

const SAMPLE_FLASHCARD: Record<AppLanguage, Flashcard> = {
	tr: {kind: 'Tanım', lesson: 'Türkçe · Ses Bilgisi', front: 'Ünsüz yumuşaması nedir?', position: 4, total: 12},
	en: {kind: 'Definition', lesson: 'Biology · The Cell', front: 'What does the mitochondrion do?', position: 4, total: 12},
};

/** Bilgi Kartları › Kart oturumu: a card waiting to be flipped. */
export const FlashcardScreen: React.FC<{card?: Flashcard}> = ({card}) => {
	const colors = useAppColors();
	const t = useAppText();
	const lang = useAppLanguage();
	const shown = card ?? SAMPLE_FLASHCARD[lang];
	return (
		<AppScreenFrame module="Flashcards" title={t('Kart oturumu', 'Card session')} activeTab={0} trailing={<AppIcon name="bookmark" size={24} color={colors.muted} />}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
				<AppProgressBar share={shown.position / shown.total} />
				<AppText size={12} weight={700} color={colors.muted}>
					{shown.position} / {shown.total}
				</AppText>
			</div>
			<AppCard padding={22} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 4}}>
				<AppChip>{shown.kind}</AppChip>
				<AppText size="caption" weight={600} color={colors.muted}>
					{shown.lesson}
				</AppText>
				<AppText size={26} weight={800} style={{textAlign: 'center', lineHeight: 1.25}}>
					{shown.front}
				</AppText>
				<AppOverline>{t('Ön yüz', 'Front')}</AppOverline>
				<div style={{display: 'flex'}}>
					<AppButton>{t('Cevabı gör', 'Show answer')}</AppButton>
				</div>
			</AppCard>
			<AppText size="caption" color={colors.muted} style={{textAlign: 'center'}}>
				{t('Bilme düzeyini seçerek devam et', 'Rate how well you know it to continue')}
			</AppText>
			<div style={{display: 'flex', gap: 8, paddingBottom: 14}}>
				{[t('Bilmiyorum', 'Don’t know'), t('Emin değilim', 'Not sure'), t('Biliyorum', 'I know it')].map((level, index) => (
					<div key={level} style={{flex: 1, padding: '12px 0', borderRadius: 14, textAlign: 'center', backgroundColor: index === 2 ? colors.primary : colors.surface}}>
						<AppText size={12.5} weight={700} color={index === 2 ? colors.onPrimary : colors.text}>
							{level}
						</AppText>
					</div>
				))}
			</div>
		</AppScreenFrame>
	);
};

const LEARNING_PATH: Record<AppLanguage, string[]> = {
	tr: ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf'],
	en: ['Cell structure', 'Cell membrane', 'Cell division'],
};

/** Dersler › Ana Sayfa: micro lessons and the learning path. */
export const LessonsScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	const lang = useAppLanguage();
	return (
		<AppScreenFrame module="Lessons" title={t('Dersler', 'Lessons')} activeTab={0}>
			<AppText size="label" color={colors.muted}>
				{t('Mikro dersler, flashcard ve öğrenme rotasıyla hedefe ilerle.', 'Reach your goal with micro-lessons, flashcards and a learning path.')}
			</AppText>
			<AppPromoCard label={t('Dersler', 'Lessons')} title={t('Derse başla', 'Start a lesson')} description={t('Konu ağacından bir mikro ders seç.', 'Pick a micro-lesson from the topic tree.')} action={t('Derse başla', 'Start a lesson')} />
			<AppListRow icon="search" title={t('Konu ağacı', 'Topic tree')} subtitle={t('Ana konu, alt konu ve mikro dersleri tek ağaçta incele.', 'Units, topics and micro-lessons in one tree.')} />
			<AppOverline>{t('Öğrenme rotası', 'Learning path')}</AppOverline>
			{LEARNING_PATH[lang].map((topic, index) => (
				<AppCard key={topic} padding={13} style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 40, height: 40, borderRadius: 20, backgroundColor: index === 0 ? colors.primary : colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						{index === 0 ? <AppIcon name="check" size={20} color={colors.onPrimary} /> : <AppText size="label" weight={800}>{index + 1}</AppText>}
					</div>
					<div style={{flex: 1}}>
						<AppText size={15} weight={700}>
							{topic}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							{t(`Gün ${index + 1} · ~${12 + index * 3} dk`, `Day ${index + 1} · ~${12 + index * 3} min`)}
						</AppText>
					</div>
					<AppIcon name="chevron" size={18} color={colors.muted} />
				</AppCard>
			))}
		</AppScreenFrame>
	);
};

const FEATURED_LESSONS: readonly {lesson: string; en: string; done: number; total: number}[] = [
	{lesson: 'Matematik', en: 'Maths', done: 12, total: 40},
	{lesson: 'Türkçe', en: 'Biology', done: 18, total: 36},
	{lesson: 'Fizik', en: 'Physics', done: 5, total: 24},
];

/** Testler › Anasayfa: step-by-step topic tests. */
export const TestsScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	return (
		<AppScreenFrame module="Tests" title={t('Testler', 'Quizzes')} activeTab={0}>
			<AppPromoCard label={t('Devam', 'Continue')} title={t('Kaldığın yer', 'Where you left off')} description={t('Kaldığın konudan test çözmeye devam et.', 'Keep solving quizzes from the topic you left.')} action={t('Devam et', 'Continue')} />
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<AppOverline>{t('İlerleme', 'Progress')}</AppOverline>
					<AppText size="caption" weight={700} color={colors.muted}>
						{t('35 / 100 test tamamlandı', '35 / 100 quizzes done')}
					</AppText>
				</div>
				<div style={{display: 'flex'}}>
					<AppProgressBar share={0.35} height={8} />
				</div>
			</AppCard>
			<div>
				<AppText size="headline" weight={700}>
					{t('Öne çıkan dersler', 'Featured subjects')}
				</AppText>
				<AppText size="caption" color={colors.muted}>
					{t('Hızlı devam için ders seç', 'Pick a subject to jump back in')}
				</AppText>
			</div>
			{FEATURED_LESSONS.map((row) => (
				<AppListRow key={row.lesson} icon="help" title={t(row.lesson, row.en)} subtitle={t('Adım adım konu testleri', 'Step-by-step topic quizzes')} trailing={<AppChip tone="neutral">{`${row.done} / ${row.total}`}</AppChip>} />
			))}
		</AppScreenFrame>
	);
};

const TODAY_TASKS: readonly {title: string; en: string; meta: string; done: boolean}[] = [
	{title: 'Matematik · Denklemler', en: 'Maths · Equations', meta: '09:00 · 40', done: true},
	{title: 'Türkçe · Paragraf', en: 'Biology · The Cell', meta: '11:00 · 30', done: true},
	{title: 'Fizik · Kuvvet ve Hareket', en: 'Physics · Forces and Motion', meta: '15:00 · 45', done: false},
	{title: 'TYT Denemesi', en: 'Mock exam', meta: '19:00 · 165', done: false},
];

/** Ders Planı › Bugün: the day's tasks. */
export const StudyPlanScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	const done = TODAY_TASKS.filter((task) => task.done).length;
	return (
		<AppScreenFrame
			module="StudyPlan"
			title={t('Bugün', 'Today')}
			activeTab={0}
			trailing={
				<div style={{display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, backgroundColor: colors.primarySoft}}>
					<AppIcon name="flame" size={15} color={colors.onPrimarySoft} />
					<AppText size={12.5} weight={700} color={colors.onPrimarySoft}>
						{t('5 günlük seri', '5-day streak')}
					</AppText>
				</div>
			}
		>
			<div style={{display: 'flex', padding: 4, borderRadius: 12, backgroundColor: colors.surface}}>
				{[t('Günlük', 'Daily'), t('Haftalık', 'Weekly')].map((mode, index) => (
					<div key={mode} style={{flex: 1, padding: '8px 0', borderRadius: 9, textAlign: 'center', backgroundColor: index === 0 ? colors.card : 'transparent'}}>
						<AppText size="label" weight={700} color={index === 0 ? colors.text : colors.muted}>
							{mode}
						</AppText>
					</div>
				))}
			</div>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<AppText size="label" weight={700}>
					{t(`${done} / ${TODAY_TASKS.length} görev · 70 / 280 dk`, `${done} / ${TODAY_TASKS.length} tasks · 70 / 280 min`)}
				</AppText>
				<div style={{display: 'flex'}}>
					<AppProgressBar share={done / TODAY_TASKS.length} height={8} />
				</div>
			</AppCard>
			<AppOverline>{t('Bugünün programı', 'Today’s plan')}</AppOverline>
			{TODAY_TASKS.map((task) => (
				<AppCard key={task.title} padding={13} style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 26, height: 26, borderRadius: 13, boxSizing: 'border-box', backgroundColor: task.done ? colors.primary : 'transparent', border: `2px solid ${task.done ? colors.primary : colors.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						{task.done ? <AppIcon name="check" size={15} color={colors.onPrimary} /> : null}
					</div>
					<div style={{flex: 1}}>
						<AppText size={15} weight={700} color={task.done ? colors.muted : colors.text} style={{textDecoration: task.done ? 'line-through' : 'none'}}>
							{t(task.title, task.en)}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							{`${task.meta} ${t('dk', 'min')}`}
						</AppText>
					</div>
				</AppCard>
			))}
			<AppText size="label" weight={700} color={colors.primary}>
				{t('+ Ders ekle', '+ Add a session')}
			</AppText>
		</AppScreenFrame>
	);
};

/** Sample week for the progress screen: minutes studied per day (sums to 12 h 40 min). */
const WEEK_MINUTES = [95, 120, 80, 140, 110, 150, 65];
const WEEK_DAYS: Record<AppLanguage, string[]> = {tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']};

/** Ders Planı › İlerleme: hours studied this week and topic progress. */
export const StudyProgressScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	const lang = useAppLanguage();
	const peak = Math.max(...WEEK_MINUTES);
	const compass = [
		{label: t('Tamamlandı', 'Completed'), value: 38, color: colors.success},
		{label: t('Devam', 'In progress'), value: 12, color: colors.primary},
		{label: t('Tekrar', 'Review'), value: 6, color: colors.warning},
		{label: t('Başlanmadı', 'Not started'), value: 55, color: colors.muted},
	];
	return (
		<AppScreenFrame module="StudyPlan" title={t('İlerleme', 'Progress')} activeTab={1}>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<AppOverline>{t('Bu hafta', 'This week')}</AppOverline>
					<AppChip tone="success">{t('+2 sa geçen haftaya göre', '+2 h vs last week')}</AppChip>
				</div>
				<AppText size={30} weight={800}>
					{t('12 sa 40 dk', '12 h 40 min')}
				</AppText>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 10, height: 92}}>
					{WEEK_MINUTES.map((minutes, index) => (
						<div key={WEEK_DAYS.en[index]} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
							<div style={{width: '100%', height: (minutes / peak) * 68, borderRadius: 6, backgroundColor: index === 5 ? colors.primary : colors.primarySoft}} />
							<AppText size={10.5} weight={600} color={colors.muted}>
								{WEEK_DAYS[lang][index]}
							</AppText>
						</div>
					))}
				</div>
			</AppCard>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
					<AppIcon name="compass" size={18} color={colors.primary} />
					<AppText size="headline" weight={700}>
						{t('Konu ilerlemesi', 'Topic progress')}
					</AppText>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<AppProgressBar share={38 / 111} height={8} />
					<AppText size="label" weight={800}>
						{t('%34', '34%')}
					</AppText>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
					{compass.map((item) => (
						<div key={item.label} style={{padding: '10px 12px', borderRadius: 12, backgroundColor: colors.surfaceLow}}>
							<AppText size={20} weight={800} color={item.color}>
								{item.value}
							</AppText>
							<AppText size={11.5} weight={600} color={colors.muted}>
								{item.label}
							</AppText>
						</div>
					))}
				</div>
			</AppCard>
			<AppOverline>{t('Tekrar gerekenler', 'Due for review')}</AppOverline>
			<AppListRow icon="compass" title={t('Türev · Zincir kuralı', 'Derivatives · Chain rule')} subtitle={t('3 gün önce · başarı %45', '3 days ago · 45% correct')} />
		</AppScreenFrame>
	);
};
