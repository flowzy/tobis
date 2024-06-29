import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type { Bot } from "~/interfaces/bot";

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	permissions?: bigint[];
	// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
	execute(bot: Bot, interaction: ChatInputCommandInteraction<"cached">): any;
}
