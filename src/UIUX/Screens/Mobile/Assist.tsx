import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, ModuleSlide, PageTitle, Phone, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, Dots, List, ListRow, Ring, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {ModuleWeekCard, StateBlock} from '../../Parts/Study';
import {UI_SHADOW} from '../../Tokens';

/** Akıllı Özet (Lens), Bilgi Kartları and SinoAI. */

const Thumb: React.FC<{video?: boolean}> = ({video}) => {
	const mod = useModuleColors('smartSummary');
	return (
		<div style={{width: 46, height: 46, borderRadius: 13, background: `linear-gradient(135deg, ${mod.soft}, ${mod.track})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<Icon name={video ? 'video' : 'image'} size={20} color={mod.color} />
		</div>
	);
};

export const SummaryHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('smartSummary');
	return (
		<ModuleScreen module="smartSummary" tab={0}>
			<Content gap={12}>
				<PageTitle
					module="smartSummary"
					title={t('Akıllı Özet', 'Smart Summary')}
					right={
						<Chip tone="module" module="smartSummary">
							{t('Kullanım %40', 'Used 40%')}
						</Chip>
					}
				/>
				<Stack gap={10}>
					<ModuleSlide module="smartSummary" height={176} />
					<Dots count={2} active={0} colors={[mod.color, mod.color]} />
				</Stack>
				<SectionTitle title={t('Geçmiş analizler', 'Past analyses')} />
				<Segmented items={[t('Soru analizleri', 'Questions'), t('Video analizleri', 'Videos')]} dark />
				<List>
					{[
						['Türev · Zincir kuralı', 'Derivatives · Chain rule', 'Matematik · bugün 14:10', 'Maths · today 14:10', 'Çözüldü', 'Solved'],
						['Osmanlı duraklama dönemi', 'Ottoman stagnation', 'Tarih · dün', 'History · yesterday', 'Özet', 'Summary'],
						['Mol hesaplamaları', 'Mole calculations', 'Kimya · 12 Ekim', 'Chemistry · 12 Oct', 'Çözüldü', 'Solved'],
					].map(([tr, en, subTr, subEn, stateTr, stateEn]) => (
						<Stack key={tr} row gap={12} style={{padding: '12px 14px'}}>
							<Thumb />
							<Stack grow gap={1}>
								<Text role="headline">{t(tr, en)}</Text>
								<Text role="small">{t(subTr, subEn)}</Text>
							</Stack>
							<Chip tone="module" module="smartSummary" size="sm">
								{t(stateTr, stateEn)}
							</Chip>
						</Stack>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const SummaryCameraScreen: React.FC = () => {
	const t = useT();
	const corners: [string, string][] = [
		['left', 'top'],
		['right', 'top'],
		['left', 'bottom'],
		['right', 'bottom'],
	];
	return (
		<UIProvider module="smartSummary">
			<Phone bg="#05070C" lightStatus>
				<Stack row justify="space-between" style={{padding: '6px 16px'}}>
					{(['x', 'zap'] as UIIconName[]).map((icon) => (
						<div key={icon} style={{width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={icon} size={20} color="#FFFFFF" />
						</div>
					))}
				</Stack>
				<div style={{position: 'relative', flex: 1, margin: '12px 0'}}>
					<div style={{position: 'absolute', left: 24, right: 24, top: 50, height: 420, borderRadius: 8, background: '#F5F1E8', transform: 'rotate(-2deg)', padding: 22, boxSizing: 'border-box'}}>
						<Text role="headline" color="#1E293B">
							14. f(x) = (3x² − 2)⁴ {t('için', 'for')} f'(1) {t('kaçtır?', '?')}
						</Text>
						<Text role="body" color="#1E293B" style={{marginTop: 12}}>
							A) 12 · B) 24 · C) 36 · D) 48 · E) 60
						</Text>
						<div style={{marginTop: 40, height: 8, width: '70%', borderRadius: 4, background: '#E2DCCD'}} />
						<div style={{marginTop: 10, height: 8, width: '50%', borderRadius: 4, background: '#E2DCCD'}} />
					</div>
					{corners.map(([x, y]) => (
						<div key={x + y} style={{position: 'absolute', [x]: 34, [y]: y === 'top' ? 60 : 300, width: 38, height: 38, [`border${x === 'left' ? 'Left' : 'Right'}`]: '4px solid #C4B5FD', [`border${y === 'top' ? 'Top' : 'Bottom'}`]: '4px solid #C4B5FD', borderRadius: 8}} />
					))}
					<div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}>
						<Chip tone="moduleSolid" module="smartSummary" icon="scan">
							{t('Soruyu çerçeveye al', 'Frame the question')}
						</Chip>
					</div>
				</div>
				<Stack gap={14} style={{padding: '0 0 40px'}}>
					<Stack row justify="space-between" style={{padding: '0 44px'}}>
						<div style={{width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="image" size={22} color="#FFFFFF" />
						</div>
						<div style={{width: 78, height: 78, borderRadius: 39, border: '4px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<div style={{width: 62, height: 62, borderRadius: 31, background: '#FFFFFF'}} />
						</div>
						<div style={{width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="refresh" size={22} color="#FFFFFF" />
						</div>
					</Stack>
				</Stack>
			</Phone>
		</UIProvider>
	);
};

export const SummaryProcessingScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<ModuleScreen module="smartSummary" noTabBar header={<AppHeader left="close" title={t('Analiz ediliyor', 'Analysing')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false} gap={16} style={{alignItems: 'center', textAlign: 'center', paddingTop: 30}}>
				<div style={{position: 'relative', width: 180, height: 180}}>
					<div style={{position: 'absolute', inset: 0, borderRadius: 40, background: mod.soft}} />
					<div style={{position: 'absolute', inset: 26, borderRadius: 28, background: '#F5F1E8', boxShadow: UI_SHADOW.float}} />
					<div style={{position: 'absolute', left: 20, right: 20, top: 88, height: 4, borderRadius: 2, background: mod.color, boxShadow: `0 0 18px ${mod.color}`}} />
				</div>
				<Text role="hero" align="center">
					{t('Sorunu okuyoruz', 'Reading your question')}
				</Text>
				<Text role="body" align="center">
					{t('Yaklaşık 20 saniye. Kapatsan da analiz sürer; bitince haber veririz.', 'About 20 seconds. Closing does not stop it; we tell you when it is ready.')}
				</Text>
				<Card padding={14} style={{width: '100%', textAlign: 'left'}}>
					<Stack gap={12}>
						<Bar value={0.64} color={mod.color} track={mod.track} />
						{[
							['checkCircle', t('Soru metni çıkarıldı', 'Question text extracted'), colors.success],
							['refresh', t('Konu ve kazanım bulunuyor', 'Finding topic and skill'), mod.color],
							['clock', t('Adım adım çözüm yazılacak', 'Writing step-by-step solution'), colors.subtle],
						].map(([icon, text, color]) => (
							<Stack key={text} row gap={10}>
								<Icon name={icon as UIIconName} size={18} color={color} />
								<Text role="small" color={colors.ink2}>
									{text}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

export const SummaryResultScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<ModuleScreen
			module="smartSummary"
			noTabBar
			header={
				<AppHeader
					left="back"
					title={t('Türev · Zincir kuralı', 'Chain rule')}
					right={
						<div style={{width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="more" size={22} color={colors.ink} stroke={3} />
						</div>
					}
				/>
			}
		>
			<Content tabBar={false} gap={12}>
				<Stack row gap={8}>
					<Chip tone="module" module="smartSummary" icon="scan">
						{t('Akıllı Özet', 'Smart Summary')}
					</Chip>
					<Chip>{t('AYT Matematik', 'SAT Math')}</Chip>
					<Chip tone="success" icon="check">
						{t('Cevap: B', 'Answer: B')}
					</Chip>
				</Stack>
				<SectionTitle title={t('Adım adım çözüm', 'Step by step')} />
				<Stack gap={10}>
					{[
						[t('Zincir kuralını uygula', 'Apply the chain rule'), "f'(x) = 4(3x² − 2)³ · 6x"],
						[t('İçi hesapla (x = 1)', 'Inner value (x = 1)'), '3 · 1² − 2 = 1'],
						[t('Yerine koy', 'Substitute'), "f'(1) = 4 · 1³ · 6 = 24"],
					].map(([title, formula], index) => (
						<Stack key={title} row gap={12} align="flex-start">
							<div style={{width: 26, height: 26, borderRadius: 13, background: mod.action, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Text role="meta" weight={800} color="#FFFFFF">
									{index + 1}
								</Text>
							</div>
							<Stack grow gap={5}>
								<Text role="headline" size={14}>
									{title}
								</Text>
								<div style={{padding: '9px 12px', borderRadius: 12, background: colors.card, border: `1px solid ${colors.line}`}}>
									<Text role="headline" size={14.5}>
										{formula}
									</Text>
								</div>
							</Stack>
						</Stack>
					))}
				</Stack>
				<Card tone="module" module="smartSummary" padding={14}>
					<Text role="over" color={mod.color}>
						{t('Kazanım', 'Skill')}
					</Text>
					<Text role="small" color={colors.ink2} style={{marginTop: 4}}>
						{t('İç içe fonksiyonda türev: dıştakinin türevi × içtekinin türevi. AYT’de her yıl 1–2 soru.', 'Derivative of a composite: outer × inner. 1–2 questions every year.')}
					</Text>
				</Card>
				<Card padding={14} style={{border: `1.5px solid ${colors.warningSoft}`}}>
					<Text role="over" color={colors.warningInk}>
						{t('Sık hata', 'Common mistake')}
					</Text>
					<Text role="small" color={colors.ink2} style={{marginTop: 4}}>
						{t('İçteki fonksiyonun türevini (6x) çarpmayı unutmak.', 'Forgetting to multiply by the inner derivative (6x).')}
					</Text>
				</Card>
				<SectionTitle title={t('Bu konuda devam et', 'Keep going on this topic')} />
				<List>
					<ListRow module="lessons" icon="book" title={t('Konuyu çalış', 'Study the topic')} subtitle={t('Dersler · Türev', 'Lessons · Derivatives')} />
				</List>
				{/* No card making from an analysis; "Benzer 5 soru" opens the topic's quiz in Testler. The photo closes the page. */}
				<SectionTitle title={t('Sorunun fotoğrafı', 'Photo of the question')} />
				<div style={{height: 150, borderRadius: 16, background: '#F5F1E8', padding: 16, boxSizing: 'border-box'}}>
					<Text role="headline" color="#1E293B">
						14. f(x) = (3x² − 2)⁴ {t('için', 'for')} f'(1) {t('kaçtır?', '?')}
					</Text>
					<Text role="small" color="#1E293B" style={{marginTop: 10}}>
						A) 12 · B) 24 · C) 36 · D) 48 · E) 60
					</Text>
				</div>
			</Content>
			<BottomBar border>
				<Stack row gap={10}>
					<Button tone="moduleSoft" module="tests" icon="quiz" style={{flex: 1}}>
						{t('Benzer 5 soru', '5 similar')}
					</Button>
					<Button tone="dark" icon="sparkles" style={{flex: 1}}>
						{t('SinoAI’ye sor', 'Ask SinoAI')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

export const SummaryUploadScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('smartSummary');
	return (
		<ModuleScreen module="smartSummary" tab={1}>
			<Content gap={12}>
				<PageTitle module="smartSummary" title={t('Soru yükle', 'Upload')} sub={t('Fotoğraf ya da galeri', 'Photo or gallery')} />
				<Card padding={24} style={{border: `2px dashed ${mod.line}`, background: mod.wash, boxShadow: 'none', textAlign: 'center'}}>
					<Stack align="center" gap={12}>
						<Tile module="smartSummary" icon="camera" size={58} solid />
						<Text role="section" align="center">
							{t('Takıldığın sorunun fotoğrafını çek', 'Snap the question you are stuck on')}
						</Text>
						<Text role="small" align="center">
							{t('Tek soru en iyi sonucu verir. 30 saniyede çözüm hazır.', 'One question works best. Ready in 30 seconds.')}
						</Text>
						<Stack row gap={8}>
							<Button tone="module" module="smartSummary" icon="camera">
								{t('Fotoğraf çek', 'Take photo')}
							</Button>
							<Button tone="ghost" icon="image">
								{t('Galeri', 'Gallery')}
							</Button>
						</Stack>
					</Stack>
				</Card>
				<SectionTitle title={t('Neler alacaksın?', 'What you get')} />
				<List>
					<ListRow module="smartSummary" icon="checkCircle" title={t('Adım adım çözüm', 'Step-by-step solution')} subtitle={t('Cevap ve kazanım', 'Answer and skill')} chevron={false} />
					<ListRow module="smartSummary" icon="note" title={t('Konu özeti', 'Topic summary')} subtitle={t('Sorunun konusunu tek sayfada', 'The topic on one page')} chevron={false} />
					<ListRow module="smartSummary" icon="info" title={t('Sık yapılan hata', 'Common mistake')} subtitle={t('Bu soruda en çok nerede yanılınır', 'Where most people slip on it')} chevron={false} />
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const SummaryVideoScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('smartSummary');
	return (
		<ModuleScreen module="smartSummary" tab={2}>
			<Content gap={12}>
				<PageTitle module="smartSummary" title={t('Video analizi', 'Video analysis')} sub={t('Ders videosundan özet ve soru', 'Summary and questions from a lesson video')} />
				<div style={{position: 'relative', height: 190, borderRadius: 22, background: 'linear-gradient(160deg, #1E1B4B, #4C1D95)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="play" size={26} color={mod.color} />
					</div>
					<div style={{position: 'absolute', left: 14, right: 14, bottom: 12}}>
						<Bar value={0.3} color="#C4B5FD" track="rgba(255,255,255,0.25)" height={4} />
					</div>
				</div>
				<Text role="headline">{t('Hücre bölünmesi · 18 dk', 'Cell division · 18 min')}</Text>
				<SectionTitle title={t('Bölümler', 'Chapters')} />
				<List>
					{[
						['00:00', 'Mitoz evreleri', 'Stages of mitosis'],
						['06:40', 'Mayoz ve çeşitlilik', 'Meiosis and variety'],
						['12:10', 'Sınavda nasıl sorulur', 'How it is asked'],
					].map(([time, tr, en]) => (
						<ListRow key={time} module="smartSummary" icon="playCircle" title={t(tr, en)} subtitle={time} />
					))}
				</List>
				<Button tone="module" module="smartSummary" size="lg" block icon="quiz">
					{t('Bu videodan 10 soru üret', 'Make 10 questions from it')}
				</Button>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Bilgi Kartları */

/**
 * Bilgi Kartları home (owner, 17 Nov 2026): lessons grouped by exam (heading
 * the exam name, "N ders" on the right), like the Testler and Dersler homes.
 * First use: the slide says how many new cards wait and starts them; lesson
 * rows carry "Yeni".
 */
const CARD_LESSONS: [string, string, string, number, number, number][] = [
	['TYT', 'Kimya', 'Chemistry', 3, 0.62, 12],
	['TYT', 'Tarih', 'History', 4, 0.42, 10],
	['TYT', 'Türkçe', 'Turkish', 2, 0.55, 6],
	['TYT', 'Coğrafya', 'Geography', 2, 0.9, 4],
	['AYT', 'Biyoloji', 'Biology', 2, 0.3, 0],
	['AYT', 'Edebiyat', 'Literature', 1, 0.25, 0],
];

const CardsHome: React.FC<{first?: boolean}> = ({first}) => {
	const t = useT();
	const colors = useColors();
	const exams = ['TYT', 'AYT'];
	return (
		<ModuleScreen module="flashcards" tab={0}>
			<Content gap={12}>
				<PageTitle module="flashcards" title={t('Bilgi Kartları', 'Flashcards')} />
				{first ? <ModuleSlide module="flashcards" height={160} label={t('İlk kartların', 'Your first cards')} title={t('140 yeni kart seni bekliyor', '140 new cards are waiting')} text={t('Günde 20 yeni kart; unutmadan önce yeniden sorarız.', '20 new cards a day; we ask again before you forget.')} action={t('Yeni kartlara başla', 'Start new cards')} /> : <ModuleSlide module="flashcards" height={160} />}
				{first ? null : (
					<ModuleWeekCard
						module="flashcards"
						time={t('45 dk', '45 min')}
						change={-6}
						bars={[5, 10, 0, 8, 12, 0, 10]}
						stats={[
							[t('Çalışılan kart', 'Cards studied'), '210'],
							[t('Başarı', 'Success'), t('%81', '81%')],
							[t('Seri', 'Streak'), t('5 gün', '5 days')],
						]}
					/>
				)}
				{exams.map((exam) => {
					const rows = CARD_LESSONS.filter((row) => row[0] === exam);
					return (
						<Stack key={exam} gap={8}>
							<Stack row justify="space-between" style={{padding: '0 4px'}}>
								<Text role="section" size={17}>
									{exam}
								</Text>
								<Text role="meta">{t(`${rows.length} ders`, `${rows.length} subjects`)}</Text>
							</Stack>
							<List>
								{rows.map(([, tr, en, decks, value, due]) => (
									<ListRow
										key={tr}
										module="flashcards"
										icon="book"
										title={t(tr, en)}
										subtitle={first ? t(`${decks} deste`, `${decks} decks`) : t(`${decks} deste · %${Math.round(value * 100)} öğrenildi`, `${decks} decks · ${Math.round(value * 100)}% learnt`)}
										trailing={
											<Stack row gap={8}>
												{first ? (
													<Chip tone="module" module="flashcards" size="sm">
														{t('Yeni', 'New')}
													</Chip>
												) : due ? (
													<Chip tone="module" module="flashcards" size="sm">
														{due} {t('bugün', 'today')}
													</Chip>
												) : null}
												<Icon name="right" size={18} color={colors.subtle} />
											</Stack>
										}
									/>
								))}
							</List>
						</Stack>
					);
				})}
			</Content>
		</ModuleScreen>
	);
};

export const CardsHomeScreen: React.FC = () => <CardsHome />;

/** First use: no card studied yet. */
export const CardsHomeFirstScreen: React.FC = () => <CardsHome first />;

/**
 * A lesson's decks (drawn 17 Nov 2026; sizes as m-test-konular): the lesson
 * summary box with a ring, then one row per deck: cards icon, topic name,
 * "x/y kart · %z", "N zayıf" when some cards keep slipping.
 */
export const CardsDecksScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	const decks: [string, string, number, number, number][] = [
		['Mol kavramı', 'The mole', 18, 24, 3],
		['Atom modelleri', 'Atomic models', 12, 20, 0],
		['Periyodik sistem', 'Periodic table', 6, 22, 5],
	];
	return (
		<ModuleScreen module="flashcards" tab={0} header={<AppHeader left="back" title={t('Kimya', 'Chemistry')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card tone="moduleLine" module="flashcards" padding={16}>
					<Stack row gap={14}>
						<Ring value={0.62} size={60} stroke={6} color={mod.color} track={mod.track}>
							<Text role="meta" weight={800}>
								{t('%62', '62%')}
							</Text>
						</Ring>
						<Stack grow gap={2}>
							<Text role="headline">{t('TYT Kimya', 'TYT Chemistry')}</Text>
							<Text role="small">{t('3 deste · %62 öğrenildi', '3 decks · 62% learnt')}</Text>
						</Stack>
					</Stack>
				</Card>
				<List>
					{decks.map(([tr, en, known, total, weak]) => (
						<ListRow
							key={tr}
							module="flashcards"
							icon="cards"
							title={t(tr, en)}
							subtitle={t(`${known}/${total} kart · %${Math.round((known / total) * 100)}`, `${known}/${total} cards · ${Math.round((known / total) * 100)}%`)}
							trailing={
								weak ? (
									<Chip tone="warning" size="sm">
										{t(`${weak} zayıf`, `${weak} weak`)}
									</Chip>
								) : undefined
							}
						/>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

/** Nothing due today: one line and the way to the lessons. */
export const CardsTodayEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="flashcards" tab={1}>
			<Content gap={12}>
				<PageTitle module="flashcards" title={t('Bugün', 'Today')} />
				<StateBlock module="flashcards" icon="checkCircle" title={t('Bugün tekrar edilecek kart yok', 'No cards due today')} text={t('Yeni kartlar derslerin içinde; tekrar zamanı gelen kart burada görünür.', 'New cards are inside the subjects; due cards show here.')} action={t('Derslere git', 'Go to subjects')} />
			</Content>
		</ModuleScreen>
	);
};

export const CardsTodayScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('flashcards');
	return (
		<ModuleScreen module="flashcards" tab={1}>
			<Content gap={12}>
				<PageTitle module="flashcards" title={t('Bugün', 'Today')} sub={t('Aralıklı tekrar: unutmadan önce hatırla', 'Spaced repetition: recall before you forget')} />
				<Card padding={18} style={{background: mod.gradient, border: 0}}>
					<Stack row gap={16}>
						<Ring value={0.37} size={84} stroke={9} color="#FFFFFF" track="rgba(255,255,255,0.3)">
							<Text role="headline" color="#FFFFFF">
								12/32
							</Text>
						</Ring>
						<Stack gap={4} grow>
							<Text role="section" color="#FFFFFF">
								{t('20 kart kaldı', '20 cards left')}
							</Text>
							<Text role="small" color="rgba(255,255,255,0.9)">
								{t('Yaklaşık 6 dakika. Seri 7 gün.', 'About 6 minutes. 7-day streak.')}
							</Text>
							<Button tone="white" size="sm" icon="play" style={{alignSelf: 'flex-start', color: mod.action}}>
								{t('Devam et', 'Continue')}
							</Button>
						</Stack>
					</Stack>
				</Card>
				<SectionTitle title={t('Bugünün desteleri', 'Today’s decks')} />
				<List>
					{[
						['Kimya · Mol', 'Chemistry · Mole', 12],
						['Tarih · Osmanlı', 'History · Ottoman', 10],
						['Türkçe · Ses bilgisi', 'Reading · Vocabulary', 6],
						['Coğrafya · İklim', 'Geography · Climate', 4],
					].map(([tr, en, count]) => (
						<ListRow key={tr as string} module="flashcards" title={t(tr as string, en as string)} subtitle={`${count} ${t('kart', 'cards')}`} />
					))}
				</List>
				<Card tone="soft" padding={14}>
					<Stack row gap={10}>
						<Icon name="calendar" size={18} color={colors.muted} />
						<Text role="small">{t('Yarın 18 kart tekrar zamanına gelecek.', '18 cards will be due tomorrow.')}</Text>
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

const FlashcardFace: React.FC<{back?: boolean}> = ({back}) => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	return (
		<div style={{position: 'relative', flex: 1, margin: '6px 20px 0'}}>
			<div style={{position: 'absolute', inset: '24px 18px -12px', borderRadius: 28, background: 'var(--ui-card)', opacity: 0.55}} />
			<div style={{position: 'absolute', inset: '12px 9px -5px', borderRadius: 28, background: 'var(--ui-card)', opacity: 0.8}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: 28, background: 'var(--ui-card)', boxShadow: UI_SHADOW.float, padding: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center'}}>
				<Chip tone="module" module="flashcards">
					{back ? t('Cevap', 'Answer') : t('Tanım', 'Definition')}
				</Chip>
				<Text role="meta">{t('Kimya · Mol', 'Chemistry · Mole')}</Text>
				{back ? (
					<>
						<Text role="hero" align="center">
							{t('6,02', '6.02')} × 10²³ {t('tanecik', 'particles')}
						</Text>
						<Text role="body" align="center">
							{t('Avogadro sayısı kadar atom, molekül ya da iyon içeren madde miktarı.', 'The amount containing Avogadro’s number of particles.')}
						</Text>
					</>
				) : (
					<>
						<Text role="hero" size={28} align="center">
							{t('1 mol nedir?', 'What is 1 mole?')}
						</Text>
						<Button tone="moduleSoft" module="flashcards" size="sm" icon="refresh">
							{t('Çevir', 'Flip')}
						</Button>
					</>
				)}
				<div style={{position: 'absolute', bottom: 18, color: mod.color}}>
					<Text role="meta">12 / 32</Text>
				</div>
			</div>
		</div>
	);
};

export const CardSessionScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	return (
		<UIProvider module="flashcards">
			<Phone bg={`linear-gradient(180deg, ${mod.soft} 0%, var(--ui-bg) 70%)`}>
				<FocusHeader title={t('Kart oturumu', 'Card session')} sub={t('Kimya · Mol', 'Chemistry · Mole')} progress={0.37} />
				<FlashcardFace />
				<BottomBar>
					<Text role="small" align="center">
						{t('Önce kendin hatırlamaya çalış', 'Try to recall it first')}
					</Text>
					<Button size="lg" block>
						{t('Cevabı gör', 'Show answer')}
					</Button>
				</BottomBar>
			</Phone>
		</UIProvider>
	);
};

export const CardSessionBackScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('flashcards');
	return (
		<UIProvider module="flashcards">
			<Phone bg={`linear-gradient(180deg, ${mod.soft} 0%, var(--ui-bg) 70%)`}>
				<FocusHeader title={t('Kart oturumu', 'Card session')} sub={t('Kimya · Mol', 'Chemistry · Mole')} progress={0.37} />
				<FlashcardFace back />
				<BottomBar>
					<Text role="small" align="center">
						{t('Ne kadar iyi hatırladın?', 'How well did you recall it?')}
					</Text>
					<Stack row gap={8}>
						{[
							[t('Bilmiyorum', 'Don’t know'), t('1 dk', '1 min'), colors.errorInk],
							[t('Emin değilim', 'Not sure'), t('6 dk', '6 min'), colors.warningInk],
							[t('Biliyorum', 'I know it'), t('4 gün', '4 days'), colors.successInk],
						].map(([label, next, color]) => (
							<Stack key={label} align="center" justify="center" gap={2} style={{flex: 1, height: 62, borderRadius: 18, background: colors.card, border: `1.5px solid ${colors.line}`}}>
								<Text role="headline" size={13.5} color={color}>
									{label}
								</Text>
								<Text role="meta">{next}</Text>
							</Stack>
						))}
					</Stack>
				</BottomBar>
			</Phone>
		</UIProvider>
	);
};

export const CardsSavedScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="flashcards" tab={2}>
			<Content gap={12}>
				<PageTitle module="flashcards" title={t('Kaydedilenler', 'Saved')} sub={t('Kaydettiğin 24 kart', '24 saved cards')} />
				<Stack row gap={8}>
					{[t('Tümü', 'All'), t('Kimya', 'Chemistry'), t('Tarih', 'History'), t('Türkçe', 'Reading & Writing')].map((label, index) => (
						<Chip key={label} tone={index ? 'outline' : 'moduleSolid'} module="flashcards">
							{label}
						</Chip>
					))}
				</Stack>
				<List>
					{[
						['1 mol nedir?', 'What is 1 mole?', 'Kimya', 'Chemistry'],
						['Lale Devri hangi yıllar?', 'Tulip Era years?', 'Tarih', 'History'],
						['Ünsüz yumuşaması nedir?', 'Consonant softening?', 'Türkçe', 'Turkish'],
						['Muson iklimi nerede görülür?', 'Where is monsoon climate?', 'Coğrafya', 'Geography'],
					].map(([tr, en, lessonTr, lessonEn]) => (
						<ListRow key={tr} module="flashcards" icon="bookmark" title={t(tr, en)} subtitle={t(lessonTr, lessonEn)} />
					))}
				</List>
				{/* With a lesson chip chosen, the review opens with that lesson only. */}
				<Button tone="module" module="flashcards" size="lg" block icon="play">
					{t('Kaydedilenleri tekrar et', 'Review saved cards')}
				</Button>
			</Content>
		</ModuleScreen>
	);
};
