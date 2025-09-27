import { createLogger, format, transports } from "winston";
import { config } from "~/app/config";

export const logger = createLogger({
	level: config.logging.level,
	format: format.combine(
		format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		format.errors({ stack: true }),
		format.colorize(),
		format.splat(),
		format.printf((info) => {
			// @ts-expect-error
			if (info.stack) {
				// @ts-expect-error
				return `[${info.timestamp}] ${info.level}:\t${info.stack}`;
			}

			// @ts-expect-error
			return `[${info.timestamp}] ${info.level}:\t${info.message}`;
		}),
	),
	transports: [new transports.Console()],
});
