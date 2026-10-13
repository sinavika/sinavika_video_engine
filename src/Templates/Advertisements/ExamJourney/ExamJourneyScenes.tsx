import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {APP_SCREENS} from '../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame} from '../../../Components/AppScreens/PhoneFrame';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import type {ExamJourneyContent} from './ExamJourneySchema';

type Content = ExamJourneyContent;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** The canvas every scene is designed on, in reference pixels: the safe area of vertical video. Other formats scale it to fit. */
const CANVAS = {width: 952, height: 1530};
const OPTION_LETTERS = 'ABCDE';

const useSeconds = (): number => useCurrentFrame() / useVideoConfig().fps;

/** 0 to 1, landing without overshoot, starting `delaySeconds` into the scene. */
const useLand = (delaySeconds = 0, stiffness = 160): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delaySeconds * fps, fps, config: {damping: 20, mass: 0.7, stiffness}});
};

/** The three surfaces the ad is built from: flat colour, no gradients, no glow. */
const usePaint = () => {
	const {colors} = useTheme();
	return {
		brand: {fill: colors.primary, ink: colors.onPrimary, soft: withAlpha(colors.onPrimary, 0.24), mark: colors.onPrimary},
		paper: {fill: colors.background, ink: colors.text, soft: colors.border, mark: colors.primary},
		night: {fill: colors.text, ink: colors.background, soft: withAlpha(colors.background, 0.16), mark: colors.primary},
	};
};
type Paint = ReturnType<typeof usePaint>[keyof ReturnType<typeof usePaint>];

