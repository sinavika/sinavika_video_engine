import {exec} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {saveNumberedOutput, toFileName} from '../src/Services/OutputFiles';

const newRoot = () => mkdtempSync(path.join(os.tmpdir(), 'sinavika-outputs-'));
const outputsIn = (root: string, kind = 'Videos') =>
	readdirSync(path.join(root, kind))
		.filter((file) => /^\d+_/.test(file))
		.sort();
const write = (text: string) => async (paths: string[]) => {
	paths.forEach((file, index) => writeFileSync(file, `${text}${index}`));
	return text;
};
const save = (root: string, title: string, kind: 'Videos' | 'Images' = 'Videos') =>
	saveNumberedOutput({kind, title, extension: kind === 'Videos' ? 'mp4' : 'png', rootDirectory: root, produce: write(title)});

describe('toFileName', () => {
	it('turns Turkish titles into safe, readable names', () => {
		expect(toFileName('Matematik Denklem Çözümü')).toBe('Matematik_Denklem_Cozumu');
		expect(toFileName("TYT'de Süreyi Doğru Kullan")).toBe('TYTde_Sureyi_Dogru_Kullan');
		expect(toFileName('ışık, ÇİÇEK & ğöş!')).toBe('Isik_CICEK_Gos');
	});

	it('drops formulas, markup and path characters', () => {
		expect(toFileName('$3(x-2)+4$ denklemi **nedir**?')).toBe('Denklemi_Nedir');
		expect(toFileName('../../etc/passwd')).toBe('Etc_Passwd');
		expect(toFileName('a/b\\c:d*e?f"g<h>i|j')).toMatch(/^[A-Za-z0-9_]+$/);
	});

	it('keeps names short and never returns an empty one', () => {
		const long = toFileName('Bu çok uzun bir başlık ve içinde gereğinden fazla kelime bulunuyor gerçekten');
		expect(long.length).toBeLessThanOrEqual(60);
		expect(long.split('_').length).toBeLessThanOrEqual(7);
		expect(toFileName('???')).toBe('Icerik');
		expect(toFileName('')).toBe('Icerik');
	});
});

