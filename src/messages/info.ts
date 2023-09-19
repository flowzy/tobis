import {
	EmbedBuilder,
	InteractionReplyOptions,
	MessageCreateOptions,
} from 'discord.js';
import { EmbedColor } from '~/config/color';

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
		.setColor(EmbedColor.Info)
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
