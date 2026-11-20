import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {EXAM_LANG, UI_EXAMS, UIProvider, type UIExam} from '../../src/UIUX/Context';
import {findScreen} from '../../src/UIUX/Registry';

vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null}));

/**
 * Exam personas for ads (Sosyal Medya, 20 Nov 2026): an ad shows only its own
 * exam. These are the screens the Google Ads set draws; each persona's
 * drawing must name no other exam, and the English ones carry no Turkish.
 */
const AD_SCREENS = [
	'm-deneme-net',
	'm-deneme-sonuclar',
	'm-deneme-analiz',
	'm-deneme-sonuc',
	'm-deneme-ay',
	'm-plan-bugun',
	'm-ders-bosluk',
	'm-ders-dogru-yanlis',
	'm-ders-sirala',
	'm-ders-soru',
	'm-test-yanlislar',
	'm-kart-on',
	'm-kart-arka',
	'm-ozet-sonuc',
	'm-sino-sohbet',
	'w-deneme-sonuc',
	'w-plan-bugun',
	'w-ders-bosluk',
	'w-test-yanlislar',
	'w-ozet-detay',
	'w-sino-sohbet',
	'w-kart-oturum',
	'w-sinav-takvimi',
];

const FORBIDDEN: Record<UIExam, RegExp> = {
	yks: /KPSS|\bSAT\b|\bACT\b|YDT/,
	kpss: /\bTYT\b|\bAYT\b|\bYKS\b|\bSAT\b|\bACT\b|YDT/,
	sat: /\bTYT\b|\bAYT\b|KPSS|\bACT\b|\bnet\b/,
	act: /\bTYT\b|\bAYT\b|KPSS|\bSAT\b|\bnet\b/,
};

/** Visible text only (tags and attributes stripped). */
const textOf = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

describe('exam personas', () => {
	for (const exam of UI_EXAMS)
		it(`draws the ad screens for ${exam} without other exams`, () => {
			const lang = EXAM_LANG[exam];
			for (const id of AD_SCREENS) {
				const {Component} = findScreen(id);
				const text = textOf(renderToStaticMarkup(React.createElement(UIProvider, {lang, exam, children: React.createElement(Component)})));
				expect(text, `${id} ${exam}`).not.toMatch(FORBIDDEN[exam]);
				// English drawings: no Turkish letters (the brand name Sınavika aside).
				if (lang === 'en') expect(text.replace(/Sınavika/g, ''), `${id} ${exam}`).not.toMatch(/[çğıöşüÇĞİÖŞÜ]/);
			}
		});
});
