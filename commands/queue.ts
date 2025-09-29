import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import ms from "pretty-ms";
import { EmbedColor } from "~/constants/color";
import { createCommand } from "~/factories/create-command";
import { formatDuration } from "~/utils/format-duration";
import { getExistingPlayer } from "~/utils/get-existing-player";
import { requestorMention } from "~/utils/requestor-mention";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Get current queue"),

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

		const visibleQueue: string[] = [];

		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Info)
			.setAuthor({ name: "Queue" });

		for (const index in player.queue.tracks.slice(0, 9)) {
			const track = player.queue.tracks[index];

			const row = [
				`${index + 1}.`,
				`**${track.url ? `[${track.title}](${track.url})` : track.title}**`,
				track.duration ? `(${formatDuration(track.duration)}) ` : "",
				`\t${requestorMention(track.requestedBy)}`,
			];

			visibleQueue.push(row.join(" "));
		}

		embed.setDescription(visibleQueue.join("\n")).setFooter({
			text: `${player.queue.size} tracks in queue · about ${ms(
				player.queue.duration,
			)} total length`,
		});

		await interaction.reply({
			embeds: [embed],
			flags: [MessageFlags.Ephemeral],
		});
	},
});
