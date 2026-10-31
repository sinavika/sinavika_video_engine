import {z} from 'zod';
import {PROCESS_CATALOG, PROCESSES} from './ProcessCatalog';

/**
 * Any subject: a process happening, stage by stage (owner, 29 Oct 2026: "heyelan anlatılıyorsa toprak gerçekten
 * kaysın"): a landslide, erosion, karst, springs, the rock cycle, a volcano. The stages and their notes are the
 * process's own (Processes/ProcessCatalog); `stages` picks some of them, in order. Beats' `stage` counts the stages
 * shown; parts are the stage ids and the process's labels.
 */
const ProcessSchema = z
	.object({
		kind: z.literal('process'),
		process: z.enum(PROCESSES),
		stages: z.array(z.string()).min(1).max(8).optional(),
	})
	.superRefine((visual, context) => {
		const known: string[] = PROCESS_CATALOG[visual.process].stages.map((stage) => stage.id);
		let last = -1;
		visual.stages?.forEach((stage, index) => {
			const at = known.indexOf(stage);
			if (at < 0) context.addIssue({code: 'custom', path: ['stages', index], message: `"${stage}" is not a stage of ${visual.process} (${known.join(', ')}).`});
			else if (at <= last) context.addIssue({code: 'custom', path: ['stages', index], message: `Stages go in the process's order: ${known.join(', ')}.`});
			last = Math.max(last, at);
		});
	});

/** The process visual: one schema, joined in ../VisualSchema.ts. */
export const PROCESS_VISUALS = [
	ProcessSchema,
] as const;
