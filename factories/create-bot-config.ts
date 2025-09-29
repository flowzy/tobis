import { z } from "zod";

const schema = z.object({
	mode: z.enum(["production", "development"]).default("production"),

	bot: z.object({
		name: z.string(),
		token: z.string().min(1, "Bot token is required."),
		client_id: z.string().min(1, "Bot client ID is required."),
		owner_id: z.string().optional(),
	}),

	voice: z.object({
		idle_auto_disconnect: z.boolean().default(true),
		idle_disconnect_seconds: z.number().min(1).default(60),
		volume: z.number().min(0).max(100).default(100),
		self_deafen: z.boolean().default(true),
	}),

	lavalink: z.object({
		default_search_platform: z.string(),

		nodes: z
			.array(
				z.object({
					host: z.string().min(1, "Lavalink host is required."),
					password: z.string().min(1, "Lavalink password is required."),
					port: z.number().default(443),
					secure: z.boolean().default(true),
					identifier: z.string().optional(),
				}),
			)
			.min(1, "At least one Lavalink node is required."),
	}),

	logging: z.object({
		level: z.string(),

		sentry: z.object({
			enabled: z.boolean().default(false),
			dsn: z.url().optional(),
		}),
	}),
});

type BotConfig = z.infer<typeof schema>;

export function createBotConfig(config: BotConfig) {
	const validation = z.safeParse(schema, config);

	if (!validation.success) {
		console.error("Invalid configuration:");

		for (const issue of validation.error.issues) {
			console.error(`  - [${issue.path.join(" -> ")}]: ${issue.message}`);
		}

		process.exit(1);
	}

	return validation.data;
}
