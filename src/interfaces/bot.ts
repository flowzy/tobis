import { Client, Collection } from 'discord.js';
import { Manager as LavalinkManager } from 'magmastream';
import { Logger } from 'winston';
import { Command } from './command';

export interface Bot {
	client: Client<true>;
	lavalink: LavalinkManager;
	commands: Collection<string, Command>;
	logger: Logger;
}
