import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, ModuleScreen, PageTitle, Phone, SectionTitle, TabBar} from '../../Parts/Mobile';
import {Avatar, Bar, Button, Card, Chip, Field, List, ListRow, Segmented, Skeleton, Stack, Text, Tile, Toggle} from '../../Parts/Shared';

/** Profil (slot 5 of every module), plan and packages, settings, notifications, support and the empty / error states. */

/** Profile pages: neutral background, the tab bar of the module the student came from with Profil active. */
const ProfileFrame: React.FC<{title?: string; back?: boolean; children: React.ReactNode; noTabBar?: boolean; bottom?: React.ReactNode}> = ({title, back, children, noTabBar, bottom}) => (
	<Phone>
		{back ? <AppHeader left="back" title={title} right={<div style={{width: 40}} />} /> : <AppHeader />}
		{children}
		{bottom}
		{noTabBar ? null : <TabBar module="exam" active={3} />}
	</Phone>
);

const MenuRow: React.FC<{icon: UIIconName; title: string; sub?: string; right?: React.ReactNode; danger?: boolean}> = ({icon, title, sub, right, danger}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: '12px 14px'}}>
			<div style={{width: 36, height: 36, borderRadius: 12, background: danger ? colors.errorSoft : colors.brandWash, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon} size={18} color={danger ? colors.error : colors.brandDeep} />
			</div>
			<Stack grow gap={1}>
				<Text role="headline" color={danger ? colors.error : colors.ink}>
					{title}
				</Text>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			{right ?? <Icon name="right" size={18} color={colors.subtle} />}
		</Stack>
	);
};

export const ProfileScreen: React.FC = () => {
	const t = useT();
	return (
		<ProfileFrame>
			<Content gap={12}>
				<Card padding={16}>
					<Stack row gap={14}>
						<Avatar size={60} />
						<Stack grow gap={3}>
							<Text role="section">Ayşe Yılmaz</Text>
							<Text role="small">{t('YKS · Sayısal · hedef 78 net', 'YKS · Science · goal 78')}</Text>
							<Chip tone="brand" icon="star" size="sm">
								{t('YKS Aylık · 12 Kasım’a kadar', 'YKS Monthly · until 12 Nov')}
							</Chip>
						</Stack>
					</Stack>
				</Card>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8}}>
					{([['flame', '5', t('gün seri', 'day streak')], ['clock', t('42 sa', '42 h'), t('bu ay', 'this month')], ['exam', '6', t('deneme', 'exams')]] as [UIIconName, string, string][]).map(([icon, value, label]) => (
						<Card key={label} padding={12}>
							<Stack align="center" gap={3}>
								<Icon name={icon} size={18} color="#EA580C" />
								<Text role="section">{value}</Text>
								<Text role="meta">{label}</Text>
							</Stack>
						</Card>
					))}
				</div>
				<Text role="over">{t('Hesabım', 'Account')}</Text>
				<List>
					<MenuRow icon="target" title={t('Hedefim', 'My goal')} sub={t('YKS · 78 net · günde 3 saat', 'YKS · 78 · 3 h a day')} />
					<MenuRow icon="user" title={t('Kişisel bilgiler', 'Personal details')} sub={t('Ad, e-posta, telefon', 'Name, e-mail, phone')} />
					<MenuRow icon="card" title={t('Aboneliğim', 'My plan')} sub={t('YKS Aylık', 'YKS Monthly')} />
				</List>
				<Text role="over">{t('Uygulama', 'App')}</Text>
				<List>
					<MenuRow icon="moon" title={t('Görünüm', 'Appearance')} sub={t('Sistem', 'System')} />
					<MenuRow icon="language" title={t('Dil', 'Language')} sub={t('Türkçe', 'Turkish')} />
					<MenuRow icon="bell" title={t('Bildirimler', 'Notifications')} />
				</List>
			</Content>
		</ProfileFrame>
	);
};

