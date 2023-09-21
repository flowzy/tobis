import * as Sentry from '@sentry/bun';
import { Events } from 'discord.js';
import { createListener } from '~/factories/listener';

export default createListener({
	event: Events.Error,

	execute(bot, error) {
		bot.logger.error(error);
		Sentry.captureException(error);
	},
});
