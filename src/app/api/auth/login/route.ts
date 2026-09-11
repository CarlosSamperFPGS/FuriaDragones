import { NextResponse } from "next/server";
import {
  validatePassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = body.password;

    const isValid = validatePassword(password);
    if (!isValid) {
      // Retraso defensivo anti brute-force
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json(
        { success: false, error: "Credenciales de acceso no válidas" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      role: "sindicato",
    });

    // Cookie segura: HttpOnly (inaccesible por scripts cliente), SameSite Strict
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Error en el servidor de autenticación" },
      { status: 500 }
    );
  }
}
