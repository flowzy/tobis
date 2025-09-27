import {
	type ChatInputCommandInteraction,
	channelMention,
	MessageFlags,
} from "discord.js";
import type { Bot } from "~/app/bot";

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
	const player = bot.lavalink.manager.players.get(interaction.guild.id);

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
			content: `You must be in the same voice channel as me. Join ${channelMention(player.voiceChannelId)}`,
			flags: [MessageFlags.Ephemeral],
		});

		return;
	}

	return player;
}
