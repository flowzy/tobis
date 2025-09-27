import { globSync } from "glob";

export function readDir(dir: string) {
	return globSync(dir);
}
