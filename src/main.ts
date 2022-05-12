import fastify from "fastify";
import openSqlite3 from "better-sqlite3"

const server = fastify();
const db = openSqlite3("./null.dat");

db.pragma("analysis_limit = 1000")
db.pragma("automatic_index = false")
db.pragma("busy_timeout = 1000")
db.pragma("cache_size = -8192")
db.pragma("journal_mode = wal")
db.pragma("synchronous = normal")

server.get("/", async () => {
  return "Hello World!";
});

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
