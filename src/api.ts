import { FastifyInstance } from "fastify";
import { Database } from "./db";

export function registerRoutes(app: FastifyInstance, db: Database) {
  app.get("/ping", async (_, reply) => {
    reply.send("pong");
  });

  app.post("/api/paste/new", async (request, reply) => {
    const payload = request.body as any;
    const info = db.run(
      "INSERT INTO pastes (title, content) VALUES (?, ?)",
      payload.title,
      payload.content
    );

    reply.send({ id: info.lastInsertRowid });
  });

  app.get("/api/paste/raw/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const row = db.get("SELECT title, content FROM pastes WHERE id = ?", id);

    if (row == undefined) {
      reply.code(404).send("paste not found");
    } else {
      reply.send(row);
    }
  });
}
