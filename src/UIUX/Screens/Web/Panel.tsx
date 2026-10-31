import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {alpha, MODULES, MODULE_ORDER, moduleGradient, type ModuleKey} from '../../ModuleIdentity';
import {Avatar, Bar, Button, Card, Chip, Field, List, ListRow, Ring, Segmented, Skeleton, Sparkline, Stack, Text, Tile, Toggle} from '../../Parts/Shared';
import {Grid, ModuleBanner, Panel, WCard} from '../../Parts/Web';
import {PlanTask} from '../Mobile/Plan';

/** Web panel: home, all modules, notifications, profile, plan, support, payment, tour and states. */

const HomeBody: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<>
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="small" size={14}>
						{t('Perşembe, 15 Ekim · Günaydın Ayşe', 'Thursday, 15 Oct · Good morning, Ayşe')}
					</Text>
					<Text role="title" size={30}>
						{t('Bugün ne çalışalım?', 'What shall we study today?')}
					</Text>
				</Stack>
				<Stack row gap={8}>
					{(['lessons', 'exam', 'sinoAi', 'studyPlan'] as ModuleKey[]).map((key) => (
						<Chip key={key} tone="module" module={key} icon={MODULES[key].icon} style={{height: 34, fontSize: 13}}>
							{t(MODULES[key].name)}
						</Chip>
					))}
				</Stack>
			</Stack>
			<Grid columns="1.6fr 1fr">
				<Stack gap={18}>
					<div id="w-hero">
						<ModuleBanner module="lessons" over={t('Bugünün adımı · 1/3', 'Today’s step · 1/3')} title={t('Paragraf: ana fikir', 'Reading: the main idea')} text={t('Geçen denemede bu konuda 3 net kaybettin. 4 mikro ders, yaklaşık 12 dakika.', 'You lost 3 points here last exam. 4 micro-lessons, about 12 minutes.')} action={t('Başla', 'Start')} height={190} />
					</div>
					<WCard title={t('Bugünün planı', 'Today’s plan')} action={t('Ders Planı’na git', 'Open study plan')}>
						<Stack gap={8}>
							<PlanTask module="lessons" title={t('Sözcükte Anlam', 'Word meaning')} meta={t('Dersler · 3 mikro ders · 8 dk', 'Lessons · 3 micro-lessons · 8 min')} done />
							<PlanTask module="tests" title={t('Problemler · Orta', 'Problems · Medium')} meta={t('20 soru · 25 dk', '20 questions · 25 min')} now />
							<PlanTask module="flashcards" title={t('Kimya kartları', 'Chemistry cards')} meta={t('20 kart · 10 dk', '20 cards · 10 min')} />
						</Stack>
					</WCard>
				</Stack>
				<Stack gap={18}>
					<Card padding={18}>
						<Stack row gap={16}>
							<Ring value={0.5} size={82} stroke={8} color={MODULES.studyPlan.color.light}>
								<Text role="headline">45 dk</Text>
							</Ring>
							<Stack gap={3} grow>
								<Text role="section">{t('Bugünkü hedef 90 dk', 'Goal today: 90 min')}</Text>
								<Text role="small">{t('1/3 görev tamam · seri 5 gün', '1/3 done · 5-day streak')}</Text>
							</Stack>
						</Stack>
					</Card>
					<WCard title={t('Son denemen', 'Last exam')} action={t('Sonuçlar', 'Results')}>
						<Stack row justify="space-between" align="flex-end">
							<Stack gap={3}>
								<Text role="meta">{t('TYT Deneme 4 · 12 Ekim', 'TYT Exam 4 · 12 Oct')}</Text>
								<Text role="num" size={32}>
									78,5
								</Text>
								<Chip tone="success" icon="trend">
									+6,5 net
								</Chip>
							</Stack>
							<Sparkline points={[0.2, 0.32, 0.28, 0.5, 0.62, 0.8]} width={170} height={74} color={MODULES.exam.color.light} />
						</Stack>
					</WCard>
					<div style={{borderRadius: 22, padding: 18, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', gap: 12}}>
						<Tile module="sinoAi" size={44} />
						<Stack grow gap={2}>
							<Text role="headline">
								{t('Takıldığın yer mi var?', 'Stuck somewhere?')}
							</Text>
							<Text role="small">
								{t('SinoAI hedefini bilerek anlatır.', 'SinoAI explains with your goal in mind.')}
							</Text>
						</Stack>
						<Button size="sm" tone="dark">{t('Sor', 'Ask')}</Button>
					</div>
				</Stack>
			</Grid>
			<Grid columns="repeat(6, 1fr)" gap={12}>
				{MODULE_ORDER.filter((key) => key !== 'sinoAi').map((key) => (
					<Card key={key} padding={14} style={{background: `linear-gradient(180deg, ${colors.card} 40%, ${alpha(MODULES[key].color.light, 0.1)})`}}>
						<Stack gap={10}>
							<Tile module={key} size={38} />
							<Text role="headline" size={14}>
								{t(MODULES[key].name)}
							</Text>
						</Stack>
					</Card>
				))}
			</Grid>
		</>
	);
};

