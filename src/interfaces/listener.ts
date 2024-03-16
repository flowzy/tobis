import type { ClientEvents } from "discord.js";
import type { Bot } from "./bot";

// TODO: add support for lavalink events
export type ListenerEvent = keyof ClientEvents | ({} & string);
export type ListenerExecute<TEvent extends ListenerEvent> = (
	bot: Bot,
	// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
	...args: TEvent extends keyof ClientEvents ? ClientEvents[TEvent] : any[]
	// biome-ignore lint/suspicious/noExplicitAny: TODO: fix this
) => any;

export interface Listener<TEvent extends ListenerEvent> {
	event: TEvent;
	once?: boolean;
	execute: ListenerExecute<TEvent>;
}