/** A full-bleed colour with the design canvas centred in the safe area. */
const Canvas: React.FC<{paint: Paint; subtitle?: React.ReactNode; children: React.ReactNode}> = ({paint, subtitle, children}) => {
	const {u, contentWidth, contentHeight, safeArea} = useVideoLayout();
	const scale = Math.min(contentWidth / u(CANVAS.width), contentHeight / u(CANVAS.height));
	return (
		<AbsoluteFill style={{backgroundColor: paint.fill, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: safeArea.left, top: safeArea.top, width: contentWidth, height: contentHeight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'relative', width: u(CANVAS.width), height: u(CANVAS.height), flexShrink: 0, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column'}}>
					{children}
					{subtitle}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** The narration as a subtitle. Not drawn when the screen already says the same words. */
const Subtitle: React.FC<{content: Content; text: string; shown: string; paint: Paint}> = ({content, text, shown, paint}) => {
	const {u} = useVideoLayout();
	const land = useLand(0.3);
	const plain = (value: string) => value.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, '');
	if (!content.subtitles || plain(text) === plain(shown)) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', opacity: land}}>
			<div style={{padding: `${u(14)}px ${u(28)}px`, borderRadius: u(18), backgroundColor: paint.ink}}>
				<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.strong} align="center" color={paint.fill}>
					{text}
				</Text>
			</div>
		</div>
	);
};

/** A headline that is uncovered from left to right by a block of colour: print, not kinetic type. */
const Headline: React.FC<{text: string; paint: Paint; delaySeconds?: number; size?: number}> = ({text, paint, delaySeconds = 0.15, size = TYPE.adScale.headline}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const cover = interpolate(seconds - delaySeconds, [0, 0.28, 0.56], [0, 1, 2], CLAMP);
	return (
		<div style={{position: 'relative', alignSelf: 'flex-start', flexShrink: 0}}>
			<div style={{clipPath: `inset(0 ${cover >= 1 ? 0 : 100}% 0 0)`, paddingBottom: u(size * 0.18)}}>
				<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={paint.ink} style={{lineHeight: TYPE.displayLineHeight}}>
					{text}
				</Text>
			</div>
			<div style={{position: 'absolute', top: 0, bottom: 0, left: `${Math.max(0, cover - 1) * 100}%`, right: `${Math.max(0, 1 - cover) * 100}%`, backgroundColor: paint.mark}} />
		</div>
	);
};

const clock = (totalSeconds: number): string => `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;

/** The exam clock, counting down in real time from the exam's length. */
const useClock = (content: Content, offsetSeconds = 0): string => clock(Math.max(0, content.start.minutes * 60 - Math.floor(useSeconds() + offsetSeconds)));

export const StartScene: React.FC<{content: Content}> = ({content}) => {
	const {typography} = useTheme();
	const {u} = useVideoLayout();
	const paint = usePaint().brand;
	const seconds = useSeconds();
	const time = useClock(content);
	const land = useLand(0, 120);
	const tick = Math.exp(-(seconds % 1) * 9);
	const ring = u(820);
	const circumference = Math.PI * (ring - u(16));

	return (
		<Canvas paint={paint} subtitle={<Subtitle content={content} text={content.start.narration} shown={content.start.headline} paint={paint} />}>
			<div style={{alignSelf: 'flex-start', padding: `${u(16)}px ${u(30)}px`, borderRadius: u(999), border: `${u(4)}px solid ${paint.ink}`, opacity: land}}>
				<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={paint.ink}>
					{content.start.exam}
				</Text>
			</div>
			<div style={{position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				{/* The dial: it fills as the scene plays and breathes once a second, like a clock that has just been started. */}
				<svg width={ring} height={ring} style={{position: 'absolute', transform: `rotate(-90deg) scale(${interpolate(land, [0, 1], [0.7, 1]) + tick * 0.012})`}}>
					<circle cx={ring / 2} cy={ring / 2} r={(ring - u(16)) / 2} fill="none" stroke={paint.soft} strokeWidth={u(16)} />
					<circle cx={ring / 2} cy={ring / 2} r={(ring - u(16)) / 2} fill="none" stroke={paint.ink} strokeWidth={u(16)} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - interpolate(seconds, [0.1, 3], [0, 0.34], CLAMP))} />
				</svg>
				<Text variant="display" size={TYPE.adScale.numeral} weight={TYPE.weights.kinetic} color={paint.ink} style={{fontFamily: typography.mono, letterSpacing: '-0.06em', transform: `scale(${interpolate(land, [0, 1], [1.5, 1])})`, opacity: land}}>
					{time}
				</Text>
			</div>
			<Headline text={content.start.headline} paint={{...paint, mark: paint.ink}} delaySeconds={0.5} size={TYPE.adScale.hook} />
			<div style={{height: u(170), flexShrink: 0}} />
		</Canvas>
	);
};

const PICK_SECONDS = 1.9;

export const SolveScene: React.FC<{content: Content}> = ({content}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const paint = usePaint().paper;
	const seconds = frame / fps;
	const time = useClock(content, 71 * 60 + 18);
	const card = useLand(0.35);
	const press = spring({frame: frame - PICK_SECONDS * fps, fps, config: {damping: 12, mass: 0.5, stiffness: 220}});
	const picked = seconds >= PICK_SECONDS;

	return (
		<Canvas paint={paint} subtitle={<Subtitle content={content} text={content.solve.narration} shown={content.solve.headline} paint={paint} />}>
			<Headline text={content.solve.headline} paint={paint} />
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: u(70), opacity: card}}>
				<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={paint.ink}>
					{content.solve.context}
				</Text>
				<div style={{padding: `${u(10)}px ${u(24)}px`, borderRadius: u(999), backgroundColor: withAlpha(colors.primary, 0.14)}}>
					<Text size={TYPE.adScale.action} weight={TYPE.weights.display} color={colors.primaryText}>
						{time}
					</Text>
				</div>
			</div>
			<div style={{marginTop: u(34), padding: u(44), borderRadius: u(40), backgroundColor: colors.surface, border: `${u(3)}px solid ${paint.soft}`, opacity: card, transform: `translateY(${(1 - card) * u(50)}px)`}}>
				<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.strong} color={colors.onSurface} style={{fontSize: u(TYPE.adScale.subtitle * 1.25), lineHeight: 1.3}}>
					{content.solve.question}
				</Text>
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(22), marginTop: u(30)}}>
				{content.solve.options.map((option, index) => {
					const enter = spring({frame: frame - (0.6 + index * 0.09) * fps, fps, config: {damping: 18, mass: 0.6, stiffness: 180}});
					const chosen = picked && index === content.solve.pick;
					return (
						<div
							key={`${option}-${index}`}
							style={{
								position: 'relative',
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								gap: u(26),
								padding: `${u(24)}px ${u(34)}px`,
								borderRadius: u(36),
								backgroundColor: chosen ? withAlpha(colors.primary, 0.14) : colors.surface,
								border: `${u(3)}px solid ${chosen ? colors.primary : paint.soft}`,
								opacity: enter,
								transform: `translateX(${(1 - enter) * u(-120)}px) scale(${chosen ? 0.96 + 0.04 * press : 1})`,
							}}
						>
							{chosen ? <div style={{position: 'absolute', left: u(74) - u(600) * press, top: '50%', width: u(1200) * press, height: u(1200) * press, marginTop: -u(600) * press, borderRadius: '50%', backgroundColor: withAlpha(colors.primary, 0.16 * (1 - press))}} /> : null}
							<div style={{width: u(80), height: u(80), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: chosen ? colors.primary : colors.surfaceAlt, flexShrink: 0}}>
								<Text size={TYPE.adScale.action} weight={TYPE.weights.display} color={chosen ? colors.onPrimary : colors.onSurface}>
									{OPTION_LETTERS[index]}
								</Text>
							</div>
							<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.strong} color={colors.onSurface} style={{fontSize: u(TYPE.adScale.subtitle * 1.4)}}>
								{option}
							</Text>
						</div>
					);
				})}
			</div>
		</Canvas>
	);
};

const CHART = {width: 952, height: 980};

export const ResultScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const paint = usePaint().night;
	const seconds = useSeconds();
	const {trend} = content.result;
	const [low, high] = [Math.min(...trend), Math.max(...trend)];
	const [width, height] = [u(CHART.width), u(CHART.height)];
	const inset = u(30);
	const points = trend.map((value, index) => ({
		x: inset + (index / (trend.length - 1)) * (width - inset * 2),
		y: height - inset - ((value - low) / Math.max(1, high - low)) * (height - inset * 2 - u(80)),
	}));
	const length = points.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
	const drawn = interpolate(seconds, [0.5, 2.3], [0, 1], {...CLAMP, easing: (t) => 1 - (1 - t) ** 3});
	const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
	const last = points[points.length - 1];
	const dot = useLand(2.2, 240);
	const caption = useLand(0.4);

	return (
		<Canvas paint={paint} subtitle={<Subtitle content={content} text={content.result.narration} shown={content.result.headline} paint={paint} />}>
			<Headline text={content.result.headline} paint={paint} />
			<div style={{marginTop: u(50), opacity: caption}}>
				<Text variant="label" size={TYPE.adScale.action} weight={TYPE.weights.strong} color={withAlpha(paint.ink, 0.7)}>
					{content.result.caption}
				</Text>
			</div>
			<svg width={width} height={height} style={{marginTop: u(20), overflow: 'visible'}}>
				{[0.25, 0.5, 0.75, 1].map((row) => (
					<line key={row} x1={0} x2={width} y1={height * row - u(2)} y2={height * row - u(2)} stroke={paint.soft} strokeWidth={u(3)} />
				))}
				<path d={`${path} L${last.x} ${height} L${points[0].x} ${height} Z`} fill={paint.mark} opacity={0.22 * interpolate(seconds, [1.6, 2.6], [0, 1], CLAMP)} />
				<path d={path} fill="none" stroke={paint.mark} strokeWidth={u(14)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={length} strokeDashoffset={length * (1 - drawn)} />
				{points.map((point, index) => {
					const reached = drawn >= index / (trend.length - 1) - 0.001;
					return <circle key={index} cx={point.x} cy={point.y} r={u(11)} fill={paint.fill} stroke={paint.mark} strokeWidth={u(6)} opacity={reached ? 1 : 0} />;
				})}
				<circle cx={last.x} cy={last.y} r={u(26) * dot} fill={paint.mark} />
				<circle cx={last.x} cy={last.y} r={u(26) + u(60) * ((seconds * 0.9) % 1)} fill="none" stroke={paint.mark} strokeWidth={u(5)} opacity={dot * (1 - ((seconds * 0.9) % 1))} />
			</svg>
		</Canvas>
	);
};

export const GapsScene: React.FC<{content: Content}> = ({content}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const paint = usePaint().paper;
	const {lessons} = content.gaps;
	const weakest = lessons.reduce((lowest, lesson, index) => (lesson.level < lessons[lowest].level ? index : lowest), 0);
	const point = spring({frame: frame - 1.7 * fps, fps, config: {damping: 13, mass: 0.6, stiffness: 190}});

	return (
		<Canvas paint={paint} subtitle={<Subtitle content={content} text={content.gaps.narration} shown={content.gaps.headline} paint={paint} />}>
			<Headline text={content.gaps.headline} paint={paint} />
			<div style={{display: 'flex', flexDirection: 'column', gap: u(84), marginTop: u(120)}}>
				{lessons.map((lesson, index) => {
					const grow = spring({frame: frame - (0.45 + index * 0.14) * fps, fps, config: {damping: 22, mass: 0.9, stiffness: 90}});
					const marked = index === weakest;
					const fade = marked ? 1 : 1 - 0.55 * point;
					return (
						<div key={lesson.name} style={{display: 'flex', flexDirection: 'column', gap: u(22), opacity: fade}}>
							<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: u(76)}}>
								<Text size={TYPE.adScale.subtitle} weight={TYPE.weights.display} color={paint.ink} style={{fontSize: u(TYPE.adScale.subtitle * 1.55)}}>
									{lesson.name}
								</Text>
								{marked ? (
									<div style={{padding: `${u(12)}px ${u(26)}px`, borderRadius: u(999), backgroundColor: paint.ink, opacity: point, transform: `scale(${0.6 + 0.4 * point})`, transformOrigin: 'right center'}}>
										<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={paint.fill}>
											{content.gaps.tag}
										</Text>
									</div>
								) : null}
							</div>
							<div style={{position: 'relative', height: u(60), borderRadius: u(30), backgroundColor: colors.surfaceAlt, outline: marked ? `${u(6) * point}px solid ${paint.ink}` : undefined, outlineOffset: u(8)}}>
								<div style={{width: `${lesson.level * grow * 100}%`, height: '100%', borderRadius: u(30), backgroundColor: colors.primary}} />
							</div>
						</div>
					);
				})}
			</div>
		</Canvas>
	);
};

export const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const paints = usePaint();
	const paint = paints.paper;
	const seconds = useSeconds();
	const disc = useLand(0.1, 70);
	const phone = useLand(0.3, 80);
	const Screen = APP_SCREENS[content.product.screen].Component;

	return (
		<Canvas paint={paint} subtitle={<Subtitle content={content} text={content.product.narration} shown={content.product.headline} paint={paint} />}>
			<Headline text={content.product.headline} paint={paint} />
			<div style={{position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', marginTop: u(60)}}>
				{/* A flat disc of the brand colour rises behind the phone: the product on its own ground. */}
				<div style={{position: 'absolute', left: '50%', top: u(190), width: u(1500), height: u(1500), marginLeft: -u(750), borderRadius: '50%', backgroundColor: paints.brand.fill, transform: `translateY(${(1 - disc) * u(1300)}px)`}} />
				<div style={{transform: `translateY(${(1 - phone) * u(1400) + Math.sin(seconds * 1.2) * u(6)}px) rotate(${interpolate(phone, [0, 1], [14, -5])}deg)`, transformOrigin: 'center bottom'}}>
					<PhoneFrame width={u(560)} mode={content.appMode} style={{boxShadow: `0 ${u(36)}px ${u(90)}px rgba(0, 0, 0, 0.3)`}}>
						<Screen />
					</PhoneFrame>
				</div>
			</div>
		</Canvas>
	);
};

export const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const paint = usePaint().brand;
	const logo = useLand(0.05, 130);
	const action = useLand(0.4, 200);
	const rest = useLand(0.7);

	return (
		<Canvas paint={paint}>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: u(56)}}>
				<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.8, 1])})`}}>
					<BrandMark size="hero" color={paint.ink} />
				</div>
				<div style={{padding: `${u(30)}px ${u(60)}px`, borderRadius: u(999), backgroundColor: paint.ink, opacity: action, transform: `translateY(${(1 - action) * u(60)}px)`}}>
					<Text variant="display" size={TYPE.adScale.action} weight={TYPE.weights.kinetic} color={paint.fill} style={{fontSize: u(TYPE.adScale.action * 1.5)}}>
						{content.closing.callToAction}
					</Text>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(14), opacity: rest}}>
					<Text variant="display" size={TYPE.adScale.closing} weight={TYPE.weights.display} color={paint.ink}>
						{content.closing.website}
					</Text>
					<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={paint.ink}>
						{content.closing.stores.join('  ·  ')}
					</Text>
				</div>
			</div>
		</Canvas>
	);
};
