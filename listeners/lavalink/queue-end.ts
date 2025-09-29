import { EmbedBuilder } from "discord.js";
import ms from "pretty-ms";
import { config } from "~/bot/config";
import { EmbedColor } from "~/constants/color";
import { TimeUnit } from "~/constants/time-unit";
import { createListener } from "~/factories/create-listener";

const DISCONNECT_TIMEOUT_MS =
	config.voice.idle_disconnect_seconds * TimeUnit.Second;

export default createListener({
	event: "queueEnd",

	async execute(bot, player) {
		await bot.lavalink.nowPlaying.remove(player);

		const channel = bot.client.channels.cache.get(player.textChannelId);

		if (channel?.isSendable()) {
			const embed = new EmbedBuilder()
				.setColor(EmbedColor.Info)
				.setAuthor({ name: "Queue ended" })
				.setDescription("Type `/play` to add a new track to play");

			if (config.voice.idle_auto_disconnect) {
				embed.setFooter({
					text: `Leaving voice channel in ${ms(DISCONNECT_TIMEOUT_MS)}`,
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
			if (bot.lavalink.nowPlaying.has(player)) {
				return;
			}

			if (!player.playing && !player.queue.size) {
				player.destroy("idle");
			}
		}, DISCONNECT_TIMEOUT_MS);
	},
});
