import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {APP_SCREENS, type AppScreenName} from '../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame} from '../../../Components/AppScreens/PhoneFrame';
import {StoreLogo, STORES} from '../../../Components/Illustrations/StoreLogo';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {VoiceOrb, type VoiceTrack} from '../../../Components/Overlays/VoiceOrb';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {courseLessonColor} from '../../../Configurations/LessonColors';
import {Icon, type UIIconName} from '../../../UIUX/Icons';

/**
 * The scenes of a camp's episode 0 (CampIntro): an advertising film, not a
 * lesson. Big type that lands on the beat, data drawn as it is said (the
 * exam's questions as cells, the clock, the camp as coloured tiles), the app
 * on phones and one clear next step. Brand navy, paper and orange; each camp
 * lesson in its own lesson colour (Configurations/LessonColors).
 *
 * Every scene is drawn on the 1920 x 1080 reference canvas (u()). Nothing
 * arrives on a timer: each element gets the second its words are heard (`at`,
 * from phraseCues in the template), so a card never lands while the previous
 * one is still being talked about (owner, 26 Oct 2026).
 */

export const INTRO_COLORS = {navy: '#0B1C30', navyDeep: '#06111F', paper: '#F7F4EF', orange: '#EA580C', orangeSoft: '#FFEDD5', white: '#FFFFFF', ink: '#0B1C30', muted: '#5F6B7D', line: '#E5E1DA', right: '#059669', wrong: '#DC2626'} as const;
const C = INTRO_COLORS;
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useSeconds = (): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return frame / fps;
};

/** 0 → 1 between two moments of the scene, eased. */
const useProgress = (from: number, to: number): number => interpolate(useSeconds(), [from, to], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});

/** A springy 0 → 1 that starts at `delay` seconds. */
const usePop = (delay: number): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay * fps, fps, config: {damping: 16, stiffness: 170}});
};