export const ProfileMoreScreen: React.FC = () => {
	const t = useT();
	return (
		<ProfileFrame>
			<Content gap={12}>
				<Text role="over">{t('Güvenlik', 'Security')}</Text>
				<List>
					<MenuRow icon="shield" title={t('Hesap güvenliği', 'Account security')} sub={t('Şifre, oturumlar', 'Password, sessions')} />
					<MenuRow icon="mail" title={t('İletişim tercihleri', 'Communication')} sub={t('E-posta ve SMS izinleri', 'E-mail and SMS consent')} />
				</List>
				<Text role="over">{t('Yardım', 'Help')}</Text>
				<List>
					<MenuRow icon="refresh" title={t('Uygulama turu', 'App tour')} sub={t('Turu yeniden izle', 'Watch the tour again')} />
					<MenuRow icon="headset" title={t('Destek', 'Support')} sub={t('2 açık talep', '2 open requests')} />
					<MenuRow icon="star" title={t('Geri bildirimlerim', 'My feedback')} />
					<MenuRow icon="info" title={t('Hakkında', 'About')} sub={t('Sürüm 3.4.0', 'Version 3.4.0')} />
				</List>
				<List>
					<MenuRow icon="logout" title={t('Çıkış yap', 'Sign out')} />
					<MenuRow icon="trash" title={t('Hesabımı kapat', 'Close my account')} danger />
				</List>
			</Content>
		</ProfileFrame>
	);
};

export const ProfileDetailsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ProfileFrame back title={t('Kişisel bilgiler', 'Personal details')} noTabBar bottom={<BottomBar><Button size="lg" block>{t('Kaydet', 'Save')}</Button></BottomBar>}>
			<Content tabBar={false} gap={12}>
				<Stack align="center" gap={8} style={{padding: '6px 0'}}>
					<Avatar size={84} />
					<Text role="small" weight={700} color={colors.brandDeep}>
						{t('Fotoğrafı değiştir', 'Change photo')}
					</Text>
				</Stack>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					<Field label={t('Ad', 'First name')} value="Ayşe" />
					<Field label={t('Soyad', 'Last name')} value="Yılmaz" />
				</div>
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" hint={t('Doğrulandı', 'Verified')} />
				<Field label={t('Telefon', 'Phone')} value="+90 5•• ••• •• 21" icon="phone" focus />
				<Field label={t('Doğum yılı', 'Birth year')} value="2008" />
			</Content>
		</ProfileFrame>
	);
};

export const ProfileGoalScreen: React.FC = () => {
	const t = useT();
	return (
		<ProfileFrame back title={t('Hedefim', 'My goal')} noTabBar bottom={<BottomBar><Button size="lg" block>{t('Kaydet ve planı güncelle', 'Save and update plan')}</Button></BottomBar>}>
			<Content tabBar={false} gap={12}>
				<List>
					<ListRow icon="grad" plainIcon title={t('Sınav', 'Exam')} subtitle="YKS · TYT + AYT" />
					<ListRow icon="layers" plainIcon title={t('Puan türü', 'Score type')} subtitle={t('Sayısal', 'Science')} />
					<ListRow icon="target" plainIcon title={t('Hedef net', 'Target score')} subtitle="78" />
					<ListRow icon="pin" plainIcon title={t('Hedef bölüm', 'Target programme')} subtitle={t('Bilgisayar Mühendisliği · İstanbul', 'Computer Engineering · Istanbul')} />
					<ListRow icon="clock" plainIcon title={t('Tempo', 'Pace')} subtitle={t('Dengeli · 3 saat · 6 gün', 'Balanced · 3 h · 6 days')} />
				</List>
				<Card tone="soft" padding={14}>
					<Text role="small">{t('Hedefini değiştirirsen Ders Planı bir sonraki günden itibaren yeniden kurulur.', 'Changing your goal rebuilds your plan from tomorrow.')}</Text>
				</Card>
			</Content>
		</ProfileFrame>
	);
};

