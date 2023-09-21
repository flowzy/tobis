import * as Sentry from '@sentry/bun';
import {
	APIApplicationCommand,
	Client,
	Collection,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
	TextBasedChannelFields,
} from 'discord.js';
import { Manager } from 'magmastream';
import { env } from '~/env';
import { Command } from '~/interfaces/command';
import { Handler } from '~/interfaces/handler';
import { createLavalink } from '~/lib/lavalink';
import { logger } from '~/lib/logger';
import { createNowPlayingMessage } from '~/messages/now-playing';
import { createQueueEndedEmbed } from '~/messages/queue-ended';
import { createCache, isCached } from '~/utils/cache';
import { readDir } from '~/utils/fs';

export class Bot {
	public commands = new Collection<string, Command>();
	public rest = new REST().setToken(env.BOT_TOKEN);
	public lavalink: Manager;
	public logger = logger;

	constructor(public readonly client: Client<true>) {
		this.logger.info(
			'Launching in %s mode... (Bun v%s)',
			env.NODE_ENV,
			Bun.version,
		);
		this.lavalink = createLavalink(this.client);

		this.setup().then(() => {
			this.logger.info('Logging in...');
			this.client.login(env.BOT_TOKEN);
		});
	}

	/**
	 * Executes async setup tasks.
	 */
	async setup() {
		await this.attachHandlers();
		await this.registerCommands();
		this.attachLavalinkHandlers();
	}

	/**
	 * Gracefully shuts down the bot.
	 */
	async destroy() {
		this.logger.info('Shutting down...');

		this.client.user?.setStatus('invisible');

		this.logger.debug('Destroying %d players...', this.lavalink.players.size);
		await Promise.allSettled(
			this.lavalink.players.map(async (player) => {
				await player.nowPlayingMessage?.delete();
				player.destroy(true);
			}),
		);

		if (env.LAVALINK_IDENTIFIER) {
			this.lavalink.destroyNode(env.LAVALINK_IDENTIFIER);
		}

		this.logger.debug('Destroying client...');
		await this.client.destroy();

		this.logger.info('Goodbye!');
	}

	/**
	 * Attaches event handlers to the Lavalink client.
	 * TODO: refactor this
	 */
	attachLavalinkHandlers() {
		Sentry.withScope((scope) => {
			scope.setTransactionName('Lavalink Handlers');

			this.lavalink.on('nodeConnect', (node) => {
				this.logger.info(
					'Lavalink node "%s" connected!',
					node.options.identifier,
				);
			});

			this.lavalink.on('nodeError', (node, error) => {
				Sentry.captureException(error);

				this.logger.error(
					'Lavalink node "%s" encountered an error: %s',
					node.options.identifier,
					error.message,
				);
			});

			this.lavalink.on('trackStart', async (player, track) => {
				clearTimeout(player.timeout);

				this.logger.debug('Started play in %s', player.guild);

				if (!player.textChannel) return;

				const channel = this.client.channels.cache.get(player.textChannel) as
					| TextBasedChannelFields<true>
					| undefined;

				const message = await channel?.send(createNowPlayingMessage(track));

				if (message) {
					player.setNowPlayingMessage(message);
				}
			});

			this.lavalink.on('queueEnd', (player) => {
				this.logger.debug('Queue ended for player %s', player.guild);

				if (!player.textChannel) return;

				const channel = this.client.channels.cache.get(player.textChannel) as
					| TextBasedChannelFields<true>
					| undefined;

				channel?.send({
					embeds: [createQueueEndedEmbed()],
				});

				if (env.BOT_IDLE_AUTO_DISCONNECT) {
					player.timeout = setTimeout(
						() => player.destroy(true),
						env.BOT_IDLE_DISCONNECT_SECONDS * 1_000,
					);
				}
			});
		});
	}

	/**
	 * Attaches event handlers to the Discord client.
	 */
	async attachHandlers() {
		const files = await readDir('./handlers/**/*.ts');

		Sentry.withScope((scope) => {
			scope.setTransactionName('Bot Handlers');

			for (const file of files) {
				const instance = require(file).default;
				const handler: Handler<string> = new instance();

				this.client[handler.once ? 'once' : 'on'](
					handler.event as string,
					(...args) => handler.listener(this, ...args),
				);
			}
		});
	}

	/**
	 * Registers slash commands globally.
	 * After registering, the commands are cached in a file.
	 */
	async registerCommands() {
		const CACHE_FILENAME = 'registered-commands.json';
		const files = await readDir('./commands/**/*.ts');

		const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

		for (const file of files) {
			const instance = require(file).default;
			const command: Command = new instance();

			this.commands.set(command.data.name, command);

			commands.push(command.data.toJSON());
		}

		const isUpToDate = await isCached(CACHE_FILENAME, commands);

		if (isUpToDate) {
			this.logger.info('Commands are up to date.');
			return;
		}

		try {
			this.logger.info('Registering %d commands...', commands.length);

			const data = (await this.rest.put(
				Routes.applicationCommands(env.BOT_CLIENT_ID),
				{
					body: commands,
				},
			)) as APIApplicationCommand[];

			if (commands.length === data.length) {
				this.logger.info('Commands succesfully registered!');
				createCache(CACHE_FILENAME, commands);
			} else {
				this.logger.warn(
					'%d commands possibly failed to register.',
					commands.length - data.length,
				);
			}
		} catch (e) {
			Sentry.captureException(e);
			this.logger.error('Commands failed to register: %v', e);
		}
	}
}
