import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Player, SearchResult } from 'magmastream';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';

export default class PlayCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current track');

	async execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>) {
		if (!interaction.member.voice.channel) {
			return interaction.reply({
				content: 'You must join a voice channel to use this command.',
				ephemeral: true,
			});
		}

		let player: Player;

		try {
			player = bot.lavalink.create({
				guild: interaction.guildId,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channelId,
				volume: 100,
				selfDeafen: true,
			});
		} catch (e) {
			bot.logger.error(e);

			return interaction.reply({
				content: 'Music player is not ready yet. Try again later!',
				ephemeral: true,
			});
		}

		if (player.voiceChannel !== interaction.member.voice.channel.id) {
			return interaction.reply({
				content: `You must be in the same voice channel as me - <#${player.voiceChannel}>`,
				ephemeral: true,
			});
		}

		if (player.queue.size) {
			player.queue.previous = player.queue.current;
		}

		player.stop();

		return interaction.reply('Skipped.');
	}

	displaySelect(
		interaction: ChatInputCommandInteraction,
		result: SearchResult,
	) {
		return interaction.reply(
			'Search is not implemented yet. Enter a URL instead.',
		);
	}
}
