import React from 'react';
import {useColors, useModuleColors, useT, useUI} from '../../Context';
import {Icon} from '../../Icons';
import {HandText, Highlight, InkArrow, InkCheck, InkLayer, InkLine, InkLoop, InkUnderline, usePen, type PenColor} from '../../Parts/Ink';
import {Button, Card, Chip, OptionRow, Stack, Text, Toggle} from '../../Parts/Shared';
import {InkNote, PenToolbar, QuestionStrip, RoundButton, Scratchpad, SolveBar, Tablet, TimerProgress} from '../../Parts/Tablet';
import {UI_RADIUS, UI_SHADOW} from '../../Tokens';

/**
 * Solving with the pen on a tablet: Denemeler (exam) and Testler (tests).
 * Two pen surfaces, as in the app's annotation kit: the scratchpad (Taslak
 * kâğıdı, a right column in landscape, a lower sheet in portrait) and the
 * question itself (Soruya yaz: highlight, underline, cross options out).
 * The pencil draws and a finger scrolls; Kaydır / Çiz shows only when finger
 * drawing is on.
 */

/* ------------------------------------------------------------------ shared parts */

type InkMark = 'strike' | 'loop' | 'question' | 'check';

/** An option with the student's ink on it: crossed out, circled, a question mark, a tick. */
export const InkOption: React.FC<{letter: string; text: string; mark?: InkMark; state?: 'idle' | 'selected' | 'correct' | 'wrong'; dim?: number; color?: PenColor}> = ({letter, text, mark, state = 'idle', dim = 1, color = 'red'}) => {
	const stroke = usePen(color);
	return (
		<div style={{position: 'relative'}}>
			<div style={{opacity: mark === 'strike' && state === 'idle' ? 0.55 : 1}}>
				<OptionRow letter={letter} text={text} state={state} />
			</div>
			{mark === 'strike' ? (
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: 52, right: 26, top: 0, height: '100%', width: 'calc(100% - 78px)', overflow: 'visible', opacity: dim}}>
					<path d="M0 62 C30 55 60 50 100 40" fill="none" stroke={stroke} strokeWidth={2.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
				</svg>
			) : null}
			{mark === 'loop' ? (
				<svg width={58} height={58} viewBox="0 0 58 58" style={{position: 'absolute', left: 1, top: '50%', marginTop: -29, overflow: 'visible', opacity: dim}}>
					<InkLoop cx={29} cy={29} rx={23} ry={21} color={color === 'red' ? 'blue' : color} width={2.8} />
				</svg>
			) : null}
			{mark === 'question' ? (
				<svg width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', right: 10, top: '50%', marginTop: -20, overflow: 'visible', opacity: dim}}>
					<HandText text="?" x={12} y={6} size={28} color="blue" width={2.8} />
				</svg>
			) : null}
			{mark === 'check' ? (
				<svg width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', right: 12, top: '50%', marginTop: -18, overflow: 'visible', opacity: dim}}>
					<InkCheck x={4} y={6} size={28} color="green" />
				</svg>
			) : null}
		</div>
	);
};

/** Ink underline under an inline phrase. */
const Under: React.FC<{color?: PenColor; children: React.ReactNode}> = ({color = 'blue', children}) => {
	const stroke = usePen(color);
	return (
		<span style={{position: 'relative', whiteSpace: 'nowrap'}}>
			{children}
			<svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{position: 'absolute', left: -2, right: -2, bottom: -5, width: 'calc(100% + 4px)', height: 8, overflow: 'visible'}}>
				<path d="M0 5 C25 7 55 3 100 4" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
			</svg>
		</span>
	);
};

const QuestionCard: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
	const colors = useColors();
	return <div style={{position: 'relative', boxSizing: 'border-box', borderRadius: UI_RADIUS.xl, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0, ...style}}>{children}</div>;
};

/** Bottom of a solving column: previous, the question strip, skip and next. */
const SolveFoot: React.FC<{states: (0 | 1 | 2 | 3 | 4)[]; start: number; next?: string; skip?: boolean}> = ({states, start, next, skip = true}) => {
	const t = useT();
	return (
		<Stack row gap={12} style={{marginTop: 'auto'}}>
			<Button tone="ghost" icon="left" />
			<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
				<QuestionStrip states={states} start={start} />
			</div>
			{skip ? <Button tone="soft">{t('Boş bırak', 'Skip')}</Button> : null}
			<Button iconRight="right">{next ?? t('Sonraki', 'Next')}</Button>
		</Stack>
	);
};

