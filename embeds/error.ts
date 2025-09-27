import { EmbedBuilder } from "discord.js";
import { EmbedColor } from "~/constants/color";

export function createErrorEmbed({
	message,
	title = "Error",
	footer,
}: {
	title?: string;
	message: string;
	footer?: string;
}) {
	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Error)
		.setAuthor({ name: title })
		.setDescription(message);

	if (footer) {
		embed.setFooter({ text: footer });
	}

	return embed;
}
