import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {AppHeader, BottomBar, Content, FitList, FocusHeader, ModuleScreen, PageTitle, Phone, SectionTitle} from '../../Parts/Mobile';
import {Button, Card, Chip, List, ListRow, OptionRow, PendingSyncNote, Stack, Text, Tile} from '../../Parts/Shared';
import {PlanTaskCard, StateBlock, WeekStrip} from '../../Parts/Study';
import {TopicSurvey, WORK_LESSONS} from './Lessons';

/**
 * The states every screen needs besides "full" (gap pass, 5 Nov 2026): no
 * data yet, all done, a limit reached, something failed, an update needed.
 * Rule: no state is a dead end; each says why it is so, what happens next
 * and offers one action. Numbers that are zero are not shown as zero.
 */

/* ------------------------------------------------------------------ Ders Planı */

/** No plan: what a plan does, a sample day built from the sign-up answers, two ways to start. */
export const PlanNoneScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="studyPlan" tab={0}>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('Bugün', 'Today')} />
				<StateBlock module="studyPlan" icon="calendar" title={t('Henüz planın yok', 'No plan yet')} text={t('Sınav tarihine, boş günlerine ve zorlandığın derslere göre her güne görev koyarız; denemeden sonra kendini günceller.', 'We put tasks on each day from your exam date, free days and weak subjects; it updates after every exam.')} action={t('Planımı hazırla · 1 dk', 'Build my plan · 1 min')} second={t('Kendi planımı kuracağım', 'I’ll make my own')} />
				<SectionTitle title={t('Örnek bir gün', 'A sample day')} sub={t('Kayıttaki cevaplarına göre', 'From your sign-up answers')} />
				<FitList gap={8}>
					<div style={{opacity: 0.85}}>
						<PlanTaskCard module="lessons" source={t('TYT Matematik · Dersler', 'TYT Maths · Lessons')} title={t('Temel Kavramlar', 'Basic concepts')} amount={t('İlk konu · 12 dk', 'First topic · 12 min')} />
					</div>
					<div style={{opacity: 0.85}}>
						<PlanTaskCard module="tests" source={t('TYT Fizik · Testler', 'TYT Physics · Quizzes')} title={t('Fizik Bilimine Giriş · Kolay', 'Intro to physics · Easy')} amount={t('20 soru · 25 dk', '20 q · 25 min')} />
					</div>
				</FitList>
				<Text role="meta" align="center" color={colors.muted}>
					{t('Plan hazırlanınca bu görevler takvimine yerleşir.', 'These go into your calendar once the plan is ready.')}
				</Text>
			</Content>
		</ModuleScreen>
	);
};

