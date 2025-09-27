import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	PermissionsBitField,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import type { SearchResult } from "moonlink.js";
import type { Bot } from "~/bot";
import { EmbedColor } from "~/constants/color";
import { createEnqueuedPlaylistEmbed } from "~/embeds/enqueued-playlist";
import { createEnqueuedTrackEmbed } from "~/embeds/enqueued-track";
import { createErrorEmbed } from "~/embeds/error";
import { createInfoEmbed } from "~/embeds/info";
import { createCommand } from "~/factories/command";
import { createPlayer, startPlaying } from "~/helpers/player";
import { logger } from "~/lib/logger";
import { formatDuration } from "~/utils/format";

export default createCommand({
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Enqueue a track to play")
		.addStringOption((option) =>
			option
				.setName("query")
				.setDescription("Search for a track or paste in a URL")
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName("autoplay")
				.setDescription("Play similar tracks when the queue ends"),
		)
		.addStringOption((option) =>
			option
				.setName("source")
				.setDescription("Where to search track")
				.addChoices(
					{ name: "YouTube", value: "youtube" },
					{ name: "Soundcloud", value: "soundcloud" },
					{ name: "Spotify", value: "spotify" },
				),
		),

	permissions: [
		PermissionsBitField.Flags.Connect,
		PermissionsBitField.Flags.Speak,
	],

	async execute(bot, interaction) {
		if (!interaction.deferred) {
			await interaction.deferReply();
		}

		const query = interaction.options.getString("query", true);
		const source = interaction.options.getString("source") ?? undefined;

		await search(bot, interaction, query, source);
	},
});

async function search(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
	query: string,
	source: string | undefined,
) {
	const player = createPlayer(bot, interaction);

	if (!player) {
		return;
	}

	const result = await bot.lavalink.search({
		query,
		source,
		requester: interaction.user.id,
		limit: 10,
	});

	switch (result.loadType) {
		case "search": {
			return prompt(bot, interaction, result);
		}

		case "empty": {
			return interaction.editReply({
				embeds: [
					createInfoEmbed({
						title: "No results found",
						message: "Try a different search term or URL",
					}),
				],
			});
		}

		case "error": {
			return interaction.editReply({
				embeds: [
					createErrorEmbed({
						title: "An error occurred",
						message:
							result.error ?? "Could not find any results. Try again later",
					}),
				],
			});
		}

		case "track": {
			await player.queue.add(result.tracks);
			await startPlaying(player);

			return interaction.editReply({
				embeds: [createEnqueuedTrackEmbed(result, player.queue)],
			});
		}

		case "playlist": {
			return confirm(bot, interaction, result, query);
		}
	}
}

export const PROMPT_DISPLAY_TIME_SECONDS = 45;

/**
 * Prompt the user to select a track from the search results.
 * @param bot
 * @param interaction
 * @param result
 * @returns
 */
async function prompt(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
	result: SearchResult,
) {
	const cancel = new ButtonBuilder()
		.setLabel("Cancel")
		.setCustomId("cancel")
		.setStyle(ButtonStyle.Secondary);

	const select = new StringSelectMenuBuilder()
		.setCustomId("track-select")
		.setPlaceholder("Select a track to play");

	const options = result.tracks.slice(0, 10).map((track, index) => {
		return new StringSelectMenuOptionBuilder()
			.setLabel(track.title)
			.setDescription(`${formatDuration(track.duration)} • ${track.author}`)
			.setValue(index.toString());
	});

	select.addOptions(...options);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		select,
	);

	const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel);

	const prompt = await interaction.editReply({
		components: [row, actionRow],
	});

	try {
		const confirmation = await prompt.awaitMessageComponent<
			ComponentType.StringSelect | ComponentType.Button
		>({
			filter: (i) => i.user.id === interaction.user.id,
			time: PROMPT_DISPLAY_TIME_SECONDS * 1_000,
		});

		if (confirmation.componentType === ComponentType.Button) {
			await prompt.delete();
			logger.debug("User cancelled track selection");
			return;
		}

		const player = createPlayer(bot, interaction);

		if (!player) {
			return;
		}

		const trackIndex = parseInt(confirmation.values.at(0) ?? "", 10);
		const track = result.tracks[trackIndex];

		if (!track) {
			await confirmation.update({
				embeds: [createErrorEmbed({ message: "Track not found" })],
				components: [],
			});
			return;
		}

		await player.queue.add(track);

		const embed = createEnqueuedTrackEmbed(result, player.queue);

		await confirmation.update({
			embeds: [embed],
			components: [],
		});

		await startPlaying(player);
	} catch {
		await prompt.delete();
	}
}

async function confirm(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
	result: SearchResult,
	query: string,
) {
	const confirm = new ButtonBuilder()
		.setLabel("Yes")
		.setCustomId("confirm")
		.setStyle(ButtonStyle.Success);
	const cancel = new ButtonBuilder()
		.setLabel("Cancel")
		.setCustomId("cancel")
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		confirm,
		cancel,
	);

	const promptEmbed = new EmbedBuilder()
		.setColor(EmbedColor.Info)
		.setAuthor({ name: "Enqueue playlist?" })
		.setTitle(result.playlistInfo.name)
		.setDescription("Do you want to add this playlist to the queue?")
		.addFields(
			{
				name: "Tracks",
				value: `\`${result.tracks.length.toString()}\``,
				inline: true,
			},
			{
				name: "Duration",
				value: `\`${formatDuration(result.getTotalDuration())}\``,
				inline: true,
			},
		);

	const firstTrack = result.getFirst();

	if (firstTrack?.artworkUrl) {
		promptEmbed.setThumbnail(firstTrack.artworkUrl);
	}

	const prompt = await interaction.editReply({
		embeds: [promptEmbed],
		components: [row],
	});

	try {
		const confirmation =
			await prompt.awaitMessageComponent<ComponentType.Button>({
				filter: (i) => i.user.id === interaction.user.id,
				time: PROMPT_DISPLAY_TIME_SECONDS * 1_000,
			});

		const player = createPlayer(bot, interaction);

		if (!player) {
			return;
		}

		await player.queue.add(result.tracks);

		const embed = createEnqueuedPlaylistEmbed(result, query, player.queue);

		await confirmation.update({
			embeds: [embed],
			components: [],
		});

		await startPlaying(player);
	} catch {
		await prompt.delete();
	}
}
