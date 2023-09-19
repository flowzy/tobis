import { Client } from 'discord.js';
import { Manager } from 'magmastream';
import { env } from '~/env';

export function createLavalink(client: Client) {
	return new Manager({
		nodes: [
			{
				host: env.LAVALINK_HOST,
				password: env.LAVALINK_PASSWORD,
				port: env.LAVALINK_PORT,
				secure: env.LAVALINK_SECURE,
				identifier: env.LAVALINK_IDENTIFIER,
				retryDelay: 1_000 * 3,
			},
		],
		send(id, payload) {
			client.guilds.cache.get(id)?.shard.send(payload);
		},
		clientId: env.BOT_CLIENT_ID,
		clientName: env.BOT_CLIENT_NAME,
		defaultSearchPlatform: env.BOT_DEFAULT_SEARCH_PLATFORM,
	});
}
