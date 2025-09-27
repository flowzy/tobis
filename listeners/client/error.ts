import * as Sentry from "@sentry/bun";
import { logger } from "~/lib/logger";
import { createListener } from "~/structures/listener";

export default createListener({
	event: "error",

	execute(_, error) {
		logger.error(error);
		Sentry.captureException(error);
	},
});
