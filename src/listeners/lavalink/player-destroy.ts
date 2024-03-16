import { createListener } from "~/factories/listener";

export default createListener({
	event: "playerDestroy",

	execute(bot, player) {
		bot.logger.debug("Player destroyed for %s", player.guild);

		player.nowPlayingMessage?.delete();
	},
});
