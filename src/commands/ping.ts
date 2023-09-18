import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Bot } from '~/bot';
import { Command } from '~/interfaces/command';

export default class PingCommand implements Command {
	permissions?: bigint[] | undefined;
	public data = new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Measure bot's ping");

	async execute(bot: Bot, interaction: CommandInteraction) {
		const sent = await interaction.reply({
			content: 'Pinging... ',
			fetchReply: true,
		});

		interaction.editReply({
			content: null,
			embeds: [
				new EmbedBuilder().setAuthor({ name: 'Pong!' }).addFields(
					{
						name: 'Heartbeat',
						value: `\`${Math.max(0, bot.client.ws.ping)} ms\``,
						inline: true,
					},
					{
						name: 'Roundtrip Latency',
						value: `\`${
							sent.createdTimestamp - interaction.createdTimestamp
						} ms\``,
						inline: true,
					},
				),
			],
		});
	}
}
