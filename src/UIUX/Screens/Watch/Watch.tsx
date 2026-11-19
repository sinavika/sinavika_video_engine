import React from 'react';
import {useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {Stack, Text} from '../../Parts/Shared';
import {SysRing} from '../../Parts/System';
import {AppleWatch, EdgeArc, EdgeButton, WATCH_CARD, WATCH_INK, WATCH_MUTED, WatchButton, WatchCard, WearRound, watchColor} from '../../Parts/Watch';

/**
 * Sınavika on the wrist (15 Nov 2026). Studying itself stays on the phone,
 * tablet and web; the watch shows the day's plan, runs the focus timer,
 * counts down to a live exam and offers a quick card review. Every screen
 * answers one question in about two seconds; anything longer hands off to
 * the phone ("Telefonda aç").
 */

const plan = watchColor('studyPlan');
const tests = watchColor('tests');
const exam = watchColor('exam');
const cards = watchColor('flashcards');
const lessons = watchColor('lessons');
const STREAK = '#F59E0B';

/* ------------------------------------------------------------------ Apple Watch */

export const AppleTodayScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title={t('Bugün', 'Today')} accent={plan}>
			<Stack row gap={10} style={{padding: '0 4px'}}>
				<SysRing value={0.5} size={78} stroke={9} color={plan} track="rgba(255,255,255,0.14)">
					<Stack gap={0} align="center">
						<Text role="headline" size={20} color={WATCH_INK} tnum>
							45
						</Text>
						<Text role="meta" size={12} color={WATCH_MUTED}>
							/ 90 {t('dk', 'min')}
						</Text>
					</Stack>
				</SysRing>
				<Stack gap={4}>
					<Text role="headline" size={16} color={WATCH_INK}>
						{t('2 / 5 görev', '2 / 5 tasks')}
					</Text>
					<Stack row gap={4}>
						<Icon name="flame" size={15} color={STREAK} stroke={2.4} />
						<Text role="headline" size={14} color={STREAK}>
							{t('5 gün', '5 days')}
						</Text>
					</Stack>
				</Stack>
			</Stack>
			<div style={{marginTop: 10}}>
				<WatchCard>
					<Stack row gap={8}>
						<Stack grow gap={0}>
							<Text role="meta" size={12} color={WATCH_MUTED}>
								{t('SIRADAKİ', 'NEXT')}
							</Text>
							<Text role="headline" size={15} color={WATCH_INK}>
								{t('Problemler', 'Problems')}
							</Text>
							<Text role="meta" size={12} color={tests}>
								{t('20 soru · 25 dk', '20 q · 25 min')}
							</Text>
						</Stack>
						<WatchButton icon="play" color={tests} round={40} />
					</Stack>
				</WatchCard>
			</div>
		</AppleWatch>
	);
};

