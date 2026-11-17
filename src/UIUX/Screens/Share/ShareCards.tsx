import React from 'react';
import {useColors, useT, useUI} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {moduleAction, MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Logo} from '../../Parts/Shared';
import {UI_CANVAS} from '../../Tokens';

/**
 * Share cards (15 Nov 2026): the student shares a result from the app as an
 * Instagram story (1080 × 1920, top and bottom 250 px kept clear) or a post
 * (1080 × 1080). Drawn from the student's own data: on mobile a React Native
 * view saved as PNG, on the web `next/og` (Satori). So everything here is
 * flex boxes, solid fills and text: no shadow, filter, blur or mask (the
 * drawing's logo uses a mask only as a preview; the apps place the logo PNG
 * from Desktop\Sinavika-Logo). Sizes are pixels on the 1080 canvas; the
 * smallest text is 32 px (12 pt on a phone). Meaning never rests on colour
 * alone: correct / wrong / blank carry an icon and a word.
 *
 * docs/UIUX/Paylasim-Kartlari.md is the specification.
 */

/** Layout numbers (px on the 1080-wide canvas). */
export const SHARE = {
	pad: 72,
	storySafe: 250,
	gap: 32,
	radius: 48,
	tileRadius: 32,
	type: {hero: 168, heroSquare: 136, title: 64, titleSquare: 52, label: 36, body: 40, small: 32},
} as const;

type Stat = {icon: UIIconName; value: string; label: string};
type Card = {
	module?: ModuleKey;
	/** Over the hero: what this card is ("TYT DENEME 5"). */
	kicker: string;
	title: string;
	hero: React.ReactNode;
	stats: Stat[];
};

const useSurface = () => {
	const colors = useColors();
	const {mode} = useUI();
	return {bg: colors.bg, card: colors.card, ink: colors.ink, muted: colors.muted, line: colors.line, dark: mode === 'dark'};
};

const T: React.FC<{size: number; weight?: number; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size, weight = 700, color, children, style}) => <div style={{fontSize: size, fontWeight: weight, color, lineHeight: 1.15, letterSpacing: '-0.01em', ...style}}>{children}</div>;

/** Hero panel colour: the module's button colour (white text ≥ 4.5:1); brand cards use the brand button colour. */
const heroFill = (module?: ModuleKey) => (module ? moduleAction(module) : '#C2410C');

const ModuleChip: React.FC<{module?: ModuleKey}> = ({module}) => {
	const s = useSurface();
	const t = useT();
	const fill = heroFill(module);
	const icon: UIIconName = module ? MODULES[module].icon : 'flame';
	const name = module ? t(MODULES[module].name) : t('Seri', 'Streak');
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 14, height: 72, padding: '0 28px 0 16px', borderRadius: 36, background: s.card, border: `3px solid ${s.line}`}}>
			<div style={{width: 44, height: 44, borderRadius: 22, background: fill, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon} size={26} color="#FFFFFF" stroke={2.4} />
			</div>
			<T size={SHARE.type.small} color={s.ink}>
				{name}
			</T>
		</div>
	);
};

const StoreLine: React.FC = () => {
	const s = useSurface();
	const t = useT();
	const badge = (icon: UIIconName, label: string) => (
		<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 64, padding: '0 22px', borderRadius: 16, background: s.dark ? '#FFFFFF' : '#0B1C30'}}>
			<Icon name={icon} size={30} color={s.dark ? '#0B1C30' : '#FFFFFF'} stroke={2} />
			<T size={SHARE.type.small} color={s.dark ? '#0B1C30' : '#FFFFFF'}>
				{label}
			</T>
		</div>
	);
	return (
		<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
			<T size={SHARE.type.small} weight={700} color={s.muted}>
				sinavika.com
			</T>
			<div style={{display: 'flex', gap: 14}}>
				{badge('apple', 'App Store')}
				{badge('googlePlay', t('Google Play', 'Google Play'))}
			</div>
		</div>
	);
};

