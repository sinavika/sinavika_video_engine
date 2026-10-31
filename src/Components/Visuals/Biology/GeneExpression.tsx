import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type GeneExpression = Extract<CourseVisual, {kind: 'geneExpression'}>;

/** The stage (CourseVisual keeps this ratio). */
export const GENE_STAGE = {width: 1600, height: 820};

const PAIR: Record<string, string> = {A: 'U', U: 'A', G: 'C', C: 'G', T: 'A'};
const DNA_PAIR: Record<string, string> = {A: 'T', T: 'A', G: 'C', C: 'G'};

/** The DNA strands behind an mRNA: the coding strand reads like the mRNA with T for U; the template is its complement. */
export const dnaStrands = (mrna: string): {coding: string; template: string} => {
	const coding = mrna.replace(/U/g, 'T');
	return {coding, template: [...coding].map((base) => DNA_PAIR[base]).join('')};
};

/** The tRNA anticodon that pairs with a codon. */
export const anticodon = (codon: string): string => [...codon].map((base) => PAIR[base]).join('');

const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Gene expression. `transcription`: the DNA (coding strand above, template below) opens where RNA polymerase stands,
 * and an mRNA grows base by base, complementary to the template (U for A) (parts dna, template, polymerase, mrna,
 * run). `translation`: the mRNA's codons run under a ribosome that moves one codon a step; for each codon a tRNA with
 * the pairing anticodon brings its amino acid, a peptide bond joins it to the growing chain, and the empty tRNA leaves;
 * at the stop codon the chain is released (parts mrna, ribosome, trna, peptide, run). `codons` are mRNA triplets with
 * their amino acids (the last may be a stop); `period` is the seconds per codon.
 */
