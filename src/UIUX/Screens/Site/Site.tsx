import React from 'react';
import {UIProvider, useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {Button, Card, Chip, Field, List, ListRow, Stack, Text, Tile} from '../../Parts/Shared';
import {DeviceBrowser, DevicePhone, ExamStrip, Grid, Section, Site, SiteHeader, SiteTitle} from '../../Parts/Web';
import {ExamAnalysisScreen, ExamHomeScreen, ExamResultScreen} from '../Mobile/Exam';
import {HubScreen} from '../Mobile/Hub';
import {PlanTodayScreen} from '../Mobile/Plan';
import {SummaryResultScreen} from '../Mobile/Assist';
import {SinoChatScreen} from '../Mobile/SinoAI';
import {WebHomeScreen} from '../Web/Panel';
import {WebResultScreen} from '../Web/ExamWeb';

/**
 * The site before sign-in. The header is the site's own; mock-ups inside the
 * pages are the real drawings (mobile screens in a phone, panel in a browser),
 * so the site always shows the product as it is.
 *
 * The site is calm: white and greys from the palette, the wordmark without the
 * icon, orange only on the main action. Module colours live inside the app
 * mock-ups, not on the page itself.
 */

const StoreButtons: React.FC = () => (
	<Stack row gap={10}>
		<Button tone="dark" size="lg" icon="apple">
			App Store
		</Button>
		<Button tone="dark" size="lg" icon="googlePlay">
			Google Play
		</Button>
	</Stack>
);

const ModuleCards: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Grid columns="repeat(7, 1fr)" gap={12}>
			{MODULE_ORDER.map((key) => (
				<div key={key} style={{borderRadius: 22, padding: 16, background: colors.card, border: `1px solid ${colors.line}`}}>
					<Stack gap={10}>
						<Tile module={key} size={46} />
						<Text role="headline">{t(MODULES[key].name)}</Text>
						<Text role="small" size={12.5}>
							{t(MODULES[key].tagline)}
						</Text>
					</Stack>
				</div>
			))}
		</Grid>
	);
};

const Cta: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Section>
			<Stack row justify="space-between" style={{padding: '48px 56px', borderRadius: 32, background: colors.bg, border: `1px solid ${colors.line}`}}>
				<Stack gap={8}>
					<Text role="display" size={38}>
						{t('Planın 2 dakikada hazır', 'Your plan in 2 minutes')}
					</Text>
					<Text role="body" size={17}>
						{t('3 gün ücretsiz dene. İstediğin an iptal et.', 'Try 3 days free. Cancel any time.')}
					</Text>
				</Stack>
				<Stack row gap={10}>
					<Button size="lg">
						{t('Ücretsiz başla', 'Start free')}
					</Button>
					<StoreButtons />
				</Stack>
			</Stack>
		</Section>
	);
};

