import crypto from "crypto";

const COOKIE_NAME = "vault_token";
const TTL_MS = 15 * 60 * 1000; // vault auto-locks after 15 minutes of inactivity

function secret() {
  return process.env.NEXTAUTH_SECRET || "dev-only-secret";
}

export function signVaultToken(userId) {
  const expires = Date.now() + TTL_MS;
  const payload = `${userId}.${expires}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyVaultToken(token, userId) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokUserId, expiresStr, sig] = parts;
  if (tokUserId !== userId) return false;
  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return false;
  const expected = crypto.createHmac("sha256", secret()).update(`${tokUserId}.${expiresStr}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export const VAULT_COOKIE_NAME = COOKIE_NAME;
export const VAULT_TTL_SECONDS = TTL_MS / 1000;
