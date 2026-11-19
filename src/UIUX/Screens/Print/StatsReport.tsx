import React from 'react';
import {useT, useUI} from '../../Context';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Logo} from '../../Parts/Shared';
import {UI_CANVAS, UI_COLORS} from '../../Tokens';
import {useTheme} from '../../../Themes/ThemeContext';

/**
 * İstatistik raporu PDF'i (19 Nov 2026, asked by the app session "api+web+mobile"): the web İstatistiklerim page
 * (`w-istatistik`, "PDF olarak al") as an A4 document the API draws with QuestPDF (sinavika
 * `Services/Exports/Pdf/StatisticsReportPdf.cs`, beside the Akıllı Özet PDFs' `LensPdfLayout`). Sizes are PDF points
 * on the A4 page (595 × 842); margins 40 / 32 as `LensPdfLayout.ConfigurePage`. Paper is white in both themes.
 *
 * Page 1 answers "how much and where": header, four measures, study per day stacked by module, the share per module.
 * Page 2 answers "how is it going": lessons table, the net trend under it, the best hours. Only Manrope 400/600/700/800
 * (the weights the API embeds) and only glyphs Manrope has: changes are written with + and −, never ↗ ↘ (missing in
 * Manrope, a PDF would show empty boxes). Orange is only the logo and "sinavika.com"; charts use module colours from
 * ModuleIdentity, the heat map a neutral slate ramp. Data follows `StatisticOverviewStudentDto` field by field.
 *
 * docs/UIUX/Kodlama/13-Istatistik-Raporu-PDF.md is the specification.
 */

/** Page and type numbers in PDF points. */
export const REPORT = {
	page: {width: UI_CANVAS.print.width, height: UI_CANVAS.print.height, marginX: 40, marginY: 32},
	gap: 18,
	type: {title: 22, section: 12, value: 18, trendValue: 16, body: 9, cell: 9, small: 8, label: 7},
	chart: {height: 150, axis: 26, maxBar: 18},
	donut: {size: 112, ring: 16, gap: 1.5},
	heat: {row: 18, dayColumn: 34, gap: 2},
} as const;

/** Colours of the PDF (light only): SinavikaPdfBrand names where they exist. */
export const PAPER = {
	charcoal: '#0F172A',
	text: '#334155',
	muted: '#64748B',
	line: '#E5E7EB',
	canvas: '#F8FAFC',
	track: '#F1F5F9',
	orange: '#EA580C',
	up: UI_COLORS.light.successInk,
	upSoft: UI_COLORS.light.successSoft,
	down: UI_COLORS.light.errorInk,
	downSoft: UI_COLORS.light.errorSoft,
	good: UI_COLORS.light.success,
	weak: UI_COLORS.light.warning,
} as const;

/** Heat map ramp by CorrectPercent: empty, < 40, 40–54, 55–69, 70–84, ≥ 85 (Tailwind slate 100/300/400/500/700/900). */
export const HEAT_STEPS = [
	{from: 85, fill: '#0F172A', ink: '#FFFFFF'},
	{from: 70, fill: '#334155', ink: '#FFFFFF'},
	{from: 55, fill: '#64748B', ink: '#FFFFFF'},
	{from: 40, fill: '#94A3B8', ink: '#0F172A'},
	{from: 0, fill: '#CBD5E1', ink: '#0F172A'},
] as const;
const HEAT_EMPTY = PAPER.track;
export const heatStep = (percent: number) => HEAT_STEPS.find((step) => percent >= step.from)!;

/** The API's module keys in the stacked bars and the share, in MODULE_ORDER (owner, 18 Nov 2026), with the module each takes its colour from. */
export const REPORT_MODULES = [
	{key: 'focus', module: 'studyPlan', name: {tr: 'Odak', en: 'Focus'}},
	{key: 'lesson', module: 'lessons', name: MODULES.lessons.name},
	{key: 'quiz', module: 'tests', name: MODULES.tests.name},
	{key: 'exam', module: 'exam', name: MODULES.exam.name},
	{key: 'flashcard', module: 'flashcards', name: MODULES.flashcards.name},
] as const satisfies readonly {key: string; module: ModuleKey; name: {tr: string; en: string}}[];
type ReportModule = (typeof REPORT_MODULES)[number]['key'];
const colorOf = (key: ReportModule) => MODULES[REPORT_MODULES.find((entry) => entry.key === key)!.module].color.light;

/* ------------------------------------------------------------------ sample data (one student, 21 Oct – 19 Nov 2026) */

