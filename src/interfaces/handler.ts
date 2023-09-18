import { ClientEvents, Events } from 'discord.js';
import { Bot } from '~/bot';

type HandlerEvent = string;
type HandlerListener<TEvent extends HandlerEvent> = (
	bot: Bot,
	...args: TEvent extends keyof ClientEvents ? ClientEvents[TEvent] : any[]
) => any;

export interface Handler<
	TEvent extends HandlerEvent,
	TListener extends HandlerListener<TEvent> = HandlerListener<TEvent>,
> {
	event: Events;
	listener: TListener;
	once?: boolean;
}
