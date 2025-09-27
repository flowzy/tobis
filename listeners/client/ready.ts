import * as Sentry from "@sentry/bun";
import {
	type APIApplicationCommand,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from "discord.js";
import { config } from "~/app/config";
import { logger } from "~/lib/logger";
import type { Command } from "~/structures/command";
import { createListener } from "~/structures/listener";
import { readDir } from "~/utils/read-dir";

export default createListener({
	event: "clientReady",
	once: true,

	async execute(bot, client) {
		await bot.lavalink.manager.init(client.user.id);

		logger.info("Ready! Logged in as %s", client.user.tag);

		const files = readDir("./commands/**/*.ts");
		const data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

		for (const file of files) {
			const command: Command = require(file).default;

			bot.commands.set(command.data.name, command);

			try {
				data.push(command.data.toJSON());
			} catch (e) {
				console.warn(`Command "${command.data.name}" failed to register -`, e);
			}
		}

		try {
			logger.info("Registering %d commands...", data.length);

			const response = (await bot.rest.put(
				Routes.applicationCommands(config.bot.client_id),
				{ body: data },
			)) as APIApplicationCommand[];

			if (data.length === response.length) {
				logger.info("Commands successfully registered!");
			} else {
				logger.warn(
					"%d commands possibly failed to register.",
					data.length - response.length,
				);
			}
		} catch (e) {
			Sentry.captureException(e);
			logger.error("Commands failed to register: %v", e);
		}
	},
});
