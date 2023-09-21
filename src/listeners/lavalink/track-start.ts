import { TextBasedChannelFields } from 'discord.js';
import { createListener } from '~/factories/listener';
import { createNowPlayingMessage } from '~/messages/now-playing';

export default createListener({
	event: 'trackStart',

	async execute(bot, player, track) {
		clearTimeout(player.timeout);

		bot.logger.debug('Started playing in %s', player.guild);

		if (!player.textChannel) return;

		const channel = bot.client.channels.cache.get(player.textChannel) as
			| TextBasedChannelFields<true>
			| undefined;

		const message = await channel?.send(createNowPlayingMessage(track));

		if (message) {
			player.setNowPlayingMessage(message);
		}
	},
});