const EXAM_STEM = {
	tr: 'Bir sınıftaki öğrencilerin %40’ı kızdır. Sınıfa 6 kız öğrenci katıldığında kızların oranı %50 oluyor. Buna göre sınıfta başlangıçta kaç öğrenci vardır?',
	en: '40% of a class are girls. When 6 girls join, girls make up 50%. How many students were there at first?',
};
const EXAM_OPTIONS = ['24', '30', '36', '40', '48'];

/** The student's working of the exam question, in scratchpad points. */
const ExamWorking: React.FC<{scale?: number}> = ({scale = 1}) => {
	const t = useT();
	const s = (value: number) => value * scale;
	return (
		<>
			<HandText text={t('kız: 0,4x', 'girls: 0,4x')} x={s(26)} y={s(26)} size={s(24)} color="blue" seed={2} width={2.3 * scale} />
			<HandText text="0,4x + 6 = 0,5(x + 6)" x={s(26)} y={s(88)} size={s(25)} seed={4} width={2.4 * scale} />
			<HandText text="0,4x + 6 = 0,5x + 3" x={s(26)} y={s(150)} size={s(25)} seed={6} width={2.4 * scale} />
			<HandText text="3 = 0,1x" x={s(70)} y={s(212)} size={s(25)} seed={8} width={2.4 * scale} />
			<HandText text="x = 30" x={s(70)} y={s(278)} size={s(30)} seed={9} width={2.7 * scale} />
			<InkLoop cx={s(122)} cy={s(296)} rx={s(72)} ry={s(32)} color="red" width={2.6 * scale} />
			<InkArrow from={[s(208), s(296)]} to={[s(282), s(262)]} bend={s(18)} color="red" width={2.4 * scale} />
			<HandText text="B" x={s(296)} y={s(238)} size={s(30)} color="red" seed={1} width={2.7 * scale} />
			<InkLine points={[[s(26), s(352)], [s(160), s(349)], [s(330), s(353)]]} color="ink" width={1.4 * scale} opacity={0.35} />
			<HandText text={t('kontrol: 12 + 6 = 18', 'check: 12 + 6 = 18')} x={s(26)} y={s(380)} size={s(21)} color="green" seed={12} width={2.1 * scale} />
			<HandText text="18 / 36 = %50" x={s(26)} y={s(426)} size={s(21)} color="green" seed={14} width={2.1 * scale} />
			<InkCheck x={s(230)} y={s(424)} size={s(26)} color="green" width={2.6 * scale} />
		</>
	);
};

/* ------------------------------------------------------------------ Denemeler */

/** Landscape: the question on the left, the scratchpad as a right column (38 %), the pen toolbar docked to the paper's edge. */
export const ExamScratchScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Tablet module="exam">
			<SolveBar title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Temel Matematik', 'Basic Maths')} center={<TimerProgress time="1:42:18" value={0.38} label={t('kaldı', 'left')} />} scratch right={<Button size="sm">{t('Bitir', 'Finish')}</Button>} />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard style={{flex: 1}}>
					<Stack row justify="space-between">
						<Chip>{t('Soru 46 / 120', 'Question 46 / 120')}</Chip>
						<Chip tone="outline" icon="bookmark">
							{t('İşaretle', 'Flag')}
						</Chip>
					</Stack>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t(EXAM_STEM.tr, EXAM_STEM.en)}
					</Text>
					<Stack gap={9}>
						{EXAM_OPTIONS.map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} state={index === 1 ? 'selected' : 'idle'} module="exam" />
						))}
					</Stack>
					<SolveFoot states={[1, 3, 1, 4, 2, 0, 0]} start={42} />
				</QuestionCard>
				<Scratchpad width={454} height="100%" page={t('Soru 46 · 1 / 1', 'Q 46 · 1 / 1')}>
					<InkLayer width={380} height={620}>
						<ExamWorking />
					</InkLayer>
					<PenToolbar vertical tool="pen" color="ink" width="medium" style={{position: 'absolute', right: 10, top: 10}} />
					<div style={{position: 'absolute', left: 16, bottom: 14}}>
						<InkNote>{t('Taslak bu soruya kayıtlı', 'Saved with this question')}</InkNote>
					</div>
				</Scratchpad>
			</Stack>
		</Tablet>
	);
};

