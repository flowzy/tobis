import type { Player, Track } from "moonlink.js";
import { createListener } from "~/factories/listener";

export default createListener({
	event: "trackStart",

	async execute(bot, player: Player, track: Track) {
		await bot.nowPlaying.set(player, track);
	},
});
