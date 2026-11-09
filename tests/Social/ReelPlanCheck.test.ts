import {describe, expect, it} from 'vitest';
import * as November from '../../src/Social/Campaigns/Tanitim2026Kasim';
import {CAMPAIGNS} from '../../src/Social/CampaignScaffold';
import type {CampaignReel} from '../../src/Social/CampaignTypes';
import {beatRange, checkReelPlan, PRODUCED_BEFORE_RULE, repeatedOpenings} from '../../src/Social/ReelPlanCheck';
import {REEL_STANDARD} from '../../src/Configurations/ReelStandard';
import {VIDEO_COVER} from '../../src/Configurations/VideoCover';

/** A reel that keeps every rule: an event at 0 s, something new every 2 s, the app's result by 10 s. */
const good: CampaignReel = {
	kind: 'reel',
	date: '2026-11-26',
	id: 'ornek',
	module: 'app',
	promotes: 'mobil',
	title: 'Aynı akşam, iki sonuç',
	hook: 'Aynı akşam, iki sonuç.',
	altHooks: [],
	template: 'SplitEvening',
	reference: '',
	beats: [
		'0–1 sn: Ekran ikiye bölünerek açılır, iki masa ve ortak saat 18.00 akar. Yazı ve ses: "Aynı akşam, iki sonuç."',
		'1–3 sn: Solda sekmeler açılır: "ne çalışsam". Sağda telefonda Ders Planı: ilk görev.',
		'3–5 sn: Saat 19.00. Solda video önerileri kayar, sağda görev işaretlenir: "1/3".',
		'5–7 sn: Saat 20.00. Sağda test biter: "18/20".',
		'7–9 sn: Saat 21.00. Solda "0 görev", sağda "3 görev · 1 test".',
		'9–11 sn: Bölme çizgisi sağa kayar, sağ ekran büyür.',
		'11–13 sn: Büyük yazı: "Fark saatte değil."',
		'13–15 sn: Büyük yazı: "Planda." Saat yeniden 18.00 olur, açılışa döner.',
		'15–18 sn: AppEndCard.',
	],
	voiceover: 'Aynı akşam, iki sonuç.',
	music: '',
	caption: '',
	hashtags: [],
};

describe('reel plan check (Gemini review of the November reels, 9 Nov 2026)', () => {
	it('reads beat ranges with Turkish decimals', () => {
		expect(beatRange('6,5–11,5 sn: x')).toEqual([6.5, 11.5]);
		expect(beatRange('no range')).toBeUndefined();
	});

	it('passes a plan that keeps every rule', () => {
		expect(checkReelPlan(good)).toEqual([]);
	});

	it('catches the November mistakes: long beats, a worn format, a text-only opening, a late app result', () => {
		const slot = November.CAMPAIGN_FEED.find((entry) => entry.id.includes('Sans') || entry.title.startsWith('Bugünkü dersin'))!;
		expect(slot.kind).toBe('reel');
		const issues = checkReelPlan(slot as CampaignReel).join('\n');
		expect(issues).toMatch(/en çok 2 sn'de yeni bilgi/);
		expect(issues).toMatch(/tükenmiş biçim: "çark"/);

		const textOnly = {...good, beats: ['0–1 sn: Lacivert zemin. Yazı ve ses: "Kanca."', ...good.beats.slice(1)]};
		expect(checkReelPlan(textOnly).join('\n')).toMatch(/açılış yalnız zemin ve yazı/);

		const late = {...good, beats: good.beats.map((beat) => beat.replace(/telefonda Ders Planı/, 'masada defter').replace(/sağ ekran/, 'sağ taraf'))};
		expect(checkReelPlan(late).join('\n')).toMatch(/10\. saniyeden önce ekranda değil/);
	});

	it('finds two reels that open on the same picture', () => {
		expect(repeatedOpenings([good, {...good, id: 'ikinci'}])).toHaveLength(1);
		expect(repeatedOpenings([good])).toEqual([]);
	});

	it('keeps the cover frame to a flash', () => {
		expect(VIDEO_COVER.holdSeconds).toBeLessThanOrEqual(REEL_STANDARD.plan.coverHoldMaxSeconds);
	});

	// Only the reels produced before the rules (9 Nov 2026) are listed out; a reel planned later, in any month, is checked at once.
	it('holds every promotion reel made after the rules came in', () => {
		for (const {campaign, feed} of Object.values(CAMPAIGNS)) {
			const reels = feed.flatMap((entry) => (entry.kind === 'reel' && entry.pillar !== 'Anlar' && !PRODUCED_BEFORE_RULE.includes(entry.id) ? [entry] : []));
			for (const entry of reels) expect(checkReelPlan(entry), `${campaign.id} ${entry.id}`).toEqual([]);
			expect(repeatedOpenings(reels), campaign.id).toEqual([]);
		}
	});

	it('lists out only reels that exist', () => {
		const ids = Object.values(CAMPAIGNS).flatMap(({feed}) => feed.map((entry) => entry.id));
		for (const id of PRODUCED_BEFORE_RULE) expect(ids, id).toContain(id);
	});
});
