import prettyMs from "pretty-ms";

export function formatDuration(ms: number) {
	return prettyMs(ms, { colonNotation: true, secondsDecimalDigits: 0 });
}
