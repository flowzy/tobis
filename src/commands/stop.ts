import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';

export default class StopCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Disconnect from the voice channel and clear queue');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = bot.lavalink.players.get(interaction.guild.id);

		if (!player) {
			return interaction.reply({
				content: 'There is no music playing',
				ephemeral: true,
			});
		}

		player.destroy();
		player.queue.clear();

		interaction.reply('Music has been stopped');
	}
}
