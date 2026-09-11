import crypto from "crypto";

const SINDICATO_PASSWORD = process.env.SINDICATO_PASSWORD || "DragonesFuriososX0";
const SESSION_SECRET = process.env.SESSION_SECRET || "furia_dragones_super_secret_session_key_2026";
export const SESSION_COOKIE_NAME = "furia_sindicato_session";

// Duración de la sesión: 7 días
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function validatePassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  // Comparación segura en longitud y contenido
  const target = SINDICATO_PASSWORD;
  if (input.length !== target.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(target));
}

export function createSessionToken(): string {
  const payload = {
    role: "sindicato",
    exp: Date.now() + SESSION_MAX_AGE_MS,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");

  if (signature.length !== expectedSig.length) return false;
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
  if (!isMatch) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.role !== "sindicato") return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