const PARAGRAPH = {
	tr: [
		'Şehirde büyüyen çocuklar doğayı çoğu zaman ekranlardan tanıyor. ',
		'Oysa',
		' bir yaprağın dokusunu, toprağın kokusunu hiçbir görüntü tam olarak aktaramaz. Doğayla doğrudan temas, çocuğun merakını besleyen ',
		'en güçlü öğretmendir',
		'. ',
		'Bu yüzden',
		' okullar, derslerin bir kısmını açık havaya taşımalıdır.',
	],
	en: ['Children growing up in cities mostly meet nature on screens. ', 'Yet', ' no picture can fully pass on the feel of a leaf or the smell of soil. Direct contact with nature is ', 'the strongest teacher', ' of a child’s curiosity. ', 'That is why', ' schools should move some lessons outdoors.'],
};

const PARAGRAPH_OPTIONS = {
	tr: ['Ekranlar çocukların dikkatini dağıtmaktadır.', 'Şehirlerde yeşil alanlar giderek azalmaktadır.', 'Doğayı doğrudan yaşamak çocuğun öğrenmesini güçlendirir.', 'Yaprakların dokusu türden türe farklılık gösterir.', 'Okulların ders saatleri yeniden düzenlenmelidir.'],
	en: ['Screens distract children.', 'Green spaces in cities are shrinking.', 'Living nature first-hand strengthens a child’s learning.', 'The texture of leaves differs by species.', 'School hours should be rearranged.'],
};

/** Writing on the question: highlight, underline, a margin note, options crossed out. The pencil draws; the finger still scrolls. */
export const ExamMarkupScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const {lang} = useUI();
	const p = PARAGRAPH[lang];
	const options = PARAGRAPH_OPTIONS[lang];
	return (
		<Tablet module="exam">
			<SolveBar title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Türkçe', 'Turkish')} center={<TimerProgress time="2:31:04" value={0.06} label={t('kaldı', 'left')} />} overlay right={<Button size="sm">{t('Bitir', 'Finish')}</Button>} />
			<Stack row gap={18} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<PenToolbar vertical tool="highlighter" color="yellow" width="thick" clear={false} style={{alignSelf: 'center'}} />
				<QuestionCard style={{flex: 1, flexDirection: 'row', gap: 22}}>
					<Stack gap={14} style={{flex: 1}}>
						<Stack row justify="space-between">
							<Chip>{t('Soru 7 / 120', 'Question 7 / 120')}</Chip>
							<Text role="meta">{t('Soruya yazıyorsun · sayfa kalemle kaymaz, parmakla kayar', 'Writing on the question · the pencil draws, a finger scrolls')}</Text>
						</Stack>
						<Text role="body" size={18} color={colors.ink} style={{lineHeight: '31px'}}>
							{p[0]}
							<Under>{p[1]}</Under>
							{p[2]}
							<Highlight>{p[3]}</Highlight>
							{p[4]}
							<Under>{p[5]}</Under>
							{p[6]}
						</Text>
						<Text role="headline" size={17} color={colors.ink}>
							{t('Bu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?', 'What is the main idea of this passage?')}
						</Text>
						<Stack gap={9}>
							{options.map((option, index) => (
								<InkOption key={option} letter={'ABCDE'[index]} text={option} mark={index === 2 ? 'loop' : index === 4 ? 'question' : 'strike'} state={index === 2 ? 'selected' : 'idle'} />
							))}
						</Stack>
						<SolveFoot states={[1, 1, 1, 4, 2, 0, 0]} start={3} />
					</Stack>
					<div style={{position: 'relative', width: 200, flexShrink: 0, borderLeft: `1px dashed ${colors.line}`}}>
						<InkLayer width={200} height={300}>
							<InkArrow from={[86, 128]} to={[10, 112]} bend={-10} color="blue" />
							<HandText text={t('oysa:', 'yet:')} x={24} y={70} size={20} color="blue" seed={3} width={2.2} />
							<HandText text={t('asıl fikir', 'main idea')} x={24} y={142} size={22} color="blue" seed={5} width={2.3} />
							<HandText text={t('sonuç:', 'so:')} x={24} y={204} size={20} color="red" seed={7} width={2.2} />
							<HandText text={t('açık hava', 'outdoors')} x={24} y={240} size={20} color="red" seed={9} width={2.2} />
						</InkLayer>
					</div>
				</QuestionCard>
			</Stack>
		</Tablet>
	);
};