/** Text or a block that rises in at a moment: from below and transparent to in place. */
const Rise: React.FC<{at: number; distance?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, distance = 40, children, style}) => {
	const {u} = useVideoLayout();
	const p = usePop(at);
	return <div style={{opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * u(distance)}px)`, ...style}}>{children}</div>;
};

const Stage: React.FC<{ground: string; children: React.ReactNode}> = ({ground, children}) => (
	<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

const Box: React.FC<{x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => {
	const {u} = useVideoLayout();
	return <div style={{position: 'absolute', left: u(x), top: u(y), width: w === undefined ? undefined : u(w), height: h === undefined ? undefined : u(h), ...style}}>{children}</div>;
};

/** The small series label every scene carries top left: "YKS KAMPI · TYT · 0". */
const Kicker: React.FC<{text: string; color: string}> = ({text, color}) => (
	<Box x={120} y={84}>
		<Text variant="label" size={26} weight={TYPE.weights.display} color={color} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
			{text}
		</Text>
	</Box>
);

const lessonColor = (code: string | undefined, fallback: string = C.orange): string => courseLessonColor(code) ?? fallback;

/** The scene's title, landing first. */
const Title: React.FC<{text: string; color?: string; size?: number}> = ({text, color = C.ink, size = 92}) => (
	<Box x={120} y={140} w={1680}>
		<Rise at={0.1}>
			<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={color} style={{letterSpacing: '-0.03em'}}>
				{text}
			</Text>
		</Rise>
	</Box>
);

// ─── 1. Hook ────────────────────────────────────────────────────────────────

/** Short beats, each slammed in as it is said ("120 soru." "165 dakika." "Tek bir sabah."), on navy; SinoAI's orb listening. */
export const HookScene: React.FC<{beats: readonly string[]; at: readonly number[]; voice: readonly VoiceTrack[]}> = ({beats, at, voice}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	return (
		<Stage ground={`radial-gradient(70% 90% at 80% 10%, #16304F 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`}>
			<div style={{position: 'absolute', left: u(120), top: u(250), display: 'flex', flexDirection: 'column', gap: u(10)}}>
				{beats.map((beat, index) => {
					const shown = now >= at[index];
					const last = index === beats.length - 1;
					const next = at[index + 1] ?? Infinity;
					const scale = interpolate(now, [at[index], at[index] + 0.18], [1.25, 1], CLAMP);
					return (
						<div key={beat} style={{opacity: shown ? (last || now < next ? 1 : 0.38) : 0, transform: `scale(${scale})`, transformOrigin: 'left center'}}>
							<Text variant="display" size={last ? 150 : 128} weight={TYPE.weights.kinetic} color={last ? C.orange : C.white} style={{lineHeight: 1, letterSpacing: '-0.04em'}}>
								{beat}
							</Text>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', right: u(170), bottom: u(150)}}>
				<VoiceOrb size={230} color={C.orange} tracks={voice} delaySeconds={0.3} />
			</div>
		</Stage>
	);
};

// ─── 2. Welcome: the episode card ───────────────────────────────────────────

/** A giant "0", the series and the title, the camp's lesson colours as one stripe, SinoAI greeting. */
export const WelcomeScene: React.FC<{series: string; label: string; title: string; lessons: readonly string[]; voice: readonly VoiceTrack[]}> = ({series, label, title, lessons, voice}) => {
	const {u} = useVideoLayout();
	const zero = usePop(0.1);
	const stripe = useProgress(0.6, 1.8);
	return (
		<Stage ground={C.paper}>
			<Box x={110} y={120}>
				<div style={{transform: `scale(${0.6 + zero * 0.4})`, opacity: zero, transformOrigin: 'left top'}}>
					<Text variant="display" size={760} weight={TYPE.weights.kinetic} color={C.orange} style={{lineHeight: 0.82, letterSpacing: '-0.08em'}}>
						0
					</Text>
				</div>
			</Box>
			<Box x={760} y={300} w={1000}>
				<Rise at={0.35}>
					<Text variant="label" size={34} weight={TYPE.weights.display} color={C.orange} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
						{series}
					</Text>
				</Rise>
				<Rise at={0.55}>
					<Text variant="display" size={118} weight={TYPE.weights.kinetic} color={C.ink} style={{lineHeight: 1.02, letterSpacing: '-0.035em', marginTop: u(14)}}>
						{title}
					</Text>
				</Rise>
				<Rise at={0.8}>
					<Text size={40} weight={TYPE.weights.strong} color={C.muted} style={{marginTop: u(18)}}>
						{label}
					</Text>
				</Rise>
			</Box>
			{/* The camp's lessons as one stripe of their colours, drawn left to right. */}
			<div style={{position: 'absolute', left: u(760), top: u(700), width: u(1000) * stripe, height: u(16), display: 'flex', borderRadius: u(8), overflow: 'hidden'}}>
				{lessons.map((code) => (
					<div key={code} style={{flex: 1, background: lessonColor(code)}} />
				))}
			</div>
			<Box x={760} y={790}>
				<Rise at={1.2}>
					<BrandMark size="card" color={C.ink} />
				</Rise>
			</Box>
			<div style={{position: 'absolute', right: u(130), bottom: u(110)}}>
				<VoiceOrb size={190} color={C.orange} tracks={voice} delaySeconds={0.4} />
			</div>
		</Stage>
	);
};

// ─── 3. The exam's anatomy ──────────────────────────────────────────────────

export type IntroTest = {name: string; questions: number; lesson?: string; parts?: readonly {name: string; questions: number}[]};

const TEST_FALLBACK = ['#BE185D', '#1E40AF', '#8A4B16', '#0F766E', '#475569'];

/**
 * Every question of the exam as a cell, twenty a row. A test's cells fill in
 * its lesson colour and its name lands while the narrator names it; the
 * clock ring runs when the minutes are said.
 */
export const AnatomyScene: React.FC<{kicker: string; exam: string; name: string; questions: number; minutes: number; tests: readonly IntroTest[]; testAt: readonly number[]; clockAt: number}> = ({kicker, exam, name, questions, minutes, tests, testAt, clockAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const perRow = 20;
	const cell = 34;
	const gap = 8;
	const colorOf = (test: IntroTest, index: number) => (test.lesson ? lessonColor(test.lesson) : TEST_FALLBACK[index % TEST_FALLBACK.length]);
	const cells: string[] = tests.flatMap((test, index) => Array.from({length: test.questions}, () => colorOf(test, index)));
	// A test's cells fill from the moment it is named, within about a second, never past the next test's moment.
	const filled = tests.reduce((count, test, index) => {
		const start = testAt[index];
		const end = Math.min(start + 1.1, testAt[index + 1] ?? Infinity);
		const share = interpolate(now, [start, Math.max(start + 0.2, end)], [0, 1], CLAMP);
		const result = count + Math.round(test.questions * share);
		return result;
	}, 0);
	const clock = useProgress(clockAt, clockAt + 1.6);
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={`${exam} · ${name}`} />
			<div style={{position: 'absolute', left: u(120), top: u(330), display: 'grid', gridTemplateColumns: `repeat(${perRow}, ${u(cell)}px)`, gap: u(gap)}}>
				{cells.map((color, index) => (
					<div key={index} style={{width: u(cell), height: u(cell), borderRadius: u(8), background: index < filled ? color : C.line, transform: `scale(${index < filled ? 1 : 0.86})`}} />
				))}
			</div>
			<div style={{position: 'absolute', left: u(1000), top: u(330), width: u(560), display: 'flex', flexDirection: 'column', gap: u(22)}}>
				{tests.map((test, index) => (
					<Rise key={test.name} at={testAt[index]}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
							<div style={{width: u(22), height: u(22), borderRadius: u(6), background: colorOf(test, index)}} />
							<Text size={40} weight={TYPE.weights.display} color={C.ink} style={{flex: 1}}>
								{test.name}
							</Text>
							<Text size={40} weight={TYPE.weights.kinetic} color={C.ink} style={{fontVariantNumeric: 'tabular-nums'}}>
								{test.questions}
							</Text>
						</div>
						{test.parts?.length ? (
							<Text size={24} weight={TYPE.weights.strong} color={C.muted} style={{marginLeft: u(40), marginTop: u(4)}}>
								{test.parts.map((part) => `${part.name} ${part.questions}`).join(' · ')}
							</Text>
						) : null}
					</Rise>
				))}
			</div>
			{/* The clock: the exam's minutes as a ring. */}
			<div style={{position: 'absolute', right: u(110), top: u(110), width: u(220), height: u(220), opacity: Math.min(1, clock * 4)}}>
				<svg width={u(220)} height={u(220)} viewBox="0 0 220 220">
					<circle cx={110} cy={110} r={94} fill="none" stroke={C.line} strokeWidth={16} />
					<circle cx={110} cy={110} r={94} fill="none" stroke={C.orange} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${590 * clock} 600`} transform="rotate(-90 110 110)" />
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<Text size={64} weight={TYPE.weights.kinetic} color={C.ink} align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
						{Math.round(minutes * clock)}
					</Text>
					<Text size={24} weight={TYPE.weights.display} color={C.muted} align="center">
						dakika
					</Text>
				</div>
			</div>
			<Box x={120} y={940}>
				<Text size={34} weight={TYPE.weights.display} color={C.muted}>
					<span style={{color: C.ink, fontWeight: TYPE.weights.kinetic, fontVariantNumeric: 'tabular-nums'}}>{filled}</span> / {questions} soru
				</Text>
			</Box>
		</Stage>
	);
};

// ─── 4. Net ─────────────────────────────────────────────────────────────────

/**
 * A fraction drawn as type over a rule. The division sign "÷" is not in the
 * brand font and came out broken (owner, 26 Oct 2026); a fraction reads at
 * once and needs no special glyph.
 */
const Fraction: React.FC<{top: string; bottom: string; size: number; color: string}> = ({top, bottom, size, color}) => {
	const {u} = useVideoLayout();
	return (
		<span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: `0 ${u(size * 0.12)}px`}}>
			<Text size={size * 0.72} weight={TYPE.weights.kinetic} color={color} align="center" style={{lineHeight: 1.05}}>
				{top}
			</Text>
			<span style={{display: 'block', alignSelf: 'stretch', height: u(Math.max(4, size * 0.06)), borderRadius: u(4), background: color, margin: `${u(size * 0.06)}px 0`}} />
			<Text size={size * 0.72} weight={TYPE.weights.kinetic} color={color} align="center" style={{lineHeight: 1.05}}>
				{bottom}
			</Text>
		</span>
	);
};

export type NetCues = {wrong: number; taken: number; blank: number; example: number};

/**
 * "Dört yanlış bir doğruyu götürür": four red tiles land one by one as it is
 * said, then a green one, struck through when "götürür" is heard; the formula
 * (a real fraction) and the blank-answer rule land with "boş", the worked
 * example with its own words.
 */
export const NetScene: React.FC<{kicker: string; example: {right: number; wrong: number}; at: NetCues}> = ({kicker, example, at}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const strike = interpolate(now, [at.taken, at.taken + 0.35], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
	const net = example.right - example.wrong / 4;
	const counted = interpolate(now, [at.example + 0.6, at.example + 2.2], [example.right, net], CLAMP);
	const Tile: React.FC<{color: string; mark: UIIconName; delay: number; dim?: number}> = ({color, mark, delay, dim = 0}) => {
		const p = usePop(delay);
		return (
			<div style={{position: 'relative', width: u(130), height: u(130), borderRadius: u(30), background: color, opacity: p * (1 - dim * 0.55), transform: `scale(${0.6 + p * 0.4})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${u(18)}px ${u(40)}px rgba(0,0,0,0.3)`}}>
				<Icon name={mark} size={u(70)} color={C.white} stroke={2.6} />
			</div>
		);
	};
	return (
		<Stage ground={`radial-gradient(80% 90% at 20% 0%, #16304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`}>
			<Kicker text={kicker} color={C.orange} />
			<div style={{position: 'absolute', left: u(120), top: u(230), display: 'flex', alignItems: 'center', gap: u(26)}}>
				{[0, 1, 2, 3].map((index) => (
					<Tile key={index} color={C.wrong} mark="x" delay={at.wrong + index * 0.12} />
				))}
				<Rise at={at.wrong + 0.55}>
					<Text variant="display" size={110} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1}}>
						=
					</Text>
				</Rise>
				<div style={{position: 'relative'}}>
					<Tile color={C.right} mark="check" delay={at.wrong + 0.7} dim={strike} />
					{/* The struck-through right answer: the one the four wrong ones take away. */}
					<div style={{position: 'absolute', left: -u(16), top: u(58), width: u(162), height: u(14), borderRadius: u(7), background: C.white, transform: `rotate(-38deg) scaleX(${strike})`, transformOrigin: 'center', boxShadow: `0 0 0 ${u(4)}px ${C.navy}`}} />
				</div>
				<Rise at={at.taken}>
					<Text size={40} weight={TYPE.weights.display} color="rgba(255,255,255,0.75)" style={{maxWidth: u(420), lineHeight: 1.25}}>
						Dört yanlış, bir doğruyu götürür.
					</Text>
				</Rise>
			</div>
			<Box x={120} y={500} w={1680}>
				<Rise at={at.blank}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(22)}}>
						<Text variant="display" size={100} weight={TYPE.weights.kinetic} color={C.white} style={{letterSpacing: '-0.03em'}}>
							Net = Doğru −
						</Text>
						<Fraction top="Yanlış" bottom="4" size={100} color={C.white} />
					</div>
				</Rise>
				<Rise at={at.blank + 0.3}>
					<div style={{display: 'inline-flex', marginTop: u(26), padding: `${u(12)}px ${u(26)}px`, borderRadius: u(999), background: 'rgba(255,255,255,0.12)'}}>
						<Text size={36} weight={TYPE.weights.display} color={C.white}>
							Boş bırakılan soru kaybettirmez.
						</Text>
					</div>
				</Rise>
			</Box>
			<Box x={120} y={880}>
				<Rise at={at.example}>
					<Text size={44} weight={TYPE.weights.display} color="rgba(255,255,255,0.8)">
						{example.right} doğru, {example.wrong} yanlış →{' '}
						<span style={{color: C.orange, fontWeight: TYPE.weights.kinetic, fontVariantNumeric: 'tabular-nums'}}>{counted.toFixed(counted % 1 ? 2 : 0).replace('.', ',')} net</span>
					</Text>
				</Rise>
			</Box>
		</Stage>
	);
};

// ─── 5. Score ───────────────────────────────────────────────────────────────

/** YKS puanı as one bar, split TYT 40 / AYT 60 with the part this camp covers lit; each fact card lands as it is said. */
export const ScoreScene: React.FC<{kicker: string; focus: 'TYT' | 'AYT'; cards: readonly {title: string; text: string}[]; cardAt: readonly number[]}> = ({kicker, focus, cards, cardAt}) => {
	const {u} = useVideoLayout();
	const grow = useProgress(0.5, 1.6);
	const part = (label: string, share: number, lit: boolean) => (
		<div style={{width: `${share * 100}%`, height: '100%', background: lit ? C.orange : C.navy, opacity: lit ? 1 : 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Text size={44} weight={TYPE.weights.kinetic} color={C.white} align="center">
				{label} %{Math.round(share * 100)}
			</Text>
		</div>
	);
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text="YKS puanı nereden gelir?" />
			<div style={{position: 'absolute', left: u(120), top: u(330), width: u(1680) * grow, height: u(120), borderRadius: u(28), overflow: 'hidden', display: 'flex'}}>
				{part('TYT', 0.4, focus === 'TYT')}
				{part('AYT', 0.6, focus === 'AYT')}
			</div>
			<div style={{position: 'absolute', left: u(120), top: u(540), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: u(28)}}>
				{cards.map((card, index) => (
					<Rise key={card.title} at={cardAt[index]}>
						<div style={{minHeight: u(300), boxSizing: 'border-box', padding: u(36), borderRadius: u(32), background: C.white, border: `${u(2)}px solid ${C.line}`, boxShadow: `0 ${u(20)}px ${u(50)}px -${u(30)}px rgba(11,28,48,0.35)`}}>
							<Text size={44} weight={TYPE.weights.kinetic} color={C.ink}>
								{card.title}
							</Text>
							<Text size={32} weight={TYPE.weights.strong} color={C.muted} style={{marginTop: u(14), lineHeight: 1.35}}>
								{card.text}
							</Text>
						</div>
					</Rise>
				))}
			</div>
		</Stage>
	);
};

// ─── 6. The camp's map ──────────────────────────────────────────────────────

export type IntroCampLesson = {code: string; name: string; topics: number};

/**
 * One tile per camp, in its lesson colour with its lesson count (the map, all
 * at once); the total counts up until it is said, the first camp lights up
 * when it is named, the pace lands with its words.
 */
export const CampMapScene: React.FC<{kicker: string; lessons: readonly IntroCampLesson[]; first: string; cadence: string; totalAt: number; firstAt: number; cadenceAt: number}> = ({kicker, lessons, first, cadence, totalAt, firstAt, cadenceAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const total = lessons.reduce((sum, lesson) => sum + lesson.topics, 0);
	const counted = Math.round(interpolate(now, [0.6, Math.max(1.2, totalAt)], [0, total], CLAMP));
	const columns = Math.min(5, lessons.length);
	const lit = interpolate(now, [firstAt, firstAt + 0.3], [0, 1], CLAMP);
	const glow = 0.5 + 0.5 * Math.sin(now * 3);
	return (
		<Stage ground={C.white}>
			<Kicker text={kicker} color={C.orange} />
			<Box x={120} y={130}>
				<Rise at={0.1}>
					<div style={{display: 'flex', alignItems: 'baseline', gap: u(24)}}>
						<Text variant="display" size={150} weight={TYPE.weights.kinetic} color={C.orange} style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em'}}>
							{counted}
						</Text>
						<Text variant="display" size={64} weight={TYPE.weights.kinetic} color={C.ink}>
							ders · {counted} kısa video
						</Text>
					</div>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(370), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: u(22)}}>
				{lessons.map((lesson, index) => {
					const isFirst = lesson.code === first;
					return (
						<Rise key={lesson.code} at={0.4 + index * 0.08}>
							<div style={{position: 'relative', height: u(230), boxSizing: 'border-box', padding: u(26), borderRadius: u(30), background: lessonColor(lesson.code), color: C.white, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: isFirst && lit > 0 ? `0 0 0 ${u(6)}px ${C.white}, 0 0 0 ${u((12 + glow * 8) * lit)}px ${C.orange}` : `0 ${u(16)}px ${u(36)}px -${u(24)}px rgba(0,0,0,0.5)`}}>
								<Text size={38} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1.08}}>
									{lesson.name}
								</Text>
								<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
									<Text size={58} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1}}>
										{lesson.topics}
									</Text>
									<Text size={26} weight={TYPE.weights.display} color="rgba(255,255,255,0.85)">
										ders
									</Text>
								</div>
								{isFirst ? (
									<div style={{position: 'absolute', top: -u(20), right: u(20), padding: `${u(6)}px ${u(16)}px`, borderRadius: u(999), background: C.orange, opacity: lit, transform: `scale(${0.8 + 0.2 * lit})`}}>
										<Text size={22} weight={TYPE.weights.kinetic} color={C.white}>
											Başlıyoruz
										</Text>
									</div>
								) : null}
							</div>
						</Rise>
					);
				})}
			</div>
			<Box x={120} y={930}>
				<Rise at={cadenceAt}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: u(14), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: C.orangeSoft}}>
						<Icon name="calendar" size={u(34)} color={C.orange} stroke={2.2} />
						<Text size={34} weight={TYPE.weights.display} color={C.orange}>
							{cadence}
						</Text>
					</div>
				</Rise>
			</Box>
		</Stage>
	);
};

