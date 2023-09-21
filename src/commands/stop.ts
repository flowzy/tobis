import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Bot } from '~/bot';
import { EmbedColor } from '~/config/color';
import { isInVoiceChannel } from '~/helpers/interaction';
import { getExistingPlayer } from '~/helpers/player';
import { Command } from '~/interfaces/command';

export default class StopCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing and clear queue');

	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		if (!isInVoiceChannel(interaction)) {
			return;
		}

		const player = getExistingPlayer(bot, interaction);

		if (!player) {
			return;
		}

		const queueSize = player.queue.totalSize;

		player.destroy(true);

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Info)
					.setDescription(
						`Disconnected from <#${interaction.member.voice.channel?.id}>`,
					)
					.setFooter({ text: `Skipped ${queueSize} tracks` }),
			],
		});
	}
}
