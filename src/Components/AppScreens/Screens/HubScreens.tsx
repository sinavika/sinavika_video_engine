import React from 'react';
import {AppCard, AppIconDisc, AppListRow, AppPromoCard, AppScreenFrame, AppText, useAppColors, type AppIconName} from '../AppScreenParts';

const MODULE_TILES: readonly {title: string; subtitle: string; icon: AppIconName}[] = [
	{title: 'Ders Planı', subtitle: 'Haftalık programın ve görevlerin', icon: 'calendar'},
	{title: 'Denemeler', subtitle: 'Deneme çöz, sonucu gör', icon: 'document'},
	{title: 'Akıllı Özet', subtitle: 'Soru görselinden analiz al', icon: 'scan'},
	{title: 'Bilgi Kartları', subtitle: 'Kartlarla öğrenmeye devam et', icon: 'albums'},
	{title: 'Dersler', subtitle: 'Mikro ders ve koç planı', icon: 'book'},
	{title: 'Testler', subtitle: 'Adım adım konu testleri', icon: 'checklist'},
];

/** Modüller: the app's home, where every module starts. */
export const ModuleHubScreen: React.FC = () => {
	const colors = useAppColors();
	return (
		<AppScreenFrame module="Hub" title="Modüller">
			<AppPromoCard label="Deneme" title="Hedefine bilgiyle yaklaş" description="Deneme çöz, analizini gör, gelişimini takip et." action="Denemelere git" />
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				{MODULE_TILES.map((tile) => (
					<AppCard key={tile.title} padding={13} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
						<AppIconDisc icon={tile.icon} />
						<AppText size={15} weight={700}>
							{tile.title}
						</AppText>
						<AppText size="caption" color={colors.muted}>
							{tile.subtitle}
						</AppText>
					</AppCard>
				))}
			</div>
			<AppListRow icon="sparkles" title="SinoAI" subtitle="Soru çöz, özet çıkar, çalışma üret" />
		</AppScreenFrame>
	);
};
