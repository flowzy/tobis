import type { Command } from "~/interfaces/command";

export function createCommand({ data, permissions, execute }: Command) {
	return {
		data,
		permissions,
		execute,
	};
}