/** Minutes per day: focus, lesson, quiz, exam, flashcard (Wednesday 21 Oct to Thursday 19 Nov 2026; 29 Oct a holiday). */
const MONTH_DAYS: number[][] = [
	[10, 35, 25, 0, 5],
	[0, 45, 20, 0, 10],
	[15, 20, 15, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 10, 0, 165, 0],
	[10, 45, 30, 0, 10],
	[0, 30, 25, 0, 5],
	[5, 25, 20, 0, 10],
	[0, 0, 0, 0, 0],
	[10, 40, 30, 0, 0],
	[0, 20, 15, 0, 15],
	[0, 0, 0, 160, 0],
	[15, 50, 25, 0, 10],
	[0, 35, 30, 0, 5],
	[10, 30, 25, 0, 10],
	[0, 45, 35, 0, 0],
	[20, 25, 20, 0, 10],
	[0, 15, 10, 0, 10],
	[0, 30, 15, 0, 0],
	[10, 50, 35, 0, 10],
	[0, 40, 25, 0, 10],
	[15, 35, 30, 0, 5],
	[0, 55, 30, 0, 10],
	[10, 30, 20, 0, 15],
	[0, 0, 0, 150, 0],
	[0, 25, 15, 0, 10],
	[15, 45, 35, 0, 10],
	[0, 40, 30, 0, 5],
	[10, 50, 30, 0, 10],
	[5, 35, 25, 0, 10],
];

/** The same student's last seven days (13–19 Nov) for the week report without a deneme. */
const WEEK_DAYS: number[][] = [
	[0, 30, 15, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 25, 15, 0, 10],
	[15, 45, 35, 0, 10],
	[0, 40, 30, 0, 5],
	[10, 50, 30, 0, 10],
	[5, 35, 25, 0, 10],
];

const MONTH_START = Date.UTC(2026, 9, 21);
const WEEK_START = Date.UTC(2026, 10, 13);
const DAY_MS = 86_400_000;

/** Best hours: Monday (0) to Sunday (6) × the API's slots 06–09 … 22–24, 00–06; percent right, null = not enough answers. */
const SLOTS = [
	[6, 9],
	[9, 12],
	[12, 15],
	[15, 18],
	[18, 20],
	[20, 22],
	[22, 24],
	[0, 6],
] as const;
const BEST_HOURS: (number | null)[][] = [
	[null, null, 48, 55, 62, 78, 66, null],
	[null, null, 41, 52, 70, 86, 58, null],
	[null, 38, null, 57, 64, 81, 61, null],
	[null, null, 44, 60, 73, 91, 69, null],
	[null, null, null, 50, 58, 62, null, null],
	[45, 63, 74, 67, 52, null, null, null],
	[42, 60, 71, 55, null, null, 47, null],
];

const LESSONS: {name: [string, string]; questions: number; percent: number | null; minutes: number}[] = [
	{name: ['Matematik', 'Maths'], questions: 296, percent: 60, minutes: 425},
	{name: ['Türkçe', 'Turkish'], questions: 214, percent: 75, minutes: 370},
	{name: ['Geometri', 'Geometry'], questions: 64, percent: 47, minutes: 100},
	{name: ['Fizik', 'Physics'], questions: 58, percent: 40, minutes: 85},
	{name: ['Kimya', 'Chemistry'], questions: 54, percent: 52, minutes: 70},
	{name: ['Tarih', 'History'], questions: 30, percent: 73, minutes: 45},
	{name: ['Biyoloji', 'Biology'], questions: 26, percent: 69, minutes: 30},
	{name: ['Coğrafya', 'Geography'], questions: 0, percent: null, minutes: 20},
];

const NET_POINTS: {day: number; net: number; external?: boolean}[] = [
	{day: Date.UTC(2026, 9, 25), net: 71.75},
	{day: Date.UTC(2026, 10, 1), net: 76.5},
	{day: Date.UTC(2026, 10, 8), net: 78.5, external: true},
	{day: Date.UTC(2026, 10, 15), net: 84.25},
];

/* ------------------------------------------------------------------ formatting */

