import React from 'react';
import {useColors} from '../UIUX/Context';
import {Icon} from '../UIUX/Icons';
import {MODULE_KEYS, MODULES} from '../UIUX/ModuleIdentity';
import {Logo, Text} from '../UIUX/Parts/Shared';
import {FACTS, MARKET, USD_TRY} from './PitchDeckFacts';
import {audienceValueUsd, lifetimeNetPerAdDollar, NET_SHARE, PREP_MONTHS, runModel, SCALED_CPI_TL, SCENARIOS, sensitivity, SPEND_PLAN_USD, targetShareOfApplicants} from './PitchDeckModel';
import {BarPair, compact, kUsd, Legend, LineChart, Panel, Point, Row, Screen, Slide, Stat, trNumber, usd} from './PitchDeckParts';

/**
 * The investor deck, one component per page. Text follows the deck brief
 * (docs/PitchDeck/Sunum-Notlari.md); numbers come from PitchDeckFacts and
 * PitchDeckModel only, so a changed report changes every page that cites it.
 */
const target = runModel(SCENARIOS.target);
const today = runModel(SCENARIOS.today);
const pct = (value: number, digits = 1) => `%${trNumber(value * 100, digits)}`;
const tl = (value: number, digits = 0) => `${trNumber(value, digits)} TL`;

const Contact: React.FC<{dark?: boolean}> = ({dark}) => {
	const colors = useColors();
	const ink = dark ? '#FFFFFF' : colors.ink;
	const pill = (icon: 'globe' | 'mail' | 'phone', text: string) => (
		<div key={text} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '18px 28px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.16)' : colors.card, border: dark ? 'none' : `1px solid ${colors.line}`}}>
			<Icon name={icon} size={26} color={ink} />
			<Text role="headline" size={24} color={ink}>
				{text}
			</Text>
		</div>
	);
	return (
		<div style={{display: 'flex', gap: 18, flexWrap: 'wrap'}}>
			{pill('globe', 'www.sinavika.com')}
			{pill('mail', 'info@sinavika.com')}
			{pill('phone', 'iOS · Android · Web')}
		</div>
	);
};

// 1 ---------------------------------------------------------------- cover
const Cover: React.FC = () => {
	const colors = useColors();
	return (
		<Slide index={1} background={`linear-gradient(125deg, ${colors.brand} 0%, #F97316 58%, #FB923C 100%)`} dark>
			<div style={{display: 'flex', flex: 1, alignItems: 'center', gap: 80}}>
				<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 34}}>
					<Logo height={92} wordmark color="#FFFFFF" />
					<Text role="display" size={78} color="#FFFFFF" style={{lineHeight: '88px', marginTop: 20}}>
						Yapay zekâ destekli sınav hazırlığı
					</Text>
					<Text role="body" size={30} color="rgba(255,255,255,0.9)" style={{lineHeight: '44px', maxWidth: 880}}>
						Öğrenme, deneme ve gelişim takibini aynı platformda birleştiriyoruz. YKS ve KPSS’de başlayan ürünümüzü SAT ve ACT kapsamıyla uluslararası sınavlara taşıyoruz.
					</Text>
					<Text role="headline" size={26} color="#FFFFFF" style={{marginTop: 10}}>
						Onur Eymen Coşkun · Kurucu
					</Text>
					<Contact dark />
				</div>
				<div style={{position: 'relative', width: 640, height: 800}}>
					<Screen id="m-deneme-sonuc" width={320} crop={700} style={{position: 'absolute', left: -40, top: 150, transform: 'rotate(-6deg)'}} />
					<Screen id="m-hub-moduller" width={360} style={{position: 'absolute', right: 0, top: 30}} />
				</div>
			</div>
		</Slide>
	);
};

// 2 ---------------------------------------------------------------- problem
const Problem: React.FC = () => (
	<Slide index={2} eyebrow="Problem" title="Öğrenci çalışıyor ama neyi, ne zaman çalışacağını bilmiyor" lead="Sınav hazırlığı parçalı kaynaklara dağılmış durumda. Deneme sonucu görülüyor ama bir sonraki adıma dönüşmüyor." footnote="YKS 2026: 2.425.560 başvuru, KPSS Ön Lisans 2026: 1.593.198 başvuru (ÖSYM).">
		<div style={{display: 'flex', gap: 34, flex: 1}}>
			{[
				{icon: 'layers' as const, title: 'Dağınık hazırlık süreci', text: 'Öğrenciler konu anlatımı, soru çözümü, deneme analizi ve çalışma planı için farklı kaynaklar arasında zaman kaybediyor.'},
				{icon: 'target' as const, title: 'Sonuçtan çalışmaya geçiş', text: 'Deneme sonucunu görmek yeterli olmuyor. Öğrencinin hangi konuyu, nasıl çalışacağını belirleyen bir yönlendirmeye ihtiyacı var.'},
				{icon: 'globe' as const, title: 'Sınavlara göre değişen ihtiyaçlar', text: 'Her sınavın müfredatı ve soru yapısı farklı. Ortak öğrenme deneyimi, sınava özgü içerikle birleşmeli.'},
			].map((item, index) => (
				<Panel key={item.title} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 26}}>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
						<div style={{width: 80, height: 80, borderRadius: 22, background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={item.icon} size={42} color="#EA580C" />
						</div>
						<Text role="num" size={56} weight={800} color="#FDBA74">
							{String(index + 1).padStart(2, '0')}
						</Text>
					</div>
					<Text role="title" size={38} style={{lineHeight: '46px'}}>
						{item.title}
					</Text>
					<Text role="body" size={25} style={{lineHeight: '38px'}}>
						{item.text}
					</Text>
				</Panel>
			))}
		</div>
	</Slide>
);

