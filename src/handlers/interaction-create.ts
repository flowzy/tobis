import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';
import { Handler } from '~/interfaces/handler';

export default class InteractionCreateHandler
	implements Handler<Events.InteractionCreate>
{
	event = Events.InteractionCreate;

	async listener(bot: Bot, interaction: Interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command: Command | undefined = bot.commands.get(
			interaction.commandName,
		);

		if (!command) {
			bot.logger.warn(`Command "${interaction.commandName}" not found`);
			return this.reply(interaction, 'Unknown command');
		}

		try {
			await command.execute(bot, interaction);
		} catch (e) {
			bot.logger.error(e);
			this.reply(interaction, 'An error occurred while executing this command');
		}
	}

	// TODO: Move this to a utils file?
	reply(interaction: ChatInputCommandInteraction, message: string) {
		if (interaction.replied || interaction.deferred) {
			return interaction.followUp({
				content: message,
				ephemeral: true,
			});
		}

		interaction.reply({
			content: message,
			ephemeral: true,
		});
	}
}