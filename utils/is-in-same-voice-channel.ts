import {
	type ChatInputCommandInteraction,
	MessageFlags,
	type VoiceBasedChannel,
} from "discord.js";
import type { Player } from "moonlink.js";
import { isInVoiceChannel } from "~/utils/is-in-voice-channel";

/**
 * Checks whether the user is in the same voice channel as the bot.
 * If not, replies with an error message.
 *
 * @param interaction
 * @param player
 */
export function isInSameVoiceChannel(
	interaction: ChatInputCommandInteraction<"cached">,
	player: Player | undefined,
): interaction is ChatInputCommandInteraction<"cached"> & {
	member: { voice: { channel: VoiceBasedChannel } };
} {
	if (!isInVoiceChannel(interaction)) {
		return false;
	}

	if (
		!player ||
		player.voiceChannelId === interaction.member.voice.channel?.id
	) {
		return true;
	}

	if (interaction.deferred) {
		void interaction.editReply({
			content: `You must be in the same voice channel as me - <#${player.voiceChannelId}>`,
		});
	} else if (interaction.isRepliable()) {
		void interaction.reply({
			content: `You must be in the same voice channel as me - <#${player.voiceChannelId}>`,
			flags: [MessageFlags.Ephemeral],
		});
	}

	return false;
}
