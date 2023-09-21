import { SlashCommandBuilder } from 'discord.js';
import { createCommand } from '~/factories/command';
import { isInSameVoiceChannel, isInVoiceChannel } from '~/helpers/interaction';
import { getExistingPlayer } from '~/helpers/player';

export default createCommand({
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current track'),

	execute(bot, interaction) {
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
	},
});
