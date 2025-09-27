import type { ClientEvents } from "discord.js";
import type { IEvents } from "moonlink.js";
import type { Bot } from "~/app/bot";

export type ListenerEvent = keyof ClientEvents | keyof IEvents | ({} & string);
export type ListenerExecute<TEvent> = (
	bot: Bot,
	...args: TEvent extends keyof ClientEvents
		? ClientEvents[TEvent]
		: TEvent extends keyof IEvents
			? Parameters<IEvents[TEvent]>
			: unknown[]
) => void;

export interface Listener<TEvent = unknown> {
	event: TEvent;
	once?: boolean;
	execute: ListenerExecute<TEvent>;
}

export function createListener<TEvent extends ListenerEvent = ListenerEvent>({
	event,
	once,
	execute,
}: Listener<TEvent>) {
	return {
		event,
		once,
		execute,
	};
}
