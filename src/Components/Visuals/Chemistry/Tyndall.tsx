import React from 'react';
import {clamp01, noise} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Tyndall = Extract<CourseVisual, {kind: 'tyndall'}>;
type MixtureKind = Tyndall['beakers'][number]['kind'];

/** The stage (CourseVisual keeps this ratio). */
export const TYNDALL_STAGE = {width: 1600, height: 700};

const BEAM_Y = 380;
const LASER = {x: 40, width: 150, height: 70};
const BEAKER = {top: 200, bottom: 600, width: 300, gap: 400};
const PARTICLES = 46;

/** Whether the laser beam shows inside a mixture: colloid particles (1–1000 nm) scatter it, a solution's do not. */
export const beamVisible = (kind: MixtureKind): boolean => kind !== 'solution';

/** How much of a suspension has settled after `seconds` of standing (colloids and solutions never settle). */
export const settled = (kind: MixtureKind, seconds: number): number => (kind === 'suspension' ? clamp01(seconds / 6) : 0);

/**
 * Chemistry: the Tyndall effect. A laser shines through two or three beakers (`beakers`: solution, colloid or
 * suspension, with labels): in a solution the beam cannot be seen, in a colloid it lights up as a bright line, in a
 * suspension it is scattered by a cloudy liquid whose particles sink to the bottom on the beat that shows `settle`.
 * Parts: laser, b1, b2, b3, beam, settle.
 */
export const TyndallVisual: React.FC<VisualBoxProps & {visual: Tyndall}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / TYNDALL_STAGE.width, height / TYNDALL_STAGE.height);
	const ox = (width - TYNDALL_STAGE.width * k) / 2;
	const oy = (height - TYNDALL_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const beamAt = useBeatStartFor('beam', 'show') ?? delaySeconds + 1;
	const settleAt = useBeatStartFor('settle', 'show');
	const labelSize = Math.max(36, 22 / k);
	const beamReach = visual.motion ? clamp01((seconds - beamAt) / 1.5) : 1;
	const beamEnd = LASER.x + LASER.width + (TYNDALL_STAGE.width - 40 - LASER.x - LASER.width) * beamReach;
	const standing = settleAt === undefined ? 0 : visual.motion ? Math.max(0, seconds - settleAt) : 10;
	const red = '#E5484D';
	const glass = mixColors(palette.lesson, palette.surface, 0.9);
	// The beakers are centred in the space right of the laser.
	const centreOf = (index: number) => (TYNDALL_STAGE.width + LASER.x + LASER.width) / 2 + (index - (visual.beakers.length - 1) / 2) * BEAKER.gap;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="laser">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={LASER.x} y={BEAM_Y - LASER.height / 2} width={LASER.width} height={LASER.height} rx={12} fill={palette.ink} />
							<rect x={LASER.x + LASER.width - 12} y={BEAM_Y - 12} width={18} height={24} fill={red} />
							<text x={LASER.x + LASER.width / 2} y={BEAM_Y - 70} fill={palette.ink} fontSize={labelSize * 0.9} fontWeight={800} textAnchor="middle">
								{visual.laserLabel}
							</text>
						</g>
					)}
				</Part>
				{visual.beakers.map((beaker, index) => {
					const cx = centreOf(index);
					const left = cx - BEAKER.width / 2;
					const sunk = settled(beaker.kind, standing);
					const liquid = beaker.kind === 'solution' ? glass : beaker.kind === 'colloid' ? mixColors('#F4EFE6', glass, 0.45) : mixColors('#B08A5A', glass, 0.45 + 0.5 * sunk);
					return (
						<Part key={index} id={`b${index + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									<rect x={left} y={BEAKER.top + 40} width={BEAKER.width} height={BEAKER.bottom - BEAKER.top - 40} fill={liquid} />
									{beaker.kind === 'suspension'
										? Array.from({length: PARTICLES}, (_, particle) => {
												const px = left + 18 + noise(particle * 3.1) * (BEAKER.width - 36);
												const start = BEAKER.top + 60 + noise(particle * 7.7) * (BEAKER.bottom - BEAKER.top - 90);
												const floor = BEAKER.bottom - 10 - noise(particle * 5.3) * 26;
												const py = start + (floor - start) * Math.min(1, sunk * (0.6 + noise(particle * 2.9) * 0.8));
												return <circle key={particle} cx={px} cy={py} r={6 + noise(particle * 1.7) * 4} fill={mixColors('#7A5B36', palette.ink, 0.2)} />;
											})
										: null}
									<path
										d={`M ${left - 10} ${BEAKER.top} L ${left} ${BEAKER.top + 10} L ${left} ${BEAKER.bottom} L ${left + BEAKER.width} ${BEAKER.bottom} L ${left + BEAKER.width} ${BEAKER.top + 10} L ${left + BEAKER.width + 10} ${BEAKER.top}`}
										fill="none"
										stroke={palette.ink}
										strokeWidth={5}
										strokeLinejoin="round"
									/>
									<text x={cx} y={BEAKER.bottom + 50} fill={palette.ink} fontSize={labelSize} fontWeight={800} textAnchor="middle">
										{beaker.label}
									</text>
									{beaker.detail ? (
										<text x={cx} y={BEAKER.bottom + 92} fill={palette.muted} fontSize={labelSize * 0.8} fontWeight={600} textAnchor="middle">
											{beaker.detail}
										</text>
									) : null}
								</g>
							)}
						</Part>
					);
				})}
				<Part id="beam">
					{(look) => (
						<g opacity={look.opacity}>
							{/* The beam is drawn only in air gaps and where particles scatter it, the way the eye sees it from the side. */}
							{(() => {
								const segments: React.ReactNode[] = [];
								let x = LASER.x + LASER.width + 6;
								visual.beakers.forEach((beaker, index) => {
									const left = centreOf(index) - BEAKER.width / 2;
									const right = left + BEAKER.width;
									if (beamEnd > x) segments.push(<line key={`air${index}`} x1={x} y1={BEAM_Y} x2={Math.min(left, beamEnd)} y2={BEAM_Y} stroke={red} strokeWidth={4} opacity={0.55} />);
									if (beamEnd > left && beamVisible(beaker.kind)) {
										const end = Math.min(right, beamEnd);
										const strength = beaker.kind === 'colloid' ? 1 : 0.6 * (1 - settled(beaker.kind, standing)) + 0.15;
										segments.push(
											<g key={`in${index}`} opacity={strength}>
												<line x1={left} y1={BEAM_Y} x2={end} y2={BEAM_Y} stroke={red} strokeWidth={beaker.kind === 'colloid' ? 26 : 40} opacity={0.25} strokeLinecap="round" />
												<line x1={left} y1={BEAM_Y} x2={end} y2={BEAM_Y} stroke={red} strokeWidth={beaker.kind === 'colloid' ? 9 : 5} strokeLinecap="round" />
											</g>,
										);
									}
									x = right;
								});
								if (beamEnd > x) segments.push(<line key="out" x1={x} y1={BEAM_Y} x2={beamEnd} y2={BEAM_Y} stroke={red} strokeWidth={4} opacity={0.55} />);
								return segments;
							})()}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