const StatTile: React.FC<{stat: Stat; module?: ModuleKey; square?: boolean}> = ({stat, module, square}) => {
	const s = useSurface();
	return (
		<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: square ? 4 : 10, padding: square ? '18px 24px' : '28px 28px', borderRadius: SHARE.tileRadius, background: s.card, border: `3px solid ${s.line}`}}>
			<Icon name={stat.icon} size={square ? 34 : 40} color={heroFill(module)} stroke={2.4} />
			<T size={stat.value.length > 7 ? 44 : square ? 48 : 56} weight={800} color={s.ink} style={{whiteSpace: 'nowrap'}}>
				{stat.value}
			</T>
			<T size={SHARE.type.small} weight={600} color={s.muted}>
				{stat.label}
			</T>
		</div>
	);
};

/** One card in either format. */
const ShareCard: React.FC<Card & {square?: boolean}> = ({module, kicker, title, hero, stats, square}) => {
	const s = useSurface();
	const size = square ? UI_CANVAS.shareSquare : UI_CANVAS.share;
	const top = square ? SHARE.pad : SHARE.storySafe;
	const bottom = square ? SHARE.pad : SHARE.storySafe;
	return (
		<div style={{width: size.width, height: size.height, background: s.bg, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', padding: `${top}px ${SHARE.pad}px ${bottom}px`, gap: square ? 22 : SHARE.gap}}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72}}>
				<Logo height={56} color={s.dark ? '#FFFFFF' : '#EA580C'} />
				<ModuleChip module={module} />
			</div>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: square ? 14 : 28, padding: square ? 44 : 64, borderRadius: SHARE.radius, background: heroFill(module)}}>
				<T size={SHARE.type.label} weight={800} color="rgba(255,255,255,0.85)" style={{letterSpacing: '0.06em'}}>
					{kicker}
				</T>
				<T size={square ? SHARE.type.titleSquare : SHARE.type.title} weight={800} color="#FFFFFF">
					{title}
				</T>
				{hero}
			</div>
			<div style={{display: 'flex', gap: 24}}>
				{(square ? stats.slice(0, 3) : stats).map((stat) => (
					<StatTile key={stat.label} stat={stat} module={module} square={square} />
				))}
			</div>
			<StoreLine />
		</div>
	);
};

const Big: React.FC<{value: string; unit?: string; square?: boolean}> = ({value, unit, square}) => (
	<div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
		<T size={square ? SHARE.type.heroSquare : SHARE.type.hero} weight={800} color="#FFFFFF" style={{lineHeight: 1, letterSpacing: '-0.04em'}}>
			{value}
		</T>
		{unit ? (
			<T size={square ? 52 : 64} weight={800} color="rgba(255,255,255,0.85)">
				{unit}
			</T>
		) : null}
	</div>
);

const Pill: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{display: 'flex', alignSelf: 'flex-start', alignItems: 'center', gap: 12, padding: '10px 22px', borderRadius: 28, background: 'rgba(255,255,255,0.18)'}}>{children}</div>;

/** Net bars of the last exams (story): earlier ones half-transparent, today's white; the value sits on the bar. */
const NetBars: React.FC<{values: [string, number][]}> = ({values}) => {
	const t = useT();
	const area = 136;
	const max = Math.max(...values.map(([, value]) => value));
	const min = Math.min(...values.map(([, value]) => value));
	// Differences must read: the lowest exam gets a 30 % bar, the highest a full one.
	const height = (value: number) => Math.round(area * (0.3 + (0.7 * (value - min)) / Math.max(1, max - min)));
	return (
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: area + 96}}>
			{values.map(([label, value], index) => {
				const today = index === values.length - 1;
				return (
					<div key={label} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
						<T size={SHARE.type.small} weight={800} color="#FFFFFF">
							{t(String(value).replace('.', ','), String(value))}
						</T>
						<div style={{width: '100%', height: height(value), borderRadius: 18, background: today ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}} />
						<T size={SHARE.type.small} weight={700} color="#FFFFFF">
							{label}
						</T>
					</div>
				);
			})}
		</div>
	);
};

