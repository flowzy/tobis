import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		BOT_TOKEN: z.string().min(1),
		BOT_CLIENT_ID: z.string().min(1),
		BOT_CLIENT_NAME: z.string(),

		LAVALINK_HOST: z.string().min(1),
		LAVALINK_PORT: z.coerce.number(),
		LAVALINK_SECURE: z
			.union([z.literal('true'), z.literal('false')])
			.default('false'),
		LAVALINK_PASSWORD: z.string().min(1),
		LAVALINK_IDENTIFIER: z.string(),

		DEFAULT_SEARCH_PLATFORM: z.union([
			z.literal('youtube'),
			z.literal('youtube music'),
			z.literal('soundcloud'),
			z.literal('deezer'),
		]),
	},
	runtimeEnv: process.env,
});
