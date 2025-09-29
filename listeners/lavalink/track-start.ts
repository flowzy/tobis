import { createListener } from "~/factories/create-listener";

export default createListener({
	event: "trackStart",

	async execute(bot, player, track) {
		await bot.lavalink.nowPlaying.set(player, track);
	},
});