/** Big counters in a row (story): done ones white with a tick and their number. */
const Counters: React.FC<{items: string[]; done: number; fill: string; height?: number}> = ({items, done, fill, height = 150}) => (
	<div style={{display: 'flex', gap: 16}}>
		{items.map((item, index) => {
			const on = index < done;
			return (
				<div key={item} style={{flex: 1, height, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: height > 120 ? 8 : 2, background: on ? '#FFFFFF' : 'rgba(255,255,255,0.14)', border: on ? 'none' : '3px dashed rgba(255,255,255,0.6)'}}>
					{on ? <Icon name="check" size={height > 120 ? 44 : 30} color={fill} stroke={3} /> : null}
					<T size={height > 120 ? 40 : 34} weight={800} color={on ? fill : '#FFFFFF'}>
						{item}
					</T>
				</div>
			);
		})}
	</div>
);

/* ------------------------------------------------------------------ (a) exam result */

const ExamCard: React.FC<{square?: boolean}> = ({square}) => {
	const t = useT();
	return (
		<ShareCard
			square={square}
			module="exam"
			kicker={t('TYT DENEME 5 · TÜRKİYE GENELİ', 'TYT EXAM 5 · NATIONWIDE')}
			title={t('Deneme sonucum', 'My exam result')}
			hero={
				<>
					<Big value={t('78,5', '78.5')} unit="net" square={square} />
					<Pill>
						<Icon name="trend" size={32} color="#FFFFFF" stroke={2.4} />
						<T size={SHARE.type.small} color="#FFFFFF">
							{t('Geçen denemeye göre +6,5 net', '+6.5 nets on my last exam')}
						</T>
					</Pill>
					{square ? null : (
						<>
							<NetBars
								values={[
									['D1', 58.25],
									['D2', 64],
									['D3', 66.5],
									['D4', 72],
									['D5', 78.5],
								]}
							/>
							<Pill>
								<Icon name="star" size={32} color="#FFFFFF" stroke={2.4} />
								<T size={SHARE.type.small} color="#FFFFFF">
									{t('En iyi ders: Türkçe · 31,25 net', 'Best subject: Turkish · 31.25 nets')}
								</T>
							</Pill>
						</>
					)}
					<T size={SHARE.type.small} weight={600} color="rgba(255,255,255,0.85)">
						{t('Deneme neti; ÖSYM puanı değildir.', 'Practice-exam nets, not an official score.')}
					</T>
				</>
			}
			stats={[
				{icon: 'check', value: '86', label: t('doğru', 'correct')},
				{icon: 'x', value: '30', label: t('yanlış', 'wrong')},
				{icon: 'minus', value: '4', label: t('boş', 'blank')},
			]}
		/>
	);
};

/* ------------------------------------------------------------------ (b) streak */

