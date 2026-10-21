/**
 * Exports the Apple Ads set (src/Ads/Apple/AppleAdsPlan.ts) for the Apple Ads Advanced account.
 *
 *   npm run apple-ads                       (to Desktop\Sinavika-AppleAds, store shots from Desktop\MobileHeader)
 *   npm run apple-ads -- --out <dir> --store <MobileHeader dir>
 *
 * <out>/README.md                                  campaigns, budgets, setup steps
 * <out>/<tr|en>/kampanya.md                        one campaign: ad groups, bids, keywords
 * <out>/<tr|en>/anahtar-kelimeler/<group>.csv       Keyword, Match Type, Bid (Apple Ads keyword upload)
 * <out>/<tr|en>/negatif-kelimeler.csv              Keyword, Match Type (campaign negatives)
 * <out>/<tr|en>/ozel-urun-sayfasi/<exam>/           custom product page: screenshots in the page order + tanitim-metni.txt
 */
import {copyFile, mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {APPLE_CAMPAIGNS, CUSTOM_PRODUCT_PAGES, type AppleCampaign} from '../src/Ads/Apple/AppleAdsPlan';
import {toCsv} from '../src/Ads/Google/SearchExport';

const desktop = path.join(process.env.USERPROFILE ?? '', 'Desktop');
const {values} = parseArgs({
	options: {
		out: {type: 'string', default: path.join(desktop, 'Sinavika-AppleAds')},
		store: {type: 'string', default: path.join(desktop, 'MobileHeader')},
	},
});
const out = values.out as string;
const store = values.store as string;

/** Device folders a custom product page needs, from the store set. */
const DEVICE_FOLDERS = ['iphone-6.3', 'iphone-6.1', 'ipad-13-inc-2064x2752'] as const;

const slug = (text: string) =>
	text
		.toLocaleLowerCase('tr')
		.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const matchLabel = {EXACT: 'Exact', BROAD: 'Broad'} as const;

const campaignMarkdown = (campaign: AppleCampaign) => {
	const lines = [
		`# ${campaign.name}`,
		'',
		`- Tür: Arama sonuçları (Search Results)`,
		`- Ülke: ${campaign.country}`,
		`- Günlük bütçe: $${campaign.dailyBudget}`,
		`- Negatif kelimeler (kampanya, tam eşleme): ${campaign.negatives.length} adet, \`negatif-kelimeler.csv\``,
		'',
		'| Reklam grubu | Eşleme | Search Match | Varsayılan teklif (dokunma başı, en fazla) | Kelime |',
		'|---|---|---|---|---|',
		...campaign.adGroups.map((group) => `| ${group.name} | ${matchLabel[group.match]} | ${group.searchMatch ? 'Açık' : 'Kapalı'} | $${group.defaultBid.toFixed(2)} | ${group.keywords.length} |`),
		'',
	];
	for (const group of campaign.adGroups) lines.push(`## ${group.name}`, '', group.keywords.map((keyword) => `\`${keyword}\``).join(' · '), '');
	return lines.join('\n');
};

const README = `# Sınavika Apple Ads seti

Apple Ads Advanced hesabı için. Kaynak: video motorunda \`src/Ads/Apple/AppleAdsPlan.ts\`, yeniden üretmek için \`npm run apple-ads\`.

## Kampanyalar

${APPLE_CAMPAIGNS.map((campaign) => `- **${campaign.name}**: ${campaign.country}, arama sonuçları, günlük $${campaign.dailyBudget}. Reklam grupları: ${campaign.adGroups.map((group) => group.name).join(', ')}.`).join('\n')}

Sınav grupları yalnız tam eşleme kullanır, Search Match kapalıdır. Keşif grubu geniş eşleme ve Search Match ile yeni aramaları bulur. Arama terimleri raporunda iyi çalışan terimleri ilgili sınav grubuna tam eşleme olarak taşı, kötüleri negatife ekle.

Teklifler başlangıç değeridir (dokunma başı en fazla). ABD'de SAT/ACT aramaları pahalı olduğu için $10'lık bütçe günde birkaç dokunma getirir; ilk hafta arama terimlerine göre ayarla.

## Klasörler

- \`tr/\`, \`en/\`: her pazarın \`kampanya.md\` özeti, \`anahtar-kelimeler/<grup>.csv\` (Keyword, Match Type, Bid) ve \`negatif-kelimeler.csv\`.
- \`<pazar>/ozel-urun-sayfasi/<sınav>/\`: sınava özel ürün sayfası. Ekran görüntüleri mağaza setinin bu sınava göre sıralanmış hali (\`iphone-6.3\`, \`iphone-6.1\`, \`ipad-13-inc-2064x2752\`), \`tanitim-metni.txt\` 170 karakterlik tanıtım metni.

## Özel ürün sayfaları

Apple Ads reklamı App Store ürün sayfasındaki görselleri kullanır; ayrı bir reklam görseli yüklenmez. Sınava özel görünüm için:

1. App Store Connect › Uygulama › Özel Ürün Sayfaları › yeni sayfa. Adı klasördeki \`tanitim-metni.txt\` içinde yazıyor.
2. Ekran görüntülerini klasördeki sırayla yükle, tanıtım metnini gir, incelemeye gönder.
3. Onaylanınca Apple Ads › reklam grubu › Reklamlar › Reklam oluştur › bu sayfayı seç.

Onaylanana kadar reklamlar varsayılan ürün sayfasını gösterir; kampanyalar bunu beklemeden çalışır.
`;

const main = async () => {
	await rm(out, {recursive: true, force: true});
	await writeFile(path.join(await ensure(out), 'README.md'), README);

	for (const campaign of APPLE_CAMPAIGNS) {
		const market = await ensure(path.join(out, campaign.market));
		await writeFile(path.join(market, 'kampanya.md'), campaignMarkdown(campaign));
		await writeFile(path.join(market, 'negatif-kelimeler.csv'), toCsv(['Keyword', 'Match Type'], campaign.negatives.map((keyword) => ({Keyword: keyword, 'Match Type': 'Exact'}))));
		const keywords = await ensure(path.join(market, 'anahtar-kelimeler'));
		for (const group of campaign.adGroups) {
			const rows = group.keywords.map((keyword) => ({Keyword: keyword, 'Match Type': matchLabel[group.match], Bid: group.defaultBid.toFixed(2)}));
			await writeFile(path.join(keywords, `${slug(group.name)}.csv`), toCsv(['Keyword', 'Match Type', 'Bid'], rows));
		}
	}

	for (const page of CUSTOM_PRODUCT_PAGES) {
		const folder = await ensure(path.join(out, page.market, 'ozel-urun-sayfasi', page.exam));
		await writeFile(path.join(folder, 'tanitim-metni.txt'), `Sayfa adı: ${page.name}\n\nTanıtım metni (${page.promotionalText.length}/170):\n${page.promotionalText}\n`);
		for (const device of DEVICE_FOLDERS) {
			const target = await ensure(path.join(folder, device));
			for (const [index, file] of page.screenshots.entries()) {
				const name = `${String(index + 1).padStart(2, '0')}-${file.replace(/^\d+-/, '')}`;
				await copyFile(path.join(store, page.market, 'ios', device, file), path.join(target, name));
			}
		}
	}
	console.log(`Apple Ads seti: ${out}`);
};

const ensure = async (dir: string) => {
	await mkdir(dir, {recursive: true});
	return dir;
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