export const SiteHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site>
			<Section padding="70px 112px 56px">
				<Stack row gap={40}>
					<Stack gap={22} style={{width: 560}}>
						<Text role="over" color={colors.ink2}>
							Sınavika
						</Text>
						<Text role="display" size={58} style={{lineHeight: '62px', letterSpacing: '-0.035em'}}>
							{t('Ne çalışacağını bil,', 'Know what to study,')}
							<br />
							<span style={{color: colors.muted}}>{t('her gün ilerle.', 'move forward daily.')}</span>
						</Text>
						<Text role="body" size={18} style={{lineHeight: '28px'}}>
							{t('Deneme, ders, test, plan ve SinoAI tek platformda. Netini ölç, eksiğini gör, planınla kapat.', 'Exams, lessons, quizzes, a plan and SinoAI in one place.')}
						</Text>
						<Stack row gap={10}>
							<Button size="lg" iconRight="right">
								{t('Ücretsiz başla', 'Start free')}
							</Button>
							<Button tone="ghost" size="lg">
								{t('Paketleri incele', 'See plans')}
							</Button>
						</Stack>
						<StoreButtons />
					</Stack>
					<div style={{position: 'relative', flex: 1, height: 520}}>
						<div style={{position: 'absolute', left: 0, top: 30}}>
							<DeviceBrowser width={600} title={t('Sınavika · Ana sayfa', 'Sınavika · Home')}>
								<WebHomeScreen />
							</DeviceBrowser>
						</div>
						<div style={{position: 'absolute', right: -10, top: 80}}>
							<DevicePhone width={220} rotate={4}>
								<HubScreen />
							</DevicePhone>
						</div>
					</div>
				</Stack>
			</Section>
			<ExamStrip />
			<Section>
				<SiteTitle center over={t('Yedi modül, tek düzen', 'Seven modules, one layout')} title={t('Sınava hazırlığın tek uygulamada', 'Your exam prep in one app')} lead={t('Uygulamada ve panelde her modül aynı yerde. Bir kere öğren, her yerde kullan.', 'Every module sits in the same place in the app and on the web.')} />
				<div style={{marginTop: 36}}>
					<ModuleCards />
				</div>
			</Section>
			<Section bg={colors.bg}>
				<SiteTitle center over={t('Nasıl çalışır', 'How it works')} title={t('Deneme çöz, eksiğini gör, planla kapat', 'Take an exam, see the gaps, close them')} />
				<Grid columns="repeat(3, 1fr)" gap={24} style={{marginTop: 40}}>
					{([['exam', '1', t('Deneme çöz', 'Take an exam'), t('Türkiye geneli denemeye katıl; netini ve sıralamanı gör.', 'Join a nationwide exam; see your score and rank.'), <ExamResultScreen key="a" />], ['tests', '2', t('Eksiğini gör', 'See your gaps'), t('Hangi konuda kaç net kaybettiğini tek ekranda gör.', 'See exactly where you lost points.'), <ExamAnalysisScreen key="b" />], ['studyPlan', '3', t('Planla kapat', 'Close them with a plan'), t('Eksik konular günlük planına ders ve testle eklenir.', 'Gaps become lessons and quizzes in your daily plan.'), <PlanTodayScreen key="c" />]] as [ModuleKey, string, string, string, React.ReactNode][]).map(([, step, title, text, screen]) => (
						<div key={step} style={{borderRadius: 28, background: colors.card, border: `1px solid ${colors.line}`, overflow: 'hidden'}}>
							<div style={{height: 300, background: colors.line2, display: 'flex', justifyContent: 'center', paddingTop: 30, overflow: 'hidden'}}>
								<DevicePhone width={210}>{screen}</DevicePhone>
							</div>
							<Stack gap={8} style={{padding: 24}}>
								<Text role="over" color={colors.muted}>
									{t('Adım', 'Step')} {step}
								</Text>
								<Text role="title">{title}</Text>
								<Text role="body">{text}</Text>
							</Stack>
						</div>
					))}
				</Grid>
			</Section>
			<Section>
				<Stack row gap={64}>
					<div style={{flex: 1, height: 460, borderRadius: 32, background: colors.line2, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{position: 'relative', marginTop: 120}}>
							<DevicePhone width={240}>
								<SinoChatScreen />
							</DevicePhone>
						</div>
					</div>
					<Stack gap={16} style={{width: 520}}>
						<Chip tone="outline" icon="sparkles">
							SinoAI
						</Chip>
						<SiteTitle title={t('Takıldığın yerde, seni tanıyan bir asistan', 'An assistant that knows you')} lead={t('SinoAI hedefini ve son denemeni bilir. Soruyu adım adım çözer, konuyu sade anlatır, notlarından test ve kart üretir.', 'SinoAI knows your goal and last exam. It solves step by step and turns notes into quizzes and cards.')} size={38} />
						{[t('Fotoğraftan adım adım çözüm', 'Step-by-step from a photo'), t('Konu anlatımı, örnekli ve kısa', 'Short explanations with examples'), t('Kendi PDF’inden test ve kart', 'Quizzes and cards from your PDF')].map((line) => (
							<Stack key={line} row gap={10}>
								<Icon name="checkCircle" size={20} color={colors.ink2} />
								<Text role="body" size={16} color={colors.ink}>
									{line}
								</Text>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Section>
			<Section>
				<SiteTitle center title={t('Öğrencilerin deneyimi', 'What students say')} lead={t('Kısa geri bildirimler — gerçek sınav hazırlık dilinde.', 'Short notes, in real exam-prep words.')} size={38} />
				<Grid columns="repeat(3, 1fr)" gap={24} style={{marginTop: 36}}>
					{[[t('Hangi konudan net kaybettiğimi görünce ne çalışacağımı düşünmeyi bıraktım.', 'Seeing where I lose points ended the guessing.'), 'Ece K.', t('YKS adayı', 'YKS candidate')], [t('Günlük plan kısa parçalar halinde; işten sonra bile yetişebiliyorum.', 'Short daily tasks fit after work.'), 'Mert A.', t('KPSS hazırlık', 'KPSS prep')], [t('Fotoğrafla soru sormak beklemekten çok daha hızlı.', 'Asking with a photo is much faster.'), 'Zeynep T.', t('11. sınıf', 'Year 11')]].map(([quote, name, sub]) => (
						<div key={name} style={{borderRadius: 24, padding: 26, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Text role="body" size={16.5} color={colors.ink2} style={{lineHeight: '26px'}}>
								“{quote}”
							</Text>
							<div style={{height: 1, background: colors.line, margin: '20px 0 14px'}} />
							<Text role="headline">{name}</Text>
							<Text role="small" style={{marginTop: 2}}>
								{sub}
							</Text>
						</div>
					))}
				</Grid>
			</Section>
			<Cta />
		</Site>
	);
};

/** Ürünler menüsü open: every module, in the site's calm greys. */
export const SiteMenuScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<UIProvider calm>
			<div style={{width: 1440, height: 900, background: colors.card, position: 'relative', overflow: 'hidden'}}>
				<SiteHeader open="products" active={t('Ürünler', 'Products')} />
				<div style={{position: 'absolute', inset: '80px 0 0', background: 'rgba(11,28,48,0.06)'}} />
			</div>
		</UIProvider>
	);
};

export const SiteExamsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const exams: [string, string, string][] = [
		['YKS', t('TYT · AYT · YDT', 'TYT · AYT · YDT'), t('Haziran 2027', 'June 2027')],
		['KPSS Lisans', t('GY · GK · Eğitim bilimleri', 'GA · GC · Education'), t('Temmuz 2026', 'July 2026')],
		['KPSS Ön lisans', t('GY · GK', 'GA · GC'), t('Ekim 2026', 'Oct 2026')],
		['KPSS Ortaöğretim', t('GY · GK', 'GA · GC'), t('Ekim 2026', 'Oct 2026')],
		['SAT', t('İngilizce · Matematik', 'English · Maths'), t('Her ay', 'Monthly')],
		['ACT', t('4 bölüm', '4 sections'), t('Yılda 7 kez', '7 times a year')],
	];
	return (
		<Site active={t('Sınavlar', 'Exams')}>
			<Section padding="56px 112px 28px">
				<SiteTitle over={t('Sınavlar', 'Exams')} title={t('Hangi sınava hazırlanıyorsun?', 'Which exam are you preparing for?')} lead={t('Her sınavın kendi denemeleri, konu ağacı ve planı.', 'Every exam has its own exams, topic tree and plan.')} />
			</Section>
			<Section padding="12px 112px 72px">
				<Grid columns="repeat(3, 1fr)" gap={20}>
					{exams.map(([name, sub, date]) => (
						<Card key={name} padding={24} radius={24}>
							<Stack gap={12}>
								<div style={{width: 52, height: 52, borderRadius: 17, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name="grad" size={26} color={colors.ink2} />
								</div>
								<Text role="title">{name}</Text>
								<Text role="small" size={14}>
									{sub}
								</Text>
								<Stack row justify="space-between">
									<Chip tone="outline" icon="calendar">
										{date}
									</Chip>
									<Text role="small" weight={700} color={colors.ink}>
										{t('İncele →', 'Explore →')}
									</Text>
								</Stack>
							</Stack>
						</Card>
					))}
				</Grid>
			</Section>
		</Site>
	);
};

export const SiteExamLandingScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site active={t('Sınavlar', 'Exams')}>
			<Section padding="56px 112px">
				<Stack row gap={48}>
					<Stack gap={20} style={{width: 620}}>
						<Text role="small" weight={700}>
							{t('Sınavlar › YKS', 'Exams › YKS')}
						</Text>
						<Text role="display" size={50} style={{lineHeight: '56px'}}>
							{t('YKS’ye hazırlık: TYT, AYT ve YDT', 'YKS prep: TYT, AYT and YDT')}
						</Text>
						<Text role="body" size={18}>
							{t('Sınava kadar her gün ne çalışacağını bil. Türkiye geneli denemeler, konu konu net analizi ve sana özel plan.', 'Know what to study every day until the exam.')}
						</Text>
						<Stack row gap={10}>
							<Button size="lg">{t('YKS planımı hazırla', 'Build my YKS plan')}</Button>
							<Button tone="ghost" size="lg">
								{t('Net hesapla', 'Score calculator')}
							</Button>
						</Stack>
					</Stack>
					<Card padding={28} radius={28} style={{flex: 1}}>
						<Stack row justify="space-between">
							<Text role="section">{t('YKS 2027’ye', 'To YKS 2027')}</Text>
							<Chip tone="outline">{t('Haziran 2027', 'June 2027')}</Chip>
						</Stack>
						<Grid columns="1fr 1fr 1fr" gap={12} style={{marginTop: 16}}>
							{[['~245', t('gün', 'days')], ['35', t('hafta', 'weeks')], ['~735', t('saat', 'hours')]].map(([value, label]) => (
								<Card key={label} tone="flat" padding={16}>
									<Text role="num" size={30} align="center">
										{value}
									</Text>
									<Text role="meta" align="center">
										{label}
									</Text>
								</Card>
							))}
						</Grid>
						<Text role="small" style={{marginTop: 12}}>
							{t('Günde 3 saatle. Kesin tarih ÖSYM takvimi açıklanınca güncellenir.', 'At 3 hours a day. Updated when ÖSYM announces dates.')}
						</Text>
					</Card>
				</Stack>
			</Section>
			<Section>
				<SiteTitle title={t('Oturumlar', 'Sessions')} size={34} />
				<Grid columns="repeat(3, 1fr)" gap={20} style={{marginTop: 24}}>
					{[['TYT', t('120 soru · 165 dk', '120 questions · 165 min'), t('Türkçe 40 · Sosyal 20 · Matematik 40 · Fen 20', 'Turkish 40 · Social 20 · Maths 40 · Science 20')], ['AYT', t('160 soru · 180 dk', '160 questions · 180 min'), t('Matematik, Fen, Edebiyat-Sosyal 1, Sosyal 2', 'Maths, Science, Literature-Social')], ['YDT', t('80 soru · 120 dk', '80 questions · 120 min'), t('İngilizce, Almanca, Arapça, Fransızca, Rusça', 'English, German, Arabic, French, Russian')]].map(([name, meta, sub]) => (
						<Card key={name} padding={24} radius={24}>
							<Stack gap={10}>
								<Tile module="lessons" size={48} />
								<Text role="title">{name}</Text>
								<Text role="headline">{meta}</Text>
								<Text role="small">{sub}</Text>
							</Stack>
						</Card>
					))}
				</Grid>
			</Section>
			<Section bg={colors.bg}>
				<Stack row gap={48}>
					<Stack gap={14} style={{width: 460}}>
						<SiteTitle title={t('YKS denemeleri', 'YKS exams')} lead={t('Canlı Türkiye geneli denemeler ve arşiv. Sonuç 2 saat içinde, eksikler planına.', 'Live nationwide exams and archive. Results in 2 hours.')} size={34} />
						<List>
							<ListRow module="exam" title={t('TYT Deneme 5', 'TYT Exam 5')} subtitle={t('Cumartesi 17 Ekim · canlı', 'Sat 17 Oct · live')} />
							<ListRow module="exam" title={t('AYT Sayısal Deneme 3', 'AYT Science Exam 3')} subtitle={t('Her zaman', 'Anytime')} />
							<ListRow module="exam" title={t('Paragraf Branş', 'Reading Subject')} subtitle={t('Ücretsiz', 'Free')} />
						</List>
					</Stack>
					<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
						<DeviceBrowser width={700} title={t('Sınavika · Sonuç', 'Sınavika · Result')}>
							<WebResultScreen />
						</DeviceBrowser>
					</div>
				</Stack>
			</Section>
			<Section>
				<SiteTitle title={t('Sık sorulanlar', 'FAQ')} size={34} />
				<Stack gap={0} style={{marginTop: 18}}>
					{[t('YKS 2027 ne zaman?', 'When is YKS 2027?'), t('TYT ve AYT puanı nasıl hesaplanır?', 'How are scores calculated?'), t('Sınavika denemeleri ÖSYM formatında mı?', 'Do exams follow the ÖSYM format?'), t('Hangi paket YKS için uygun?', 'Which plan suits YKS?')].map((q, index) => (
						<Stack key={q} row justify="space-between" style={{padding: '20px 0', borderBottom: `1px solid ${colors.line}`}}>
							<Text role="section" size={17}>
								{q}
							</Text>
							<Icon name={index ? 'plus' : 'minus'} size={20} color={colors.muted} />
						</Stack>
					))}
				</Stack>
			</Section>
			<Cta />
		</Site>
	);
};

export const SiteNetCalcScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site active={t('Kaynaklar', 'Resources')}>
			<Section padding="56px 112px 72px">
				<Stack row gap={40} align="flex-start">
					<Stack gap={18} style={{width: 640}}>
						<SiteTitle over={t('Net hesaplama', 'Score calculator')} title={t('TYT net ve puan hesaplama', 'TYT score calculator')} lead={t('Doğru ve yanlışlarını gir; netini ve tahmini puanını gör. 4 yanlış 1 doğruyu götürür.', 'Enter rights and wrongs; see your score. 4 wrong cancel 1 right.')} size={40} />
						<Card padding={10}>
							{[['Türkçe', 'Turkish', 40, 33, 2, '32,5'], ['Sosyal Bilimler', 'Social', 20, 15, 3, '14,25'], ['Temel Matematik', 'Basic Maths', 40, 24, 9, '21,75'], ['Fen Bilimleri', 'Science', 20, 11, 4, '10']].map(([tr, en, total, right, wrong, net], index) => (
								<Stack key={tr as string} row gap={14} style={{padding: '12px 14px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
									<Text role="headline" style={{flex: 1}}>
										{t(tr as string, en as string)}
									</Text>
									<Text role="small" style={{width: 60}}>
										{total} {t('soru', 'q')}
									</Text>
									<div style={{width: 80}}>
										<Field value={String(right)} height={40} />
									</div>
									<div style={{width: 80}}>
										<Field value={String(wrong)} height={40} />
									</div>
									<Text role="section" style={{width: 70, textAlign: 'right'}}>
										{net}
									</Text>
								</Stack>
							))}
						</Card>
					</Stack>
					<Stack gap={16} style={{flex: 1}}>
						<div style={{borderRadius: 28, padding: 28, background: colors.bg, border: `1px solid ${colors.line}`}}>
							<Text role="over">
								{t('Sonucun', 'Your result')}
							</Text>
							<Stack row justify="space-between" style={{marginTop: 10}}>
								<Stack gap={2}>
									<Text role="small">
										{t('Toplam net', 'Total')}
									</Text>
									<Text role="num" size={54}>
										78,5
									</Text>
								</Stack>
								<Stack gap={2} align="flex-end">
									<Text role="small">
										{t('Tahmini TYT puanı', 'Estimated score')}
									</Text>
									<Text role="num" size={54}>
										~362
									</Text>
								</Stack>
							</Stack>
						</div>
						<Card padding={24} radius={24}>
							<Stack gap={12}>
								<Text role="section">{t('Bu netle ne yapmalısın?', 'What next with this score?')}</Text>
								<Text role="body">{t('Matematikte 18 net kaybın var. Sınavika ilk denemenden sonra hangi konulardan kaybettiğini tek tek gösterir.', 'You lose 18 in Maths. After your first exam we show exactly which topics.')}</Text>
								<Button size="lg">{t('Ücretsiz deneme çöz', 'Take a free exam')}</Button>
							</Stack>
						</Card>
					</Stack>
				</Stack>
			</Section>
		</Site>
	);
};

export const SitePlansScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const plans: [string, string, string, string[], boolean][] = [
		[t('Ücretsiz', 'Free'), '₺0', t('başlamak için', 'to get started'), [t('Ayda 1 Türkiye geneli deneme', '1 nationwide exam a month'), t('Sonuç ve sıralama', 'Result and rank'), t('Temel Ders Planı', 'Basic study plan'), t('SinoAI · günde 5 soru', 'SinoAI · 5 a day')], false],
		[t('YKS Yıllık', 'YKS Yearly'), '₺249', t('/ay · yıllık ₺2.990', '/mo · ₺2,990 a year'), [t('Tüm denemeler ve analiz', 'All exams and analysis'), t('Dersler, Testler, Bilgi Kartları', 'Lessons, quizzes, flashcards'), t('Ders Planı ve ilerleme', 'Study plan and progress'), t('Akıllı Özet · ayda 30', 'Smart Summary · 30 a month'), t('SinoAI · sınırsız', 'SinoAI · unlimited')], true],
		[t('KPSS Yıllık', 'KPSS Yearly'), '₺229', t('/ay · yıllık ₺2.750', '/mo · ₺2,750 a year'), [t('KPSS GY-GK denemeleri', 'KPSS exams'), t('Dersler, Testler, Bilgi Kartları', 'Lessons, quizzes, flashcards'), t('Ders Planı ve ilerleme', 'Study plan and progress'), t('Akıllı Özet · ayda 30', 'Smart Summary · 30 a month'), t('SinoAI · sınırsız', 'SinoAI · unlimited')], false],
	];
	return (
		<Site active={t('Paketler', 'Plans')}>
			<Section padding="56px 112px 24px">
				<SiteTitle center title={t('Hedefine uygun paketi seç', 'Pick the plan for your goal')} lead={t('Tüm ücretli paketlerde 3 gün ücretsiz. Gizli ücret yok, istediğin an iptal.', '3 days free on every paid plan. No hidden fees.')} />
			</Section>
			<Section padding="24px 112px 72px">
				<Grid columns="repeat(3, 1fr)" gap={24}>
					{plans.map(([name, price, sub, features, popular]) => (
						<div key={name} style={{position: 'relative', borderRadius: 28, padding: 30, background: colors.card, border: `${popular ? 2 : 1}px solid ${popular ? colors.ink : colors.line}`, boxShadow: popular ? '0 20px 40px -24px rgba(15,23,42,0.35)' : undefined}}>
							{popular ? <Chip tone="dark" style={{position: 'absolute', top: -14, left: 28}}>{t('En çok seçilen', 'Most popular')}</Chip> : null}
							<Stack gap={14}>
								<Text role="section" size={20}>
									{name}
								</Text>
								<Stack row gap={8} align="baseline">
									<Text role="num" size={44}>
										{price}
									</Text>
									<Text role="small">{sub}</Text>
								</Stack>
								<Button tone={popular ? 'primary' : 'ghost'} size="lg" block>
									{price === '₺0' ? t('Ücretsiz başla', 'Start free') : t('3 gün ücretsiz dene', 'Try 3 days free')}
								</Button>
								{features.map((feature) => (
									<Stack key={feature} row gap={10}>
										<Icon name="checkCircle" size={18} color={colors.ink2} />
										<Text role="body" color={colors.ink}>
											{feature}
										</Text>
									</Stack>
								))}
							</Stack>
						</div>
					))}
				</Grid>
				<Text role="small" align="center" style={{marginTop: 20}}>
					{t('Fiyat ve kotalar örnektir; yayında API’den gelir.', 'Prices and quotas are examples; live values come from the API.')}
				</Text>
			</Section>
		</Site>
	);
};

