import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type { Bot } from "~/bot";

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	permissions?: bigint[];
	execute: (
		bot: Bot,
		interaction: ChatInputCommandInteraction<"cached">,
	) => unknown;
}
