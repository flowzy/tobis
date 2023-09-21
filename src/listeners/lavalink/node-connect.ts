import { createListener } from '~/factories/listener';

export default createListener({
	event: 'nodeConnect',

	execute(bot, node) {
		bot.logger.info('Node %s connected.', node.options.identifier);
	},
});
