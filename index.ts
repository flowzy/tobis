import * as Sentry from '@sentry/bun';
import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { createBot } from '~/bot';
import { env } from '~/env';
import { logger } from '~/lib/logger';

Sentry.init({
	enabled: env.NODE_ENV === 'production' && Boolean(env.SENTRY_DSN),
	dsn: env.SENTRY_DSN,
	tracesSampleRate: 1,
});

const cleanup = await createBot(
	new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
		presence: {
			activities: [{ name: 'Music', type: ActivityType.Listening }],
		},
	}),
);

process.on('beforeExit', async () => {
	try {
		await cleanup();
		process.exit(0);
	} catch (e) {
		Sentry.captureException(e);
		logger.error('Failed to gracefully shut down.', e);
		process.exit(1);
	}
});
