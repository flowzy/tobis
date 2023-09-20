import * as Sentry from '@sentry/node';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { Bot } from '~/bot';
import { env } from '~/env';

Sentry.init({
	enabled: env.NODE_ENV === 'production' && Boolean(env.SENTRY_DSN),
	dsn: env.SENTRY_DSN,
	tracesSampleRate: 1,
});

const bot = new Bot(
	new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
		presence: {
			activities: [{ name: 'Music', type: ActivityType.Listening }],
		},
	}),
);

let isShuttingDown = false;
['SIGHUP', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
	process.on(signal, async () => {
		if (isShuttingDown) return;
		isShuttingDown = true;

		try {
			await bot.destroy();
			process.exit(0);
		} catch (e) {
			Sentry.captureException(e, {
				tags: {
					signal,
				},
			});

			console.error('Failed to gracefully shut down.', e);
			process.exit(1);
		}
	});
});