/** A product page (one template for every module): what it does, with the real screens. */
const ProductPage: React.FC<{module: ModuleKey; features: [UIIconName, string, string][]; phone: React.ReactNode; browser?: React.ReactNode}> = ({module, features, phone, browser}) => {
	const t = useT();
	const identity = MODULES[module];
	const colors = useColors();
	return (
		<Site active={t('Ürünler', 'Products')}>
			<Section padding="56px 112px">
				<Stack row gap={48}>
					<Stack gap={18} style={{width: 560}}>
						<Stack row gap={10}>
							<Tile module={module} size={48} />
							<Chip tone="module" module={module}>
								{t(identity.name)}
							</Chip>
						</Stack>
						<Text role="display" size={50} style={{lineHeight: '56px'}}>
							{t(identity.slide.title)}
						</Text>
						<Text role="body" size={18}>
							{t(identity.tagline)}. {t(identity.slide.text)}
						</Text>
						<Stack row gap={10}>
							<Button size="lg">{t('Ücretsiz dene', 'Try free')}</Button>
							<Button tone="ghost" size="lg">
								{t('Tüm ürünler', 'All products')}
							</Button>
						</Stack>
					</Stack>
					<div style={{position: 'relative', flex: 1, height: 480}}>
						{browser ? (
							<div style={{position: 'absolute', left: 0, top: 30}}>
								<DeviceBrowser width={560}>{browser}</DeviceBrowser>
							</div>
						) : null}
						<div style={{position: 'absolute', right: browser ? 0 : 160, top: browser ? 60 : 0}}>
							<DevicePhone width={230}>{phone}</DevicePhone>
						</div>
					</div>
				</Stack>
			</Section>
			<Section>
				<Grid columns="repeat(3, 1fr)" gap={20}>
					{features.map(([icon, title, text]) => (
						<Card key={title} padding={26} radius={24}>
							<Stack gap={12}>
								<Tile module={module} icon={icon} size={48} />
								<Text role="section">{title}</Text>
								<Text role="body">{text}</Text>
							</Stack>
						</Card>
					))}
				</Grid>
			</Section>
			<Section bg={colors.bg}>
				<SiteTitle center title={t('Diğer modüllerle birlikte çalışır', 'Works with the other modules')} size={32} />
				<div style={{marginTop: 28}}>
					<ModuleCards />
				</div>
			</Section>
			<Cta />
		</Site>
	);
};

