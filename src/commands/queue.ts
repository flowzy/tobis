import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Bot } from '~/bot';
import { EmbedColor } from '~/config/color';
import { Command } from '~/interfaces/command';
import { formatDuration } from '~/utils/format';

export default class QueueCommand implements Command {
	public data = new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Get current queue');

	async execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = bot.lavalink.players.get(interaction.guild.id);

		if (!player || !player.queue.totalSize) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setColor(EmbedColor.Info)
						.setAuthor({ name: 'Queue' })
						.setDescription('There is nothing playing right now'),
				],
			});
		}

		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Info)
			.setAuthor({ name: 'Queue' })
			.setDescription(
				player.queue
					.map((track, index) => {
						return [
							`${index + 1}.`,
							`[${track.title}](${track.uri})`,
							track.duration ? `(${formatDuration(track.duration)})` : '',
						].join(' ');
					})
					.join('\n'),
			)
			.setFooter({ text: `${player.queue.totalSize} tracks in queue` });

		await interaction.reply({
			ephemeral: true,
			embeds: [embed],
		});
	}
}
