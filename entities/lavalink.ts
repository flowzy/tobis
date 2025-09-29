import * as Sentry from "@sentry/bun";
import type { Client } from "discord.js";
import { type IEvents, Manager } from "moonlink.js";
import { config } from "~/bot/config";
import type { Bot } from "~/entities/bot";
import { NowPlaying } from "~/entities/now-playing";
import type { Listener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";
import { readDir } from "~/utils/read-dir";

export class Lavalink {
	private readonly bot: Bot;
	public readonly manager: Manager;
	public readonly nowPlaying: NowPlaying;

	constructor(bot: Bot, client: Client<true>) {
		this.bot = bot;
		this.manager = new Manager({
			nodes: config.lavalink.nodes,
			options: {
				clientId: config.bot.client_id,
				clientName: config.bot.name,
				defaultPlatformSearch: config.lavalink.default_search_platform,
			},
			sendPayload: (guildId: string, payload: string) => {
				const guild = client.guilds.cache.get(guildId);
				if (guild) {
					guild.shard.send(JSON.parse(payload));
				}
			},
		});

		this.addListeners();

		void this.manager.init(config.bot.client_id);

		this.nowPlaying = new NowPlaying(client);
	}

	private addListeners() {
		const files = readDir("./listeners/lavalink/*.ts");

		for (const file of files) {
			const listener = require(file).default as Listener;
			const event = listener.event as keyof IEvents;
			const execute = (...args: Parameters<IEvents[typeof event]>) => {
				try {
					listener.execute(this.bot, ...args);
				} catch (e) {
					Sentry.captureException(e, {
						extra: {
							event: listener.event,
							type: "lavalink",
						},
					});
				}
			};

			logger.debug('Registering lavalink listener for event "%s"', event);

			if (listener.once) {
				this.manager.once(event, execute);
			} else {
				this.manager.on(event, execute);
			}
		}

		logger.debug("Registered %d lavalink listeners", files.length);
	}
}
