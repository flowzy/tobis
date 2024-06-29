import * as Sentry from "@sentry/bun";
import {
	type APIApplicationCommand,
	type Client,
	Collection,
	REST,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import { env } from "~/env";
import type { Bot } from "~/interfaces/bot";
import type { Command } from "~/interfaces/command";
import type { Listener } from "~/interfaces/listener";
import { createLavalink } from "~/lib/lavalink";
import { logger } from "~/lib/logger";
import { createCache, isCached } from "~/utils/cache";
import { readDir } from "~/utils/fs";

const rest = new REST().setToken(env.BOT_TOKEN);

export async function createBot(client: Client<true>) {
	logger.info("Environment: %s | Runtime: Bun v%s", env.NODE_ENV, Bun.version);

	const commands = await registerCommands();
	const lavalink = createLavalink(client);
	const bot: Bot = {
		client,
		lavalink,
		commands,
		logger,
	};

	await attachListeners(bot);

	logger.info("Logging in...");
	void bot.client.login(env.BOT_TOKEN);

	return () => cleanup(bot);
}

async function cleanup(bot: Bot) {
	logger.info("Gracefully shutting down...");

	bot.client.user?.setStatus("invisible");

	logger.debug("Destroying lavalink connection...");
	for (const [, node] of bot.lavalink.nodes) {
		if (node.options.identifier) {
			bot.lavalink.destroyNode(node.options.identifier);
		}
	}

	logger.debug("Destroying %d players...", bot.lavalink.players.size);
	await Promise.allSettled(
		bot.lavalink.players.map(async (player) => {
			await player.nowPlayingMessage?.delete();
			player.destroy(true);
		}),
	);

	logger.debug("Destroying client...");
	await bot.client.destroy();

	logger.info("Goodbye!");
}

async function attachListeners(bot: Bot) {
	const clientFiles = await readDir("./listeners/client/**/*.ts");
	const lavalinkFiles = await readDir("./listeners/lavalink/**/*.ts");
	const files = [...clientFiles, ...lavalinkFiles];

	for (const file of files) {
		// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
		const listener: Listener<any> = require(file).default;
		const type = listener.once ? "once" : "on";
		const target = clientFiles.includes(file) ? "client" : "lavalink";

		// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
		const handler = (...args: any[]) => {
			try {
				listener.execute(bot, ...args);
			} catch (e) {
				Sentry.captureException(e, {
					extra: {
						event: listener.event,
						target,
						type,
					},
				});
			}
		};

		if (target === "client") {
			bot.client[type](listener.event, handler);
		} else if (type === "on") {
			bot.lavalink.on(listener.event, handler);
		}
	}
}

async function registerCommands() {
	const CACHE_FILENAME = "registered-commands.json";
	const files = await readDir("./commands/**/*.ts");

	const commands = new Collection<string, Command>();
	const cache: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	for (const file of files) {
		const command: Command = require(file).default;

		commands.set(command.data.name, command);
		cache.push(command.data.toJSON());
	}

	const isUpToDate = await isCached(CACHE_FILENAME, cache);

	if (isUpToDate) {
		logger.info("Commands are up to date.");
		return commands;
	}

	try {
		logger.info("Registering %d commands...", cache.length);

		const data = (await rest.put(
			Routes.applicationCommands(env.BOT_CLIENT_ID),
			{
				body: cache,
			},
		)) as APIApplicationCommand[];

		if (cache.length === data.length) {
			logger.info("Commands successfully registered!");
			createCache(CACHE_FILENAME, cache);
		} else {
			logger.warn(
				"%d commands possibly failed to register.",
				cache.length - data.length,
			);
		}
	} catch (e) {
		Sentry.captureException(e);
		logger.error("Commands failed to register: %v", e);
	}

	return commands;
}