export const ApplePlanScreen: React.FC = () => {
	const t = useT();
	const rows: [string, string, string, boolean][] = [
		[t('Sözcükte Anlam', 'Word meaning'), t('Dersler · 4 dk', 'Lessons · 4 min'), lessons, true],
		[t('Problemler', 'Problems'), t('Testler · 20 soru', 'Tests · 20 q'), tests, false],
		[t('12 kart', '12 cards'), t('Kartlar · 5 dk', 'Cards · 5 min'), cards, false],
	];
	return (
		<AppleWatch title={t('Plan', 'Plan')} accent={plan}>
			<Stack gap={6}>
				{rows.map(([title, sub, color, done]) => (
					<WatchCard key={title} padding="8px 10px">
						<Stack row gap={9}>
							<div style={{width: 24, height: 24, borderRadius: 12, border: done ? 'none' : `2.5px solid ${color}`, background: done ? color : 'transparent', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{done ? <Icon name="check" size={14} color="#000" stroke={3.2} /> : null}</div>
							<Stack grow gap={0}>
								<Text role="headline" size={14} color={done ? WATCH_MUTED : WATCH_INK} style={{textDecoration: done ? 'line-through' : undefined}}>
									{title}
								</Text>
								<Text role="meta" size={12} color={WATCH_MUTED}>
									{sub}
								</Text>
							</Stack>
						</Stack>
					</WatchCard>
				))}
			</Stack>
		</AppleWatch>
	);
};

export const AppleFocusScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title={t('Odak', 'Focus')} accent={tests}>
			<Stack align="center" gap={6}>
				<SysRing value={0.25} size={128} stroke={11} color={tests} track="rgba(255,255,255,0.14)">
					<Stack gap={0} align="center">
						<div style={{fontSize: 34, fontWeight: 800, color: WATCH_INK, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>18:42</div>
						<Text role="meta" size={12} color={WATCH_MUTED}>
							{t('Problemler · 8/20', 'Problems · 8/20')}
						</Text>
					</Stack>
				</SysRing>
				<Stack row gap={10} style={{width: '100%'}}>
					<div style={{flex: 1}}>
						<WatchButton icon="pause" color="#FBBF24" tone="soft" />
					</div>
					<div style={{flex: 1}}>
						<WatchButton icon="check" color={tests} />
					</div>
				</Stack>
			</Stack>
		</AppleWatch>
	);
};

export const AppleCardScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title={t('Kartlar', 'Cards')} accent={cards}>
			<Stack gap={8}>
				<div style={{height: 120, borderRadius: 20, background: WATCH_CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, boxSizing: 'border-box'}}>
					<Text role="meta" size={12} color={cards}>
						{t('Kimya · Mol', 'Chemistry · Mole')}
					</Text>
					<Text role="headline" size={20} color={WATCH_INK} align="center">
						{t('1 mol nedir?', 'What is 1 mole?')}
					</Text>
					<Text role="meta" size={12} color={WATCH_MUTED}>
						3 / 12
					</Text>
				</div>
				<WatchButton label={t('Cevabı göster', 'Show answer')} color={cards} />
			</Stack>
		</AppleWatch>
	);
};

export const AppleCardAnswerScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title={t('Kartlar', 'Cards')} accent={cards}>
			<Stack gap={8}>
				<div style={{height: 120, borderRadius: 20, background: WATCH_CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10, boxSizing: 'border-box'}}>
					<Text role="meta" size={12} color={cards}>
						{t('Cevap', 'Answer')}
					</Text>
					<Text role="headline" size={18} color={WATCH_INK} align="center">
						{t('6,02 × 10²³ tanecik', '6.02 × 10²³ particles')}
					</Text>
					<Text role="meta" size={12} color={WATCH_MUTED} align="center">
						{t('Avogadro sayısı kadar', 'Avogadro’s number of them')}
					</Text>
				</div>
				<Stack row gap={8}>
					<div style={{flex: 1}}>
						<WatchButton icon="x" color="#F87171" tone="soft" />
					</div>
					<div style={{flex: 1}}>
						<WatchButton icon="check" color="#34D399" />
					</div>
				</Stack>
			</Stack>
		</AppleWatch>
	);
};

export const AppleExamScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title={t('Deneme', 'Exam')} accent={exam}>
			<Stack gap={8} style={{padding: '0 4px'}}>
				<Stack gap={0}>
					<Text role="headline" size={16} color={WATCH_INK}>
						{t('TYT Deneme 5', 'SAT Practice Test 5')}
					</Text>
					<Text role="meta" size={12} color={WATCH_MUTED}>
						{t('Cumartesi 10:00 · Türkiye geneli', 'Saturday 10:00 · nationwide')}
					</Text>
				</Stack>
				<Stack row gap={6}>
					{[
						['2', t('gün', 'd')],
						['4', t('saat', 'h')],
						['15', t('dk', 'm')],
					].map(([value, unit]) => (
						<div key={unit} style={{flex: 1, height: 58, borderRadius: 14, background: WATCH_CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
							<div style={{fontSize: 24, fontWeight: 800, color: exam, lineHeight: 1}}>{value}</div>
							<Text role="meta" size={12} color={WATCH_MUTED}>
								{unit}
							</Text>
						</div>
					))}
				</Stack>
				<WatchButton icon="bell" label={t('15 dk önce hatırlat', 'Remind 15 min before')} color={exam} tone="soft" />
				<Text role="meta" size={12} color={WATCH_MUTED} align="center">
					{t('Deneme telefonda çözülür', 'Exams are taken on the phone')}
				</Text>
			</Stack>
		</AppleWatch>
	);
};

