import type { Track } from "moonlink.js";
import { TimeUnit } from "~/constants/time-unit";

/**
 * Parses a position string into milliseconds.
 * Supports formats like "+30s", "-2m", "1:30", "1h", etc.
 *
 * @param position
 * @param track
 */
export function parsePosition(position: string, track: Track): number | null {
	if (!track.isSeekable) {
		return null;
	}

	const isRelative = position.startsWith("+") || position.startsWith("-");
	const sign = position.startsWith("-") ? -1 : 1;
	const value = isRelative ? position.slice(1) : position;

	const colonParts = value.split(":").map(Number);
	let ms = 0;

	if (colonParts.length > 1) {
		// Handle colon time formats (hh:mm:ss, mm:ss)
		if (colonParts.length === 2) {
			ms = colonParts[0] * TimeUnit.Minute + colonParts[1] * TimeUnit.Second;
		} else if (colonParts.length === 3) {
			ms =
				colonParts[0] * TimeUnit.Hour +
				colonParts[1] * TimeUnit.Minute +
				colonParts[2] * TimeUnit.Second;
		}
	} else {
		// Handle simple formats (e.g. 30s, 2m, 1h)
		const match = value.match(/^(\d+)([smh]?)$/);
		if (!match) return null;

		const num = Number(match[1]);
		const unit = match[2];

		if (unit === "s") {
			ms = num * TimeUnit.Second;
		} else if (unit === "m") {
			ms = num * TimeUnit.Minute;
		} else if (unit === "h") {
			ms = num * TimeUnit.Hour;
		}
	}

	const newPosition = isRelative ? track.position + sign * ms : ms;

	return Math.min(Math.max(0, newPosition), track.duration);
}
