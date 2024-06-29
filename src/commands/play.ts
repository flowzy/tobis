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
import type { PlaylistData, SearchPlatform, SearchResult } from "magmastream";
import { EMBED_COLOR_INFO } from "~/config/color.ts";
import { PROMPT_DISPLAY_TIME_SECONDS } from "~/config/constants.ts";
import { createCommand } from "~/factories/command";
import { createPlayer, startPlaying } from "~/helpers/player";
import type { Bot } from "~/interfaces/bot";
import { logger } from "~/lib/logger.ts";
import { createEnqueuedPlaylistEmbed } from "~/messages/enqueued-playlist";
import { createEnqueuedTrackEmbed } from "~/messages/enqueued-track";
import { createErrorMessage } from "~/messages/error";
import { createInfoMessage } from "~/messages/info";
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
		.addStringOption((option) =>
			option
				.setName("source")
				.setDescription("Where to search track")
				.addChoices(
					{ name: "YouTube", value: "youtube" as SearchPlatform },
					{ name: "YouTube Music", value: "youtube music" as SearchPlatform },
					{ name: "Soundcloud", value: "soundcloud" as SearchPlatform },
					{ name: "Deezer", value: "deezer" as SearchPlatform },
				),
		),

	permissions: [
		PermissionsBitField.Flags.Connect,
		PermissionsBitField.Flags.Speak,
	],

	async execute(bot, interaction) {
		const player = createPlayer(bot, interaction);

		if (!player) {
			return;
		}

		if (!interaction.deferred) {
			await interaction.deferReply();
		}

		const query = interaction.options.getString("query", true);
		const source = interaction.options.getString("source") ?? undefined;

		const result = await bot.lavalink.search(
			{
				query,
				source,
			},
			interaction.user,
		);

		if (result.loadType === "error") {
			return interaction.editReply(
				createErrorMessage({
					message: "Could not find any results. Try again later",
				}),
			);
		}

		if (result.loadType === "empty") {
			return interaction.editReply(
				createInfoMessage({
					title: "No results found",
					message: "Try a different search term or URL",
				}),
			);
		}

		if (result.loadType === "search") {
			return promptSelect(bot, interaction, result);
		}

		let embed: EmbedBuilder;

		switch (result.loadType) {
			case "track": {
				// biome-ignore lint/style/noNonNullAssertion: TODO: fix this
				const track = result.tracks.at(0)!;
				player.queue.add(result.tracks);

				embed = createEnqueuedTrackEmbed(track, player.queue);
				break;
			}

			case "playlist": {
				// biome-ignore lint/style/noNonNullAssertion: TODO: fix this
				const playlist = result.playlist!;

				return promptConfirm(bot, interaction, playlist, query);
			}
		}

		await startPlaying(player);

		await interaction.editReply({
			embeds: [embed],
		});
	},
});

/**
 * Prompt the user to select a track from the search results.
 * @param bot
 * @param interaction
 * @param result
 * @returns
 */
async function promptSelect(
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

		const trackIndex = Number(confirmation.values.at(0));
		// biome-ignore lint/style/noNonNullAssertion: TODO: fix this
		const track = result.tracks.at(Number(trackIndex))!;
		const player = createPlayer(bot, interaction);

		if (!player) {
			return;
		}

		player.queue.add(track);

		const embed = createEnqueuedTrackEmbed(track, player.queue);

		await confirmation.update({
			embeds: [embed],
			components: [],
		});

		await startPlaying(player);
	} catch {
		await prompt.delete();
	}
}

async function promptConfirm(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
	playlist: PlaylistData,
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
		.setColor(EMBED_COLOR_INFO)
		.setAuthor({ name: "Enqueue playlist?" })
		.setTitle(playlist.name)
		.setDescription("Do you want to add this playlist to the queue?")
		.addFields(
			{
				name: "Tracks",
				value: `\`${playlist.tracks.length.toString()}\``,
				inline: true,
			},
			{
				name: "Duration",
				value: `\`${formatDuration(playlist.duration)}\``,
				inline: true,
			},
		);

	// biome-ignore lint/style/noNonNullAssertion: TODO: fix this
	const firstTrack = playlist.tracks.at(0)!;

	promptEmbed.setThumbnail(firstTrack.displayThumbnail("mqdefault"));

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

		player.queue.add(playlist.tracks);

		const embed = createEnqueuedPlaylistEmbed(playlist, query, player.queue);

		await confirmation.update({
			embeds: [embed],
			components: [],
		});

		await startPlaying(player);
	} catch {
		await prompt.delete();
	}
}
