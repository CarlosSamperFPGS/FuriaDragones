import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId =
      searchParams.get("guildId") && searchParams.get("guildId") !== "TU_GUILD_ID"
        ? searchParams.get("guildId")
        : "UUdmeQLuQ8upNFtQBl0YPQ";

    const albionUrl = `https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}/members`;
    const response = await fetch(albionUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

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
