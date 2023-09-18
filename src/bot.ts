import {
	APIApplicationCommand,
	Client,
	Collection,
	Colors,
	EmbedBuilder,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
	Webhook,
} from 'discord.js';
import { glob } from 'glob';
import { Manager } from 'magmastream';
import { env } from '~/env';
import { createLavalink } from '~/lib/lavalink';
import { logger } from '~/lib/logger';
import { Command } from '~/interfaces/command';
import { Handler } from '~/interfaces/handler';
import { createCache, isCached } from '~/utils/cache';
import { formatDuration } from '~/utils/formatting';

export class Bot {
	public commands = new Collection<string, Command>();
	public rest = new REST().setToken(env.BOT_TOKEN);
	public lavalink: Manager;
	public logger = logger;

	constructor(public readonly client: Client) {
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
		this.lavalink.players.forEach((player) => player.destroy(true));
		await this.client.destroy();
		this.logger.info('Goodbye!');
	}

	/**
	 * Attaches event handlers to the Lavalink client.
	 * TODO: refactor this
	 */
	attachLavalinkHandlers() {
		this.lavalink.on('nodeConnect', (node) => {
			this.logger.info(
				'Lavalink node "%s" connected!',
				node.options.identifier,
			);
		});

		this.lavalink.on('nodeError', (node, error) => {
			this.logger.info(
				'Lavalink node "%s" encountered an error: %s',
				node.options.identifier,
				error.message,
			);
		});

		this.lavalink.on('trackStart', async (player, track) => {
			if (!player.textChannel) return;

			const channel = this.client.channels.cache.get(
				player.textChannel,
			) as unknown as Webhook;

			const message = await channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Green)
						.setAuthor({ name: 'Now playing' })
						.setTitle(track.title)
						.setURL(track.uri)
						.setImage(track.artworkUrl)
						.addFields(
							{ name: 'Uploaded', value: track.author, inline: true },
							{
								name: 'Duration',
								value: `\`${formatDuration(track.duration)}\``,
								inline: true,
							},
							{
								name: 'Requested by',
								value: `${track.requester}`,
								inline: true,
							},
						)
						.setFooter({
							text: `${player.queue.size} tracks in queue`,
						}),
				],
			});

			player.setNowPlayingMessage(message);
		});

		this.lavalink.on('queueEnd', (player) => {});
	}

	/**
	 * Attaches event handlers to the Discord client.
	 */
	async attachHandlers() {
		// TODO: move this to a utils file?
		const files = await glob('./handlers/**/*.ts', {
			dotRelative: true,
			cwd: import.meta.dir,
		});

		for (const file of files) {
			const instance = require(file).default;
			const handler: Handler<string> = new instance();

			this.client[handler.once ? 'once' : 'on'](
				handler.event as string,
				(...args) => handler.listener(this, ...args),
			);
		}
	}

	/**
	 * Registers slash commands globally.
	 * After registering, the commands are cached in a file.
	 */
	async registerCommands() {
		const CACHE_FILENAME = 'registered-commands.json';
		const files = await glob('./commands/**/*.ts', {
			dotRelative: true,
			cwd: import.meta.dir,
		});

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
			this.logger.error('Commands failed to register: %v', e);
		}
	}
}
