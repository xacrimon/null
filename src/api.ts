import { FastifyInstance } from "fastify";
import { Database } from "./db";
import fs from "fs";
import { cycleKeys, issueKeys } from "./session";
import { createLocalIdentity, verifyLocalIdentity } from "./localIdentity";

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

  app.post("/api/account/create", async (request, reply) => {
    throw new Error("not implemented")
  })

  app.post("/api/auth/login", async (request, reply) => {
    let payload = request.body as any;
    const row = db.get(
      "SELECT id FROM accounts WHERE username = ?",
      payload.username
    );
    verifyLocalIdentity(db, row.id, payload.password);
    const claims = { accountId: row.id };
    const [jwt, refreshToken] = await issueKeys(db, claims);
  });

  app.post("/api/auth/cycleKeys", async (request, reply) => {
    const refreshToken = (request.params as any).refreshToken;
    const row = db.get(
      "SELECT account_id FROM refresh_tokens WHERE token = ?",
      refreshToken
    );
    if (row == undefined) {
      throw new Error("invalid refresh token");
    }

    const claims = { accountId: row.account_id };
    const [jwt, newToken] = await cycleKeys(db, claims, refreshToken);
    reply.send({ jwt, refreshToken: newToken });
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
