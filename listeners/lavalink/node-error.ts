import * as Sentry from "@sentry/bun";
import { createListener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "nodeError",

	execute(_, node, error) {
		Sentry.captureException(error);

		logger.error(
			'Lavalink node "%s" encountered an error: %s',
			node.host,
			error.message,
		);
	},
});
