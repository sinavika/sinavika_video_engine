import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {Bar, Button, Card, Chip, List, ListRow, Ring, Stack, Text, Tile} from '../../Parts/Shared';
import {Grid, Immersive, ModuleBanner, ModuleHead, Panel, WCard} from '../../Parts/Web';
import {UI_SHADOW} from '../../Tokens';

/** Web Bilgi Kartları, Akıllı Özet and SinoAI. */

export const WebCardsHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	return (
		<Panel active="flashcards">
			<ModuleHead module="flashcards" tab={0} tabs={[t('Kartlar', 'Cards'), t('Bugün', 'Today'), t('Gözat', 'Browse'), t('Kaydedilenler', 'Saved')]} title={t('Bilgi Kartları', 'Flashcards')} sub={t('6 deste · 32 kart bugün tekrar bekliyor', '6 decks · 32 due today')} actions={<Button tone="ghost" icon="plus">{t('Yeni deste', 'New deck')}</Button>} />
			<ModuleBanner module="flashcards" over={t('Bugün tekrar', 'Review today')} title={t('32 kart seni bekliyor', '32 cards are due')} text={t('Unutmak üzere olduğun kartlar. Yaklaşık 8 dakika; seri 7 gün.', 'Cards you are about to forget. About 8 minutes; 7-day streak.')} action={t('Tekrara başla', 'Start review')}>
				<Ring value={0.37} size={110} stroke={10} color="#FFFFFF" track="rgba(255,255,255,0.3)">
					<Text role="section" color="#FFFFFF">
						12/32
					</Text>
				</Ring>
			</ModuleBanner>
			<Grid columns="repeat(3, 1fr)" gap={14}>
				{[['Kimya', 'Chemistry', 3, 0.62, 12], ['Tarih', 'History', 4, 0.42, 10], ['Türkçe', 'Turkish', 2, 0.55, 6], ['Coğrafya', 'Geography', 2, 0.9, 4], ['Biyoloji', 'Biology', 2, 0.3, 0], ['İngilizce', 'English', 1, 0.25, 0]].map(([tr, en, decks, value, due]) => (
					<Card key={tr as string} padding={18}>
						<Stack gap={10}>
							<Stack row justify="space-between">
								<Tile module="flashcards" icon="book" size={40} />
								{due ? <Chip tone="module" module="flashcards" size="sm">{due} {t('bugün', 'today')}</Chip> : <Chip size="sm">{t('Güncel', 'Up to date')}</Chip>}
							</Stack>
							<Text role="section">{t(tr as string, en as string)}</Text>
							<Bar value={value as number} color={mod.color} track={mod.track} height={7} />
							<Text role="meta">
								{decks} {t('deste', 'decks')} · %{Math.round((value as number) * 100)} {t('öğrenildi', 'learnt')}
							</Text>
						</Stack>
					</Card>
				))}
			</Grid>
		</Panel>
	);
};

