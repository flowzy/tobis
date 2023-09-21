import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'pretty-ms';
import { EmbedColor } from '~/config/color';
import { createCommand } from '~/factories/command';
import { getExistingPlayer } from '~/helpers/player';
import { formatDuration } from '~/utils/format';

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Get current queue'),

	execute(bot, interaction) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		if (!player.queue.size) {
			interaction.reply({
				content: 'Queue is empty',
				ephemeral: true,
			});

			return;
		}

		const queue: string[] = [];

		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Info)
			.setAuthor({ name: 'Queue' });

		for (const [index, track] of player.queue.entries()) {
			const row = [
				`${index + 1}.`,
				track.uri ? `[${track.title}](${track.uri})` : track.title,
				track.duration ? `(${formatDuration(track.duration)}) ` : '',
				`\t${track.requester}`,
			];

			queue.push(row.join(' '));
		}

		embed.setDescription(queue.join('\n')).setFooter({
			text: `${player.queue.size} tracks in queue · ${ms(
				player.queue.duration - (player.queue.current?.duration ?? 0),
			)} total length`,
		});

		interaction.reply({
			ephemeral: true,
			embeds: [embed],
		});
	},
});
