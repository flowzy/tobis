import { createLogger, format, transports } from "winston";
import { config } from "~/config";

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
				return `[${info.timestamp}]\t${info.level}: ${info.stack}`;
			}

			// @ts-expect-error
			return `[${info.timestamp}]\t${info.level}: ${info.message}`;
		}),
	),
	transports: [new transports.Console()],
});
