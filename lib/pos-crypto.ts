// POS Token Encryption — AES-256-GCM
// Sprint 86 — The Connector
// Tokens encrypted at rest, decrypted only at moment of POS API call.
// Uses POS_TOKEN_ENCRYPTION_KEY env var (64-char hex = 32 bytes).

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM standard
const TAG_LENGTH = 16; // GCM standard

function getEncryptionKey(): Buffer {
  const key = process.env.POS_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("POS_TOKEN_ENCRYPTION_KEY is not configured. Cannot encrypt/decrypt POS tokens.");
  }
  if (key.length !== 64) {
    throw new Error("POS_TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes).");
  }
  return Buffer.from(key, "hex");
}

/**
 * Check if POS encryption is configured.
 */
export function isPosEncryptionConfigured(): boolean {
  const key = process.env.POS_TOKEN_ENCRYPTION_KEY;
  return !!key && key.length === 64;
}

/**
 * Encrypt a plaintext token for storage.
 * Returns base64-encoded string: IV (12 bytes) + ciphertext + auth tag (16 bytes).
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // iv + encrypted + tag → single base64 string
  const combined = Buffer.concat([iv, encrypted, tag]);
  return combined.toString("base64");
}

/**
 * Decrypt a stored token back to plaintext.
 * Input: base64-encoded string from encryptToken().
 */
export function decryptToken(encrypted: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encrypted, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(combined.length - TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
