import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server-auth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const isAuthenticated = verifySessionToken(sessionCookie);

    return NextResponse.json({
      authenticated: isAuthenticated,
      role: isAuthenticated ? "sindicato" : "miembro",
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      role: "miembro",
    });
  }
}
