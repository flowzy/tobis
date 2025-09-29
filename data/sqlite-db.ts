import { Database as BunSqliteDatabase } from "bun:sqlite";
import type { Database } from "./database";

export class SqliteDb<K, V> implements Database<K, V> {
	private readonly db: BunSqliteDatabase;
	private readonly table: string;

	constructor(table) {
		this.db = new BunSqliteDatabase("./database.sqlite");
		this.table = table;
		this.db.run(
			`CREATE TABLE IF NOT EXISTS ${table} (key TEXT PRIMARY KEY, value TEXT)`,
		);
	}

	get(key: K): V | undefined {
		const row = this.db
			.query(`SELECT value FROM ${this.table} WHERE key = ?`)
			.get(String(key));

		return row ? (JSON.parse(row.value) as V) : undefined;
	}

	set(key: K, value: V): void {
		this.db
			.query(`INSERT OR REPLACE INTO ${this.table} (key, value) VALUES (?, ?)`)
			.run(String(key), JSON.stringify(value));
	}

	delete(key: K): boolean {
		const result = this.db
			.query(`DELETE FROM ${this.table} WHERE key = ?`)
			.run(String(key));

		return result.changes > 0;
	}
}