const useFormat = () => {
	const {lang} = useUI();
	const en = lang === 'en';
	const locale = en ? 'en-US' : 'tr-TR';
	return {
		en,
		pct: (value: number) => (en ? `${value}%` : `%${value}`),
		net: (value: number) => value.toLocaleString(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
		signed: (text: string, value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${text}`,
		count: (value: number) => value.toLocaleString(locale),
		duration: (minutes: number) => {
			const hours = Math.floor(minutes / 60);
			const rest = Math.round(minutes % 60);
			if (hours === 0) return en ? `${rest} min` : `${rest} dk`;
			if (rest === 0) return en ? `${hours} h` : `${hours} sa`;
			return en ? `${hours} h ${rest} min` : `${hours} sa ${rest} dk`;
		},
		day: (ms: number, options: Intl.DateTimeFormatOptions) => new Date(ms).toLocaleDateString(locale, {timeZone: 'UTC', ...options}),
	};
};

/* ------------------------------------------------------------------ page parts */

const PrintText: React.FC<{size?: number; weight?: 400 | 600 | 700 | 800; color?: string; upper?: boolean; align?: 'left' | 'right' | 'center'; tnum?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({size = REPORT.type.body, weight = 400, color = PAPER.text, upper, align, tnum, style, children}) => {
	const {typography} = useTheme();
	return (
		<div
			style={{
				fontFamily: typography.body,
				fontSize: size,
				lineHeight: 1.35,
				fontWeight: weight,
				color,
				textAlign: align,
				letterSpacing: upper ? '0.08em' : size >= 16 ? '-0.02em' : undefined,
				textTransform: upper ? 'uppercase' : undefined,
				fontVariantNumeric: tnum ? 'tabular-nums' : undefined,
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** One A4 page: white paper, the margins of LensPdfLayout, the footer every page has. */
const A4Page: React.FC<{page: number; pages: number; children: React.ReactNode}> = ({page, pages, children}) => {
	const t = useT();
	const {width, height, marginX, marginY} = REPORT.page;
	return (
		<div style={{position: 'absolute', inset: 0, width, height, background: '#FFFFFF'}}>
			<div style={{position: 'absolute', left: marginX, right: marginX, top: marginY, bottom: marginY + 22, display: 'flex', flexDirection: 'column', gap: REPORT.gap}}>{children}</div>
			<div style={{position: 'absolute', left: marginX, right: marginX, bottom: marginY, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
				<div style={{display: 'flex', gap: 4, alignItems: 'baseline'}}>
					<PrintText size={REPORT.type.small} weight={600} color={PAPER.orange}>
						sinavika.com
					</PrintText>
					<PrintText size={REPORT.type.small} color={PAPER.muted}>
						· {t('İstatistiklerim', 'My statistics')}
					</PrintText>
				</div>
				<PrintText size={REPORT.type.small} color={PAPER.muted} tnum>
					{page} / {pages}
				</PrintText>
			</div>
		</div>
	);
};

type Period = 'week' | 'month';

const usePeriod = (period: Period) => {
	const t = useT();
	const f = useFormat();
	const start = period === 'week' ? WEEK_START : MONTH_START;
	const last = Date.UTC(2026, 10, 19);
	// Same month: "13 – 19 Kasım 2026" / "November 13 – 19, 2026"; otherwise both dates in full (API, 19 Nov 2026).
	const sameMonth = new Date(start).getUTCMonth() === new Date(last).getUTCMonth();
	const range = sameMonth
		? f.en
			? `${f.day(start, {month: 'long', day: 'numeric'})} – ${f.day(last, {day: 'numeric', year: 'numeric'})}`
			: `${f.day(start, {day: 'numeric'})} – ${f.day(last, {day: 'numeric', month: 'long', year: 'numeric'})}`
		: `${f.day(start, {day: 'numeric', month: 'long'})} – ${f.day(last, {day: 'numeric', month: 'long', year: 'numeric'})}`;
	return {
		name: period === 'week' ? t('Bu hafta', 'This week') : t('Son 30 gün', 'Last 30 days'),
		since: period === 'week' ? t('önceki 7 güne göre', 'vs previous 7 days') : t('önceki 30 güne göre', 'vs previous 30 days'),
		range,
	};
};

/** Page 1's header: logo and report name, the title, the period with its dates; the student and the date on the right. */
const ReportHeader: React.FC<{period: Period; exam?: string}> = ({period, exam}) => {
	const t = useT();
	const f = useFormat();
	const {name, range} = usePeriod(period);
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 14, borderBottom: `1px solid ${PAPER.line}`}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<Logo height={20} color={PAPER.orange} />
				<PrintText size={REPORT.type.label} weight={700} color={PAPER.muted} upper>
					{t('İstatistik raporu', 'Statistics report')}
				</PrintText>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
					<PrintText size={REPORT.type.title} weight={800} color={PAPER.charcoal}>
						{t('İstatistiklerim', 'My statistics')}
					</PrintText>
					<div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
						<div style={{padding: '2px 7px', borderRadius: 4, background: PAPER.charcoal}}>
							<PrintText size={REPORT.type.label} weight={700} color="#FFFFFF" upper>
								{name}
							</PrintText>
						</div>
						<PrintText size={REPORT.type.body} color={PAPER.text}>
							{range}
						</PrintText>
					</div>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end'}}>
					<PrintText size={REPORT.type.body} weight={700} color={PAPER.charcoal}>
						{exam ? `Ayşe Yılmaz · ${exam}` : 'Ayşe Yılmaz'}
					</PrintText>
					<PrintText size={REPORT.type.small} color={PAPER.muted}>
						{t('Oluşturulma', 'Created')} {f.day(Date.UTC(2026, 10, 19), {day: 'numeric', month: 'long', year: 'numeric'})}
					</PrintText>
				</div>
			</div>
		</div>
	);
};

/** Pages 2+: one quiet line, so a loose page still says whose report and which period. */
const RunningHeader: React.FC<{period: Period}> = ({period}) => {
	const t = useT();
	const {name, range} = usePeriod(period);
	return (
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: `1px solid ${PAPER.line}`}}>
			<Logo height={12} color={PAPER.orange} />
			<PrintText size={REPORT.type.small} color={PAPER.muted}>
				{t('İstatistiklerim', 'My statistics')} · {name} · {range}
			</PrintText>
		</div>
	);
};

const Section: React.FC<{title: string; side?: string; children: React.ReactNode}> = ({title, side, children}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
			<PrintText size={REPORT.type.section} weight={800} color={PAPER.charcoal}>
				{title}
			</PrintText>
			{side ? (
				<PrintText size={REPORT.type.small} color={PAPER.muted}>
					{side}
				</PrintText>
			) : null}
		</div>
		{children}
	</div>
);

/** A change chip: green with + when up, red with − when down; the words after it say against what. */
const Change: React.FC<{text: string; down?: boolean; since: string}> = ({text, down, since}) => (
	<div style={{display: 'flex', gap: 5, alignItems: 'center'}}>
		<div style={{padding: '1.5px 5px', borderRadius: 4, background: down ? PAPER.downSoft : PAPER.upSoft}}>
			<PrintText size={REPORT.type.label + 0.5} weight={700} color={down ? PAPER.down : PAPER.up} tnum>
				{text}
			</PrintText>
		</div>
		<PrintText size={REPORT.type.label} color={PAPER.muted}>
			{since}
		</PrintText>
	</div>
);

const Kpi: React.FC<{label: string; value: string; change?: React.ReactNode; note?: string}> = ({label, value, change, note}) => (
	<div style={{flex: 1, minWidth: 0, boxSizing: 'border-box', height: 76, padding: '11px 10px', borderRadius: 8, border: `0.75px solid ${PAPER.line}`, display: 'flex', flexDirection: 'column', gap: 5}}>
		<PrintText size={REPORT.type.label} weight={700} color={PAPER.muted} upper>
			{label}
		</PrintText>
		<PrintText size={REPORT.type.value} weight={800} color={PAPER.charcoal} tnum>
			{value}
		</PrintText>
		{change ?? (
			<PrintText size={REPORT.type.label + 0.5} color={PAPER.muted}>
				{note}
			</PrintText>
		)}
	</div>
);

const Legend: React.FC<{keys: ReportModule[]; average?: number}> = ({keys, average}) => {
	const t = useT();
	const f = useFormat();
	return (
		<div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
			{REPORT_MODULES.filter((entry) => keys.includes(entry.key)).map((entry) => (
				<div key={entry.key} style={{display: 'flex', gap: 5, alignItems: 'center'}}>
					<div style={{width: 8, height: 8, borderRadius: 2, background: colorOf(entry.key)}} />
					<PrintText size={REPORT.type.small} color={PAPER.text}>
						{t(entry.name)}
					</PrintText>
				</div>
			))}
			{average ? (
				<div style={{marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center'}}>
					<div style={{width: 14, borderTop: `1px dashed ${PAPER.charcoal}`}} />
					<PrintText size={REPORT.type.small} color={PAPER.text}>
						{t('günlük ortalama', 'daily average')}{' '}
						<b style={{fontWeight: 700, color: PAPER.charcoal}}>{f.duration(average)}</b>
					</PrintText>
				</div>
			) : null}
		</div>
	);
};

/** A round step for the time axis: three to four lines over the tallest bar. */
const timeStep = (maxMinutes: number) => [15, 30, 60, 120, 180, 300, 600, 1200].find((step) => maxMinutes / step <= 3.2) ?? 1200;

/** Study minutes per day (or per week), stacked bottom-up in module order; the API's daily average as a dashed line. */
const StudyChart: React.FC<{days: number[][]; start: number; average?: number; values?: boolean}> = ({days, start, average, values}) => {
	const f = useFormat();
	const width = REPORT.page.width - 2 * REPORT.page.marginX;
	const {height, axis, maxBar} = REPORT.chart;
	const top = values ? 16 : 6;
	const plot = width - axis;
	const totals = days.map((day) => day.reduce((sum, value) => sum + value, 0));
	const step = timeStep(Math.max(...totals, 1));
	const lines = Math.ceil(Math.max(...totals, 1) / step);
	const scale = (minutes: number) => (minutes / (lines * step)) * (height - top);
	const slot = plot / days.length;
	const bar = Math.min(maxBar, slot * 0.62);
	const {typography} = useTheme();
	const label = {fontFamily: typography.body, fontSize: REPORT.type.label, fill: PAPER.muted} as const;
	return (
		<svg width={width} height={height + 26} style={{display: 'block', overflow: 'visible'}}>
			{Array.from({length: lines + 1}, (_, index) => {
				const y = height - scale(index * step);
				return (
					<g key={index}>
						<line x1={axis} x2={width} y1={y} y2={y} stroke={PAPER.line} strokeWidth={0.75} strokeDasharray={index === 0 ? undefined : '2 2'} />
						<text x={axis - 6} y={y + 2.5} textAnchor="end" {...label}>
							{index === 0 ? '0' : f.duration(index * step)}
						</text>
					</g>
				);
			})}
			{days.map((day, index) => {
				const x = axis + slot * index + (slot - bar) / 2;
				let y = height;
				const total = totals[index];
				const parts = REPORT_MODULES.map((entry, part) => [entry.key, day[part]] as const).filter(([, minutes]) => minutes > 0);
				const date = start + index * DAY_MS;
				const first = new Date(date).getUTCDate() === 1 || index === 0;
				return (
					<g key={index}>
						{total === 0 ? <rect x={x} y={height - 1.5} width={bar} height={1.5} fill={PAPER.line} /> : null}
						{parts.map(([key, minutes], part) => {
							const h = scale(minutes);
							y -= h;
							const last = part === parts.length - 1;
							return <rect key={key} x={x} y={y} width={bar} height={Math.max(h - (last ? 0 : 0.75), 0.5)} rx={last ? 2 : 0} fill={colorOf(key)} />;
						})}
						{values && total > 0 ? (
							<text x={x + bar / 2} y={height - scale(total) - 5} textAnchor="middle" {...label} fill={PAPER.text} fontWeight={600}>
								{f.duration(total)}
							</text>
						) : null}
						<text x={x + bar / 2} y={height + 11} textAnchor="middle" {...label} fill={values ? PAPER.text : PAPER.muted}>
							{values ? f.day(date, {weekday: 'short'}) : new Date(date).getUTCDate()}
						</text>
						{values || first ? (
							<text x={x + bar / 2} y={height + 21} textAnchor="middle" {...label}>
								{values ? new Date(date).getUTCDate() : f.day(date, {month: 'short'})}
							</text>
						) : null}
					</g>
				);
			})}
			{average ? (
				<g>
					<line x1={axis} x2={width} y1={height - scale(average)} y2={height - scale(average)} stroke={PAPER.charcoal} strokeWidth={0.75} strokeDasharray="4 3" />
				</g>
			) : null}
		</svg>
	);
};

/** Where the time went: a ring in module order from twelve o'clock, white gaps between parts, the total inside; the table beside it. */
const ModuleShare: React.FC<{days: number[][]}> = ({days}) => {
	const t = useT();
	const f = useFormat();
	const {size, ring, gap} = REPORT.donut;
	const minutes = REPORT_MODULES.map((entry, index) => ({entry, value: days.reduce((sum, day) => sum + day[index], 0)})).filter((part) => part.value > 0);
	const total = minutes.reduce((sum, part) => sum + part.value, 0);
	// Whole percents that add up to 100 (largest remainder), as the API's Percent field.
	const raw = minutes.map((part) => (part.value / total) * 100);
	const percents = raw.map(Math.floor);
	[...raw.keys()].sort((a, b) => raw[b] - Math.floor(raw[b]) - (raw[a] - Math.floor(raw[a]))).slice(0, 100 - percents.reduce((sum, value) => sum + value, 0)).forEach((index) => (percents[index] += 1));
	const r = (size - ring) / 2;
	const c = 2 * Math.PI * r;
	let offset = 0;
	return (
		<div style={{display: 'flex', gap: 28, alignItems: 'center'}}>
			<div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
				<svg width={size} height={size} style={{transform: 'rotate(-90deg)', display: 'block'}}>
					{minutes.map((part) => {
						const length = (part.value / total) * c;
						const dash = <circle key={part.entry.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colorOf(part.entry.key)} strokeWidth={ring} strokeDasharray={`${Math.max(length - gap, 0)} ${c}`} strokeDashoffset={-offset} />;
						offset += length;
						return dash;
					})}
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1}}>
					<PrintText size={11} weight={800} color={PAPER.charcoal} tnum>
						{f.duration(total)}
					</PrintText>
					<PrintText size={REPORT.type.label} color={PAPER.muted}>
						{t('toplam', 'total')}
					</PrintText>
				</div>
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
				{minutes.map((part, index) => (
					<div key={part.entry.key} style={{display: 'flex', alignItems: 'center', gap: 8, height: 21, borderBottom: index === minutes.length - 1 ? undefined : `0.5px solid ${PAPER.line}`}}>
						<div style={{width: 8, height: 8, borderRadius: 2, background: colorOf(part.entry.key)}} />
						<PrintText size={REPORT.type.body} color={PAPER.text} style={{flex: 1}}>
							{t(part.entry.name)}
						</PrintText>
						<PrintText size={REPORT.type.body} color={PAPER.muted} align="right" tnum style={{width: 80}}>
							{f.duration(part.value)}
						</PrintText>
						<PrintText size={REPORT.type.body} weight={800} color={PAPER.charcoal} align="right" tnum style={{width: 36}}>
							{f.pct(percents[index])}
						</PrintText>
					</div>
				))}
			</div>
		</div>
	);
};

const LessonTable: React.FC = () => {
	const t = useT();
	const f = useFormat();
	const head = (text: string, width?: number, align: 'left' | 'right' = 'left') => (
		<PrintText size={REPORT.type.label} weight={700} color={PAPER.muted} upper align={align} style={{width, flex: width ? undefined : 1}}>
			{text}
		</PrintText>
	);
	return (
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<div style={{display: 'flex', gap: 12, alignItems: 'center', padding: '6px 8px', background: PAPER.canvas, borderRadius: 4}}>
				{head(t('Ders', 'Lesson'))}
				{head(t('Soru', 'Questions'), 56, 'right')}
				{head(t('Doğru oranı', 'Accuracy'), 150)}
				{head(t('Süre', 'Time'), 72, 'right')}
			</div>
			{LESSONS.map((lesson) => (
				<div key={lesson.name[0]} style={{display: 'flex', gap: 12, alignItems: 'center', height: 24, padding: '0 8px', borderBottom: `0.5px solid ${PAPER.line}`}}>
					<PrintText size={REPORT.type.cell} weight={700} color={PAPER.charcoal} style={{flex: 1}}>
						{t(lesson.name[0], lesson.name[1])}
					</PrintText>
					<PrintText size={REPORT.type.cell} color={PAPER.text} align="right" tnum style={{width: 56}}>
						{lesson.questions ? f.count(lesson.questions) : '—'}
					</PrintText>
					<div style={{width: 150, display: 'flex', gap: 8, alignItems: 'center'}}>
						{lesson.percent === null ? (
							<PrintText size={REPORT.type.cell} color={PAPER.muted}>
								—
							</PrintText>
						) : (
							<>
								<div style={{flex: 1, height: 5, borderRadius: 2.5, background: PAPER.track}}>
									<div style={{width: `${lesson.percent}%`, height: '100%', borderRadius: 2.5, background: lesson.percent < 50 ? PAPER.weak : PAPER.good}} />
								</div>
								<PrintText size={REPORT.type.cell} weight={700} color={PAPER.charcoal} align="right" tnum style={{width: 30}}>
									{f.pct(lesson.percent)}
								</PrintText>
							</>
						)}
					</div>
					<PrintText size={REPORT.type.cell} color={PAPER.text} align="right" tnum style={{width: 72}}>
						{f.duration(lesson.minutes)}
					</PrintText>
				</div>
			))}
		</div>
	);
};

/** One exam type's nets: the last net and its change from the first, then the line of every deneme (an added outside deneme as an open dot). */
const NetTrend: React.FC = () => {
	const t = useT();
	const f = useFormat();
	const {typography} = useTheme();
	const width = 260;
	const height = 58;
	const pad = {x: 18, top: 14, bottom: 14};
	const nets = NET_POINTS.map((point) => point.net);
	const low = Math.min(...nets);
	const high = Math.max(...nets);
	const spread = Math.max(high - low, 1);
	const at = (index: number) => ({x: pad.x + (index / (NET_POINTS.length - 1)) * (width - 2 * pad.x), y: pad.top + (1 - (NET_POINTS[index].net - low) / spread) * (height - pad.top - pad.bottom)});
	const points = NET_POINTS.map((_, index) => at(index));
	const path = points.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y}`).join(' ');
	const exam = MODULES.exam.color.light;
	const label = {fontFamily: typography.body, fontSize: REPORT.type.label} as const;
	const first = NET_POINTS[0];
	const last = NET_POINTS[NET_POINTS.length - 1];
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '12px 14px', borderRadius: 8, border: `0.75px solid ${PAPER.line}`}}>
			<div style={{width: 140, display: 'flex', flexDirection: 'column', gap: 4}}>
				<PrintText size={REPORT.type.label} weight={700} color={PAPER.muted} upper>
					{t('TYT net gelişimi', 'TYT net trend')}
				</PrintText>
				<PrintText size={REPORT.type.trendValue} weight={800} color={PAPER.charcoal} tnum>
					{f.net(last.net)}
				</PrintText>
				<Change text={f.signed(f.net(Math.abs(last.net - first.net)), last.net - first.net)} since={t('ilk denemeye göre', 'vs first exam')} />
			</div>
			<svg width={width} height={height + 12} style={{display: 'block', overflow: 'visible'}}>
				<path d={`${path} L${points[points.length - 1].x} ${height} L${points[0].x} ${height} Z`} fill={exam} opacity={0.08} />
				<line x1={0} x2={width} y1={height} y2={height} stroke={PAPER.line} strokeWidth={0.75} />
				<path d={path} fill="none" stroke={exam} strokeWidth={1.5} strokeLinejoin="round" />
				{points.map((point, index) => (
					<circle key={index} cx={point.x} cy={point.y} r={2.75} fill={NET_POINTS[index].external ? '#FFFFFF' : exam} stroke={exam} strokeWidth={1.25} />
				))}
				{[0, points.length - 1].map((index) => (
					<g key={index}>
						<text x={points[index].x} y={points[index].y - 6} textAnchor="middle" {...label} fill={PAPER.charcoal} fontWeight={700}>
							{f.net(NET_POINTS[index].net)}
						</text>
						<text x={points[index].x} y={height + 10} textAnchor="middle" {...label} fill={PAPER.muted}>
							{f.day(NET_POINTS[index].day, {day: 'numeric', month: 'short'})}
						</text>
					</g>
				))}
			</svg>
			<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
				<PrintText size={REPORT.type.label} color={PAPER.muted} tnum>
					{t(`${NET_POINTS.length} deneme`, `${NET_POINTS.length} exams`)}
				</PrintText>
				<div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
					<div style={{width: 6, height: 6, borderRadius: 3, border: `1.25px solid ${exam}`, background: '#FFFFFF'}} />
					<PrintText size={REPORT.type.label} color={PAPER.muted}>
						{t('eklediğin', 'added')}
					</PrintText>
				</div>
			</div>
		</div>
	);
};

