import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { createErrorEmbed } from "~/embeds/error";
import { createInfoEmbed } from "~/embeds/info";
import { createCommand } from "~/factories/command";
import { isInSameVoiceChannel } from "~/helpers/interaction";
import { getExistingPlayer } from "~/helpers/player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("move")
		.setDescription("Move a track in the queue")
		.addNumberOption((option) =>
			option
				.setName("from")
				.setDescription("Current position")
				.setRequired(true),
		)
		.addNumberOption((option) =>
			option.setName("to").setDescription("New position").setRequired(true),
		),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player || !isInSameVoiceChannel(interaction, player)) {
			return;
		}

		const indexFrom = interaction.options.getNumber("from", true) - 1;
		const indexTo = interaction.options.getNumber("to", true) - 1;

		const moved = await player.queue.move(indexFrom, indexTo);

		if (!moved) {
			return interaction.reply({
				embeds: [
					createErrorEmbed({
						title: "Failed to move track",
						message: "Please check the provided positions.",
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}

		const track = player.queue.get(indexTo);

		await interaction.reply({
			embeds: [
				createInfoEmbed({
					title: "Track Moved",
					message: `**${track.title}** to position ${indexTo + 1}`,
				}),
			],
		});
	},
});
