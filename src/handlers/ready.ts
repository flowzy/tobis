import { Client, Events } from 'discord.js';
import { Bot } from '~/bot';
import { Handler } from '~/interfaces/handler';

export default class ReadyHandler implements Handler<Events.ClientReady> {
	once = true;
	event = Events.ClientReady;

	listener(bot: Bot, client: Client<true>) {
		bot.logger.info('Ready! Logged in as %s', client.user.tag);
		bot.lavalink.init(client.user.id);
	}
}
