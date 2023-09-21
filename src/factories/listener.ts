import { Listener, ListenerEvent } from '~/interfaces/listener';

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
