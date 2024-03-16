import { SlashCommandBuilder } from "discord.js";
import { createCommand } from "~/factories/command";
import { getExistingPlayer } from "~/helpers/player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("resume")
		.setDescription("Resumes the current track"),

	execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.pause(false);

		interaction.reply({
			content: "Resumed.",
			ephemeral: true,
		});
	},
});
