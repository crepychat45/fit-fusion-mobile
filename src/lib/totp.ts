// Lightweight TOTP (RFC 6238) using WebCrypto HMAC-SHA1
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomBase32Secret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let bits = "";
  bytes.forEach((b) => (bits += b.toString(2).padStart(8, "0")));
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(secret: string): Uint8Array {
  const clean = secret.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = "";
  for (const ch of clean) {
    const v = B32_ALPHABET.indexOf(ch);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

export async function generateTOTP(secret: string, timeStep = 30, digits = 6, at = Date.now()): Promise<string> {
  const counter = Math.floor(at / 1000 / timeStep);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  view.setUint32(4, counter & 0xffffffff);
  const keyBytes = base32Decode(secret);
  const keyBuf = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const bin =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, "0");
}

export async function verifyTOTP(secret: string, code: string, window = 1): Promise<boolean> {
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    const c = await generateTOTP(secret, 30, 6, now + w * 30_000);
    if (c === code.trim()) return true;
  }
  return false;
}

export function buildOtpAuthUrl(label: string, issuer: string, secret: string): string {
  const l = encodeURIComponent(`${issuer}:${label}`);
  const q = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${l}?${q.toString()}`;
}
