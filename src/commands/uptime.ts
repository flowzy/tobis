import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'pretty-ms';
import { EmbedColor } from '~/config/color';
import { createCommand } from '~/factories/command';

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Get uptime of the bot'),

	async execute(bot, interaction) {
		interaction.reply({
			ephemeral: true,
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Success)
					.setAuthor({ name: 'Uptime' })
					.setDescription(`Bot has been up for \`${ms(bot.client.uptime)}\``),
			],
		});
	},
});
