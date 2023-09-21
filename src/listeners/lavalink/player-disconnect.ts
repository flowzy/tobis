import { createListener } from '~/factories/listener';

export default createListener({
	event: 'playerDisconnect',

	execute(bot, player, oldChannel) {
		bot.logger.debug(
			'Player disconnected from %s (channel: %s)',
			player.guild,
			oldChannel,
		);

		player.destroy(true);
	},
});
