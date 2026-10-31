import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * A slot machine for choosing what to study (Kasım 2026, 1 Kasım): three reels
 * of lesson names spin on a navy stage lit by orange bulbs. Pulled twice it
 * gives nonsense ("Paragraf, Paragraf, Paragraf"; "Tarih, ?, ?"), then the
 * reels lock on the real chain (last exam, missing topic, today's task) and
 * turn into the day's plan on the phone. No casino colours: navy, white and
 * the brand orange only.
 */

const narration = z.string().trim().min(1).max(170);
const label = plainText(16);

const SlotSpinSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	/** The names on the reels while they spin. */
	reel: z.array(label).min(5).max(12),
	/** Two pulls that come out wrong, each three windows; "?" leaves a window blank. */
	pulls: z.array(z.tuple([label, label, label])).length(2),
	spin: z.object({narration}),
	/** Where the reels lock: the real chain, left to right. */
	lock: z.object({windows: z.tuple([label, label, label]), narration}),
	product: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), lines: z.array(plainText(28)).min(1).max(3), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof SlotSpinSchema>;

const NAVY = '#0B1C30';
const DEEP = '#07121F';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const RED = '#EF4444';

const MACHINE = {x: 40, y: 400, w: 852, h: 600};
const WINDOW = {w: 236, h: 330, gap: 26};
const ROW = 112;

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(80% 55% at 50% 45%, #15304F 0%, ${NAVY} 55%, ${DEEP} 100%)`}} />
);

/** Bulbs around the machine, chasing. */
const Bulbs: React.FC<{alarm: number}> = ({alarm}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const count = 22;
	const bulbs = Array.from({length: count}, (_, index) => {
		const t = index / count;
		const perimeter = 2 * (MACHINE.w + MACHINE.h);
		let d = t * perimeter;
		let x = 0;
		let y = 0;
		if (d < MACHINE.w) [x, y] = [d, 0];
		else if ((d -= MACHINE.w) < MACHINE.h) [x, y] = [MACHINE.w, d];
		else if ((d -= MACHINE.h) < MACHINE.w) [x, y] = [MACHINE.w - d, MACHINE.h];
		else [x, y] = [0, MACHINE.h - (d - MACHINE.w)];
		const lit = (Math.floor(seconds * 9) + index) % 3 === 0;
		return {x, y, lit};
	});
	return (
		<>
			{bulbs.map((bulb, index) => (
				<div key={index} style={{position: 'absolute', left: u(MACHINE.x + bulb.x - 9), top: u(MACHINE.y + bulb.y - 9), width: u(18), height: u(18), borderRadius: '50%', background: alarm > 0.5 ? RED : bulb.lit ? ORANGE : 'rgba(255,255,255,0.25)', boxShadow: bulb.lit || alarm > 0.5 ? `0 0 ${u(18)}px ${alarm > 0.5 ? RED : ORANGE}` : 'none'}} />
			))}
		</>
	);
};

