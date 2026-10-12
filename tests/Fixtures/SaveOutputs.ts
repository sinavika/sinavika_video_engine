/** Saves N numbered outputs into a root directory. Run by several processes at once in OutputFiles.test.ts. */
import {writeFileSync} from 'node:fs';
import {saveNumberedOutput} from '../../src/Services/OutputFiles';

const [rootDirectory, count] = process.argv.slice(2);

for (let index = 0; index < Number(count); index++) {
	await saveNumberedOutput({
		kind: 'Videos',
		title: `Süreç ${process.pid}`,
		extension: 'mp4',
		rootDirectory,
		produce: async ([file]) => writeFileSync(file, 'video'),
	});
}
