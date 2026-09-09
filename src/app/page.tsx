"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GatewayView } from "@/components/views/GatewayView";
import { GremioView } from "@/components/views/GremioView";

export default function Home() {
  const [currentView, setCurrentView] = useState<"gateway" | "gremio" | "sindicato">("gateway");
  const [isSindicatoAuth, setIsSindicatoAuth] = useState(false);

  const handleOpenSindicato = () => {
    const pass = prompt("SINDICATO_KEY:");
    if (pass === "furiadragones2026") {
      setIsSindicatoAuth(true);
      setCurrentView("sindicato");
    }
  };

  return (
    <AppShell
      onOpenSindicatoLogin={handleOpenSindicato}
      isSindicatoAuthenticated={isSindicatoAuth}
    >
      {currentView === "gateway" && (
        <GatewayView onSelectGremio={() => setCurrentView("gremio")} />
      )}

      {currentView === "gremio" && (
        <GremioView onBack={() => setCurrentView("gateway")} />
      )}

      {currentView === "sindicato" && (
        <div className="flex h-full flex-col items-center justify-center font-mono text-zinc-500 gap-4">
          <div className="text-dragon-ember font-bold text-lg">[ VISTA_SINDICATO: DASHBOARD TÁCTICO ]</div>
          <button
            onClick={() => setCurrentView("gateway")}
            className="border border-dragon-border px-4 py-1.5 text-xs text-zinc-400 hover:border-dragon-crimson hover:text-white"
          >
            ← VOLVER AL GATEWAY
          </button>
        </div>
      )}
    </AppShell>
  );
}
