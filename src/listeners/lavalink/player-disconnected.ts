import type { Player } from "moonlink.js";
import { createListener } from "~/factories/listener";

export default createListener({
	event: "playerDisconnected",

	async execute(bot, player: Player) {
		await bot.nowPlaying.remove(player);
	},
});
