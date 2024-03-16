import type { TextBasedChannelFields } from "discord.js";
import { env } from "~/env";
import { createListener } from "~/factories/listener";
import { createQueueEndedEmbed } from "~/messages/queue-ended";

export default createListener({
	event: "queueEnd",

	execute(bot, player) {
		bot.logger.debug("Queue ended for player %s", player.guild);

		if (!player.textChannel) return;

		const channel = bot.client.channels.cache.get(player.textChannel) as
			| TextBasedChannelFields<true>
			| undefined;

		channel?.send({
			embeds: [createQueueEndedEmbed()],
		});

		if (env.BOT_IDLE_AUTO_DISCONNECT) {
			player.timeout = setTimeout(
				() => player.destroy(true),
				env.BOT_IDLE_DISCONNECT_SECONDS * 1_000,
			);
		}
	},
});