// 3 ---------------------------------------------------------------- solution
const Solution: React.FC = () => (
	<Slide index={3} eyebrow="Çözüm" title="Öğren, uygula ve ölç, çalışmanı yönlendir: tek döngü" lead="Sınavika, deneme sonucunu doğrudan bir sonraki çalışmaya çevirir. Eksik konu derse, ders teste, test plana bağlanır.">
		<div style={{display: 'flex', gap: 60, flex: 1, alignItems: 'center'}}>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 46}}>
				<Point n={1} title="Öğren" text="Konu anlatımları ve destekleyici içeriklerle bilgi eksiklerini tamamla." size="lg" />
				<Point n={2} title="Uygula ve ölç" text="Quizler ve denemelerle öğrendiklerini uygula, performansını değerlendir." size="lg" />
				<Point n={3} title="Çalışmanı yönlendir" text="Analizlerle önceliklerini belirle, çalışma planını oluştur ve gelişimini takip et." size="lg" />
			</div>
			<div style={{display: 'flex', gap: 28, alignItems: 'flex-start'}}>
				<Screen id="m-ders-akis" width={280} crop={720} />
				<Screen id="m-deneme-analiz" width={280} crop={720} style={{marginTop: 60}} />
				<Screen id="m-plan-bugun" width={280} crop={720} />
			</div>
		</div>
	</Slide>
);

