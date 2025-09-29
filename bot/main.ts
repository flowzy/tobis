import * as Sentry from "@sentry/bun";
import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { config } from "~/bot/config";
import { Bot } from "~/entities/bot";

Sentry.init({
	enabled: Boolean(config.logging.sentry.dsn && config.logging.sentry.enabled),
	dsn: config.logging.sentry.dsn,
	tracesSampleRate: 1,
	environment: config.mode,
});

const bot = new Bot(
	new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
		presence: {
			activities: [{ name: "Music", type: ActivityType.Listening }],
		},
	}),
);

const destroy = () => bot.destroy();

process.on("SIGINT", destroy);
process.on("SIGTERM", destroy);