export const SubscriptionScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ProfileFrame back title={t('Aboneliğim', 'My plan')} noTabBar>
			<Content tabBar={false} gap={12}>
				<div style={{position: 'relative', overflow: 'hidden', borderRadius: 26, padding: 20, background: 'linear-gradient(135deg, #EA580C, #F97316)'}}>
					<Text role="over" color="rgba(255,255,255,0.85)">
						{t('Aktif paket', 'Active plan')}
					</Text>
					<Text role="hero" color="#FFFFFF">
						{t('YKS Aylık', 'YKS Monthly')}
					</Text>
					<Text role="small" color="rgba(255,255,255,0.9)">
						{t('12 Kasım’da ₺299 ile yenilenir · App Store', 'Renews 12 Nov for ₺299 · App Store')}
					</Text>
				</div>
				<SectionTitle title={t('Bu ay kullanım', 'Usage this month')} />
				<Card padding={14}>
					<Stack gap={12}>
						{([['smartSummary', 7, 30], ['sinoAi', 4, 20]] as [ModuleKey, number, number][]).map(([key, used, total]) => (
							<Stack key={key} gap={5}>
								<Stack row justify="space-between">
									<Text role="small" weight={700} color={colors.ink}>
										{t(MODULES[key].name)} {key === 'sinoAi' ? t('üretim', 'creations') : ''}
									</Text>
									<Text role="small">
										{used} / {total}
									</Text>
								</Stack>
								<Bar value={used / total} color={MODULES[key].color.light} />
							</Stack>
						))}
					</Stack>
				</Card>
				<SectionTitle title={t('Paketinde', 'Included')} />
				<Stack gap={8}>
					{[t('Tüm denemeler ve Türkiye sıralaması', 'All exams and national ranking'), t('Dersler, Testler, Bilgi Kartları', 'Lessons, quizzes, flashcards'), t('Ders Planı ve ilerleme', 'Study plan and progress'), t('Akıllı Özet · ayda 30', 'Smart Summary · 30 a month'), t('SinoAI · sınırsız sohbet', 'SinoAI · unlimited chat')].map((line) => (
						<Stack key={line} row gap={10}>
							<Icon name="checkCircle" size={18} color={colors.success} />
							<Text role="body" color={colors.ink}>
								{line}
							</Text>
						</Stack>
					))}
				</Stack>
			</Content>
			<BottomBar>
				<Button tone="soft" size="lg" block>
					{t('Paketleri karşılaştır', 'Compare plans')}
				</Button>
				<Text role="small" align="center">
					{t('İptal ve iade App Store ayarlarından yapılır.', 'Cancel and refunds are in App Store settings.')} <b style={{color: colors.ink}}>{t('Nasıl?', 'How?')}</b>
				</Text>
			</BottomBar>
		</ProfileFrame>
	);
};

