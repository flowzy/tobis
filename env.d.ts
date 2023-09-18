import 'magmastream';

declare module 'magmastream' {
	interface Player {
		timeout?: NodeJS.Timeout;
	}
}
