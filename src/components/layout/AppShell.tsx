"use client";

import React from "react";
import { Shield, Lock, Terminal, Activity } from "lucide-react";

interface AppShellProps {
  children?: React.ReactNode;
  onOpenSindicatoLogin: () => void;
  isSindicatoAuthenticated?: boolean;
}

export function AppShell({
  children,
  onOpenSindicatoLogin,
  isSindicatoAuthenticated = false,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-screen flex-col bg-dragon-bg">
      {/* Top Bar: Telemetría Técnica y Acceso Sindicato */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-dragon-border px-6 bg-dragon-bg">
        {/* Identificador de Nodo */}
        <div className="flex items-center gap-3 font-mono text-xs tracking-wider">
          <span className="h-2 w-2 bg-dragon-crimson" />
          <span className="font-display text-sm font-bold tracking-widest text-zinc-100 uppercase">
            FURIA // OS
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">ALBION SERVER [EU]</span>
        </div>

        {/* Telemetría Central Silenciosa */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-zinc-400" />
            <span>NET: 24MS</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span>SEC_LEVEL:</span>
            <span className={isSindicatoAuthenticated ? "text-dragon-ember font-semibold" : "text-zinc-400"}>
              {isSindicatoAuthenticated ? "OFFICER // ROOT" : "GUEST // READ_ONLY"}
            </span>
          </div>
        </div>

        {/* Botón Sindicato (Sin tarjetas, borde fino mate) */}
        <div className="flex items-center">
          <button
            onClick={onOpenSindicatoLogin}
            className="group flex items-center gap-2 border border-dragon-border px-3 py-1.5 font-mono text-[11px] tracking-wider text-zinc-400 transition-colors duration-150 hover:border-dragon-crimson hover:bg-dragon-panel hover:text-zinc-100"
          >
            {isSindicatoAuthenticated ? (
              <>
                <Shield className="h-3 w-3 text-dragon-crimson" />
                <span>SINDICATO_ACTIVE</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-zinc-500 transition-colors duration-150 group-hover:text-dragon-crimson" />
                <span>ACCESO_SINDICATO</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace: Altura Completa Sin Scroll de Página */}
      <main className="relative flex-1 overflow-hidden">{children}</main>

      {/* Bottom Status Ticker */}
      <footer className="flex h-7 w-full shrink-0 items-center justify-between border-t border-dragon-border px-6 font-mono text-[10px] text-zinc-600 bg-dragon-bg">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-zinc-600" />
          <span>PORTAL_STATUS: READY</span>
        </div>
        <div className="tracking-widest uppercase">
          GUILD_CODE: [FD] • SEASON: ACTIVE
        </div>
      </footer>
    </div>
  );
}