// 4 ---------------------------------------------------------------- product
const Product: React.FC = () => {
	const colors = useColors();
	return (
		<Slide index={4} eyebrow="Ürün" title="Birbirine bağlı yedi modül" lead="Konu öğrenimi, pratik, analiz ve planlama aynı hesapta, aynı konu ağacında çalışır. iOS, Android ve web’de aynı deneyim.">
			<div style={{display: 'flex', gap: 56, flex: 1}}>
				<div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignContent: 'start'}}>
					{MODULE_KEYS.map((key) => {
						const module = MODULES[key];
						return (
							<div key={key} style={{display: 'flex', gap: 20, alignItems: 'center', padding: '22px 26px', borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, gridColumn: key === 'sinoAi' ? 'span 2' : undefined}}>
								<div style={{width: 64, height: 64, borderRadius: 18, background: `${module.color.light}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
									<Icon name={module.icon} size={34} color={module.color.light} />
								</div>
								<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
									<Text role="title" size={28}>
										{module.name.tr}
									</Text>
									<Text role="small" size={20}>
										{module.tagline.tr}
									</Text>
								</div>
							</div>
						);
					})}
				</div>
				<div style={{display: 'flex', gap: 26, alignItems: 'flex-start'}}>
					<Screen id="m-hub-moduller" width={300} crop={760} />
					<Screen id="m-hub-moduller-kaydir" width={300} crop={760} style={{marginTop: 50}} />
				</div>
			</div>
		</Slide>
	);
};

// 5 ---------------------------------------------------------------- SinoAI
const SinoAI: React.FC = () => (
	<Slide index={5} eyebrow="Yapay zekâ çalışma araçları" title="Öğrencinin seçimini çalışma içeriğine çeviren yapay zekâ" lead="SinoAI hedef sınavı, seçilen konuları ve öğrencinin zayıf alanlarını bilir; içeriği buna göre üretir." footnote="Her içerik birimi en fazla iki adayla üretilir ve kalite kontrolünden geçer; öğrenciye her durumda gösterilebilir bir sonuç verilir.">
		<div style={{display: 'flex', gap: 60, flex: 1, alignItems: 'center'}}>
			<div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px 50px'}}>
				<Point icon="book" module="lessons" title="Konu üretimi" text="Seçtiğin ders ve konuya uygun açıklamalı çalışma içeriği." />
				<Point icon="quiz" module="tests" title="Quiz üretimi" text="Konu ve seviyene göre kısa pratik testler." />
				<Point icon="exam" module="exam" title="Deneme üretimi" text="Seçtiğin sınavın formatına uygun denemeler; 20 soru yaklaşık 2 dakikada." />
				<Point icon="cards" module="flashcards" title="Bilgi kartları" text="Konu bilgilerini tekrar edilebilir soru-cevap kartlarına dönüştürür." />
				<Point icon="scan" module="smartSummary" title="Kaynak analizi" text="Paylaştığın belge ve görselleri inceleyerek çalışma içeriğine dönüştürür." />
				<Point icon="calendar" module="studyPlan" title="Çalışma planı" text="Hedef ve sınav tarihine göre haftalık görevler." />
			</div>
			<Screen id="m-sino-calisma" width={300} crop={690} />
		</div>
	</Slide>
);

// 6 ---------------------------------------------------------------- difference
const Difference: React.FC = () => {
	const colors = useColors();
	const items = [
		{icon: 'layers' as const, title: 'Birbiriyle bağlantılı modüller', text: 'Deneme sonucundaki eksik konu, tek dokunuşla derse, teste ve plana gider.'},
		{icon: 'tree' as const, title: 'Konu düzeyinde takip', text: 'Ders, konu ve mikro konu ağacıyla çalışma önceliği belirlenir.'},
		{icon: 'sparkles' as const, title: 'Yapay zekâ desteği', text: 'SinoAI üretimleri öğrencinin hedefine ve seçtiği konulara göre kişiselleşir.'},
		{icon: 'globe' as const, title: 'Uluslararası genişleme yolu', text: 'Ortak altyapı; dil, müfredat ve sınav kuralları ülkeye göre eklenir.'},
	];
	return (
		<Slide index={6} eyebrow="Farkımız" title="Hazırlığın tamamı tek altyapıda" lead="Farkımız: konu öğrenimi, pratik, analiz ve planlamayı ortak altyapıda birleştirmek. Her yeni ülke için dil, müfredat ve içerik kalitesi ayrıca doğrulanır.">
			<div style={{display: 'flex', gap: 28, flex: 1}}>
				{items.map((item) => (
					<Panel key={item.title} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 24}}>
						<div style={{width: 84, height: 84, borderRadius: 24, background: colors.brandSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={item.icon} size={44} color={colors.brand} />
						</div>
						<Text role="title" size={32} style={{lineHeight: '40px'}}>
							{item.title}
						</Text>
						<Text role="body" size={23} style={{lineHeight: '34px'}}>
							{item.text}
						</Text>
					</Panel>
				))}
			</div>
			<Panel tone="soft" padding={30} style={{marginTop: 28, display: 'flex', gap: 22, alignItems: 'center'}}>
				<Icon name="shield" size={36} color={colors.brand} />
				<Text role="body" size={23} color={colors.ink} style={{lineHeight: '33px'}}>
					Yapay zekâ kullanımı paket bazında kurallarla sınırlıdır: öğrenci başına kullanım tavanı yönetim panelinden ayarlanır; kural eklemek veya değiştirmek için kod değişikliği gerekmez.
				</Text>
			</Panel>
		</Slide>
	);
};

// 7 ---------------------------------------------------------------- market
const Market: React.FC = () => {
	const share = targetShareOfApplicants();
	return (
		<Slide
			index={7}
			eyebrow="Pazar"
			title="Türkiye’de her yıl milyonlarca aday, global girişte SAT ve ACT"
			lead={`Değer, mevcut fiyatımızla (${tl(FACTS.priceTl.value, 2)} / ay) ${PREP_MONTHS} aylık hazırlık varsayımıyla hesaplandı. Kitleler toplanmaz.`}
			footnote={`Kaynaklar: ÖSYM 2026-YKS ve 2026-KPSS Ön Lisans başvuruları, ÖSYM 2025 yıl sonu açıklaması (AA, 31.12.2025), College Board 2025. Başvurular benzersiz kişi değildir. YKS başvuruları üç yıldır düşüyor (2024: 3,12 · 2025: 2,56 · 2026: 2,43 milyon); plan pazar büyümesine dayanmıyor. Kur: 1 $ = ${trNumber(USD_TRY, 1)} TL.`}
		>
			<div style={{display: 'flex', gap: 28}}>
				<Stat size={56} padding={34} value={`${trNumber(MARKET.yks2026.value / 1_000_000, 2)} milyon`} label="YKS 2026 başvurusu" note={`Fiyatımızla yıllık değer ≈ ${compact(audienceValueUsd(MARKET.yks2026.value), '$')}. ${trNumber(MARKET.yksFirstTime2026.value)} aday ilk kez giriyor.`} />
				<Stat size={56} padding={34} value={`${trNumber(MARKET.kpssOnLisans2026.value / 1_000_000, 2)} milyon`} label="KPSS Ön Lisans 2026 başvurusu" note={`Fiyatımızla yıllık değer ≈ ${compact(audienceValueUsd(MARKET.kpssOnLisans2026.value), '$')}. KPSS Lisans ve Ortaöğretim ayrıca.`} />
				<Stat size={56} padding={34} value="8 milyon+" label="ÖSYM sınav başvurusu (2025)" note="İlk ürün odağı: YKS ve KPSS." />
				<Stat size={56} padding={34} value="2 milyon+" label="SAT’ye giren öğrenci (2025)" note="SAT ve ACT kapsamı ürüne eklendi." />
			</div>
			<Panel tone="brand" padding={34} style={{marginTop: 28, display: 'flex', alignItems: 'center', gap: 50}}>
				<Text role="num" size={100} weight={800} color="#FFFFFF" style={{lineHeight: '110px'}}>
					{pct(share)}
				</Text>
				<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
					<Text role="title" size={36} color="#FFFFFF">
						Hedeflediğimiz pay küçük, büyümek için yer çok
					</Text>
					<Text role="body" size={24} color="rgba(255,255,255,0.9)" style={{lineHeight: '34px'}}>
						12 aylık planın {trNumber(Math.round(target.firstPayments / 100) * 100)} ilk ödemesi, bu yılki YKS ve KPSS Ön Lisans adaylarının yalnızca {pct(share)}’ü kadar. Plan, pazarın büyük bir payını almayı varsaymıyor.
					</Text>
				</div>
			</Panel>
		</Slide>
	);
};

// 8 ---------------------------------------------------------------- traction
const Traction: React.FC = () => {
	const colors = useColors();
	return (
		<Slide index={8} eyebrow="Çekiş" title="Ödeme alan, tekrar ödeme gören bir ürün" footnote="Google Play, Mayıs–25 Eylül 2026. Yenilemeler dahil. Tutarlar vergi dahil, mağaza kesintileri öncesi ve iadeler sonrasıdır. Büyümede fiyat artışının da etkisi vardır. App Store’un Mayıs–Ağustos mali raporlarındaki 1.496 TL dönem kazancı bu toplama dahil değildir.">
			<div style={{display: 'flex', gap: 56, flex: 1}}>
				<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 40, justifyContent: 'center'}}>
					<Point n={1} title={`${FACTS.playCharges.value} ödeme · ${FACTS.subscriptionSeries.value} abonelik serisi`} text={`Mayıs–25 Eylül döneminde Google Play’de ${FACTS.playCharges.value} abonelik tahsilatı gerçekleşti. ${FACTS.playRefunds.value} iade sonrasında ${tl(Math.round(FACTS.playNetChargesTl.value))} müşteri tahsilatı kaldı.`} size="lg" />
					<Point n={2} title="Aynı döneme göre %242 artış" text={`İade sonrası tahsilat 1–25 Ağustos’ta ${tl(Math.round(FACTS.augustNetTl.value))} iken 1–25 Eylül’de ${tl(Math.round(FACTS.septemberNetTl.value))}’ye ulaştı. Tahsilat adedi ${FACTS.augustCharges.value}’ten ${FACTS.septemberCharges.value}’a çıktı: %46 artış.`} size="lg" />
					<Point n={3} title={`${FACTS.repeatCharges.value} tekrar ödeme`} text={`${FACTS.secondPaymentSeries.value} seride ikinci, 6’sında üçüncü ödeme. 40 gün gözlenen 32 serinin 11’inde ikinci ödeme: ${pct(FACTS.secondMonthRenewal.value)}. Bu oran uzun vadeli aylık elde tutma değildir.`} size="lg" />
				</div>
				<Panel style={{width: 620, display: 'flex', flexDirection: 'column', gap: 20}}>
					<Text role="title" size={28}>
						Google Play’de iade sonrası tahsilat
					</Text>
					<Text role="small" size={19} color={colors.muted}>
						Eşit 25 günlük dönemler · TL
					</Text>
					<div style={{flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
						<BarPair
							height={520}
							items={[
								{label: '1–25 Ağustos', value: FACTS.augustNetTl.value, display: trNumber(Math.round(FACTS.augustNetTl.value))},
								{label: '1–25 Eylül', value: FACTS.septemberNetTl.value, display: trNumber(Math.round(FACTS.septemberNetTl.value)), strong: true},
							]}
						/>
					</div>
				</Panel>
			</div>
		</Slide>
	);
};

// 9 ---------------------------------------------------------------- acquisition
const Acquisition: React.FC = () => (
	<Slide index={9} eyebrow="Ölçülen edinme ekonomisi" title="Düşük bütçeyle ölçülmüş yükleme maliyeti" lead="Bugüne kadar reklamı yalnızca ölçmek için kullandık. Sıradaki adım, her ödemenin hangi kanaldan geldiğini bağlamak." footnote="Kaynak: Google Ads ve Google Play, 25.09.2026 kesimi. Yükleme ve maliyet tüm zamanlar Android kampanyasıdır; dönem harcaması 1 Haziran–25 Eylül içindir. Mağaza edinimi reklam yüklemelerine eklenmez. Haziran–Temmuz: 29 ilk ödeme / 3.106 yükleme = %0,934 dönem oranı; reklam dönüşümü değildir.">
		<div style={{display: 'flex', gap: 28}}>
			<Stat value={tl(FACTS.cpiTl.value, 2)} label="Yükleme başına maliyet · ölçüldü" note={`${tl(FACTS.androidSpendTl.value, 2)} reklam harcaması / ${trNumber(FACTS.androidInstalls.value)} Android yüklemesi.`} tone="brand" />
			<Stat value={trNumber(FACTS.androidInstalls.value)} label="Android yüklemesi" note="Google Ads Android uygulama kampanyası." />
			<Stat value={trNumber(FACTS.storeAcquisitions.value)} label="Google Play mağaza edinimi" note="1 Haziran–18 Eylül 2026." />
			<Stat value={pct(FACTS.firstPaymentRate.value, 3)} label="Yüklemeden ilk ödemeye" note="Haziran–Temmuz dönem oranı." />
		</div>
		<div style={{display: 'flex', gap: 28, marginTop: 30}}>
			<Panel style={{flex: 1}}>
				<Point n={1} title={`${compact(FACTS.periodAdSpendTl.value, 'TL')} dönem reklam harcaması`} text="1 Haziran–25 Eylül 2026’da tüm Google Ads kampanyaları. Planlanan bütçe bunun yaklaşık 230 katı; bu yüzden modelde yükleme maliyeti %50 artırıldı." />
			</Panel>
			<Panel style={{flex: 1}}>
				<Point n={2} title="İlk hedef: ödeme atfı" text="Kanal → ilk ödeme → yenileme. Kohort bazında ücretli müşteri maliyeti ve 90 günlük net gelir / maliyet takibi." />
			</Panel>
		</div>
	</Slide>
);

// 10 --------------------------------------------------------------- business model
const BusinessModel: React.FC = () => {
	const colors = useColors();
	return (
		<Slide index={10} eyebrow="İş modeli" title="Aylık abonelik, mağaza ve web’den" lead="Öğrenci sınavına göre paket seçer. Ücretsiz katman reklamla desteklenir; ücretli pakette tüm modüller ve SinoAI hakları açılır.">
			<div style={{display: 'flex', gap: 28}}>
				<Stat value={tl(FACTS.priceTl.value, 2)} label="Aylık paket fiyatı" note={`Vergi dahil (299,99 TL + KDV) ≈ ${trNumber(FACTS.priceTl.value / USD_TRY, 2)} $.`} tone="brand" />
				<Stat value={`${trNumber(NET_SHARE, 2)} TL`} label="Tahsil edilen her 1 TL’den kalan" note={`İadeler (${pct(FACTS.refundShare.value)}), KDV (%20) ve mağaza kesintisi (%15) sonrası.`} />
				<Stat value={`${trNumber(lifetimeNetPerAdDollar(SCENARIOS.target), 2)} $`} label="Hedef hunide 1 $ reklamın net getirisi" note={`Bugünkü hunide ${trNumber(lifetimeNetPerAdDollar(SCENARIOS.today), 2)} $. Abonelik ömrü boyunca, ${tl(SCALED_CPI_TL, 2)} yükleme maliyetiyle.`} />
			</div>
			<Panel style={{marginTop: 30, flex: 1, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Text role="title" size={30}>
					Gelir kaynakları
				</Text>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 30}}>
					{[
						{icon: 'card' as const, title: 'Sınav paketleri', text: 'YKS, KPSS Lisans, Ön Lisans ve Ortaöğretim. Bugünkü tahsilatın en büyük payı KPSS Lisans.'},
						{icon: 'googlePlay' as const, title: 'Mağaza ve web', text: 'Google Play, App Store ve web ödemesi. Web ödemesinde mağaza kesintisi yoktur.'},
						{icon: 'gift' as const, title: 'Reklamlı ücretsiz katman', text: 'Ücretsiz öğrenciler reklamla desteklenir; denemeye başlayan öğrenci pakete geçer.'},
					].map((item) => (
						<div key={item.title} style={{display: 'flex', gap: 18}}>
							<Icon name={item.icon} size={38} color={colors.brand} />
							<div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
								<Text role="headline" size={25}>
									{item.title}
								</Text>
								<Text role="body" size={21} style={{lineHeight: '31px'}}>
									{item.text}
								</Text>
							</div>
						</div>
					))}
				</div>
			</Panel>
		</Slide>
	);
};

// 11 --------------------------------------------------------------- 100k model
const AdModel: React.FC = () => {
	const colors = useColors();
	const months = target.months;
	return (
		<Slide index={11} eyebrow="Finansal projeksiyon" title="100 bin $ reklam, 12 ayda kendini geri öder" footnote={`Hedef huni: yüklemeden ilk ödemeye ${pct(SCENARIOS.target.firstPaymentRate)}, ikinci ay yenileme ${pct(SCENARIOS.target.secondMonthRenewal, 0)}, sonraki aylar ${pct(SCENARIOS.target.laterRenewal, 0)} · yükleme maliyeti ${tl(SCALED_CPI_TL, 2)} (ölçülenin 1,5 katı) · ${tl(FACTS.priceTl.value, 2)} fiyat · kur ${trNumber(USD_TRY, 1)}. Yalnız 12 ay içindeki tahsilat sayıldı. Şirket giderleri (ekip, altyapı, yapay zekâ kullanımı) hariçtir; net kâr değildir.`}>
			<div style={{display: 'flex', gap: 24}}>
				<Stat size={50} padding={28} value="100.000 $" label="Reklam bütçesi" note="3 test ayı × 4.000 $, sonra 9.778 $/ay" />
				<Stat size={50} padding={28} value={compact(target.installs)} label="Tahmini yükleme" note={`${tl(SCALED_CPI_TL, 2)} yükleme maliyetiyle`} />
				<Stat size={50} padding={28} value={trNumber(Math.round(target.firstPayments / 100) * 100)} label="Yeni ücretli abonelik" note="Benzersiz kişi doğrulanmadı" />
				<Stat size={50} padding={28} value={`+${usd(target.contributionUsd)}`} label="Reklam sonrası net katkı" note={`Birikimli başa baş: ${target.breakEvenMonth}. ay`} tone="brand" />
			</div>
			<div style={{display: 'flex', gap: 24, marginTop: 24, flex: 1}}>
				<Panel style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}} padding={28}>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
						<Text role="title" size={25}>
							Aylık satış ve reklam harcaması
						</Text>
						<Legend items={[{label: 'Brüt satış', color: colors.brand}, {label: 'Kesintiler sonrası', color: '#0F766E'}, {label: 'Reklam', color: colors.subtle, dashed: true}]} />
					</div>
					<LineChart
						width={1060}
						height={300}
						xLabels={months.map((row) => `${row.month}. ay`)}
						yStep={10000}
						yFormat={(value) => (value === 0 ? '0' : `${value / 1000} bin $`)}
						series={[
							{label: 'Brüt satış', values: months.map((row) => row.grossUsd), color: colors.brand, area: true},
							{label: 'Kesintiler sonrası', values: months.map((row) => row.netUsd), color: '#0F766E'},
							{label: 'Reklam', values: [...SPEND_PLAN_USD], color: colors.subtle, dashed: true},
						]}
					/>
					<Text role="small" size={18} color={colors.ink2}>
						12. ayda aylık brüt satış {usd(target.month12GrossUsd)} (yıllık koşu hızı ≈ {compact(target.month12GrossUsd * 12, '$')}). {trNumber(Math.round(target.payingIntoMonth13 / 100) * 100)} abone 13. aya ödemeye devam ediyor; bu gelir sayılmadı.
					</Text>
				</Panel>
				<Panel style={{width: 540}} padding={28}>
					<Text role="title" size={25} style={{marginBottom: 2}}>
						12 ay sonunda kalan tutar
					</Text>
					<Row label="Brüt satış" value={usd(target.grossUsd)} strong />
					<Row label="İadeler" value={`−${usd(target.refundsUsd)}`} />
					<Row label="KDV" value={`−${usd(target.vatUsd)}`} />
					<Row label="Mağaza kesintisi" value={`−${usd(target.storeFeeUsd)}`} />
					<Row label="Kesintiler sonrası gelir" value={usd(target.netUsd)} strong border />
					<Row label="Reklam harcaması" value="−100.000 $" />
					<Row label="Reklam sonrası katkı" value={`+${usd(target.contributionUsd)}`} strong border tone="positive" />
				</Panel>
			</div>
		</Slide>
	);
};

// 12 --------------------------------------------------------------- gating and sensitivity
const Gating: React.FC = () => {
	const colors = useColors();
	const rows = sensitivity([2.8, SCALED_CPI_TL, 5.6], [SCENARIOS.today, SCENARIOS.mid, SCENARIOS.target]);
	const head = [SCENARIOS.today, SCENARIOS.mid, SCENARIOS.target];
	return (
		<Slide index={12} eyebrow="Risk kontrolü" title="Bütçe, huni hedefi tuttukça açılır" lead="Reklamın tamamı bir kerede harcanmaz. Her kohortun 30 günlük net geliri ölçülür; eşik tutmazsa harcama test seviyesinde kalır." footnote="Tablo: 12 aylık reklam sonrası net katkı ($), 100 bin $ bütçe ve aynı kademeli plan. Şirket giderleri hariçtir. Yükleme maliyeti ölçekle artabilir; bu yüzden üç seviye gösterildi.">
			<div style={{display: 'flex', gap: 28, flex: 1}}>
				<div style={{width: 640, display: 'flex', flexDirection: 'column', gap: 22}}>
					{[
						{title: 'Ay 1–3 · test', text: 'Ayda 4.000 $. Kanal → ilk ödeme → yenileme bağlantısı kurulur.'},
						{title: 'Eşik', text: `Kohortun ilk 30 günlük net geliri yükleme maliyetini karşılıyorsa bütçe ayda 9.778 $’a çıkar.`},
						{title: 'Eşik tutmazsa', text: `Harcama 4.000 $’da kalır, kaynak ürüne gider. Bugünkü hunide 12 aylık en kötü sonuç, yalnız test bütçesiyle sınırlı kalır.`},
					].map((item, index) => (
						<Panel key={item.title} padding={30}>
							<Point n={index + 1} title={item.title} text={item.text} />
						</Panel>
					))}
				</div>
				<Panel style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}} padding={36}>
					<Text role="title" size={28} style={{marginBottom: 14}}>
						Duyarlılık: yükleme maliyeti × huni
					</Text>
					<div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', rowGap: 4}}>
						<Text role="headline" size={20} color={colors.muted}>
							Yükleme maliyeti
						</Text>
						{head.map((scenario) => (
							<div key={scenario.id} style={{display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'right'}}>
								<Text role="headline" size={22}>
									{scenario.label}
								</Text>
								<Text role="meta" size={16} color={colors.muted}>
									İlk ödeme {pct(scenario.firstPaymentRate, 2)} · 2. ay {pct(scenario.secondMonthRenewal, 0)}
								</Text>
							</div>
						))}
						{rows.map((row) => (
							<React.Fragment key={row.cpiTl}>
								<div style={{padding: '26px 0', borderTop: `2px solid ${colors.line}`}}>
									<Text role="headline" size={26}>
										{tl(row.cpiTl, 2)}
									</Text>
									<Text role="meta" size={16} color={colors.muted}>
										{row.cpiTl === 2.8 ? 'Bugün ölçülen' : row.cpiTl === SCALED_CPI_TL ? 'Plan varsayımı' : 'Kötümser'}
									</Text>
								</div>
								{row.values.map((cell) => {
									const strong = row.cpiTl === SCALED_CPI_TL && cell.id === 'target';
									return (
										<div key={cell.id} style={{padding: '26px 0', borderTop: `2px solid ${colors.line}`, textAlign: 'right', background: strong ? colors.brandWash : undefined, borderRadius: strong ? 12 : 0}}>
											<Text role="num" size={30} weight={800} color={cell.contributionUsd >= 0 ? colors.success : colors.error} style={{paddingRight: strong ? 12 : 0}}>
												{kUsd(cell.contributionUsd)}
											</Text>
										</div>
									);
								})}
							</React.Fragment>
						))}
					</div>
					<div style={{flex: 1}} />
					<Text role="small" size={19} color={colors.ink2} style={{lineHeight: '28px'}}>
						Bugünkü huniyle ölçekte reklam tek başına kâr etmiyor ({kUsd(today.contributionUsd)}); bugünkü yükleme maliyetinde ise artıda ({kUsd(sensitivity([2.8], [SCENARIOS.today])[0].values[0].contributionUsd)}). Kâr, huniyi hedefe taşıyan ürün adımlarından geliyor; eşik kuralı bunun gerçekleşmediği durumda kaybı sınırlar.
					</Text>
				</Panel>
			</div>
		</Slide>
	);
};

// 13 --------------------------------------------------------------- funnel plan
const FunnelPlan: React.FC = () => {
	const colors = useColors();
	const rows = [
		{label: 'Yüklemeden ilk ödemeye', from: FACTS.firstPaymentRate.value, to: SCENARIOS.target.firstPaymentRate, digits: 2, how: 'Hedef net ve sınav tarihiyle kişisel plan, ardından 3 gün ücretsiz deneme. Ödeme ekranı değer görüldükten sonra gelir.', screen: 'm-onb-5-plan'},
		{label: 'İkinci ay yenileme', from: FACTS.secondMonthRenewal.value, to: SCENARIOS.target.secondMonthRenewal, digits: 1, how: 'Günlük plan görevleri, deneme sonrası eksik konu rotası ve SinoAI kişisel üretimleri öğrenciyi her gün geri getirir.', screen: 'm-plan-bugun'},
	];
	return (
		<Slide index={13} eyebrow="Huniyi büyütecek ürün adımları" title="İki metrik, iki ürün yatırımı" lead="Yeni onboarding, ders planı ve SinoAI üretim altyapısı yayına hazırlanıyor. Yatırımın ürün kısmı bu iki oranı doğrudan hedefler.">
			<div style={{display: 'flex', gap: 28, flex: 1}}>
				{rows.map((row) => (
					<Panel key={row.label} style={{flex: 1, display: 'flex', gap: 34}} padding={36}>
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 22}}>
							<Text role="title" size={30}>
								{row.label}
							</Text>
							<div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
								<Text role="num" size={56} weight={800} color={colors.muted}>
									{pct(row.from, row.digits)}
								</Text>
								<Icon name="right" size={40} color={colors.brand} />
								<Text role="num" size={72} weight={800} color={colors.brand}>
									{pct(row.to, row.digits === 2 ? 1 : 0)}
								</Text>
							</div>
							<Text role="small" size={19} color={colors.muted}>
								Ölçülen → hedef
							</Text>
							<Text role="body" size={23} style={{lineHeight: '34px'}}>
								{row.how}
							</Text>
						</div>
						<Screen id={row.screen} width={250} crop={620} />
					</Panel>
				))}
			</div>
		</Slide>
	);
};

// 14 --------------------------------------------------------------- global path
const GlobalPath: React.FC = () => {
	const colors = useColors();
	const steps = [
		{tag: 'Gerçekleşti', title: 'Türkiye’de ürün ve ilk satışlar', text: 'iOS, Android ve web ürünü; ölçülen edinme maliyeti ve tekrarlayan ödemeler.', done: true},
		{tag: 'Ürüne eklendi', title: 'SAT ve ACT kapsamı', text: 'Uluslararası sınav hazırlığı için ürün kapsamının genişletilmesi.', done: true},
		{tag: 'Sonraki doğrulama', title: 'ABD’de ücretli talep', text: 'İngilizce içerik kalitesi ve sınav uyumu; sınav bazlı tanıtım sayfaları, fiyat ve reklam testleri.'},
		{tag: 'Koşullu büyüme', title: 'Veriye göre genişleme', text: 'İlk ödeme ve yenileme sonuçlarına göre bütçeyi büyütme; ardından yeni sınav ve ülkeler.'},
	];
	return (
		<Slide index={14} eyebrow="Ölçeklenebilir" title="Globalleşmenin ürün adımı atıldı" lead="Ortak öğrenme altyapısını ülkeye özgü içerik ve sınav kurallarıyla genişletiyoruz. Sıradaki hedef, ABD’de sürdürülebilir ücretli talebi doğrulamak." footnote="ABD kampanyalarında henüz harcama ve yükleme yok; bu pazarda ticari doğrulama yapıldığı iddia edilmiyor.">
			<div style={{display: 'flex', gap: 24, alignItems: 'stretch'}}>
				{steps.map((step, index) => (
					<Panel key={step.title} tone={step.done ? 'card' : 'soft'} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 22}}>
						<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
							<Text role="num" size={54} weight={800} color={step.done ? colors.brand : '#FDBA74'}>
								{String(index + 1).padStart(2, '0')}
							</Text>
							<div style={{padding: '8px 18px', borderRadius: 999, background: step.done ? colors.successSoft : colors.card}}>
								<Text role="headline" size={18} color={step.done ? colors.success : colors.brand}>
									{step.tag}
								</Text>
							</div>
						</div>
						<Text role="title" size={32} style={{lineHeight: '40px'}}>
							{step.title}
						</Text>
						<Text role="body" size={22} style={{lineHeight: '33px'}}>
							{step.text}
						</Text>
					</Panel>
				))}
			</div>
			<Panel tone="ink" style={{marginTop: 28, display: 'flex', alignItems: 'center', gap: 44}} padding={36}>
				<Icon name="layers" size={56} color="#FB923C" />
				<div style={{display: 'flex', flexDirection: 'column', gap: 8, flex: 1}}>
					<Text role="title" size={32} color="#FFFFFF">
						Tek altyapı, yeni sınav = içerik + sınav kuralı
					</Text>
					<Text role="body" size={22} color="rgba(255,255,255,0.8)" style={{lineHeight: '32px'}}>
						Yedi modül, Generations üretim hattı ve SinoAI her sınavda aynı kalır. Yeni bir sınav için müfredat, soru formatı ve dil eklenir; arayüz bugün Türkçe ve İngilizce.
					</Text>
				</div>
			</Panel>
		</Slide>
	);
};

// 15 --------------------------------------------------------------- the ask
const Ask: React.FC = () => {
	const colors = useColors();
	const uses = [
		{amount: '40 bin $', title: 'Ürün', text: 'Generations, SinoAI ve ödeme ölçümü'},
		{amount: '25 bin $', title: 'Yapay zekâ', text: 'Bulut, model kullanımı ve maliyet optimizasyonu'},
		{amount: '20 bin $', title: 'Kalite', text: 'İçerik doğrulama ve yerelleştirme'},
		{amount: '15 bin $', title: 'Diğer', text: 'Operasyon, hukuk ve ihtiyat payı'},
	];
	const roadmap = [
		{months: 'Ay 1–3', text: 'Ödeme atfı ve kohort takibi'},
		{months: 'Ay 4–6', text: 'ABD’de fiyat ve içerik testi'},
		{months: 'Ay 7–9', text: 'Ücretli talep ve yenileme'},
		{months: 'Ay 10–12', text: 'Veri uygunsa yeni pazar'},
	];
	return (
		<Slide index={15} eyebrow="Yatırım talebi" title="200 bin $: 100 bin $ reklam + 100 bin $ ürün ve altyapı" lead="Önerilen 12 aylık plan. Aylık ortalama toplam bütçe 16.667 $; harcama, eşik kuralına bağlı kademeli açılır." footnote="Dağılım önerilen plandır, gerçekleşmiş gider değildir. Reklam modeli şirket giderlerini kapsamaz.">
			<div style={{display: 'flex', gap: 28}}>
				<Panel tone="brand" style={{width: 560, display: 'flex', flexDirection: 'column', gap: 18}}>
					<Icon name="trend" size={50} color="#FFFFFF" />
					<Text role="num" size={76} weight={800} color="#FFFFFF">
						100 bin $
					</Text>
					<Text role="title" size={30} color="#FFFFFF">
						Kademeli reklam
					</Text>
					<Text role="body" size={22} color="rgba(255,255,255,0.9)" style={{lineHeight: '32px'}}>
						Hedef hunide 12 ayda +{compact(target.contributionUsd, '$')} net katkı ve {trNumber(Math.round(target.firstPayments / 100) * 100)} ilk ödeme. Kişi sayısı garantisi değildir.
					</Text>
				</Panel>
				<div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}>
					{uses.map((use) => (
						<Panel key={use.title} padding={30} style={{display: 'flex', flexDirection: 'column', gap: 10}}>
							<Text role="num" size={44} weight={800} color={colors.brand}>
								{use.amount}
							</Text>
							<Text role="title" size={26}>
								{use.title}
							</Text>
							<Text role="body" size={21}>
								{use.text}
							</Text>
						</Panel>
					))}
				</div>
			</div>
			<div style={{display: 'flex', gap: 0, marginTop: 34, alignItems: 'center'}}>
				{roadmap.map((step, index) => (
					<React.Fragment key={step.months}>
						<div style={{flex: 1, display: 'flex', gap: 18, alignItems: 'center', padding: '22px 26px', borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`}}>
							<Text role="headline" size={22} color={colors.brand} style={{whiteSpace: 'nowrap'}}>
								{step.months}
							</Text>
							<Text role="body" size={21} color={colors.ink}>
								{step.text}
							</Text>
						</div>
						{index < roadmap.length - 1 ? <Icon name="right" size={34} color={colors.subtle} style={{margin: '0 6px'}} /> : null}
					</React.Fragment>
				))}
			</div>
		</Slide>
	);
};

