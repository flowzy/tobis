import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { isInSameVoiceChannel, isInVoiceChannel } from '~/helpers/interaction';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class SkipCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current track');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player || !isInSameVoiceChannel(interaction, player)) {
			return;
		}

		if (player.queue.size) {
			player.queue.previous = player.queue.current;
		}

		player.stop();

		interaction.reply('Skipped.');
	}
}
