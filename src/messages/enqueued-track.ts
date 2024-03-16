import { EmbedBuilder } from "discord.js";
import type { Queue, Track } from "magmastream";
import { EMBED_COLOR_SUCCESS } from "~/config/color";
import { formatDuration } from "~/utils/format";

export function createEnqueuedTrackEmbed(track: Track, queue: Queue) {
	const embed = new EmbedBuilder()
		.setColor(EMBED_COLOR_SUCCESS)
		.setAuthor({ name: "Added to queue" })
		.setTitle(track.title)
		.setURL(track.uri)
		.setThumbnail(track.displayThumbnail("mqdefault"))
		.addFields(
			{
				name: track.isStream ? "Streamer" : "Uploaded",
				value: track.author,
				inline: true,
			},
			{
				name: "Duration",
				value: track.isStream
					? "🔴 LIVE"
					: `\`${formatDuration(track.duration)}\``,
				inline: true,
			},
		);

	if (queue.size) {
		embed.addFields({
			name: "Position",
			value: `\`${queue.size}\``,
			inline: true,
		});
	}

	return embed;
}