export const WebCardsBrowseScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="flashcards">
			<ModuleHead module="flashcards" tab={2} tabs={[t('Kartlar', 'Cards'), t('Bugün', 'Today'), t('Gözat', 'Browse'), t('Kaydedilenler', 'Saved')]} title={t('Gözat', 'Browse')} sub={t('YKS › Kimya › Mol kavramı', 'YKS › Chemistry › The mole')} />
			<Grid columns="280px 1fr">
				<Card padding={8}>
					{[[t('Türkçe', 'Turkish'), 12], [t('Matematik', 'Maths'), 9], [t('Fizik', 'Physics'), 7], [t('Kimya', 'Chemistry'), 8], [t('Biyoloji', 'Biology'), 6], [t('Tarih', 'History'), 10], [t('Coğrafya', 'Geography'), 5]].map(([name, count], index) => (
						<Stack key={name as string} row gap={10} style={{padding: '11px 12px', borderRadius: 12, background: index === 3 ? 'rgba(219,39,119,0.08)' : undefined}}>
							<Text role="headline" style={{flex: 1}}>
								{name as string}
							</Text>
							<Text role="meta">
								{count} {t('deste', 'decks')}
							</Text>
						</Stack>
					))}
				</Card>
				<Grid columns="repeat(3, 1fr)" gap={14}>
					{[
						['1 mol nedir?', 'What is 1 mole?', 'Tanım', 'Definition'],
						['Avogadro sayısı kaçtır?', 'Avogadro’s number?', 'Sayı', 'Number'],
						['Mol kütlesi nasıl bulunur?', 'Molar mass?', 'Formül', 'Formula'],
						['Normal koşullarda 1 mol gaz kaç L?', '1 mol gas at STP?', 'Sayı', 'Number'],
						['Mol – tanecik ilişkisi', 'Moles and particles', 'İlişki', 'Relation'],
						['Mol – kütle ilişkisi', 'Moles and mass', 'İlişki', 'Relation'],
					].map(([tr, en, kindTr, kindEn]) => (
						<Card key={tr} padding={18} style={{minHeight: 150}}>
							<Stack gap={12}>
								<Chip tone="module" module="flashcards" size="sm">
									{t(kindTr, kindEn)}
								</Chip>
								<Text role="section">{t(tr, en)}</Text>
								<Stack row gap={6}>
									<Icon name="bookmark" size={16} color={colors.subtle} />
									<Text role="meta">{t('Kaydet', 'Save')}</Text>
								</Stack>
							</Stack>
						</Card>
					))}
				</Grid>
			</Grid>
		</Panel>
	);
};

export const WebCardSessionScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('flashcards');
	return (
		<Immersive module="flashcards" title={t('Kart oturumu · Kimya · Mol', 'Card session · Chemistry · Mole')} sub="12 / 32" progress={0.37}>
			<Stack align="center" justify="center" gap={24} style={{flex: 1, background: `radial-gradient(60% 60% at 50% 40%, ${mod.wash} 0%, ${colors.card} 70%)`}}>
				<div style={{position: 'relative', width: 600, height: 330}}>
					<div style={{position: 'absolute', inset: '22px -18px -14px 18px', borderRadius: 28, background: mod.soft}} />
					<Stack align="center" justify="center" gap={14} style={{position: 'absolute', inset: 0, borderRadius: 28, background: colors.card, boxShadow: UI_SHADOW.float, textAlign: 'center', padding: 30}}>
						<Chip tone="module" module="flashcards">
							{t('Cevap', 'Answer')}
						</Chip>
						<Text role="meta">{t('1 mol nedir?', 'What is 1 mole?')}</Text>
						<Text role="display" size={34} align="center">
							6,02 × 10²³ {t('tanecik', 'particles')}
						</Text>
						<Text role="body" size={16} align="center">
							{t('Avogadro sayısı kadar atom, molekül ya da iyon içeren madde miktarı.', 'The amount containing Avogadro’s number of particles.')}
						</Text>
					</Stack>
				</div>
				<Stack row gap={12}>
					{[[t('Bilmiyorum', 'Don’t know'), '1', t('1 dk', '1 min'), colors.error], [t('Emin değilim', 'Not sure'), '2', t('6 dk', '6 min'), colors.warning], [t('Biliyorum', 'I know it'), '3', t('4 gün', '4 days'), colors.success]].map(([label, key, next, color]) => (
						<Stack key={label} align="center" justify="center" gap={3} style={{width: 170, height: 70, borderRadius: 20, background: colors.card, border: `1.5px solid ${colors.line}`}}>
							<Text role="headline" color={color}>
								{label} · {key}
							</Text>
							<Text role="meta">{next}</Text>
						</Stack>
					))}
				</Stack>
				<Text role="meta">{t('Boşluk: çevir · 1–3: puanla', 'Space: flip · 1–3: rate')}</Text>
			</Stack>
		</Immersive>
	);
};

