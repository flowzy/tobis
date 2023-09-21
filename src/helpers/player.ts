import * as Sentry from '@sentry/bun';
import { ChatInputCommandInteraction } from 'discord.js';
import { Player } from 'magmastream';
import { Bot } from '~/interfaces/bot';
import { env } from '~/env';
import { isInSameVoiceChannel, isInVoiceChannel } from './interaction';

/**
 * Finds an existing player for the guild.
 * If no player is found, replies with informative messages.
 *
 * @param bot
 * @param interaction
 */
export function getExistingPlayer(
	bot: Bot,
	interaction: ChatInputCommandInteraction<'cached'>,
) {
	const player = bot.lavalink.players.get(interaction.guild.id);

	if (!player) {
		interaction.reply({
			content: 'I am not connected to a voice channel',
			ephemeral: true,
		});

		return;
	}

	if (
		player.playing &&
		player.voiceChannel !== interaction.member.voice.channel?.id
	) {
		interaction.reply({
			content: `You must be in the same voice channel as me - <#${player.voiceChannel}>`,
			ephemeral: true,
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
	interaction: ChatInputCommandInteraction<'cached'>,
) {
	if (!isInVoiceChannel(interaction)) {
		return;
	}

	let player: Player;

	try {
		player = bot.lavalink.create({
			guild: interaction.guild.id,
			voiceChannel: interaction.member.voice.channel.id,
			textChannel: interaction.channelId,
			selfDeafen: env.BOT_VOICE_SELF_DEAFEN,
			volume: env.BOT_VOICE_VOLUME,
		});
	} catch (e) {
		Sentry.captureException(e, {
			extra: {
				command: 'play',
			},
		});

		bot.logger.error(e);

		interaction.reply({
			content: 'Music player is not ready yet. Try again later.',
			ephemeral: true,
		});

		return;
	}

	if (!isInSameVoiceChannel(interaction, player)) {
		return;
	}

	return player;
}

/**
 * Join voice channel and start playing if not already playing.
 *
 * @param player
 */
export async function startPlaying(player: Player) {
	player.connect();

	if (!player.playing && !player.paused && player.queue.totalSize) {
		return player.play();
	}
}
