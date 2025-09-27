import { EmbedBuilder } from "discord.js";
import type { Track } from "moonlink.js";
import { EmbedColor } from "~/constants/color";
import { requestorMention } from "~/helpers/mention";
import { formatDuration } from "~/utils/format";

export function createNowPlayingEmbed(track: Track) {
	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Success)
		.setAuthor({ name: "Now playing" })
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
					? ":red_circle: LIVE"
					: `\`${formatDuration(track.duration)}\``,
				inline: true,
			},
		);

	if (track.requestedBy) {
		embed.spliceFields(2, 0, {
			name: "Requested by",
			value: requestorMention(track.requestedBy),
			inline: true,
		});
	}

	if (track.url) {
		embed.setURL(track.url);
	}

	if (track.artworkUrl) {
		embed.setImage(track.artworkUrl);
	}

	return embed;
}