/** A watch face with Sınavika complications (Modular). */
export const AppleFaceScreen: React.FC = () => {
	const t = useT();
	return (
		<div style={{width: 208, height: 248, background: '#000', position: 'relative', overflow: 'hidden', padding: '12px 12px', boxSizing: 'border-box'}}>
			<Stack row justify="space-between">
				<Text role="headline" size={14} color={plan}>
					{t('CMT 15', 'SAT 15')}
				</Text>
				<Stack row gap={3}>
					<Icon name="flame" size={14} color={STREAK} stroke={2.4} />
					<Text role="headline" size={14} color={STREAK}>
						5
					</Text>
				</Stack>
			</Stack>
			<div style={{fontSize: 64, fontWeight: 700, color: WATCH_INK, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 2}}>9:41</div>
			<div style={{marginTop: 6, background: WATCH_CARD, borderRadius: 16, padding: '8px 10px'}}>
				<Stack row gap={6}>
					<Icon name="quiz" size={15} color={tests} stroke={2.4} />
					<Text role="meta" size={12} color={tests}>
						{t('SIRADAKİ · 10:00', 'NEXT · 10:00')}
					</Text>
				</Stack>
				<Text role="headline" size={15} color={WATCH_INK}>
					{t('Problemler · 20 soru', 'Problems · 20 q')}
				</Text>
			</div>
			<Stack row justify="space-between" style={{marginTop: 8}}>
				<SysRing value={0.5} size={50} stroke={5} color={plan} track="rgba(255,255,255,0.16)">
					<Text role="headline" size={13} color={WATCH_INK} tnum>
						45
					</Text>
				</SysRing>
				<SysRing value={0.62} size={50} stroke={5} color={cards} track="rgba(255,255,255,0.16)">
					<Icon name="cards" size={18} color={cards} stroke={2.4} />
				</SysRing>
				<SysRing value={0.8} size={50} stroke={5} color={exam} track="rgba(255,255,255,0.16)">
					<Text role="headline" size={13} color={WATCH_INK}>
						2g
					</Text>
				</SysRing>
			</Stack>
		</div>
	);
};

/** watchOS Smart Stack: Sınavika's widget rises to the top in the morning and before a live exam. */
export const AppleSmartStackScreen: React.FC = () => {
	const t = useT();
	const widget = (accent: string, label: string, title: string, sub: string, side: React.ReactNode) => (
		<div style={{background: WATCH_CARD, borderRadius: 22, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10}}>
			<Stack grow gap={0}>
				<Text role="meta" size={12} color={accent}>
					{label}
				</Text>
				<Text role="headline" size={16} color={WATCH_INK}>
					{title}
				</Text>
				<Text role="meta" size={12} color={WATCH_MUTED}>
					{sub}
				</Text>
			</Stack>
			{side}
		</div>
	);
	return (
		<div style={{width: 208, height: 248, background: 'linear-gradient(180deg, #111 0%, #000 100%)', padding: '12px 10px', boxSizing: 'border-box'}}>
			<Stack row justify="space-between" style={{padding: '0 4px 8px'}}>
				<Text role="headline" size={15} color={WATCH_INK} tnum>
					9:41
				</Text>
				<Text role="meta" size={12} color={WATCH_MUTED}>
					{t('Akıllı Yığın', 'Smart Stack')}
				</Text>
			</Stack>
			<Stack gap={8}>
				{widget(
					plan,
					t('SINAVİKA · BUGÜN', 'SINAVIKA · TODAY'),
					'45 / 90 dk',
					t('Sıradaki: Problemler', 'Next: Problems'),
					<SysRing value={0.5} size={44} stroke={5} color={plan} track="rgba(255,255,255,0.16)">
						<Icon name="play" size={16} color={plan} stroke={2.6} />
					</SysRing>,
				)}
				<div data-ui="disabled" style={{opacity: 0.55, transform: 'scale(0.94)', transformOrigin: 'top center'}}>
					{widget(exam, t('CANLI DENEME', 'LIVE EXAM'), t('Cumartesi 10:00', 'Saturday 10:00'), t('TYT Deneme 5', 'SAT Practice Test 5'), <Icon name="exam" size={22} color={exam} stroke={2.2} />)}
				</div>
			</Stack>
		</div>
	);
};

