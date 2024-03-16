import ms from "pretty-ms";
import { EmbedBuilder } from "discord.js";
import { EMBED_COLOR_INFO } from "~/config/color";
import { env } from "~/env";

export function createQueueEndedEmbed() {
	const embed = new EmbedBuilder()
		.setColor(EMBED_COLOR_INFO)
		.setAuthor({ name: "Queue ended" })
		.setDescription("Type `/play` to add a new track to play");

	if (env.BOT_IDLE_AUTO_DISCONNECT) {
		embed.setFooter({
			text: `Leaving voice channel in ${ms(
				env.BOT_IDLE_DISCONNECT_SECONDS * 1_000,
			)}`,
		});
	}

	return embed;
}
