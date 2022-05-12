import fastify from "fastify";
import openSqlite3 from "better-sqlite3"

const server = fastify();
const db = openSqlite3("./null.dat", { timeout: 1000 });

process.on('SIGINT', () => shutdown("Received SIGINT. Shutting down...", false));

(async () => {
  try {
    await initialize()
  } catch (err: any) {
    shutdown("Failed to initialize: " + err, true)
  }
})()

async function shutdown(message: string, error: boolean) {
  db.close()
  await server.close()
  console.error(message)
  process.exit(error ? 1 : 0)
}

async function initialize() {
  db.pragma("analysis_limit")
  db.pragma("automatic_index = false")
  db.pragma("cache_size = -8192")
  db.pragma("journal_mode = wal")
  db.pragma("synchronous = normal")
  
  server.get("/", async (_, reply) => {
    reply.send("Hello World!");
  });
  
  server.post("/api/paste/new", async (request, reply) => {
    throw new Error("not implemented")
  })
  
  const getPaste = db.prepare("SELECT title, content FROM pastes WHERE id = ?");
  
  server.get("/api/paste/raw/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const row = getPaste.get(id);
  
    if (row == undefined) {
      reply.code(404).send("Paste not found");
    } else {
      reply.send(row);
    }
  })

  server.listen(8080, (err, address) => {
    if (err) {
      shutdown(err.message, true)
    }
  
    console.log(`Server listening at ${address}`);
  });
}
