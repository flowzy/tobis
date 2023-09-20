import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import ms from 'pretty-ms';
import { Bot } from '~/bot';
import { EmbedColor } from '~/config/color';
import { Command } from '~/interfaces/command';

export default class UptimeCommand implements Command {
	public data = new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Get uptime of the bot');

	async execute(bot: Bot, interaction: CommandInteraction) {
		interaction.reply({
			ephemeral: true,
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Success)
					.setAuthor({ name: 'Uptime' })
					.setDescription(`Bot has been up for \`${ms(bot.client.uptime)}\``),
			],
		});
	}
}
