import * as Sentry from "@sentry/bun";
import { type Client, type ClientEvents, Collection, REST } from "discord.js";
import { config } from "~/app/config";
import { Lavalink } from "~/entities/lavalink";
import { logger } from "~/lib/logger";
import type { Command } from "~/structures/command";
import type { Listener } from "~/structures/listener";
import { readDir } from "~/utils/read-dir";

export class Bot {
	public readonly rest: REST;
	public readonly client: Client<true>;
	public readonly lavalink: Lavalink;
	public readonly commands = new Collection<string, Command>();

	constructor(client: Client<true>) {
		logger.info("Mode: %s | Runtime: %s", config.mode, `Bun v${Bun.version}`);

		this.client = client;
		this.addListeners();

		this.lavalink = new Lavalink(this, client);
		this.rest = new REST().setToken(config.bot.token);

		logger.info("Logging in...");
		void client.login(config.bot.token);
	}

	private addListeners() {
		const files = readDir("../listeners/client/*.ts");

		for (const file of files) {
			const listener = require(file).default as Listener;
			const event = listener.event as keyof ClientEvents;
			const execute = (...args: ClientEvents[typeof event]) => {
				try {
					listener.execute(this, ...args);
				} catch (e) {
					Sentry.captureException(e, {
						extra: {
							event: listener.event,
							type: "client",
						},
					});
				}
			};

			logger.debug('Registering client listener for event "%s"', event);

			if (listener.once) {
				this.client.once(event, execute);
			} else {
				this.client.on(event, execute);
			}
		}

		logger.debug("Registered %d client listeners", files.length);
	}

	public async destroy() {
		try {
			logger.info("Gracefully shutting down...");

			this.client.user?.setStatus("invisible");

			logger.debug("Destroying client...");
			await this.client.destroy();

			for (const [guildId, player] of this.lavalink.manager.getAllPlayers()) {
				logger.debug("Destroying player for guild %s...", guildId);
				player.destroy("shutdown");
			}

			logger.info("Goodbye!");
			process.exit(0);
		} catch (e) {
			Sentry.captureException(e);
			logger.error("Failed to gracefully shut down.", e);
			process.exit(1);
		}
	}
}