export const SiteProductExamScreen: React.FC = () => {
	const t = useT();
	return (
		<ProductPage
			module="exam"
			phone={<ExamHomeScreen />}
			browser={<WebResultScreen />}
			features={[
				['exam', t('Canlı ve arşiv denemeler', 'Live and archive exams'), t('TYT, AYT, KPSS ve branş denemeleri; Türkiye sıralaması.', 'TYT, AYT, KPSS and subject exams; national rank.')],
				['chart', t('Konu konu net analizi', 'Loss by topic'), t('Hangi konuda kaç net kaybettiğin, ders ve test önerisiyle.', 'Where you lost points, with lessons and quizzes to fix it.')],
				['playCircle', t('Video ve yazılı çözüm', 'Video and written solutions'), t('Takılırsan SinoAI’ye o soruyu sor.', 'Stuck? Ask SinoAI about that question.')],
			]}
		/>
	);
};

export const SiteProductSummaryScreen: React.FC = () => {
	const t = useT();
	return (
		<ProductPage
			module="smartSummary"
			phone={<SummaryResultScreen />}
			features={[
				['camera', t('Fotoğrafla çöz', 'Solve from a photo'), t('Tek sorunun fotoğrafını çek; 30 saniyede çözüm.', 'Snap a question; solved in 30 seconds.')],
				['note', t('Konu özeti', 'Topic summary'), t('Sorunun konusu ve kazanımı tek sayfada.', 'The topic and skill on one page.')],
				['quiz', t('Benzer sorular', 'Similar questions'), t('5 benzer soruyla pekiştir; Testler’e eklenir.', 'Practise 5 similar ones in Quizzes.')],
			]}
		/>
	);
};

