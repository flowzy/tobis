import * as Sentry from "@sentry/bun";
import { logger } from "~/lib/logger";
import { createListener } from "~/structures/listener";

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
