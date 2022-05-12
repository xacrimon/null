import openSqlite3, { Database as SQLiteHandle } from "better-sqlite3";

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

  public close() {
    this.getHandle();
  }
}
