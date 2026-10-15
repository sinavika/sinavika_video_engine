import React from 'react';
import {useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, Content, HubCard, ModuleCarousel, Phone, SectionTitle, TourOverlay} from '../../Parts/Mobile';
import {Chip, Stack, Text} from '../../Parts/Shared';

/** The status line under each hub card's name: what waits in the module today. */
const STATUS: Record<ModuleKey, [string, string]> = {
	exam: ['Cumartesi canlı', 'Live on Saturday'],
	lessons: ['3 ders sürüyor', '3 in progress'],
	tests: ['35 / 100', '35 / 100'],
	studyPlan: ['Bugün 1/3', 'Today 1/3'],
	smartSummary: ['Bu ay 7 / 30', '7 / 30 this month'],
	flashcards: ['32 kart bugün', '32 due today'],
	sinoAi: ['Sor', 'Ask'],
};

/** Modüller (the app's home, the user's design): carousel of module slides, module cards under it, support at the end. */
const HubBody: React.FC<{slide?: ModuleKey; scrolled?: boolean}> = ({slide = 'exam', scrolled}) => {
	const t = useT();
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
					<Chip tone="brand" icon="flame">
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
				<div style={{position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 16, background: 'linear-gradient(135deg, #EA580C, #F97316)', display: 'flex', alignItems: 'center', gap: 12}}>
					<Icon name="headset" size={22} color="#FFFFFF" />
					<Stack grow gap={2}>
						<Text role="headline" color="#FFFFFF">
							{t('Destek', 'Support')}
						</Text>
						<Text role="small" color="rgba(255,255,255,0.9)">
							{t('Soruların ve taleplerin için yardım merkezi', 'Help centre for your questions and requests')}
						</Text>
					</Stack>
					<Icon name="right" size={20} color="#FFFFFF" />
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

/** Product tour over the hub: four steps, shown once, can be skipped. */
const tourSteps = [
	{hole: {x: 18, y: 168, w: 354, h: 214, r: 26}, title: ['Her gün buradan başla', 'Start here every day'], text: ['Kaydırınca her modülün bugün sana ne hazırladığını görürsün. Noktaların rengi modülün rengi.', 'Swipe to see what each module has for you today. Each dot is a module colour.'], below: true},
	{hole: {x: 14, y: 400, w: 362, h: 268, r: 22}, title: ['Modüller hep aynı yerde', 'Modules, always in the same place'], text: ['Her modülün kendi rengi var: kartta, sekmede ve sayfanın arka planında aynı renk.', 'Every module has its colour: on its card, its tabs and its pages.'], below: false},
	{hole: {x: 8, y: 60, w: 50, h: 50, r: 25}, title: ['Profil ve ayarlar', 'Profile and settings'], text: ['Hedefin, aboneliğin, görünüm ve destek burada. Hakkında da burada.', 'Your goal, plan, appearance and support live here.'], below: true, arrow: 0.06},
	{hole: {x: 14, y: 538, w: 362, h: 134, r: 22}, title: ['Takıldığın yerde SinoAI', 'SinoAI when you are stuck'], text: ['Soru sor, konu anlattır, notlarından quiz ve kart üret.', 'Ask, get a topic explained, turn notes into quizzes and cards.'], below: false},
] as const;

const TourScreen: React.FC<{step: number}> = ({step}) => {
	const t = useT();
	const data = tourSteps[step - 1];
	return (
		<Phone overlay={<TourOverlay hole={data.hole} step={step} title={t(data.title[0], data.title[1])} text={t(data.text[0], data.text[1])} below={data.below} arrow={'arrow' in data ? data.arrow : 0.5} />}>
			<HubBody scrolled={step === 4} />
		</Phone>
	);
};

export const Tour1Screen: React.FC = () => <TourScreen step={1} />;
export const Tour2Screen: React.FC = () => <TourScreen step={2} />;
export const Tour3Screen: React.FC = () => <TourScreen step={3} />;
export const Tour4Screen: React.FC = () => <TourScreen step={4} />;

/** The section title is used by other hub variants. */
export {SectionTitle};
