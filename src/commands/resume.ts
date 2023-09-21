import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class ResumeCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resumes the current track');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.pause(false);

		interaction.reply({
			content: 'Resumed.',
			ephemeral: true,
		});
	}
}
