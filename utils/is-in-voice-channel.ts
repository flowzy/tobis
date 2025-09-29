import {
	type ChatInputCommandInteraction,
	MessageFlags,
	type VoiceBasedChannel,
} from "discord.js";

/**
 * Checks whether the user is in a voice channel.
 * If not, replies with an error message.
 * @param interaction
 */
export function isInVoiceChannel(
	interaction: ChatInputCommandInteraction<"cached">,
): interaction is ChatInputCommandInteraction<"cached"> & {
	member: { voice: { channel: VoiceBasedChannel } };
} {
	if (interaction.member.voice.channel?.id) {
		return true;
	}

	if (interaction.deferred) {
		void interaction.editReply({
			content: "You must be in a voice channel to use this command",
		});
	} else if (interaction.isRepliable()) {
		void interaction.reply({
			content: "You must be in a voice channel to use this command",
			flags: [MessageFlags.Ephemeral],
		});
	}

	return false;
}
