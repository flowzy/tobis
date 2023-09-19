import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';
import { createInfoMessage } from '~/messages/info';

export default class StopCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Disconnect from the voice channel and clear queue');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = bot.lavalink.players.get(interaction.guild.id);

		if (!player) {
			return interaction.reply(
				createInfoMessage({
					message: 'I am not connected to a voice channel.',
					ephemeral: true,
				}),
			);
		}

		player.destroy(true);
	}
}