export const WebCardsSavedScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="flashcards">
			<ModuleHead module="flashcards" tab={3} tabs={[t('Kartlar', 'Cards'), t('Bugün', 'Today'), t('Gözat', 'Browse'), t('Kaydedilenler', 'Saved')]} title={t('Kaydedilenler', 'Saved')} sub={t('Yıldızladığın 24 kart', '24 starred cards')} actions={<Button tone="module" module="flashcards" icon="play">{t('Hepsini tekrar et', 'Review all')}</Button>} />
			<List>
				{[
					['1 mol nedir?', 'What is 1 mole?', 'Kimya · Mol', 'Chemistry'],
					['Lale Devri hangi yıllar?', 'Tulip Era years?', 'Tarih · Osmanlı', 'History'],
					['Ünsüz yumuşaması nedir?', 'Consonant softening?', 'Türkçe · Ses bilgisi', 'Turkish'],
					['Muson iklimi nerede görülür?', 'Monsoon climate?', 'Coğrafya · İklim', 'Geography'],
					['Mitoz kaç evrede gerçekleşir?', 'Stages of mitosis?', 'Biyoloji · Hücre', 'Biology'],
				].map(([tr, en, deckTr, deckEn]) => (
					<ListRow key={tr} module="flashcards" icon="bookmark" title={t(tr, en)} subtitle={t(deckTr, deckEn)} />
				))}
			</List>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Akıllı Özet */

const SUMMARY_TABS = (t: (tr: string, en: string) => string) => [t('Akıllı Özet', 'Summary'), t('Yeni analiz', 'New'), t('Video', 'Video'), t('Geçmiş', 'History')];

