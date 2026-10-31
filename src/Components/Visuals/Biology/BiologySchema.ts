import {z} from 'zod';
import {plainText} from '../../../Schemas/RichText';
import {alleles, phenotypeKey, zygote} from './Allele';
import {FOOD_WEB_GAP, FOOD_WEB_ROW, foodWebNodeWidth} from './Ecology';

/**
 * Biology: the organelles a cell figure draws, by the names beats point at. Each cell type has its own set: an
 * animal cell has centrosome and lysosomes, a plant cell a wall, chloroplasts and a central vacuole, a prokaryote
 * no nucleus or membrane-bound organelles (its DNA lies free, with plasmids, under a wall and capsule).
 */
export const CELL_TYPE_PARTS = {
	animal: ['zar', 'sitoplazma', 'cekirdek', 'cekirdekcik', 'ribozom', 'ger', 'der', 'golgi', 'lizozom', 'mitokondri', 'koful', 'sentrozom', 'iskelet'],
	plant: ['cidar', 'zar', 'sitoplazma', 'cekirdek', 'cekirdekcik', 'ribozom', 'ger', 'der', 'golgi', 'mitokondri', 'kloroplast', 'koful', 'iskelet'],
	prokaryote: ['kapsul', 'cidar', 'zar', 'sitoplazma', 'ribozom', 'dna', 'plazmit', 'kamci'],
} as const;

/**
 * The cell figure's drawing stage (Visuals/Biology/Cell): drawn on 1000 × 640, shown from y = 50 for 540, the band
 * the cell and its labels fill, so the cell is as large as the card allows.
 */
export const CELL_STAGE = {width: 1000, height: 540, top: 50} as const;

const CELL_PARTS = [
	'zar',
	'cidar',
	'kapsul',
	'sitoplazma',
	'cekirdek',
	'cekirdekcik',
	'ribozom',
	'ger',
	'der',
	'golgi',
	'lizozom',
	'mitokondri',
	'kloroplast',
	'koful',
	'sentrozom',
	'iskelet',
	'dna',
	'plazmit',
	'kamci',
] as const;

/** The organelles named when a cell figure does not list its own labels: the ones a lesson names first. */
export const CELL_DEFAULT_LABELS = {
	animal: ['zar', 'cekirdek', 'mitokondri', 'ribozom', 'ger', 'golgi', 'lizozom', 'sentrozom', 'koful'],
	plant: ['cidar', 'zar', 'cekirdek', 'kloroplast', 'koful', 'mitokondri', 'golgi', 'ribozom'],
	prokaryote: ['kapsul', 'cidar', 'zar', 'sitoplazma', 'ribozom', 'dna', 'plazmit', 'kamci'],
} as const;

/** Biology: the parts of the cell membrane's fluid mosaic and the ways matter crosses it. */
export const MEMBRANE_PARTS = ['fosfolipit', 'kolesterol', 'kanal', 'tasiyici', 'periferik', 'glikoprotein', 'glikolipit'] as const;

const MEMBRANE_TRANSPORT = ['difuzyon', 'kolaylastirilmis', 'aktif', 'osmoz'] as const;

/** Biology: the stages a division figure can draw, and the ones it draws when it names none. */
const DIVISION_STAGES = ['interfaz', 'profaz', 'metafaz', 'anafaz', 'telofaz', 'profaz1', 'metafaz1', 'anafaz1', 'telofaz1', 'metafaz2', 'anafaz2', 'telofaz2'] as const;

export const DIVISION_DEFAULT_STAGES = {
	mitosis: ['interfaz', 'profaz', 'metafaz', 'anafaz', 'telofaz'],
	meiosis: ['profaz1', 'metafaz1', 'anafaz1', 'telofaz1'],
} as const;

/** Biology: a gamete written allele by allele, one per gene: "A", "SD", "X^R", "Y", "AR" (blood group and Rh). */
const GAMETE = z
	.string()
	.trim()
	.regex(/^([A-Za-z](\^[A-Za-z0-9])?){1,3}$/, 'A gamete is one to three alleles: "A", "Sd", "X^R", "Y".');

