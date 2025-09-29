import { Colors, EmbedBuilder } from "discord.js";

export const EmbedColor = {
	Info: Colors.Greyple,
	Primary: Colors.Blurple,
	Error: Colors.Red,
	Success: Colors.Green,
} as const;

export class Embed {
	public error() {
		const embed = new EmbedBuilder()
			.setColor(EmbedColor.Error)
			.setAuthor({ name: title })
			.setDescription(message);

		if (footer) {
			embed.setFooter({ text: footer });
		}

		return embed;
	}

	public info() {
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
}
