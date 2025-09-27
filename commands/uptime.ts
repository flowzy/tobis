import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import ms from "pretty-ms";
import { EmbedColor } from "~/constants/color";
import { createCommand } from "~/structures/command";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Get uptime of the bot"),

	async execute(bot, interaction) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Primary)
					.setAuthor({ name: "Uptime" })
					.setDescription(`Bot has been up for \`${ms(bot.client.uptime)}\``),
			],
			flags: [MessageFlags.Ephemeral],
		});
	},
});
