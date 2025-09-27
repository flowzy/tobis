import { EmbedBuilder } from "discord.js";
import { EmbedColor } from "~/constants/color";

export function createInfoEmbed({
	message,
	title,
	footer,
}: {
	message: string;
	title?: string;
	footer?: string;
}) {
	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Info)
		.setDescription(message);

	if (title) {
		embed.setAuthor({ name: title });
	}

	if (footer) {
		embed.setFooter({ text: footer });
	}

	return embed;
}
