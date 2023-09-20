import * as Sentry from '@sentry/node';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js';
import { Player, SearchPlatform } from 'magmastream';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';
import { createEnqueuedPlaylistEmbed } from '~/messages/enqueued-playlist';
import { createEnqueuedTrackEmbed } from '~/messages/enqueued-track';
import { createErrorMessage } from '~/messages/error';
import { createInfoMessage } from '~/messages/info';

export default class PlayCommand implements Command {
	data = new SlashCommandBuilder()
		.setName('play')
		.setDescription('Enqueue a track to play')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('Search for a track or paste in a URL')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('source')
				.setDescription('Where to search track')
				.addChoices(
					{ name: 'YouTube', value: 'youtube' as SearchPlatform },
					{ name: 'YouTube Music', value: 'youtube music' as SearchPlatform },
					{ name: 'Soundcloud', value: 'soundcloud' as SearchPlatform },
					{ name: 'Deezer', value: 'deezer' as SearchPlatform },
				),
		);

	permissions = [
		PermissionsBitField.Flags.Connect,
		PermissionsBitField.Flags.Speak,
	];

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
				guild: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channelId,
				volume: 50,
				selfDeafen: true,
			});
		} catch (e) {
			Sentry.captureException(e, {
				tags: {
					command: 'play',
				},
			});

			bot.logger.error(e);

			return interaction.reply({
				content: 'Music player is not ready yet. Try again later.',
				ephemeral: true,
			});
		}

		if (player.voiceChannel !== interaction.member.voice.channel.id) {
			return interaction.reply({
				content: `You must be in the same voice channel as me - <#${player.voiceChannel}>`,
				ephemeral: true,
			});
		}

		if (!interaction.deferred) {
			await interaction.deferReply();
		}

		const query = interaction.options.getString('query', true);
		const source = interaction.options.getString('source') ?? undefined;

		const result = await bot.lavalink.search(
			{
				query,
				source,
			},
			interaction.member,
		);

		if (result.loadType === 'error') {
			Sentry.captureException(result, {
				tags: {
					command: 'play',
				},
				extra: {
					query,
					source,
				},
			});

			bot.logger.debug('Result failed to load:', result);

			return interaction.editReply(
				createErrorMessage({
					message: 'Something went wrong... Please try again later',
				}),
			);
		}

		if (result.loadType === 'empty') {
			return interaction.editReply(
				createInfoMessage({
					title: 'No results found',
					message: 'Try a different search term or URL',
				}),
			);
		}

		let embed: EmbedBuilder;

		switch (result.loadType) {
			case 'search':
			case 'track':
				const track = result.tracks.at(0)!;
				player.queue.add(track);
				embed = createEnqueuedTrackEmbed(track, player.queue);
				break;

			case 'playlist':
				const playlist = result.playlist!;
				player.queue.add(playlist.tracks);
				embed = createEnqueuedPlaylistEmbed(playlist, query, player.queue);
				break;
		}

		player.connect();
		if (!player.playing && !player.paused && player.queue.totalSize) {
			player.play();
		}

		return interaction.editReply({
			embeds: [embed],
		});
	}
}
