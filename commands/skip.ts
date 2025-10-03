import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { createInfoEmbed } from "~/embeds/info";
import { createCommand } from "~/factories/create-command";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { isInSameVoiceChannel } from "~/utils/is-in-same-voice-channel";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("skip")
		.setDescription("Skips the current track"),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player || !isInSameVoiceChannel(interaction, player)) {
			return;
		}

		if (!player.queue.size) {
			return interaction.reply({
				content: "There is no track to skip",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const message = `**[${player.current.title}](${player.current.url})** has been skipped`;
		const skipped = await player.skip();

		if (!skipped) {
			player.stop();
		}

		await interaction.reply({
			embeds: [
				createInfoEmbed({
					message,
				}),
			],
		});
	},
});
