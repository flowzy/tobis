import * as Sentry from '@sentry/bun';
import { createListener } from '~/factories/listener';

export default createListener({
	event: 'nodeError',

	execute(bot, node, error) {
		Sentry.captureException(error);

		bot.logger.error(
			'Lavalink node "%s" encountered an error: %s',
			node.options.identifier,
			error.message,
		);
	},
});
