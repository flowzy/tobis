import * as Sentry from "@sentry/bun";
import { Events } from "discord.js";
import { createListener } from "~/factories/listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: Events.Error,

	execute(_, error) {
		logger.error(error);
		Sentry.captureException(error);
	},
});