// ─── 7. A camp episode ──────────────────────────────────────────────────────

export type IntroPart = {icon: UIIconName; title: string; text: string};

/** What every camp lesson brings: each card lands when the narrator gets to it. */
export const EpisodeScene: React.FC<{kicker: string; title: string; parts: readonly IntroPart[]; partAt: readonly number[]}> = ({kicker, title, parts, partAt}) => {
	const {u} = useVideoLayout();
	return (
		<Stage ground={C.paper}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={title} />
			<div style={{position: 'absolute', left: u(120), top: u(360), width: u(1680), display: 'grid', gridTemplateColumns: `repeat(${parts.length}, 1fr)`, gap: u(26)}}>
				{parts.map((part, index) => (
					<Rise key={part.title} at={partAt[index]} distance={70}>
						<div style={{height: u(520), boxSizing: 'border-box', padding: u(40), borderRadius: u(36), background: index === 0 ? C.navy : C.white, border: index === 0 ? undefined : `${u(2)}px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: u(24), boxShadow: `0 ${u(24)}px ${u(60)}px -${u(36)}px rgba(11,28,48,0.45)`}}>
							<div style={{width: u(96), height: u(96), borderRadius: u(28), background: index === 0 ? C.orange : C.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name={part.icon} size={u(52)} color={index === 0 ? C.white : C.orange} stroke={2.2} />
							</div>
							<Text size={48} weight={TYPE.weights.kinetic} color={index === 0 ? C.white : C.ink} style={{lineHeight: 1.1}}>
								{part.title}
							</Text>
							<Text size={32} weight={TYPE.weights.strong} color={index === 0 ? 'rgba(255,255,255,0.82)' : C.muted} style={{lineHeight: 1.35}}>
								{part.text}
							</Text>
						</div>
					</Rise>
				))}
			</div>
		</Stage>
	);
};

// ─── 8. Method ──────────────────────────────────────────────────────────────

const STEP_CIRCLE = 240;

/**
 * Steps as numbered circles, each landing when its number is said. The line
 * between them is drawn at the pace of the narration: it leaves a circle when
 * that step is said and reaches the next one exactly when the next is said,
 * rather than shooting across at once (owner, 26 Oct 2026). Each step's words
 * sit centred under its circle.
 */
export const MethodScene: React.FC<{kicker: string; title: string; steps: readonly string[]; stepAt: readonly number[]}> = ({kicker, title, steps, stepAt}) => {
	const {u} = useVideoLayout();
	const now = useSeconds();
	const width = 1680;
	const column = width / steps.length;
	const centre = (index: number) => 120 + column * index + column / 2;
	// How far along the line is, in steps: 0 at the first circle, steps.length - 1 at the last.
	let along = 0;
	for (let index = 0; index < steps.length - 1; index++) {
		along += interpolate(now, [stepAt[index] + 0.2, Math.max(stepAt[index] + 0.4, stepAt[index + 1])], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.quad)});
	}
	const lineTop = 400 + STEP_CIRCLE / 2 - 3;
	return (
		<Stage ground={`radial-gradient(80% 90% at 85% 100%, #16304F 0%, ${C.navy} 60%, ${C.navyDeep} 100%)`}>
			<Kicker text={kicker} color={C.orange} />
			<Title text={title} color={C.white} />
			<div style={{position: 'absolute', left: u(centre(0)), top: u(lineTop), width: u(column * along), height: u(6), background: C.orange, borderRadius: u(3)}} />
			{steps.map((text, index) => (
				<Box key={text} x={120 + column * index} y={400} w={column}>
					<Rise at={stepAt[index]}>
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<div style={{width: u(STEP_CIRCLE), height: u(STEP_CIRCLE), borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${u(14)}px rgba(234,88,12,0.18)`}}>
								<Text variant="display" size={140} weight={TYPE.weights.kinetic} color={C.white} align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
									{index + 1}
								</Text>
							</div>
							<Text size={48} weight={TYPE.weights.kinetic} color={C.white} align="center" style={{marginTop: u(44), lineHeight: 1.15, maxWidth: u(column - 60)}}>
								{text}
							</Text>
						</div>
					</Rise>
				</Box>
			))}
		</Stage>
	);
};

// ─── 9. The app ─────────────────────────────────────────────────────────────

export type IntroScreen = {screen: AppScreenName; caption: string};

/** The camp continues in Sınavika: phones rise on the brand orange as their module is named, each with its line above it. */
export const AppScene: React.FC<{kicker: string; title: string; screens: readonly IntroScreen[]; screenAt: readonly number[]}> = ({kicker, title, screens, screenAt}) => {
	const {u} = useVideoLayout();
	// The phones bleed off the bottom edge on purpose (ad framing); their lines sit above them, always readable.
	const width = 360;
	const gap = 110;
	const totalWidth = screens.length * width + (screens.length - 1) * gap;
	return (
		<Stage ground={`linear-gradient(140deg, #F26B1D 0%, ${C.orange} 45%, #C2410C 100%)`}>
			<Kicker text={kicker} color={C.white} />
			<Title text={title} color={C.white} size={88} />
			{screens.map((item, index) => {
				const Screen = APP_SCREENS[item.screen].Component;
				const x = (1920 - totalWidth) / 2 + index * (width + gap);
				return (
					<Box key={item.screen + index} x={x} y={300} w={width}>
						<Rise at={screenAt[index] + 0.15}>
							<div style={{width: u(width), padding: `${u(14)}px ${u(18)}px`, boxSizing: 'border-box', borderRadius: u(22), background: C.white, marginBottom: u(26)}}>
								<Text size={30} weight={TYPE.weights.display} color={C.ink} align="center" style={{lineHeight: 1.2}}>
									{item.caption}
								</Text>
							</div>
						</Rise>
						<Rise at={screenAt[index]} distance={160}>
							<div style={{transform: `rotate(${(index - (screens.length - 1) / 2) * 3}deg)`}}>
								<PhoneFrame width={u(width)} style={{boxShadow: `0 ${u(40)}px ${u(90)}px rgba(0,0,0,0.35)`}}>
									<Screen />
								</PhoneFrame>
							</div>
						</Rise>
					</Box>
				);
			})}
		</Stage>
	);
};

// ─── 10. Closing ────────────────────────────────────────────────────────────

/** The next step: the first lesson as a card in its colour, then "abone ol" and the stores as they are said; SinoAI's orb says goodbye. */
export const ClosingScene: React.FC<{next: {lesson: string; title: string; code: string}; subscribeAt: number; storesAt: number; voice: readonly VoiceTrack[]}> = ({next, subscribeAt, storesAt, voice}) => {
	const {u} = useVideoLayout();
	const color = lessonColor(next.code);
	const card = usePop(0.2);
	return (
		<Stage ground={`radial-gradient(70% 90% at 20% 0%, #16304F 0%, ${C.navy} 55%, ${C.navyDeep} 100%)`}>
			<Box x={120} y={150}>
				<Rise at={0.05}>
					<Text variant="label" size={30} weight={TYPE.weights.display} color={C.orange} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
						Sıradaki video
					</Text>
				</Rise>
			</Box>
			<div style={{position: 'absolute', left: u(120), top: u(230), width: u(900), height: u(500), borderRadius: u(44), background: color, padding: u(56), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transform: `scale(${0.85 + card * 0.15}) rotate(${(1 - card) * -4}deg)`, opacity: card, boxShadow: `0 ${u(40)}px ${u(100)}px rgba(0,0,0,0.45)`}}>
				<Text size={40} weight={TYPE.weights.display} color="rgba(255,255,255,0.86)">
					{next.lesson}
				</Text>
				<Text variant="display" size={104} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1.02, letterSpacing: '-0.03em'}}>
					{next.title}
				</Text>
				<div style={{display: 'flex', alignItems: 'center', gap: u(16)}}>
					<div style={{width: u(76), height: u(76), borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="play" size={u(38)} color={color} stroke={2.4} />
					</div>
					<Text size={34} weight={TYPE.weights.display} color={C.white}>
						Kampın ilk dersi
					</Text>
				</div>
			</div>
			<Box x={1110} y={250} w={690}>
				<Rise at={subscribeAt}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: u(16), padding: `${u(22)}px ${u(36)}px`, borderRadius: u(999), background: C.white}}>
						<Icon name="bell" size={u(40)} color={C.orange} stroke={2.4} />
						<Text size={42} weight={TYPE.weights.kinetic} color={C.ink}>
							Kanala abone ol
						</Text>
					</div>
				</Rise>
				<Rise at={storesAt - 0.2}>
					<Text size={36} weight={TYPE.weights.strong} color="rgba(255,255,255,0.82)" style={{marginTop: u(40), lineHeight: 1.35}}>
						Kampın devamı ve testler Sınavika'da:
					</Text>
				</Rise>
				<div style={{display: 'flex', gap: u(18), marginTop: u(22)}}>
					{STORES.map((store, index) => (
						<Rise key={store.id} at={storesAt + index * 0.15}>
							<div style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(18)}px ${u(28)}px`, borderRadius: u(22), background: 'rgba(255,255,255,0.12)', border: `${u(2)}px solid rgba(255,255,255,0.3)`}}>
								<StoreLogo store={store.id} size={u(38)} color={C.white} />
								<Text size={32} weight={TYPE.weights.display} color={C.white}>
									{store.label}
								</Text>
							</div>
						</Rise>
					))}
				</div>
				<Rise at={storesAt + 0.5}>
					<div style={{marginTop: u(70)}}>
						<BrandMark size="card" color={C.white} />
					</div>
				</Rise>
			</Box>
			<div style={{position: 'absolute', right: u(120), bottom: u(90)}}>
				<VoiceOrb size={150} color={C.orange} tracks={voice} delaySeconds={0.4} />
			</div>
		</Stage>
	);
};
