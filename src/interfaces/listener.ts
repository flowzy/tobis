import { ClientEvents } from 'discord.js';
import { Bot } from './bot';

// TODO: add support for lavalink events
export type ListenerEvent = keyof ClientEvents | ({} & string);
export type ListenerExecute<TEvent extends ListenerEvent> = (
	bot: Bot,
	...args: TEvent extends keyof ClientEvents ? ClientEvents[TEvent] : any[]
) => any;

export interface Listener<TEvent extends ListenerEvent> {
	event: TEvent;
	once?: boolean;
	execute: ListenerExecute<TEvent>;
}