export const PackagesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const plans: [string, string, string, string, boolean][] = [
		[t('YKS Yıllık', 'YKS Yearly'), '₺249', t('/ay · yıllık ₺2.990', '/mo · ₺2,990 a year'), t('2 ay hediye', '2 months free'), true],
		[t('YKS Aylık', 'YKS Monthly'), '₺299', t('/ay', '/mo'), '', false],
		[t('KPSS Yıllık', 'KPSS Yearly'), '₺229', t('/ay · yıllık ₺2.750', '/mo · ₺2,750 a year'), '', false],
	];
	return (
		<ProfileFrame back title={t('Paketler', 'Plans')} noTabBar>
			<Content tabBar={false} gap={12}>
				<Stack gap={6}>
					<Text role="hero">{t('Hedefine uygun paketi seç', 'Pick the plan for your goal')}</Text>
					<Text role="small">{t('Tüm paketlerde 3 gün ücretsiz. İstediğin an iptal.', '3 days free on every plan. Cancel any time.')}</Text>
				</Stack>
				<Segmented items={[t('Aylık', 'Monthly'), t('Yıllık · 2 ay hediye', 'Yearly · 2 months free')]} active={1} />
				{plans.map(([name, price, sub, tag, on]) => (
					<Stack key={name} row gap={12} style={{padding: 16, borderRadius: 20, background: colors.card, border: `${on ? 2 : 1.5}px solid ${on ? colors.ink : colors.line}`}}>
						<div style={{width: 22, height: 22, borderRadius: 11, border: on ? `7px solid ${colors.ink}` : `2px solid ${colors.line}`, boxSizing: 'border-box'}} />
						<Stack grow gap={2}>
							<Stack row gap={8}>
								<Text role="headline">{name}</Text>
								{tag ? <Chip tone="brand" size="sm">{tag}</Chip> : null}
							</Stack>
							<Text role="small">{sub}</Text>
						</Stack>
						<Text role="section">{price}</Text>
					</Stack>
				))}
				<Card tone="soft" padding={14}>
					<Stack gap={8}>
						{[t('Tüm modüller ve denemeler', 'Every module and exam'), t('Akıllı Özet · ayda 30', 'Smart Summary · 30 a month'), t('SinoAI · sınırsız', 'SinoAI · unlimited'), t('Reklamsız', 'No ads')].map((line) => (
							<Stack key={line} row gap={8}>
								<Icon name="check" size={16} color={colors.success} />
								<Text role="small" color={colors.ink}>
									{line}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('3 gün ücretsiz başla', 'Start 3 free days')}
				</Button>
				<Text role="meta" align="center">
					{t('Bugün ödeme yok · 2. gün hatırlatma · 3. gün ücret', 'No charge today · reminder on day 2 · charged day 3')}
				</Text>
			</BottomBar>
		</ProfileFrame>
	);
};

export const AppearanceScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ProfileFrame back title={t('Görünüm', 'Appearance')} noTabBar>
			<Content tabBar={false} gap={14}>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
					{[[t('Açık', 'Light'), '#F7F7F8', '#FFFFFF', false], [t('Koyu', 'Dark'), '#0F1115', '#17191E', false], [t('Sistem', 'System'), 'linear-gradient(90deg, #F7F7F8 50%, #0F1115 50%)', '#FFFFFF', true]].map(([label, bg, card, on]) => (
						<Stack key={label as string} gap={8} align="center">
							<div style={{width: '100%', height: 150, borderRadius: 18, background: bg as string, border: `2px solid ${on ? colors.ink : colors.line}`, padding: 10, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6}}>
								<div style={{height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #EA580C, #F59E0B)'}} />
								<div style={{height: 18, borderRadius: 6, background: card as string, opacity: 0.9}} />
								<div style={{height: 18, borderRadius: 6, background: card as string, opacity: 0.9}} />
							</div>
							<Text role="headline" size={14} color={colors.ink}>
								{label as string}
							</Text>
						</Stack>
					))}
				</div>
				<List>
					<ListRow title={t('Modül renkleri', 'Module colours')} subtitle={t('Her modül kendi renginde', 'Each module in its colour')} trailing={<Toggle on />} chevron={false} />
					<ListRow title={t('Hareketi azalt', 'Reduce motion')} subtitle={t('Geçiş animasyonlarını kısaltır', 'Shortens transitions')} trailing={<Toggle />} chevron={false} />
					<ListRow title={t('Yazı boyutu', 'Text size')} subtitle={t('Sistem ayarı', 'System setting')} />
				</List>
			</Content>
		</ProfileFrame>
	);
};

export const LanguageScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const langs: [string, string, boolean][] = [['Türkçe', 'TR', true], ['English', 'EN', false], ['Deutsch', 'DE · ' + t('yakında', 'soon'), false], ['Nederlands', 'NL · ' + t('yakında', 'soon'), false]];
	return (
		<ProfileFrame back title={t('Dil', 'Language')} noTabBar>
			<Content tabBar={false} gap={12}>
				<List>
					{langs.map(([name, code, on]) => (
						<ListRow key={name} title={name} subtitle={code} chevron={false} trailing={<div style={{width: 22, height: 22, borderRadius: 11, border: on ? `7px solid ${colors.ink}` : `2px solid ${colors.line}`, boxSizing: 'border-box'}} />} />
					))}
				</List>
				<Card tone="soft" padding={14}>
					<Text role="small">{t('Uygulama dilini değiştirmek ders ve deneme içeriklerini değiştirmez.', 'Changing the app language does not change lessons or exams.')}</Text>
				</Card>
			</Content>
		</ProfileFrame>
	);
};

