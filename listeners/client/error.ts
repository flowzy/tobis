import * as Sentry from "@sentry/bun";
import { createListener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "error",

	execute(_, error) {
		logger.error(error);
		Sentry.captureException(error);
	},
});