const BestHours: React.FC = () => {
	const t = useT();
	const f = useFormat();
	const {row, dayColumn, gap} = REPORT.heat;
	const days = [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
	const pad = (hour: number) => String(hour).padStart(2, '0');
	let best = {day: 0, slot: 0, value: -1};
	BEST_HOURS.forEach((cells, day) => cells.forEach((value, slot) => value !== null && value > best.value && (best = {day, slot, value})));
	const dayName = [t('pazartesi', 'Monday'), t('salı', 'Tuesday'), t('çarşamba', 'Wednesday'), t('perşembe', 'Thursday'), t('cuma', 'Friday'), t('cumartesi', 'Saturday'), t('pazar', 'Sunday')][best.day];
	const [from, to] = SLOTS[best.slot];
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
			<div style={{display: 'flex', flexDirection: 'column', gap}}>
				<div style={{display: 'flex', gap}}>
					<div style={{width: dayColumn}} />
					{SLOTS.map(([start, end]) => (
						<PrintText key={start} size={REPORT.type.label} color={PAPER.muted} align="center" tnum style={{flex: 1}}>
							{pad(start)}–{pad(end)}
						</PrintText>
					))}
				</div>
				{BEST_HOURS.map((cells, day) => (
					<div key={day} style={{display: 'flex', gap, alignItems: 'center'}}>
						<PrintText size={REPORT.type.small} color={PAPER.muted} style={{width: dayColumn}}>
							{days[day]}
						</PrintText>
						{cells.map((value, slot) => {
							const step = value === null ? null : heatStep(value);
							return (
								<div key={slot} style={{flex: 1, height: row, borderRadius: 2, background: step ? step.fill : HEAT_EMPTY, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									{value === null ? null : (
										<PrintText size={REPORT.type.label} weight={day === best.day && slot === best.slot ? 800 : 600} color={step!.ink} tnum>
											{f.pct(value)}
										</PrintText>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<PrintText size={REPORT.type.body} color={PAPER.text}>
					{t('En çok ', 'You are most accurate on ')}
					<b style={{fontWeight: 700, color: PAPER.charcoal}}>
						{dayName} {pad(from)}:00–{pad(to)}:00
					</b>
					{t(` arası doğru yapıyorsun (${f.pct(best.value)}).`, ` (${f.pct(best.value)}).`)}
				</PrintText>
				<div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
					<div style={{width: 10, height: 8, borderRadius: 2, background: HEAT_EMPTY, border: `0.5px solid ${PAPER.line}`}} />
					<PrintText size={REPORT.type.label} color={PAPER.muted}>
						{t('az cevap', 'few answers')}
					</PrintText>
					{[...HEAT_STEPS].reverse().map((step) => (
						<div key={step.from} style={{width: 10, height: 8, borderRadius: 2, background: step.fill}} />
					))}
					<PrintText size={REPORT.type.label} color={PAPER.muted}>
						{t('%85+ doğru', '85%+ right')}
					</PrintText>
				</div>
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ pages */

const minutesOf = (days: number[][]) => days.reduce((sum, day) => sum + day.reduce((a, b) => a + b, 0), 0);
const keysOf = (days: number[][]) => REPORT_MODULES.filter((_, index) => days.some((day) => day[index] > 0)).map((entry) => entry.key);

/** r-istatistik-1: Son 30 gün, page 1 of 2. */
export const StatsReportPageOne: React.FC = () => {
	const t = useT();
	const f = useFormat();
	const {since} = usePeriod('month');
	const total = minutesOf(MONTH_DAYS);
	return (
		<A4Page page={1} pages={2}>
			<ReportHeader period="month" exam="TYT" />
			<div style={{display: 'flex', gap: 8}}>
				<Kpi label={t('Çalışma süresi', 'Study time')} value={f.duration(total)} change={<Change text={f.signed(f.pct(22), 1)} since={since} />} />
				<Kpi label={t('Çözülen soru', 'Questions solved')} value={f.count(742)} note={t('test, ders ve deneme soruları', 'questions across all modules')} />
				<Kpi label={t('Doğru oranı', 'Accuracy')} value={f.pct(62)} change={<Change text={f.signed(t('6 puan', '6 pts'), 1)} since={since} />} />
				<Kpi label={t('TYT net', 'TYT net')} value={f.net(84.25)} change={<Change text={f.signed(f.net(12.5), 1)} since={t('ilk denemeye göre', 'vs first exam')} />} />
			</div>
			<Section title={t('Günlük çalışma', 'Daily study')} side={t('modüllere göre', 'by module')}>
				<Legend keys={keysOf(MONTH_DAYS)} average={Math.round(total / MONTH_DAYS.length)} />
				<StudyChart days={MONTH_DAYS} start={MONTH_START} average={Math.round(total / MONTH_DAYS.length)} />
			</Section>
			<Section title={t('Nerede çalıştın?', 'Where did you study?')} side={t('çalışma süresinin modüllere dağılımı', 'study time by module')}>
				<ModuleShare days={MONTH_DAYS} />
			</Section>
		</A4Page>
	);
};

/** r-istatistik-2: Son 30 gün, page 2 of 2. */
export const StatsReportPageTwo: React.FC = () => {
	const t = useT();
	return (
		<A4Page page={2} pages={2}>
			<RunningHeader period="month" />
			<Section title={t('Derslere göre', 'By lesson')} side={t('en çok çalıştığın 8 ders', 'your 8 most studied lessons')}>
				<LessonTable />
				<NetTrend />
				<PrintText size={REPORT.type.label + 0.5} color={PAPER.muted}>
					{t('Netler Sınavika denemelerinden ve eklediğin denemelerden hesaplanır; ÖSYM puanı değildir.', 'Nets come from Sınavika exams and the exams you added; they are not an official score.')}
				</PrintText>
			</Section>
			<Section title={t('En verimli saatlerin', 'Your best hours')} side={t('son 30 gün · doğru oranına göre', 'last 30 days · by accuracy')}>
				<BestHours />
			</Section>
		</A4Page>
	);
};

/** r-istatistik-hafta: Bu hafta, no deneme yet: the fourth measure is the streak; seven bars carry their time and day. */
export const StatsReportWeek: React.FC = () => {
	const t = useT();
	const f = useFormat();
	const {since} = usePeriod('week');
	const total = minutesOf(WEEK_DAYS);
	return (
		<A4Page page={1} pages={2}>
			<ReportHeader period="week" />
			<div style={{display: 'flex', gap: 8}}>
				<Kpi label={t('Çalışma süresi', 'Study time')} value={f.duration(total)} change={<Change text={f.signed(f.pct(9), -1)} down since={since} />} />
				<Kpi label={t('Çözülen soru', 'Questions solved')} value={f.count(186)} note={t('test, ders ve deneme soruları', 'questions across all modules')} />
				<Kpi label={t('Doğru oranı', 'Accuracy')} value={f.pct(64)} change={<Change text={f.signed(t('3 puan', '3 pts'), 1)} since={since} />} />
				<Kpi label={t('Seri', 'Streak')} value={t('5 gün', '5 days')} note={t('en uzun serin 9 gün', 'your longest: 9 days')} />
			</div>
			<Section title={t('Günlük çalışma', 'Daily study')} side={t('modüllere göre', 'by module')}>
				<Legend keys={keysOf(WEEK_DAYS)} />
				<StudyChart days={WEEK_DAYS} start={WEEK_START} values />
			</Section>
			<Section title={t('Nerede çalıştın?', 'Where did you study?')} side={t('çalışma süresinin modüllere dağılımı', 'study time by module')}>
				<ModuleShare days={WEEK_DAYS} />
			</Section>
		</A4Page>
	);
};
