import fastify from "fastify";
import { Database, loadMigrations } from "./db";
import { registerRoutes } from "./api";

const closers: (() => void)[] = [];
process.on("SIGINT", () =>
  shutdown("received sigint. shutting down...", false)
);

(async () => {
  try {
    await initialize();
  } catch (err: any) {
    shutdown("failed to initialize: " + err, true);
  }
})();

async function shutdown(message: string, error: boolean) {
  for (const closer of closers) {
    closer();
  }

  console.error(message);
  process.exit(error ? 1 : 0);
}

async function initialize() {
  const db = new Database("./null.dat");
  closers.push(() => db.close());

  const migrations = loadMigrations();
  migrations.sort((a, b) => a.version - b.version);
  for (const migration of migrations) {
    if (migration.version > db.getVersion()) {
      db.applyMigration(migration);
    }
  }

  const app = fastify();
  closers.push(() => app.close());
  registerRoutes(app, db);

  app.listen(8080, (err, address) => {
    if (err != null) {
      shutdown(err.message, true);
    }

    console.log(`server listening at ${address}`);
  });
}
