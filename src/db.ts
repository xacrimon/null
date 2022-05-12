import openSqlite3, { Database as SQLiteHandle } from "better-sqlite3";
import fs from "fs";

const busyTimeout = 1000;
const analysisLimit = 1000;
const automaticIndex = false;
const cacheSize = -8192;
const journalMode = "wal";
const synchronous = "normal";

export class Database {
  private handle: SQLiteHandle | null;

  public constructor(path: string) {
    this.handle = openSqlite3(path, { timeout: busyTimeout });
    this.handle.pragma(`analysis_limit = ${analysisLimit}`);
    this.handle.pragma(`automatic_index = ${automaticIndex}`);
    this.handle.pragma(`cache_size = ${cacheSize}`);
    this.handle.pragma(`journal_mode = ${journalMode}`);
    this.handle.pragma(`synchronous = ${synchronous}`);
  }

  private getHandle(): SQLiteHandle {
    if (this.handle == null) {
      throw new Error("database is closed");
    }

    return this.handle;
  }

  public get(sql: string, ...params: any[]): any {
    return this.getHandle().prepare(sql).get(params);
  }

  public getVersion(): number {
    return this.getHandle().pragma("user_version", { simple: true });
  }

  public applyMigration(migration: Migration) {
    console.log(`applying migration ${migration.filePath}`);
    const handle = this.getHandle();
    handle.exec(migration.sql);
    handle.pragma(`user_version = ${migration.version}`);
  }

  public close() {
    this.getHandle();
  }
}

export type Migration = {
  version: number;
  filePath: string;
  sql: string;
};

export function loadMigrations(): Migration[] {
  const path = "./migrations";
  const migrations = [];

  for (const file of fs.readdirSync(path)) {
    const version = parseInt(file);
    const filePath = `${path}/${file}`;
    const sql = fs.readFileSync(`${path}/${file}`, "utf8");
    migrations.push({ version, filePath, sql });
  }

  return migrations;
}