/** Biology: a person in a pedigree, as a beat names it (p + id) and couples point to it. */
const PERSON_ID = z.string().regex(/^[a-z0-9]{1,3}$/, 'A person id is one to three lower-case letters or digits.');

/** Biology: an organism of a food web, as links and beats name it: lower-case letters ("tilki", "fitoplankton"). */
const ORGANISM_ID = z.string().regex(/^[a-zçğıöşü]{2,14}$/u, 'An organism id is 2 to 14 lower-case letters: "tilki".');

/** Biology: the taxonomic ranks from kingdom to species (the taxonomy visual's parts, in order). */
export const TAXONOMY_LEVELS = ['alem', 'sube', 'sinif', 'takim', 'aile', 'cins', 'tur'] as const;

/** The biology visuals: one schema per kind, joined in ../VisualSchema.ts. */
export const BIOLOGY_VISUALS = [
	/**
	 * Chemistry: fractional distillation of crude oil. Vapour from the furnace climbs a column that is hot at the foot
	 * and cool at the top; each bubble condenses on its own fraction's tray and runs out through its pipe. `fractions`
	 * run top (lightest) to bottom (heaviest). Parts: column, feed, gradient, f1….
	 */
	/**
	 * Biology: gene expression. `transcription`: RNA polymerase opens the DNA and builds an mRNA complementary to the
	 * template strand; `translation`: a ribosome moves codon by codon, tRNAs bring amino acids, the polypeptide grows
	 * and is released at the stop codon. `codons` are mRNA triplets with their amino acids; only the last may be a stop.
	 */
	z
		.object({
			kind: z.literal('geneExpression'),
			mode: z.enum(['transcription', 'translation']).default('translation'),
			codons: z
				.array(z.object({codon: z.string().regex(/^[AUGC]{3}$/), aminoAcid: plainText(4), stop: z.boolean().default(false)}))
				.min(3)
				.max(7),
			period: z.number().min(1.5).max(6).default(3),
			codingLabel: plainText(18).default('Kodlayan iplik'),
			templateLabel: plainText(18).default('Kalıp iplik'),
			mrnaLabel: plainText(10).default('mRNA'),
			polymeraseLabel: plainText(18).default('RNA polimeraz'),
			ribosomeLabel: plainText(14).default('Ribozom'),
			peptideLabel: plainText(14).default('Polipeptit'),
			motion: z.boolean().default(true),
		})
		.refine((gene) => gene.codons.slice(0, -1).every((codon) => !codon.stop), {message: 'Yalnız son kodon durdurma kodonu olabilir.'}),
	/**
	 * Biology: the nephron. Glomerulus and Bowman's capsule, proximal tubule, loop of Henle, distal tubule, collecting
	 * duct; the filtrate flows on the beat that shows `filtration`, and reabsorption, secretion and ADH's water
	 * reabsorption appear on the beats that show them. `labels` can be numbers for a question figure (`numbered`
	 * draws them large; `motion: false` keeps it still).
	 */
	z.object({
		kind: z.literal('nephron'),
		labels: z
			.object({capsule: plainText(18), glomerulus: plainText(18), proximal: plainText(18), loop: plainText(18), distal: plainText(18), collecting: plainText(18)})
			.default({capsule: 'Bowman kapsülü', glomerulus: 'Glomerulus', proximal: 'Proksimal tüp', loop: 'Henle kulpu', distal: 'Distal tüp', collecting: 'Toplama kanalı'}),
		numbered: z.boolean().default(false),
		reabsorptionLabel: z.array(plainText(22)).min(1).max(3).default(['Geri emilim:', 'glikoz, amino asit,', 'Na⁺, su']),
		secretionLabel: z.array(plainText(22)).min(1).max(3).default(['Salgılama:', 'H⁺, K⁺, kreatinin']),
		adhLabel: z.array(plainText(18)).min(1).max(3).default(['ADH:', 'su geri emilimi']),
		urineLabel: plainText(12).default('İdrar'),
		period: z.number().min(4).max(16).default(8),
		motion: z.boolean().default(true),
	}),
	/**
	 * Biology: blood circulation. The four-chambered heart (seen from the front), the lungs and the body; the small
	 * (pulmonary) and big (systemic) circulations, oxygen-rich and oxygen-poor blood; on the `run` beat a marked red
	 * blood cell makes the round trip in `period` seconds.
	 */
	z.object({
		kind: z.literal('circulation'),
		period: z.number().min(4).max(20).default(10),
		lungsLabel: plainText(18).default('Akciğerler'),
		bodyLabel: plainText(20).default('Vücut dokuları'),
		rightAtriumLabel: plainText(13).default('Sağ kulakçık'),
		leftAtriumLabel: plainText(13).default('Sol kulakçık'),
		rightVentricleLabel: plainText(13).default('Sağ karıncık'),
		leftVentricleLabel: plainText(13).default('Sol karıncık'),
		pulmonaryArteryLabel: plainText(18).default('Akciğer atardamarı'),
		pulmonaryVeinLabel: plainText(20).default('Akciğer toplardamarı'),
		aortaLabel: plainText(14).default('Aort'),
		venaCavaLabel: plainText(16).default('Ana toplardamar'),
		richLabel: plainText(16).default('Oksijence zengin'),
		poorLabel: plainText(16).default('Oksijence fakir'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Biology: chemical digestion along the canal. Columns are stations, rows nutrients; each cell holds what the
	 * nutrient is on leaving that station, as group sizes (chains of units, or fat drops): [8] one chain, [2, 2, 2, 2]
	 * pairs, ones single units. The food reaches the stations one by one; chains break and the enzyme appears.
	 */
	z
		.object({
			kind: z.literal('digestion'),
			stations: z.array(plainText(16)).min(2).max(4),
			rows: z
				.array(
					z.object({
						label: plainText(14),
						shape: z.enum(['circle', 'square', 'drop']).default('circle'),
						intake: z.array(z.number().int().min(1).max(8)).min(1).max(8),
						stages: z.array(z.array(z.number().int().min(1).max(8)).min(1).max(8)),
						enzymes: z.array(plainText(22)),
					}),
				)
				.min(1)
				.max(3),
			period: z.number().min(1.5).max(6).default(3),
			motion: z.boolean().default(true),
		})
		.refine((digestion) => digestion.rows.every((row) => row.stages.length === digestion.stations.length && row.enzymes.length === digestion.stations.length), {
			message: 'Her besin için her istasyonda bir durum ve bir enzim (boş olabilir) olmalı.',
		})
		.refine((digestion) => digestion.rows.every((row) => row.stages.every((stage) => stage.reduce((a, b) => a + b, 0) === row.intake.reduce((a, b) => a + b, 0))), {
			message: 'Sindirimde birim sayısı korunur: her durumun toplamı alınan besininkine eşit olmalı.',
		}),
	/**
	 * Biology: the sliding filaments of a sarcomere. On the `run` beat the Z lines close in from `relaxed` to
	 * `contracted` µm (on the beat that shows `relax` they part again); the A band keeps its length, the I band and
	 * the H zone shrink. `lengths: false` keeps only the band labels, for a question figure (labels can be I, II, III).
	 */
	z
		.object({
			kind: z.literal('sarcomere'),
			relaxed: z.number().min(2).max(3).default(2.4),
			contracted: z.number().min(2).max(3).default(2),
			lengths: z.boolean().default(true),
			aLabel: plainText(12).default('A bandı'),
			iLabel: plainText(12).default('I bandı'),
			hLabel: plainText(12).default('H bölgesi'),
			zLabel: plainText(12).default('Z çizgisi'),
			sarcomereLabel: plainText(12).default('Sarkomer'),
			motion: z.boolean().default(true),
		})
		.refine((sarcomere) => sarcomere.contracted <= sarcomere.relaxed, {message: 'Kasılmış boy gevşek boydan uzun olamaz.'}),
	/**
	 * Biology: the eye as an optical instrument. Rays pass the cornea and the lens and focus on the retina. `normal`
	 * (with `near`, a near point's light focuses behind the retina until the lens thickens on the beat that shows
	 * `near`), `myopia` (focus in front of the retina) and `hyperopia` (behind it), corrected by glasses on the beat
	 * that shows `glasses`.
	 */
	z.object({
		kind: z.literal('eye'),
		mode: z.enum(['normal', 'myopia', 'hyperopia']).default('normal'),
		near: z.boolean().default(false),
		corneaLabel: plainText(14).default('Kornea'),
		lensLabel: plainText(14).default('Mercek'),
		retinaLabel: plainText(14).default('Retina'),
		foveaLabel: plainText(14).default('Sarı benek'),
		nerveLabel: plainText(16).default('Görme siniri'),
		glassesLabel: plainText(24).optional(),
		motion: z.boolean().default(true),
	}),
	/**
	 * Biology: hormonal feedback. A chain of glands passes hormones down its arrows; the last hormone's blood level
	 * fills a gauge and draws its curve. `negative`: the level overshoots once and settles at the normal level as the
	 * dashed arrow back to the glands in `back` holds them (−); `positive`: the arrow (+) speeds the flow and the level
	 * runs away (oxytocin in labour).
	 */
	z
		.object({
			kind: z.literal('feedback'),
			mode: z.enum(['negative', 'positive']).default('negative'),
			nodes: z
				.array(z.object({label: plainText(16)}))
				.min(2)
				.max(4),
			hormones: z.array(plainText(12)).min(1).max(3),
			back: z.array(z.number().int().min(0)).min(1).max(2).default([0]),
			levelLabel: plainText(24),
			setLabel: plainText(16).default('normal düzey'),
			period: z.number().min(4).max(12).default(8),
			motion: z.boolean().default(true),
		})
		.refine((feedback) => feedback.hormones.length === feedback.nodes.length - 1, {message: 'Her ok için bir hormon olmalı (bez sayısı − 1).'})
		.refine((feedback) => feedback.back.every((index) => index < feedback.nodes.length - 1), {message: 'Geri bildirim son bezden önceki bir beze dönmeli.'}),
	/**
	 * Biology: the nerve impulse. `impulse`: Na⁺ in and K⁺ out as the impulse runs along an axon, with a probe's
	 * membrane-potential graph (rest, threshold, depolarisation, repolarisation, hyperpolarisation); `myelin`: an
	 * unmyelinated and a myelinated axon race, the second jumping node to node; `synapse`: exocytosis, the
	 * transmitter crossing the cleft to the receptors, the next neuron firing, enzymes breaking it down.
	 */
	z.object({
		kind: z.literal('neuron'),
		mode: z.enum(['impulse', 'myelin', 'synapse']).default('impulse'),
		period: z.number().min(2).max(10).default(5),
		outsideLabel: plainText(14).default('Hücre dışı'),
		insideLabel: plainText(14).default('Hücre içi'),
		thresholdLabel: plainText(18).default('eşik değer'),
		plainLabel: plainText(28).default('Miyelinsiz: sürekli iletim'),
		myelinLabel: plainText(28).default('Miyelinli: atlamalı iletim'),
		nodeLabel: plainText(18).default('Ranvier boğumu'),
		terminalLabel: plainText(16).default('Akson ucu'),
		cleftLabel: plainText(18).default('Sinaptik boşluk'),
		postLabel: plainText(20).default('Postsinaptik nöron'),
		impulseLabel: plainText(16).default('Yeni impuls'),
		enzymeLabel: plainText(28).default('Enzim parçalıyor'),
		motion: z.boolean().default(true),
	}),
	/**
	 * Biology: an animal, plant or prokaryote cell drawn as textbooks do, its organelles named with leader lines on
	 * either side (`labels`, in that order; by default the main ones of the type). Beats point at organelles by name
	 * (CELL_TYPE_PARTS) and they stand out while the rest step back. `numbered` writes I, II, III… instead of the
	 * names, for a question's figure; `hide` leaves organelles out (a cell without a nucleus, a figure to compare).
	 */
	z.object({
		kind: z.literal('cell'),
		type: z.enum(['animal', 'plant', 'prokaryote']),
		labels: z.array(z.enum(CELL_PARTS)).max(13).optional(),
		hide: z.array(z.enum(CELL_PARTS)).max(10).default([]),
		numbered: z.boolean().default(false),
	}),
	/**
	 * Biology: the cell membrane in cross-section, the fluid mosaic: the phospholipid bilayer (heads out, tails in),
	 * cholesterol between the tails, a channel protein, a carrier protein, a peripheral protein inside, and a
	 * glycoprotein and glycolipid with their sugar chains outside. `transport` adds moving particles: `difuzyon`
	 * small molecules straight through the bilayer, `kolaylastirilmis` through the channel, high to low, no ATP;
	 * `aktif` through the carrier, low to high, with ATP; `osmoz` water through the membrane. Parts: MEMBRANE_PARTS
	 * and t1… for the transports. `numbered` writes I, II, III… instead of the names.
	 */
	z.object({
		kind: z.literal('membrane'),
		labels: z.array(z.enum(MEMBRANE_PARTS)).max(7).optional(),
		transport: z.array(z.enum(MEMBRANE_TRANSPORT)).max(4).default([]),
		numbered: z.boolean().default(false),
	}),
	/**
	 * Biology: osmosis made visible, one beaker per medium (`hipotonik`, `izotonik`, `hipertonik`, darker with more
	 * solute), a red blood cell (`animal`) or a plant cell in each, arrows for the net water flow and the cell
	 * changing as the water moves: swelling and bursting (hemolysis) or shrinking; turgor or plasmolysis. Parts p1…
	 * (the beakers). `numbered` names them I., II., III. and hides the results, for a question's figure.
	 */
	z.object({
		kind: z.literal('tonicity'),
		cell: z.enum(['animal', 'plant']),
		media: z
			.array(z.enum(['hipotonik', 'izotonik', 'hipertonik']))
			.min(1)
			.max(3)
			.default(['hipotonik', 'izotonik', 'hipertonik']),
		numbered: z.boolean().default(false),
	}),
	/**
	 * Biology: cell division stage by stage, maternal chromosomes red and paternal blue, `n` pairs (2n = 4 by
	 * default): mitosis (interfaz … telofaz, cytokinesis by a furrow in an `animal` cell, a cell plate in a `plant`
	 * cell) or meiosis (profaz1 … telofaz2, crossing over in prophase I, homologs parting in anaphase I, four haploid
	 * cells). `stages` picks up to five panels in order. Parts s1… (the panels). `numbered` writes I, II… and hides the
	 * names and counts: a question's figure.
	 */
	z.object({
		kind: z.literal('division'),
		mode: z.enum(['mitosis', 'meiosis']),
		cell: z.enum(['animal', 'plant']).default('animal'),
		n: z.number().int().min(1).max(3).default(2),
		stages: z.array(z.enum(DIVISION_STAGES)).min(1).max(5).optional(),
		/** `row` side by side; `grid` two columns, taller: a question's figure in its narrow panel. */
		layout: z.enum(['row', 'grid']).default('row'),
		numbered: z.boolean().default(false),
	}),
	/**
	 * Biology: the seven taxonomic ranks as a funnel narrowing from kingdom to species, each with its example
	 * (`examples`, kingdom first; a lion by default), and beside it what rises and falls on the way down. Parts:
	 * TAXONOMY_LEVELS and egilim.
	 */
	z.object({
		kind: z.literal('taxonomy'),
		examples: z.array(plainText(26)).length(7).optional(),
		trends: z.boolean().default(true),
	}),
	/**
	 * Biology: a food web (or one chain) as ÖSYM draws it: organisms in rows by trophic `level` (1 producers … 5),
	 * spread evenly in their row in the order given, an arrow for each `links` pair [food, eater] (the way energy
	 * flows, always to a higher row). `levels` names the rows on the left. Parts: the organism ids and t1… (rows).
	 */
	z
		.object({
			kind: z.literal('foodweb'),
			organisms: z
				.array(z.object({id: ORGANISM_ID, label: plainText(16), level: z.number().int().min(1).max(5)}))
				.min(2)
				.max(12),
			links: z
				.array(z.tuple([ORGANISM_ID, ORGANISM_ID]))
				.min(1)
				.max(20),
			levels: z.boolean().default(true),
		})
		.superRefine((visual, context) => {
			const byId = new Map(visual.organisms.map((organism) => [organism.id, organism]));
			if (byId.size !== visual.organisms.length) context.addIssue({code: 'custom', path: ['organisms'], message: 'Organism ids must be unique.'});
			for (let level = 1; level <= 5; level++) {
				const row = visual.organisms.filter((organism) => organism.level === level);
				const span = row.reduce((sum, organism) => sum + foodWebNodeWidth(organism.label), 0) + FOOD_WEB_GAP * Math.max(0, row.length - 1);
				if (span > FOOD_WEB_ROW) context.addIssue({code: 'custom', path: ['organisms'], message: `Row ${level} is too full: shorter names or fewer organisms.`});
			}
			const seen = new Set<string>();
			visual.links.forEach(([food, eater], index) => {
				const a = byId.get(food);
				const b = byId.get(eater);
				if (!a || !b) context.addIssue({code: 'custom', path: ['links', index], message: `Link ${food} → ${eater} names an organism the web does not have.`});
				else if (b.level <= a.level) context.addIssue({code: 'custom', path: ['links', index], message: `${eater} eats ${food}, so it stands in a higher row.`});
				if (seen.has(`${food}>${eater}`)) context.addIssue({code: 'custom', path: ['links', index], message: 'A link appears twice.'});
				seen.add(`${food}>${eater}`);
			});
		}),
	/**
	 * Biology: a food (energy) pyramid as steps narrowing upward, producers at the bottom; each level with its `label`,
	 * an `example` under it and its `value` on the left ("100 000 J"); `trends` lists what falls and rises on the way
	 * up (energy passed on, biomass, number fall; energy lost, biological magnification, body size rise). Parts l1…
	 * (bottom first) and egilim.
	 */
	z.object({
		kind: z.literal('trophic'),
		levels: z
			.array(z.object({label: plainText(20), example: plainText(26).optional(), value: plainText(12).optional()}))
			.min(2)
			.max(5),
		trends: z.boolean().default(true),
	}),
	/**
	 * Biology: a Punnett square. `rows` are one parent's gametes (down the side; the mother's by default), `columns` the
	 * other's (along the top); each cell is their zygote, alleles in textbook order (AA, Aa; X^RX^r, X^RY; AO). Every
	 * gamete carries the same genes in the same order. `phenotypes` groups the cells by phenotype class, keys as the
	 * engine writes them (dominant allele per gene: "A", "a", "SD", "sd"; codominant "AB", "MN"; blood group "O";
	 * an X-linked gene keeps its genotype: "X^RX^r", "X^rY"), shades each class and gives its share (3/4, 9/16);
	 * `ratio` adds the phenotype ratio (9 : 3 : 3 : 1). `cross` writes the cross above ("Aa × Aa"). Parts r1…, c1…, p1….
	 */
	z
		.object({
			kind: z.literal('punnett'),
			cross: plainText(40).optional(),
			rows: z.array(GAMETE).min(1).max(4),
			columns: z.array(GAMETE).min(1).max(4),
			rowTitle: plainText(24).default('Dişi gametler'),
			columnTitle: plainText(24).default('Erkek gametler'),
			phenotypes: z
				.array(z.object({keys: z.array(plainText(16)).min(1).max(4), label: plainText(18)}))
				.max(6)
				.default([]),
			ratio: z.boolean().default(true),
		})
		.superRefine((visual, context) => {
			const genes = alleles(visual.rows[0]).length;
			const uneven = [...visual.rows, ...visual.columns].filter((gamete) => alleles(gamete).length !== genes);
			uneven.forEach((gamete) => context.addIssue({code: 'custom', path: ['rows'], message: `Every gamete carries ${genes} allele(s); "${gamete}" does not.`}));
			if (uneven.length || visual.phenotypes.length === 0) return;
			const keys = new Set(visual.rows.flatMap((egg) => visual.columns.map((sperm) => phenotypeKey(zygote(egg, sperm)))));
			visual.phenotypes.forEach((phenotype, index) => {
				if (!phenotype.keys.some((key) => keys.has(key)))
					context.addIssue({code: 'custom', path: ['phenotypes', index], message: `No cell is ${phenotype.keys.join(' or ')}; the cells are ${[...keys].join(', ')}.`});
			});
			const named = new Set(visual.phenotypes.flatMap((phenotype) => phenotype.keys));
			const left = [...keys].filter((key) => !named.has(key));
			if (left.length) context.addIssue({code: 'custom', path: ['phenotypes'], message: `Cells ${left.join(', ')} belong to no phenotype.`});
		}),
	/**
	 * Biology: a pedigree as ÖSYM draws it: squares males (`m`), circles females (`f`), diamonds unknown sex (`u`);
	 * `affected` filled, `carrier` half filled, `unknown` with "?" (the one a question asks about). Each person sits at
	 * column `x` (0–10, fractions allowed) in its `generation` row and may carry a `label` under it: the number the
	 * question uses or a genotype ("X^RX^r"). `couples` join partners (`related`: a double line, marriage between
	 * relatives) and hang their children from a sibship line. The legend shows each state with both symbols and names it
	 * with `affectedLabel` and `normalLabel` ("Hasta", "Özelliği gösteren"), beside the chart or in a row `below` it. Parts p<id>.
	 */
	z
		.object({
			kind: z.literal('pedigree'),
			people: z
				.array(
					z.object({
						id: PERSON_ID,
						sex: z.enum(['m', 'f', 'u']),
						state: z.enum(['normal', 'affected', 'carrier', 'unknown']).default('normal'),
						generation: z.number().int().min(1).max(4),
						x: z.number().min(0).max(10),
						label: plainText(12).optional(),
					}),
				)
				.min(2)
				.max(18),
			couples: z
				.array(z.object({partners: z.tuple([PERSON_ID, PERSON_ID]), children: z.array(PERSON_ID).max(6).default([]), related: z.boolean().default(false)}))
				.max(8)
				.default([]),
			/** Beside the chart, under it in two columns (a question's narrow figure), or none. */
			legend: z.enum(['side', 'below', 'none']).default('side'),
			affectedLabel: plainText(20).default('Hasta'),
			normalLabel: plainText(20).default('Sağlıklı'),
		})
		.superRefine((visual, context) => {
			const byId = new Map(visual.people.map((person) => [person.id, person]));
			if (byId.size !== visual.people.length) context.addIssue({code: 'custom', path: ['people'], message: 'Person ids must be unique.'});
			visual.people.forEach((person, index) => {
				const crowded = visual.people.some((other, k) => k < index && other.generation === person.generation && Math.abs(other.x - person.x) < 0.9);
				if (crowded) context.addIssue({code: 'custom', path: ['people', index, 'x'], message: 'People in one generation stand at least 0.9 columns apart.'});
			});
			const parented = new Set<string>();
			visual.couples.forEach((couple, index) => {
				const [a, b] = couple.partners.map((id) => byId.get(id));
				if (!a || !b || a === b) {
					context.addIssue({code: 'custom', path: ['couples', index, 'partners'], message: 'A couple is two people of the chart.'});
					return;
				}
				if (a.generation !== b.generation) context.addIssue({code: 'custom', path: ['couples', index, 'partners'], message: 'Partners stand in one generation.'});
				couple.children.forEach((id, k) => {
					const child = byId.get(id);
					if (!child || child.generation !== a.generation + 1)
						context.addIssue({code: 'custom', path: ['couples', index, 'children', k], message: `Child "${id}" must be a person one generation below the couple.`});
					if (parented.has(id)) context.addIssue({code: 'custom', path: ['couples', index, 'children', k], message: `"${id}" already has parents.`});
					parented.add(id);
				});
			});
		}),
] as const;