describe('saveNumberedOutput', () => {
	it('numbers outputs 01, 02, 03 and names them after the content', async () => {
		const root = newRoot();
		await save(root, 'Matematik Denklem Çözümü');
		await save(root, 'TYT Problem Çözümü');
		const third = await save(root, 'Fizik Hareket Konusu');
		expect(outputsIn(root)).toEqual(['01_Matematik_Denklem_Cozumu.mp4', '02_TYT_Problem_Cozumu.mp4', '03_Fizik_Hareket_Konusu.mp4']);
		expect(third).toMatchObject({kind: 'Videos', number: 3, name: 'Fizik_Hareket_Konusu'});
		expect(third.files[0]).toBe(path.join(root, 'Videos', '03_Fizik_Hareket_Konusu.mp4'));
	});

	it('numbers videos and images independently', async () => {
		const root = newRoot();
		await save(root, 'Video Bir');
		await save(root, 'Video İki');
		const image = await save(root, 'Görsel Bir', 'Images');
		expect(image.number).toBe(1);
		expect(outputsIn(root, 'Images')).toEqual(['01_Gorsel_Bir.png']);
	});

	it('never overwrites: the same title twice gives two files', async () => {
		const root = newRoot();
		const first = await save(root, 'Aynı İsim');
		const second = await save(root, 'Aynı İsim');
		expect(outputsIn(root)).toEqual(['01_Ayni_Isim.mp4', '02_Ayni_Isim.mp4']);
		expect(readFileSync(first.files[0], 'utf8')).toBe('Aynı İsim0');
		expect(second.number).toBe(2);
	});

	it('continues after whatever is already in the folder, without touching it', async () => {
		const root = newRoot();
		mkdirSync(path.join(root, 'Videos'), {recursive: true});
		writeFileSync(path.join(root, 'Videos', '07_Eski_Video.mp4'), 'eski');
		writeFileSync(path.join(root, 'Videos', 'notlar.txt'), 'not');
		const saved = await save(root, 'Yeni Video');
		expect(saved.number).toBe(8);
		expect(readFileSync(path.join(root, 'Videos', '07_Eski_Video.mp4'), 'utf8')).toBe('eski');
	});

	it('goes past 99 without padding problems', async () => {
		const root = newRoot();
		mkdirSync(path.join(root, 'Images'), {recursive: true});
		writeFileSync(path.join(root, 'Images', '99_Son.png'), 'x');
		expect((await save(root, 'Yüzüncü', 'Images')).files[0]).toMatch(/100_Yuzuncu\.png$/);
		expect((await save(root, 'Sonraki', 'Images')).number).toBe(101);
	});

	it('saves nothing when the production fails, and reuses the number', async () => {
		const root = newRoot();
		await save(root, 'İlk');
		const failing = saveNumberedOutput({
			kind: 'Videos',
			title: 'Bozuk',
			extension: 'mp4',
			rootDirectory: root,
			produce: async ([file]) => {
				writeFileSync(file, 'yarım');
				throw new Error('render crashed');
			},
		});
		await expect(failing).rejects.toThrow('render crashed');
		expect(outputsIn(root)).toEqual(['01_Ilk.mp4']);
		expect(readdirSync(path.join(root, 'Videos', '.work')).filter((file) => file.endsWith('.mp4'))).toEqual([]);
		expect((await save(root, 'Sonraki')).number).toBe(2);
	});

	it('treats an empty or missing file as a failed production', async () => {
		const root = newRoot();
		const empty = saveNumberedOutput({kind: 'Images', title: 'Boş', extension: 'png', rootDirectory: root, produce: async ([file]) => writeFileSync(file, '')});
		await expect(empty).rejects.toThrow(/nothing was saved/);
		const missing = saveNumberedOutput({kind: 'Images', title: 'Yok', extension: 'png', rootDirectory: root, produce: async () => undefined});
		await expect(missing).rejects.toThrow(/nothing was saved/);
		expect(outputsIn(root, 'Images')).toEqual([]);
	});

	it('saves a multi-part production under one number', async () => {
		const root = newRoot();
		const saved = await saveNumberedOutput({kind: 'Images', title: 'Üslü Sayılar', extension: 'png', parts: ['1', '2', '3'], rootDirectory: root, produce: write('slayt')});
		expect(outputsIn(root, 'Images')).toEqual(['01_Uslu_Sayilar_1.png', '01_Uslu_Sayilar_2.png', '01_Uslu_Sayilar_3.png']);
		expect(saved.files).toHaveLength(3);
		expect((await save(root, 'Sonraki', 'Images')).number).toBe(2);
	});

	it('gives every one of 30 simultaneous productions its own number', async () => {
		const root = newRoot();
		const saved = await Promise.all(Array.from({length: 30}, (_, index) => save(root, `Eşzamanlı ${index % 3}`)));
		const numbers = saved.map((entry) => entry.number).sort((a, b) => a - b);
		expect(numbers).toEqual(Array.from({length: 30}, (_, index) => index + 1));
		expect(outputsIn(root)).toHaveLength(30);
		expect(readdirSync(path.join(root, 'Videos', '.work', 'Claims'))).toEqual([]);
	});

	it('keeps numbers unique across separate processes running at the same time', async () => {
		const root = newRoot();
		const script = path.resolve(__dirname, 'Fixtures', 'SaveOutputs.ts');
		const run = () =>
			new Promise<void>((resolve, reject) => {
				exec(`npx tsx "${script}" "${root}" 6`, (error) => (error ? reject(error) : resolve()));
			});
		// Three processes at once, each saving six outputs into the same folder.
		await Promise.all([run(), run(), run()]);
		const numbers = outputsIn(root).map((file) => Number(file.split('_')[0]));
		expect(numbers).toHaveLength(18);
		expect(new Set(numbers).size).toBe(18);
		expect(Math.max(...numbers)).toBe(18);
	}, 120_000);

	it('records what was made in a manifest and returns it', async () => {
		const root = newRoot();
		const saved = await saveNumberedOutput({
			kind: 'Images',
			title: 'Günlük Soru Hook',
			extension: 'png',
			rootDirectory: root,
			metadata: {category: 'HookContent', theme: 'SinavikaBrand', width: 1080, height: 1080},
			produce: write('x'),
		});
		expect(saved.metadata).toMatchObject({category: 'HookContent', width: 1080});
		expect(new Date(saved.createdAt).getTime()).toBeGreaterThan(Date.now() - 60_000);
		const manifest = readFileSync(path.join(root, 'Images', 'Manifest.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
		expect(manifest).toHaveLength(1);
		expect(manifest[0]).toMatchObject({number: 1, name: 'Gunluk_Soru_Hook', metadata: {theme: 'SinavikaBrand'}});
		expect(existsSync(manifest[0].files[0])).toBe(true);
	});
});