export const CommunicationScreen: React.FC = () => {
	const t = useT();
	const groups: [string, [string, string, boolean][]][] = [
		[t('Çalışma', 'Study'), [[t('Günlük plan hatırlatması', 'Daily plan reminder'), t('Her gün 08:00', 'Every day 08:00'), true], [t('Seri hatırlatması', 'Streak reminder'), t('Akşam, o gün çalışmadıysan', 'Evening, if you have not studied'), true]]],
		[t('Denemeler', 'Exams'), [[t('Sonuç ve çözümler', 'Results and solutions'), t('Açıklanınca hemen', 'As soon as ready'), true], [t('Yaklaşan deneme', 'Upcoming exam'), t('1 gün ve 1 saat önce', '1 day and 1 hour before'), true]]],
		[t('Pazarlama', 'Marketing'), [[t('E-posta ile kampanyalar', 'Offers by e-mail'), t('Ayda en fazla 2', 'At most 2 a month'), false], [t('SMS', 'SMS'), t('Yalnız önemli duyurular', 'Important news only'), false]]],
	];
	return (
		<ProfileFrame back title={t('Bildirim ve iletişim', 'Notifications and contact')} noTabBar>
			<Content tabBar={false} gap={10}>
				<Text role="small">{t('Seni yalnız işine yarayan şeyler için rahatsız ederiz.', 'We only bother you for things that help.')}</Text>
				{groups.map(([group, rows]) => (
					<React.Fragment key={group}>
						<Text role="over" style={{marginTop: 4}}>
							{group}
						</Text>
						<List>
							{rows.map(([title, sub, on]) => (
								<ListRow key={title} title={title} subtitle={sub} trailing={<Toggle on={on} />} chevron={false} />
							))}
						</List>
					</React.Fragment>
				))}
			</Content>
		</ProfileFrame>
	);
};

export const SecurityScreen: React.FC = () => {
	const t = useT();
	return (
		<ProfileFrame back title={t('Hesap güvenliği', 'Account security')} noTabBar>
			<Content tabBar={false} gap={12}>
				<List>
					<ListRow icon="lock" plainIcon title={t('Şifreni belirle ya da değiştir', 'Set or change password')} subtitle={t('Son değişiklik 3 ay önce', 'Changed 3 months ago')} />
					<ListRow icon="mail" plainIcon title={t('E-posta ile kodla giriş', 'Sign in with e-mail code')} trailing={<Toggle on />} chevron={false} />
					<ListRow icon="apple" plainIcon title={t('Apple hesabı', 'Apple account')} subtitle={t('Bağlı', 'Connected')} />
					<ListRow icon="google" plainIcon title={t('Google hesabı', 'Google account')} subtitle={t('Bağla', 'Connect')} />
				</List>
				<SectionTitle title={t('Açık oturumlar', 'Active sessions')} />
				<List>
					<ListRow icon="phone" plainIcon title="iPhone 15" subtitle={t('Bu cihaz · İstanbul', 'This device · Istanbul')} chevron={false} />
					<ListRow icon="globe" plainIcon title="Chrome · Windows" subtitle={t('Dün 21:40', 'Yesterday 21:40')} trailing={<Chip tone="error" size="sm">{t('Çıkış', 'Sign out')}</Chip>} />
				</List>
			</Content>
		</ProfileFrame>
	);
};

export const CloseAccountScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ProfileFrame back title={t('Hesabımı kapat', 'Close my account')} noTabBar bottom={<BottomBar><Button tone="ghost" size="lg" block style={{color: colors.error, borderColor: colors.errorSoft}}>{t('Hesabımı kalıcı olarak kapat', 'Permanently close my account')}</Button><Button size="lg" block>{t('Vazgeç', 'Keep my account')}</Button></BottomBar>}>
			<Content tabBar={false} gap={12}>
				<Stack gap={6}>
					<Text role="hero">{t('Gitmeden önce', 'Before you go')}</Text>
					<Text role="body">{t('Hesabını kapatırsan aşağıdakiler silinir ve geri alınamaz.', 'Closing your account deletes the following for good.')}</Text>
				</Stack>
				<Card padding={6}>
					{[[t('6 deneme sonucu ve analizler', '6 exam results and analyses')], [t('Ders Planı ve 42 saatlik geçmiş', 'Study plan and 42 hours of history')], [t('3 deste, 24 kayıtlı kart', '3 decks, 24 saved cards')], [t('SinoAI sohbetleri ve kütüphane', 'SinoAI chats and library')]].map(([line], index) => (
						<Stack key={line} row gap={10} style={{padding: '11px 10px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
							<Icon name="x" size={16} color={colors.error} />
							<Text role="small" color={colors.ink2}>
								{line}
							</Text>
						</Stack>
					))}
				</Card>
				<Card tone="soft" padding={14}>
					<Text role="small">{t('Aktif aboneliğin App Store’dan ayrıca iptal edilmelidir; hesap kapatma ödemeyi durdurmaz.', 'Cancel your App Store subscription separately; closing the account does not stop billing.')}</Text>
				</Card>
			</Content>
		</ProfileFrame>
	);
};