export const SiteBlogScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const posts: [ModuleKey, string, string][] = [
		['lessons', t('Çalışma teknikleri', 'Study skills'), t('Pomodoro mu, 50/10 mu? Odak süreni bulmak', 'Pomodoro or 50/10? Find your focus length')],
		['exam', 'KPSS', t('KPSS GY-GK: hangi konudan kaç soru çıkıyor?', 'KPSS: how many questions per topic?')],
		['sinoAi', t('Ürün', 'Product'), t('SinoAI ile fotoğraftan soru çözme rehberi', 'Solving questions from photos with SinoAI')],
		['tests', 'YKS', t('TYT matematikte net artıran 7 konu', '7 topics that raise TYT maths')],
		['flashcards', t('Çalışma teknikleri', 'Study skills'), t('Aralıklı tekrar nasıl çalışır?', 'How spaced repetition works')],
		['studyPlan', 'YKS', t('Son 8 ayda gerçekçi bir çalışma planı', 'A realistic plan for the last 8 months')],
	];
	return (
		<Site active={t('Kaynaklar', 'Resources')}>
			<Section padding="56px 112px 24px">
				<SiteTitle title="Blog" lead={t('Sınav hazırlığı, çalışma teknikleri ve ürün rehberleri.', 'Exam prep, study skills and product guides.')} />
				<Stack row gap={8} style={{marginTop: 18}}>
					{[t('Tümü', 'All'), 'YKS', 'KPSS', t('Çalışma teknikleri', 'Study skills'), t('Ürün', 'Product')].map((label, index) => (
						<Chip key={label} tone={index ? 'outline' : 'dark'} style={{height: 36, padding: '0 16px', fontSize: 14}}>
							{label}
						</Chip>
					))}
				</Stack>
			</Section>
			<Section padding="24px 112px 72px">
				<Stack row gap={32} style={{marginBottom: 40}}>
					<div style={{flex: 1.3, height: 360, borderRadius: 28, background: colors.line2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden'}}>
						<div style={{marginBottom: -140}}>
							<DevicePhone width={220}>
								<PlanTodayScreen />
							</DevicePhone>
						</div>
					</div>
					<Stack gap={12} justify="center" style={{flex: 1}}>
						<Chip tone="module" module="studyPlan">
							YKS
						</Chip>
						<Text role="display" size={34} style={{lineHeight: '40px'}}>
							{t('Son 8 ayda TYT netini artırmanın 5 yolu', '5 ways to raise your TYT score in 8 months')}
						</Text>
						<Text role="body" size={16}>
							{t('Deneme analizinden haftalık plana, gerçekçi bir net artırma rotası.', 'From exam analysis to a weekly plan.')}
						</Text>
						<Text role="meta">{t('12 Ekim · 7 dk okuma', '12 Oct · 7 min read')}</Text>
					</Stack>
				</Stack>
				<Grid columns="repeat(3, 1fr)" gap={28}>
					{posts.map(([key, category, title]) => (
						<Stack key={title} gap={12}>
							<div style={{height: 200, borderRadius: 24, background: colors.bg, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{width: 84, height: 84, borderRadius: 28, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 30px -16px rgba(15,23,42,0.3)'}}>
									<Icon name={MODULES[key].icon} size={40} color={colors.ink2} />
								</div>
							</div>
							<Text role="over" color={colors.muted}>
								{category}
							</Text>
							<Text role="section" size={19}>
								{title}
							</Text>
							<Text role="meta">{t('5 dk okuma', '5 min read')}</Text>
						</Stack>
					))}
				</Grid>
			</Section>
		</Site>
	);
};

export const SiteBlogPostScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site active={t('Kaynaklar', 'Resources')}>
			<Section padding="56px 112px 72px">
				<Stack row gap={56} align="flex-start">
					<Stack gap={18} style={{width: 760}}>
						<Text role="small" weight={700}>
							{t('Blog › YKS', 'Blog › YKS')}
						</Text>
						<Text role="display" size={44} style={{lineHeight: '50px'}}>
							{t('Son 8 ayda TYT netini artırmanın 5 yolu', '5 ways to raise your TYT score in 8 months')}
						</Text>
						<Stack row gap={10}>
							<Chip tone="module" module="studyPlan">
								YKS
							</Chip>
							<Text role="meta">{t('12 Ekim 2026 · 7 dk okuma · Sınavika Eğitim Ekibi', '12 Oct 2026 · 7 min · Sınavika team')}</Text>
						</Stack>
						<div style={{height: 300, borderRadius: 24, background: colors.line2}} />
						<Text role="body" size={17} style={{lineHeight: '29px'}}>
							{t('Net artırmak daha çok soru çözmekten çok, doğru soruyu doğru zamanda çözmekle ilgilidir. İlk adım, son denemende hangi konuda kaç net kaybettiğini bilmek.', 'Raising your score is less about more questions and more about the right ones at the right time.')}
						</Text>
						<Text role="title">{t('1. Denemeni konu konu oku', '1. Read your exam topic by topic')}</Text>
						<Text role="body" size={17} style={{lineHeight: '29px'}}>
							{t('Toplam net yerine konu kaybına bak. Üç konu genelde kaybın yarısını açıklar.', 'Look at losses by topic, not the total. Three topics usually explain half of it.')}
						</Text>
						<Card tone="module" module="studyPlan" padding={20}>
							<Stack row gap={14}>
								<Tile module="studyPlan" size={46} />
								<Stack grow gap={2}>
									<Text role="headline">{t('Bunu Sınavika yapıyor', 'Sınavika does this for you')}</Text>
									<Text role="small">{t('Deneme analizin otomatik olarak planına eklenir.', 'Your exam analysis goes straight into your plan.')}</Text>
								</Stack>
								<Button>{t('Ücretsiz dene', 'Try free')}</Button>
							</Stack>
						</Card>
					</Stack>
					<Stack gap={16} style={{flex: 1}}>
						<Card padding={20}>
							<Text role="over">{t('Bu yazıda', 'In this post')}</Text>
							<Stack gap={10} style={{marginTop: 12}}>
								{[t('Denemeni konu konu oku', 'Read by topic'), t('Haftalık hedef koy', 'Set a weekly goal'), t('Aralıklı tekrar', 'Spaced repetition'), t('Odak süreni bul', 'Find your focus length'), t('Her hafta deneme', 'An exam every week')].map((item, index) => (
									<Text key={item} role="small" weight={index ? 500 : 800} color={index ? colors.muted : colors.ink}>
										{index + 1}. {item}
									</Text>
								))}
							</Stack>
						</Card>
						<Card padding={20}>
							<Text role="over">{t('İlgili', 'Related')}</Text>
							<List style={{marginTop: 12}}>
								<ListRow module="tests" title={t('TYT matematikte 7 konu', '7 TYT maths topics')} />
								<ListRow module="flashcards" title={t('Aralıklı tekrar nasıl çalışır?', 'How spaced repetition works')} />
							</List>
						</Card>
					</Stack>
				</Stack>
			</Section>
		</Site>
	);
};

export const SiteAboutScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site>
			<Section padding="70px 112px 40px">
				<SiteTitle center over={t('Hakkımızda', 'About us')} title={t('Her öğrencinin ne çalışacağını bildiği bir dünya', 'A world where every student knows what to study')} lead={t('Sınavika, “bugün ne çalışmalıyım?” sorusunu verisiyle yanıtlamak için kuruldu. Türkiye’den başladık, Avrupa’ya açılıyoruz.', 'Sınavika answers “what should I study today?” with data. Started in Türkiye, expanding to Europe.')} />
			</Section>
			<Section padding="0 112px 56px">
				<Grid columns="repeat(4, 1fr)" gap={18}>
					{[['[sayı]', t('haftalık aktif öğrenci', 'weekly active students')], ['[sayı]', t('çözülen deneme sorusu', 'exam questions solved')], ['7', t('modül, tek uygulama', 'modules, one app')], ['4', t('dil: TR, EN, DE, NL', 'languages')]].map(([value, label]) => (
						<Card key={label} padding={28} radius={24} style={{textAlign: 'center'}}>
							<Text role="num" size={38} align="center">
								{value}
							</Text>
							<Text role="small" align="center">
								{label}
							</Text>
						</Card>
					))}
				</Grid>
			</Section>
			<Section bg={colors.bg}>
				<Grid columns="1fr 1fr 1fr" gap={20}>
					{([['target', t('Ölç', 'Measure'), t('Tahmin değil, öğrencinin kendi verisi.', 'The student’s own data, not guesses.')], ['book', t('Öğren', 'Learn'), t('Kısa, net ve sınava dönük içerik.', 'Short, clear, exam-focused content.')], ['trend', t('Geliş', 'Grow'), t('Her gün tek bir net adım.', 'One clear step every day.')]] as [UIIconName, string, string][]).map(([icon, title, text]) => (
						<Card key={title} padding={28} radius={24}>
							<Stack gap={12}>
								<Tile icon={icon} size={48} color={colors.ink2} />
								<Text role="title">{title}</Text>
								<Text role="body">{text}</Text>
							</Stack>
						</Card>
					))}
				</Grid>
			</Section>
		</Site>
	);
};

