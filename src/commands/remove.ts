import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/bot';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class QueueCommand implements Command {
	public data = new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove track from queue')
		.addNumberOption((option) =>
			option
				.setName('position')
				.setDescription('Position of track to remove')
				.setRequired(true),
		);

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		if (!player.queue.size) {
			interaction.reply({
				content: 'Queue is empty',
				ephemeral: true,
			});

			return;
		}

		const position = interaction.options.getNumber('position', true);

		const track = player.queue.at(position);

		if (!track) {
			interaction.reply({
				content: `No track found at position ${position}`,
				ephemeral: true,
			});

			return;
		}

		player.queue.remove(position);

		interaction.reply({
			content: `Removed ${track.title} from queue (requested by ${track.requester})`,
		});
	}
}
