import { EmbedBuilder } from 'discord.js';
import { Queue, Track } from 'magmastream';
import { EmbedColor } from '~/config/color';
import { formatDuration } from '~/utils/format';

export function createEnqueuedTrackEmbed(track: Track, queue: Queue) {
	return new EmbedBuilder()
		.setColor(EmbedColor.Success)
		.setAuthor({ name: 'Added to queue' })
		.setTitle(track.title)
		.setURL(track.uri)
		.setThumbnail(track.displayThumbnail('mqdefault'))
		.addFields(
			{
				name: track.isStream ? 'Streamer' : 'Uploaded',
				value: track.author,
				inline: true,
			},
			{
				name: 'Duration',
				value: track.isStream
					? '🔴 LIVE'
					: `\`${formatDuration(track.duration)}\``,
				inline: true,
			},
			{
				name: 'Position',
				value: `\`${queue.size + 1}\``,
				inline: true,
			},
		);
}
