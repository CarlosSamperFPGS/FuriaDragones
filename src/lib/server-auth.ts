import crypto from "crypto";

function requireServerEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Auth] Variable de entorno de servidor requerida no definida: ${key}. ` +
      `Asegúrate de configurarla en .env.local o en las variables de entorno de Vercel.`
    );
  }
  return value;
}

export const SESSION_COOKIE_NAME = "furia_sindicato_session";

// Duración de la sesión: 7 días
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function validatePassword(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const target = requireServerEnv("SINDICATO_PASSWORD");
  const inputBuf = Buffer.from(input);
  const targetBuf = Buffer.from(target);
  if (inputBuf.byteLength !== targetBuf.byteLength) return false;
  return crypto.timingSafeEqual(inputBuf, targetBuf);
}

export function createSessionToken(): string {
  const secret = requireServerEnv("SESSION_SECRET");
  const payload = {
    role: "sindicato",
    exp: Date.now() + SESSION_MAX_AGE_MS,
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const data = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  try {
    const secret = requireServerEnv("SESSION_SECRET");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.byteLength !== expBuf.byteLength) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.role !== "sindicato") return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
