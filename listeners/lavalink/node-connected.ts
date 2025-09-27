import { logger } from "~/lib/logger";
import { createListener } from "~/structures/listener";

export default createListener({
	event: "nodeConnected",

	execute(_, node) {
		logger.info('Node "%s" connected', node.host);
	},
});
