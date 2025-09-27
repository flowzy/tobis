import { createListener } from "~/structures/listener";

export default createListener({
	event: "playerDisconnected",

	async execute(bot, player) {
		await bot.lavalink.nowPlaying.remove(player);
	},
});
