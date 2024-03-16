import type { Client, Collection } from "discord.js";
import type { Manager as LavalinkManager } from "magmastream";
import type { Logger } from "winston";
import type { Command } from "./command";

export interface Bot {
	client: Client<true>;
	lavalink: LavalinkManager;
	commands: Collection<string, Command>;
	logger: Logger;
}