export const WebSummaryHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('smartSummary');
	return (
		<Panel active="smartSummary">
			<ModuleHead module="smartSummary" tab={0} tabs={SUMMARY_TABS(t)} title={t('Akıllı Özet', 'Smart Summary')} sub={t('Sorunun fotoğrafından adım adım çözüm ve konu özeti · bu ay 7 / 30', 'Step-by-step solutions from a photo · 7 / 30 this month')} />
			<Grid columns="1fr 1.3fr">
				<Card padding={34} style={{border: `2px dashed ${mod.line}`, background: mod.wash, boxShadow: 'none', textAlign: 'center'}}>
					<Stack align="center" gap={14}>
						<Tile module="smartSummary" icon="upload" size={64} solid />
						<Text role="section" align="center">
							{t('Soru görselini sürükle ya da seç', 'Drop or choose a question image')}
						</Text>
						<Text role="small" align="center">
							{t('JPG, PNG, PDF · tek soru en iyi sonucu verir.', 'JPG, PNG, PDF · one question works best.')}
						</Text>
						<Stack row gap={10}>
							<Button tone="module" module="smartSummary" icon="upload">
								{t('Dosya seç', 'Choose file')}
							</Button>
							<Button tone="ghost" icon="phone">
								{t('Telefonla çek', 'Use phone')}
							</Button>
						</Stack>
					</Stack>
				</Card>
				<WCard title={t('Son analizlerin', 'Recent analyses')} action={t('Tümü', 'All')}>
					<List>
						{[
							['Türev · Zincir kuralı', 'Chain rule', 'Matematik · bugün 14:10', 'Maths · today', 'Çözüldü', 'Solved'],
							['Osmanlı duraklama dönemi', 'Ottoman stagnation', 'Tarih · dün', 'History · yesterday', 'Özet', 'Summary'],
							['Mol hesaplamaları', 'Mole calculations', 'Kimya · 12 Ekim', 'Chemistry · 12 Oct', 'Çözüldü', 'Solved'],
							['Elektrik devreleri', 'Electric circuits', 'Fizik · 8 Ekim', 'Physics · 8 Oct', 'İşleniyor', 'Processing'],
						].map(([tr, en, subTr, subEn, stateTr, stateEn]) => (
							<ListRow key={tr} module="smartSummary" icon="image" title={t(tr, en)} subtitle={t(subTr, subEn)} trailing={<Chip tone={stateTr === 'İşleniyor' ? 'warning' : 'module'} module="smartSummary" size="sm">{t(stateTr, stateEn)}</Chip>} />
						))}
					</List>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebSummaryNewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<Panel active="smartSummary">
			<ModuleHead module="smartSummary" tab={1} tabs={SUMMARY_TABS(t)} title={t('Yeni analiz', 'New analysis')} sub={t('soru-14.jpg yüklendi', 'soru-14.jpg uploaded')} />
			<Grid columns="1fr 1fr">
				<Card padding={20}>
					<div style={{height: 320, borderRadius: 16, background: '#F5F1E8', padding: 24, boxSizing: 'border-box', position: 'relative'}}>
						<Text role="section" color="#1E293B">
							14. f(x) = (3x² − 2)⁴ {t('için', 'for')} f′(1) {t('kaçtır?', '?')}
						</Text>
						<Text role="body" color="#1E293B" style={{marginTop: 14}}>
							A) 12 · B) 24 · C) 36 · D) 48 · E) 60
						</Text>
						<div style={{position: 'absolute', inset: 14, border: `3px dashed ${mod.color}`, borderRadius: 14}} />
					</div>
					<Stack row gap={8} style={{marginTop: 12}}>
						<Button tone="ghost" size="sm" icon="refresh">
							{t('Döndür', 'Rotate')}
						</Button>
						<Button tone="ghost" size="sm" icon="scan">
							{t('Kırp', 'Crop')}
						</Button>
					</Stack>
				</Card>
				<Stack gap={16}>
					<WCard title={t('Ne istiyorsun?', 'What do you need?')}>
						<Stack gap={10}>
							{([['checkCircle', t('Adım adım çözüm', 'Step-by-step solution'), true], ['note', t('Konu özeti', 'Topic summary'), true], ['quiz', t('Benzer 5 soru', '5 similar questions'), false]] as [UIIconName, string, boolean][]).map(([icon, label, on]) => (
								<Stack key={label} row gap={12} style={{padding: 14, borderRadius: 16, border: `1.5px solid ${on ? mod.color : colors.line}`, background: on ? mod.wash : colors.card}}>
									<Tile module="smartSummary" icon={icon} size={36} />
									<Text role="headline" style={{flex: 1}}>
										{label}
									</Text>
									<div style={{width: 22, height: 22, borderRadius: 7, background: on ? mod.color : 'transparent', border: on ? undefined : `2px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										{on ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
									</div>
								</Stack>
							))}
						</Stack>
					</WCard>
					<Button tone="module" module="smartSummary" size="lg" block icon="sparkles">
						{t('Analizi başlat · 1 hak', 'Start analysis · 1 credit')}
					</Button>
				</Stack>
			</Grid>
		</Panel>
	);
};

export const WebSummaryDetailScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<Panel active="smartSummary" crumb={t('Akıllı Özet ›', 'Smart Summary ›')}>
			<ModuleHead module="smartSummary" tab={3} tabs={SUMMARY_TABS(t)} title={t('Türev · Zincir kuralı', 'Chain rule')} sub={t('AYT Matematik · cevap B · bugün 14:10', 'AYT Maths · answer B · today 14:10')} actions={<><Button tone="ghost" icon="file">PDF</Button><Button tone="dark" icon="sparkles">{t('SinoAI’ye sor', 'Ask SinoAI')}</Button></>} />
			<Grid columns="1fr 1.5fr">
				<Stack gap={16}>
					<Card padding={16}>
						<div style={{height: 160, borderRadius: 14, background: '#F5F1E8', padding: 16, boxSizing: 'border-box'}}>
							<Text role="headline" color="#1E293B">
								14. f(x) = (3x² − 2)⁴ {t('için', 'for')} f′(1) {t('kaçtır?', '?')}
							</Text>
						</div>
					</Card>
					<Card tone="module" module="smartSummary" padding={18}>
						<Text role="over" color={mod.color}>
							{t('Kazanım', 'Skill')}
						</Text>
						<Text role="small" color={colors.ink2} style={{marginTop: 6}}>
							{t('İç içe fonksiyonda türev: dıştakinin türevi × içtekinin türevi.', 'Composite derivative: outer × inner.')}
						</Text>
					</Card>
					<Card padding={18} style={{border: `1.5px solid ${colors.warningSoft}`}}>
						<Text role="over" color={colors.warning}>
							{t('Sık hata', 'Common mistake')}
						</Text>
						<Text role="small" color={colors.ink2} style={{marginTop: 6}}>
							{t('İçteki fonksiyonun türevini (6x) çarpmayı unutmak.', 'Forgetting the inner derivative (6x).')}
						</Text>
					</Card>
				</Stack>
				<WCard title={t('Adım adım çözüm', 'Step by step')}>
					<Stack gap={16}>
						{[
							[t('Zincir kuralını uygula', 'Apply the chain rule'), "f′(x) = 4(3x² − 2)³ · 6x"],
							[t('İçi hesapla (x = 1)', 'Inner value (x = 1)'), '3 · 1² − 2 = 1'],
							[t('Yerine koy', 'Substitute'), "f′(1) = 4 · 1³ · 6 = 24"],
						].map(([title, formula], index) => (
							<Stack key={title} row gap={14} align="flex-start">
								<Stack align="center" justify="center" style={{width: 32, height: 32, borderRadius: 16, background: mod.color}}>
									<Text role="headline" color="#FFFFFF">
										{index + 1}
									</Text>
								</Stack>
								<Stack grow gap={6}>
									<Text role="headline">{title}</Text>
									<div style={{padding: '12px 16px', borderRadius: 14, background: colors.line2}}>
										<Text role="section" size={16}>
											{formula}
										</Text>
									</div>
								</Stack>
							</Stack>
						))}
						<Stack row gap={10}>
							<Button tone="moduleSoft" module="tests" icon="quiz">
								{t('Benzer 5 soru', '5 similar questions')}
							</Button>
							<Button tone="moduleSoft" module="flashcards" icon="cards">
								{t('Kart yap', 'Make a card')}
							</Button>
						</Stack>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebSummaryVideoScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('smartSummary');
	return (
		<Panel active="smartSummary">
			<ModuleHead module="smartSummary" tab={2} tabs={SUMMARY_TABS(t)} title={t('Video analizi', 'Video analysis')} sub={t('Hücre bölünmesi · 18 dk', 'Cell division · 18 min')} />
			<Grid columns="1.5fr 1fr">
				<div style={{height: 420, borderRadius: 24, background: 'linear-gradient(160deg, #1E1B4B, #4C1D95)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{width: 84, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="play" size={32} color={mod.color} />
					</div>
					<div style={{position: 'absolute', left: 20, right: 20, bottom: 18}}>
						<Bar value={0.3} color="#C4B5FD" track="rgba(255,255,255,0.25)" height={5} />
					</div>
				</div>
				<Stack gap={16}>
					<WCard title={t('Bölümler', 'Chapters')}>
						<List>
							{[['00:00', 'Mitoz evreleri', 'Stages of mitosis'], ['06:40', 'Mayoz ve çeşitlilik', 'Meiosis'], ['12:10', 'Sınavda nasıl sorulur', 'How it is asked']].map(([time, tr, en]) => (
								<ListRow key={time} module="smartSummary" icon="playCircle" title={t(tr, en)} subtitle={time} />
							))}
						</List>
					</WCard>
					<Button tone="module" module="smartSummary" size="lg" block icon="quiz">
						{t('Bu videodan 10 soru üret', 'Make 10 questions from it')}
					</Button>
				</Stack>
			</Grid>
		</Panel>
	);
};
