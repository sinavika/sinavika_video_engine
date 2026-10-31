import {describe, expect, it} from 'vitest';
import {ChecklistEntrySchema, subtopicCoverage, taughtRefs, unknownSubtopics} from '../../src/Courses/Curriculum';

const entry = (id: string, category: string, topic: string, codes: string[]) =>
	ChecklistEntrySchema.parse({
		order: 1,
		id,
		exam: 'KPSS',
		category,
		categoryName: category,
		lesson: 'TAR',
		lessonName: 'Tarih',
		topic,
		topicName: topic,
		subtopics: codes.map((code) => ({code, id: `${id}-${code}`, name: code})),
		sources: {explanation: null, questions: null, questionCount: 0, answeredCount: 0, pastExamCount: 0},
	});

const section = (subtopic: string, subtopics: string[] = [], alsoTeaches: string[] = []) => ({subtopic, subtopics, alsoTeaches});

describe('subtopic coverage across scripts and levels', () => {
	// One KPSS video set serves three levels. Lisans's one Millî Mücadele topic is taught by the episodes built on
	// Önlisans's narrower topics; Ortaöğretim repeats Önlisans's list with its own ids.
	const lisans = entry('L1', 'KPSS_LISANS', 'TAR_MILLI_MUCADELE', ['TAR_MILLI_MUCADELE_01', 'TAR_MILLI_MUCADELE_02', 'TAR_MILLI_MUCADELE_03']);
	const onlisans = entry('O1', 'KPSS_ONLISANS', 'TAR_TBMM_1', ['TAR_TBMM_1_01', 'TAR_TBMM_1_02']);
	const ortaogretim = entry('M1', 'KPSS_ORTAOGRETIM', 'TAR_TBMM_1', ['TAR_TBMM_1_01', 'TAR_TBMM_1_02']);
	const scripts = [
		{
			file: 'Scripts/KPSS/TAR/TAR_KURTULUS_HAZIRLIK.json',
			refs: taughtRefs('KPSS_ONLISANS', 'TAR', [section('TAR_KURTULUS_HAZIRLIK_01', [], ['KPSS_LISANS:TAR_MILLI_MUCADELE_01', 'KPSS_LISANS:TAR_MILLI_MUCADELE_02'])]),
		},
		{file: 'Scripts/KPSS/TAR/TAR_TBMM_1.json', refs: taughtRefs('KPSS_ONLISANS', 'TAR', [section('TAR_TBMM_1_01', ['TAR_TBMM_1_02'], ['KPSS_LISANS:TAR_MILLI_MUCADELE_03'])])},
	];

	it('counts a topic as covered when its subtopics are taught across several scripts, and a twin level with it', () => {
		const [rowL, rowO, rowM] = subtopicCoverage([lisans, onlisans, ortaogretim], scripts);
		expect(rowL.missing).toEqual([]);
		expect(rowL.scripts).toEqual(['Scripts/KPSS/TAR/TAR_KURTULUS_HAZIRLIK.json', 'Scripts/KPSS/TAR/TAR_TBMM_1.json']);
		expect(rowO.scripts).toEqual(['Scripts/KPSS/TAR/TAR_TBMM_1.json']);
		expect(rowM).toMatchObject({missing: [], scripts: ['Scripts/KPSS/TAR/TAR_TBMM_1.json']});
	});

	it('does not let one level’s code stand for another level’s subtopic of the same code', () => {
		// SES_BILGISI_01 is "Sesler" in Lisans but "Büyük Ünlü Uyumu" in Önlisans.
		const lisansSes = entry('L2', 'KPSS_LISANS', 'SES_BILGISI', ['SES_BILGISI_01']);
		const onlisansSes = entry('O2', 'KPSS_ONLISANS', 'SES_BILGISI', ['SES_BILGISI_01']);
		const only = [{file: 'ses.json', refs: taughtRefs('KPSS_LISANS', 'TAR', [section('SES_BILGISI_01')])}];
		const [rowL, rowO] = subtopicCoverage([lisansSes, onlisansSes], only);
		expect(rowL.missing).toEqual([]);
		expect(rowO.missing).toEqual(['SES_BILGISI_01']);
	});

	it('names the subtopics no script teaches yet, and the ones no topic has', () => {
		expect(subtopicCoverage([lisans], scripts.slice(0, 1))[0].missing).toEqual(['TAR_MILLI_MUCADELE_03']);
		expect(subtopicCoverage([onlisans], scripts.slice(0, 1))[0]).toMatchObject({missing: ['TAR_TBMM_1_01', 'TAR_TBMM_1_02'], scripts: []});
		const typo = [{file: 'x.json', refs: taughtRefs('KPSS_LISANS', 'TAR', [section('TAR_MILLI_MUCADELE_01', [], ['KPSS_ONLISANS:TAR_TBMM_1_09'])])}];
		expect(unknownSubtopics([lisans, onlisans], typo)).toEqual([{file: 'x.json', ref: 'KPSS_ONLISANS/TAR:TAR_TBMM_1_09'}]);
	});
});
