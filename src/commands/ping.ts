import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { EmbedColor } from '~/config/color';
import { createCommand } from '~/factories/command';

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Measure latency'),

	async execute(bot, interaction) {
		const sent = await interaction.reply({
			content: 'Pinging... ',
			fetchReply: true,
			ephemeral: true,
		});

		interaction.editReply({
			content: null,
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Success)
					.setAuthor({ name: 'Pong!' })
					.addFields(
						{
							name: 'Heartbeat',
							value: `\`${Math.max(0, bot.client.ws.ping)} ms\``,
							inline: true,
						},
						{
							name: 'Roundtrip Latency',
							value: `\`${
								sent.createdTimestamp - interaction.createdTimestamp
							} ms\``,
							inline: true,
						},
					),
			],
		});
	},
});
