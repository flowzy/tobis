import { SlashCommandBuilder } from "discord.js";
import { createCommand } from "~/factories/create-command";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { isInVoiceChannel } from "~/utils/is-in-voice-channel";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear queue"),

	async execute(bot, interaction) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		await player.queue.clear();

		await interaction.reply({
			content: "Queue cleared.",
		});
	},
});