/** One reel window. `offset` is how far the strip has run, in rows; `stop` shows a fixed word instead. */
const Reel: React.FC<{names: readonly string[]; offset: number; stop?: string; index: number; glow?: number}> = ({names, offset, stop, index, glow = 0}) => {
	const {u} = useVideoLayout();
	const x = MACHINE.x + 39 + index * (WINDOW.w + WINDOW.gap);
	const y = MACHINE.y + 150;
	const base = Math.floor(offset);
	const frac = offset - base;
	const blur = stop === undefined ? Math.min(10, Math.abs(offset - Math.floor(offset)) * 0 + 6) : 0;
	return (
		<div style={{position: 'absolute', left: u(x), top: u(y), width: u(WINDOW.w), height: u(WINDOW.h), borderRadius: u(22), background: WHITE, overflow: 'hidden', boxShadow: `inset 0 ${u(30)}px ${u(30)}px -${u(20)}px rgba(11,28,48,0.35), inset 0 -${u(30)}px ${u(30)}px -${u(20)}px rgba(11,28,48,0.35), 0 0 0 ${u(6)}px ${glow > 0 ? ORANGE : '#1E3A5F'}`}}>
			{stop !== undefined ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: u(12)}}>
					<Text variant="display" size={stop === '?' ? 130 : 46} weight={TYPE.weights.kinetic} color={stop === '?' ? '#94A3B8' : NAVY} align="center" style={{lineHeight: 1.05}}>
						{stop}
					</Text>
				</div>
			) : (
				<div style={{position: 'absolute', left: 0, right: 0, top: u(-ROW + frac * ROW + WINDOW.h / 2 - ROW / 2), filter: `blur(${u(blur)}px)`}}>
					{[0, 1, 2, 3, 4].map((row) => (
						<div key={row} style={{height: u(ROW), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Text variant="display" size={42} weight={TYPE.weights.kinetic} color={NAVY} align="center">
								{names[(((base - row + index * 3) % names.length) + names.length) % names.length]}
							</Text>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

/** The cabinet: body, header plate, three windows and the lever on the right. */
const Machine: React.FC<{names: readonly string[]; spin: (index: number) => number; stops: readonly (string | undefined)[]; pull: number; alarm?: number; glow?: number}> = ({names, spin, stops, pull, alarm = 0, glow = 0}) => {
	const {u} = useVideoLayout();
	return (
		<>
			<div style={{position: 'absolute', left: u(MACHINE.x), top: u(MACHINE.y), width: u(MACHINE.w), height: u(MACHINE.h), borderRadius: u(48), background: 'linear-gradient(180deg, #1E3A5F 0%, #12263F 100%)', boxShadow: `0 ${u(40)}px ${u(90)}px rgba(0,0,0,0.5), inset 0 ${u(2)}px 0 rgba(255,255,255,0.15)`}} />
			<At x={MACHINE.x + 160} y={MACHINE.y + 40} w={MACHINE.w - 320}>
				<div style={{padding: `${u(14)}px 0`, borderRadius: u(999), background: alarm > 0.5 ? RED : ORANGE, textAlign: 'center'}}>
					<Text variant="display" size={36} weight={TYPE.weights.kinetic} color={WHITE} align="center" style={{letterSpacing: '0.12em'}}>
						{alarm > 0.5 ? 'OLMADI' : 'DERS ÇARKI'}
					</Text>
				</div>
			</At>
			{[0, 1, 2].map((index) => (
				<Reel key={index} names={names} offset={spin(index)} stop={stops[index]} index={index} glow={glow} />
			))}
			{/* The lever: a rod from the side of the cabinet, pulled down and springing back. */}
			<div style={{position: 'absolute', left: u(MACHINE.x + MACHINE.w + 6), top: u(MACHINE.y + 220), width: u(40), height: u(70), borderRadius: u(12), background: '#1E3A5F'}} />
			<div style={{position: 'absolute', left: u(MACHINE.x + MACHINE.w + 20), top: u(MACHINE.y + 250), width: u(14), height: u(240), transformOrigin: '50% 100%', transform: `translateY(-${u(240)}px) rotate(${pull * 150}deg)`, background: '#CBD5E1', borderRadius: u(8)}}>
				<div style={{position: 'absolute', left: u(-20), top: u(-40), width: u(54), height: u(54), borderRadius: '50%', background: ORANGE, boxShadow: `0 0 ${u(30)}px ${ORANGE}`}} />
			</div>
		</>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	return (
		<Stage>
			<Bulbs alarm={0} />
			<Machine names={content.reel} spin={(index) => seconds * (14 + index * 2)} stops={[]} pull={0} />
			<At y={70} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
			</At>
			<At y={190} w={952}>
				<Slam text={content.hook.lines[1]} at={0.3} size={TYPE.adScale.headline * 1.1} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** Paper notes falling past the machine: the tired way of picking a lesson. */
const FallingNotes: React.FC<{from: number}> = ({from}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<>
			{[0, 1, 2, 3, 4, 5].map((index) => {
				const t = seconds - from - index * 0.18;
				if (t < 0) return null;
				const x = index % 2 ? 760 - index * 20 : 40 + index * 30;
				return (
					<div key={index} style={{position: 'absolute', left: u(x), top: u(-120 + t * 900), width: u(150), height: u(110), background: '#F8FAFC', borderRadius: u(10), transform: `rotate(${(index % 2 ? 1 : -1) * (12 + t * 90)}deg)`, boxShadow: `0 ${u(10)}px ${u(20)}px rgba(0,0,0,0.3)`, padding: u(14), boxSizing: 'border-box'}}>
						{[0, 1, 2].map((line) => (
							<div key={line} style={{height: u(8), width: `${90 - line * 20}%`, borderRadius: u(4), background: '#94A3B8', marginBottom: u(14)}} />
						))}
					</div>
				);
			})}
		</>
	);
};

const SpinScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	const half = total / 2;
	const pull = (at: number) => interpolate(seconds, [at, at + 0.15, at + 0.45], [0, 1, 0], CLAMP);
	const second = seconds >= half;
	const local = second ? seconds - half : seconds;
	const stopAt = (index: number) => 0.35 + index * 0.18;
	const pullIndex = second ? 1 : 0;
	const stops = [0, 1, 2].map((index) => (local >= stopAt(index) ? content.pulls[pullIndex][index] : undefined));
	const alarm = second && local > stopAt(2) ? Math.floor(local * 8) % 2 : 0;
	return (
		<Stage>
			<Bulbs alarm={alarm} />
			<FallingNotes from={0.4} />
			{[0, half].map((start) => (
				<React.Fragment key={start}>
					<SoundEffect id="lever" atSeconds={start} />
					{[0, 1, 2].map((index) => <SoundEffect key={index} id="reelStop" atSeconds={start + stopAt(index)} />)}
				</React.Fragment>
			))}
			<Machine names={content.reel} spin={(index) => seconds * (16 + index * 3)} stops={stops} pull={Math.max(pull(0), pull(half))} alarm={alarm} />
			<At y={1080} w={952}>
				<div style={{opacity: interpolate(local, [stopAt(2), stopAt(2) + 0.1], [0, 1], CLAMP)}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={second ? RED : WHITE} align="center">
						{second ? 'Yine olmadı.' : 'Yine mi paragraf?'}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const LockScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	// The reels slow down one by one and lock on the chain; then the windows lift off as the day's cards.
	const lockAt = (index: number) => 0.6 + index * 0.45;
	const stops = [0, 1, 2].map((index) => (seconds >= lockAt(index) ? content.lock.windows[index] : undefined));
	const slow = (index: number) => {
		const until = lockAt(index);
		const t = Math.min(seconds, until);
		return t * 12 - (t * t * 12) / (2 * until);
	};
	const arrows = ease(interpolate(seconds, [lockAt(2), lockAt(2) + 0.4], [0, 1], CLAMP));
	const lift = ease(interpolate(seconds, [total - 1.1, total - 0.2], [0, 1], CLAMP));
	return (
		<Stage>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - lift, transform: `translateY(${-lift * u(200)}px)`}}>
				<Bulbs alarm={0} />
				<Machine names={content.reel} spin={slow} stops={stops} pull={interpolate(seconds, [0, 0.15, 0.45], [0, 1, 0], CLAMP)} glow={arrows} />
				{[0, 1].map((index) => (
					<div key={index} style={{position: 'absolute', left: u(MACHINE.x + 39 + (index + 1) * (WINDOW.w + WINDOW.gap) - WINDOW.gap / 2 - 22), top: u(MACHINE.y + 150 + WINDOW.h / 2 - 22), width: u(44), height: u(44), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: arrows, transform: `scale(${arrows})`}}>
						<Icon name="right" size={u(28)} color={WHITE} stroke={3} />
					</div>
				))}
			</div>
			<SoundEffect id="lever" atSeconds={0} />
			{[0, 1, 2].map((index) => <SoundEffect key={index} id="reelStop" atSeconds={lockAt(index)} />)}
			<SoundEffect id="success" atSeconds={lockAt(2) + 0.1} />
			<SoundEffect id="transitionWhoosh" atSeconds={total - 1.1} volume={0.7} />
			<At y={1100} w={952}>
				<div style={{opacity: arrows * (1 - lift)}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						Şans değil, veri.
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const ProductScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const land = useLand(0.05, 150, 20);
	const Screen = PROMO_PHONE_SCREENS[content.product.screen];
	return (
		<Stage>
			<At x={476 - 270} y={250 + (1 - land) * 600} w={540}>
				<div style={{transform: `rotate(${-3 + land * 3}deg)`, filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(0,0,0,0.5))`}}>
					<PhoneShot width={540}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			<SoundEffect id="transitionWhoosh" atSeconds={0.05} volume={0.7} />
			{content.product.lines.map((line, index) => <SoundEffect key={line} id="pop" atSeconds={0.4 + index * 0.35} />)}
			<At y={60} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(14)}}>
					{content.product.lines.map((line, index) => {
						const show = ease(interpolate(seconds, [0.4 + index * 0.35, 0.7 + index * 0.35], [0, 1], CLAMP));
						return (
							<div key={line} style={{opacity: show, transform: `translateY(${(1 - show) * u(30)}px)`, display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: index === 0 ? ORANGE : WHITE}}>
								<Icon name={index === 0 ? 'check' : 'clock'} size={u(32)} color={index === 0 ? WHITE : NAVY} stroke={2.6} />
								<Text size={40} weight={TYPE.weights.display} color={index === 0 ? WHITE : NAVY}>
									{line}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof SlotSpinSchema> = {
	hook: {lines: ['Bugünkü dersin', 'şansa mı kaldı?'], narration: 'Bugünkü dersin şansa mı kaldı?'},
	reel: ['Paragraf', 'Tarih', 'Problemler', 'Kimya', 'Coğrafya', 'Fizik', 'Biyoloji', 'Geometri'],
	pulls: [
		['Paragraf', 'Paragraf', 'Paragraf'],
		['Tarih', '?', '?'],
	],
	spin: {narration: 'Çark çevirmeyi bırak.'},
	lock: {windows: ['Son deneme', 'Eksik konu', 'Bugünün görevi'], narration: 'Sınavika son denemene bakar, eksik konunu bulur, bugünün planını hazırlar.'},
	product: {screen: 'planToday', lines: ['Bugünün planı hazır', '3 görev · 45 dk'], narration: 'Üç görev, kırk beş dakika.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 1.8), 1.6);
	const spin = say('spin', content.spin.narration, Math.max(beat(content.spin.narration, 2.6), 2.6), 2.4);
	const lock = say('lock', content.lock.narration, Math.max(beat(content.lock.narration, 4.2), 4), 3.8);
	const product = say('product', content.product.narration, Math.max(beat(content.product.narration, 3.2), 3), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'spin', seconds: spin.seconds, label: 'Çark', voice: [spin], element: <SpinScene content={content} seconds={spin.seconds} />},
		{id: 'lock', seconds: lock.seconds, label: 'Kilit', voice: [lock], element: <LockScene content={content} seconds={lock.seconds} />},
		{id: 'product', seconds: product.seconds, label: 'Ürün', voice: [product], element: <ProductScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const SlotSpin = defineTemplate({
	id: 'SlotSpin',
	category: 'Advertisements',
	title: 'Ders çarkı',
	description: 'Lacivert sahnede üç makaralı ders çarkı: iki çekiş boşa gider, sonra makaralar son deneme → eksik konu → bugünün görevi zincirinde kilitlenir ve telefondaki plana dönüşür.',
	contentSchema: SlotSpinSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
