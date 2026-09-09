"use client";

import React, { type ReactNode } from "react";

interface AppShellProps {
  children?: ReactNode;
  isInApp?: boolean;
  isSindicatoAuthenticated?: boolean;
  onLogout?: () => void;
}

export function AppShell({
  children,
  isInApp = false,
  isSindicatoAuthenticated = false,
  onLogout,
}: AppShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex h-screen w-screen flex-col bg-dragon-bg">
      {/* Top Bar: Telemetría Técnica y Acceso Limpio */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-dragon-border px-6 bg-dragon-bg select-none">
        {/* Identificador de Nodo */}
        <div className="flex items-center gap-3 font-mono text-xs tracking-wider">
          <span className="h-2 w-2 bg-dragon-crimson" />
          <span className="font-display text-base font-bold tracking-widest text-zinc-100 uppercase">
            FuriaX
          </span>
        </div>

        {/* Top Bar Derecha: Únicamente indicador sutil y botón de CERRAR SESIÓN */}
        {isInApp && (
          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Indicador Único de Nivel de Acceso */}
            <div
              className={`px-2.5 py-1 border tracking-wider uppercase font-semibold ${
                isSindicatoAuthenticated
                  ? "border-dragon-ember/50 text-dragon-ember bg-dragon-ember/10"
                  : "border-zinc-800 text-zinc-400 bg-zinc-900/50"
              }`}
            >
              <span>ACCESO: {isSindicatoAuthenticated ? "SINDICATO" : "MIEMBRO"}</span>
            </div>

            {/* Único botón de Cerrar Sesión */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1 border border-zinc-700 text-zinc-400 hover:text-white hover:border-dragon-crimson hover:bg-dragon-crimsonDark transition-colors uppercase tracking-wider"
                title="Cerrar sesión y volver a la pantalla de acceso"
              >
                [ CERRAR SESIÓN ]
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Workspace: Altura Completa Sin Scroll de Página */}
      <main className="relative flex-1 overflow-hidden">{children}</main>

      {/* Footer Moderno */}
      <footer className="flex h-8 w-full shrink-0 items-center justify-center border-t border-dragon-border px-6 font-mono text-[11px] text-zinc-500 bg-dragon-bg select-none">
        <p className="flex items-center gap-1.5">
          <span>&copy; {currentYear}</span>
          <span className="font-hacker text-dragon-crimson text-sm tracking-widest">HAZARD</span>
          <span>Carlos Samper. Todos los derechos reservados.</span>
        </p>
      </footer>
    </div>
  );
}
