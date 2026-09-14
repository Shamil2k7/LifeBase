import crypto from "crypto";

// AES-256-GCM encryption for password vault entries at rest.
// Key is derived (scrypt) from VAULT_ENCRYPTION_KEY so any length/format env value works.
const ALGO = "aes-256-gcm";

function getKey() {
  const secret = process.env.VAULT_ENCRYPTION_KEY || "dev-only-insecure-key-change-me";
  return crypto.scryptSync(secret, "life-manager-vault-salt", 32);
}

export function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(payload) {
  if (!payload) return "";
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
