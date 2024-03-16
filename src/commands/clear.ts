import { SlashCommandBuilder } from "discord.js";
import { createCommand } from "~/factories/command";
import { isInVoiceChannel } from "~/helpers/interaction";
import { getExistingPlayer } from "~/helpers/player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("clear")
		.setDescription("Clear queue"),

	execute(bot, interaction) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.queue.clear();

		interaction.reply({
			content: "Queue cleared.",
		});
	},
});
