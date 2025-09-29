import { SlashCommandBuilder } from "discord.js";
import { createCommand } from "~/factories/create-command";
import { getExistingPlayer } from "~/utils/get-existing-player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("pause")
		.setDescription("Pauses the current track"),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.pause();

		await interaction.reply({
			content: "Paused.",
		});
	},
});
