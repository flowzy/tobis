import { userMention } from "discord.js";
import type { Track } from "moonlink.js";

export function requestorMention(requestedBy: Track["requestedBy"]): string {
	if (typeof requestedBy === "string") return userMention(requestedBy);

	if (typeof requestedBy === "object" && "id" in requestedBy) {
		return userMention(requestedBy.id as string);
	}

	return "__unknown__";
}
