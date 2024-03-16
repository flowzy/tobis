import * as path from "node:path";
import { glob } from "glob";

const ROOT_DIR = path.dirname(Bun.main);

export async function readDir(dir: string) {
	return glob(path.join(ROOT_DIR, "src", dir));
}
