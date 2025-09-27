import * as Sentry from "@sentry/bun";
import { type Client, Collection, type Message, REST } from "discord.js";
import { Manager, type Player, type Track } from "moonlink.js";
import { config } from "~/config";
import { createNowPlayingEmbed } from "~/embeds/now-playing";
import type { Command } from "~/interfaces/command";
import type { Listener } from "~/interfaces/listener";
import { logger } from "~/lib/logger";
import { readDir } from "~/utils/fs";

class NowPlaying {
	private cache = new Map<string, Message>();
	private client: Client<true>;

	constructor(client: Client<true>) {
		this.client = client;
	}

	public async set(player: Player, track?: Track) {
		await this.remove(player);

		const channel = this.client.channels.cache.get(player.textChannelId);

		if (!channel?.isSendable()) {
			logger.warn(
				'Cannot send now playing message, channel "%s" is not sendable',
				player.textChannelId,
			);
			return;
		}

		const message = await channel?.send({
			embeds: [createNowPlayingEmbed(track ?? player.current)],
		});

		if (message) {
			this.cache.set(player.textChannelId, message);
		}
	}

	public async remove(player: Player) {
		const message = this.cache.get(player.textChannelId);

		if (message?.deletable) {
			await message.delete();
		}

		this.cache.delete(player.textChannelId);
	}
}

export class Bot {
	public readonly client: Client<true>;
	public readonly rest: REST;
	public readonly lavalink: Manager;
	public readonly nowPlaying: NowPlaying;
	public commands = new Collection<string, Command>();

	constructor(client: Client<true>) {
		logger.info("Mode: %s | Runtime: %s", config.mode, this.runtime);

		this.client = client;
		this.nowPlaying = new NowPlaying(client);
		this.lavalink = this.createLavalink();
		this.rest = new REST().setToken(config.bot.token);

		this.attachListeners();

		logger.info("Logging in...");
		void client.login(config.bot.token);
	}

	private get runtime() {
		return `Bun v${Bun.version}`;
	}

	private createLavalink() {
		const lavalink = new Manager({
			nodes: config.lavalink.nodes,
			options: {
				clientId: config.bot.client_id,
				clientName: config.bot.name,
				defaultPlatformSearch: config.lavalink.default_search_platform,
			},
			sendPayload: (guildId: string, payload: string) => {
				const guild = this.client.guilds.cache.get(guildId);
				if (guild) {
					guild.shard.send(JSON.parse(payload));
				}
			},
		});

		lavalink.addListener("debug", (message: string) => {
			logger.debug(message);
		});

		void lavalink.init(config.bot.client_id);

		return lavalink;
	}

	private attachListeners() {
		const clientFiles = readDir("./listeners/client/**/*.ts");
		const lavalinkFiles = readDir("./listeners/lavalink/**/*.ts");
		const files = [...clientFiles, ...lavalinkFiles];

		for (const file of files) {
			// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
			const listener: Listener<any> = require(file).default;
			const type = listener.once ? "once" : "on";
			const target = clientFiles.includes(file) ? "client" : "lavalink";

			// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
			const handler = (...args: any[]) => {
				try {
					listener.execute(this, ...args);
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
				this.client[type](listener.event, handler);
			} else if (type === "on") {
				this.lavalink.on(listener.event, handler);
			}
		}
	}

	public async destroy() {
		try {
			logger.info("Gracefully shutting down...");

			this.client.user?.setStatus("invisible");

			logger.debug("Destroying client...");
			await this.client.destroy();

			for (const [guildId, player] of this.lavalink.getAllPlayers()) {
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