/** Portrait: the question on top, the scratchpad as a lower sheet; finger drawing on, so Kaydır / Çiz shows. */
export const ExamPortraitScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Tablet module="exam" portrait>
			<SolveBar compact title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Temel Matematik', 'Basic Maths')} center={<TimerProgress time="1:42:18" value={0.38} label={t('kaldı', 'left')} />} scratch right={<Button size="sm">{t('Bitir', 'Finish')}</Button>} />
			<Stack gap={16} style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard>
					<Stack row justify="space-between">
						<Chip>{t('Soru 46 / 120', 'Question 46 / 120')}</Chip>
						<Chip tone="outline" icon="bookmark">
							{t('İşaretle', 'Flag')}
						</Chip>
					</Stack>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t(EXAM_STEM.tr, EXAM_STEM.en)}
					</Text>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9}}>
						{EXAM_OPTIONS.map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} state={index === 1 ? 'selected' : 'idle'} module="exam" />
						))}
					</div>
					<SolveFoot states={[1, 1, 3, 1, 4, 2, 0, 0]} start={41} skip={false} />
				</QuestionCard>
				<div style={{position: 'relative', flex: 1}}>
					<div style={{position: 'absolute', top: -10, left: '50%', marginLeft: -24, width: 48, height: 5, borderRadius: 3, background: colors.line, zIndex: 2}} />
					<Scratchpad width="100%" height="100%" page={t('Soru 46 · 1 / 1', 'Q 46 · 1 / 1')}>
						<InkLayer width={780} height={520}>
							<g transform="translate(10 0)">
								<ExamWorking scale={0.92} />
							</g>
						</InkLayer>
						<PenToolbar tool="pen" color="ink" width="medium" finger mode="draw" style={{position: 'absolute', left: '50%', bottom: 16, transform: 'translateX(-50%)'}} />
					</Scratchpad>
				</div>
			</Stack>
		</Tablet>
	);
};

/** Solutions: the student's own ink comes back read-only on the question; the scratchpad sits next to the official solution. */
export const ExamSolutionNotesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Tablet module="exam">
			<SolveBar pen={false} title={t('TYT Deneme 5 · Çözümler', 'TYT Exam 5 · Solutions')} sub={t('Temel Matematik', 'Basic Maths')} center={<QuestionStrip states={[1, 1, 3, 1, 4, 2, 0, 0, 0, 0]} start={41} />} right={<RoundButton icon="eye" on label={t('Notlarım', 'My notes')} />} />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard style={{flex: 1}}>
					<Stack row justify="space-between">
						<Chip>{t('Soru 46 · Temel Matematik', 'Question 46 · Basic Maths')}</Chip>
						<Chip tone="success" icon="check">
							{t('Doğru', 'Correct')}
						</Chip>
					</Stack>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t(EXAM_STEM.tr, EXAM_STEM.en)}
					</Text>
					<Stack gap={9}>
						{EXAM_OPTIONS.map((option, index) => (
							<InkOption key={option} letter={'ABCDE'[index]} text={option} state={index === 1 ? 'correct' : 'idle'} mark={index === 0 || index === 4 ? 'strike' : undefined} dim={0.6} />
						))}
					</Stack>
					<Stack row gap={10} style={{marginTop: 'auto', padding: '12px 14px', borderRadius: UI_RADIUS.md, background: colors.line2}}>
						<Icon name="pen" size={18} color={colors.ink2} />
						<Text role="small" color={colors.ink2} style={{flex: 1}}>
							{t('Çözerken yaptığın işaretler burada salt okunur. Silmek ya da düzenlemek için soruyu tekrar çöz.', 'The marks you made while solving show here read-only.')}
						</Text>
						<Toggle on />
					</Stack>
				</QuestionCard>
				<Stack gap={16} style={{width: 454, flexShrink: 0}}>
					<Card padding={20}>
						<Stack gap={10}>
							<Text role="over" color={mod.ink}>
								{t('Çözüm', 'Solution')}
							</Text>
							<Text role="body">
								{t('Başta x öğrenci varsa kız sayısı 0,4x. 6 kız gelince: 0,4x + 6 = 0,5(x + 6) → 0,1x = 3 → x = 30.', 'With x students, girls are 0.4x. After 6 join: 0.4x + 6 = 0.5(x + 6) → 0.1x = 3 → x = 30.')}
							</Text>
							<Text role="small">{t('Doğru cevap B. Bu soruyu adayların %58’i doğru yaptı.', 'Answer B. 58% of candidates got it right.')}</Text>
						</Stack>
					</Card>
					<Scratchpad width="100%" height={380} title={t('Taslağın', 'Your scratchpad')} page={t('salt okunur', 'read-only')}>
						<InkLayer width={420} height={320}>
							<ExamWorking scale={0.68} />
						</InkLayer>
					</Scratchpad>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Testler */

