import * as Sentry from "@sentry/bun";
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import type { Player, Track } from "moonlink.js";
import type { Bot } from "~/bot";
import { createErrorEmbed } from "~/embeds/error";
import { logger } from "~/lib/logger";
import { TimeUnit } from "~/utils/time";
import { isInSameVoiceChannel } from "./interaction";

/**
 * Finds an existing player for the guild.
 * If no player is found, replies with informative messages.
 *
 * @param bot
 * @param interaction
 */
export function getExistingPlayer(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const player = bot.lavalink.players.get(interaction.guild.id);

	if (!player) {
		void interaction.reply({
			content: "I am not connected to a voice channel",
			flags: [MessageFlags.Ephemeral],
		});

		return;
	}

	if (
		player.playing &&
		player.voiceChannelId !== interaction.member.voice.channel?.id
	) {
		void interaction.reply({
			content: `You must be in the same voice channel as me - <#${player.voiceChannelId}>`,
			flags: [MessageFlags.Ephemeral],
		});

		return;
	}

	return player;
}

/**
 * Creates a new player for the guild.
 * If the player cannot be created, replies with an error message.
 *
 * @param bot
 * @param interaction
 */
export function createPlayer(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const guildId = interaction.guild.id;

	if (!isInSameVoiceChannel(interaction, bot.lavalink.players.get(guildId))) {
		return;
	}

	try {
		const player = bot.lavalink.players.create({
			guildId,
			voiceChannelId: interaction.member.voice.channel.id,
			textChannelId: interaction.channelId,
		});

		if (player) {
			return player;
		}

		logger.warn("failed to create player for guild %s", guildId);

		if (interaction.deferred) {
			void interaction.editReply({
				embeds: [
					createErrorEmbed({
						title: "Error",
						message: "Music player is not ready yet. Try again later.",
					}),
				],
			});
		} else if (interaction.isRepliable()) {
			void interaction.reply({
				embeds: [
					createErrorEmbed({
						title: "Error",
						message: "Music player is not ready yet. Try again later.",
					}),
				],
				flags: [MessageFlags.Ephemeral],
			});
		}
	} catch (e) {
		Sentry.captureException(e);

		logger.error(e);

		if (interaction.deferred) {
			void interaction.editReply({
				content: "Music player is not ready yet. Try again later.",
			});
		} else if (interaction.isRepliable()) {
			void interaction.reply({
				content: "Music player is not ready yet. Try again later.",
				flags: [MessageFlags.Ephemeral],
			});
		}
	}
}

/**
 * Join voice channel and start playing if not already playing.
 *
 * @param player
 */
export async function startPlaying(player: Player) {
	player.connect();

	if (!player.playing && !player.paused && player.queue.size) {
		await player.play();
	}
}

/**
 * Parses a position string into milliseconds.
 * Supports formats like "+30s", "-2m", "1:30", "1h", etc.
 *
 * @param position
 * @param track
 */
export function parsePosition(position: string, track: Track): number | null {
	if (!track.isSeekable) {
		return null;
	}

	const isRelative = position.startsWith("+") || position.startsWith("-");
	const sign = position.startsWith("-") ? -1 : 1;
	const value = isRelative ? position.slice(1) : position;

	const colonParts = value.split(":").map(Number);
	let ms = 0;

	if (colonParts.length > 1) {
		// Handle colon time formats (hh:mm:ss, mm:ss)
		if (colonParts.length === 2) {
			ms = colonParts[0] * TimeUnit.Minute + colonParts[1] * TimeUnit.Second;
		} else if (colonParts.length === 3) {
			ms =
				colonParts[0] * TimeUnit.Hour +
				colonParts[1] * TimeUnit.Minute +
				colonParts[2] * TimeUnit.Second;
		}
	} else {
		// Handle simple formats (e.g. 30s, 2m, 1h)
		const match = value.match(/^(\d+)([smh]?)$/);
		if (!match) return null;

		const num = Number(match[1]);
		const unit = match[2];

		if (unit === "s") {
			ms = num * TimeUnit.Second;
		} else if (unit === "m") {
			ms = num * TimeUnit.Minute;
		} else if (unit === "h") {
			ms = num * TimeUnit.Hour;
		}
	}

	const newPosition = isRelative ? track.position + sign * ms : ms;

	return Math.min(Math.max(0, newPosition), track.duration);
}
