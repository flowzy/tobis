import { Events } from "discord.js";
import type { VoicePacket } from "magmastream";
import { createListener } from "~/factories/listener";

export default createListener({
	event: Events.Raw,

	execute(bot, data: VoicePacket) {
		void bot.lavalink.updateVoiceState(data);
	},
});
