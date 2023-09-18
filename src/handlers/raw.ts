import { Events } from 'discord.js';
import { VoicePacket } from 'magmastream';
import { Bot } from '~/bot';
import { Handler } from '~/interfaces/handler';

export default class RawHandler implements Handler<Events.Raw> {
	event = Events.Raw;

	listener(bot: Bot, data: VoicePacket) {
		bot.lavalink.updateVoiceState(data);
	}
}
