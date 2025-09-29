export interface Database<K, V> {
	readonly db: unknown;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	get(key: K): Promise<V>;
	set(key: K, value: V): Promise<void>;
	delete(key: K): Promise<boolean>;
	getAll(): Promise<[K, V][]>;
}
