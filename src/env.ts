import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.union([z.literal("development"), z.literal("production")])
			.default("development"),

		BOT_NAME: z.string().optional(),
		BOT_TOKEN: z.string().min(1),
		BOT_CLIENT_ID: z.string().min(1),
		BOT_OWNER_ID: z.string().min(1),

		BOT_IDLE_AUTO_DISCONNECT: z
			.union([z.literal("true"), z.literal("false")])
			.default("true")
			.transform((value) => value === "true"),
		BOT_IDLE_DISCONNECT_SECONDS: z.coerce.number().default(30),

		BOT_VOICE_VOLUME: z.coerce.number().min(1).max(100).default(100),
		BOT_VOICE_SELF_DEAFEN: z
			.union([z.literal("true"), z.literal("false")])
			.default("true")
			.transform((value) => value === "true"),

		BOT_DEFAULT_SEARCH_PLATFORM: z.union([
			z.literal("youtube"),
			z.literal("youtube music"),
			z.literal("soundcloud"),
			z.literal("deezer"),
		]),

		LAVALINK_HOST: z.string().min(1),
		LAVALINK_PORT: z.coerce.number(),
		LAVALINK_SECURE: z
			.union([z.literal("true"), z.literal("false")])
			.default("false")
			.transform((value) => value === "true"),
		LAVALINK_PASSWORD: z.string().min(1),
		LAVALINK_IDENTIFIER: z.string().optional(),

		SENTRY_DSN: z.string().optional(),
	},
	runtimeEnv: process.env,
});
