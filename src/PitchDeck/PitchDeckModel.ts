import {DEDUCTIONS, FACTS, MARKET, USD_TRY} from './PitchDeckFacts';

/**
 * The 12-month ad model behind the finance slides. Each month's ad budget buys
 * installs at the scenario's install cost; a share of them pays the first month,
 * renews in month two at the second-month rate and after that at the later rate.
 * Revenue only counts inside the 12 months: subscribers still paying in month 13
 * are reported, not added. Company costs (team, cloud, AI usage, legal) are out
 * of scope, as agreed for the deck; store fee, VAT and refunds are in.
 */
export type Scenario = {
	id: 'today' | 'mid' | 'target';
	label: string;
	/** Install cost in TL at scale. */
	cpiTl: number;
	firstPaymentRate: number;
	secondMonthRenewal: number;
	/** Monthly renewal from month three on. */
	laterRenewal: number;
};

/** Gated plan: three test months, then the rest only if the cohorts pay back. */
export const SPEND_PLAN_USD: readonly number[] = [4000, 4000, 4000, ...Array.from({length: 9}, () => 88000 / 9)];

/** Install cost once the budget is 80 times today's: today's 2,80 TL plus half. */
export const SCALED_CPI_TL = 4.2;

export const SCENARIOS: Record<Scenario['id'], Scenario> = {
	today: {id: 'today', label: 'Bugünkü huni', cpiTl: SCALED_CPI_TL, firstPaymentRate: FACTS.firstPaymentRate.value, secondMonthRenewal: FACTS.secondMonthRenewal.value, laterRenewal: FACTS.secondMonthRenewal.value},
	mid: {id: 'mid', label: 'Ara hedef', cpiTl: SCALED_CPI_TL, firstPaymentRate: 0.012, secondMonthRenewal: 0.45, laterRenewal: 0.7},
	target: {id: 'target', label: 'Hedef huni', cpiTl: SCALED_CPI_TL, firstPaymentRate: 0.014, secondMonthRenewal: 0.5, laterRenewal: 0.75},
};

/** Share of every charged lira left after refunds, VAT and the store fee. */
export const NET_SHARE = ((1 - FACTS.refundShare.value) / (1 + DEDUCTIONS.vat)) * (1 - DEDUCTIONS.storeFee);

export type MonthRow = {month: number; spendUsd: number; installs: number; firstPayments: number; payingSubscribers: number; grossUsd: number; netUsd: number};

export type ModelResult = {
	scenario: Scenario;
	months: MonthRow[];
	spendUsd: number;
	installs: number;
	firstPayments: number;
	grossUsd: number;
	refundsUsd: number;
	vatUsd: number;
	storeFeeUsd: number;
	netUsd: number;
	contributionUsd: number;
	/** First month whose cumulative net covers cumulative spend; null if none. */
	breakEvenMonth: number | null;
	/** Subscribers who keep paying into month 13 (not counted as revenue). */
	payingIntoMonth13: number;
	month12GrossUsd: number;
};

export const runModel = (scenario: Scenario, spendPlan: readonly number[] = SPEND_PLAN_USD): ModelResult => {
	const count = spendPlan.length;
	const price = FACTS.priceTl.value;
	const paying = Array.from({length: count}, () => 0);
	const firstByMonth = Array.from({length: count}, () => 0);
	const installsByMonth = Array.from({length: count}, () => 0);
	let carryOver = 0;
	spendPlan.forEach((spend, start) => {
		const installs = (spend * USD_TRY) / scenario.cpiTl;
		const first = installs * scenario.firstPaymentRate;
		installsByMonth[start] = installs;
		firstByMonth[start] = first;
		let active = first;
		for (let month = start; month < count; month += 1) {
			paying[month] += active;
			active *= month === start ? scenario.secondMonthRenewal : scenario.laterRenewal;
		}
		carryOver += active;
	});
	const months: MonthRow[] = paying.map((subscribers, index) => {
		const grossUsd = (subscribers * price) / USD_TRY;
		return {month: index + 1, spendUsd: spendPlan[index], installs: installsByMonth[index], firstPayments: firstByMonth[index], payingSubscribers: subscribers, grossUsd, netUsd: grossUsd * NET_SHARE};
	});
	const grossUsd = months.reduce((sum, row) => sum + row.grossUsd, 0);
	const refundsUsd = grossUsd * FACTS.refundShare.value;
	const afterRefund = grossUsd - refundsUsd;
	const vatUsd = afterRefund - afterRefund / (1 + DEDUCTIONS.vat);
	const storeFeeUsd = (afterRefund - vatUsd) * DEDUCTIONS.storeFee;
	const netUsd = afterRefund - vatUsd - storeFeeUsd;
	const spendUsd = spendPlan.reduce((sum, value) => sum + value, 0);
	let cumulative = 0;
	let breakEvenMonth: number | null = null;
	months.forEach((row) => {
		cumulative += row.netUsd - row.spendUsd;
		if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = row.month;
	});
	return {
		scenario,
		months,
		spendUsd,
		installs: installsByMonth.reduce((sum, value) => sum + value, 0),
		firstPayments: firstByMonth.reduce((sum, value) => sum + value, 0),
		grossUsd,
		refundsUsd,
		vatUsd,
		storeFeeUsd,
		netUsd,
		contributionUsd: netUsd - spendUsd,
		breakEvenMonth,
		payingIntoMonth13: carryOver,
		month12GrossUsd: months[count - 1].grossUsd,
	};
};

/** Net return on each ad dollar over a subscriber's whole life (no 12-month cut). */
export const lifetimeNetPerAdDollar = (scenario: Scenario): number => {
	const payments = 1 + scenario.secondMonthRenewal / (1 - scenario.laterRenewal);
	const netPerInstallTl = scenario.firstPaymentRate * payments * FACTS.priceTl.value * NET_SHARE;
	return netPerInstallTl / scenario.cpiTl;
};

/** 12-month contribution for an install cost and funnel: the sensitivity table. */
export const sensitivity = (cpis: readonly number[], funnels: readonly Scenario[]): {cpiTl: number; values: {id: Scenario['id']; contributionUsd: number}[]}[] =>
	cpis.map((cpiTl) => ({cpiTl, values: funnels.map((funnel) => ({id: funnel.id, contributionUsd: runModel({...funnel, cpiTl}).contributionUsd}))}));

/** Paying-student value of an exam audience at today's price over a four-month preparation. */
export const PREP_MONTHS = 4;
export const audienceValueUsd = (applicants: number): number => (applicants * PREP_MONTHS * FACTS.priceTl.value) / USD_TRY;

export const MARKET_ROWS = [
	{label: 'YKS 2026', applicants: MARKET.yks2026.value, source: MARKET.yks2026.source},
	{label: 'KPSS Ön Lisans 2026', applicants: MARKET.kpssOnLisans2026.value, source: MARKET.kpssOnLisans2026.source},
] as const;

/** Share of this year's YKS + KPSS Ön Lisans applicants that the target scenario's first payments are. */
export const targetShareOfApplicants = (): number => runModel(SCENARIOS.target).firstPayments / (MARKET.yks2026.value + MARKET.kpssOnLisans2026.value);