// 16 --------------------------------------------------------------- close
const Close: React.FC = () => {
	const colors = useColors();
	return (
		<Slide index={16} background={colors.ink} dark>
			<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 90}}>
				<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 30}}>
					<Text role="over" size={22} weight={800} color="#FB923C" style={{letterSpacing: '0.14em'}}>
						Birlikte global
					</Text>
					<Text role="display" size={84} color="#FFFFFF" style={{lineHeight: '94px'}}>
						Sınav hazırlığını ölçerek büyütelim
					</Text>
					<Text role="body" size={30} color="rgba(255,255,255,0.85)" style={{lineHeight: '44px', maxWidth: 980}}>
						200 bin $ yatırım: mobil büyüme, abonelik optimizasyonu ve SAT/ACT ile uluslararası açılım ortaklığı.
					</Text>
					<div style={{display: 'flex', gap: 24, alignItems: 'center', marginTop: 10}}>
						<div style={{width: 92, height: 92, borderRadius: 46, background: colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Text role="title" size={34} color="#FFFFFF">
								OE
							</Text>
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
							<Text role="title" size={32} color="#FFFFFF">
								Onur Eymen Coşkun
							</Text>
							<Text role="body" size={22} color="rgba(255,255,255,0.75)">
								Kurucu ve geliştirici · backend, mobil, web ve reklam
							</Text>
						</div>
					</div>
					<Contact dark />
				</div>
				<Screen id="m-sino-ana" width={360} crop={780} />
			</div>
		</Slide>
	);
};

export const PITCH_DECK_SLIDES: readonly React.FC[] = [Cover, Problem, Solution, Product, SinoAI, Difference, Market, Traction, Acquisition, BusinessModel, AdModel, Gating, FunnelPlan, GlobalPath, Ask, Close];
