import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { EMBED_COLOR_SUCCESS } from "~/config/color";
import { createCommand } from "~/factories/command";
import { getExistingPlayer } from "~/helpers/player";
import { formatDuration } from "~/utils/format";

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

	execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		if (!player.queue.size) {
			interaction.reply({
				content: "Queue is empty",
				ephemeral: true,
			});

			return;
		}

		const index = Math.min(
			player.queue.size - 1,
			Math.max(0, interaction.options.getNumber("position", true) - 1),
		);

		// biome-ignore lint/style/noNonNullAssertion: TODO: fix this
		const track = player.queue.at(index)!;

		player.queue.remove(index);

		const embed = new EmbedBuilder()
			.setColor(EMBED_COLOR_SUCCESS)
			.setAuthor({ name: "Removed from queue" })
			.setTitle(track.title)
			.setURL(track.uri ?? null)
			.setThumbnail(track.displayThumbnail?.("mqdefault") ?? null)
			.addFields({
				name: "Requested by",
				value: `${track.requester}`,
				inline: true,
			});

		if (track.duration) {
			embed.addFields({
				name: "Duration",
				value: `\`${formatDuration(track.duration)}\``,
				inline: true,
			});
		}

		embed.addFields({
			name: "Position",
			value: `\`${index + 1}\``,
			inline: true,
		});

		interaction.reply({
			embeds: [embed],
		});
	},
});
