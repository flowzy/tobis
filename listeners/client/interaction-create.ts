import * as Sentry from "@sentry/bun";
import { MessageFlags } from "discord.js";
import { config } from "~/app/config";
import { createErrorEmbed } from "~/embeds/error";
import { logger } from "~/lib/logger";
import type { Command } from "~/structures/command";
import { createListener } from "~/structures/listener";

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
				content: "You do not have permission to use this command",
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

			const embed = createErrorEmbed({
				message: "Something went wrong. Please try again later.",
			});

			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					embeds: [embed],
					flags: [MessageFlags.Ephemeral],
				});
			}

			return interaction.reply({
				embeds: [embed],
				flags: [MessageFlags.Ephemeral],
			});
		}
	},
});
