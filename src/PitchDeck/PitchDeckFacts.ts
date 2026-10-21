/**
 * The investor deck's evidence: every number on a slide comes from here or from
 * PitchDeckModel.ts, which computes from here. Each value carries its source and
 * the limit of what it proves (docs/PitchDeck/Veri-ve-Kaynaklar.md), so a slide
 * never claims more than the report behind it.
 *
 * Cut-off: store and Google Ads exports of 25 September 2026.
 */
export type Fact = {value: number; source: string; note?: string};

const fact = (value: number, source: string, note?: string): Fact => ({value, source, note});

export const FACTS = {
	/** Google Ads, App promotion-App-android, all time. */
	androidInstalls: fact(6399, 'Google Ads · Android uygulama kampanyası · tüm zamanlar'),
	androidSpendTl: fact(17936.96, 'Google Ads · Android uygulama kampanyası · tüm zamanlar'),
	/** 17.936,96 / 6.399. An install cost, not a paying-customer cost (CAC). */
	cpiTl: fact(2.8031, 'Google Ads · 17.936,96 TL / 6.399 yükleme', 'Yükleme başına maliyet; ücretli müşteri maliyeti (CAC) değildir.'),
	/** 1 June – 25 September 2026, every Google Ads campaign. */
	periodAdSpendTl: fact(21381.79, 'Google Ads · haftalık genel bakış · 1 Haziran–25 Eylül 2026'),
	/** Google Play store acquisitions, 1 June – 18 September 2026. */
	storeAcquisitions: fact(7542, 'Google Play Console · mağaza edinimi · 1 Haziran–18 Eylül 2026', 'Reklam yüklemelerine eklenmez.'),
	/** Google Play charges May – 25 September 2026, renewals included. */
	playCharges: fact(69, 'Google Play satış raporu · Mayıs–25 Eylül 2026', 'Yenilemeler dahil; 69 benzersiz müşteri değildir.'),
	playRefunds: fact(7, 'Google Play satış raporu · Mayıs–25 Eylül 2026'),
	playNetChargesTl: fact(11039.38, 'Google Play satış raporu · iade sonrası müşteri tahsilatı', 'Vergi dahil, mağaza kesintisi öncesi.'),
	augustNetTl: fact(1439.88, 'Google Play · 1–25 Ağustos 2026 iade sonrası tahsilat'),
	septemberNetTl: fact(4919.83, 'Google Play · 1–25 Eylül 2026 iade sonrası tahsilat'),
	augustCharges: fact(13, 'Google Play · 1–25 Ağustos 2026 tahsilat işlemi'),
	septemberCharges: fact(19, 'Google Play · 1–25 Eylül 2026 tahsilat işlemi'),
	/** 51 order series: 12 with a second charge, 6 of them with a third. */
	subscriptionSeries: fact(51, 'Google Play · sipariş numarası kökleri'),
	secondPaymentSeries: fact(12, 'Google Play · ikinci ödemesi olan seri'),
	repeatCharges: fact(18, 'Google Play · ilk ödemenin ötesindeki tahsilat'),
	/** 11 of the 32 series watched for 40 days paid a second time. */
	secondMonthRenewal: fact(11 / 32, 'Google Play · 40 gün gözlenen 32 serinin 11’i', 'Uzun vadeli aylık elde tutma değildir.'),
	/** June–July: 29 first payments / 3.106 installs. A period ratio, not ad attribution. */
	firstPaymentRate: fact(29 / 3106, 'Google Play · Haziran–Temmuz 29 ilk ödeme / 3.106 yükleme', 'Dönem oranı; reklam atfı değildir.'),
	/** Refunded share of charged amount, May – 25 September. */
	refundShare: fact(1559.93 / 12599.31, 'Google Play · iade tutarı / tahsilat tutarı'),
	/** Current price, VAT included (Item Price 299,99 TL + VAT). */
	priceTl: fact(359.99, 'Google Play · Eylül 2026 abonelik fiyatı (vergi dahil)'),
	iosEarnedTl: fact(1496.1, 'App Store Connect finans raporları · Mayıs–Ağustos 2026', 'Google Play toplamına eklenmez.'),
	iosUnits: fact(21, 'App Store Connect finans raporları · Mayıs–Ağustos 2026'),
} as const;

/** Rates the model applies to every lira charged; all from Turkey's rules or the store's terms. */
export const DEDUCTIONS = {
	vat: 0.2,
	/** Google Play / App Store subscription fee. */
	storeFee: 0.15,
} as const;

/** One TL/USD rate for the whole deck: the rate the earlier model used (2,80 TL = 0,0573 $). */
export const USD_TRY = 48.9;

/** Exam markets. Applications are not unique people; audiences are never added up into one TAM. */
export const MARKET = {
	yks2026: fact(2425560, 'ÖSYM · 2026-YKS başvurusu (YÖK açıklaması, Haziran 2026)', 'Üç yıldır düşüyor: 2025’te 2.560.649.'),
	yksFirstTime2026: fact(921225, 'ÖSYM · 2026-YKS ilk kez başvuran'),
	kpssOnLisans2026: fact(1593198, 'ÖSYM · 2026-KPSS Ön Lisans başvurusu'),
	osymApplications2025: fact(8000000, 'ÖSYM 2025 yıl sonu açıklaması (AA, 31.12.2025)', 'Başvurular benzersiz kişi değildir.'),
	satTakers2025: fact(2000000, 'College Board · 2025 mezun grubu SAT raporu'),
} as const;
