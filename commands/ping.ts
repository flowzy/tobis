import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { EmbedColor } from "~/constants/color";
import { createCommand } from "~/factories/create-command";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Measure latency"),

	async execute(bot, interaction) {
		const sent = await interaction.reply({
			content: "Pinging... ",
			withResponse: true,
			flags: [MessageFlags.Ephemeral],
		});

		await interaction.editReply({
			content: null,
			embeds: [
				new EmbedBuilder()
					.setColor(EmbedColor.Primary)
					.setAuthor({ name: "Pong!" })
					.addFields(
						{
							name: "Heartbeat",
							value: `\`${Math.max(0, bot.client.ws.ping)} ms\``,
							inline: true,
						},
						{
							name: "Roundtrip Latency",
							value: `\`${
								sent.interaction.createdTimestamp - interaction.createdTimestamp
							} ms\``,
							inline: true,
						},
					),
			],
		});
	},
});
