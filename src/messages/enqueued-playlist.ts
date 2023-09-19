import { EmbedBuilder } from 'discord.js';
import { PlaylistData, Queue } from 'magmastream';
import { EmbedColor } from '~/config/color';
import { formatDuration } from '~/utils/format';

export function createEnqueuedPlaylistEmbed(
	playlist: PlaylistData,
	query: string,
	queue: Queue,
) {
	const firstTrack = playlist.tracks.at(0)!;

	return new EmbedBuilder()
		.setColor(EmbedColor.Success)
		.setAuthor({ name: 'Added to queue' })
		.setTitle(playlist.name)
		.setURL(query)
		.setThumbnail(firstTrack.displayThumbnail('mqdefault'))
		.addFields(
			{ name: 'Tracks', value: `\`${playlist.tracks.length}\``, inline: true },
			{
				name: 'Duration',
				value: `\`${formatDuration(playlist.duration)}\``,
				inline: true,
			},
			{
				name: 'Position',
				value: `\`${queue.size - playlist.tracks.length + 1}\``,
				inline: true,
			},
		);
}