const StreakCard: React.FC<{square?: boolean}> = ({square}) => {
	const t = useT();
	const steps = [3, 7, 14, 30];
	return (
		<ShareCard
			square={square}
			kicker={t('SERİ ROZETİ', 'STREAK BADGE')}
			title={t('7 gündür her gün çalışıyorum', "I've studied every day for 7 days")}
			hero={
				<>
					<div style={{display: 'flex', alignItems: 'center', gap: 24}}>
						<Icon name="flame" size={square ? 120 : 150} color="#FFFFFF" stroke={2.2} />
						<Big value="7" unit={t('gün', 'days')} square={square} />
					</div>
					{square ? (
						<div style={{display: 'flex', gap: 16}}>
							{steps.map((step) => {
								const reached = step <= 7;
								return (
									<div key={step} style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 76, borderRadius: 38, background: reached ? '#FFFFFF' : 'rgba(255,255,255,0.14)', border: reached ? 'none' : '3px dashed rgba(255,255,255,0.6)'}}>
										{reached ? <Icon name="check" size={28} color="#C2410C" stroke={3} /> : null}
										<T size={SHARE.type.small} color={reached ? '#C2410C' : '#FFFFFF'}>
											{step} {t('gün', 'd')}
										</T>
									</div>
								);
							})}
						</div>
					) : (
						<>
							<T size={SHARE.type.label} weight={800} color="rgba(255,255,255,0.85)" style={{letterSpacing: '0.06em'}}>
								{t('ROZET BASAMAKLARI', 'BADGE STEPS')}
							</T>
							<Counters items={steps.map((step) => `${step} ${t('gün', 'd')}`)} done={2} fill="#C2410C" height={128} />
							<T size={SHARE.type.label} weight={800} color="rgba(255,255,255,0.85)" style={{letterSpacing: '0.06em'}}>
								{t('SON 7 GÜN', 'LAST 7 DAYS')}
							</T>
							<Counters items={[t('Pa', 'Su'), t('Pt', 'M'), t('Sa', 'T'), t('Ça', 'W'), t('Pe', 'T'), t('Cu', 'F'), t('Ct', 'S')]} done={7} fill="#C2410C" height={96} />
						</>
					)}
				</>
			}
			stats={[
				{icon: 'clock', value: t('5 sa 20 dk', '5 h 20 m'), label: t('bu 7 günde', 'in these 7 days')},
				{icon: 'quiz', value: '318', label: t('soru', 'questions')},
				{icon: 'target', value: t('14 gün', '14 days'), label: t('sıradaki rozet', 'next badge')},
			]}
		/>
	);
};

/* ------------------------------------------------------------------ (c) topic done */

