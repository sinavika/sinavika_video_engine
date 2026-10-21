/**
 * Turns the search plan into files the Google Ads account can take in:
 *
 * - `google-ads-editor-arama.csv`: one Google Ads Editor import (Hesap › İçe aktar › Dosyadan)
 *   with campaigns, ad groups, keywords, campaign negatives and the responsive search ads.
 *   Column names are Editor's English names, which every Editor language reads. Everything is paused.
 * - `site-baglantilari.csv`, `ek-aciklamalar.csv`, `yapilandirilmis-snippet.csv`: the assets, added in
 *   the Ads interface (Öğeler) or in Editor; they are kept apart because Editor's asset columns differ by version.
 * - `negatif-kelimeler.txt`: the same negatives as a list to paste into a shared negative keyword list.
 */
import {CALLOUTS, headlinesFor, NEGATIVE_KEYWORDS, SEARCH_CAMPAIGNS, SITELINKS, SNIPPET, type SearchCampaign} from './SearchPlan';

const HEADLINE_COLUMNS = Array.from({length: 15}, (_, i) => `Headline ${i + 1}`);
const DESCRIPTION_COLUMNS = Array.from({length: 4}, (_, i) => `Description ${i + 1}`);

export const EDITOR_COLUMNS = [
	'Campaign',
	'Campaign Type',
	'Networks',
	'Budget',
	'Budget type',
	'Bid Strategy Type',
	'Campaign Status',
	'Languages',
	'Location',
	'Ad Group',
	'Ad Group Status',
	'Max CPC',
	'Keyword',
	'Criterion Type',
	'Ad type',
	'Status',
	'Final URL',
	...HEADLINE_COLUMNS,
	...DESCRIPTION_COLUMNS,
	'Path 1',
	'Path 2',
] as const;

type Row = Partial<Record<(typeof EDITOR_COLUMNS)[number], string>>;

const csvCell = (text: string) => (/[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);
export const toCsv = (columns: readonly string[], rows: Record<string, string | undefined>[]): string =>
	`﻿${[columns.join(','), ...rows.map((row) => columns.map((column) => csvCell(row[column] ?? '')).join(','))].join('\r\n')}\r\n`;

const campaignRows = (campaign: SearchCampaign): Row[] => {
	const rows: Row[] = [
		{
			Campaign: campaign.name,
			'Campaign Type': 'Search',
			Networks: 'Google search',
			Budget: campaign.dailyBudget.toFixed(2),
			'Budget type': 'Daily',
			'Bid Strategy Type': 'Maximize clicks',
			'Campaign Status': 'Enabled',
			Languages: 'tr',
		},
		{Campaign: campaign.name, Location: 'Turkey'},
	];
	for (const negative of NEGATIVE_KEYWORDS) rows.push({Campaign: campaign.name, Keyword: negative.keyword, 'Criterion Type': 'Negative Phrase'});
	for (const group of campaign.groups) {
		rows.push({Campaign: campaign.name, 'Ad Group': group.name, 'Ad Group Status': 'Enabled', 'Max CPC': campaign.maxCpc.toFixed(2)});
		for (const keyword of group.keywords) {
			rows.push({Campaign: campaign.name, 'Ad Group': group.name, Keyword: keyword, 'Criterion Type': 'Phrase', 'Final URL': group.landing});
			rows.push({Campaign: campaign.name, 'Ad Group': group.name, Keyword: keyword, 'Criterion Type': 'Exact', 'Final URL': group.landing});
		}
		const ad: Row = {Campaign: campaign.name, 'Ad Group': group.name, 'Ad type': 'Responsive search ad', Status: 'Enabled', 'Final URL': group.landing, 'Path 1': group.paths[0], 'Path 2': group.paths[1]};
		headlinesFor(campaign, group).forEach((text, i) => (ad[HEADLINE_COLUMNS[i] as keyof Row] = text));
		campaign.descriptions.forEach((text, i) => (ad[DESCRIPTION_COLUMNS[i] as keyof Row] = text));
		rows.push(ad);
	}
	return rows;
};

export const buildEditorCsv = (): string => toCsv(EDITOR_COLUMNS, SEARCH_CAMPAIGNS.flatMap(campaignRows));

export const buildSitelinksCsv = (): string =>
	toCsv(['Site bağlantısı metni', 'Açıklama satırı 1', 'Açıklama satırı 2', 'Nihai URL'], SITELINKS.map((link) => ({'Site bağlantısı metni': link.text, 'Açıklama satırı 1': link.line1, 'Açıklama satırı 2': link.line2, 'Nihai URL': link.url})));

export const buildCalloutsCsv = (): string => toCsv(['Ek açıklama metni'], CALLOUTS.map((text) => ({'Ek açıklama metni': text})));

export const buildSnippetCsv = (): string => toCsv(['Başlık', 'Değerler'], [{Başlık: SNIPPET.header, Değerler: SNIPPET.values.join('; ')}]);

export const buildNegativeList = (): string => `${NEGATIVE_KEYWORDS.map((negative) => `"${negative.keyword}"`).join('\r\n')}\r\n`;

/** The human-readable plan written next to the CSVs. */
export const buildSearchMarkdown = (): string => {
	const lines: string[] = [
		'# Arama kampanyaları',
		'',
		'Kaynak: `src/Ads/Google/SearchPlan.ts`. Hepsi **duraklatılmış** gelir; bütçeyi sen açarsın.',
		'',
		'Teklif: dönüşüm (kayıt) Ads’e gelene kadar **Maksimum tıklama** ve TBM sınırı; kayıt dönüşümü 30 günde 30’u geçince **Maksimum dönüşüm**e geç.',
		'',
	];
	for (const campaign of SEARCH_CAMPAIGNS) {
		lines.push(`## ${campaign.name}`, '', `Önerilen günlük bütçe: ₺${campaign.dailyBudget} · TBM sınırı: ₺${campaign.maxCpc}`, '');
		lines.push('| Reklam grubu | Açılış sayfası | Anahtar kelimeler (sıralı + tam eşleme) |', '|---|---|---|');
		for (const group of campaign.groups) lines.push(`| ${group.name} | ${group.landing.replace('https://', '')} | ${group.keywords.join(', ')} |`);
		lines.push('', 'Açıklamalar:', ...campaign.descriptions.map((text) => `- ${text} (${text.length})`), '');
	}
	lines.push('## Negatif kelimeler (sıralı eşleme, tüm arama kampanyalarına)', '', '| Kelime | Neden |', '|---|---|', ...NEGATIVE_KEYWORDS.map((negative) => `| ${negative.keyword} | ${negative.reason} |`), '');
	lines.push('## Öğeler', '', '| Site bağlantısı | Satır 1 | Satır 2 | URL |', '|---|---|---|---|', ...SITELINKS.map((link) => `| ${link.text} | ${link.line1} | ${link.line2} | ${link.url.replace('https://', '')} |`), '');
	lines.push(`Ek açıklamalar: ${CALLOUTS.join(' · ')}`, '', `Yapılandırılmış snippet (${SNIPPET.header}): ${SNIPPET.values.join(', ')}`, '');
	return `${lines.join('\n')}\n`;
};
