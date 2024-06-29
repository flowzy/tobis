import { EmbedBuilder, type InteractionReplyOptions } from "discord.js";
import { EMBED_COLOR_ERROR } from "~/config/color";

export function createErrorMessage({
	message,
	title = "Error",
	footer,
}: {
	title?: string;
	message: string;
	footer?: string;
}): InteractionReplyOptions {
	const embed = new EmbedBuilder()
		.setColor(EMBED_COLOR_ERROR)
		.setAuthor({ name: title })
		.setDescription(message);

	if (footer) {
		embed.setFooter({ text: footer });
	}

	return {
		embeds: [embed],
	};
}
