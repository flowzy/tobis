import {
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js';
import {
	Player,
	PlaylistData,
	SearchPlatform,
	SearchResult,
	Track,
} from 'magmastream';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';
import { formatDuration } from '~/utils/formatting';

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
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Red)
						.setAuthor({
							name: 'Play',
							iconURL:
								'https://cdn.darrennathanael.com/icons/spinning_disk.gif',
						})
						.setDescription('An error occurred while searching'),
				],
			});
		}

		if (result.loadType === 'empty') {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setAuthor({ name: 'Play' })
						.setDescription('No results found'),
				],
			});
		}

		if (result.loadType === 'search') {
			return this.displaySelect(interaction, result);
		}

		let embed = new EmbedBuilder()
			.setColor(Colors.Blurple)
			.setAuthor({ name: 'Added to queue' });

		switch (result.loadType) {
			case 'track':
				const track = result.tracks.at(0)!;
				player.queue.add(track);
				embed = this.getTrackEmbed(embed, track);
				break;

			case 'playlist':
				const playlist = result.playlist!;
				player.queue.add(playlist.tracks);
				embed = this.getPlaylistEmbed(embed, playlist);
				break;
		}

		player.connect();

		if (!player.playing && !player.paused && !player.queue.size) {
			player.play();
		}

		interaction.editReply({
			embeds: [embed],
		});
	}

	displaySelect(
		interaction: ChatInputCommandInteraction,
		result: SearchResult,
	) {
		return interaction.reply(
			'Search is not implemented yet. Enter a URL instead.',
		);
	}

	getTrackEmbed(embed: EmbedBuilder, track: Track) {
		return embed
			.setTitle(track.title)
			.setURL(track.uri)
			.setThumbnail(track.thumbnail)
			.addFields(
				{ name: 'Uploaded', value: track.author, inline: true },
				{
					name: 'Duration',
					value: track.isStream
						? '🔴 LIVE'
						: `\`${formatDuration(track.duration)}\``,
					inline: true,
				},
				{ name: 'Requested by', value: `${track.requester}`, inline: true },
			);
	}

	getPlaylistEmbed(embed: EmbedBuilder, playlist: PlaylistData) {
		const firstTrack = playlist.tracks.at(0)!;

		return embed
			.setTitle(playlist.name)
			.addFields([
				{
					name: 'Tracks',
					value: `\`${playlist.tracks.length}\``,
					inline: true,
				},
				{
					name: 'Duration',
					value: `\`${formatDuration(playlist.duration)}\``,
					inline: true,
				},
				{
					name: 'Requested by',
					value: `${firstTrack.requester}`,
					inline: true,
				},
			])
			.setThumbnail(firstTrack.thumbnail);
	}
}
