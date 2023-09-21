import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class PauseCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current track');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.pause(true);

		interaction.reply({
			content: 'Paused.',
			ephemeral: true,
		});
	}
}
