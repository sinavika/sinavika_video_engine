import React, {useId} from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {mappingProperties} from './MathWork';

type Mapping = Extract<CourseVisual, {kind: 'mapping'}>;

const VIEW_WIDTH = 1000;
const ITEM = 82;
const FONT = 44;

export const mappingFrame = (visual: Mapping) => {
	const items = Math.max(visual.domain.items.length, visual.codomain.items.length);
	const oval = items * ITEM + 70;
	return {oval, width: VIEW_WIDTH, height: 90 + oval + (visual.properties ? 120 : 30)};
};

/** The verdicts under a mapping, worked out from its arrows: is it a function, one-to-one, onto. */
export const mappingVerdicts = (visual: Mapping): {text: string; holds: boolean}[] => {
	const {isFunction, oneToOne, onto} = mappingProperties(visual.domain.items.length, visual.codomain.items.length, visual.arrows);
	if (!isFunction) return [{text: 'Fonksiyon değil', holds: false}];
	return [
		{text: 'Fonksiyon', holds: true},
		{text: oneToOne ? 'Bire bir' : 'Bire bir değil', holds: oneToOne},
		{text: onto ? 'Örten' : 'Örten değil', holds: onto},
	];
};

/**
 * A mapping between two sets: two ovals with their elements and an arrow from each element to its image, drawn one
 * by one. With `properties`, the engine says from the arrows whether it is a function and whether it is one-to-one
 * (bire bir) and onto (örten); an element with no arrow or two arrows is ringed when it is not a function.
 */
export const MappingVisual: React.FC<VisualBoxProps & {visual: Mapping}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {colors} = useTheme();
	const frame = mappingFrame(visual);
	const domainLook = usePartLook('domain', useReveal(delaySeconds, 0.6));
	const codomainLook = usePartLook('codomain', useReveal(delaySeconds + 0.3, 0.6));
	const arrowLooks = Array.from({length: 12}, (_, index) => usePartLook(`a${index + 1}`, useReveal(delaySeconds + 0.9 + index * 0.45, 0.6)));
	const propertiesLook = usePartLook('properties', useReveal(delaySeconds + 1.2 + visual.arrows.length * 0.45, 0.6));
	const centres = [270, 730];
	const top = 90;
	const itemY = (count: number, index: number) => top + frame.oval / 2 + (index - (count - 1) / 2) * ITEM;
	const verdicts = visual.properties ? mappingVerdicts(visual) : [];
	const outgoing = visual.domain.items.map((_, index) => visual.arrows.filter(([from]) => from === index).length);
	const sets = [visual.domain, visual.codomain];
	const looks = [domainLook, codomainLook];
	const headId = `mapping-head-${useId().replace(/:/g, '')}`;

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<defs>
				<marker id={headId} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
					<path d="M0 0 L10 5 L0 10 Z" fill={palette.lesson} />
				</marker>
			</defs>
			<g style={{fontFamily: palette.fontDisplay}}>
				<text x={VIEW_WIDTH / 2} y={top - 30} textAnchor="middle" fill={palette.ink} fontSize={FONT} fontWeight={800} opacity={domainLook.opacity} fontStyle="italic">
					{`${visual.name}: ${visual.domain.label} → ${visual.codomain.label}`}
				</text>
				{sets.map((set, side) => (
					<g key={side} opacity={looks[side].opacity}>
						<ellipse cx={centres[side]} cy={top + frame.oval / 2} rx={140} ry={frame.oval / 2} fill={withAlpha(palette.lesson, 0.08 + 0.1 * looks[side].focused)} stroke={palette.lesson} strokeWidth={5} />
						<text x={centres[side] + (side === 0 ? -150 : 150)} y={top + 10} textAnchor={side === 0 ? 'end' : 'start'} fill={palette.lesson} fontSize={FONT * 1.1} fontWeight={800}>
							{set.label}
						</text>
						{set.items.map((item, index) => {
							const lonely = side === 0 && visual.properties && outgoing[index] !== 1;
							return (
								<g key={index}>
									{lonely ? <circle cx={centres[side]} cy={itemY(set.items.length, index)} r={34} fill="none" stroke={colors.danger} strokeWidth={5} opacity={propertiesLook.opacity} /> : null}
									<text x={centres[side]} y={itemY(set.items.length, index)} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT} fontWeight={800}>
										{item}
									</text>
								</g>
							);
						})}
					</g>
				))}
				{visual.arrows.map(([from, to], index) => {
					const look = arrowLooks[index];
					const x1 = centres[0] + 48;
					const y1 = itemY(visual.domain.items.length, from);
					const x2 = centres[1] - 48;
					const y2 = itemY(visual.codomain.items.length, to);
					const length = Math.hypot(x2 - x1, y2 - y1);
					return (
						<path
							key={index}
							d={`M${x1} ${y1} C${x1 + 120} ${y1}, ${x2 - 120} ${y2}, ${x2} ${y2}`}
							fill="none"
							stroke={look.focused > 0.5 ? palette.brand : palette.lesson}
							strokeWidth={look.focused > 0.5 ? 7 : 5}
							markerEnd={`url(#${headId})`}
							strokeDasharray={length * 1.2}
							strokeDashoffset={length * 1.2 * (1 - look.drawn)}
							opacity={look.opacity}
						/>
					);
				})}
				{verdicts.map((verdict, index) => {
					const chipWidth = 280;
					const x = VIEW_WIDTH / 2 + (index - (verdicts.length - 1) / 2) * (chipWidth + 24);
					const y = top + frame.oval + 60;
					return (
						<g key={verdict.text} opacity={propertiesLook.opacity}>
							<rect x={x - chipWidth / 2} y={y - 34} width={chipWidth} height={68} rx={34} fill={verdict.holds ? withAlpha(palette.lesson, 0.16) : withAlpha(colors.danger, 0.12)} stroke={verdict.holds ? palette.lesson : colors.danger} strokeWidth={4} />
							<text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={verdict.holds ? palette.lesson : colors.danger} fontSize={FONT * 0.8} fontWeight={800}>
								{`${verdict.holds ? '✓' : '✗'} ${verdict.text}`}
							</text>
						</g>
					);
				})}
			</g>
		</World>
	);
};
