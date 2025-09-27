import * as Sentry from "@sentry/bun";
import type { INode } from "moonlink.js";
import { createListener } from "~/factories/listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "nodeError",

	execute(_, node: INode, error: Error) {
		Sentry.captureException(error);

		logger.error(
			'Lavalink node "%s" encountered an error: %s',
			node.host,
			error.message,
		);
	},
});
