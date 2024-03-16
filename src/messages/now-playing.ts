import { EmbedBuilder, type MessageCreateOptions } from "discord.js";
import type { Track } from "magmastream";
import { EMBED_COLOR_ACTIVE } from "~/config/color";
import { formatDuration } from "~/utils/format";

export function createNowPlayingMessage(track: Track): MessageCreateOptions {
	return {
		embeds: [
			new EmbedBuilder()
				.setColor(EMBED_COLOR_ACTIVE)
				.setAuthor({ name: "Now playing" })
				.setTitle(track.title)
				.setURL(track.uri)
				.setImage(track.artworkUrl)
				.addFields(
					{
						name: track.isStream ? "Streamer" : "Uploaded",
						value: track.author,
						inline: true,
					},
					{
						name: "Duration",
						value: track.isStream
							? ":red_circle: LIVE"
							: `\`${formatDuration(track.duration)}\``,
						inline: true,
					},
					{
						name: "Requested by",
						value: `${track.requester}`,
						inline: true,
					},
				),
		],
	};
}
