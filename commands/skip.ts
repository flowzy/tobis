import { SlashCommandBuilder } from "discord.js";
import { createInfoEmbed } from "~/embeds/info";
import { createCommand } from "~/factories/create-command";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { isInSameVoiceChannel } from "~/utils/is-in-voice-channel";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skips the current track"),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player || !isInSameVoiceChannel(interaction, player)) {
			return;
		}

		const track = player.current;

		await player.skip();

		await interaction.reply({
			embeds: [
				createInfoEmbed({
					title: "Track Skipped",
					message: `[**${track.title}**](${track.url}) has been skipped`,
				}),
			],
		});
	},
});
