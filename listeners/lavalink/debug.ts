import { logger } from "~/lib/logger";
import { createListener } from "~/structures/listener";

export default createListener({
	event: "debug",

	execute(_, message) {
		logger.debug(message);
	},
});
