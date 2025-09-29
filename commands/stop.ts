import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { EmbedColor } from "~/constants/color";
import { createCommand } from "~/factories/create-command";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { isInVoiceChannel } from "~/utils/is-in-voice-channel";

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

		const queueSize = player.queue.size;
		const voiceChannelId = player.voiceChannelId;

		player.destroy("stopped");

		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Info)
			.setDescription(`Disconnected from <#${voiceChannelId}>`);

		if (queueSize) {
			embed.setFooter({ text: `Skipped ${queueSize} tracks` });
		}

		await interaction.reply({
			embeds: [embed],
		});
	},
});
