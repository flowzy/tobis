import { createListener } from "~/structures/listener";

export default createListener({
	event: "raw",

	execute(bot, packet) {
		void bot.lavalink.manager.packetUpdate(packet);
	},
});