export const SiteFaqContactScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site>
			<Section padding="64px 112px 72px">
				<Stack row gap={56} align="flex-start">
					<Stack gap={10} style={{flex: 1.3}}>
						<SiteTitle over={t('Yardım', 'Help')} title={t('Sık sorulanlar', 'Frequently asked')} size={40} />
						{[t('Ücretsiz deneme süresi bitince ne olur?', 'What happens after the trial?'), t('Aboneliğimi nasıl iptal ederim?', 'How do I cancel?'), t('Web ve mobilde aynı hesabı kullanabilir miyim?', 'Same account on web and mobile?'), t('SinoAI cevaplarına güvenebilir miyim?', 'Can I trust SinoAI?'), t('Verilerim nasıl korunuyor?', 'How is my data protected?'), t('Kurumsal ve yayınevi iş birlikleri', 'Schools and publishers')].map((q, index) => (
							<Stack key={q} gap={8} style={{padding: '18px 0', borderBottom: `1px solid ${colors.line}`}}>
								<Stack row justify="space-between">
									<Text role="section" size={17}>
										{q}
									</Text>
									<Icon name={index ? 'plus' : 'minus'} size={20} color={colors.muted} />
								</Stack>
								{index === 0 ? <Text role="body">{t('3. gün seçtiğin paket başlar. 2. gün hatırlatırız; öncesinde iptal edersen ücret yok.', 'Your plan starts on day 3. We remind you on day 2; cancel before and pay nothing.')}</Text> : null}
							</Stack>
						))}
					</Stack>
					<Card padding={28} radius={28} style={{flex: 1}}>
						<Stack gap={14}>
							<Text role="title">{t('Bize yaz', 'Write to us')}</Text>
							<Field label={t('E-posta', 'E-mail')} value="ornek@eposta.com" icon="mail" />
							<Field label={t('Konu', 'Topic')} value={t('Ödeme · Hesap · Deneme · Diğer', 'Payment · Account · Exam · Other')} trailing={<Icon name="down" size={16} color={colors.muted} />} />
							<Field label={t('Mesajın', 'Message')} placeholder={t('Nasıl yardımcı olabiliriz?', 'How can we help?')} height={120} />
							<Button size="lg" block>
								{t('Gönder', 'Send')}
							</Button>
							<Text role="meta">{t('Genelde birkaç saat içinde yanıtlıyoruz.', 'We usually reply within a few hours.')}</Text>
						</Stack>
					</Card>
				</Stack>
			</Section>
		</Site>
	);
};

