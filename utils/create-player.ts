import * as Sentry from "@sentry/bun";
import { type ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { createErrorEmbed } from "~/embeds/error";
import type { Bot } from "~/entities/bot";
import { logger } from "~/lib/logger";
import { isInSameVoiceChannel } from "~/utils/is-in-voice-channel";

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

	if (
		!isInSameVoiceChannel(
			interaction,
			bot.lavalink.manager.players.get(guildId),
		)
	) {
		return;
	}

	try {
		const player = bot.lavalink.manager.players.create({
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
