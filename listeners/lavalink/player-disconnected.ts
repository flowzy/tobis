import { createListener } from "~/factories/create-listener";

export default createListener({
	event: "playerDisconnected",

	async execute(bot, player) {
		await bot.lavalink.nowPlaying.remove(player);
	},
});
