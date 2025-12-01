import crypto from "crypto";
import { getEnv } from "./env";
/**
 * Load and validate the master encryption key from env.
 *
 * Expected: process.env.ENCRYPTION_MASTER_KEY contains a base64-encoded 32-byte key.
 * (AES-256 requires a 32-byte key.)
 *
 * This module intentionally keeps behavior simple:
 * - throws on missing / invalid key (so your app fails fast)
 * - returns a Buffer (binary) that can be used directly by crypto APIs
 *
 * Do NOT log the returned Buffer or its contents.
 */

const KEY_ENV = "ENCRYPTION_MASTER_KEY";
const EXPECTED_KEY_BYTES = 32; // AES-256 -> 32 bytes

function getMasterKey(): Buffer {
  const raw = getEnv(KEY_ENV);
  if (!raw) {
    throw new Error(
      `${KEY_ENV} not set. Generate a 32-byte base64 key and set it in your environment.`
    );
  }

  // Validate base64 decode
  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch (error) {
    throw new Error(`${KEY_ENV} is not valid base64`);
  }

  if (key.length !== EXPECTED_KEY_BYTES) {
    throw new Error(
      `${KEY_ENV} must decode to ${EXPECTED_KEY_BYTES} bytes (base64-encoded). ` +
        `Current decoded length: ${key.length} bytes.`
    );
  }

  return key;
};


const MASTER_KEY = getMasterKey();

// encryption
export function encrypt(plaintext: string, keyId = "v1"): string {
  
  // 1. Generate a random IV (12 bytes for AES-GCM)
  const iv = crypto.randomBytes(12);

  // 2. Create AES-256-GCM cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);

  // 3. Encrypt plaintext
  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // 4. Authentication tag
  const tag = cipher.getAuthTag();

  // 5. Build envelope object
  const envelope = {
    v: 1, // version
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: encrypted.toString("base64"),
    keyId
  };

  // 6. Convert to base64(JSON)
  const json = JSON.stringify(envelope);
  return Buffer.from(json, "utf8").toString("base64");
};


// decryption
export function decrypt(encryptedBase64: string): string {
  // 1. Decode base64 to JSON string
  let jsonString: string;
  try {
    jsonString = Buffer.from(encryptedBase64, "base64").toString("utf8");
  } catch (err) {
    throw new Error("Invalid encrypted string: not base64");
  }

  // 2. Parse JSON
  let envelope: {
    v: number;
    iv: string;
    tag: string;
    ct: string;
    keyId?: string;
  };
  try {
    envelope = JSON.parse(jsonString);
  } catch (err) {
    throw new Error("Invalid encrypted string: not valid JSON");
  }

  // 3. Extract components
  const iv = Buffer.from(envelope.iv, "base64");
  const tag = Buffer.from(envelope.tag, "base64");
  const ct = Buffer.from(envelope.ct, "base64");

  // 4. Create decipher
  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);

  // 5. Decrypt
  let decrypted: Buffer;
  try {
    decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
  } catch (err) {
    throw new Error("Decryption failed: authentication tag mismatch or corrupted data");
  }

  return decrypted.toString("utf8");
};