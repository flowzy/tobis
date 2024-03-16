import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { EMBED_COLOR_INFO } from "~/config/color";
import { createCommand } from "~/factories/command";
import { isInVoiceChannel } from "~/helpers/interaction";
import { getExistingPlayer } from "~/helpers/player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("Stop playing and clear queue"),

	execute(bot, interaction) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		const queueSize = player.queue.totalSize;

		player.destroy(true);

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(EMBED_COLOR_INFO)
					.setDescription(
						`Disconnected from <#${interaction.member.voice.channel?.id}>`,
					)
					.setFooter({ text: `Skipped ${queueSize} tracks` }),
			],
		});
	},
});
