import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, Content, HubCard, ModuleCarousel, Phone, SectionTitle, TourOverlay} from '../../Parts/Mobile';
import {Chip, Stack, Text} from '../../Parts/Shared';

/** The status line under each hub card's name: what waits in the module today. */
const STATUS: Record<ModuleKey, [string, string]> = {
	exam: ['Cumartesi canlı', 'Live on Saturday'],
	lessons: ['1 konu sürüyor', '1 topic in progress'],
	tests: ['35 / 100', '35 / 100'],
	studyPlan: ['Bugün 1/3', 'Today 1/3'],
	smartSummary: ['Bu ay 7 / 30', '7 / 30 this month'],
	flashcards: ['32 kart bugün', '32 due today'],
	sinoAi: ['Sor', 'Ask'],
};

/** Modüller (the app's home, the user's design): carousel of module slides, module cards under it, support at the end. */
const HubBody: React.FC<{slide?: ModuleKey; scrolled?: boolean}> = ({slide = 'exam', scrolled}) => {
	const t = useT();
	const colors = useColors();
	const cards = MODULE_ORDER.filter((key) => key !== 'sinoAi');
	return (
		<>
			<AppHeader />
			<Content tabBar={false} gap={14}>
				<Stack gap={14} style={{transform: scrolled ? 'translateY(-380px)' : undefined}}>
				<Stack row justify="space-between" align="flex-end">
					<Stack gap={2}>
						<Text role="small">{t('Günaydın Ayşe', 'Good morning, Ayşe')}</Text>
						<Text role="title">{t('Bugün ne çalışalım?', 'What shall we study today?')}</Text>
					</Stack>
					<Chip tone="warning" icon="flame">
						{t('5 gün', '5 days')}
					</Chip>
				</Stack>
				<ModuleCarousel active={slide} />
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					{cards.map((key) => (
						<HubCard key={key} module={key} status={t(STATUS[key][0], STATUS[key][1])} />
					))}
					<HubCard module="sinoAi" wide status={t('Hedefini bilerek anlatır', 'Knows your goal')} />
				</div>
				<div style={{borderRadius: 20, padding: 16, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{width: 40, height: 40, borderRadius: 13, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="headset" size={20} color={colors.ink2} />
					</div>
					<Stack grow gap={2}>
						<Text role="headline">{t('Destek', 'Support')}</Text>
						<Text role="small">{t('Soruların ve taleplerin için yardım merkezi', 'Help centre for your questions and requests')}</Text>
					</Stack>
					<Icon name="right" size={20} color={colors.subtle} />
				</div>
				</Stack>
			</Content>
		</>
	);
};

export const HubScreen: React.FC = () => (
	<Phone>
		<HubBody />
	</Phone>
);

export const HubScrolledScreen: React.FC = () => (
	<Phone>
		<HubBody slide="studyPlan" scrolled />
	</Phone>
);

/**
 * First-use tip on Modüller: one tip, the first time the hub opens, framing
 * the slide with its dots. Other features explain themselves with their own
 * one-line tip where they are first met; there is no tour up front.
 */
export const HubTipScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone overlay={<TourOverlay hole={{x: 12, y: 160, w: 366, h: 230, r: 30}} title={t('Her gün buradan başla', 'Start here every day')} text={t('Kaydırınca her modülün bugün sana ne hazırladığını görürsün. Noktaların rengi modülün rengi.', 'Swipe to see what each module has for you today. Each dot is a module colour.')} />}>
			<HubBody />
		</Phone>
	);
};

/** The section title is used by other hub variants. */
export {SectionTitle};