export const WebHomeScreen: React.FC = () => (
	<Panel active="home">
		<HomeBody />
	</Panel>
);

/** First visit: one tip on the day's step; the modules explain themselves where they are first opened. */
export const WebTourScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel
			active="home"
			overlay={
				<div style={{position: 'absolute', inset: 0, zIndex: 30}}>
					<div style={{position: 'absolute', left: 280, top: 162, width: 690, height: 206, borderRadius: 28, boxShadow: '0 0 0 4px rgba(255,255,255,0.95), 0 0 0 3000px rgba(11,28,48,0.6)'}} />
					<div style={{position: 'absolute', left: 300, top: 392, width: 440, borderRadius: 22, background: colors.card, padding: 20}}>
						<div style={{position: 'absolute', left: 60, top: -8, width: 16, height: 16, background: colors.card, transform: 'rotate(45deg)'}} />
						<Text role="over" color={colors.brandDeep}>
							{t('İpucu', 'Tip')}
						</Text>
						<Text role="section" style={{marginTop: 6}}>
							{t('Her gün buradan başla', 'Start here every day')}
						</Text>
						<Text role="body" style={{marginTop: 4}}>
							{t('Planına ve son denemene göre bugün yapman gereken tek şey burada. Modüller solda, hep aynı yerde.', 'The one thing to do today, from your plan and last exam. Modules are on the left, always in the same place.')}
						</Text>
						<Stack row justify="flex-end" style={{marginTop: 14}}>
							<Button size="sm">{t('Anladım', 'Got it')}</Button>
						</Stack>
					</div>
				</div>
			}
		>
			<HomeBody />
		</Panel>
	);
};

