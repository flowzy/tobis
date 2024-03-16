import { createListener } from "~/factories/listener";

export default createListener({
	event: "playerDestroy",

	execute(bot, player) {
		bot.logger.debug("Player destroyed for %s", player.guild);

		if (player.nowPlayingMessage && !player.nowPlayingMessage.deleted) {
			player.nowPlayingMessage.delete();
		}
	},
});
