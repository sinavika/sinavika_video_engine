import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';

/** The chemistry visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const CHEMISTRY_VISUALS = [
	/** Chemistry: a reaction equation in mhchem notation, e.g. "2H2 + O2 -> 2H2O". */
	z.object({kind: z.literal('reaction'), equation: z.string().trim().min(1).max(200), caption: plainText(120).optional()}),
	/**
	 * Chemistry: orbital boxes on an energy staircase filling electron by electron (Aufbau, Hund, Pauli) for
	 * `atomicNumber` 1–36 and `charge` (positive ions lose 4s before 3d; Cr and Cu exceptions), with the configuration
	 * written above; `highlight` colours and counts the electrons with the given n, ℓ and/or mℓ. Beats point at
	 * `boxes`, `electrons`, `config`, `count` and `run`.
	 */
	z
		.object({
			kind: z.literal('orbitals'),
			atomicNumber: z.number().int().min(1).max(36),
			charge: z.number().int().min(-3).max(3).default(0),
			symbol: plainText(3).optional(),
			highlight: z.object({n: z.number().int().min(1).max(4).optional(), l: z.number().int().min(0).max(2).optional(), ml: z.number().int().min(-2).max(2).optional()}).optional(),
			motion: z.boolean().default(true),
		})
		.superRefine((orbitals, context) => {
			const electrons = orbitals.atomicNumber - orbitals.charge;
			if (electrons < 0 || electrons > 36) context.addIssue({code: 'custom', path: ['charge'], message: 'The ion has more electrons than the boxes drawn (up to 4p, 36).'});
		}),
	/**
	 * Chemistry: gases. `container`: particles flying in a cylinder under a piston; beats step through `states`
	 * (volume 0.3–1, temperature and moles relative to the first) with `stage` 0, 1, …, and bars compare P, V, T, n with
	 * the first state (P = nRT/V). `diffusion`: two `gases` (label, molar mass) let into the ends of a tube `length` cm
	 * long meet where Graham's law puts them. Beats point at `container`, `particles`, `gauges`; `tube`, `fronts`,
	 * `meet`, `run`.
	 */
	z
		.object({
			kind: z.literal('gas'),
			mode: z.enum(['container', 'diffusion']).default('container'),
			states: z
				.array(z.object({volume: z.number().min(0.3).max(1), temperature: z.number().min(0.4).max(3), moles: z.number().min(0.5).max(2), label: plainText(30).optional()}))
				.min(1)
				.max(4)
				.default([{volume: 1, temperature: 1, moles: 1}]),
			gases: z.tuple([z.object({label: plainText(8), molarMass: z.number().min(1).max(400)}), z.object({label: plainText(8), molarMass: z.number().min(1).max(400)})]).optional(),
			length: z.number().min(10).max(200).default(40),
			motion: z.boolean().default(true),
		})
		.superRefine((gas, context) => {
			if (gas.mode === 'diffusion' && !gas.gases) context.addIssue({code: 'custom', path: ['gases'], message: 'Diffusion needs the two gases.'});
		}),
	/**
	 * Chemistry: solutions side by side (1–3 beakers): each solute (`label`, `molality`) breaks into its `ions` (label,
	 * count per unit; one entry for a molecular solute) as the crystal dissolves; `effect` adds bars comparing the
	 * colligative effect i·m. Beats point at b1…, `particles`, `bars` and `run`.
	 */
	z.object({
		kind: z.literal('solution'),
		beakers: z
			.array(
				z.object({
					label: plainText(16),
					molality: z.number().min(0.1).max(4),
					ions: z
						.array(z.object({label: plainText(6), count: z.number().int().min(1).max(3)}))
						.min(1)
						.max(2),
				}),
			)
			.min(1)
			.max(3),
		effect: z.enum(['none', 'freezing', 'boiling', 'osmotic', 'vapour']).default('none'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: a reaction's potential energy profile. `reactants`, `products` and `peak` (kJ) set the plateaus and the
	 * hump; `catalyst` adds a lower dashed hump; `intermediate` and `peak2` make it a two-step mechanism (Ea₁, Ea₂). `ea`, `dh` and `reverse` draw the forward activation energy, ΔH and the
	 * backward activation energy; `values` writes the levels on the axis (for question figures turn the arrows off).
	 * Beats point at `curve`, `ea`, `dh`, `reverse`, `catalyst`, `ball` and `run`.
	 */
	z
		.object({
			kind: z.literal('energyProfile'),
			reactants: z.number().min(-2000).max(2000),
			products: z.number().min(-2000).max(2000),
			peak: z.number().min(-2000).max(3000),
			catalyst: z.number().min(-2000).max(3000).optional(),
			/** A two-step mechanism: the intermediate's valley and the second hump (both or neither). */
			intermediate: z.number().min(-2000).max(3000).optional(),
			peak2: z.number().min(-2000).max(3000).optional(),
			reactantLabel: plainText(24).default('Girenler'),
			productLabel: plainText(24).default('Ürünler'),
			ea: z.boolean().default(true),
			dh: z.boolean().default(true),
			reverse: z.boolean().default(false),
			values: z.boolean().default(true),
			motion: z.boolean().default(true),
		})
		.superRefine((profile, context) => {
			if (profile.peak <= Math.max(profile.reactants, profile.products)) context.addIssue({code: 'custom', path: ['peak'], message: 'The activated complex must lie above both plateaus.'});
			if (profile.catalyst !== undefined && (profile.catalyst >= profile.peak || profile.catalyst <= Math.max(profile.reactants, profile.products)))
				context.addIssue({code: 'custom', path: ['catalyst'], message: 'The catalysed hump lies between the higher plateau and the peak.'});
			if ((profile.intermediate === undefined) !== (profile.peak2 === undefined))
				context.addIssue({code: 'custom', path: ['peak2'], message: 'A two-step mechanism needs both the intermediate and the second hump.'});
			if (profile.intermediate !== undefined && profile.peak2 !== undefined && (profile.intermediate >= Math.min(profile.peak, profile.peak2) || profile.peak2 <= profile.products))
				context.addIssue({code: 'custom', path: ['intermediate'], message: 'The intermediate sits in a valley between the two humps.'});
		}),
	/**
	 * Chemistry: equilibrium over time. `concentration`: `species` (label, `start`, `first` equilibrium value; with an
	 * `event` a `jump` at the change and a `second` equilibrium value) ease exponentially; `marks` label times (t₁…, in
	 * units of the 0–10 axis, the event at 5). `rates`: forward and backward rates meeting. Beats point at `axes`, s1…,
	 * `event`, `rates` and `run`.
	 */
	z.object({
		kind: z.literal('equilibrium'),
		mode: z.enum(['concentration', 'rates']).default('concentration'),
		species: z
			.array(
				z.object({
					label: plainText(10),
					start: z.number().min(0).max(10),
					first: z.number().min(0).max(10),
					jump: z.number().min(-10).max(10).optional(),
					second: z.number().min(0).max(10).optional(),
				}),
			)
			.max(4)
			.default([]),
		event: plainText(30).optional(),
		marks: z
			.array(z.object({label: plainText(4), at: z.number().min(0).max(10)}))
			.max(4)
			.default([]),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: an electrochemical cell. `galvanic`: anode and cathode half-cells (`label` of the electrode,
	 * `solution`), a salt bridge (`bridge`) and a voltmeter (`voltage`); `electrolysis`: one vessel and a power supply.
	 * Electrons run anode → cathode in the wire, bridge ions drift (anions to the anode); `anodeDissolves` and
	 * `cathodeGrows` thin and thicken the plates, `anodeGas` and `cathodeGas` raise bubbles. Beats point at `anode`,
	 * `cathode`, `wire`, `bridge`, `electrons`, `ions`, `meter` and `run`.
	 */
	z.object({
		kind: z.literal('electrochemicalCell'),
		mode: z.enum(['galvanic', 'electrolysis']).default('galvanic'),
		anode: z.object({label: plainText(10), solution: plainText(24)}),
		cathode: z.object({label: plainText(10), solution: plainText(24)}),
		voltage: plainText(12).optional(),
		bridge: plainText(12).default('KNO₃'),
		anodeDissolves: z.boolean().default(true),
		cathodeGrows: z.boolean().default(true),
		anodeGas: z.boolean().default(false),
		cathodeGas: z.boolean().default(false),
		motion: z.boolean().default(true),
	}),
	z.object({
		kind: z.literal('distillation'),
		fractions: z
			.array(z.object({name: plainText(14), range: plainText(12)}))
			.min(2)
			.max(7),
		feed: plainText(24).default('Ham petrol buharı'),
		heatLabel: plainText(14).default('Fırın'),
		hotLabel: plainText(10).default('Sıcak'),
		coolLabel: plainText(10).default('Soğuk'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: the first twenty elements in the periodic table's A groups (periods 1–4), with their atomic
	 * numbers; `categories` colours metals, semimetals, nonmetals and noble gases; `highlight` lifts some
	 * elements; `trend` draws how a periodic property changes along a period and down a group. Beats point at
	 * elements by symbol (Na, Cl).
	 */
	z.object({
		kind: z.literal('periodic'),
		highlight: z.array(z.string().trim().min(1).max(2)).max(8).default([]),
		categories: z.boolean().default(false),
		trend: z.enum(['radius', 'ionization', 'electronegativity', 'metallic']).optional(),
	}),
	/**
	 * Chemistry: Lewis notation on one line, read left to right: atoms with their valence electrons as dots on four
	 * sides (top, right, bottom, left; 0–2 each), ions in brackets with their charge, shared electron pairs between
	 * bonded atoms (1–3 pairs) and the signs + and →. Beats point at the tokens in order as t1, t2…
	 */
	z.object({
		kind: z.literal('lewis'),
		tokens: z
			.array(
				z.union([
					z.object({
						kind: z.literal('atom'),
						symbol: z.string().trim().min(1).max(2),
						dots: z.tuple([z.number().int().min(0).max(2), z.number().int().min(0).max(2), z.number().int().min(0).max(2), z.number().int().min(0).max(2)]).default([0, 0, 0, 0]),
						charge: plainText(4).optional(),
						brackets: z.boolean().default(false),
					}),
					z.object({kind: z.literal('shared'), pairs: z.number().int().min(1).max(3).default(1)}),
					z.object({kind: z.literal('sign'), text: z.enum(['+', '→'])}),
				]),
			)
			.min(1)
			.max(9),
		caption: plainText(60).optional(),
	}),
	/** Chemistry: a molecule from its SMILES string, e.g. "CCO" for ethanol. */
	z.object({kind: z.literal('molecule'), smiles: z.string().trim().min(1).max(200), caption: plainText(80).optional()}),
	/** Chemistry, physics: an atom with its electron shells (Bohr model). */
	z.object({
		kind: z.literal('atom'),
		symbol: z.string().trim().min(1).max(3),
		protons: z.number().int().min(1).max(118),
		neutrons: z.number().int().min(0).max(180).optional(),
		shells: z.array(z.number().int().min(1).max(32)).min(1).max(7),
	}),
	/**
	 * Chemistry: how soap cleans. `molecules` soap molecules (polar head, non-polar tail) float above an oily stain on a
	 * fabric; on the beat that shows `wrap` they surround the oil, tails in, heads out (a micelle); on the beat that shows
	 * `lift` the micelle comes off the fabric. Parts: fabric, oil, soap, wrap, lift.
	 */
	z.object({
		kind: z.literal('micelle'),
		molecules: z.number().int().min(8).max(16).default(12),
		waterLabel: plainText(16).default('Su'),
		fabricLabel: plainText(16).default('Kumaş'),
		oilLabel: plainText(16).default('Yağlı kir'),
		headLabel: plainText(30).default('Polar baş: suyu sever'),
		tailLabel: plainText(30).default('Apolar kuyruk: yağı sever'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry, geography: the greenhouse effect. Sunlight crosses the atmosphere and warms the ground, the ground sends
	 * infrared up; in the `gases` lanes (0–6) greenhouse molecules absorb it and send it back down from the beat that shows
	 * `trapped`, and the thermometer rises. Parts: sun, light, ground, infrared, gases, trapped, thermometer.
	 */
	z.object({
		kind: z.literal('greenhouse'),
		gases: z.number().int().min(0).max(6).default(3),
		sunLabel: plainText(14).default('Güneş'),
		groundLabel: plainText(20).default('Yer yüzeyi'),
		atmosphereLabel: plainText(20).default('Atmosfer'),
		gasLabel: plainText(24).default('Sera gazı'),
		lightLabel: plainText(24).default('Güneş ışığı'),
		infraredLabel: plainText(24).default('Kızılötesi ışınım'),
		temperatureLabel: plainText(16).optional(),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: the Tyndall effect. A laser shines through two or three beakers (`beakers`: solution, colloid or
	 * suspension, label, detail): invisible in a solution, a bright line in a colloid, scattered in a cloudy suspension
	 * whose particles sink on the beat that shows `settle`. The beam crosses on the beat that shows `beam`. Parts: laser,
	 * b1, b2, b3, beam, settle.
	 */
	z.object({
		kind: z.literal('tyndall'),
		beakers: z
			.array(z.object({kind: z.enum(['solution', 'colloid', 'suspension']), label: plainText(18), detail: plainText(24).optional()}))
			.min(2)
			.max(3),
		laserLabel: plainText(14).default('Lazer'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: a schematic phase diagram of water (melting line leaning left) or of a substance like CO₂ (leaning right):
	 * solid, liquid, vapour and gas regions, the triple and critical points with optional values on the axes (`tripleT`,
	 * `tripleP`, `criticalT`, `criticalP`), and an optional `path`, an isobar or isotherm at `at` (0–1 of the axis) along
	 * which a point moves up to `to` over `duration` seconds on the beat that shows `path`, naming its phase. Parts: axes, regions,
	 * curves, triple, critical, path.
	 */
	z.object({
		kind: z.literal('phaseDiagram'),
		substance: z.enum(['water', 'co2']).default('water'),
		path: z.object({kind: z.enum(['isobar', 'isotherm']), at: z.number().min(0.03).max(0.97), to: z.number().min(0.1).max(1).default(1), label: plainText(14).optional()}).optional(),
		duration: z.number().min(3).max(20).default(8),
		tripleT: plainText(12).optional(),
		tripleP: plainText(12).optional(),
		criticalT: plainText(12).optional(),
		criticalP: plainText(12).optional(),
		solidLabel: plainText(12).default('Katı'),
		liquidLabel: plainText(12).default('Sıvı'),
		vapourLabel: plainText(12).default('Buhar'),
		gasLabel: plainText(12).default('Gaz'),
		tripleLabel: plainText(20).default('Üçlü nokta'),
		criticalLabel: plainText(20).default('Kritik nokta'),
		temperatureLabel: plainText(24).default('Sıcaklık (°C)'),
		pressureLabel: plainText(24).default('Basınç (atm)'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Chemistry: an acid-base titration, strong acid with strong base. The burette (`burette`: label, molarity, valence)
	 * drips into the flask (`flask`: acid or base, label, molarity, volume in mL, valence) on the beat that shows `run`,
	 * over `duration` seconds up to `maxVolume` mL (twice the equivalence volume by default); the solution takes the
	 * indicator's colour, the pH is read out and the pH curve is drawn. Parts: burette, flask, curve, run, equivalence.
	 */
	z
		.object({
			kind: z.literal('titration'),
			flask: z.object({kind: z.enum(['acid', 'base']), label: plainText(14), molarity: z.number().min(0.001).max(2), volume: z.number().min(5).max(100), valence: z.number().int().min(1).max(3).default(1)}),
			burette: z.object({label: plainText(14), molarity: z.number().min(0.001).max(2), valence: z.number().int().min(1).max(3).default(1)}),
			maxVolume: z.number().min(5).max(100).optional(),
			indicator: z.enum(['phenolphthalein', 'bromothymol', 'none']).default('phenolphthalein'),
			duration: z.number().min(4).max(30).default(12),
			volumeLabel: plainText(30).default('Eklenen hacim (mL)'),
			equivalenceLabel: plainText(24).default('Eşdeğerlik noktası'),
			motion: z.boolean().default(true),
		})
		.superRefine((visual, context) => {
			const equivalence = (visual.flask.molarity * visual.flask.volume * visual.flask.valence) / (visual.burette.molarity * visual.burette.valence);
			const most = visual.maxVolume ?? Math.max(10, Math.ceil((equivalence * 2) / 5) * 5);
			if (equivalence > most || most > 100) context.addIssue({code: 'custom', path: ['maxVolume'], message: `The equivalence point (${equivalence} mL) must fall within the burette's 100 mL and maxVolume.`});
		}),
	/**
	 * Chemistry: a reaction at the particle level. `reactants` (formula, atoms of one molecule, coefficient, how many
	 * molecules there are) sit on the left; on the beat that shows `react` the equation runs turn by turn (`step`
	 * seconds each) until the limiting reactant runs out, the products appearing on the right; the leftover is ringed and
	 * the result line names the limiting reactant and what is left. The equation must be balanced. Parts: reactants,
	 * react, products, result.
	 */
	z
		.object({
			kind: z.literal('stoichiometry'),
			reactants: z
				.array(z.object({formula: plainText(10), atoms: z.array(z.string().trim().min(1).max(2)).min(1).max(5), coefficient: z.number().int().min(1).max(4), count: z.number().int().min(1).max(12)}))
				.min(1)
				.max(2),
			products: z
				.array(z.object({formula: plainText(10), atoms: z.array(z.string().trim().min(1).max(2)).min(1).max(5), coefficient: z.number().int().min(1).max(4)}))
				.min(1)
				.max(2),
			step: z.number().min(0.5).max(4).default(1.2),
			beforeLabel: plainText(20).default('Girenler'),
			afterLabel: plainText(20).default('Ürünler'),
			limitingLabel: plainText(16).default('Sınırlayıcı'),
			excessLabel: plainText(16).default('Artan'),
			completeLabel: plainText(40).default('Artan madde yok'),
			motion: z.boolean().default(true),
		})
		.superRefine((visual, context) => {
			const tally = (species: {atoms: string[]; coefficient: number}[]) => {
				const counts: Record<string, number> = {};
				for (const item of species) for (const atom of item.atoms) counts[atom] = (counts[atom] ?? 0) + item.coefficient;
				return counts;
			};
			const left = tally(visual.reactants);
			const right = tally(visual.products);
			const unbalanced = [...new Set([...Object.keys(left), ...Object.keys(right)])].filter((element) => left[element] !== right[element]);
			if (unbalanced.length) context.addIssue({code: 'custom', path: ['products'], message: `The equation is not balanced (${unbalanced.join(', ')}).`});
			const turns = Math.min(...visual.reactants.map((reactant) => Math.floor(reactant.count / reactant.coefficient)));
			if (turns < 1) context.addIssue({code: 'custom', path: ['reactants'], message: 'There are too few molecules for the reaction to run once.'});
			visual.products.forEach((product, index) => {
				if (product.coefficient * turns > 12) context.addIssue({code: 'custom', path: ['products', index], message: 'At most 12 product molecules of a kind fit.'});
			});
		}),
	/**
	 * Chemistry, biology: attractions between particles, in one or two panels side by side. `hydrogen`: water molecules
	 * in a network, dashed H···O hydrogen bonds that keep breaking and re-forming; `london`: diatomic molecules whose
	 * electron clouds shift and induce dipoles in their neighbours; `dipole`: HCl-like molecules lined up δ+ to δ−;
	 * `ionDipole`: water around an ion (`ion`), O towards a cation, H towards an anion (`anion`). Parts: p1, p2, links.
	 */
	z
		.object({
			kind: z.literal('intermolecular'),
			panels: z
				.array(z.object({mode: z.enum(['hydrogen', 'london', 'dipole', 'ionDipole']), label: plainText(28), ion: plainText(4).optional(), anion: z.boolean().default(false)}))
				.min(1)
				.max(2),
			motion: z.boolean().default(true),
		})
		.refine((visual) => visual.panels.every((panel) => (panel.mode === 'ionDipole') === Boolean(panel.ion)), {message: 'An ion-dipole panel needs its ion; the other panels take none.'}),
	/**
	 * Chemistry, physics: Rutherford's gold-foil experiment. Alpha particles from a source cross a gold foil and light a
	 * circular screen: most straight through, some deflected, a very few bounced back (Rutherford's formula per miss
	 * distance), the beam starting on the beat that shows `beam` and repeating every `period` seconds; an inset atom
	 * shows the tiny nucleus in empty space. Parts: source, foil, screen, beam, atom.
	 */
	z.object({
		kind: z.literal('rutherford'),
		period: z.number().min(4).max(20).default(7),
		sourceLabel: plainText(20).default('Radyoaktif kaynak'),
		foilLabel: plainText(16).default('Altın levha'),
		screenLabel: plainText(20).default('Floresan ekran'),
		nucleusLabel: plainText(30).default('Atom çoğunlukla boşluk'),
		motion: z.boolean().default(true),
	}),
] as const;
