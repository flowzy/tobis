import { Events } from 'discord.js';
import { VoicePacket } from 'magmastream';
import { createListener } from '~/factories/listener';

export default createListener({
	event: Events.Raw,

	execute(bot, data: VoicePacket) {
		bot.lavalink.updateVoiceState(data);
	},
});
