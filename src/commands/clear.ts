import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { isInVoiceChannel } from '~/helpers/interaction';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class ClearCommand implements Command {
	public data = new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear queue');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.queue.clear();

		interaction.reply({
			content: 'Queue cleared.',
		});
	}
}
