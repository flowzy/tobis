import { EmbedBuilder, MessageCreateOptions } from 'discord.js';
import { EmbedColor } from '~/config/color';

export function createErrorMessage({
	message,
	title = 'Error',
	footer,
}: {
	title?: string;
	message: string;
	footer?: string;
}): MessageCreateOptions {
	const embed = new EmbedBuilder()
		.setColor(EmbedColor.Error)
		.setAuthor({ name: title })
		.setDescription(message);

	if (footer) {
		embed.setFooter({ text: footer });
	}

	return {
		embeds: [embed],
	};
}
