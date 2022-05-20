import { Database } from "./db";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import util from "util";

const expiryTokenLifetime = 30 * 24 * 60 * 60;
const signingSecret = crypto.randomBytes(16);

const jwtSign: (
  claims: Claims,
  secret: Buffer,
  options: jsonwebtoken.SignOptions
) => Promise<string> = util.promisify(jsonwebtoken.sign as any);

const jwtVerify: (
  jwt: string,
  secret: Buffer,
  options: jsonwebtoken.VerifyOptions & { complete?: false }
) => Promise<Claims> = util.promisify(jsonwebtoken.verify as any);

const signOptions: jsonwebtoken.SignOptions = {
  algorithm: "HS256",
  expiresIn: "1h",
};

const verifyOptions: jsonwebtoken.VerifyOptions & { complete?: false } = {
  algorithms: ["HS256"],
  clockTolerance: 10,
};

export type Claims = {
  accountId: number;
};

function generateRefreshToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function issueKeys(
  db: Database,
  claims: Claims
): Promise<[string, string]> {
  const jwt = await jwtSign(claims, signingSecret, signOptions);
  const refreshToken = generateRefreshToken();
  db.run(
    "INSERT INTO refresh_tokens (token, account_id, expiry) VALUES (?, ?, (SELECT strftime('%s', 'now', '+? seconds'))",
    refreshToken,
    claims.accountId,
    expiryTokenLifetime
  );
  return [jwt, refreshToken];
}

export async function cycleKeys(
  db: Database,
  claims: Claims,
  refreshToken: string
): Promise<[string, string]> {
  const newToken = generateRefreshToken();
  const result = db.run(
    "UPDATE refresh_tokens SET token = ?, expiry = (SELECT strftime('%s', 'now', '+? seconds')) WHERE token = ? AND expiry > (SELECT strftime('%s', 'now'))",
    newToken,
    expiryTokenLifetime,
    refreshToken
  );

  if (result.changes != 1) {
    throw new Error("invalid refresh token");
  }

  const jwt = await jwtSign(claims, signingSecret, signOptions);
  return [jwt, newToken];
}

export async function verifyKey(jwt: string): Promise<Claims> {
  return jwtVerify(jwt, signingSecret, verifyOptions);
}
