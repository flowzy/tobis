import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { Bot } from "~/interfaces/bot";

export interface Command {
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	permissions?: bigint[];
	// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
	execute(bot: Bot, interaction: ChatInputCommandInteraction<"cached">): any;
}
