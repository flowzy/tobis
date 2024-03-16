import {
	ActionRowBuilder,
	type ChatInputCommandInteraction,
	type ComponentType,
	type EmbedBuilder,
	PermissionsBitField,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import type { SearchPlatform, SearchResult } from "magmastream";
import { createCommand } from "~/factories/command";
import { createPlayer, startPlaying } from "~/helpers/player";
import type { Bot } from "~/interfaces/bot";
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
			interaction.member,
		);

		if (result.loadType === "error") {
			return interaction.editReply(
				createErrorMessage({
					message: "Something went wrong... Please try again later",
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
			return prompt(bot, interaction, result);
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
				player.queue.add(playlist.tracks);

				embed = createEnqueuedPlaylistEmbed(playlist, query, player.queue);
				break;
			}
		}

		await startPlaying(player);

		interaction.editReply({
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
async function prompt(
	bot: Bot,
	interaction: ChatInputCommandInteraction<"cached">,
	result: SearchResult,
) {
	const select = new StringSelectMenuBuilder()
		.setCustomId("track-select")
		.setPlaceholder("Select a track to play");

	const options = result.tracks.map((track, index) => {
		return new StringSelectMenuOptionBuilder()
			.setLabel(track.title)
			.setDescription(`${formatDuration(track.duration)} • ${track.author}`)
			.setValue(index.toString());
	});

	select.addOptions(...options);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		select,
	);

	const prompt = await interaction.editReply({
		components: [row],
	});

	const PROMPT_DISPLAY_TIME_SECONDS = 45;

	try {
		const confirmation =
			await prompt.awaitMessageComponent<ComponentType.StringSelect>({
				filter: (i) => i.user.id === interaction.user.id,
				time: PROMPT_DISPLAY_TIME_SECONDS * 1_000,
			});

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
