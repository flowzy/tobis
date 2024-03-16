import {
	EmbedBuilder,
	type InteractionReplyOptions,
	type MessageCreateOptions,
} from "discord.js";
import { EMBED_COLOR_INFO } from "~/config/color";

export function createInfoMessage({
	message,
	title,
	footer,
	ephemeral,
}: {
	message: string;
	title: string;
	footer?: string;
	ephemeral?: boolean;
}): MessageCreateOptions | InteractionReplyOptions {
	const embed = new EmbedBuilder()
		.setColor(EMBED_COLOR_INFO)
		.setAuthor({ name: title })
		.setDescription(message);

	if (footer) {
		embed.setFooter({ text: footer });
	}

	return {
		embeds: [embed],
		ephemeral,
	};
}
