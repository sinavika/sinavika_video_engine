import {REEL_STANDARD} from '../Configurations/ReelStandard';
import type {CampaignReel} from './CampaignTypes';

/** A beat's time range in seconds ("6,5–11,5 sn: …" → [6.5, 11.5]); undefined when the beat has no range. */
export const beatRange = (beat: string): [number, number] | undefined => {
	const match = beat.match(/^(\d+(?:,\d+)?)–(\d+(?:,\d+)?) sn:/);
	return match ? [Number(match[1].replace(',', '.')), Number(match[2].replace(',', '.'))] : undefined;
};

/** The picture of a beat: its text after the time range, without the "Yazı ve ses" line. */
const sceneOf = (beat: string) => beat.replace(/^[^:]*:\s*/, '').replace(/Yazı ve ses:.*$/s, '').trim();

/** The closing card beats (app card or the YouTube channel card); they are the standard's own part. */
const isClosingCard = (beat: string) => /sn: (AppEndCard|YouTube kanal kartı)\.$/.test(beat);

/** Where an app result shows: the phone, the app and its module names (a split screen is not the app). */
const APP_RESULT = /telefon|uygulama|Ders Planı|Dersler|Kütüphane|SinoAI|Sınavika/i;

/**
 * Checks a promotion reel's plan against REEL_STANDARD.plan (the rules from the
 * November review). Returns the problems in Turkish, empty when the plan passes.
 */
export const checkReelPlan = (entry: CampaignReel): string[] => {
	const rules = REEL_STANDARD.plan;
	const issues: string[] = [];
	const content = entry.beats.filter((beat) => !isClosingCard(beat));

	const opening = content[0] ? sceneOf(content[0]) : '';
	if (opening.split(/\s+/).filter(Boolean).length < 4 || /^\S+\s+(zemin|sahne)(de|da)?\.?$/i.test(opening)) {
		issues.push(`açılış yalnız zemin ve yazı: 0. saniyede hareketli bir olay olmalı ("${opening}")`);
	}

	for (const beat of content) {
		const range = beatRange(beat);
		if (!range) {
			issues.push(`zaman aralığı yok: "${beat}"`);
			continue;
		}
		const length = range[1] - range[0];
		if (length > rules.newInfoMaxSeconds + 1e-9) issues.push(`${String(range[0]).replace('.', ',')}–${String(range[1]).replace('.', ',')} sn ${length.toFixed(1).replace('.', ',')} sn sürüyor: en çok ${rules.newInfoMaxSeconds} sn'de yeni bilgi`);
	}

	if (!content.some((beat) => (beatRange(beat)?.[0] ?? Infinity) < rules.appResultBySeconds && APP_RESULT.test(sceneOf(beat)))) {
		issues.push(`uygulamanın sonucu ${rules.appResultBySeconds}. saniyeden önce ekranda değil`);
	}

	const text = `${entry.template} ${entry.beats.join(' ')}`.toLocaleLowerCase('tr');
	for (const worn of rules.wornFormats) if (text.includes(worn)) issues.push(`tükenmiş biçim: "${worn}"`);

	return issues;
};

/**
 * Reels already produced when the rules came in (9 Nov 2026). Only these are
 * left out; any reel planned after that, in any month, is checked at once.
 */
export const PRODUCED_BEFORE_RULE: readonly string[] = [
	'once-sonra', 'sinoai-lansman-filmi', 'kim-calisiyor', 'netin-yalan-soyluyor', 'tanistirayim-sinoai-calisma', 'olc-ogren-gelis-showreel', 'saat-23-40', 'soru-isareti', 'kayit-olmadan-sor',
	'sans-carki', 'kasimin-30-gunu', 'odak-saati', 'haftanin-fisi', 'ayni-gun-iki-ogrenci', 'sinoai-uc-mod', 'defterin-dolu', 'sana-ozel-deneme', 'grup-sessiz', 'sinav-hava-durumu', 'eksik-parca', 'yanlisini-silme', 'pov-deneme-bitti', 'bir-kart-sec', 'haftana-sigar', 'tyt-kampi-youtube', 'iki-ekran-tek-hesap', 'hangi-seviyedesin',
];

/** Reels of different plans in one campaign must not open on the same picture. */
export const repeatedOpenings = (entries: CampaignReel[]): string[] => {
	const seen = new Map<string, string>();
	const repeats: string[] = [];
	for (const entry of entries) {
		const key = sceneOf(entry.beats[0] ?? '').toLocaleLowerCase('tr').replace(/[^\p{L}\s]/gu, '').split(/\s+/).slice(0, 4).join(' ');
		if (seen.has(key)) repeats.push(`${entry.id} ve ${seen.get(key)} aynı görüntüyle açılıyor: "${key}"`);
		else seen.set(key, entry.id);
	}
	return repeats;
};
