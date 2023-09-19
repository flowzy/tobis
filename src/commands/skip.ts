import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SearchResult } from 'magmastream';
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

		const player = bot.lavalink.players.get(interaction.guildId);

		if (!player) {
			return interaction.reply({
				content: 'I am not in a voice channel.',
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
