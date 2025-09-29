import * as Sentry from "@sentry/bun";
import { MessageFlags } from "discord.js";
import { config } from "~/bot/config";
import type { Command } from "~/factories/create-command";
import { createListener } from "~/factories/create-listener";
import { logger } from "~/lib/logger";

export default createListener({
	event: "interactionCreate",

	async execute(bot, interaction) {
		if (!interaction.isChatInputCommand()) return;
		if (!interaction.inCachedGuild()) return;

		if (
			config.mode === "development" &&
			config.bot.owner_id &&
			config.bot.owner_id !== interaction.user.id
		) {
			return interaction.reply({
				content: "You are not allowed to use this bot at the moment.",
				flags: [MessageFlags.Ephemeral],
			});
		}

		const command: Command | undefined = bot.commands?.get(
			interaction.commandName,
		);

		if (!command) {
			logger.warn('Command "%s" not found', interaction.commandName);

			return interaction.reply({
				content: "Unknown command",
				flags: [MessageFlags.Ephemeral],
			});
		}

		if (
			command.permissions &&
			!interaction.memberPermissions?.has(command.permissions)
		) {
			return interaction.reply({
				content: "You do not have permission to use this command.",
				flags: [MessageFlags.Ephemeral],
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

			logger.error(e);

			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					content: "Something went wrong. Please try again later.",
					flags: [MessageFlags.Ephemeral],
				});
			}

			return interaction.reply({
				content: "Something went wrong. Please try again later.",
				flags: [MessageFlags.Ephemeral],
			});
		}
	},
});