export const SiteLegalScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Site>
			<Section padding="56px 112px 72px">
				<Stack row gap={56} align="flex-start">
					<Card padding={18} style={{width: 260}}>
						<Text role="over">{t('Yasal', 'Legal')}</Text>
						<Stack gap={6} style={{marginTop: 12}}>
							{[t('Kullanım koşulları', 'Terms'), t('Gizlilik politikası', 'Privacy'), t('KVKK aydınlatma', 'Privacy notice'), t('Çerez politikası', 'Cookies'), t('Mesafeli satış', 'Distance sales'), t('İletişim izinleri', 'Contact consent')].map((item, index) => (
								<Text key={item} role="small" weight={index === 1 ? 800 : 600} color={index === 1 ? colors.ink : colors.ink2} style={{padding: '8px 10px', borderRadius: 10, background: index === 1 ? colors.line2 : undefined}}>
									{item}
								</Text>
							))}
						</Stack>
					</Card>
					<Stack gap={18} style={{width: 680}}>
						<Text role="display" size={40}>
							{t('Gizlilik politikası', 'Privacy policy')}
						</Text>
						<Text role="meta">{t('Son güncelleme: 1 Ekim 2026', 'Updated 1 Oct 2026')}</Text>
						{[t('1. Hangi verileri topluyoruz', '1. What we collect'), t('2. Verileri neden kullanıyoruz', '2. Why we use it'), t('3. Kimlerle paylaşıyoruz', '3. Who we share it with')].map((heading) => (
							<Stack key={heading} gap={8}>
								<Text role="title" size={22}>
									{heading}
								</Text>
								<Text role="body" size={16} style={{lineHeight: '27px'}}>
									{t('Sınavika hesabını oluştururken verdiğin ad, e-posta ve sınav hedefin; çalışma geçmişin ve deneme sonuçların hizmeti sunmak için işlenir. Ayrıntılar ve hakların bu bölümde anlatılır.', 'Your name, e-mail and exam goal, study history and results are processed to provide the service. Details and your rights are explained here.')}
								</Text>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Section>
		</Site>
	);
};

/** SinoAI for guests (the site's SinoAI page): a plain white chat start, like ChatGPT or Gemini. */
export const SiteSinoGuestScreen: React.FC = () => (
	<UIProvider calm>
		<SinoGuest />
	</UIProvider>
);

const SinoGuest: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<div style={{width: 1440, height: 900, display: 'flex', flexDirection: 'column', background: colors.card}}>
			<SiteHeader />
			<Stack align="center" gap={20} style={{flex: 1, paddingTop: 110}}>
				<Icon name="sparkles" size={34} color={colors.ink} stroke={1.6} />
				<Text role="display" size={40} align="center">
					{t('SinoAI’ye sor', 'Ask SinoAI')}
				</Text>
				<Text role="body" size={17} align="center">
					{t('Soruyu yaz ya da fotoğrafını ekle. Misafir olarak günde 3 soru; hesapla hedefini bilerek anlatır.', 'Type or add a photo. 3 a day as a guest; with an account it knows your goal.')}
				</Text>
				<div style={{width: 760, borderRadius: 28, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: '0 20px 40px -28px rgba(15,23,42,0.3)', padding: '18px 14px 12px 22px', boxSizing: 'border-box'}}>
					<Text role="body" size={16} color={colors.subtle}>
						{t('f(x) = (3x² − 2)⁴ için f′(1) kaçtır?', 'What is f′(1) for f(x) = (3x² − 2)⁴?')}
					</Text>
					<Stack row gap={8} style={{marginTop: 14}}>
						<Stack row gap={6} style={{height: 34, padding: '0 12px', borderRadius: 17, border: `1px solid ${colors.line}`}}>
							<Icon name="image" size={16} color={colors.ink2} />
							<Text role="small" weight={600} color={colors.ink2}>
								{t('Fotoğraf ekle', 'Add a photo')}
							</Text>
						</Stack>
						<div style={{flex: 1}} />
						<div style={{width: 38, height: 38, borderRadius: 19, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="up" size={19} color={colors.card} stroke={2.4} />
						</div>
					</Stack>
				</div>
				<Stack row gap={10}>
					{[t('Türevde zincir kuralı', 'Chain rule'), t('Paragrafta ana fikir', 'Main idea'), t('Mol hesaplama', 'Mole calculation'), t('KPSS tarih özeti', 'KPSS history notes')].map((chip) => (
						<Chip key={chip} tone="outline" style={{height: 38, padding: '0 16px', fontSize: 14}}>
							{chip}
						</Chip>
					))}
				</Stack>
				<div style={{flex: 1}} />
				<Stack row gap={12} style={{marginBottom: 36}}>
					<Text role="small">{t('Sohbetlerini kaydetmek ve kütüphaneni açmak için ücretsiz hesap oluştur.', 'Create a free account to save chats and open your library.')}</Text>
					<Button size="sm" tone="dark">
						{t('Kayıt ol', 'Sign up')}
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};
