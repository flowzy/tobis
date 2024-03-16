import { Events } from "discord.js";
import { createListener } from "~/factories/listener";

export default createListener({
	event: Events.ClientReady,
	once: true,

	execute(bot, client) {
		bot.logger.info("Ready! Logged in as %s", client.user.tag);
		bot.lavalink.init(client.user.id);
	},
});
