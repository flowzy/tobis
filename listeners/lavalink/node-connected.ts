import { createListener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "nodeConnected",

	execute(_, node) {
		logger.info('Node "%s" connected', node.host);
	},
});
