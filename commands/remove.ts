import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { EmbedColor } from "~/constants/color";
import { createCommand } from "~/structures/command";
import { formatDuration } from "~/utils/format-duration";
import { getExistingPlayer } from "~/utils/get-existing-player";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("remove")
		.setDescription("Remove track from queue")
		.addNumberOption((option) =>
			option
				.setName("position")
				.setDescription("Position of track to remove")
				.setRequired(true),
		),

	async execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		if (!player.queue.size) {
			await interaction.reply({
				content: "Queue is empty",
				flags: [MessageFlags.Ephemeral],
			});

			return;
		}

		const position = interaction.options.getNumber("position", true);
		const track = player.queue.tracks[position - 1];

		await player.queue.remove(position);

		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Primary)
			.setAuthor({ name: "Removed from queue" })
			.setTitle(track.title)
			.addFields({
				name: "Requested by",
				value: `${track.requestedBy}`,
				inline: true,
			});

		if (track.url) {
			embed.setURL(track.url);
		}

		if (track.artworkUrl) {
			embed.setThumbnail(track.artworkUrl);
		}

		if (track.duration) {
			embed.addFields({
				name: "Duration",
				value: `\`${formatDuration(track.duration)}\``,
				inline: true,
			});
		}

		embed.addFields({
			name: "Position",
			value: `\`${position}\``,
			inline: true,
		});

		await interaction.reply({
			embeds: [embed],
		});
	},
});
