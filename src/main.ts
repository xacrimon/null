import fastify from "fastify";
import { Database, loadMigrations } from "./db";

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

  for (const migration of loadMigrations()) {
    db.applyMigration(migration);
  }

  const server = fastify();
  closers.push(() => server.close());

  server.get("/ping", async (_, reply) => {
    reply.send("pong");
  });

  server.post("/api/paste/new", async (request, reply) => {
    throw new Error("not implemented");
  });

  server.get("/api/paste/raw/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const row = db.get("SELECT title, content FROM pastes WHERE id = ?", id);

    if (row == undefined) {
      reply.code(404).send("paste not found");
    } else {
      reply.send(row);
    }
  });

  server.listen(8080, (err, address) => {
    if (err != null) {
      shutdown(err.message, true);
    }

    console.log(`server listening at ${address}`);
  });
}
