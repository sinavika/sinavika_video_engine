import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {alpha, MODULES, MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {Avatar, Bar, Button, Card, Chip, Field, List, ListRow, Segmented, LoadingLogo, Stack, Text, Tile, Toggle} from '../../Parts/Shared';
import {Grid, Panel, WCard} from '../../Parts/Web';

export const WebModulesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	// Every status has a data source (owner, 17 Nov 2026): Akıllı Özet has no monthly limit, so it has no chip; Testler shows ready quizzes (quizzes/summary readyTopicCount), as on the home tile.
	const status: Record<ModuleKey, string | undefined> = {
		exam: t('Cumartesi: TYT Deneme 5', 'Sat: SAT Practice Test 5'),
		lessons: t('3 ders sürüyor', '3 in progress'),
		tests: t('1 test hazır', '1 quiz ready'),
		studyPlan: t('Bugün 1/3', 'Today 1/3'),
		smartSummary: undefined,
		flashcards: t('32 kart bugün', '32 due today'),
		sinoAi: t('Hedefini bilir', 'Knows your goal'),
	};
	return (
		<Panel active="modules">
			<Stack gap={2}>
				<Text role="title" size={30}>
					{t('Tüm modüller', 'All modules')}
				</Text>
				<Text role="small" size={14}>
					{t('Her modülün kendi rengi var: simgede, menüde ve sekmede aynı renk. Ana sayfadaki kutucuklarla aynı düzen.', 'Each module keeps its colour on its icon, menu and tabs.')}
				</Text>
			</Stack>
			<Grid columns="repeat(4, 1fr)">
				{MODULE_ORDER.map((key) => (
					<Stack key={key} gap={10} style={{gridColumn: key === 'sinoAi' ? 'span 2' : undefined, padding: 18, borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`}}>
						<Stack row justify="space-between" align="flex-start">
							<Tile module={key} size={48} />
							<Icon name="right" size={18} color={colors.subtle} />
						</Stack>
						<Stack gap={2}>
							<Text role="section">{t(MODULES[key].name)}</Text>
							<Text role="small">{t(MODULES[key].tagline)}</Text>
						</Stack>
						{status[key] ? (
							<Chip tone="module" module={key} size="sm" style={{alignSelf: 'flex-start'}}>
								{status[key]}
							</Chip>
						) : null}
					</Stack>
				))}
			</Grid>
		</Panel>
	);
};

export const WebNotificationsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows: [ModuleKey | null, string, string, string, string, string, boolean][] = [
		['exam', 'Sonucun hazır: TYT Deneme 4', 'Your result: TYT Exam 4', '78,5 net · eksik konularını analizde gör.', '78.5 · see your gaps.', '10:24', true],
		['studyPlan', 'Bugünün planı hazır', 'Today’s plan is ready', '3 görev, yaklaşık 45 dakika. İlki: Paragraf.', '3 tasks, ~45 minutes.', '08:30', true],
		['sinoAi', 'SinoAI yanıtladı', 'SinoAI replied', 'Türev sorunun adım adım çözümü hazır.', 'Your derivative answer is ready.', t('Dün', 'Yesterday'), true],
		['flashcards', '32 kart seni bekliyor', '32 cards are due', 'Bugün 8 dakika yeter, seriyi koru.', '8 minutes keeps your streak.', t('Pazartesi', 'Monday'), false],
		[null, 'Haftalık özetin hazır', 'Your weekly summary', 'Bu hafta 6 sa 20 dk çalıştın.', 'You studied 6 h 20 m this week.', t('Pazar', 'Sunday'), false],
		['smartSummary', 'Analizin hazır', 'Your analysis is ready', 'Mol hesaplamaları sorusunun çözümü hazır.', 'Mole question solved.', t('12 Kas', '12 Nov'), false],
		['exam', 'Çözümlerin hazır: KPSS Deneme 2', 'Solutions ready: KPSS Exam 2', 'Soru çözümlerin açıldı.', 'Your solutions are open.', t('8 Kas', '8 Nov'), false],
	];
	// The last two days carry no heading; then BU HAFTA and DAHA ÖNCE. The weekly summary takes a neutral chart icon.
	const groups: [string | null, typeof rows][] = [
		[null, rows.slice(0, 3)],
		[t('Bu hafta', 'This week'), rows.slice(3, 5)],
		[t('Daha önce', 'Earlier'), rows.slice(5)],
	];
	return (
		<Panel active="notifications">
			<Stack row justify="space-between" align="flex-end">
				<Text role="title" size={30}>
					{t('Bildirimler', 'Notifications')}
				</Text>
				<Stack row gap={10}>
					<div style={{width: 300}}>
						<Segmented items={[t('Tümü', 'All'), t('Okunmamış · 3', 'Unread · 3')]} />
					</div>
					<Button tone="ghost" size="sm" icon="check">
						{t('Tümünü okundu yap', 'Mark all read')}
					</Button>
				</Stack>
			</Stack>
			{groups.map(([heading, items]) => (
				<Stack key={heading ?? 'recent'} gap={8}>
					{heading ? <Text role="over">{heading}</Text> : null}
					<List>
						{items.map(([key, tr, en, subTr, subEn, time, unread]) => (
							<Stack key={tr} row gap={14} style={{padding: '16px 20px', background: unread ? alpha('#EA580C', 0.04) : undefined}}>
								{key ? (
									<Tile module={key} size={42} />
								) : (
									<div style={{width: 42, height: 42, borderRadius: 14, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
										<Icon name="chart" size={20} color={colors.ink2} />
									</div>
								)}
								<Stack grow gap={2}>
									<Text role="headline">{t(tr, en)}</Text>
									<Text role="small">{t(subTr, subEn)}</Text>
								</Stack>
								{key ? (
									<Chip tone="module" module={key} size="sm">
										{t(MODULES[key].name)}
									</Chip>
								) : null}
								<Text role="meta" style={{width: 80, textAlign: 'right'}}>
									{time}
								</Text>
								<div style={{width: 8, height: 8, borderRadius: 4, background: unread ? colors.brand : 'transparent'}} />
							</Stack>
						))}
					</List>
				</Stack>
			))}
		</Panel>
	);
};

const ProfileTabs: React.FC<{active: number}> = ({active}) => {
	const colors = useColors();
	const t = useT();
	const tabs: [UIIconName, string][] = [
		['user', t('Hesap', 'Account')],
		['target', t('Hedefim', 'Goal')],
		['card', t('Abonelik', 'Plan')],
		['bell', t('Bildirimler', 'Notifications')],
		['moon', t('Görünüm', 'Appearance')],
		['shield', t('Güvenlik', 'Security')],
	];
	return (
		<Stack row gap={6} style={{borderBottom: `1px solid ${colors.line}`}}>
			{tabs.map(([icon, label], index) => (
				<Stack key={label} row gap={8} style={{height: 44, padding: '0 14px', borderBottom: `2.5px solid ${index === active ? colors.ink : 'transparent'}`, marginBottom: -1}}>
					<Icon name={icon} size={16} color={index === active ? colors.ink : colors.muted} />
					<Text role="headline" size={14} color={index === active ? colors.ink : colors.muted}>
						{label}
					</Text>
				</Stack>
			))}
		</Stack>
	);
};

const ProfileHead: React.FC = () => {
	const t = useT();
	return (
		<Stack row gap={16}>
			<Avatar size={64} />
			<Stack grow gap={2}>
				<Text role="title" size={26}>
					Ayşe Yılmaz
				</Text>
				<Text role="small" size={14}>
					{t('ayse@ornek.com · YKS Sayısal', 'ayse@ornek.com · YKS Science')}
				</Text>
			</Stack>
			<Button tone="ghost" icon="edit">
				{t('Profili düzenle', 'Edit profile')}
			</Button>
		</Stack>
	);
};

export const WebProfileScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="profile">
			<ProfileHead />
			<ProfileTabs active={0} />
			<Grid columns="1fr 1fr">
				<WCard title={t('Hesap bilgileri', 'Account details')}>
					<Stack gap={14}>
						<Grid columns="1fr 1fr" gap={12}>
							<Field label={t('Ad', 'First name')} value="Ayşe" />
							<Field label={t('Soyad', 'Last name')} value="Yılmaz" />
						</Grid>
						<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" hint={t('Doğrulandı', 'Verified')} />
						<Field label={t('Telefon', 'Phone')} value="+90 5•• ••• •• 21" icon="phone" />
						<Field label={t('Dil', 'Language')} value="Türkçe" icon="language" />
					</Stack>
				</WCard>
				<Stack gap={18}>
					<WCard title={t('Hedefim', 'My goal')} action={t('Değiştir', 'Change')}>
						<List>
							<ListRow icon="grad" plainIcon title={t('Sınav', 'Exam')} subtitle="YKS · TYT + AYT" chevron={false} />
							<ListRow icon="layers" plainIcon title={t('Puan türü', 'Score type')} subtitle={t('Sayısal', 'Science')} chevron={false} />
						</List>
					</WCard>
					<WCard>
						<Stack row gap={12}>
							<Tile icon="trash" size={40} color="var(--ui-error)" style={{background: 'var(--ui-errorSoft)'}} />
							<Stack grow gap={2}>
								<Text role="headline">{t('Hesabımı kapat', 'Close my account')}</Text>
								<Text role="small">{t('Silinecekleri önce gösteririz.', 'We show what will be deleted first.')}</Text>
							</Stack>
							<Button tone="ghost" size="sm">
								{t('İncele', 'Review')}
							</Button>
						</Stack>
					</WCard>
				</Stack>
			</Grid>
		</Panel>
	);
};

export const WebSubscriptionScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="profile">
			<ProfileHead />
			<ProfileTabs active={2} />
			<Grid columns="1.1fr 1fr">
				<Stack gap={18}>
					<div style={{borderRadius: 26, padding: 24, background: 'linear-gradient(135deg, #EA580C, #F97316)'}}>
						<Text role="over" color="rgba(255,255,255,0.85)">
							{t('Aktif paket', 'Active plan')}
						</Text>
						<Text role="title" size={30} color="#FFFFFF">
							{t('YKS Aylık', 'YKS Monthly')}
						</Text>
						<Text role="small" color="rgba(255,255,255,0.9)">
							{t('12 Kasım’da ₺299 ile yenilenir · kartla ödeme', 'Renews 12 Nov for ₺299 · card')}
						</Text>
						<Stack row gap={10} style={{marginTop: 14}}>
							<Button tone="white" size="sm">
								{t('Paketi değiştir', 'Change plan')}
							</Button>
							<Button tone="glass" size="sm">
								{t('Faturalar', 'Invoices')}
							</Button>
						</Stack>
					</div>
					{/* "Erişimin": what is open and until when; the AI quota is one shared percentage (owner, 17 Nov 2026). */}
					<WCard title={t('Erişimin', 'Your access')}>
						<Stack gap={14}>
							<Stack row gap={10}>
								<Icon name="checkCircle" size={18} color={colors.success} />
								<Text role="small" color={colors.ink}>
									{t('Bütün modüller açık · 12 Kasım’a kadar', 'Every module open · until 12 Nov')}
								</Text>
							</Stack>
							<Stack gap={6}>
								<Stack row justify="space-between">
									<Text role="small" weight={700} color={colors.ink}>
										{t('Yapay zekâ kullanımı', 'AI usage')}
									</Text>
									<Text role="small">{t('%40', '40%')}</Text>
								</Stack>
								<Bar value={0.4} color={colors.ink2} />
								<Text role="meta">{t('Akıllı Özet ve SinoAI ortak · 1 Aralık’ta yenilenir', 'Smart Summary and SinoAI share it · renews 1 December')}</Text>
							</Stack>
						</Stack>
					</WCard>
				</Stack>
				<WCard title={t('Faturalar', 'Invoices')}>
					<List>
						{[
							['12 Ekim 2026', '₺299'],
							['12 Eylül 2026', '₺299'],
							['12 Ağustos 2026', '₺299'],
						].map(([date, price]) => (
							<ListRow key={date} icon="file" plainIcon title={date} subtitle={t('YKS Aylık · ödendi', 'YKS Monthly · paid')} trailing={<Text role="headline">{price}</Text>} />
						))}
					</List>
					<Text role="small" style={{marginTop: 14}}>
						{t('Aboneliği iptal etmek mi istiyorsun? Dönem sonuna kadar her şey açık kalır.', 'Want to cancel? Everything stays open until the end of the period.')}
					</Text>
					<Button tone="ghost" size="sm" style={{marginTop: 10}}>
						{t('Aboneliği iptal et', 'Cancel subscription')}
					</Button>
				</WCard>
			</Grid>
			{/* Package choice at the bottom of the page; "Paketi değiştir" scrolls here (owner, 18 Nov 2026). */}
			<div data-ui="scroll">
				<WCard title={t('Paketini seç', 'Choose your plan')}>
					<Grid columns="repeat(3, minmax(0, 1fr))" gap={14}>
						{(
							[
								[t('YKS Aylık', 'YKS Monthly'), '₺299', t('/ay', '/mo'), true],
								[t('YKS Yıllık', 'YKS Yearly'), '₺2.990', t('/yıl · 2 ay hediye', '/yr · 2 months free'), false],
								[t('KPSS Yıllık', 'KPSS Yearly'), '₺2.750', t('/yıl', '/yr'), false],
							] as [string, string, string, boolean][]
						).map(([name, price, sub, current]) => (
							<Stack key={name} gap={8} style={{padding: 18, borderRadius: 18, border: `${current ? 2 : 1.5}px solid ${current ? colors.ink : colors.line}`}}>
								<Stack row justify="space-between">
									<Text role="headline">{name}</Text>
									{current ? (
										<Chip size="sm" tone="outline">
											{t('Şu anki', 'Current')}
										</Chip>
									) : null}
								</Stack>
								<Text role="title" size={24}>
									{price}
									<Text role="small"> {sub}</Text>
								</Text>
								{current ? null : (
									<Button size="sm" style={{alignSelf: 'flex-start'}}>
										{t('Bu pakete geç', 'Switch to this plan')}
									</Button>
								)}
							</Stack>
						))}
					</Grid>
				</WCard>
			</div>
		</Panel>
	);
};

export const WebSettingsScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="profile">
			<ProfileHead />
			<ProfileTabs active={3} />
			<Grid columns="minmax(0, 1fr) minmax(0, 1fr)">
				{(
					[
						[
							t('Çalışma', 'Study'),
							[
								[t('Günlük plan hatırlatması', 'Daily plan reminder'), t('Her gün 08:30', 'Every day 08:30'), true],
								[t('Seri hatırlatması', 'Streak reminder'), t('Akşam, çalışmadıysan', 'Evening, if not studied'), true],
							],
						],
						[
							t('Denemeler', 'Exams'),
							[
								[t('Sonuç ve çözümler', 'Results and solutions'), t('Açıklanınca', 'When ready'), true],
								[t('Yaklaşan deneme', 'Upcoming exam'), t('1 gün ve 1 saat önce', '1 day and 1 hour before'), true],
							],
						],
						[
							t('Pazarlama', 'Marketing'),
							[
								[t('E-posta ile kampanyalar', 'Offers by e-mail'), t('Ayda en fazla 2', 'At most 2 a month'), false],
								[t('SMS', 'SMS'), t('Yalnız önemli duyurular', 'Important news only'), false],
							],
						],
					] as [string, [string, string, boolean][]][]
				).map(([group, rows]) => (
					<WCard key={group} title={group}>
						<List>
							{rows.map(([title, sub, on]) => (
								<ListRow key={title} title={title} subtitle={sub} trailing={<Toggle on={on} />} chevron={false} />
							))}
						</List>
					</WCard>
				))}
			</Grid>
		</Panel>
	);
};

/** Görünüm is its own tab: theme only (owner, 17 Nov 2026). */
export const WebAppearanceScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="profile">
			<ProfileHead />
			<ProfileTabs active={4} />
			<WCard title={t('Tema', 'Theme')} style={{maxWidth: 760}}>
				<Grid columns="1fr 1fr 1fr" gap={12}>
					{[
						[t('Açık', 'Light'), '#F7F7F8', false],
						[t('Koyu', 'Dark'), '#0F1115', false],
						[t('Sistem', 'System'), 'linear-gradient(90deg, #F7F7F8 50%, #0F1115 50%)', true],
					].map(([label, bg, on]) => (
						<Stack key={label as string} gap={8} align="center">
							<div style={{width: '100%', height: 130, borderRadius: 16, background: bg as string, border: `2px solid ${on ? 'var(--ui-ink)' : 'var(--ui-line)'}`}} />
							<Text role="headline" size={14}>
								{label as string}
							</Text>
						</Stack>
					))}
				</Grid>
			</WCard>
		</Panel>
	);
};

export const WebSupportScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="support">
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="title" size={30}>
						{t('Destek', 'Support')}
					</Text>
					<Text role="small" size={14}>
						{t('Talebini aç; yanıt buraya ve e-postana gelir.', 'Open a request; the reply comes here and to your e-mail.')}
					</Text>
				</Stack>
				<Button icon="plus">{t('Yeni talep', 'New request')}</Button>
			</Stack>
			<Grid columns="1.4fr 1fr">
				<List>
					{[
						['Ödeme iki kez çekildi', 'Charged twice', 'Abonelik ve ödeme', 'Subscription and payment', 'Bugün 11:20', 'Today 11:20', 'success', 'Yanıtlandı', 'Answered'],
						['Deneme sonucu görünmüyor', 'Result not showing', 'Deneme ve sonuçlar', 'Exams and results', 'Dün', 'Yesterday', 'warning', 'İnceleniyor', 'In review'],
						['Şifre sıfırlama kodu', 'Password reset code', 'Hesap ve giriş', 'Account and sign-in', '3 Ekim', '3 Oct', 'neutral', 'Kapandı', 'Closed'],
					].map(([tr, en, catTr, catEn, dateTr, dateEn, tone, stateTr, stateEn]) => (
						<ListRow
							key={tr}
							icon="chat"
							plainIcon
							title={t(tr, en)}
							subtitle={`${t(catTr, catEn)} · ${t(dateTr, dateEn)}`}
							trailing={
								<Chip tone={tone as 'success'} size="sm">
									{t(stateTr, stateEn)}
								</Chip>
							}
						/>
					))}
				</List>
				<Stack gap={18}>
					<WCard title={t('Sık sorulanlar', 'FAQ')}>
						<Stack gap={10}>
							{[t('Deneme sonucum ne zaman açıklanır?', 'When are results out?'), t('Aboneliğimi nasıl iptal ederim?', 'How do I cancel?'), t('Akıllı Özet hakkım ne zaman yenilenir?', 'When does my quota reset?')].map((q) => (
								<Stack key={q} row justify="space-between">
									<Text role="headline" size={14}>
										{q}
									</Text>
									<Icon name="down" size={16} color="#94A3B8" />
								</Stack>
							))}
						</Stack>
					</WCard>
					<div style={{borderRadius: 22, padding: 18, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 12}}>
						<Tile module="sinoAi" size={40} />
						<Stack grow gap={2}>
							<Text role="headline">{t('Ders sorusu mu?', 'A study question?')}</Text>
							<Text role="small">{t('SinoAI çok daha hızlı yanıtlar.', 'SinoAI is much faster.')}</Text>
						</Stack>
						<Button size="sm" tone="dark">
							SinoAI
						</Button>
					</div>
				</Stack>
			</Grid>
		</Panel>
	);
};

/** Yeni talep on web: an in-page form (topic chips, title, details, screenshots, Gönder / Vazgeç); no modal, no e-mail field for a signed-in student. */
export const WebSupportNewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="support" crumb={t('Destek ›', 'Support ›')}>
			<Stack gap={2}>
				<Text role="title" size={30}>
					{t('Yeni talep', 'New request')}
				</Text>
				<Text role="small" size={14}>
					{t('Talebini aç; yanıt buraya ve e-postana gelir.', 'Open a request; the reply comes here and to your e-mail.')}
				</Text>
			</Stack>
			<Grid columns="1.4fr 1fr">
				<Card padding={24}>
					<Stack gap={18}>
						<Stack gap={8}>
							<Text role="small" weight={700}>
								{t('Konu', 'Topic')}
							</Text>
							<Stack row wrap gap={8}>
								{[t('Hesap', 'Account'), t('Ödeme', 'Payment'), t('Deneme', 'Exam'), t('İçerik', 'Content'), t('Teknik sorun', 'Bug'), t('Diğer', 'Other')].map((label, index) => (
									<Chip key={label} tone={index === 1 ? 'brand' : 'outline'} style={{height: 36, padding: '0 14px', fontSize: 13}}>
										{label}
									</Chip>
								))}
							</Stack>
						</Stack>
						<Field label={t('Başlık', 'Title')} value={t('Ödeme iki kez çekildi', 'Charged twice')} />
						<Field label={t('Açıklama', 'Details')} value={t('12 Ekim’de kartımdan iki kez ₺299 çekildi…', 'On 12 Oct I was charged ₺299 twice…')} height={140} />
						<Stack gap={8}>
							<Text role="small" weight={700}>
								{t('Ekran görüntüsü · 1/3', 'Screenshots · 1/3')}
							</Text>
							<Stack row gap={10}>
								<div style={{position: 'relative', width: 72, height: 72, borderRadius: 14, background: colors.line2, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name="image" size={24} color={colors.muted} />
									<div style={{position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										<Icon name="x" size={13} color={colors.card} stroke={2.6} />
									</div>
								</div>
								<Button tone="ghost" icon="image" style={{height: 72}}>
									{t('Ekran görüntüsü ekle', 'Add screenshot')}
								</Button>
							</Stack>
						</Stack>
						<Stack row gap={10} justify="flex-end">
							<Button tone="ghost">{t('Vazgeç', 'Cancel')}</Button>
							<Button>{t('Gönder', 'Send')}</Button>
						</Stack>
					</Stack>
				</Card>
				<div style={{borderRadius: 22, padding: 18, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start'}}>
					<Tile module="sinoAi" size={40} />
					<Stack grow gap={2}>
						<Text role="headline">{t('Ders sorusu mu?', 'A study question?')}</Text>
						<Text role="small">{t('SinoAI çok daha hızlı yanıtlar.', 'SinoAI is much faster.')}</Text>
					</Stack>
					<Button size="sm" tone="dark">
						SinoAI
					</Button>
				</div>
			</Grid>
		</Panel>
	);
};

export const WebSupportTicketScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="support" crumb={t('Destek ›', 'Support ›')}>
			<Stack row justify="space-between">
				<Stack gap={6}>
					<Text role="title" size={26}>
						{t('Ödeme iki kez çekildi', 'Charged twice')}
					</Text>
					<Stack row gap={8}>
						<Chip tone="success">{t('Yanıtlandı', 'Answered')}</Chip>
						<Chip>{t('Ödeme · #85A0DA78', 'Payment · #85A0DA78')}</Chip>
					</Stack>
				</Stack>
				<Button tone="ghost" icon="check">
					{t('Sorun çözüldü', 'Mark resolved')}
				</Button>
			</Stack>
			<Card padding={24} style={{flex: 1}}>
				<Stack gap={18}>
					<Stack align="flex-end" gap={4}>
						<div style={{maxWidth: 560, padding: '14px 18px', borderRadius: '20px 20px 6px 20px', background: colors.action}}>
							<Text role="body" color="#FFFFFF">
								{t('12 Ekim’de kartımdan iki kez ₺299 çekildi. Ekran görüntüsü ekte.', 'I was charged ₺299 twice on 12 Oct. Screenshot attached.')}
							</Text>
						</div>
						<Text role="meta">{t('Sen · 12 Ekim 10:02', 'You · 12 Oct 10:02')}</Text>
					</Stack>
					<Stack row gap={12} align="flex-start">
						<Avatar initials="SD" size={36} />
						<Stack gap={4}>
							<div style={{maxWidth: 600, padding: '14px 18px', borderRadius: '6px 20px 20px 20px', background: colors.line2}}>
								<Text role="body">{t('Merhaba Ayşe, kontrol ettik: ikinci çekim 3 iş günü içinde kartına iade edilecek. Kusura bakma.', 'Hi Ayşe, the second charge will be refunded within 3 working days. Sorry about that.')}</Text>
							</div>
							<Text role="meta">{t('Sınavika Destek · bugün 11:20', 'Sınavika Support · today 11:20')}</Text>
						</Stack>
					</Stack>
				</Stack>
			</Card>
			<Field
				placeholder={t('Yanıt yaz…', 'Write a reply…')}
				trailing={
					<Button size="sm" icon="send">
						{t('Gönder', 'Send')}
					</Button>
				}
				height={56}
			/>
		</Panel>
	);
};

const CheckoutSummary: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<WCard title={t('Sipariş özeti', 'Order summary')}>
			<Stack gap={12}>
				<Stack row justify="space-between">
					<Text role="headline">{t('YKS Yıllık', 'YKS Yearly')}</Text>
					<Text role="headline">₺2.990</Text>
				</Stack>
				<Stack row justify="space-between">
					<Text role="small">{t('İndirim kodu: EKIM10', 'Code: EKIM10')}</Text>
					<Text role="small" color={colors.successInk}>
						−₺299
					</Text>
				</Stack>
				<div style={{height: 1, background: colors.line}} />
				<Stack row justify="space-between">
					<Text role="section">{t('Toplam', 'Total')}</Text>
					<Text role="section">₺2.691</Text>
				</Stack>
				<Text role="meta">{t('KDV dahil. 3 gün içinde koşulsuz iade.', 'VAT included. Full refund within 3 days.')}</Text>
			</Stack>
		</WCard>
	);
};

export const WebCheckoutScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="profile" crumb={t('Ödeme', 'Checkout')}>
			<Text role="title" size={30}>
				{t('Ödeme', 'Checkout')}
			</Text>
			<Grid columns="1.4fr 1fr">
				<WCard title={t('Kart bilgileri', 'Card details')}>
					<Stack gap={14}>
						<Field label={t('Kart üzerindeki ad', 'Name on card')} value="Ayşe Yılmaz" />
						<Field label={t('Kart numarası', 'Card number')} value="•••• •••• •••• 4821" icon="card" focus />
						<Grid columns="1fr 1fr" gap={12}>
							<Field label={t('Son kullanma', 'Expiry')} value="08 / 29" />
							<Field label="CVC" value="•••" />
						</Grid>
						<Stack row gap={10}>
							<div style={{width: 22, height: 22, borderRadius: 7, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="check" size={14} color="#FFFFFF" />
							</div>
							<Text role="small">{t('Mesafeli satış sözleşmesini okudum ve onaylıyorum.', 'I accept the distance sales agreement.')}</Text>
						</Stack>
						<Button size="lg" block icon="lock">
							{t('₺2.691 öde', 'Pay ₺2,691')}
						</Button>
						<Text role="meta" align="center">
							{t('Ödeme 3D Secure ile güvenle alınır; kart bilgin Sınavika’da saklanmaz.', 'Paid securely with 3D Secure; we do not store your card.')}
						</Text>
					</Stack>
				</WCard>
				<CheckoutSummary />
			</Grid>
		</Panel>
	);
};

/**
 * Payment result. Two columns on wide screens: the result on the left, what to
 * do next on the right; a lone centred block left most of 1440 px empty (UI/UX
 * review, 25 Oct 2026).
 */
const ResultPage: React.FC<{ok: boolean}> = ({ok}) => {
	const t = useT();
	const colors = useColors();
	const next: [ModuleKey, string, string][] = ok
		? [
				['studyPlan', t('Bugünkü planın hazır', 'Today’s plan is ready'), t('3 görev · 70 dk', '3 tasks · 70 min')],
				['exam', t('İlk Türkiye geneli denemen', 'Your first nationwide exam'), t('Cumartesi 10:00 · TYT', 'Saturday 10:00 · TYT')],
				['sinoAi', t('SinoAI ile soru çöz', 'Solve a question with SinoAI'), t('Fotoğrafını çek, adım adım anlatsın', 'Snap it, get it step by step')],
			]
		: [];
	return (
		<Panel active="profile">
			<Grid columns={ok ? '1.15fr 1fr' : '1fr'} gap={28} style={{flex: 1, alignItems: 'center'}}>
				<Stack align={ok ? 'flex-start' : 'center'} gap={16} style={{textAlign: ok ? 'left' : 'center', padding: ok ? '0 0 0 24px' : undefined}}>
					<div style={{width: 96, height: 96, borderRadius: 32, background: ok ? colors.success : colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 40px -18px ${ok ? 'rgba(5,150,105,0.6)' : 'rgba(220,38,38,0.6)'}`}}>
						<Icon name={ok ? 'check' : 'x'} size={48} color="#FFFFFF" stroke={2.6} />
					</div>
					<Text role="display" size={36} align={ok ? 'left' : 'center'}>
						{ok ? t('Ödemen alındı, hoş geldin', 'Payment received, welcome aboard') : t('Ödeme tamamlanamadı', 'Payment did not go through')}
					</Text>
					<Text role="body" size={17} align={ok ? 'left' : 'center'} style={{maxWidth: 560}}>
						{ok ? t('YKS Yıllık paketin aktif. Faturan e-postana gönderildi. Tüm modüller açık.', 'YKS Yearly is active. Invoice sent. Every module is open.') : t('Bankan işlemi onaylamadı. Kartından para çekilmedi. Başka bir kartla tekrar deneyebilirsin.', 'Your bank declined it. You were not charged. Try another card.')}
					</Text>
					<Stack row gap={10}>
						{ok ? (
							<>
								<Button size="lg">{t('Planıma git', 'Go to my plan')}</Button>
								<Button tone="ghost" size="lg">
									{t('Faturayı gör', 'View invoice')}
								</Button>
							</>
						) : (
							<>
								<Button size="lg" icon="refresh">
									{t('Tekrar dene', 'Try again')}
								</Button>
								<Button tone="ghost" size="lg" icon="headset">
									{t('Destek', 'Support')}
								</Button>
							</>
						)}
					</Stack>
				</Stack>
				{ok ? (
					<WCard title={t('Sırada ne var?', 'What’s next?')}>
						<Stack gap={12}>
							{next.map(([key, title, sub]) => (
								<Stack key={key} row gap={14} style={{padding: '12px 14px', borderRadius: 16, border: `1px solid ${colors.line}`}}>
									<Tile module={key} size={44} />
									<Stack grow gap={2}>
										<Text role="headline">{title}</Text>
										<Text role="small">{sub}</Text>
									</Stack>
									<Icon name="right" size={18} color={colors.subtle} />
								</Stack>
							))}
							<Text role="small" style={{marginTop: 4}}>
								{t('Telefonda da aynı hesap: App Store ve Google Play’de Sınavika.', 'Same account on your phone: Sınavika on the App Store and Google Play.')}
							</Text>
						</Stack>
					</WCard>
				) : null}
			</Grid>
		</Panel>
	);
};

export const WebPaySuccessScreen: React.FC = () => <ResultPage ok />;
export const WebPayFailScreen: React.FC = () => <ResultPage ok={false} />;

export const WebStatesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="exam">
			<Text role="title" size={28}>
				{t('Boş, yükleniyor ve hata durumları', 'Empty, loading and error states')}
			</Text>
			<Grid columns="1fr 1fr 1fr">
				<Card padding={28} style={{textAlign: 'center'}}>
					<Stack align="center" gap={12}>
						<Tile module="exam" size={60} solid />
						<Text role="section" align="center">
							{t('Henüz deneme çözmedin', 'No exams yet')}
						</Text>
						<Text role="small" align="center">
							{t('İlk denemen eksiklerini bulmamızı ve planını kişiselleştirmemizi sağlar.', 'Your first exam lets us find gaps and tailor your plan.')}
						</Text>
						<Button>{t('İlk denemeni seç', 'Pick your first exam')}</Button>
					</Stack>
				</Card>
				{/* First load of a page of cards: one logo in the middle of the page (not inside a card); then every card is drawn in its final place at once. */}
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}}>
					<LoadingLogo label={t('Sayfa yükleniyor', 'Loading the page')} />
				</div>
				<Card padding={28} style={{textAlign: 'center'}}>
					<Stack align="center" gap={12}>
						<Tile icon="alert" size={60} color={colors.error} style={{background: colors.errorSoft}} />
						<Text role="section" align="center">
							{t('Bu sayfa şu an açılamadı', 'This page could not open')}
						</Text>
						<Text role="small" align="center">
							{t('Bu bizden kaynaklı, cevapların güvende. Birkaç dakika sonra tekrar dene.', 'This is on us; your answers are safe. Try again shortly.')}
						</Text>
						<Button tone="soft" icon="refresh">
							{t('Tekrar dene', 'Try again')}
						</Button>
					</Stack>
				</Card>
			</Grid>
			<Grid columns="1fr 1fr">
				<Card padding={24}>
					<Stack gap={14}>
						<Text role="section">{t('Form hatası ve gönderiliyor', 'Form error and sending')}</Text>
						<Field label={t('E-posta', 'E-mail')} value="ayse@ornekcom" icon="mail" error={t('E-posta adresinde nokta eksik gibi: ayse@ornek.com', 'The e-mail seems to miss a dot: ayse@ornek.com')} />
						<Stack row gap={12}>
							<Button loading>{t('Gönderiliyor…', 'Sending…')}</Button>
							<Text role="small">{t('İstek sürerken düğme kilitli; işlem iki kez gitmez.', 'Locked while sending, so nothing goes twice.')}</Text>
						</Stack>
					</Stack>
				</Card>
				<Card padding={24}>
					<Stack gap={14}>
						<Text role="section">{t('Klavye odağı', 'Keyboard focus')}</Text>
						<Text role="small">{t('Sekme tuşuyla gelinen her öğede 2 px koyu halka; fareyle tıklayınca görünmez.', 'A 2 px dark ring on every control reached with Tab; hidden on mouse clicks.')}</Text>
						<Stack row gap={12}>
							<Button focus>{t('Kaydet', 'Save')}</Button>
							<Button tone="ghost">{t('Vazgeç', 'Cancel')}</Button>
						</Stack>
						<Field label={t('Ad', 'Name')} value="Ayşe" focus />
					</Stack>
				</Card>
			</Grid>
			<Card padding={18} tone="soft">
				<Stack row gap={12}>
					<Icon name="wifi" size={20} color={colors.warning} />
					<Text role="small" color={colors.ink2}>
						<b>{t('Çevrimdışı:', 'Offline:')}</b> {t('üstte ince sarı şerit; önbellekteki içerik açık kalır.', 'a thin yellow strip on top; cached content stays open.')}
					</Text>
				</Stack>
			</Card>
		</Panel>
	);
};

/** The home moved to StudyWeb (shared Bugün parts); this name stays for the promo templates. */
export {WebHomeScreen} from './StudyWeb';
