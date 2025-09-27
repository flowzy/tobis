import { EmbedBuilder } from "discord.js";
import type { Queue, SearchResult } from "moonlink.js";
import { EmbedColor } from "~/constants/color";
import { formatDuration } from "~/utils/format";

export function createEnqueuedPlaylistEmbed(
	result: SearchResult,
	query: string,
	queue: Queue,
) {
	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Primary)
		.setAuthor({ name: "Added to queue" })
		.setTitle(result.playlistInfo.name)
		.setURL(query)
		.addFields(
			{ name: "Tracks", value: `\`${result.tracks.length}\``, inline: true },
			{
				name: "Duration",
				value: `\`${formatDuration(result.playlistInfo.duration)}\``,
				inline: true,
			},
		);

	const firstTrack = result.getFirst();

	if (firstTrack?.artworkUrl) {
		embed.setThumbnail(firstTrack.artworkUrl);
	}

	if (queue.size) {
		embed.addFields({
			name: "Position",
			value: `\`${Math.max(1, queue.size - result.tracks.length)}\``,
			inline: true,
		});
	}

	return embed;
}
