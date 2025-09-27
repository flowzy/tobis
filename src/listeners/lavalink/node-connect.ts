import type { INode } from "moonlink.js";
import { createListener } from "~/factories/listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "nodeConnect",

	execute(_, node: INode) {
		logger.info('Node "%s" connected', node.host);
	},
});
