import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
	level: 'debug',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss',
		}),
		format.errors({ stack: true }),
		format.colorize(),
		format.splat(),
		format.printf((info) => {
			if (info.stack) {
				return `[${info.timestamp}] ${info.level}: ${info.stack}`;
			}

			return `[${info.timestamp}] ${info.level}: ${info.message}`;
		}),
	),
	transports: [new transports.Console()],
});
