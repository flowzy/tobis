import * as Sentry from "@sentry/bun";
import { Events } from "discord.js";
import { env } from "~/env";
import { createListener } from "~/factories/listener";
import type { Command } from "~/interfaces/command";

export default createListener({
	event: Events.InteractionCreate,

	async execute(bot, interaction) {
		if (!interaction.isChatInputCommand()) return;
		if (!interaction.inCachedGuild()) return;

		if (
			env.NODE_ENV === "development" &&
			env.BOT_OWNER_ID !== interaction.user.id
		) {
			return interaction.reply({
				content: "You are not allowed to use this bot in development mode",
				ephemeral: true,
			});
		}

		const command: Command | undefined = bot.commands.get(
			interaction.commandName,
		);

		if (!command) {
			bot.logger.warn(`Command "${interaction.commandName}" not found`);

			return interaction.reply({
				content: "Unknown command",
				ephemeral: true,
			});
		}

		if (
			command.permissions &&
			!interaction.memberPermissions?.has(command.permissions)
		) {
			return interaction.reply({
				content: "You do not have permission to use this command",
				ephemeral: true,
			});
		}

		try {
			await command.execute(bot, interaction);
		} catch (e) {
			Sentry.captureException(e, {
				extra: {
					command: interaction.commandName,
				},
			});

			bot.logger.error(e);

			const message = "Something went wrong. Please try again later.";

			if (interaction.replied || interaction.deferred) {
				interaction.followUp({
					content: message,
					ephemeral: true,
				});

				return;
			}

			interaction.reply({
				content: message,
				ephemeral: true,
			});
		}
	},
});
