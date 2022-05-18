import { FastifyInstance } from "fastify";
import { Database } from "./db";
import fs from "fs";

export function registerRoutes(app: FastifyInstance, db: Database) {
  app.get("/ping", async (_, reply) => {
    reply.send("pong");
  });

  app.get("/healthz", async (_, reply) => {
    const isDBHealthy = db.isHealthy();
    const statusCode = isDBHealthy ? 200 : 500;
    const packageMetadataString = fs.readFileSync("./package.json", "utf8");
    const packageMetadata = JSON.parse(packageMetadataString);

    const healthData = {
      status: isDBHealthy ? "ok" : "error",
      version: packageMetadata.version,
      serviceId: packageMetadata.name,
      description: packageMetadata.description,
      notes: isDBHealthy
        ? "application status nominal"
        : "application status degraded: database is not healthy",
      timestamp: Math.floor(new Date().getTime() / 1000),
      uptime: Math.floor(process.uptime()),
    };

    reply.type("application/health+json").code(statusCode).send(healthData);
  });

  app.post("/api/paste/new", async (request, reply) => {
    const payload = request.body as any;
    const info = db.run(
      "INSERT INTO pastes (created, expiry, title, author, lang, content) VALUES ((SELECT strftime('%s', 'now')), ?, ?, ?, ?, ?)",
      payload.expiry,
      payload.title,
      payload.author,
      payload.lang,
      payload.content
    );

    reply.send({ id: info.lastInsertRowid });
  });

  app.get("/api/paste/get/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const row = db.get(
      "SELECT created, expiry, title, author, lang, content FROM pastes WHERE id = ? AND expiry > (SELECT strftime('%s', 'now'))",
      id
    );

    if (row == undefined) {
      reply.code(404).send("paste not found");
    } else {
      reply.send(row);
    }
  });

  app.get("/api/paste/raw/:id", async (request, reply) => {
    const id = (request.params as any).id as string;
    const row = db.get(
      "SELECT content FROM pastes WHERE id = ? AND expiry > (SELECT strftime('%s', 'now'))",
      id
    );

    if (row == undefined) {
      reply.code(404).send("paste not found");
    } else {
      reply.send(row.content);
    }
  });
}
