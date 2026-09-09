"use client";

import React, { type ReactNode } from "react";
import { Shield, Lock } from "lucide-react";

interface AppShellProps {
  children?: ReactNode;
  onOpenSindicatoLogin: () => void;
  isSindicatoAuthenticated?: boolean;
}

export function AppShell({
  children,
  onOpenSindicatoLogin,
  isSindicatoAuthenticated = false,
}: AppShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-screen w-screen flex-col bg-dragon-bg">
      {/* Top Bar: Telemetría Técnica y Acceso Sindicato */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-dragon-border px-6 bg-dragon-bg">
        {/* Identificador de Nodo */}
        <div className="flex items-center gap-3 font-mono text-xs tracking-wider">
          <span className="h-2 w-2 bg-dragon-crimson" />
          <span className="font-display text-base font-bold tracking-widest text-zinc-100 uppercase">
            FuriaX
          </span>
        </div>

        {/* Acceso Indicator */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
          <span className="text-zinc-500">ACCESO:</span>
          <span
            className={
              isSindicatoAuthenticated
                ? "text-dragon-ember font-semibold tracking-wider"
                : "text-zinc-400 font-semibold tracking-wider"
            }
          >
            {isSindicatoAuthenticated ? "SINDICATO" : "MIEMBRO"}
          </span>
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

      {/* Footer Moderno con Fuente Hacker */}
      <footer className="flex h-8 w-full shrink-0 items-center justify-center border-t border-dragon-border px-6 font-mono text-[11px] text-zinc-500 bg-dragon-bg">
        <p className="flex items-center gap-1.5">
          <span>&copy; {currentYear}</span>
          <span className="font-hacker text-dragon-crimson text-sm tracking-widest">HAZARD</span>
          <span>Carlos Samper. Todos los derechos reservados.</span>
        </p>
      </footer>
    </div>
  );
}
