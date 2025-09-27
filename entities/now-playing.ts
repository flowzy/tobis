import { type Client, EmbedBuilder, type Message } from "discord.js";
import type { Player, Track } from "moonlink.js";
import { EmbedColor } from "~/constants/color";
import { logger } from "~/lib/logger";
import { formatDuration } from "~/utils/format-duration";
import { requestorMention } from "~/utils/mention";

export class NowPlaying {
	private cache = new Map<string, Message>();
	private client: Client<true>;

	constructor(client: Client<true>) {
		this.client = client;
	}

	public async set(player: Player, track: Track) {
		await this.remove(player);

		const channel = this.client.channels.cache.get(player.textChannelId);

		if (!channel?.isSendable()) {
			logger.warn(
				'Cannot send now playing message, channel "%s" is not sendable',
				player.textChannelId,
			);
			return;
		}

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

		const message = await channel?.send({
			embeds: [embed],
		});

		if (message) {
			this.cache.set(player.textChannelId, message);
		}
	}

	public async remove(player: Player) {
		const message = this.cache.get(player.textChannelId);

		if (message?.deletable) {
			await message.delete();
		}

		this.cache.delete(player.textChannelId);
	}
}