export const GeneExpressionVisual: React.FC<VisualBoxProps & {visual: GeneExpression}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / GENE_STAGE.width, height / GENE_STAGE.height);
	const ox = (width - GENE_STAGE.width * k) / 2;
	const oy = (height - GENE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const time = visual.motion ? Math.max(0, seconds - runStart) : 1e6;
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, size = fontSize * 0.62, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 800, fill = palette.ink) => (
		<text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={6} paintOrder="stroke">
			{value}
		</text>
	);
	const mrna = visual.codons.map((codon) => codon.codon).join('');
	const svg = (children: React.ReactNode) => (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{children}
			</g>
		</svg>
	);

	if (visual.mode === 'transcription') {
		const {coding, template} = dnaStrands(mrna);
		const step = Math.min(1320 / mrna.length, 66);
		const left = 800 - (step * (mrna.length - 1)) / 2;
		const baseX = (index: number) => left + index * step;
		const made = Math.min(mrna.length, (time / visual.period) * 3);
		const polymerase = baseX(Math.min(mrna.length - 1, Math.floor(made)));
		const [codingY, templateY, rnaY] = [220, 360, 500];
		const open = (index: number) => Math.max(0, 1 - Math.abs(baseX(index) - polymerase) / (step * 3));
		const strand = (bases: string, y: number, push: number, colour: string) =>
			[...bases].map((base, index) => (
				<g key={index}>
					<rect x={baseX(index) - step * 0.42} y={y - 30 + push * open(index)} width={step * 0.84} height={60} rx={10} fill={colour} opacity={0.2} />
					{text(baseX(index), y + push * open(index), base, fontSize * 0.85)}
				</g>
			));
		return svg(
			<>
				<Part id="dna">
					{(look) => (
						<g opacity={look.opacity}>
							{strand(coding, codingY, -40, palette.lessonDeep)}
							{text(left - step * 0.4, codingY - 90, visual.codingLabel, fontSize * 0.62, 'start', 700)}
						</g>
					)}
				</Part>
				<Part id="template">
					{(look) => (
						<g opacity={look.opacity}>
							{strand(template, templateY, 30, palette.lesson)}
							{text(left - step * 0.4, templateY + 82, visual.templateLabel, fontSize * 0.62, 'start', 700)}
						</g>
					)}
				</Part>
				<Part id="mrna">
					{(look) => (
						<g opacity={look.opacity}>
							{[...mrna].map((base, index) => {
								const shown = clamp01(made - index);
								return shown > 0 ? (
									<g key={index} opacity={shown}>
										<rect x={baseX(index) - step * 0.42} y={rnaY - 30} width={step * 0.84} height={60} rx={10} fill={palette.brand} opacity={0.22} />
										{text(baseX(index), rnaY, base, fontSize * 0.85)}
									</g>
								) : null;
							})}
							{text(left - step * 0.4, rnaY + 80, visual.mrnaLabel, fontSize * 0.62, 'start', 700)}
						</g>
					)}
				</Part>
				<Part id="polymerase">
					{(look) =>
						made < mrna.length ? (
							<g opacity={look.opacity}>
								<rect x={polymerase - step * 2.2} y={templateY - 100} width={step * 4.4} height={320} rx={60} fill="none" stroke={palette.brand} strokeWidth={8} strokeDasharray="18 10" />
								{text(polymerase, rnaY + 150, visual.polymeraseLabel, fontSize * 0.62)}
							</g>
						) : null
					}
				</Part>
			</>,
		);
	}

	// Translation.
	const count = visual.codons.length;
	const codonWidth = Math.min(210, 1400 / count);
	const left = 800 - (codonWidth * count) / 2;
	const codonX = (index: number) => left + codonWidth * (index + 0.5);
	const mrnaY = 600;
	const stop = visual.codons[count - 1].stop;
	// n amino acids; step s (1…) brings codon s into the A site. With a stop codon the last step releases the chain.
	const n = stop ? count - 1 : count;
	const steps = stop ? n : n - 1;
	const raw = time / visual.period;
	const finished = raw >= steps;
	const step = Math.max(1, Math.min(steps, Math.floor(raw) + 1));
	const phase = finished ? 1 : raw - Math.floor(raw);
	const coding = step < n; // a tRNA comes for this step's codon (not the stop codon)
	const arrive = coding ? ease(phase / 0.4) : 0;
	const bond = coding ? ease((phase - 0.4) / 0.2) : 0;
	const shift = coding ? ease((phase - 0.6) / 0.4) : 0;
	const released = !coding && stop ? ease(phase) : 0;
	const pSite = step - 1 + shift;
	const ribosomeX = codonX(pSite) - codonWidth / 2 - 20;
	const trnaTop = 330;
	const trna = (index: number, drop: number, opacity: number, carrying: boolean) => {
		const codon = visual.codons[index];
		const x = codonX(index);
		return (
			<g key={`t${index}`} opacity={opacity} transform={`translate(0 ${-drop})`}>
				<rect x={x - 62} y={trnaTop + 60} width={124} height={mrnaY - trnaTop - 100} rx={24} fill={palette.surface} stroke={palette.lessonDeep} strokeWidth={5} />
				{text(x, mrnaY - 64, anticodon(codon.codon), fontSize * 0.62)}
				{carrying ? (
					<g>
						<circle cx={x} cy={trnaTop + 20} r={50} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
						{text(x, trnaTop + 20, codon.aminoAcid, fontSize * 0.55, 'middle', 800)}
					</g>
				) : null}
			</g>
		);
	};
	// The chain hangs from the tRNA that holds it: the P-site tRNA until the bond, the A-site tRNA after it.
	const bonded = bond > 0.5;
	const chainLength = Math.min(n, step + (bonded ? 1 : 0));
	const chainAnchor = codonX(bonded ? step : step - 1);
	const chain = Array.from({length: chainLength}, (_, index) => visual.codons[index]);
	return svg(
		<>
			<Part id="mrna">
				{(look) => (
					<g opacity={look.opacity}>
						<line x1={left - 40} y1={mrnaY} x2={left + codonWidth * count + 40} y2={mrnaY} stroke={palette.brand} strokeWidth={10} strokeLinecap="round" />
						{visual.codons.map((codon, index) => (
							<g key={index}>
								<rect x={codonX(index) - codonWidth / 2 + 6} y={mrnaY + 14} width={codonWidth - 12} height={58} rx={12} fill={codon.stop ? palette.ink : palette.fill} opacity={codon.stop ? 0.12 : 1} />
								{text(codonX(index), mrnaY + 43, codon.codon, fontSize * 0.8)}
							</g>
						))}
						{text(left - 60, mrnaY + 43, visual.mrnaLabel, fontSize * 0.62, 'end', 700)}
					</g>
				)}
			</Part>
			<Part id="ribosome">
				{(look) => (
					<g opacity={look.opacity * (1 - released * 0.6)}>
						<rect x={ribosomeX} y={mrnaY - 330 - released * 60} width={codonWidth * 2 + 40} height={310} rx={70} fill={palette.lesson} opacity={0.14} stroke={palette.lessonDeep} strokeWidth={6} />
						<rect x={ribosomeX + 20} y={mrnaY + 4 + released * 40} width={codonWidth * 2} height={110} rx={50} fill={palette.lesson} opacity={0.14} stroke={palette.lessonDeep} strokeWidth={6} />
						{text(ribosomeX + codonWidth + 20, mrnaY + 160 + released * 40, visual.ribosomeLabel, fontSize * 0.62)}
					</g>
				)}
			</Part>
			<Part id="trna">
				{(look) => (
					<g opacity={look.opacity}>
						{/* The P-site tRNA holds the chain, then leaves empty during the shift (or as the chain is released). */}
						{trna(step - 1, 160 * shift, 1 - shift - released, false)}
						{/* The incoming tRNA brings its amino acid into the A site. */}
						{coding ? trna(step, 220 * (1 - arrive), arrive, !bonded) : null}
					</g>
				)}
			</Part>
			<Part id="peptide">
				{(look) => (
					<g opacity={look.opacity}>
						{chain.map((codon, index) => {
							const position = chain.length - 1 - index;
							const x = chainAnchor - position * 84 - released * 120;
							const y = trnaTop + 20 - position * 26 - released * 80;
							return (
								<g key={index}>
									{index < chain.length - 1 ? <line x1={x} y1={y} x2={x + 84} y2={y + 26} stroke={palette.ink} strokeWidth={6} /> : null}
									<circle cx={x} cy={y} r={46} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
									{text(x, y, codon.aminoAcid, fontSize * 0.52)}
								</g>
							);
						})}
						{chain.length > 1 ? text(chainAnchor - (chain.length - 1) * 84 - released * 120, trnaTop - 70 - (chain.length - 1) * 26 - released * 80, visual.peptideLabel, fontSize * 0.62, 'middle', 700) : null}
					</g>
				)}
			</Part>
		</>,
	);
};
