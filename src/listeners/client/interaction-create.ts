import * as Sentry from "@sentry/bun";
import { Events, MessageFlags } from "discord.js";
import { config } from "~/config";
import { createErrorEmbed } from "~/embeds/error.ts";
import { createListener } from "~/factories/listener";
import type { Command } from "~/interfaces/command";
import { logger } from "~/lib/logger";

export default createListener({
	event: Events.InteractionCreate,

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
