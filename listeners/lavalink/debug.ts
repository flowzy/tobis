import { createListener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "debug",

	execute(_, message) {
		logger.debug(message);
	},
});
