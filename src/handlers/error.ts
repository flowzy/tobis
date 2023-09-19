import * as Sentry from '@sentry/node';
import { Events } from 'discord.js';
import { Bot } from '~/bot';
import { Handler } from '~/interfaces/handler';

export default class ErrorHandler implements Handler<Events.Error> {
	event = Events.Error;

	listener(bot: Bot, error: Error) {
		bot.logger.error(error);
		Sentry.captureException(error);
	}
}
