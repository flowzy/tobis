import * as fs from 'node:fs';
import * as path from 'node:path';

const CACHE_DIR = '.cache';
const ROOT_DIR = path.dirname(Bun.main);

function getCachePath(filename: string) {
	return path.join(ROOT_DIR, CACHE_DIR, filename);
}

export function createCache(filename: string, content: unknown) {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR);
	}

	return Bun.write(getCachePath(filename), JSON.stringify(content));
}

export function readCache(filename: string): Promise<string | undefined> {
	if (!fs.existsSync(CACHE_DIR)) {
		return Promise.resolve(undefined);
	}

	const file = Bun.file(getCachePath(filename));

	return file.text();
}

export async function isCached(filename: string, content: unknown) {
	const cached = await readCache(filename);

	return cached === JSON.stringify(content);
}
