import React from 'react';
import {Easing, interpolate} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Icon, type UIIconName} from '../../../../UIUX/Icons';
import {Box, C, CLAMP, Kicker, Rise, Stage, usePop, useSeconds} from './IntroKit';

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

type NetCues = {wrong: number; taken: number; blank: number; example: number};

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
