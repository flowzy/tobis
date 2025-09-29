import { createBotConfig } from "~/factories/create-bot-config";

export const config = createBotConfig({
	mode: "production",

	bot: {
		name: "MyBot",
		token: "",
		client_id: "",
		owner_id: "",
	},

	voice: {
		idle_auto_disconnect: true,
		idle_disconnect_seconds: 300,
		volume: 100,
		self_deafen: true,
	},

	lavalink: {
		default_search_platform: "ytmsearch",
		nodes: [
			{
				host: "lavalink",
				password: "youshallnotpass",
				port: 2333,
				secure: false,
				identifier: "default",
			},
		],
	},

	logging: {
		level: "debug",

		sentry: {
			enabled: false,
			dsn: "",
		},
	},
});
