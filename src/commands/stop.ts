import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { EMBED_COLOR_INFO } from "~/config/color";
import { createCommand } from "~/factories/command";
import { isInVoiceChannel } from "~/helpers/interaction";
import { getExistingPlayer } from "~/helpers/player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("stop")
		.setDescription("Stop playing and clear queue"),

	async execute(bot, interaction) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		const queueSize = player.queue.totalSize;

		player.destroy(true);

		if (!interaction.member.voice.channel) {
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(EMBED_COLOR_INFO)
			.setDescription(
				`Disconnected from <#${interaction.member.voice.channel.id}>`,
			);

		if (queueSize) {
			embed.setFooter({ text: `Skipped ${queueSize} tracks` });
		}

		await interaction.reply({
			embeds: [embed],
		});
	},
});
