import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { Bot } from '~/bot';
import { env } from '~/env';

Sentry.init({
	enabled: env.SENTRY_DSN.length > 0,
	dsn: env.SENTRY_DSN,
	integrations: [new ProfilingIntegration()],
	tracesSampleRate: Bun.env.NODE_ENV === 'production' ? 0.5 : 1,
	profilesSampleRate: 0.5,
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
