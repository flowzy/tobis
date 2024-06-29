import type { Player } from "magmastream";
import { createListener } from "~/factories/listener";

export default createListener({
	event: "playerDestroy",

	async execute(bot, player: Player) {
		bot.logger.debug("Player destroyed for %s", player.guild);

		const message = await player.nowPlayingMessage?.fetch(true);

		if (message?.deletable) {
			void message.delete();
		}
	},
});