const WORK_STEM = {tr: 'Bir işi Ali 6 günde, Ayşe 12 günde bitiriyor. İkisi birlikte bu işi kaç günde bitirir?', en: 'Ali finishes a job in 6 days, Ayşe in 12. How many days do they need together?'};

/** A test with immediate feedback: the right answer, the working on the scratchpad next to it. */
export const TestScratchScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Tablet module="tests">
			<SolveBar title={t('Soru 5 / 20', 'Question 5 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} center={<Chip tone="success">{t('4 doğru', '4 right')}</Chip>} scratch />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard style={{flex: 1}}>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t(WORK_STEM.tr, WORK_STEM.en)}
					</Text>
					<Stack gap={9}>
						<OptionRow letter="A" text="3" />
						<OptionRow letter="B" text="4" state="correct" />
						<OptionRow letter="C" text="9" />
						<OptionRow letter="D" text="18" />
					</Stack>
					<Stack gap={12} style={{marginTop: 'auto', padding: 16, borderRadius: UI_RADIUS.lg, background: colors.successSoft, border: `1.5px solid ${colors.success}`}}>
						<Stack row gap={10}>
							<div style={{width: 34, height: 34, borderRadius: 17, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="check" size={18} color="#FFFFFF" />
							</div>
							<Stack gap={2} grow>
								<Text role="headline" color={colors.successInk}>
									{t('Doğru! Seriyi sürdürdün.', 'Correct! Streak kept.')}
								</Text>
								<Text role="small" color={colors.ink2}>
									{t('Bir günde 1/6 + 1/12 = 1/4 iş → 4 gün.', 'Per day 1/6 + 1/12 = 1/4 of the job → 4 days.')}
								</Text>
							</Stack>
							<Button size="md" style={{background: '#047857', boxShadow: 'none'}}>
								{t('Devam', 'Continue')}
							</Button>
						</Stack>
					</Stack>
				</QuestionCard>
				<Scratchpad width={454} height="100%" page={t('Soru 5 · 1 / 1', 'Q 5 · 1 / 1')}>
					<InkLayer width={380} height={620}>
						<HandText text={t('1 günde:', 'per day:')} x={26} y={28} size={22} color="blue" seed={2} />
						<HandText text="1/6 + 1/12" x={26} y={84} size={28} seed={3} />
						<HandText text="= 2/12 + 1/12" x={26} y={148} size={28} seed={5} />
						<HandText text="= 3/12 = 1/4" x={26} y={212} size={28} seed={7} />
						<InkUnderline x1={140} x2={226} y={250} color="red" />
						<HandText text={t('4 gün', '4 days')} x={60} y={286} size={32} color="red" seed={8} width={2.8} />
						<InkLoop cx={118} cy={306} rx={76} ry={32} color="red" />
					</InkLayer>
					<PenToolbar vertical tool="pen" color="red" width="medium" style={{position: 'absolute', right: 10, top: 10}} />
				</Scratchpad>
			</Stack>
		</Tablet>
	);
};

/** A wrong answer: the scratchpad shows where it went wrong; SinoAI can look at the working. */
export const TestWrongScratchScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const sino = useModuleColors('sinoAi');
	return (
		<Tablet module="tests">
			<SolveBar title={t('Soru 5 / 20', 'Question 5 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} center={<Chip tone="success">{t('3 doğru', '3 right')}</Chip>} scratch />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard style={{flex: 1}}>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t(WORK_STEM.tr, WORK_STEM.en)}
					</Text>
					<Stack gap={9}>
						<OptionRow letter="A" text="3" />
						<OptionRow letter="B" text="4" state="correct" />
						<OptionRow letter="C" text="9" state="wrong" />
						<OptionRow letter="D" text="18" />
					</Stack>
					<Stack gap={12} style={{marginTop: 'auto', padding: 16, borderRadius: UI_RADIUS.lg, background: colors.errorSoft, border: `1.5px solid ${colors.error}`}}>
						<Stack row gap={10} align="flex-start">
							<div style={{width: 34, height: 34, borderRadius: 17, background: colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Icon name="x" size={18} color="#FFFFFF" />
							</div>
							<Stack gap={2} grow>
								<Text role="headline" color={colors.errorInk}>
									{t('Doğrusu B: 4 gün', 'The answer is B: 4 days')}
								</Text>
								<Text role="small" color={colors.ink2}>
									{t('Günleri değil, bir günde yapılan işi topla: 1/6 + 1/12 = 1/4.', 'Add the work per day, not the days: 1/6 + 1/12 = 1/4.')}
								</Text>
							</Stack>
						</Stack>
						<Stack row gap={10}>
							<Button tone="module" module="sinoAi" icon="sparkles" style={{flex: 1}}>
								{t('Taslağımı SinoAI’ye göster', 'Show my working to SinoAI')}
							</Button>
							<Button tone="module" module="lessons" icon="book" style={{flex: 1}}>
								{t('İş problemleri mikro dersi', 'Work problems lesson')}
							</Button>
						</Stack>
					</Stack>
				</QuestionCard>
				<Scratchpad width={454} height="100%" page={t('Soru 5 · 1 / 1', 'Q 5 · 1 / 1')}>
					<InkLayer width={420} height={620}>
						<HandText text="6 + 12 = 18" x={44} y={40} size={28} seed={3} />
						<HandText text="18 ÷ 2 = 9" x={44} y={104} size={28} seed={5} />
						<InkLoop cx={132} cy={92} rx={112} ry={70} color="red" seed={9} />
						<HandText text={t('günler toplanmaz!', 'don’t add days!')} x={44} y={186} size={20} color="red" seed={11} width={2.2} />
						<InkLine points={[[26, 232], [200, 229], [380, 233]]} width={1.2} opacity={0.3} />
						<HandText text="1/6 + 1/12 = 1/4" x={26} y={262} size={26} color="green" seed={13} />
						<HandText text={t('4 gün', '4 days')} x={26} y={318} size={26} color="green" seed={15} />
						<InkCheck x={146} y={318} size={26} color="green" />
					</InkLayer>
					<div style={{position: 'absolute', left: 16, right: 16, bottom: 16, padding: '12px 14px', borderRadius: UI_RADIUS.md, background: sino.wash, border: `1px solid ${sino.line}`, display: 'flex', gap: 10, alignItems: 'flex-start'}}>
						<Icon name="sparkles" size={18} color={sino.ink} />
						<Text role="small" color={colors.ink2} style={{flex: 1}}>
							{t('SinoAI taslağını yalnız sen istediğinde görür. Okuduğu satırları önce sana gösterir.', 'SinoAI sees your working only when you ask, and shows you what it read first.')}
						</Text>
					</div>
				</Scratchpad>
			</Stack>
		</Tablet>
	);
};

/** A figure question: the pencil writes on the figure itself (angles, the missing value). */
export const TestFigureScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	const w = 440;
	const k = w / 280;
	const label = {fontFamily: 'inherit', fontSize: 15, fontWeight: 800, fill: colors.ink};
	const angle = {fontFamily: 'inherit', fontSize: 14, fontWeight: 700, fill: mod.ink};
	return (
		<Tablet module="tests">
			<SolveBar title={t('Soru 3 / 20', 'Question 3 / 20')} sub={t('Üçgende açılar · Kolay', 'Angles in triangles · Easy')} center={<Chip tone="success">{t('2 doğru', '2 right')}</Chip>} overlay />
			<Stack row gap={18} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<PenToolbar vertical tool="pen" color="blue" width="medium" style={{alignSelf: 'center'}} />
				<QuestionCard style={{flex: 1, flexDirection: 'row', gap: 26, alignItems: 'stretch'}}>
					<Stack gap={14} style={{flex: 1}}>
						<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
							{t('Şekildeki ABC üçgeninde verilenlere göre x kaç derecedir?', 'In triangle ABC, what is x in degrees?')}
						</Text>
						<div style={{position: 'relative', width: w, height: (w * 246) / 280, alignSelf: 'center'}}>
							<svg width={w} height={(w * 246) / 280} viewBox="0 0 280 246" style={{display: 'block'}}>
								<polygon points="117,14 40,224 240,224" fill={mod.wash} stroke={colors.ink} strokeWidth={2.2} strokeLinejoin="round" />
								<text x={111} y={10} style={label}>A</text>
								<text x={22} y={238} style={label}>B</text>
								<text x={246} y={238} style={label}>C</text>
								<text x={104} y={58} style={angle}>50°</text>
								<text x={58} y={214} style={angle}>70°</text>
								<text x={208} y={214} style={angle}>x</text>
							</svg>
							<InkLayer width={w} height={(w * 246) / 280}>
								<InkLoop cx={212 * k} cy={209 * k} rx={18} ry={16} color="blue" />
								<HandText text="= 60°" x={226 * k} y={168 * k} size={26} color="blue" seed={4} width={2.6} />
								<HandText text="180 - 120" x={262} y={60} size={22} color="red" seed={6} />
								<InkLine points={[[300, 96], [318, 180], [338, 236]]} color="red" width={1.8} opacity={0.6} />
							</InkLayer>
						</div>
					</Stack>
					<Stack gap={9} style={{width: 260, flexShrink: 0, justifyContent: 'center'}}>
						<InkOption letter="A" text="50" mark="strike" />
						<InkOption letter="B" text="60" mark="loop" state="selected" color="blue" />
						<InkOption letter="C" text="70" mark="strike" />
						<InkOption letter="D" text="80" mark="strike" />
						<Button block style={{marginTop: 10}}>
							{t('Cevapla', 'Answer')}
						</Button>
					</Stack>
				</QuestionCard>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ first-use tip */

/** The first time a tablet with a pen opens a solving screen: one tip at the pen toggle. */
export const PenTipScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const {lang} = useUI();
	const ink = useModuleColors('exam').ink;
	const hole = {x: 974, y: 38, w: 138, h: 50};
	return (
		<Tablet
			module="exam"
			overlay={
				<div style={{position: 'absolute', inset: 0, zIndex: 30}}>
					<div style={{position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: 24, boxShadow: '0 0 0 4px rgba(255,255,255,0.95), 0 0 0 3000px rgba(11, 28, 48, 0.62)'}} />
					<div style={{position: 'absolute', left: hole.x - 300, top: hole.y + hole.h + 20, width: 440, borderRadius: 22, background: colors.card, padding: 20, boxShadow: UI_SHADOW.float, boxSizing: 'border-box'}}>
						<div style={{position: 'absolute', left: 300 + hole.w / 2 - 8, top: -7, width: 16, height: 16, background: colors.card, transform: 'rotate(45deg)'}} />
						<Text role="over" color={ink}>
							{t('İpucu', 'Tip')}
						</Text>
						<Text role="section" style={{marginTop: 6}}>
							{t('Kalemle doğrudan soruya yaz', 'Write straight on the question')}
						</Text>
						<Text role="body" style={{marginTop: 4}}>
							{t('Altını çiz, şıkları ele, kenara not al. Kalem çizer, parmağın sayfayı kaydırır. İşlem için Taslak kâğıdı yanda açılır.', 'Underline, cross options out, add notes. The pencil draws, your finger scrolls. The scratchpad opens on the side.')}
						</Text>
						<Stack row justify="flex-end" style={{marginTop: 14}}>
							<Button size="sm">{t('Anladım', 'Got it')}</Button>
						</Stack>
					</div>
				</div>
			}
		>
			<SolveBar title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Türkçe', 'Turkish')} center={<TimerProgress time="2:44:59" value={0.0} label={t('kaldı', 'left')} />} right={<Button size="sm">{t('Bitir', 'Finish')}</Button>} />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<QuestionCard style={{flex: 1}}>
					<Chip>{t('Soru 1 / 120', 'Question 1 / 120')}</Chip>
					<Text role="body" size={18} color={colors.ink} style={{lineHeight: '31px'}}>
						{PARAGRAPH[lang].join('')}
					</Text>
					<Stack gap={9}>
						{PARAGRAPH_OPTIONS[lang].map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} />
						))}
					</Stack>
				</QuestionCard>
			</Stack>
		</Tablet>
	);
};
