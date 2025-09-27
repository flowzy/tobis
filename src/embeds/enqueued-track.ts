import { EmbedBuilder } from "discord.js";
import type { Queue, SearchResult } from "moonlink.js";
import { EmbedColor } from "~/constants/color";
import { formatDuration } from "~/utils/format";

export function createEnqueuedTrackEmbed(result: SearchResult, queue: Queue) {
	const track = result.getFirst();

	if (!track) {
		throw new Error("Track not found");
	}

	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Primary)
		.setAuthor({ name: "Added to queue" })
		.setTitle(track.title)
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

	if (track.url) {
		embed.setURL(track.url);
	}

	if (track.artworkUrl) {
		embed.setThumbnail(track.artworkUrl);
	}

	if (queue.size) {
		embed.addFields({
			name: "Position",
			value: `\`${queue.size}\``,
			inline: true,
		});
	}

	return embed;
}