const TopicCard: React.FC<{square?: boolean}> = ({square}) => {
	const t = useT();
	return (
		<ShareCard
			square={square}
			module="lessons"
			kicker={t('TÜRKÇE · SÖZCÜKTE ANLAM', 'TURKISH · WORD MEANING')}
			title={t('Konuyu bitirdim', 'Topic finished')}
			hero={
				<>
					<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
						<div style={{width: square ? 104 : 128, height: square ? 104 : 128, borderRadius: 64, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="check" size={square ? 60 : 74} color={moduleAction('lessons')} stroke={3} />
						</div>
						<T size={square ? 88 : 104} weight={800} color="#FFFFFF" style={{lineHeight: 1.05}}>
							{t('Mecaz anlam', 'Figurative meaning')}
						</T>
					</div>
					<T size={SHARE.type.body} weight={600} color="rgba(255,255,255,0.9)">
						{t('5 mikro ders, 42 adım.', '5 micro-lessons, 42 steps.')}
					</T>
					{square ? null : (
						<>
							<T size={SHARE.type.label} weight={800} color="rgba(255,255,255,0.85)" style={{letterSpacing: '0.06em', marginTop: 12}}>
								{t('MİKRO DERSLER · 5 / 5', 'MICRO-LESSONS · 5 / 5')}
							</T>
							<Counters items={['1', '2', '3', '4', '5']} done={5} fill={moduleAction('lessons')} height={170} />
						</>
					)}
				</>
			}
			stats={[
				{icon: 'layers', value: '5', label: t('mikro ders', 'micro-lessons')},
				{icon: 'checkCircle', value: t('%88', '88%'), label: t('ilk denemede doğru', 'right first time')},
				{icon: 'clock', value: t('34 dk', '34 min'), label: t('toplam', 'in total')},
			]}
		/>
	);
};

/* ------------------------------------------------------------------ (d) weekly summary */

const WeekCard: React.FC<{square?: boolean}> = ({square}) => {
	const t = useT();
	const days = [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
	const minutes = [55, 70, 40, 90, 65, 50, 30];
	const max = 90;
	const barArea = square ? 64 : 260;
	return (
		<ShareCard
			square={square}
			module="studyPlan"
			kicker={t('9–15 KASIM', '9–15 NOVEMBER')}
			title={t('Bu haftam', 'My week')}
			hero={
				<>
					<Big value={t('6 sa 40 dk', '6 h 40 m')} square={square} />
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: barArea + 46}}>
						{minutes.map((value, index) => (
							<div key={days[index]} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
								<div style={{width: '100%', height: Math.round((value / max) * barArea), borderRadius: 14, background: index === 3 ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}} />
								<T size={SHARE.type.small} weight={700} color="#FFFFFF">
									{days[index]}
								</T>
							</div>
						))}
					</div>
				</>
			}
			stats={[
				{icon: 'quiz', value: '412', label: t('çözülen soru', 'questions solved')},
				{icon: 'exam', value: '2', label: t('deneme', 'mock exams')},
				{icon: 'flame', value: '7', label: t('gün seri', 'day streak')},
			]}
		/>
	);
};

/* ------------------------------------------------------------------ (e) "I solved this" */

const SolvedCard: React.FC<{square?: boolean}> = ({square}) => {
	const t = useT();
	const s = useSurface();
	return (
		<ShareCard
			square={square}
			module="tests"
			kicker={t('MATEMATİK · PROBLEMLER', 'MATHS · PROBLEMS')}
			title={t('Bu soruyu çözdüm', 'I solved this one')}
			hero={
				<div style={{display: 'flex', flexDirection: 'column', justifyContent: square ? 'flex-start' : 'center', gap: square ? 14 : 40, padding: square ? 26 : 56, borderRadius: SHARE.tileRadius, background: '#FFFFFF', flex: square ? undefined : 1}}>
					<T size={square ? 34 : 46} weight={600} color="#0B1C30" style={{lineHeight: 1.35}}>
						{t('Bir mal %20 indirimle 240 TL’ye satılıyor. İndirimsiz fiyatı kaç TL’dir?', 'An item sells for 240 TL after a 20% discount. What was its original price?')}
					</T>
					<div style={{display: 'flex', gap: square ? 14 : 20, flexWrap: 'wrap'}}>
						{['A) 260', 'B) 288', 'C) 300', 'D) 320'].map((option) => (
							<div key={option} style={{width: square ? undefined : 'calc(50% - 10px)', boxSizing: 'border-box', padding: square ? '10px 22px' : '26px 32px', borderRadius: square ? 20 : 26, border: '3px solid #E7EAEE'}}>
								<T size={square ? SHARE.type.small : 42} color="#334155">
									{option}
								</T>
							</div>
						))}
					</div>
					<T size={SHARE.type.small} weight={600} color={s.dark ? '#5F6B7D' : '#5F6B7D'}>
						{t('Cevap ve çözüm kartta yok; sen de dene.', 'No answer or solution here; try it yourself.')}
					</T>
				</div>
			}
			stats={[
				{icon: 'zap', value: t('1 dk 40 sn', '1 min 40 s'), label: t('sürem', 'my time')},
				{icon: 'target', value: t('Orta', 'Medium'), label: t('seviye', 'level')},
			]}
		/>
	);
};

export const ExamStory: React.FC = () => <ExamCard />;
export const ExamPost: React.FC = () => <ExamCard square />;
export const StreakStory: React.FC = () => <StreakCard />;
export const StreakPost: React.FC = () => <StreakCard square />;
export const TopicStory: React.FC = () => <TopicCard />;
export const TopicPost: React.FC = () => <TopicCard square />;
export const WeekStory: React.FC = () => <WeekCard />;
export const WeekPost: React.FC = () => <WeekCard square />;
export const SolvedStory: React.FC = () => <SolvedCard />;
export const SolvedPost: React.FC = () => <SolvedCard square />;
