import React from 'react';
import {AppButton, AppCard, AppChip, AppIcon, AppListRow, AppOverline, AppProgressBar, AppPromoCard, AppScreenFrame, AppText, useAppColors} from '../AppScreenParts';

export type Flashcard = {kind: string; lesson: string; front: string; position: number; total: number};

const SAMPLE_FLASHCARD: Flashcard = {kind: 'Tanım', lesson: 'Türkçe · Ses Bilgisi', front: 'Ünsüz yumuşaması nedir?', position: 4, total: 12};

/** Bilgi Kartları › Kart oturumu: a card waiting to be flipped. */
export const FlashcardScreen: React.FC<{card?: Flashcard}> = ({card = SAMPLE_FLASHCARD}) => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Flashcards" title="Kart oturumu" activeTab={0} trailing={<AppIcon name="bookmark" size={24} color={colors.muted} />}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
				<AppProgressBar share={card.position / card.total} />
				<AppText size={12} weight={700} color={colors.muted}>
					{card.position} / {card.total}
				</AppText>
			</div>
			<AppCard padding={22} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 4}}>
				<AppChip>{card.kind}</AppChip>
				<AppText size="caption" weight={600} color={colors.muted}>
					{card.lesson}
				</AppText>
				<AppText size={26} weight={800} style={{textAlign: 'center', lineHeight: 1.25}}>
					{card.front}
				</AppText>
				<AppOverline>Ön yüz</AppOverline>
				<div style={{display: 'flex'}}>
					<AppButton>Cevabı gör</AppButton>
				</div>
			</AppCard>
			<AppText size="caption" color={colors.muted} style={{textAlign: 'center'}}>
				Bilme düzeyini seçerek devam et
			</AppText>
			<div style={{display: 'flex', gap: 8, paddingBottom: 14}}>
				{['Bilmiyorum', 'Emin değilim', 'Biliyorum'].map((level, index) => (
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

const LEARNING_PATH = ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragraf'];

/** Dersler › Ana Sayfa: micro lessons and the learning path. */
export const LessonsScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Lessons" title="Dersler" activeTab={0}>
			<AppText size="label" color={colors.muted}>
				Mikro dersler, flashcard ve öğrenme rotasıyla hedefe ilerle.
			</AppText>
			<AppPromoCard label="Dersler" title="Derse başla" description="Konu ağacından bir mikro ders seç." action="Derse başla" />
			<AppListRow icon="search" title="Konu ağacı" subtitle="Ana konu, alt konu ve mikro dersleri tek ağaçta incele." />
			<AppOverline>Öğrenme rotası</AppOverline>
			{LEARNING_PATH.map((topic, index) => (
				<AppCard key={topic} padding={13} style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 40, height: 40, borderRadius: 20, backgroundColor: index === 0 ? colors.primary : colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						{index === 0 ? <AppIcon name="check" size={20} color={colors.onPrimary} /> : <AppText size="label" weight={800}>{index + 1}</AppText>}
					</div>
					<div style={{flex: 1}}>
						<AppText size={15} weight={700}>
							{topic}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							Gün {index + 1} · ~{12 + index * 3} dk
						</AppText>
					</div>
					<AppIcon name="chevron" size={18} color={colors.muted} />
				</AppCard>
			))}
		</AppScreenFrame>
	);
};

const FEATURED_LESSONS: readonly {lesson: string; done: number; total: number}[] = [
	{lesson: 'Matematik', done: 12, total: 40},
	{lesson: 'Türkçe', done: 18, total: 36},
	{lesson: 'Fizik', done: 5, total: 24},
];

/** Testler › Anasayfa: step-by-step topic tests. */
export const TestsScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Tests" title="Testler" activeTab={0}>
			<AppPromoCard label="Devam" title="Kaldığın yer" description="Kaldığın konudan test çözmeye devam et." action="Devam et" />
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<AppOverline>İlerleme</AppOverline>
					<AppText size="caption" weight={700} color={colors.muted}>
						35 / 100 test tamamlandı
					</AppText>
				</div>
				<div style={{display: 'flex'}}>
					<AppProgressBar share={0.35} height={8} />
				</div>
			</AppCard>
			<div>
				<AppText size="headline" weight={700}>
					Öne çıkan dersler
				</AppText>
				<AppText size="caption" color={colors.muted}>
					Hızlı devam için ders seç
				</AppText>
			</div>
			{FEATURED_LESSONS.map((row) => (
				<AppListRow key={row.lesson} icon="help" title={row.lesson} subtitle="Adım adım konu testleri" trailing={<AppChip tone="neutral">{`${row.done} / ${row.total}`}</AppChip>} />
			))}
		</AppScreenFrame>
	);
};

const TODAY_TASKS: readonly {title: string; meta: string; done: boolean}[] = [
	{title: 'Matematik · Denklemler', meta: '09:00 · 40 dk', done: true},
	{title: 'Türkçe · Paragraf', meta: '11:00 · 30 dk', done: true},
	{title: 'Fizik · Kuvvet ve Hareket', meta: '15:00 · 45 dk', done: false},
	{title: 'TYT Denemesi', meta: '19:00 · 165 dk', done: false},
];

/** Ders Planı › Bugün: the day's tasks. */
export const StudyPlanScreen: React.FC = () => {
	const colors = useAppColors();
	const done = TODAY_TASKS.filter((task) => task.done).length;
	return (
		<AppScreenFrame
			module="StudyPlan"
			title="Bugün"
			activeTab={0}
			trailing={
				<div style={{display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, backgroundColor: colors.primarySoft}}>
					<AppIcon name="flame" size={15} color={colors.onPrimarySoft} />
					<AppText size={12.5} weight={700} color={colors.onPrimarySoft}>
						5 günlük seri
					</AppText>
				</div>
			}
		>
			<div style={{display: 'flex', padding: 4, borderRadius: 12, backgroundColor: colors.surface}}>
				{['Günlük', 'Haftalık'].map((mode, index) => (
					<div key={mode} style={{flex: 1, padding: '8px 0', borderRadius: 9, textAlign: 'center', backgroundColor: index === 0 ? colors.card : 'transparent'}}>
						<AppText size="label" weight={700} color={index === 0 ? colors.text : colors.muted}>
							{mode}
						</AppText>
					</div>
				))}
			</div>
			<AppCard style={{display: 'flex', flexDirection: 'column', gap: 10}}>
				<AppText size="label" weight={700}>
					{done} / {TODAY_TASKS.length} görev · 70 / 280 dk
				</AppText>
				<div style={{display: 'flex'}}>
					<AppProgressBar share={done / TODAY_TASKS.length} height={8} />
				</div>
			</AppCard>
			<AppOverline>Bugünün programı</AppOverline>
			{TODAY_TASKS.map((task) => (
				<AppCard key={task.title} padding={13} style={{display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 26, height: 26, borderRadius: 13, boxSizing: 'border-box', backgroundColor: task.done ? colors.primary : 'transparent', border: `2px solid ${task.done ? colors.primary : colors.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						{task.done ? <AppIcon name="check" size={15} color={colors.onPrimary} /> : null}
					</div>
					<div style={{flex: 1}}>
						<AppText size={15} weight={700} color={task.done ? colors.muted : colors.text} style={{textDecoration: task.done ? 'line-through' : 'none'}}>
							{task.title}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							{task.meta}
						</AppText>
					</div>
				</AppCard>
			))}
			<AppText size="label" weight={700} color={colors.primary}>
				+ Ders ekle
			</AppText>
		</AppScreenFrame>
	);
};
