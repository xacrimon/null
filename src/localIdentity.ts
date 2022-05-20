import { Database } from "./db";
import util from "util";
import bcrypt from "bcrypt";

const bcryptHash = util.promisify(bcrypt.hash);
const bcryptCompare = util.promisify(bcrypt.compare);
const verifyIdentityMessage = "failed to verify identity";
const providerName = "local";

export async function createLocalIdentity(
  db: Database,
  accountId: number,
  password: string
) {
  const hash = await bcryptHash(password, 10);
  db.run(
    `INSERT INTO identities (account_id, provider, pw_hash) VALUES (?, ?, ?)`,
    accountId,
    providerName,
    hash
  );
}

export async function verifyLocalIdentity(
  db: Database,
  username: string,
  password: string
) {
  const row = db.get(
    "SELECT pw_hash FROM identities WHERE account_id = (SELECT id FROM accounts WHERE username = ?) AND provider = ?",
    username,
    providerName
  );
  if (row == undefined) {
    throw new Error(verifyIdentityMessage);
  }

  const matches = await bcryptCompare(row.pw_hash, password);
  if (!matches) {
    throw new Error(verifyIdentityMessage);
  }
}