/** A notification on the wrist (long look) with actions. */
export const AppleNotificationScreen: React.FC = () => {
	const t = useT();
	return (
		<AppleWatch title="Sınavika" accent="#FB923C">
			<Stack gap={8}>
				<WatchCard padding="10px 12px">
					<Stack gap={2}>
						<Stack row gap={6}>
							<Icon name="checkCircle" size={16} color={tests} stroke={2.4} />
							<Text role="headline" size={15} color={WATCH_INK}>
								{t('Odak bitti', 'Focus done')}
							</Text>
						</Stack>
						<Text role="small" size={13} color={WATCH_MUTED}>
							{t('20 / 20 soru, 17 doğru. Bugün 3 / 5 görev.', '20 / 20 questions, 17 right. Today 3 / 5 tasks.')}
						</Text>
					</Stack>
				</WatchCard>
				<WatchButton label={t('Sıradaki: 12 kart', 'Next: 12 cards')} color={cards} />
				<WatchButton label={t('5 dk mola', '5 min break')} color="#9CA3AF" tone="soft" />
			</Stack>
		</AppleWatch>
	);
};

/* ------------------------------------------------------------------ Wear OS */

/** Wear OS Tile: the day at a glance, swiped to from the watch face. */
export const WearTileScreen: React.FC = () => {
	const t = useT();
	return (
		<WearRound edge={<EdgeArc value={0.5} color={plan} gap={90} />} button={<EdgeButton label={t('Problemler', 'Problems')} icon="play" color={tests} />}>
			<Stack gap={2} align="center">
				<Text role="headline" size={13} color={plan}>
					{t('Bugün', 'Today')}
				</Text>
				<div style={{fontSize: 30, fontWeight: 800, color: WATCH_INK, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>45/90</div>
				<Text role="meta" size={12} color={WATCH_MUTED}>
					{t('dk · 2/5 görev', 'min · 2/5 tasks')}
				</Text>
				<Stack row gap={4}>
					<Icon name="flame" size={14} color={STREAK} stroke={2.4} />
					<Text role="meta" size={12} color={STREAK}>
						{t('5 gün', '5 days')}
					</Text>
				</Stack>
			</Stack>
		</WearRound>
	);
};

export const WearFocusScreen: React.FC = () => {
	const t = useT();
	return (
		<WearRound edge={<EdgeArc value={0.25} color={tests} stroke={9} />}>
			<Stack gap={4} align="center">
				<Text role="meta" size={12} color={tests}>
					{t('ODAK', 'FOCUS')}
				</Text>
				<div style={{fontSize: 38, fontWeight: 800, color: WATCH_INK, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>18:42</div>
				<Text role="meta" size={12} color={WATCH_MUTED}>
					{t('Problemler · 8/20', 'Problems · 8/20')}
				</Text>
				<Stack row gap={12} style={{marginTop: 6}}>
					<WatchButton icon="pause" color="#FBBF24" tone="soft" round={38} />
					<WatchButton icon="check" color={tests} round={38} />
				</Stack>
			</Stack>
		</WearRound>
	);
};

/** A Wear OS face with Sınavika complications (ranged value, short text, long text). */
export const WearFaceScreen: React.FC = () => {
	const t = useT();
	const complication = (value: number, color: string, icon: UIIconName, label: string) => (
		<SysRing value={value} size={46} stroke={4} color={color} track="rgba(255,255,255,0.16)">
			<Stack gap={0} align="center">
				<Icon name={icon} size={13} color={color} stroke={2.4} />
				<Text role="meta" size={12} color={WATCH_INK}>
					{label}
				</Text>
			</Stack>
		</SysRing>
	);
	return (
		<WearRound>
			<Stack gap={6} align="center">
				<Stack row gap={18}>
					{complication(0.5, plan, 'calendar', '45')}
					{complication(1, STREAK, 'flame', '5')}
				</Stack>
				<div style={{fontSize: 46, fontWeight: 700, color: WATCH_INK, letterSpacing: '-0.03em', lineHeight: 1}}>9:41</div>
				<div style={{background: WATCH_CARD, borderRadius: 14, padding: '5px 12px'}}>
					<Text role="meta" size={12} color={tests}>
						{t('10:00 · Problemler', '10:00 · Problems')}
					</Text>
				</div>
			</Stack>
		</WearRound>
	);
};