export const NotificationsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows: [ModuleKey, string, string, string, string, string, boolean][] = [
		['exam', 'Sonucun hazır: TYT Deneme 4', 'Your result: TYT Exam 4', '78,5 net · eksik konularını gör.', '78.5 · see your gaps.', '10:24', true],
		['studyPlan', 'Bugünün planı hazır', 'Today’s plan is ready', '3 görev, yaklaşık 45 dakika.', '3 tasks, about 45 minutes.', '08:00', true],
		['sinoAi', 'SinoAI yanıtladı', 'SinoAI replied', 'Türev sorunun çözümü hazır.', 'Your derivative answer is ready.', t('Dün', 'Yday'), true],
		['flashcards', '32 kart seni bekliyor', '32 cards are due', 'Bugün 8 dakika yeter.', '8 minutes today is enough.', t('Pzt', 'Mon'), false],
		['smartSummary', 'Analizin hazır', 'Your analysis is ready', 'Mol hesaplamaları.', 'Mole calculations.', t('Paz', 'Sun'), false],
	];
	return (
		<Phone>
			<AppHeader left="back" title={t('Bildirimler', 'Notifications')} right={<Text role="small" weight={700} color={colors.brandDeep}>{t('Okundu', 'Read')}</Text>} />
			<Content tabBar={false} gap={10}>
				<Segmented items={[t('Tümü', 'All'), t('Okunmamış · 3', 'Unread · 3')]} />
				<List>
					{rows.map(([key, tr, en, subTr, subEn, time, unread]) => (
						<Stack key={tr} row gap={12} align="flex-start" style={{padding: '12px 14px', background: unread ? colors.brandWash : undefined}}>
							<Tile module={key} size={38} />
							<Stack grow gap={2}>
								<Stack row justify="space-between">
									<Text role="headline" size={14}>
										{t(tr, en)}
									</Text>
									<Text role="meta">{time}</Text>
								</Stack>
								<Text role="small">{t(subTr, subEn)}</Text>
							</Stack>
							{unread ? <div style={{width: 8, height: 8, borderRadius: 4, background: colors.brand, marginTop: 6}} /> : null}
						</Stack>
					))}
				</List>
				<Text role="over">{t('Bu hafta', 'This week')}</Text>
				<List>
					<ListRow module="exam" title={t('Çözümlerin hazır: KPSS Deneme 2', 'Solutions ready: KPSS Exam 2')} subtitle={t('Soru çözümlerin açıldı.', 'Your solutions are open.')} chevron={false} trailing={<Text role="meta">{t('Cmt', 'Sat')}</Text>} />
				</List>
			</Content>
		</Phone>
	);
};

export const SupportHubScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" title={t('Destek', 'Support')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<div style={{borderRadius: 24, padding: 18, background: 'linear-gradient(135deg, #EA580C, #F97316)'}}>
					<Text role="section" color="#FFFFFF">
						{t('Nasıl yardımcı olabiliriz?', 'How can we help?')}
					</Text>
					<Text role="small" color="rgba(255,255,255,0.9)">
						{t('Genelde birkaç saat içinde yanıtlıyoruz.', 'We usually reply within a few hours.')}
					</Text>
					<Button tone="white" size="sm" icon="plus" style={{marginTop: 12, color: '#C2410C'}}>
						{t('Yeni talep', 'New request')}
					</Button>
				</div>
				<List>
					<ListRow icon="list" plainIcon title={t('Taleplerim', 'My requests')} subtitle={t('2 açık · 1 yanıt bekliyor', '2 open · 1 awaiting you')} />
					<ListRow icon="sparkles" module="sinoAi" title={t('Ders sorusu mu?', 'A study question?')} subtitle={t('SinoAI çok daha hızlı yanıtlar', 'SinoAI answers much faster')} />
				</List>
				<SectionTitle title={t('Sık sorulanlar', 'FAQ')} />
				<List>
					{[t('Deneme sonucum ne zaman açıklanır?', 'When are results out?'), t('Aboneliğimi nasıl iptal ederim?', 'How do I cancel?'), t('Akıllı Özet hakkım ne zaman yenilenir?', 'When does my quota reset?'), t('Web ve mobilde aynı hesap', 'Same account on web and mobile')].map((q) => (
						<ListRow key={q} title={q} />
					))}
				</List>
			</Content>
		</Phone>
	);
};

