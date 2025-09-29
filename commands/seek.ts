import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { createInfoEmbed } from "~/embeds/info";
import { createCommand } from "~/factories/create-command";
import { formatDuration } from "~/utils/format-duration";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { isInSameVoiceChannel } from "~/utils/is-in-same-voice-channel";
import { parsePosition } from "~/utils/parse-position";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("seek")
		.setDescription("Seek to a position in the current track")
		.addStringOption((option) =>
			option
				.setName("position")
				.setDescription(
					"Position where to seek the track to (e.g. +30s, -2m, +1h, 1:30)",
				)
				.setRequired(true),
		),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player || !isInSameVoiceChannel(interaction, player)) {
			return;
		}

		const track = player.current;

		if (!track) {
			return interaction.reply({
				content: "Nothing is currently playing.",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const position = parsePosition(
			interaction.options.getString("position", true),
			track,
		);

		if (position === null) {
			return interaction.reply({
				content: "Invalid seek position.",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const seeked = player.seek(position);

		if (!seeked) {
			return interaction.reply({
				content: "Failed to seek track.",
				flags: [MessageFlags.Ephemeral],
			});
		}

		await interaction.reply({
			embeds: [
				createInfoEmbed({
					message: `Seeked to \`${formatDuration(position)}\``,
				}),
			],
		});
	},
});
