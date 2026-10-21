import {describe, expect, it} from 'vitest';
import {FACTS, USD_TRY} from '../src/PitchDeck/PitchDeckFacts';
import {PITCH_DECK_NOTES, PITCH_DECK_PAGE_COUNT} from '../src/PitchDeck/PitchDeckDeck';
import {lifetimeNetPerAdDollar, NET_SHARE, runModel, SCENARIOS, SPEND_PLAN_USD, targetShareOfApplicants} from '../src/PitchDeck/PitchDeckModel';

describe('pitch deck facts', () => {
	it('install cost is spend over installs', () => {
		expect(FACTS.androidSpendTl.value / FACTS.androidInstalls.value).toBeCloseTo(FACTS.cpiTl.value, 3);
	});

	it('uses the earlier model’s rate (2,80 TL = 0,0573 $)', () => {
		expect(FACTS.cpiTl.value / USD_TRY).toBeCloseTo(0.0573, 3);
	});

	it('keeps 62% of a charged lira after refunds, VAT and store fee', () => {
		expect(NET_SHARE).toBeCloseTo(0.6206, 3);
	});
});

describe('12-month ad model', () => {
	it('spends exactly 100 bin $ with three test months', () => {
		expect(SPEND_PLAN_USD).toHaveLength(12);
		expect(SPEND_PLAN_USD.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100000, 6);
		expect(SPEND_PLAN_USD.slice(0, 3)).toEqual([4000, 4000, 4000]);
	});

	it('target funnel returns the ad budget inside 12 months', () => {
		const result = runModel(SCENARIOS.target);
		expect(result.contributionUsd).toBeGreaterThan(60000);
		expect(result.breakEvenMonth).not.toBeNull();
		expect(result.netUsd).toBeCloseTo(result.grossUsd * NET_SHARE, 6);
	});

	it('today’s funnel at scaled install cost does not pay back, so spend stays gated', () => {
		expect(runModel(SCENARIOS.today).contributionUsd).toBeLessThan(0);
		expect(lifetimeNetPerAdDollar(SCENARIOS.today)).toBeLessThan(1);
		expect(lifetimeNetPerAdDollar(SCENARIOS.target)).toBeGreaterThan(2);
	});

	it('paying students stay a small share of applicants', () => {
		expect(targetShareOfApplicants()).toBeLessThan(0.01);
	});
});

describe('deck', () => {
	it('has one speaker note per page', () => {
		expect(PITCH_DECK_NOTES).toHaveLength(PITCH_DECK_PAGE_COUNT);
	});
});
