import { EmbedBuilder } from "discord.js";
import type { Player } from "moonlink.js";
import ms from "pretty-ms";
import { config } from "~/config";
import { EmbedColor } from "~/constants/color";
import { createListener } from "~/factories/listener";

export default createListener({
	event: "queueEnd",

	async execute(bot, player: Player) {
		await bot.nowPlaying.remove(player);

		const channel = bot.client.channels.cache.get(player.textChannelId);

		if (channel?.isSendable()) {
			const embed = new EmbedBuilder()
				.setColor(EmbedColor.Info)
				.setAuthor({ name: "Queue ended" })
				.setDescription("Type `/play` to add a new track to play");

			if (config.voice.idle_auto_disconnect) {
				embed.setFooter({
					text: `Leaving voice channel in ${ms(
						config.voice.idle_disconnect_seconds * 1_000,
					)}`,
				});
			}

			await channel.send({
				embeds: [embed],
			});
		}

		if (!config.voice.idle_auto_disconnect) {
			return;
		}

		setTimeout(() => {
			if (!player.playing && !player.queue.size) {
				player.destroy("idle");
			}
		}, config.voice.idle_disconnect_seconds * 1_000);
	},
});
