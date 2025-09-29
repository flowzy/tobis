import type { Database } from "~/data/database";

export class MemoryDb<K, V> implements Database<K, V> {
	private readonly db: Map<K, V> = new Map();

	get(key: K): V | undefined {
		return this.db.get(key);
	}

	getAll(): [K, V][] {
		return [...this.db.entries()];
	}

	set(key: K, value: V): void {
		this.db.set(key, value);
	}

	delete(key: K): boolean {
		return this.db.delete(key);
	}
}
