import React from 'react';
import {clamp01, lerp, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {fitSize} from '../../FigureLabel';
import {ProcessFrame, ProcessLabel, processCamera, useProcessClock} from '../ProcessScene';
import {FigureText} from '../../VisualWorld';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Two identities as areas. (a + b)²: a square of side a + b is built from its pieces as they slide in (a², two ab
 * strips, b²). a² − b²: the b² corner is cut from a², the L that is left is cut in two and one part turns and moves to
 * the end of the other, making a rectangle of sides a + b and a − b.
 */

const A = 250;
const B = 110;
const ORIGIN = {x: 360, y: 150};
const DIFF = {x: 960, y: 150};

const Piece: React.FC<{x: number; y: number; w: number; h: number; fill: string; label: string; opacity?: number; rotate?: number}> = ({x, y, w, h, fill, label, opacity = 1, rotate = 0}) => {
	const palette = useVisualPalette();
	// The label fits its piece: "b(a − b)" on the narrow moved strip was wider than the strip and ran off it.
	const fontSize = Math.max(18, Math.min(42, Math.min(w, h) / 2.6, fitSize(label, w - 14)));
	return (
		<g opacity={opacity} transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}>
			<rect x={x} y={y} width={w} height={h} fill={fill} stroke="#FFFFFF" strokeWidth={4} rx={6} />
			<FigureText x={x + w / 2} y={y + h / 2 + fontSize * 0.35} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={fontSize} fill="#FFFFFF" transform={`rotate(${-rotate} ${x + w / 2} ${y + h / 2})`}>
				{label}
			</FigureText>
		</g>
	);
};

export const AreaModelProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('areamodel', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => (stage === 'tamkare' ? [200, 90, 860, 640] : [800, 90, 1560, 640]));
	const {amount} = clock;

	// (a + b)²: four pieces slide in, one after another.
	const build = amount('tamkare');
	const slide = (index: number) => smooth(clamp01(build * 4.5 - index * 0.9));
	const colours = {a2: palette.lesson, ab: '#3E7FC0', b2: '#E08A2E'};
	// a² − b²: cut the corner, split the L, move the strip.
	const diff = amount('karefarki');
	const cut = smooth(clamp01(diff * 3));
	const move = smooth(clamp01(diff * 3 - 1.2));
	const done = smooth(clamp01(diff * 3 - 2.2));
	const lit = (id: string) => (clock.current === id ? 1 : 0.35);

	return (
		<ProcessFrame process="areamodel" clock={clock} camera={camera} width={width} height={height} backdrop="#F6F8FA">
			<g opacity={lit('tamkare')}>
				<Piece x={lerp(ORIGIN.x - 300, ORIGIN.x, slide(0))} y={ORIGIN.y} w={A} h={A} fill={colours.a2} label="a²" opacity={slide(0)} />
				<Piece x={ORIGIN.x + A} y={lerp(ORIGIN.y - 260, ORIGIN.y, slide(1))} w={B} h={A} fill={colours.ab} label="ab" opacity={slide(1)} />
				<Piece x={ORIGIN.x} y={lerp(ORIGIN.y + A + 260, ORIGIN.y + A, slide(2))} w={A} h={B} fill={colours.ab} label="ab" opacity={slide(2)} />
				<Piece x={lerp(ORIGIN.x + A + 300, ORIGIN.x + A, slide(3))} y={ORIGIN.y + A} w={B} h={B} fill={colours.b2} label="b²" opacity={slide(3)} />
				<g fontFamily={palette.fontBody} fontWeight={800} fill={palette.ink} textAnchor="middle">
					<FigureText fontSize={30} x={ORIGIN.x + A / 2} y={ORIGIN.y - 14}>a</FigureText>
					<FigureText fontSize={30} x={ORIGIN.x + A + B / 2} y={ORIGIN.y - 14}>b</FigureText>
					<FigureText fontSize={30} x={ORIGIN.x - 22} y={ORIGIN.y + A / 2 + 10}>a</FigureText>
					<FigureText fontSize={30} x={ORIGIN.x - 22} y={ORIGIN.y + A + B / 2 + 10}>b</FigureText>
				</g>
				<FigureText x={ORIGIN.x + (A + B) / 2} y={ORIGIN.y + A + B + 70} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={40} fill={palette.ink} opacity={slide(3)}>
					(a + b)² = a² + 2ab + b²
				</FigureText>
			</g>
			<g opacity={lit('karefarki')}>
				{/* a² with its b² corner cut away. */}
				<Piece x={DIFF.x} y={DIFF.y} w={A} h={A - B} fill={colours.a2} label="a(a − b)" />
				<Piece x={lerp(DIFF.x, DIFF.x + A, move)} y={lerp(DIFF.y + A - B, DIFF.y, move)} w={lerp(A - B, B, move)} h={lerp(B, A - B, move)} fill="#3E7FC0" label="b(a − b)" />
				<rect x={DIFF.x + A - B} y={DIFF.y + A - B + 40 * cut} width={B} height={B} fill={withAlpha('#E08A2E', 1 - cut)} stroke="#FFFFFF" strokeWidth={4} rx={6} strokeDasharray={cut > 0.05 ? '10 8' : undefined} />
				<FigureText x={DIFF.x + A - B / 2} y={DIFF.y + A - B / 2 + 52 * cut + 10} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={30} fill="#FFFFFF" opacity={1 - cut}>
					b²
				</FigureText>
				<g fontFamily={palette.fontBody} fontWeight={800} fill={palette.ink} textAnchor="middle">
					<FigureText fontSize={28} x={DIFF.x + (A + B * move) / 2} y={DIFF.y - 14}>{move > 0.9 ? 'a + b' : 'a'}</FigureText>
					<FigureText fontSize={28} x={DIFF.x - 34} y={DIFF.y + (A - B) / 2 + 10}>a − b</FigureText>
				</g>
				<FigureText x={DIFF.x + (A + B) / 2} y={DIFF.y + A + B + 70} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={40} fill={palette.ink} opacity={done}>
					a² − b² = (a − b)(a + b)
				</FigureText>
			</g>
			{/* Points at the lower ab strip from the lower left: toward the right it ran into the second figure's side label. */}
			<ProcessLabel id="ab" at={[ORIGIN.x + A / 2, ORIGIN.y + A + B / 2]} to={[ORIGIN.x - 170, ORIGIN.y + A + B + 10]} text="İki tane ab" show={clock.now('tamkare') * slide(2)} />
			<ProcessLabel id="b2" at={[DIFF.x + A - B / 2, DIFF.y + A - B / 2 + 40 * cut]} to={[DIFF.x + A + 140, DIFF.y + A]} text="b² çıkarılır" show={clock.now('karefarki') * cut * (1 - move)} />
		</ProcessFrame>
	);
};