export const WebModulesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const status: Record<ModuleKey, string> = {
		exam: t('Cumartesi: TYT Deneme 5', 'Sat: TYT Exam 5'),
		lessons: t('3 ders sürüyor', '3 in progress'),
		tests: '35 / 100',
		studyPlan: t('Bugün 1/3', 'Today 1/3'),
		smartSummary: t('Bu ay 7 / 30', '7 / 30 this month'),
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
					{t('Her modülün kendi rengi var: kartta, menüde ve sekmede aynı renk. SinoAI sade ve renksiz.', 'Every module has its colour on its card, menu and tabs. SinoAI stays plain.')}
				</Text>
			</Stack>
			<Grid columns="repeat(4, 1fr)">
				{MODULE_ORDER.map((key) => (
					<div key={key} style={{gridColumn: key === 'sinoAi' ? 'span 2' : undefined, borderRadius: 24, overflow: 'hidden', background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', flexDirection: key === 'sinoAi' ? 'row' : 'column'}}>
						<div style={{position: 'relative', height: key === 'sinoAi' ? undefined : 120, width: key === 'sinoAi' ? 240 : undefined, background: key === 'sinoAi' ? colors.line2 : moduleGradient(key), overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							{key === 'sinoAi' ? null : <div style={{position: 'absolute', right: -30, top: -40, width: 150, height: 150, borderRadius: 75, background: 'rgba(255,255,255,0.14)'}} />}
							<div style={{width: 64, height: 64, borderRadius: 22, background: key === 'sinoAi' ? colors.card : 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name={MODULES[key].icon} size={32} color={key === 'sinoAi' ? colors.ink : '#FFFFFF'} />
							</div>
						</div>
						<Stack gap={6} style={{padding: '14px 16px 16px', flex: 1}}>
							<Text role="section">{t(MODULES[key].name)}</Text>
							<Text role="small">{t(MODULES[key].tagline)}</Text>
							<Chip tone="module" module={key} size="sm" style={{marginTop: 4}}>
								{status[key]}
							</Chip>
						</Stack>
					</div>
				))}
			</Grid>
		</Panel>
	);
};

export const WebNotificationsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows: [ModuleKey, string, string, string, string, string, boolean][] = [
		['exam', 'Sonucun hazır: TYT Deneme 4', 'Your result: TYT Exam 4', '78,5 net · eksik konularını analizde gör.', '78.5 · see your gaps.', '10:24', true],
		['studyPlan', 'Bugünün planı hazır', 'Today’s plan is ready', '3 görev, yaklaşık 45 dakika. İlki: Paragraf.', '3 tasks, ~45 minutes.', '08:00', true],
		['sinoAi', 'SinoAI yanıtladı', 'SinoAI replied', 'Türev sorunun adım adım çözümü hazır.', 'Your derivative answer is ready.', t('Dün', 'Yesterday'), true],
		['flashcards', '32 kart seni bekliyor', '32 cards are due', 'Bugün 8 dakika yeter, seriyi koru.', '8 minutes keeps your streak.', t('Pazartesi', 'Monday'), false],
		['smartSummary', 'Analizin hazır', 'Your analysis is ready', 'Mol hesaplamaları sorusunun çözümü hazır.', 'Mole question solved.', t('Pazar', 'Sunday'), false],
		['exam', 'Çözümlerin hazır: KPSS Deneme 2', 'Solutions ready: KPSS Exam 2', 'Soru çözümlerin açıldı.', 'Your solutions are open.', t('Cumartesi', 'Saturday'), false],
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
			<List>
				{rows.map(([key, tr, en, subTr, subEn, time, unread]) => (
					<Stack key={tr} row gap={14} style={{padding: '16px 20px', background: unread ? alpha('#EA580C', 0.04) : undefined}}>
						<Tile module={key} size={42} />
						<Stack grow gap={2}>
							<Text role="headline">{t(tr, en)}</Text>
							<Text role="small">{t(subTr, subEn)}</Text>
						</Stack>
						<Chip tone="module" module={key} size="sm">
							{t(MODULES[key].name)}
						</Chip>
						<Text role="meta" style={{width: 80, textAlign: 'right'}}>
							{time}
						</Text>
						<div style={{width: 8, height: 8, borderRadius: 4, background: unread ? colors.brand : 'transparent'}} />
					</Stack>
				))}
			</List>
		</Panel>
	);
};

const ProfileTabs: React.FC<{active: number}> = ({active}) => {
	const colors = useColors();
	const t = useT();
	const tabs: [UIIconName, string][] = [['user', t('Hesap', 'Account')], ['target', t('Hedefim', 'Goal')], ['card', t('Abonelik', 'Plan')], ['bell', t('Bildirimler', 'Notifications')], ['moon', t('Görünüm', 'Appearance')], ['shield', t('Güvenlik', 'Security')]];
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
					{t('ayse@ornek.com · YKS Sayısal · hedef 78 net', 'ayse@ornek.com · YKS Science · goal 78')}
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
							<ListRow icon="target" plainIcon title={t('Hedef net', 'Target score')} subtitle="78" chevron={false} />
							<ListRow icon="clock" plainIcon title={t('Tempo', 'Pace')} subtitle={t('Dengeli · günde 3 saat', 'Balanced · 3 h a day')} chevron={false} />
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
					<WCard title={t('Kullanım · Ekim', 'Usage · October')}>
						<Stack gap={14}>
							{([['smartSummary', 7, 30], ['sinoAi', 4, 20]] as [ModuleKey, number, number][]).map(([key, used, total]) => (
								<Stack key={key} gap={6}>
									<Stack row justify="space-between">
										<Text role="small" weight={700} color={colors.ink}>
											{t(MODULES[key].name)}
										</Text>
										<Text role="small">
											{used} / {total}
										</Text>
									</Stack>
									<Bar value={used / total} color={MODULES[key].color.light} />
								</Stack>
							))}
						</Stack>
					</WCard>
				</Stack>
				<WCard title={t('Faturalar', 'Invoices')}>
					<List>
						{[['12 Ekim 2026', '₺299'], ['12 Eylül 2026', '₺299'], ['12 Ağustos 2026', '₺299']].map(([date, price]) => (
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
		</Panel>
	);
};

export const WebSettingsScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="profile">
			<ProfileHead />
			<ProfileTabs active={3} />
			<Grid columns="1fr 1fr">
				<WCard title={t('Bildirimler', 'Notifications')}>
					<List>
						{[[t('Günlük plan hatırlatması', 'Daily plan reminder'), t('Her gün 08:00', 'Every day 08:00'), true], [t('Seri hatırlatması', 'Streak reminder'), t('Akşam, çalışmadıysan', 'Evening, if not studied'), true], [t('Sonuç ve çözümler', 'Results and solutions'), t('Açıklanınca', 'When ready'), true], [t('Kampanyalar', 'Offers'), t('Ayda en fazla 2', 'At most 2 a month'), false]].map(([title, sub, on]) => (
							<ListRow key={title as string} title={title as string} subtitle={sub as string} trailing={<Toggle on={on as boolean} />} chevron={false} />
						))}
					</List>
				</WCard>
				<WCard title={t('Görünüm', 'Appearance')}>
					<Grid columns="1fr 1fr 1fr" gap={12}>
						{[[t('Açık', 'Light'), '#F7F7F8', false], [t('Koyu', 'Dark'), '#0F1115', false], [t('Sistem', 'System'), 'linear-gradient(90deg, #F7F7F8 50%, #0F1115 50%)', true]].map(([label, bg, on]) => (
							<Stack key={label as string} gap={8} align="center">
								<div style={{width: '100%', height: 110, borderRadius: 16, background: bg as string, border: `2px solid ${on ? 'var(--ui-ink)' : 'var(--ui-line)'}`}} />
								<Text role="headline" size={14}>
									{label as string}
								</Text>
							</Stack>
						))}
					</Grid>
					<List style={{marginTop: 16}}>
						<ListRow title={t('Modül renkleri', 'Module colours')} subtitle={t('Her modül kendi renginde', 'Each module in its colour')} trailing={<Toggle on />} chevron={false} />
					</List>
				</WCard>
			</Grid>
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
						{t('Genelde birkaç saat içinde yanıtlıyoruz.', 'We usually reply within a few hours.')}
					</Text>
				</Stack>
				<Button icon="plus">{t('Yeni talep', 'New request')}</Button>
			</Stack>
			<Grid columns="1.4fr 1fr">
				<List>
					{[
						['Ödeme iki kez çekildi', 'Charged twice', 'Ödeme', 'Payment', 'Bugün 11:20', 'Today 11:20', 'success', 'Yanıtlandı', 'Answered'],
						['Deneme sonucu görünmüyor', 'Result not showing', 'Denemeler', 'Exams', 'Dün', 'Yesterday', 'warning', 'İnceleniyor', 'In review'],
						['Şifre sıfırlama kodu', 'Password reset code', 'Hesap', 'Account', '3 Ekim', '3 Oct', 'neutral', 'Kapandı', 'Closed'],
					].map(([tr, en, catTr, catEn, dateTr, dateEn, tone, stateTr, stateEn]) => (
						<ListRow key={tr} icon="chat" plainIcon title={t(tr, en)} subtitle={`${t(catTr, catEn)} · ${t(dateTr, dateEn)}`} trailing={<Chip tone={tone as 'success'} size="sm">{t(stateTr, stateEn)}</Chip>} />
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
							<Text role="headline">
								{t('Ders sorusu mu?', 'A study question?')}
							</Text>
							<Text role="small">
								{t('SinoAI çok daha hızlı yanıtlar.', 'SinoAI is much faster.')}
							</Text>
						</Stack>
						<Button size="sm" tone="dark">SinoAI</Button>
					</div>
				</Stack>
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
						<Chip>{t('Ödeme · #4821', 'Payment · #4821')}</Chip>
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
			<Field placeholder={t('Yanıt yaz…', 'Write a reply…')} trailing={<Button size="sm" icon="send">{t('Gönder', 'Send')}</Button>} height={56} />
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
					<Text role="small" color={colors.success}>
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
				<Card padding={24}>
					<Stack gap={16}>
						{[80, 60, 70, 50].map((width) => (
							<Stack key={width} row gap={12}>
								<Skeleton width={44} height={44} radius={14} />
								<Stack grow gap={8}>
									<Skeleton width={`${width}%`} />
									<Skeleton width={`${width - 30}%`} height={10} />
								</Stack>
							</Stack>
						))}
					</Stack>
				</Card>
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

