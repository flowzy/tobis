import type { Player } from "moonlink.js";

/**
 * Join voice channel and start playing if not already playing.
 *
 * @param player
 */
export async function startPlaying(player: Player) {
	if (!player.queue.size) {
		return;
	}

	player.connect();

	if (!player.playing && !player.paused) {
		await player.play();
	}
}
