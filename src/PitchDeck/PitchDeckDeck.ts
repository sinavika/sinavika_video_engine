import {FACTS, MARKET} from './PitchDeckFacts';
import {NET_SHARE, runModel, SCENARIOS, targetShareOfApplicants} from './PitchDeckModel';

/**
 * Node-safe pieces of the deck (no React, no CSS): composition id, page count
 * and speaker notes, so the export script can read them without the browser bundle.
 */
export const PITCH_DECK_ID = 'PitchDeckSlide';
export const PITCH_DECK_PAGE_COUNT = 16;

const target = runModel(SCENARIOS.target);
const today = runModel(SCENARIOS.today);
const trNumber = (value: number, digits = 0): string => value.toLocaleString('tr-TR', {minimumFractionDigits: digits, maximumFractionDigits: digits});
const pct = (value: number, digits = 1) => `%${trNumber(value * 100, digits)}`;
const usd = (value: number): string => `${value < 0 ? '−' : ''}${trNumber(Math.abs(Math.round(value)))} $`;

/** Speaker notes per page, in slide order. */
export const PITCH_DECK_NOTES: readonly string[] = [
	'Sınavika: YKS ve KPSS’de çalışan, ödeme alan bir yapay zekâ destekli sınav hazırlık platformu. Bugün 200 bin $ yatırımla ölçerek büyümeyi anlatacağım.',
	'Problem: kaynaklar dağınık, deneme sonucu bir sonraki adıma dönüşmüyor, her sınavın ihtiyacı farklı.',
	'Çözüm: öğren, uygula ve ölç, yönlendir. Eksik konu derse, teste ve plana bağlanır.',
	'Yedi modül tek hesapta ve aynı konu ağacında. Ekranlar uygulamanın güncel tasarımından.',
	'SinoAI: seçilen konular ve zayıf alanlar merkezde; her içerik iki adaya kadar üretilip kalite kontrolünden geçer.',
	'Fark: bağlantılı modüller, konu düzeyinde takip, kişiselleşen yapay zekâ, kuralla sınırlanan yapay zekâ maliyeti.',
	`Pazar: YKS 2026 ${trNumber(MARKET.yks2026.value)}, KPSS Ön Lisans ${trNumber(MARKET.kpssOnLisans2026.value)} başvuru. Plan, bu adayların ${pct(targetShareOfApplicants())}’üne denk geliyor; başvurular benzersiz kişi değildir.`,
	'Çekiş: 69 Google Play tahsilatı, 11.039 TL iade sonrası tahsilat, eşit 25 günlük dönemde %242 artış, 18 tekrar ödeme. Fiyat artışının da etkisi var.',
	'Edinme: 2,80 TL yükleme maliyeti ölçüldü; ücretli müşteri maliyeti henüz ölçülmedi. İlk hedef ödeme atfı.',
	`İş modeli: ${`${trNumber(FACTS.priceTl.value, 2)} TL`} aylık paket; her 1 TL tahsilattan ${trNumber(NET_SHARE, 2)} TL kalıyor.`,
	`100 bin $ reklam, hedef hunide 12 ayda ${usd(target.netUsd)} kesintiler sonrası gelir ve +${usd(target.contributionUsd)} katkı bırakır; birikimli başa baş ${target.breakEvenMonth}. ay. Şirket giderleri hariç.`,
	`Eşik kuralı: test bütçesi 3 ay; kohort geri ödemiyorsa harcama artmaz. Bugünkü hunide ölçekte ${usd(today.contributionUsd)} olurdu; bu yüzden huni hedefi şart.`,
	'Huniyi taşıyan ürün adımları: kişisel plan + 3 gün ücretsiz deneme ile ilk ödeme, plan ve SinoAI ile yenileme.',
	'Global yol: Türkiye gerçekleşti, SAT/ACT ürüne eklendi; ABD talebi sıradaki doğrulama.',
	'Talep: 200 bin $; 100 bin $ kademeli reklam, 100 bin $ ürün, yapay zekâ, kalite ve operasyon.',
	'Kapanış: ölçerek büyüyen bir sınav hazırlık platformu için ortak arıyoruz.',
];
