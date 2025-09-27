import { createListener } from "~/structures/listener";

export default createListener({
	event: "playerDestroy",

	async execute(bot, player) {
		await bot.lavalink.nowPlaying.remove(player);
	},
});
