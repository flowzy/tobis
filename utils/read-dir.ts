import * as path from "node:path";
import { globSync } from "glob";

export function readDir(dir: string) {
	return globSync(path.join(process.cwd(), dir));
}
