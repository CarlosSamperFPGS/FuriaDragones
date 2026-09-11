import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server-auth";

// Guild ID fijado en servidor: Furia de Dragones en Servidor Europa
const FURIA_GUILD_ID = process.env.ALBION_GUILD_ID || "UUdmeQLuQ8upNFtQBl0YPQ";

// Rate limiting defensivo simple en memoria (mínimo 6 segundos entre syncs)
let lastSyncTimestamp = 0;
const MIN_SYNC_INTERVAL_MS = 6000;

export async function GET() {
  try {
    // 1. Verificación de Seguridad: Requiere sesión válida de Sindicato
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const isAuthorized = verifySessionToken(sessionCookie);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Acceso denegado. Se requieren credenciales activas del Sindicato.",
        },
        { status: 401 }
      );
    }

    // 2. Control de frecuencia (Rate Limiting)
    const now = Date.now();
    if (now - lastSyncTimestamp < MIN_SYNC_INTERVAL_MS) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: "Por favor, espera unos segundos antes de volver a sincronizar.",
        },
        { status: 429 }
      );
    }
    lastSyncTimestamp = now;

    // 3. Endpoint fijado estrictamente a Furia de Dragones en Europa (sin aceptar IDs externos)
    const albionUrl = `https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/${FURIA_GUILD_ID}/members`;
    const response = await fetch(albionUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 30 },
    } as any);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "ALBION_API_ERROR",
          status: response.status,
          message: `La API pública de Albion respondió con código ${response.status}`,
        },
        { status: response.status }
      );
    }

    const members = await response.json();
    return NextResponse.json(members);
  } catch (error: any) {
    console.error("[AlbionSyncAPI] Error fetching guild members:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message:
          error?.message ||
          "Error de conexión al consultar el endpoint de hermandades de Albion Online",
      },
      { status: 500 }
    );
  }
}