export const SupportNewScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="close" title={t('Yeni talep', 'New request')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Text role="small" weight={700}>
					{t('Konu', 'Topic')}
				</Text>
				<Stack row wrap gap={8}>
					{[t('Ödeme', 'Payment'), t('Hesap', 'Account'), t('Deneme', 'Exam'), t('Teknik sorun', 'Bug'), t('Öneri', 'Idea')].map((label, index) => (
						<Chip key={label} tone={index ? 'outline' : 'brand'} style={{height: 38, padding: '0 14px', fontSize: 13}}>
							{label}
						</Chip>
					))}
				</Stack>
				<Field label={t('Başlık', 'Title')} value={t('Ödeme iki kez çekildi', 'Charged twice')} />
				<Field label={t('Açıklama', 'Details')} value={t('12 Ekim’de kartımdan iki kez ₺299 çekildi…', 'On 12 Oct I was charged ₺299 twice…')} height={120} />
				<Card tone="soft" padding={14}>
					<Stack row gap={10}>
						<Icon name="image" size={18} />
						<Text role="small">{t('Ekran görüntüsü ekle (isteğe bağlı)', 'Add a screenshot (optional)')}</Text>
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Gönder', 'Send')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

export const SupportTicketScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" title={t('Ödeme iki kez çekildi', 'Charged twice')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Stack row gap={8}>
					<Chip tone="success">{t('Yanıtlandı', 'Answered')}</Chip>
					<Chip>{t('Ödeme · #4821', 'Payment · #4821')}</Chip>
				</Stack>
				<Stack align="flex-end">
					<div style={{maxWidth: 280, padding: '12px 14px', borderRadius: '20px 20px 6px 20px', background: colors.action}}>
						<Text role="body" color="#FFFFFF">
							{t('12 Ekim’de kartımdan iki kez ₺299 çekildi.', 'I was charged ₺299 twice on 12 Oct.')}
						</Text>
					</div>
					<Text role="meta" style={{marginTop: 4}}>
						{t('Sen · 12 Ekim 10:02', 'You · 12 Oct 10:02')}
					</Text>
				</Stack>
				<Stack row gap={8} align="flex-start">
					<Avatar initials="SD" size={32} />
					<Stack gap={4} style={{flex: 1}}>
						<Card padding={14} radius={20} style={{borderTopLeftRadius: 6}}>
							<Text role="body">{t('Merhaba Ayşe, kontrol ettik: ikinci çekim 3 iş günü içinde kartına iade edilecek. Kusura bakma.', 'Hi Ayşe, we checked: the second charge will be refunded within 3 working days. Sorry about that.')}</Text>
						</Card>
						<Text role="meta">{t('Sınavika Destek · bugün 11:20', 'Sınavika Support · today 11:20')}</Text>
					</Stack>
				</Stack>
			</Content>
			<BottomBar border>
				<Field placeholder={t('Yanıt yaz…', 'Write a reply…')} trailing={<Icon name="send" size={18} color={colors.brand} />} />
			</BottomBar>
		</Phone>
	);
};

export const AboutScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" title={t('Hakkında', 'About')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={14}>
				<Stack align="center" gap={8} style={{padding: '20px 0'}}>
					<Tile size={72} solid icon="grad" />
					<Text role="section">Sınavika</Text>
					<Text role="small">{t('Sürüm 3.4.0 (412)', 'Version 3.4.0 (412)')}</Text>
				</Stack>
				<List>
					<ListRow title={t('Kullanım koşulları', 'Terms of use')} />
					<ListRow title={t('Gizlilik politikası', 'Privacy policy')} />
					<ListRow title={t('KVKK aydınlatma metni', 'Privacy notice')} />
					<ListRow title={t('Açık kaynak lisansları', 'Open-source licences')} />
				</List>
				<Text role="meta" align="center">
					© 2026 Sınavika
				</Text>
			</Content>
		</Phone>
	);
};

