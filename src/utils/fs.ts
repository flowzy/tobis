import * as path from "node:path";
import { globSync } from "glob";

const ROOT_DIR = path.dirname(Bun.main);

export function readDir(dir: string) {
	return globSync(path.join(ROOT_DIR, "src", dir));
}