/** Yesterday's unfinished tasks: never silently dropped; move to today or spread over the week. */
export const PlanMissedScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="studyPlan" tab={0}>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('Bugün', 'Today')} />
				<WeekStrip module="studyPlan" done={[0, 1]} share={0} />
				<Stack gap={10} style={{padding: 14, borderRadius: 20, background: colors.warningSoft, border: `1px solid ${colors.warning}`}}>
					<Stack row gap={10} align="flex-start">
						<Icon name="history" size={20} color={colors.warningInk} />
						<Stack grow gap={2}>
							<Text role="headline" color={colors.warningInk}>
								{t('Dünden 2 görev kaldı', '2 tasks left from yesterday')}
							</Text>
							<Text role="small" color={colors.ink2}>
								{t('Bugüne eklersek günün 40 dk uzar. Haftaya yayarsak her güne biraz düşer.', 'Adding to today makes it 40 min longer; spreading adds a little to each day.')}
							</Text>
						</Stack>
					</Stack>
					<Stack row gap={8}>
						<Button tone="ghost" size="sm" style={{flex: 1}}>
							{t('Haftaya yay', 'Spread over the week')}
						</Button>
						<Button tone="module" module="studyPlan" size="sm" style={{flex: 1}}>
							{t('Bugüne ekle', 'Add to today')}
						</Button>
					</Stack>
				</Stack>
				<Stack gap={8}>
					<PlanTaskCard module="tests" source={t('Dün · TYT Matematik', 'Yesterday · TYT Maths')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 q · 25 min')} badge={t('Dünden', 'Yesterday')} />
					<PlanTaskCard module="lessons" source={t('Bugün · TYT Türkçe', 'Today · TYT Turkish')} title={t('Söz Yorumu', 'Interpreting sayings')} amount={t('Kaldığın yerden · 10 dk', 'From where you left off · 10 min')} now />
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Denemeler */

export const ExamResultsEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="exam" tab={2}>
			<Content gap={12}>
				<PageTitle module="exam" title={t('Sonuçlar', 'Results')} />
				<StateBlock module="exam" icon="chart" title={t('İlk denemenden sonra burada', 'Here after your first exam')} text={t('Netin, sıralaman ve net kaybettiğin konular her denemeden sonra burada birikir.', 'Your nets, rank and the topics that cost you collect here after each exam.')} action={t('Sıradaki denemeye bak', 'See the next exam')} second={t('Dışarıda çözdüğün bir denemeyi ekle', 'Add an exam you solved elsewhere')} />
				<Card padding={14} tone="module" module="exam">
					<Stack row gap={12}>
						<Tile module="exam" size={42} solid />
						<Stack grow gap={1}>
							<Text role="headline">{t('TYT Deneme 5', 'TYT Exam 5')}</Text>
							<Text role="small">{t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')}</Text>
						</Stack>
						<Button tone="module" module="exam" size="sm">
							{t('Hatırlat', 'Remind')}
						</Button>
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

/** Connection lost during an exam: the shared "to send" line under the question (same as Dersler and Testler); the timer keeps running, sending is automatic. */
export const ExamOfflineScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" noTabBar header={<FocusHeader title="1:31:02" sub={t('Temel Matematik', 'Basic Maths')} progress={0.45} />}>
			<Content tabBar={false} gap={12} padding="14px 18px 10px">
				<Chip>{t('Soru 22 / 40', 'Question 22 / 40')}</Chip>
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Ardışık üç tek sayının toplamı 57’dir. Bu sayıların en büyüğü kaçtır?', 'Three consecutive odd numbers add up to 57. What is the largest?')}
				</Text>
				<OptionRow letter="A" text="19" />
				<OptionRow letter="B" text="21" state="selected" module="exam" />
				<OptionRow letter="C" text="23" />
				<OptionRow letter="D" text="25" />
				<PendingSyncNote module="exam" />
			</Content>
			<BottomBar border>
				<Stack row gap={10}>
					<Button tone="ghost" size="lg" icon="left" />
					<Button tone="soft" size="lg" style={{flex: 1}}>
						{t('Boş bırak', 'Skip')}
					</Button>
					<Button size="lg" iconRight="right" style={{flex: 1}}>
						{t('Sonraki', 'Next')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Dersler */

/** First visit to Dersler: no "continue" yet, so one recommended first topic from the sign-up answers. */
export const LessonsFirstVisitScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" tab={0}>
			<Content gap={12}>
				<PageTitle module="lessons" title={t('Dersler', 'Lessons')} />
				<div style={{borderRadius: 24, padding: 18, background: mod.gradient, display: 'flex', flexDirection: 'column', gap: 6}}>
					<Text role="over" color="rgba(255,255,255,0.9)">
						{t('Buradan başla', 'Start here')}
					</Text>
					<Text role="title" size={22} color="#FFFFFF">
						{t('Temel Kavramlar', 'Basic concepts')}
					</Text>
					<Text role="small" color="#FFFFFF">
						{t('Matematik’te zorlandığını söyledin. Konu adım adım ilerler; istediğin yerde bırakırsın.', 'You said maths is hard for you. The topic goes step by step; stop wherever you like.')}
					</Text>
					<Button tone="white" icon="play" style={{alignSelf: 'flex-start', marginTop: 8, color: mod.action}}>
						{t('Konuya başla', 'Start the topic')}
					</Button>
				</div>
				<Card padding={14}>
					<Stack gap={10}>
						<Text role="headline">{t('Dersler nasıl işler?', 'How lessons work')}</Text>
						{[
							['book', t('Her konu kısa adımlardan oluşur; kaldığın yerden sürer', 'Each topic is short steps; it resumes where you left off')],
							['checkCircle', t('Her adımda sen de cevaplarsın', 'You answer at every step')],
							['refresh', t('İlk denemede yanlışların 1, 3 ve 7 gün sonra tekrar gelir', 'Misses come back after 1, 3 and 7 days')],
						].map(([icon, line]) => (
							<Stack key={line} row gap={10}>
								<Icon name={icon as UIIconName} size={18} color={mod.color} />
								<Text role="small" color={colors.ink2}>
									{line}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
				<SectionTitle title="TYT" sub={t('10 ders · 168 konu', '10 subjects · 168 topics')} action={t('Tümü', 'All')} />
				<List>
					{WORK_LESSONS.map(([tr, en, , , topics]) => (
						<ListRow key={tr} module="lessons" icon="book" title={t(tr, en)} subtitle={t(`${topics} konu · henüz başlamadın`, `${topics} topics · not started yet`)} />
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const LessonsReviewEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="lessons" tab={2}>
			<Content gap={12}>
				<PageTitle module="lessons" title={t('Tekrar', 'Review')} />
				<StateBlock module="lessons" icon="checkCircle" tone="success" title={t('Bugün tekrar yok', 'Nothing to review today')} text={t('Yanlış yaptığın adımlar burada 1, 3 ve 7 gün sonra karşına çıkar. Sıradaki tekrar yarın: 4 adım.', 'Steps you miss come back after 1, 3 and 7 days. Next review tomorrow: 4 steps.')} action={t('Kaldığın derse dön', 'Back to your lesson')} />
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Testler, Bilgi Kartları */

export const TestsSolutionsEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="tests" tab={2}>
			<Content gap={12}>
				<PageTitle module="tests" title={t('Çözümler', 'Solutions')} />
				<StateBlock module="tests" icon="quiz" title={t('Çözdüğün testler burada', 'Your solved quizzes appear here')} text={t('Her testin soruları, cevapların ve çözümleri; yanlışlarına tek dokunuşla dönersin.', 'Every quiz with your answers and solutions; jump back to mistakes in one tap.')} action={t('Senin için hazır test', 'Your ready quiz')} second={t('Problemler · Orta · 20 soru', 'Problems · Medium · 20 q')} />
			</Content>
		</ModuleScreen>
	);
};

/**
 * Session end. Today mode: the Bugün page's done state. A deck or saved-cards
 * session ends with the same block titled "Deste bitti" and the content
 * survey under it (owner, 17 Nov 2026).
 */
const CardsDone: React.FC<{deck?: boolean}> = ({deck}) => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="flashcards" tab={deck ? 0 : 1}>
			<Content gap={12}>
				<PageTitle module="flashcards" title={deck ? t('Mol kavramı', 'The mole') : t('Bugün', 'Today')} />
				{deck ? <StateBlock module="flashcards" icon="checkCircle" tone="success" title={t('Deste bitti', 'Deck done')} text={t('24 kartı çalıştın; 18’ini biliyordun. Bilmediklerin tekrar zamanında yeniden gelir.', 'You studied 24 cards and knew 18. The rest come back when due.')} action={t('Desteye dön', 'Back to the deck')} second={t('Derse dön', 'Back to the subject')} /> : null}
				{deck ? <TopicSurvey /> : null}
				{deck ? null : <StateBlock module="flashcards" icon="checkCircle" tone="success" title={t('Bugünkü kartlar bitti', 'Today’s cards are done')} text={t('32 kartı tekrar ettin; 27’sini biliyordun. Yarın 18 kart tekrar zamanına gelecek.', 'You reviewed 32 cards and knew 27. 18 come due tomorrow.')} action={t('Kaydettiklerime bak', 'Open my saved cards')} second={t('Yeni bir desteye başla', 'Start a new deck')} />}
				<Stack row gap={8} justify="center">
					<Icon name="flame" size={16} color={colors.warningInk} />
					<Text role="small" color={colors.warningInk} weight={700}>
						{t('Kart serisi 7 gün', '7-day card streak')}
					</Text>
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

export const CardsDoneScreen: React.FC = () => <CardsDone />;

/** A deck (or saved-cards) session ended. */
export const CardsDeckDoneScreen: React.FC = () => <CardsDone deck />;

/* ------------------------------------------------------------------ Akıllı Özet */

export const SummaryQuotaScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="smartSummary" tab={0}>
			<Content gap={12}>
				<PageTitle
					module="smartSummary"
					title={t('Akıllı Özet', 'Smart Summary')}
					right={
						<Chip tone="module" module="smartSummary">
							{t('Kullanım %100', 'Used 100%')}
						</Chip>
					}
				/>
				<StateBlock module="smartSummary" icon="clock" title={t('Kullanım hakkın doldu', 'Your quota is used up')} text={t('Hakkın SinoAI ile ortak ve 1 Aralık’ta yenilenir. Geçmiş analizlerin ve çözümlerin açık kalır.', 'Shared with SinoAI; it renews on 1 December. Past analyses stay open.')} action={t('Geçmiş analizlerim', 'My past analyses')} />
			</Content>
		</ModuleScreen>
	);
};

/** The photo could not be read: what went wrong, how to retake; the try is not counted. */
export const SummaryFailedScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="smartSummary" tab={1}>
			<Content gap={12}>
				<PageTitle module="smartSummary" title={t('Soru yükle', 'Upload')} />
				<StateBlock module="smartSummary" icon="image" tone="warning" title={t('Fotoğraf okunamadı', 'We couldn’t read the photo')} text={t('Soru bulanık ya da kesik görünüyor. Bu deneme hakkından düşmedi.', 'The question looks blurry or cut off. This try was not counted.')} action={t('Yeniden çek', 'Retake')} second={t('Galeriden seç', 'Pick from gallery')}>
					<Stack gap={6} style={{alignSelf: 'stretch', textAlign: 'left', padding: '10px 12px', borderRadius: 14, background: colors.line2}}>
						{[t('Soruyu çerçevenin içine al', 'Fit the question in the frame'), t('Işık yansımasın, gölge düşmesin', 'Avoid glare and shadows'), t('Tek soru çek; şıklar da görünsün', 'One question, options included')].map((tip) => (
							<Stack key={tip} row gap={8}>
								<Icon name="check" size={15} color={colors.successInk} />
								<Text role="small" color={colors.ink2}>
									{tip}
								</Text>
							</Stack>
						))}
					</Stack>
				</StateBlock>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ SinoAI */

export const SinoLimitScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<UIProvider module="sinoAi">
			<Phone>
				<AppHeader left="menu" title="SinoAI" right={<div style={{width: 40}} />} />
				<Content tabBar={false} gap={12}>
					<StateBlock module="sinoAi" icon="clock" title={t('Bu ayın SinoAI hakkın doldu', 'This month’s SinoAI quota is used up')} text={t('1 Aralık’ta yenilenir; hak Akıllı Özet ile ortaktır. Sohbetlerin ve ürettiklerin kütüphanende duruyor.', 'It renews on 1 December and is shared with Smart Summary. Your chats and work stay in your library.')} action={t('Kütüphaneme git', 'Open my library')} />
					<Card padding={14} tone="soft">
						<Stack gap={6}>
							<Text role="headline">{t('Bu arada', 'Meanwhile')}</Text>
							<Text role="small" color={colors.ink2}>
								{t('Takıldığın konunun anlatımı ya da testi hakkından düşmez.', 'Topic lessons and quizzes don’t use this limit.')}
							</Text>
						</Stack>
					</Card>
				</Content>
				<div style={{padding: '0 18px 30px'}}>
					<div data-ui="disabled" style={{height: 50, borderRadius: 25, background: colors.line2, display: 'flex', alignItems: 'center', padding: '0 18px', opacity: 0.6}}>
						<Text role="small">{t('1 Aralık’ta yeniden sorabilirsin', 'You can ask again on 1 December')}</Text>
					</div>
				</div>
			</Phone>
		</UIProvider>
	);
};

/* ------------------------------------------------------------------ Bildirimler, güncelleme */

export const NotificationsEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" title={t('Bildirimler', 'Notifications')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<StateBlock icon="bell" title={t('Bildirimin yok', 'No notifications')} text={t('Deneme sonucun, günün planı ve SinoAI yanıtları geldiğinde burada görünür.', 'Exam results, your daily plan and SinoAI replies show up here.')} action={t('Bildirim ayarları', 'Notification settings')} />
			</Content>
		</Phone>
	);
};

/** A required update: what is new in one line, one button to the store; nothing else is reachable. */
export const ForceUpdateScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<Content tabBar={false} gap={14} style={{justifyContent: 'center', alignItems: 'center', paddingTop: 80}}>
				<StateBlock icon="refresh" title={t('Yeni sürüm gerekli', 'Update required')} text={t('Bu sürüm artık desteklenmiyor. Güncellemeden sonra kaldığın yerden devam edersin; ilerlemen hesabında.', 'This version is no longer supported. Your progress is safe in your account.')} action={t('Mağazada güncelle', 'Update in the store')}>
					<Text role="meta" align="center" color={colors.muted}>
						{t('Yüklü 2.4.0 · gerekli 2.6.0', 'Installed 2.4.0 · required 2.6.0')}
					</Text>
				</StateBlock>
			</Content>
		</Phone>
	);
};
