import {execFileSync} from 'node:child_process';
import {existsSync, statSync} from 'node:fs';
import path from 'node:path';

/**
 * Moves a file or folder to the Windows Recycle Bin (owner, 14 Nov 2026: no
 * permanent deletes; docs/Development.md). Scripts that rebuild an output
 * folder call this instead of `rm`, so the old copy can still be restored.
 * Does nothing when the path does not exist.
 */
export const toRecycleBin = (target: string): void => {
	const full = path.resolve(target);
	if (!existsSync(full)) return;
	const method = statSync(full).isDirectory() ? 'DeleteDirectory' : 'DeleteFile';
	const quoted = full.replace(/'/g, "''");
	execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::${method}('${quoted}', 'OnlyErrorDialogs', 'SendToRecycleBin')`], {stdio: 'inherit'});
	if (existsSync(full)) throw new Error(`Geri Dönüşüm Kutusu'na taşınamadı: ${full}`);
};
