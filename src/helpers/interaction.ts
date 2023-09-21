import { ChatInputCommandInteraction, VoiceBasedChannel } from 'discord.js';
import { Player } from 'magmastream';

/**
 * Checks whether the user is in a voice channel.
 * If not, replies with an error message.
 * @param interaction
 */
export function isInVoiceChannel(
	interaction: ChatInputCommandInteraction<'cached'>,
): interaction is ChatInputCommandInteraction<'cached'> & {
	member: { voice: { channel: VoiceBasedChannel } };
} {
	const isInVoiceChannel = Boolean(interaction.member.voice.channel?.id);

	if (!isInVoiceChannel) {
		interaction.reply({
			content: 'You must be in a voice channel to use this command',
			ephemeral: true,
		});
	}

	return isInVoiceChannel;
}

/**
 * Checks whether the user is in the same voice channel as the bot.
 * If not, replies with an error message.
 *
 * @param interaction
 * @param player
 */
export function isInSameVoiceChannel(
	interaction: ChatInputCommandInteraction<'cached'>,
	player: Player,
): interaction is ChatInputCommandInteraction<'cached'> & {
	member: { voice: { channel: VoiceBasedChannel } };
} {
	const isInSameVoiceChannel =
		player.voiceChannel === interaction.member.voice.channel?.id;

	if (!isInSameVoiceChannel) {
		interaction.reply({
			content: `You must be in the same voice channel as me - <#${player.voiceChannel}>`,
			ephemeral: true,
		});
	}

	return isInSameVoiceChannel;
}
