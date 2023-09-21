import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '~/interfaces/bot';

export interface Command {
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	permissions?: bigint[];
	execute(bot: Bot, interaction: ChatInputCommandInteraction<'cached'>): any;
}