export const FeedbackScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" title={t('Geri bildirimlerim', 'My feedback')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Card padding={16}>
					<Text role="section">{t('Sınavika’yı nasıl buluyorsun?', 'How do you like Sınavika?')}</Text>
					<Stack row gap={8} style={{marginTop: 10}}>
						{[1, 2, 3, 4, 5].map((star) => (
							<Icon key={star} name="star" size={30} color={star <= 4 ? '#F59E0B' : colors.line} />
						))}
					</Stack>
				</Card>
				<List>
					<ListRow module="lessons" title={t('Paragraf · Ana fikir dersi', 'Reading · Main idea lesson')} subtitle={t('★★★★★ · “Çok net anlatım”', '★★★★★ · “Very clear”')} />
					<ListRow module="exam" title={t('TYT Deneme 4 · Soru 46', 'TYT Exam 4 · Q46')} subtitle={t('Hata bildirimi · inceleniyor', 'Error report · in review')} />
					<ListRow module="sinoAi" title={t('SinoAI yanıtı', 'SinoAI reply')} subtitle={t('Faydalı olarak işaretlendi', 'Marked helpful')} />
				</List>
			</Content>
		</Phone>
	);
};

/* ------------------------------------------------------------------ states */

export const EmptyStateScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="smartSummary" tab={0}>
			<Content gap={14}>
				<PageTitle module="smartSummary" title={t('Geçmiş analizler', 'Past analyses')} />
				<Stack align="center" gap={14} style={{padding: '50px 16px 0', textAlign: 'center'}}>
					<div style={{position: 'relative', width: 170, height: 140}}>
						<div style={{position: 'absolute', left: 20, top: 18, width: 130, height: 104, borderRadius: 24, background: 'rgba(124,58,237,0.12)', transform: 'rotate(-6deg)'}} />
						<div style={{position: 'absolute', left: 30, top: 10, width: 112, height: 112, borderRadius: 24, background: 'var(--ui-card)', boxShadow: '0 16px 30px -16px rgba(15,23,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Tile module="smartSummary" icon="camera" size={56} solid />
						</div>
					</div>
					<Text role="section" align="center">
						{t('Henüz analiz yok', 'No analyses yet')}
					</Text>
					<Text role="body" align="center">
						{t('İlk soruyu çek; çözüm ve konu özeti burada saklanır. Bu ay 30 hakkın var.', 'Snap your first question; the solution and notes live here. 30 this month.')}
					</Text>
					<Button tone="module" module="smartSummary" size="lg" icon="camera">
						{t('İlk fotoğrafı çek', 'Take the first photo')}
					</Button>
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

export const ErrorStateScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" tab={1}>
			<Content gap={12}>
				<Stack row gap={10} style={{padding: '10px 14px', borderRadius: 14, background: colors.warningSoft}}>
					<Icon name="wifi" size={18} color={colors.warning} />
					<Text role="small" color="#92400E">
						<b>{t('Çevrimdışısın.', 'You are offline.')}</b> {t('Kaydettiğin çözümler açık.', 'Saved solutions still open.')}
					</Text>
				</Stack>
				<PageTitle module="exam" title={t('Denemelerim', 'My exams')} />
				<Card padding={14}>
					<Stack gap={14}>
						{[80, 60, 70].map((width) => (
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
				<Card padding={20} style={{textAlign: 'center'}}>
					<Stack align="center" gap={10}>
						<Tile icon="alert" size={44} color={colors.error} style={{background: colors.errorSoft}} />
						<Text role="section" align="center">
							{t('Sonuçlar şu an yüklenemedi', 'Results could not load')}
						</Text>
						<Text role="small" align="center">
							{t('Bu bizden kaynaklı. Birkaç dakika sonra tekrar dene; cevapların güvende.', 'This is on us. Try again in a few minutes; your answers are safe.')}
						</Text>
						<Button tone="soft" icon="refresh">
							{t('Tekrar dene', 'Try again')}
						</Button>
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};
