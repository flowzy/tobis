import { createListener } from "~/factories/create-listener";

export default createListener({
	event: "trackException",

	async execute(_, player) {
		await player.skip();
	},
});
