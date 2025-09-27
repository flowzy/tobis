import { Events } from "discord.js";
import { createListener } from "~/factories/listener";

export default createListener({
	event: Events.Raw,

	execute(bot, packet: unknown) {
		void bot.lavalink.packetUpdate(packet);
	},
});
