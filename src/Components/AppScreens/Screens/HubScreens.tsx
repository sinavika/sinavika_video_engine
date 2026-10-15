import React from 'react';
import {AppCard, AppIconDisc, AppListRow, AppPromoCard, AppScreenFrame, AppText, useAppColors, useAppText, type AppIconName} from '../AppScreenParts';

/** The hub tiles with the app's tr-TR and en-US catalogue names (hub.tiles). */
const MODULE_TILES: readonly {title: string; en: string; subtitle: string; enSubtitle: string; icon: AppIconName}[] = [
	{title: 'Ders Planı', en: 'Study Plan', subtitle: 'Haftalık programın ve görevlerin', enSubtitle: 'Your weekly schedule and tasks', icon: 'calendar'},
	{title: 'Denemeler', en: 'Practice exams', subtitle: 'Deneme çöz, sonucu gör', enSubtitle: 'Take an exam, see your result', icon: 'document'},
	{title: 'Akıllı Özet', en: 'Smart Summary', subtitle: 'Soru görselinden analiz al', enSubtitle: 'Analyze a question from an image', icon: 'scan'},
	{title: 'Bilgi Kartları', en: 'Flashcards', subtitle: 'Kartlarla öğrenmeye devam et', enSubtitle: 'Keep learning with cards', icon: 'albums'},
	{title: 'Dersler', en: 'Lessons', subtitle: 'Mikro ders ve çalışma planı', enSubtitle: 'Micro-lessons and a study plan', icon: 'book'},
	{title: 'Testler', en: 'Quizzes', subtitle: 'Adım adım konu testleri', enSubtitle: 'Step-by-step topic quizzes', icon: 'checklist'},
];

/** Modüller: the app's home, where every module starts. */
export const ModuleHubScreen: React.FC = () => {
	const colors = useAppColors();
	const t = useAppText();
	return (
		<AppScreenFrame module="Hub" title={t('Modüller', 'Modules')}>
			<AppPromoCard
				label={t('Deneme', 'Practice exam')}
				title={t('Hedefine bilgiyle yaklaş', 'Get closer to your goal with knowledge')}
				description={t('Deneme çöz, analizini gör, gelişimini takip et.', 'Take a practice exam, see the analysis, and track your progress.')}
				action={t('Denemelere git', 'Go to practice exams')}
			/>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				{MODULE_TILES.map((tile) => (
					<AppCard key={tile.title} padding={13} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
						<AppIconDisc icon={tile.icon} />
						<AppText size={15} weight={700}>
							{t(tile.title, tile.en)}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							{t(tile.subtitle, tile.enSubtitle)}
						</AppText>
					</AppCard>
				))}
			</div>
			<AppListRow icon="sparkles" title="SinoAI" subtitle={t('Soru çöz, özet çıkar, çalışma üret', 'Solve, summarize, and generate study work')} />
		</AppScreenFrame>
	);
};
